import io
import re
import uuid
import logging
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timezone
import urllib.parse

import pandas as pd
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, or_

from app.models.academic import Department, Course, Room, ClassSection, SectionSubjectFaculty, TimetableSlot
from app.models.user import User, Faculty, RoleEnum
from app.models.sheet_sync import SheetConfig
from app.services.audit_service import log_audit_event
from app.services.sheet_sync import validate_and_normalize_sheet_url, fetch_sheet_csv
from app.core.security import get_password_hash

logger = logging.getLogger("timetable_sync")

TIMETABLE_COLUMNS = [
    {"header": "Day", "key": "day", "required": True, "example": "Mon"},
    {"header": "Start Time", "key": "start_time", "required": True, "example": "09:00"},
    {"header": "End Time", "key": "end_time", "required": True, "example": "10:00"},
    {"header": "Course Code", "key": "course_code", "required": True, "example": "CS301"},
    {"header": "Course Name", "key": "course_name", "required": False, "example": "Machine Learning"},
    {"header": "Department", "key": "department", "required": True, "example": "CSE"},
    {"header": "Year", "key": "year", "required": True, "example": "3"},
    {"header": "Section", "key": "section", "required": True, "example": "A"},
    {"header": "Faculty", "key": "faculty_identifier", "required": True, "example": "FAC-CSE-001"},
    {"header": "Room", "key": "room_name", "required": True, "example": "LH-204"},
    {"header": "Color", "key": "color", "required": False, "example": "indigo"},
]

COLOR_PALETTE = [
    "indigo", "emerald", "amber", "rose", "sky", "violet", "teal", "cyan", "fuchsia", "orange"
]

VALID_DAYS = {
    "mon": "Mon", "monday": "Mon",
    "tue": "Tue", "tues": "Tue", "tuesday": "Tue",
    "wed": "Wed", "wednesday": "Wed",
    "thu": "Thu", "thur": "Thu", "thurs": "Thu", "thursday": "Thu",
    "fri": "Fri", "friday": "Fri",
    "sat": "Sat", "saturday": "Sat",
}

# Canonical department definitions, codes, and aliases
KNOWN_DEPARTMENT_ALIASES: Dict[str, Dict[str, Any]] = {
    "CSE": {
        "code": "CSE",
        "name": "Computer Science and Engineering",
        "aliases": ["cse", "cs", "comp sci", "computer science", "computer science and engineering", "22cs", "be cse", "b.e cse", "b.e. cse"]
    },
    "AD": {
        "code": "AIDS",
        "name": "Artificial Intelligence and Data Science",
        "aliases": ["ad", "aids", "ai&ds", "ai & ds", "ai-ds", "ai/ds", "artificial intelligence", "artificial intelligence and data science", "artificial intelligence & data science", "22ad", "ai", "aiml"]
    },
    "IT": {
        "code": "IT",
        "name": "Information Technology",
        "aliases": ["it", "information technology", "infotech", "22it", "b.tech it", "b.tech. it"]
    },
    "ECE": {
        "code": "ECE",
        "name": "Electronics and Communication Engineering",
        "aliases": ["ece", "ec", "electronics", "electronics and communication engineering", "electronics & communication engineering", "22ec"]
    },
    "EEE": {
        "code": "EEE",
        "name": "Electrical and Electronics Engineering",
        "aliases": ["eee", "ee", "electrical", "electrical and electronics engineering", "electrical & electronics engineering", "22ee"]
    },
    "MECH": {
        "code": "MECH",
        "name": "Mechanical Engineering",
        "aliases": ["mech", "me", "mechanical", "mechanical engineering", "22me"]
    },
    "CIVIL": {
        "code": "CIVIL",
        "name": "Civil Engineering",
        "aliases": ["civil", "ce", "civil engineering", "22ce"]
    },
    "HUMANITIES": {
        "code": "HUM",
        "name": "Science & Humanities",
        "aliases": ["humanities", "hs", "s&h", "science and humanities", "science & humanities", "22hs", "english", "maths", "mathematics", "physics", "chemistry"]
    }
}


def resolve_canonical_department(dept_raw: Optional[str], db_depts: Optional[List[Department]] = None) -> Tuple[str, str]:
    """
    Resolves raw department strings, aliases, or sheet names (e.g. 'CSE', 'ad', 'AI&DS')
    into (canonical_name, canonical_code).
    """
    if not dept_raw:
        return ("Information Technology", "IT")

    clean = str(dept_raw).strip().lower()

    # 1. Match against known department aliases
    for key, info in KNOWN_DEPARTMENT_ALIASES.items():
        if clean == key.lower() or clean == info["code"].lower() or clean == info["name"].lower():
            return (info["name"], info["code"])
        for alias in info["aliases"]:
            if clean == alias or clean == alias.replace(" ", ""):
                return (info["name"], info["code"])
            if clean.startswith(f"{alias} ") or clean.endswith(f" {alias}") or f" {alias} " in f" {clean} " or clean.startswith(f"{alias}-") or clean.startswith(f"{alias}_"):
                return (info["name"], info["code"])

    # 2. Match against DB departments if provided
    if db_depts:
        for d in db_depts:
            if d.code.lower() == clean or d.name.lower() == clean:
                return (d.name, d.code)
            if clean in d.name.lower() or clean in d.code.lower():
                return (d.name, d.code)

    # 3. Fallback
    return (dept_raw.strip().title(), dept_raw.strip().upper()[:8])


def infer_metadata_from_sheet_name(sheet_name: str, db_depts: Optional[List[Department]] = None) -> Dict[str, Any]:
    """
    Extracts department, section, and year hints from sheet names:
    e.g. 'CSE' -> dept: 'Computer Science and Engineering', sec: None, year: None
         'AD' -> dept: 'Artificial Intelligence and Data Science', sec: None, year: None
         'CSE - A' -> dept: 'Computer Science and Engineering', sec: 'A', year: None
         'Year 3 AD' -> dept: 'Artificial Intelligence and Data Science', sec: None, year: 3
    """
    raw = str(sheet_name).strip()
    clean = raw.lower()

    # Detect section if specified in sheet name: e.g. "Sec A", "- A", "_A", "(A)", "CSE A"
    sec = None
    m_sec = re.search(r'(?:sec(?:tion)?[\s\-_]*|[\-_]|\(|\b[A-Za-z]{2,4}[\s\-_]+)([A-Z0-9])(?:\)|$|\s)', raw, re.IGNORECASE)
    if m_sec:
        sec = m_sec.group(1).upper()

    # Detect year if specified in sheet name: e.g. "Year 3", "Yr 3", "3rd Year", "S5", "Sem 5"
    yr = None
    m_yr = re.search(r'(?:year|yr|sem(?:ester)?|\bs)[\s\-_]*([1-8])\b', clean)
    if m_yr:
        sem_val = int(m_yr.group(1))
        matched_tag = m_yr.group(0).lower()
        if sem_val > 4 or "s" in matched_tag or "sem" in matched_tag:
            yr = max(1, min(4, (sem_val + 1) // 2))
        else:
            yr = sem_val
    else:
        m_nth = re.search(r'([1-4])(?:st|nd|rd|th)[\s\-_]*year', clean)
        if m_nth:
            yr = int(m_nth.group(1))

    # Detect if sheet name hints at IT or project
    dept_hint = raw
    if re.search(r'\b(it|information\s*tech|mini\s*project)\b', clean):
        dept_hint = "IT"

    canonical_name, canonical_code = resolve_canonical_department(dept_hint, db_depts)
    return {
        "department": canonical_name,
        "dept_code": canonical_code,
        "section": sec,
        "year": yr or 3,
        "sheet_name": raw,
    }


def _normalize_header(h: str) -> str:
    cleaned = re.sub(r"[\*\(].*?[\)]", "", str(h))
    cleaned = cleaned.replace("*", "").strip().lower()
    cleaned = re.sub(r"[\s\-_]+", "_", cleaned)
    return cleaned


def normalize_day(day_str: str) -> Optional[str]:
    clean = str(day_str).strip().lower()
    return VALID_DAYS.get(clean)


def normalize_time_str(time_val: Any) -> Optional[str]:
    """
    Normalizes arbitrary time formats into 24-hour HH:MM strings (e.g. '09:00', '13:30').
    Handles '9:00', '09:00 AM', '1:00 PM', '13:00', etc.
    """
    if pd.isna(time_val) or time_val is None:
        return None
    s = str(time_val).strip()
    if not s or s.lower() == "nan":
        return None

    # Try standard time formats
    formats = [
        "%H:%M", "%H:%M:%S",
        "%I:%M %p", "%I:%M%p",
        "%I %p", "%I%p",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(s.upper(), fmt)
            return dt.strftime("%H:%M")
        except ValueError:
            pass

    # Regex fallback for '9' or '09'
    m = re.match(r"^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$", s, re.IGNORECASE)
    if m:
        hr = int(m.group(1))
        mn = int(m.group(2) or 0)
        meridiem = (m.group(3) or "").lower()
        if meridiem == "pm" and hr < 12:
            hr += 12
        elif meridiem == "am" and hr == 12:
            hr = 0
        if 0 <= hr <= 23 and 0 <= mn <= 59:
            return f"{hr:02d}:{mn:02d}"

    return None


def parse_grid_time_range(s: Any) -> Tuple[Optional[str], Optional[str]]:
    """
    Parses a time range string such as '8:45 AM - 9:35 AM', '8.45 - 9.35', or '09:00 to 10:00'.
    Handles periods, colons, en-dashes, em-dashes, and 'to'.
    """
    if not s or pd.isna(s):
        return None, None
    raw_str = str(s).strip()
    # Normalize dot-separated times: e.g. '8.45' -> '8:45'
    cleaned_time = re.sub(r'(\d{1,2})\.(\d{2})', r'\1:\2', raw_str)
    m = re.search(r'(\d{1,2}(?::\d{2})?\s*(?:[AP]M)?)\s*(?:[-–—to]+|\s+to\s+)\s*(\d{1,2}(?::\d{2})?\s*(?:[AP]M)?)', cleaned_time, re.IGNORECASE)
    if m:
        t1, t2 = m.group(1).strip(), m.group(2).strip()
        n1 = normalize_time_str(t1)
        n2 = normalize_time_str(t2)
        return n1, n2
    return None, None


def parse_grid_timetable_cell_multi(
    raw: Any,
    default_dept: Optional[str] = None,
    default_sec: Optional[str] = None,
    default_year: Optional[int] = None,
    known_faculty_names: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    """
    Parses a timetable grid cell that may contain multiple sections, e.g.:
    '22IT305 SOFTWARE ENGINEERING Mrs.SANTHIYA B (SEC A) (A-201) Mrs priya J (SEC-B) (A-202)'
    or '22HS004 HUMAN VALUES AND ETHICS Mr.Stephen (SEC B) (A-202 ) Mrs abi (Sec A) (A-201)'
    or cross-batch e.g.: 'S3 IT\n22HS005- SOFTSKILLS AND EFFECTIVE COMMUNICATION Dr:SHOBANA (SEC D) (A-206)'
    Returns a list of structured entry dicts, one for each section identified in the cell.
    """
    if raw is None or pd.isna(raw):
        return []
    text = str(raw).strip()
    if not text or text.lower() in ('nan', '-', 'nil', 'free', 'break', 'lunch'):
        return []

    # 1. Detect cross-batch tag if any (e.g. "S3 IT", "S5 IT")
    batch_tag = None
    batch_match = re.match(r'^(S([1-8])\s+([A-Za-z]+))\s*[\n\r]*', text, re.IGNORECASE)
    if batch_match:
        batch_tag = batch_match.group(1).strip()
        text = text[batch_match.end():].strip()

    batch_dept = default_dept or "Information Technology"
    batch_year = default_year or 3

    # 2. Extract course code and remaining text
    code_match = re.match(r'^([0-9]{2}[A-Z]{2,4}[0-9]{3,4}[A-Z]?|[A-Z]{2,4}[0-9]{3,4}[A-Z]?)[-\s]*(.*)', text, re.DOTALL)
    if not code_match:
        return []

    course_code = code_match.group(1).strip()
    remainder = code_match.group(2).strip()

    # Find all section markers like (SEC A), (Sec A), (SEC-A), (SEC B)
    sec_markers = list(re.finditer(r'\(\s*SEC[\s-]*([A-Za-z0-9]+)\s*\)', remainder, re.IGNORECASE))
    if not sec_markers:
        clean_rem = re.sub(r'\s+', ' ', remainder).strip()
        room = 'A-201'
        m_r = re.search(r'[\(\[]([A-Z0-9\-\s]+)[\)\]]\s*$', clean_rem, re.IGNORECASE)
        if m_r:
            room = m_r.group(1).strip()
            clean_rem = clean_rem[:m_r.start()].strip()
        return [{
            "course_code": course_code,
            "course_name": clean_rem[:50].strip() or course_code,
            "faculty_identifier": "Faculty Member",
            "section": default_sec or "A",
            "room_name": room,
            "department": batch_dept,
            "year": str(batch_year),
            "batch_tag": batch_tag
        }]

    # Extract Course Name: everything before the first faculty or first section
    first_sec_start = sec_markers[0].start()
    prefix_text = remainder[:first_sec_start].strip()

    fac_split = re.search(r'\b(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?)\s*', prefix_text, re.IGNORECASE)
    if fac_split:
        course_name = prefix_text[:fac_split.start()].strip()
        first_fac_name = prefix_text[fac_split.start():].strip()
    else:
        found_fac = False
        if known_faculty_names:
            for kf in sorted(known_faculty_names, key=len, reverse=True):
                m_kf = re.search(rf'\b{re.escape(kf)}\b', prefix_text, re.IGNORECASE)
                if m_kf:
                    course_name = prefix_text[:m_kf.start()].strip()
                    first_fac_name = prefix_text[m_kf.start():].strip()
                    found_fac = True
                    break
        if not found_fac:
            lines = [l.strip() for l in prefix_text.split('\n') if l.strip()]
            if len(lines) > 1:
                course_name = " ".join(lines[:-1]).strip()
                first_fac_name = lines[-1].strip()
            else:
                parts = prefix_text.split()
                if len(parts) > 2:
                    course_name = " ".join(parts[:-2])
                    first_fac_name = " ".join(parts[-2:])
                else:
                    course_name = prefix_text
                    first_fac_name = ""

    course_name = re.sub(r'^[-\s:]+', '', course_name).strip()
    course_name = re.sub(r'\s+', ' ', course_name)

    results = []
    for i, marker in enumerate(sec_markers):
        sec_letter = marker.group(1).upper()
        after_marker = remainder[marker.end():]
        room_match = re.search(r'\(\s*([A-Za-z0-9\-]+)\s*\)', after_marker)
        room = room_match.group(1).strip() if room_match else ("A-201" if sec_letter == "A" else "A-202")

        if i == 0:
            fac_name = first_fac_name
        else:
            prev_text_after = remainder[sec_markers[i-1].end():marker.start()]
            prev_room_in_between = re.search(r'\(\s*([A-Za-z0-9\-]+)\s*\)', prev_text_after)
            if prev_room_in_between:
                fac_name = prev_text_after[prev_room_in_between.end():].strip()
            else:
                fac_name = prev_text_after.strip()

        fac_clean = re.sub(r'[\(\)]', '', fac_name).strip()
        fac_clean = re.sub(r'\s+', ' ', fac_clean)
        fac_clean = re.sub(r'^(Dr|Prof|Mr|Mrs|Ms)[:\s]+', r'\1. ', fac_clean, flags=re.IGNORECASE)

        results.append({
            "course_code": course_code,
            "course_name": course_name or course_code,
            "faculty_identifier": fac_clean or "Faculty Member",
            "section": sec_letter,
            "room_name": room,
            "department": batch_dept,
            "year": str(batch_year),
            "batch_tag": batch_tag
        })

    return results


def parse_grid_timetable_cell(
    raw: Any,
    default_dept: Optional[str] = None,
    default_sec: Optional[str] = None,
    default_year: Optional[int] = None,
    known_faculty_names: Optional[List[str]] = None,
) -> Optional[Dict[str, Any]]:
    """Legacy single-result adapter for parse_grid_timetable_cell_multi."""
    entries = parse_grid_timetable_cell_multi(
        raw,
        default_dept=default_dept,
        default_sec=default_sec,
        default_year=default_year,
        known_faculty_names=known_faculty_names,
    )
    return entries[0] if entries else None


def is_grid_timetable_format(df: pd.DataFrame) -> bool:
    """
    Detects if the DataFrame is in Matrix/Grid Timetable format.
    """
    if df.empty:
        return False
    df_cols_norm = [_normalize_header(c) for c in df.columns]
    tabular_indicators = {"day", "start_time", "course_code"}
    matched = sum(1 for ind in tabular_indicators if ind in df_cols_norm)
    if matched >= 2:
        return False
    return True


def convert_grid_df_to_standard(
    df: pd.DataFrame,
    default_dept: Optional[str] = None,
    default_sec: Optional[str] = None,
    default_year: Optional[int] = None,
    sheet_name: Optional[str] = None,
    known_faculty_names: Optional[List[str]] = None,
) -> pd.DataFrame:
    """
    Converts a matrix/grid timetable DataFrame into the standard tabular DataFrame:
    [Day, Start Time, End Time, Course Code, Course Name, Department, Year, Section, Faculty, Room, Color, Sheet, Batch Tag]
    Supports both Days-as-Rows and Days-as-Columns grid structures and dual-section cell splitting.
    """
    records = []

    # Check if days are arranged as columns: e.g. Columns = [Period/Time, Mon, Tue, Wed, Thu, Fri]
    day_col_map: Dict[int, str] = {}
    for c_idx, col in enumerate(df.columns):
        col_clean = str(col).strip().lower()
        if col_clean in VALID_DAYS:
            day_col_map[c_idx] = VALID_DAYS[col_clean]

    if len(day_col_map) >= 3:
        # Days are columns, rows are periods/timings
        default_periods = [
            ("08:45", "09:35"),
            ("09:35", "10:25"),
            ("10:40", "11:30"),
            ("11:30", "12:20"),
            ("13:30", "15:10"),
            ("15:30", "16:25"),
            ("16:30", "17:20")
        ]
        for r_idx in range(len(df)):
            row = df.iloc[r_idx]
            st, et = None, None
            for c in range(min(2, len(row))):
                st, et = parse_grid_time_range(row.iloc[c])
                if st and et:
                    break
            if not st or not et:
                if r_idx < len(default_periods):
                    st, et = default_periods[r_idx]
                else:
                    continue

            for c_idx, day_name in day_col_map.items():
                cell_val = row.iloc[c_idx]
                parsed_list = parse_grid_timetable_cell_multi(
                    cell_val,
                    default_dept=default_dept,
                    default_sec=default_sec,
                    default_year=default_year,
                    known_faculty_names=known_faculty_names,
                )
                for parsed in parsed_list:
                    if parsed and parsed.get("course_code"):
                        records.append({
                            "Day": day_name,
                            "Start Time": st,
                            "End Time": et,
                            "Course Code": parsed["course_code"],
                            "Course Name": parsed["course_name"],
                            "Department": parsed["department"],
                            "Year": parsed["year"],
                            "Section": parsed["section"],
                            "Faculty": parsed["faculty_identifier"],
                            "Room": parsed["room_name"],
                            "Color": "indigo",
                            "Sheet": sheet_name or "Sheet1",
                            "Batch Tag": parsed.get("batch_tag"),
                        })

        if records:
            return pd.DataFrame(records)

    # Standard Days-as-Rows layout
    timing_col_map: Dict[int, Tuple[str, str]] = {}
    day_row_indices: List[Tuple[int, str, int]] = []

    # 1. Check if column headers contain time ranges
    for c_idx, col in enumerate(df.columns):
        st, et = parse_grid_time_range(col)
        if st and et:
            timing_col_map[c_idx] = (st, et)

    # 2. Check first 4 rows for time ranges if not in headers
    if not timing_col_map:
        for r_idx in range(min(4, len(df))):
            row_vals = df.iloc[r_idx]
            detected = {}
            for c_idx in range(len(row_vals)):
                st, et = parse_grid_time_range(row_vals.iloc[c_idx])
                if st and et:
                    detected[c_idx] = (st, et)
            if len(detected) >= 2:
                timing_col_map = detected
                break

    # 3. Fallback to standard period schedule if no explicit times
    if not timing_col_map:
        default_periods = [
            ("08:45", "09:35"),
            ("09:35", "10:25"),
            ("10:40", "11:30"),
            ("11:30", "12:20"),
            ("13:30", "15:10"),
            ("15:30", "16:25"),
            ("16:30", "17:20")
        ]
        for c_idx in range(1, len(df.columns)):
            p_idx = c_idx - 1
            if p_idx < len(default_periods):
                timing_col_map[c_idx] = default_periods[p_idx]

    # 4. Find day rows
    for r_idx in range(len(df)):
        row_vals = df.iloc[r_idx]
        for c_idx in range(min(3, len(row_vals))):
            val_clean = str(row_vals.iloc[c_idx]).strip().lower()
            if val_clean in VALID_DAYS:
                day_row_indices.append((r_idx, VALID_DAYS[val_clean], c_idx))
                break

    for r_idx, day_name, day_col_idx in day_row_indices:
        for c_idx, (st, et) in timing_col_map.items():
            if c_idx <= day_col_idx or c_idx >= df.shape[1]:
                continue
            cell_val = df.iat[r_idx, c_idx]
            parsed_list = parse_grid_timetable_cell_multi(
                cell_val,
                default_dept=default_dept,
                default_sec=default_sec,
                default_year=default_year,
                known_faculty_names=known_faculty_names,
            )
            for parsed in parsed_list:
                if parsed and parsed.get("course_code"):
                    records.append({
                        "Day": day_name,
                        "Start Time": st,
                        "End Time": et,
                        "Course Code": parsed["course_code"],
                        "Course Name": parsed["course_name"],
                        "Department": parsed["department"],
                        "Year": parsed["year"],
                        "Section": parsed["section"],
                        "Faculty": parsed["faculty_identifier"],
                        "Room": parsed["room_name"],
                        "Color": "indigo",
                        "Sheet": sheet_name or "Sheet1",
                        "Batch Tag": parsed.get("batch_tag"),
                    })

    if not records:
        sheet_label = f" in sheet '{sheet_name}'" if sheet_name else ""
        raise ValueError(
            f"Could not parse timetable slots{sheet_label} from the provided grid layout. "
            "Please ensure Day names (Mon, Tue, ...) and period timings are present."
        )

    return pd.DataFrame(records)


def generate_timetable_csv_template() -> str:
    """Generates official timetable CSV template in grid format matching university schedules."""
    rows = [
        ["Period", "I", "II", "III", "IV", "V", "VI"],
        ["Day / Timings", "8:45 AM - 9:35 AM", "9:35 AM - 10:25 AM", "10:40 AM - 11:30 AM", "11:30AM - 12:20 PM", "1:30 PM - 3:10 PM", "3:30PM - 4:25PM"],
        ["MON", "22IT305 SOFTWARE ENGINEERING Mrs.SANTHIYA B (SEC A) (A-201)", "22HS004 HUMAN VALUES AND ETHICS Mr.Stephen (SEC E) (A-202)", "22IT302 DATA STRUCTURES I Dr.Ramya (SEC C) (A-203)", "22IT301 PROBABILITY STATISTICS AND QUEUING THEORY Mrs. PRIYA (SEC F) (A-204)", "22IT303 COMPUTER ORGANIZATION AND ARCHITECTURE Mrs. VENILA (SEC B) (A-205)", "S3 IT 22HS005- SOFTSKILLS AND EFFECTIVE COMMUNICATION Dr.SHOBANA (SEC D) (A-206)"],
        ["TUE", "22IT301 PROBABILITY STATISTICS AND QUEUING THEORY Mrs.PRIYA (SEC F) (A-204)", "22IT303 COMPUTER ORGANIZATION AND ARCHITECTURE Mrs.VENILA (SEC B) (A-205)", "22IT302 DATA STRUCTURES I Dr.Ramya (SEC C) (A-203)", "S3 IT 22HS005- SOFTSKILLS AND EFFECTIVE COMMUNICATION Dr.SHOBANA (SEC D) (A-206)", "22HS004 HUMAN VALUES AND ETHICS Mr.Stephen (SEC E) (A-202)", "22IT305 SOFTWARE ENGINEERING Mrs.SANTHIYA (SEC A) (A-201)"],
        ["WED", "22HS004 HUMAN VALUES AND ETHICS Mr.Stephen (SEC E) (A-202)", "22IT305 SOFTWARE ENGINEERING Mrs.SANTHIYA (SEC A) (A-201)", "22IT302 DATA STRUCTURES I Dr.Ramya (SEC C) (A-203)", "22IT301 PROBABILITY STATISTICS AND QUEUING THEORY Mrs. PRIYA (SEC F) (A-204)", "S3 IT 22HS005- SOFTSKILLS AND EFFECTIVE COMMUNICATION Dr.SHOBANA (SEC D) (A-206)", "22IT303 COMPUTER ORGANIZATION AND ARCHITECTURE Mrs.VENILA (SEC B) (A-205)"],
        ["THU", "22IT302 DATA STRUCTURES I Dr.Ramya (SEC C) (A-203)", "22IT301 PROBABILITY STATISTICS AND QUEUING THEORY Mrs. PRIYA (SEC F) (A-204)", "22IT305 SOFTWARE ENGINEERING Mrs.SANTHIYA (SEC A) (A-201)", "22HS004 HUMAN VALUES AND ETHICS Mr.Stephen (SEC E) (A-202)", "22IT303 COMPUTER ORGANIZATION AND ARCHITECTURE Mrs.VENILA (SEC B) (A-205)", "S3 IT 22HS005- SOFTSKILLS AND EFFECTIVE COMMUNICATION Dr.SHOBANA (SEC D) (A-206)"],
        ["FRI", "22IT303 COMPUTER ORGANIZATION AND ARCHITECTURE Mrs.VENILA (SEC B) (A-205)", "22IT302 DATA STRUCTURES I Dr.Ramya (SEC C) (A-203)", "22HS004 HUMAN VALUES AND ETHICS Mr.Stephen (SEC E) (A-202)", "S3 IT 22HS005- SOFTSKILLS AND EFFECTIVE COMMUNICATION Dr.SHOBANA (SEC D) (A-206)", "22IT301 PROBABILITY STATISTICS AND QUEUING THEORY Mrs. PRIYA (SEC F) (A-204)", "22IT305 SOFTWARE ENGINEERING Mrs.SANTHIYA (SEC A) (A-201)"],
    ]
    output = io.StringIO()
    df = pd.DataFrame(rows[1:], columns=rows[0])
    df.to_csv(output, index=False)
    return output.getvalue()


async def parse_and_validate_timetable(
    input_data: Any,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Parses timetable data from a DataFrame or Dict of DataFrames (multi-sheet Excel files),
    resolves courses, rooms, class sections, and faculty, runs cross-period collision
    detection (room, faculty, section overlaps across all sheets), and structures preview
    rows with status, conflict warnings, and sheet provenance.
    Supports both Matrix/Grid Timetables and Tabular Timetables across multiple sheets (e.g. CSE, AD).
    """
    # 1. Fetch database reference entities early for sheet metadata and cell parsing
    depts = (await db.execute(select(Department))).scalars().all()
    dept_map = {}
    for d in depts:
        dept_map[d.code.upper().strip()] = d
        dept_map[d.name.lower().strip()] = d

    courses = (await db.execute(select(Course))).scalars().all()
    course_by_code = {c.code.upper().strip(): c for c in courses}
    course_by_name = {c.name.lower().strip(): c for c in courses}

    rooms = (await db.execute(select(Room))).scalars().all()
    room_by_name = {r.name.lower().strip(): r for r in rooms}

    sections = (await db.execute(select(ClassSection))).scalars().all()
    section_map = {}
    for s in sections:
        dept_key = s.department.lower().strip()
        section_map[(dept_key, s.year, s.section.upper().strip())] = s
        c_dept, _ = resolve_canonical_department(s.department, depts)
        section_map[(c_dept.lower().strip(), s.year, s.section.upper().strip())] = s

    fac_user_res = await db.execute(
        select(Faculty, User).join(User, Faculty.user_id == User.id)
    )
    fac_user_list = fac_user_res.all()
    fac_by_empid = {}
    fac_by_email = {}
    fac_by_name = {}
    known_fac_names = []
    for f, u in fac_user_list:
        if f.employee_id:
            fac_by_empid[f.employee_id.upper().strip()] = (f, u)
        if u.email:
            fac_by_email[u.email.lower().strip()] = (f, u)
        if u.name:
            fac_by_name[u.name.lower().strip()] = (f, u)
            clean_u_name = re.sub(r'^[.\s,]+', '', str(u.name)).strip()
            if clean_u_name:
                known_fac_names.append(clean_u_name)

    # 2. Normalize input_data into a dictionary of {sheet_name: DataFrame}
    sheets_dict: Dict[str, pd.DataFrame] = {}
    if isinstance(input_data, dict):
        for s_name, s_df in input_data.items():
            if isinstance(s_df, pd.DataFrame) and not s_df.empty:
                # Check if it has any non-empty cells
                if s_df.dropna(how='all').shape[0] > 0:
                    sheets_dict[str(s_name).strip()] = s_df
    elif isinstance(input_data, pd.DataFrame):
        if not input_data.empty:
            sheets_dict["Sheet1"] = input_data

    if not sheets_dict:
        return {
            "total_slots": 0,
            "valid_slots_count": 0,
            "warning_slots_count": 0,
            "error_slots_count": 0,
            "conflict_count": 0,
            "preview_rows": [],
            "conflicts": [],
            "unique_sections": [],
            "unique_faculty": [],
            "unique_courses": [],
            "headers": [c["header"] for c in TIMETABLE_COLUMNS],
            "sheet_names": [],
        }

    alias_dict = {
        "day": ["day_of_week", "day_name", "weekday"],
        "start_time": ["start", "from", "begin", "period_start", "start_hour"],
        "end_time": ["end", "to", "period_end", "end_hour"],
        "course_code": ["course", "subject_code", "course_id", "code"],
        "course_name": ["subject_name", "subject", "title", "course_title"],
        "department": ["dept", "branch"],
        "year": ["class_year", "study_year", "sem_year"],
        "section": ["sec", "class_section", "batch"],
        "faculty_identifier": ["faculty", "faculty_email", "faculty_id", "instructor", "teacher", "emp_id", "employee_id"],
        "room_name": ["room", "classroom", "hall", "room_no", "location"],
        "color": ["slot_color", "badge_color", "theme"],
    }

    # 3. Process each sheet into standardized tabular records
    standard_dfs: List[pd.DataFrame] = []
    for s_name, s_df in sheets_dict.items():
        meta = infer_metadata_from_sheet_name(s_name, depts)
        sheet_dept = meta["department"]
        sheet_sec = meta["section"]
        sheet_yr = meta["year"]

        if is_grid_timetable_format(s_df):
            try:
                converted_df = convert_grid_df_to_standard(
                    s_df,
                    default_dept=sheet_dept,
                    default_sec=sheet_sec,
                    default_year=sheet_yr,
                    sheet_name=s_name,
                    known_faculty_names=known_fac_names,
                )
                if not converted_df.empty:
                    standard_dfs.append(converted_df)
            except Exception as ge:
                logger.warning(f"Failed to parse sheet '{s_name}' as grid timetable: {ge}")
        else:
            # Tabular timetable format
            tbl_df = s_df.copy()
            tbl_cols_norm = [_normalize_header(c) for c in tbl_df.columns]
            tbl_df.columns = tbl_cols_norm

            for c in TIMETABLE_COLUMNS:
                norm_key = _normalize_header(c["header"])
                if norm_key not in tbl_cols_norm:
                    aliases = alias_dict.get(c["key"], [])
                    matched = next((a for a in aliases if a in tbl_cols_norm), None)
                    if matched:
                        tbl_df.rename(columns={matched: norm_key}, inplace=True)
                        tbl_cols_norm = list(tbl_df.columns)

            # If department column is missing or all empty, fill with sheet department
            dept_header = _normalize_header("Department")
            if dept_header not in tbl_df.columns:
                tbl_df[dept_header] = sheet_dept
            else:
                tbl_df[dept_header] = tbl_df[dept_header].fillna(sheet_dept)
                tbl_df.loc[tbl_df[dept_header].astype(str).str.strip() == "", dept_header] = sheet_dept

            sec_header = _normalize_header("Section")
            if sec_header not in tbl_df.columns and sheet_sec:
                tbl_df[sec_header] = sheet_sec

            yr_header = _normalize_header("Year")
            if yr_header not in tbl_df.columns and sheet_yr:
                tbl_df[yr_header] = str(sheet_yr)

            tbl_df["sheet"] = s_name
            standard_dfs.append(tbl_df)

    if not standard_dfs:
        raise ValueError(
            f"Could not extract any timetable periods across the provided sheet(s): {', '.join(sheets_dict.keys())}. "
            f"Please ensure Day names (Mon, Tue, ...) and periods are present."
        )

    # 4. Concatenate records from all sheets
    df = pd.concat(standard_dfs, ignore_index=True)

    # Normalize column names in combined dataframe
    df_cols_normalized = [_normalize_header(c) for c in df.columns]
    df.columns = df_cols_normalized

    for c in TIMETABLE_COLUMNS:
        norm_key = _normalize_header(c["header"])
        if norm_key not in df_cols_normalized:
            aliases = alias_dict.get(c["key"], [])
            matched = next((a for a in aliases if a in df_cols_normalized), None)
            if matched:
                df.rename(columns={matched: norm_key}, inplace=True)
                df_cols_normalized = list(df.columns)

    # Check required columns
    missing_required = []
    for c in TIMETABLE_COLUMNS:
        norm_key = _normalize_header(c["header"])
        if c["required"] and norm_key not in df_cols_normalized:
            missing_required.append(c["header"])

    if missing_required:
        raise ValueError(
            f"Timetable data is missing required columns: {', '.join(missing_required)}. "
            f"Please download and use the official timetable template."
        )

    parsed_rows = []
    unique_sections_set: Set[str] = set()
    unique_faculty_set: Set[str] = set()
    unique_courses_set: Set[str] = set()

    for row_idx, row in df.iterrows():
        row_num = int(row_idx) + 1

        # Ignore totally blank rows
        row_vals = [str(v).strip() for v in row.values if pd.notna(v) and str(v).strip() != ""]
        if not row_vals:
            continue

        def get_val(key_name: str) -> str:
            target_col = next((c["header"] for c in TIMETABLE_COLUMNS if c["key"] == key_name), key_name)
            norm_k = _normalize_header(target_col)
            v = str(row.get(norm_k, "")).strip() if pd.notna(row.get(norm_k)) else ""
            return "" if v.lower() == "nan" else v

        day_raw = get_val("day")
        start_raw = get_val("start_time")
        end_raw = get_val("end_time")
        course_code_raw = get_val("course_code")
        course_name_raw = get_val("course_name")
        dept_raw = get_val("department")
        year_raw = get_val("year")
        section_raw = get_val("section")
        faculty_raw = get_val("faculty_identifier")
        room_raw = get_val("room_name")
        color_raw = get_val("color")

        sheet_val = str(row.get("sheet", "")).strip() if pd.notna(row.get("sheet")) else ""
        if sheet_val.lower() == "nan":
            sheet_val = ""

        row_errors: List[str] = []
        row_warnings: List[str] = []

        # Validate Day
        day_norm = normalize_day(day_raw)
        if not day_norm:
            row_errors.append(f"Invalid Day '{day_raw}'. Allowed: Mon, Tue, Wed, Thu, Fri, Sat.")
            day_norm = day_raw or "Mon"

        # Validate Time
        start_norm = normalize_time_str(start_raw)
        end_norm = normalize_time_str(end_raw)
        if not start_norm:
            row_errors.append(f"Invalid Start Time '{start_raw}'. Expected format HH:MM (e.g. 09:00).")
            start_norm = "09:00"
        if not end_norm:
            row_errors.append(f"Invalid End Time '{end_raw}'. Expected format HH:MM (e.g. 10:00).")
            end_norm = "10:00"

        if start_norm and end_norm and start_norm >= end_norm:
            row_errors.append(f"Start Time '{start_norm}' must be earlier than End Time '{end_norm}'.")

        # Validate Department via canonical mapping
        canonical_dept_name, canonical_code = resolve_canonical_department(dept_raw, depts)
        dept_matched_name = canonical_dept_name
        if not dept_raw:
            row_errors.append("Department is required.")
        else:
            dept_obj = (
                dept_map.get(canonical_dept_name.upper())
                or dept_map.get(canonical_dept_name.lower())
                or dept_map.get(canonical_code.upper())
                or dept_map.get(dept_raw.upper())
                or dept_map.get(dept_raw.lower())
            )
            if dept_obj:
                if canonical_code in KNOWN_DEPARTMENT_ALIASES:
                    dept_matched_name = KNOWN_DEPARTMENT_ALIASES[canonical_code]["name"]
                else:
                    dept_matched_name = dept_obj.name

        # Validate Year & Section
        year_num = 3
        if not year_raw:
            row_errors.append("Year is required (e.g. 3).")
        else:
            digits = re.findall(r"\d+", str(year_raw))
            if digits:
                year_num = max(1, min(4, int(digits[0])))
            else:
                row_errors.append(f"Invalid Year '{year_raw}'. Expected 1, 2, 3, or 4.")

        section_clean = section_raw.strip().upper()
        if not section_clean:
            row_errors.append("Section is required (e.g. A).")
        else:
            sec_match = re.search(r"([A-Za-z0-9]+)$", section_clean)
            if sec_match:
                section_clean = sec_match.group(1).upper()

        section_display = f"{dept_matched_name} Yr {year_num} Sec {section_clean}"
        unique_sections_set.add(section_display)

        # Validate Course
        clean_code = course_code_raw.strip().upper().replace(" ", "")
        if not clean_code:
            row_errors.append("Course Code is required.")
            resolved_course_name = course_name_raw or "Unknown Course"
        else:
            unique_courses_set.add(clean_code)
            matched_c = course_by_code.get(clean_code)
            if not matched_c:
                matched_c = course_by_name.get(course_name_raw.strip().lower())
            if matched_c:
                clean_code = matched_c.code
                resolved_course_name = matched_c.name
            else:
                resolved_course_name = course_name_raw.strip() if course_name_raw else clean_code
                row_warnings.append(f"Course '{clean_code}' will be registered automatically.")

        # Validate Faculty
        clean_fac = faculty_raw.strip()
        faculty_resolved_id = None
        faculty_resolved_name = clean_fac
        if not clean_fac:
            row_errors.append("Faculty identifier (Email, Employee ID, or Name) is required.")
        else:
            fac_match = (
                fac_by_empid.get(clean_fac.upper())
                or fac_by_email.get(clean_fac.lower())
                or fac_by_name.get(clean_fac.lower())
            )
            if fac_match:
                f_obj, u_obj = fac_match
                faculty_resolved_id = f_obj.id
                faculty_resolved_name = u_obj.name
                unique_faculty_set.add(faculty_resolved_name)
            else:
                unique_faculty_set.add(clean_fac)
                row_warnings.append(f"Faculty '{clean_fac}' will be registered automatically.")

        # Validate Room
        clean_room = room_raw.strip()
        if not clean_room:
            row_errors.append("Room is required.")
            clean_room = "TBD"
        else:
            matched_r = room_by_name.get(clean_room.lower())
            if matched_r:
                clean_room = matched_r.name
            else:
                row_warnings.append(f"Room '{clean_room}' will be registered automatically.")

        # Color
        color_choice = color_raw.strip().lower() if color_raw else ""
        if color_choice not in COLOR_PALETTE:
            color_choice = COLOR_PALETTE[abs(hash(clean_code)) % len(COLOR_PALETTE)]

        status = "error" if row_errors else ("warning" if row_warnings else "valid")

        parsed_rows.append({
            "row_number": row_num,
            "sheet_name": sheet_val or None,
            "day": day_norm,
            "start_time": start_norm,
            "end_time": end_norm,
            "course_code": clean_code,
            "course_name": resolved_course_name,
            "department": dept_matched_name,
            "year": year_num,
            "section": section_clean,
            "faculty_identifier": clean_fac,
            "faculty_name": faculty_resolved_name,
            "faculty_id": faculty_resolved_id,
            "room_name": clean_room,
            "color": color_choice,
            "status": status,
            "errors": row_errors,
            "warnings": row_warnings,
        })

    # =========================================================================
    # Collision Detection Engine
    # Checks Room Double-Booking, Faculty Collisions, and Section Collisions
    # =========================================================================
    conflicts: List[Dict[str, Any]] = []

    def intervals_overlap(s1: str, e1: str, s2: str, e2: str) -> bool:
        return max(s1, s2) < min(e1, e2)

    n = len(parsed_rows)
    for i in range(n):
        row_a = parsed_rows[i]
        for j in range(i + 1, n):
            row_b = parsed_rows[j]

            # Same Day check
            if row_a["day"] != row_b["day"]:
                continue

            # Time overlap check
            s1, e1 = row_a["start_time"], row_a["end_time"]
            s2, e2 = row_b["start_time"], row_b["end_time"]
            if not intervals_overlap(s1, e1, s2, e2):
                continue

            overlap_time = f"{max(s1, s2)} - {min(e1, e2)}"
            loc_a = f"Row {row_a['row_number']}" + (f" [{row_a['sheet_name']}]" if row_a.get('sheet_name') else "")
            loc_b = f"Row {row_b['row_number']}" + (f" [{row_b['sheet_name']}]" if row_b.get('sheet_name') else "")

            # 1. Room Double-Booking Collision
            if row_a["room_name"].lower() == row_b["room_name"].lower() and row_a["room_name"].lower() != "tbd":
                msg = (
                    f"Room '{row_a['room_name']}' is double-booked on {row_a['day']} "
                    f"between {overlap_time} ({loc_a} & {loc_b})."
                )
                conflicts.append({
                    "conflict_type": "room_collision",
                    "message": msg,
                    "day": row_a["day"],
                    "time": overlap_time,
                    "affected_entity": f"Room {row_a['room_name']}",
                    "row_numbers": [row_a["row_number"], row_b["row_number"]],
                })
                row_a["warnings"].append(f"Collision: Room '{row_a['room_name']}' is also assigned in {loc_b}.")
                row_b["warnings"].append(f"Collision: Room '{row_b['room_name']}' is also assigned in {loc_a}.")
                if row_a["status"] == "valid": row_a["status"] = "warning"
                if row_b["status"] == "valid": row_b["status"] = "warning"

            # 2. Faculty Collision
            fac_match_a = row_a.get("faculty_id") or row_a.get("faculty_name", "").lower()
            fac_match_b = row_b.get("faculty_id") or row_b.get("faculty_name", "").lower()
            if fac_match_a and fac_match_b and fac_match_a == fac_match_b:
                fac_display = row_a["faculty_name"]
                msg = (
                    f"Faculty '{fac_display}' is scheduled concurrently on {row_a['day']} "
                    f"between {overlap_time} ({loc_a} & {loc_b})."
                )
                conflicts.append({
                    "conflict_type": "faculty_collision",
                    "message": msg,
                    "day": row_a["day"],
                    "time": overlap_time,
                    "affected_entity": fac_display,
                    "row_numbers": [row_a["row_number"], row_b["row_number"]],
                })
                row_a["warnings"].append(f"Collision: Faculty '{fac_display}' is also scheduled in {loc_b}.")
                row_b["warnings"].append(f"Collision: Faculty '{fac_display}' is also scheduled in {loc_a}.")
                if row_a["status"] == "valid": row_a["status"] = "warning"
                if row_b["status"] == "valid": row_b["status"] = "warning"

            # 3. Class Section Collision
            sec_key_a = (row_a["department"].lower(), row_a["year"], row_a["section"])
            sec_key_b = (row_b["department"].lower(), row_b["year"], row_b["section"])
            if sec_key_a == sec_key_b:
                sec_disp = f"{row_a['department']} Yr {row_a['year']} Sec {row_a['section']}"
                msg = (
                    f"Class section '{sec_disp}' has overlapping periods on {row_a['day']} "
                    f"between {overlap_time} ({loc_a} & {loc_b})."
                )
                conflicts.append({
                    "conflict_type": "section_collision",
                    "message": msg,
                    "day": row_a["day"],
                    "time": overlap_time,
                    "affected_entity": sec_disp,
                    "row_numbers": [row_a["row_number"], row_b["row_number"]],
                })
                row_a["warnings"].append(f"Collision: Class section '{sec_disp}' has overlapping period in {loc_b}.")
                row_b["warnings"].append(f"Collision: Class section '{sec_disp}' has overlapping period in {loc_a}.")
                if row_a["status"] == "valid": row_a["status"] = "warning"
                if row_b["status"] == "valid": row_b["status"] = "warning"

    valid_count = sum(1 for r in parsed_rows if r["status"] == "valid")
    warning_count = sum(1 for r in parsed_rows if r["status"] == "warning")
    error_count = sum(1 for r in parsed_rows if r["status"] == "error")

    return {
        "total_slots": len(parsed_rows),
        "valid_slots_count": valid_count,
        "warning_slots_count": warning_count,
        "error_slots_count": error_count,
        "conflict_count": len(conflicts),
        "preview_rows": parsed_rows,
        "conflicts": conflicts,
        "unique_sections": sorted(list(unique_sections_set)),
        "unique_faculty": sorted(list(unique_faculty_set)),
        "unique_courses": sorted(list(unique_courses_set)),
        "headers": [c["header"] for c in TIMETABLE_COLUMNS],
        "sheet_names": list(sheets_dict.keys()),
    }


async def apply_timetable_sync_rows(
    rows: List[Dict[str, Any]],
    replace_existing: bool,
    actor_id: str,
    actor_role: str,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Applies validated timetable rows into the database:
    - Resolves or auto-creates Courses, Rooms, and ClassSections with canonical department names.
    - If replace_existing is True, clears timetable slots for affected sections before inserting.
    - Creates TimetableSlot entries.
    - Ensures SectionSubjectFaculty links exist for faculty assignment.
    - Writes immutable audit log and updates SheetConfig.
    """
    # 1. Fetch DB caches
    depts = (await db.execute(select(Department))).scalars().all()
    courses = (await db.execute(select(Course))).scalars().all()
    course_by_code = {c.code.upper().strip(): c for c in courses}

    rooms = (await db.execute(select(Room))).scalars().all()
    room_by_name = {r.name.lower().strip(): r for r in rooms}

    sections = (await db.execute(select(ClassSection))).scalars().all()
    section_map = {}
    for s in sections:
        dept_k = s.department.lower().strip()
        section_map[(dept_k, s.year, s.section.upper().strip())] = s
        c_name, _ = resolve_canonical_department(s.department, depts)
        section_map[(c_name.lower().strip(), s.year, s.section.upper().strip())] = s

    fac_user_res = await db.execute(
        select(Faculty, User).join(User, Faculty.user_id == User.id)
    )
    fac_by_id = {f.id: (f, u) for f, u in fac_user_res.all()}
    fac_by_email = {u.email.lower().strip(): f.id for f, u in fac_by_id.values() if u.email}
    fac_by_empid = {f.employee_id.upper().strip(): f.id for f, u in fac_by_id.values() if f.employee_id}
    fac_by_name = {u.name.lower().strip(): f.id for f, u in fac_by_id.values() if u.name}

    # Track distinct sections and faculty assigned
    affected_section_ids: Set[str] = set()
    assigned_faculty_ids: Set[str] = set()
    mapped_course_ids: Set[str] = set()
    valid_row_items = [r for r in rows if r.get("status") in ("valid", "warning")]

    if not valid_row_items:
        return {
            "imported_slots": 0,
            "sections_assigned": 0,
            "faculty_assigned": 0,
            "courses_mapped": 0,
            "message": "No valid timetable slots to apply.",
        }

    # Pre-resolve / auto-create entities needed by the valid rows
    for r in valid_row_items:
        # Resolve Course
        c_code = r.get("course_code", "").strip().upper()
        c_name = r.get("course_name", "").strip() or c_code
        c_dept_raw = r.get("department", "Computer Science").strip()
        c_dept, _ = resolve_canonical_department(c_dept_raw, depts)

        if c_code not in course_by_code:
            new_course = Course(
                id=f"crs-{c_code.lower()}-{uuid.uuid4().hex[:4]}",
                code=c_code,
                name=c_name,
                department=c_dept,
                credits=3,
            )
            db.add(new_course)
            course_by_code[c_code] = new_course

        # Resolve Room
        r_name = r.get("room_name", "").strip()
        if r_name.lower() not in room_by_name:
            new_room = Room(
                id=f"room-{uuid.uuid4().hex[:8]}",
                name=r_name,
                beacon_uuid=f"beacon-{uuid.uuid4().hex[:8]}",
                capacity=60,
                default_tx_power=-59.0,
            )
            db.add(new_room)
            room_by_name[r_name.lower()] = new_room

        # Resolve ClassSection with canonical department name
        sec_dept_raw = r.get("department", "Computer Science").strip()
        canonical_sec_dept, _ = resolve_canonical_department(sec_dept_raw, depts)
        sec_yr = int(r.get("year", 3))
        sec_code = r.get("section", "A").strip().upper()
        sec_key = (canonical_sec_dept.lower(), sec_yr, sec_code)

        if sec_key not in section_map:
            new_sec = ClassSection(
                id=f"sec-{canonical_sec_dept.lower()[:3]}-{sec_yr}{sec_code.lower()}-{uuid.uuid4().hex[:4]}",
                name=f"{canonical_sec_dept} - Year {sec_yr} - Section {sec_code}",
                department=canonical_sec_dept,
                year=sec_yr,
                section=sec_code,
                student_count=45,
            )
            db.add(new_sec)
            section_map[sec_key] = new_sec
            section_map[(sec_dept_raw.lower(), sec_yr, sec_code)] = new_sec

    # Flush so generated IDs are available
    await db.flush()

    # Determine affected sections
    for r in valid_row_items:
        sec_dept_raw = r.get("department", "Computer Science").strip()
        canonical_sec_dept, _ = resolve_canonical_department(sec_dept_raw, depts)
        sec_yr = int(r.get("year", 3))
        sec_code = r.get("section", "A").strip().upper()
        sec_obj = section_map.get((canonical_sec_dept.lower(), sec_yr, sec_code)) or section_map.get((sec_dept_raw.lower(), sec_yr, sec_code))
        if sec_obj:
            affected_section_ids.add(sec_obj.id)

    # If replace_existing, clear previous slots for affected sections
    if replace_existing and affected_section_ids:
        await db.execute(
            delete(TimetableSlot).where(TimetableSlot.section_id.in_(affected_section_ids))
        )

    # Insert Timetable Slots & Map SectionSubjectFaculty
    existing_ssf = (await db.execute(select(SectionSubjectFaculty))).scalars().all()
    ssf_keys = {(s.class_section_id, s.course_id, s.faculty_id) for s in existing_ssf}

    imported_slots = 0
    for r in valid_row_items:
        c_code = r.get("course_code", "").strip().upper()
        course_obj = course_by_code[c_code]

        r_name = r.get("room_name", "").strip().lower()
        room_obj = room_by_name[r_name]

        sec_dept_raw = r.get("department", "Computer Science").strip()
        canonical_sec_dept, _ = resolve_canonical_department(sec_dept_raw, depts)
        sec_yr = int(r.get("year", 3))
        sec_code = r.get("section", "A").strip().upper()
        sec_obj = section_map.get((canonical_sec_dept.lower(), sec_yr, sec_code)) or section_map[(sec_dept_raw.lower(), sec_yr, sec_code)]

        # Resolve Faculty ID with fuzzy & title-stripped matching
        fac_ident = r.get("faculty_identifier", "").strip()
        stripped_ident = re.sub(r'^(Dr|Prof|Mr|Mrs|Ms)[.:\s]+', '', fac_ident, flags=re.IGNORECASE).strip().lower()
        fac_id = (
            r.get("faculty_id")
            or fac_by_empid.get(fac_ident.upper())
            or fac_by_email.get(fac_ident.lower())
            or fac_by_name.get(fac_ident.lower())
            or (fac_by_name.get(stripped_ident) if stripped_ident else None)
        )
        if not fac_id and stripped_ident:
            for fname, fid in fac_by_name.items():
                clean_target = re.sub(r'^(Dr|Prof|Mr|Mrs|Ms)[.:\s]+', '', fname, flags=re.IGNORECASE).strip().lower()
                if clean_target and (stripped_ident in clean_target or clean_target in stripped_ident):
                    fac_id = fid
                    break

        if not fac_id:
            # Fallback to first available faculty if present, to avoid creating duplicate dummy accounts
            if fac_by_name:
                fac_id = next(iter(fac_by_name.values()))
            else:
                raw_f_name = r.get("faculty_name", "").strip() or fac_ident or "Faculty Member"
                fac_clean_name = re.sub(r'^(Dr|Prof|Mr|Mrs|Ms)[.:\s]+', r'\1. ', raw_f_name, flags=re.IGNORECASE)
                fac_clean_name = re.sub(r'^[.\s,]+', '', fac_clean_name).strip()
                new_uid = f"usr-fac-{uuid.uuid4().hex[:6]}"
                sanitized_email = f"{re.sub(r'[^a-zA-Z0-9]', '', fac_clean_name).lower()[:12] or 'fac'}@campus.edu"
                if sanitized_email in fac_by_email:
                    sanitized_email = f"{sanitized_email.split('@')[0]}_{uuid.uuid4().hex[:4]}@campus.edu"

                dept_name = course_obj.department or "Information Technology"
                new_u = User(
                    id=new_uid,
                    name=fac_clean_name,
                    email=sanitized_email,
                    password_hash=get_password_hash("Campus@123"),
                    role=RoleEnum.FACULTY,
                    department=dept_name,
                )
                db.add(new_u)
                await db.flush()

                new_f = Faculty(
                    id=f"fac-{uuid.uuid4().hex[:6]}",
                    user_id=new_u.id,
                    department=dept_name,
                    employee_id=f"EMP-{uuid.uuid4().hex[:4].upper()}",
                    active=True,
                )
                db.add(new_f)
                await db.flush()

                fac_id = new_f.id
                fac_by_name[fac_clean_name.lower().strip()] = fac_id
                fac_by_email[sanitized_email.lower().strip()] = fac_id
                fac_by_empid[new_f.employee_id.upper()] = fac_id

        slot_id = f"slot-{uuid.uuid4().hex[:8]}"
        color = r.get("color", "indigo")

        new_slot = TimetableSlot(
            id=slot_id,
            section_id=sec_obj.id,
            course_id=course_obj.id,
            faculty_id=fac_id,
            room_id=room_obj.id,
            day_of_week=r.get("day", "Mon"),
            start_time=r.get("start_time", "09:00"),
            end_time=r.get("end_time", "10:00"),
            color=color,
        )
        db.add(new_slot)
        imported_slots += 1

        assigned_faculty_ids.add(fac_id)
        mapped_course_ids.add(course_obj.id)

        # Upsert SectionSubjectFaculty
        ssf_key = (sec_obj.id, course_obj.id, fac_id)
        if ssf_key not in ssf_keys:
            new_ssf = SectionSubjectFaculty(
                id=f"ssf-{uuid.uuid4().hex[:8]}",
                class_section_id=sec_obj.id,
                course_id=course_obj.id,
                faculty_id=fac_id,
            )
            db.add(new_ssf)
            ssf_keys.add(ssf_key)

    # Log to audit_logs
    await log_audit_event(
        db=db,
        actor_id=actor_id,
        actor_role=actor_role,
        action_type="timetable_sync_apply",
        target_entity="timetable_slots",
        metadata={
            "imported_slots": imported_slots,
            "sections_assigned": len(affected_section_ids),
            "faculty_assigned": len(assigned_faculty_ids),
            "courses_mapped": len(mapped_course_ids),
            "replace_existing": replace_existing,
        }
    )

    # Update SheetConfig record for timetable
    cfg_stmt = select(SheetConfig).where(SheetConfig.id == "sheet-config-timetable")
    cfg_res = await db.execute(cfg_stmt)
    cfg = cfg_res.scalar_one_or_none()
    if not cfg:
        cfg = SheetConfig(
            id="sheet-config-timetable",
            sheet_type="timetable",
            sync_interval_minutes=0,
            auto_apply=False,
            last_sync_status="success",
            last_synced_at=datetime.now(timezone.utc),
            last_sync_summary={
                "slots": imported_slots,
                "sections": len(affected_section_ids),
                "faculty": len(assigned_faculty_ids),
                "courses": len(mapped_course_ids),
            }
        )
        db.add(cfg)
    else:
        cfg.last_synced_at = datetime.now(timezone.utc)
        cfg.last_sync_status = "success"
        cfg.last_sync_summary = {
            "slots": imported_slots,
            "sections": len(affected_section_ids),
            "faculty": len(assigned_faculty_ids),
            "courses": len(mapped_course_ids),
        }
        cfg.pending_preview = None

    await db.commit()

    return {
        "imported_slots": imported_slots,
        "sections_assigned": len(affected_section_ids),
        "faculty_assigned": len(assigned_faculty_ids),
        "courses_mapped": len(mapped_course_ids),
        "message": f"Successfully applied {imported_slots} timetable periods across {len(affected_section_ids)} class sections.",
    }
