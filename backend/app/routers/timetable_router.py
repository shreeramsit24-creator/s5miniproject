import io
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import pandas as pd

logger = logging.getLogger("timetable_router")

from app.core.deps import get_db, require_role
from app.models.user import User, Faculty, RoleEnum
from app.models.academic import TimetableSlot, Course, Room, ClassSection
from app.models.sheet_sync import SheetConfig
from app.schemas.sheet_sync import SheetConfigItem, SheetConfigSaveRequest
from app.schemas.timetable_sync import (
    TimetableSlotDetail,
    TimetableSyncPreviewResponse,
    TimetableApplyRequest,
    TimetableApplyResponse,
)
from app.services.sheet_sync import validate_and_normalize_sheet_url, fetch_sheet_csv
from app.services.timetable_sync import (
    parse_and_validate_timetable,
    apply_timetable_sync_rows,
    generate_timetable_csv_template,
)

router = APIRouter(prefix="/admin/timetable", tags=["Admin Timetable Sheet Sync"])


def _format_config_item(cfg: SheetConfig) -> SheetConfigItem:
    return SheetConfigItem(
        id=cfg.id,
        sheet_type=cfg.sheet_type,
        url=cfg.url,
        sync_interval_minutes=cfg.sync_interval_minutes,
        auto_apply=cfg.auto_apply,
        last_synced_at=cfg.last_synced_at.isoformat() if cfg.last_synced_at else None,
        last_sync_status=cfg.last_sync_status,
        last_sync_summary=cfg.last_sync_summary,
        pending_preview=cfg.pending_preview,
        created_by=cfg.created_by,
        updated_at=cfg.updated_at.isoformat() if cfg.updated_at else None,
    )


@router.get("/all", response_model=List[TimetableSlotDetail])
async def get_all_timetable_slots(
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.FACULTY, RoleEnum.STUDENT])),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all assigned weekly timetable slots with resolved Course, Faculty, Room, and ClassSection details.
    Uses resilient outer joins and fallback mapping so slots are never dropped due to loose identifiers.
    """
    from sqlalchemy import or_
    import re
    stmt = (
        select(TimetableSlot, Course, Faculty, User, Room, ClassSection)
        .outerjoin(Course, or_(TimetableSlot.course_id == Course.id, TimetableSlot.course_id == Course.code, TimetableSlot.course_id == Course.name))
        .outerjoin(Faculty, or_(TimetableSlot.faculty_id == Faculty.id, TimetableSlot.faculty_id == Faculty.employee_id, TimetableSlot.faculty_id == Faculty.user_id))
        .outerjoin(User, or_(Faculty.user_id == User.id, TimetableSlot.faculty_id == User.id, TimetableSlot.faculty_id == User.name))
        .outerjoin(Room, or_(TimetableSlot.room_id == Room.id, TimetableSlot.room_id == Room.name))
        .outerjoin(ClassSection, or_(TimetableSlot.section_id == ClassSection.id, TimetableSlot.section_id == ClassSection.name, TimetableSlot.section_id == ClassSection.section))
        .order_by(TimetableSlot.day_of_week, TimetableSlot.start_time)
    )
    res = await db.execute(stmt)
    slots = []
    for slot, course, fac, u, room, section in res.all():
        raw_fac_name = u.name if u else (slot.faculty_id or "Faculty Staff")
        clean_fac_name = re.sub(r'^[.\s,]+', '', str(raw_fac_name)).strip()
        if not clean_fac_name:
            clean_fac_name = "Faculty Staff"

        slots.append(
            TimetableSlotDetail(
                id=slot.id,
                day=slot.day_of_week,
                startTime=slot.start_time,
                endTime=slot.end_time,
                subjectId=course.id if course else (slot.course_id or ""),
                subjectCode=course.code if course else (slot.course_id or "SUB"),
                subjectName=course.name if course else (slot.course_id or "Class Lecture"),
                facultyId=fac.id if fac else (slot.faculty_id or ""),
                facultyName=clean_fac_name,
                classSectionId=section.id if section else (slot.section_id or ""),
                classSectionName=section.name if section else (slot.section_id or "Class Section"),
                room=room.name if room else (slot.room_id or "LH-201"),
                color=slot.color or "indigo",
            )
        )
    return slots


def _get_config_id_and_type(target: Optional[str] = None, sheet_type: Optional[str] = None) -> tuple[str, str]:
    t = (target or "").lower().strip()
    st = (sheet_type or "").lower().strip()
    if t in ("teacher", "faculty", "teacher_timetable", "faculty_timetable") or st in ("teacher", "faculty", "teacher_timetable", "faculty_timetable"):
        return "sheet-config-teacher-timetable", "teacher_timetable"
    return "sheet-config-student-timetable", "student_timetable"


@router.get("/config", response_model=SheetConfigItem)
async def get_timetable_sheet_config(
    target: Optional[str] = Query("student", description="Target schedule: 'student' or 'teacher'"),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.FACULTY, RoleEnum.STUDENT])),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves Google Sheet sync configuration and status for Student or Teacher Timetables.
    """
    config_id, s_type = _get_config_id_and_type(target)
    stmt = select(SheetConfig).where(SheetConfig.id == config_id)
    res = await db.execute(stmt)
    cfg = res.scalar_one_or_none()

    if not cfg:
        # Fallback to legacy config if student config does not exist yet
        if config_id == "sheet-config-student-timetable":
            fallback_stmt = select(SheetConfig).where(SheetConfig.id == "sheet-config-timetable")
            f_res = await db.execute(fallback_stmt)
            fallback_cfg = f_res.scalar_one_or_none()
            if fallback_cfg:
                cfg = SheetConfig(
                    id=config_id,
                    sheet_type=s_type,
                    url=fallback_cfg.url,
                    sync_interval_minutes=fallback_cfg.sync_interval_minutes,
                    auto_apply=fallback_cfg.auto_apply,
                    last_synced_at=fallback_cfg.last_synced_at,
                    last_sync_status=fallback_cfg.last_sync_status,
                    last_sync_summary=fallback_cfg.last_sync_summary,
                    pending_preview=fallback_cfg.pending_preview,
                )
                db.add(cfg)
                await db.commit()
                await db.refresh(cfg)
                return _format_config_item(cfg)

        cfg = SheetConfig(
            id=config_id,
            sheet_type=s_type,
            sync_interval_minutes=0,
            auto_apply=False,
            last_sync_status="idle",
        )
        db.add(cfg)
        await db.commit()
        await db.refresh(cfg)

    return _format_config_item(cfg)


@router.get("/configs")
async def get_all_timetable_configs(
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.FACULTY, RoleEnum.STUDENT])),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves sheet sync configurations for both student and teacher timetables in one call.
    """
    student_cfg = await get_timetable_sheet_config(target="student", current_user=current_user, db=db)
    teacher_cfg = await get_timetable_sheet_config(target="teacher", current_user=current_user, db=db)
    return {"student": student_cfg, "teacher": teacher_cfg}


@router.post("/config", response_model=SheetConfigItem)
async def save_timetable_sheet_config(
    payload: SheetConfigSaveRequest,
    target: Optional[str] = Query(None, description="Target schedule: 'student' or 'teacher'"),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.FACULTY, RoleEnum.STUDENT])),
    db: AsyncSession = Depends(get_db),
):
    """
    Saves or updates the Google Sheet URL, sync interval, and auto-apply setting for Student or Teacher Timetables.
    Performs SSRF validation on the submitted URL.
    """
    normalized_url = None
    if payload.url and payload.url.strip():
        try:
            normalized_url = validate_and_normalize_sheet_url(payload.url.strip())
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))

    config_id, s_type = _get_config_id_and_type(target, payload.sheet_type)
    stmt = select(SheetConfig).where(SheetConfig.id == config_id)
    res = await db.execute(stmt)
    cfg = res.scalar_one_or_none()

    if not cfg:
        cfg = SheetConfig(
            id=config_id,
            sheet_type=s_type,
            url=normalized_url,
            sync_interval_minutes=payload.sync_interval_minutes,
            auto_apply=payload.auto_apply,
            created_by=current_user.id,
        )
        db.add(cfg)
    else:
        cfg.url = normalized_url
        cfg.sync_interval_minutes = payload.sync_interval_minutes
        cfg.auto_apply = payload.auto_apply
        cfg.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(cfg)
    return _format_config_item(cfg)


@router.post("/sync", response_model=TimetableSyncPreviewResponse)
async def trigger_timetable_sync(
    custom_url: Optional[str] = Query(None, description="Optional override Google Sheet URL"),
    target: Optional[str] = Query("student", description="Target schedule: 'student' or 'teacher'"),
    file: Optional[UploadFile] = File(None, description="Optional direct CSV or Excel timetable file"),
    auto_apply: bool = Query(False, description="Optionally commit valid slots to database immediately"),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.FACULTY, RoleEnum.STUDENT])),
    db: AsyncSession = Depends(get_db),
):
    """
    Parses timetable data from either an uploaded Excel/CSV file or a live Google Sheet URL.
    Validates courses, sections, rooms, and faculty, runs collision detection (room double-booking,
    faculty concurrency, section collisions), and returns preview items staged for review.
    If auto_apply=True and valid slots exist, automatically applies slots to student/faculty portals.
    """
    input_payload: Optional[Dict[str, pd.DataFrame]] = None
    resolved_norm_url: Optional[str] = None

    if file:
        filename = (file.filename or "").lower()
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        try:
            if filename.endswith(".xlsx") or filename.endswith(".xls"):
                excel_file = pd.ExcelFile(io.BytesIO(contents))
                sheets_dict = {}
                for s_name in excel_file.sheet_names:
                    try:
                        s_df = pd.read_excel(excel_file, sheet_name=s_name, dtype=str)
                        if s_df is not None and not s_df.empty:
                            if s_df.dropna(how="all").shape[0] > 0:
                                sheets_dict[str(s_name).strip()] = s_df
                    except Exception as s_err:
                        logger.warning(f"Failed to read sheet '{s_name}': {s_err}")
                input_payload = sheets_dict
            else:
                # CSV fallback with encoding detection
                try:
                    df = pd.read_csv(io.BytesIO(contents), dtype=str, encoding="utf-8-sig")
                except UnicodeDecodeError:
                    df = pd.read_csv(io.BytesIO(contents), dtype=str, encoding="latin-1")
                input_payload = {"Sheet1": df}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse uploaded file: {str(e)}")

    else:
        target_url = None
        if custom_url and custom_url.strip():
            target_url = custom_url.strip()
        else:
            config_id, _ = _get_config_id_and_type(target)
            stmt = select(SheetConfig).where(SheetConfig.id == config_id)
            res = await db.execute(stmt)
            cfg = res.scalar_one_or_none()
            if (not cfg or not cfg.url) and config_id == "sheet-config-student-timetable":
                fallback_res = await db.execute(select(SheetConfig).where(SheetConfig.id == "sheet-config-timetable"))
                cfg = fallback_res.scalar_one_or_none()
            if cfg and cfg.url:
                target_url = cfg.url

        if not target_url:
            label = "Teacher" if (target or "").lower() == "teacher" else "Student"
            raise HTTPException(
                status_code=400,
                detail=f"No {label} Timetable Google Sheet URL provided or saved. Please enter a URL or upload a file."
            )

        try:
            resolved_norm_url = validate_and_normalize_sheet_url(target_url)
            csv_text = await fetch_sheet_csv(resolved_norm_url)
            df = pd.read_csv(io.StringIO(csv_text), dtype=str, skip_blank_lines=True)
            input_payload = {"Sheet1": df}
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch Google Sheet: {str(e)}")

    if not input_payload or all(d.empty for d in input_payload.values()):
        raise HTTPException(status_code=400, detail="Timetable dataset is empty.")

    try:
        preview_data = await parse_and_validate_timetable(input_payload, db)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse timetable data: {str(e)}")

    # Stage preview into SheetConfig and persist the normalized URL
    config_id, s_type = _get_config_id_and_type(target)
    stmt = select(SheetConfig).where(SheetConfig.id == config_id)
    res = await db.execute(stmt)
    cfg = res.scalar_one_or_none()
    if not cfg:
        cfg = SheetConfig(
            id=config_id,
            sheet_type=s_type,
            sync_interval_minutes=0,
            auto_apply=False,
            created_by=current_user.id,
        )
        db.add(cfg)

    if resolved_norm_url:
        cfg.url = resolved_norm_url

    cfg.last_synced_at = datetime.now(timezone.utc)
    cfg.last_sync_summary = {
        "total": preview_data["total_slots"],
        "valid": preview_data["valid_slots_count"],
        "warnings": preview_data["warning_slots_count"],
        "errors": preview_data["error_slots_count"],
        "conflicts": preview_data["conflict_count"],
        "sections": len(preview_data["unique_sections"]),
        "faculty": len(preview_data["unique_faculty"]),
        "courses": len(preview_data["unique_courses"]),
        "sheets": len(preview_data.get("sheet_names", [])),
    }

    # Handle auto-apply if requested and valid slots exist
    if auto_apply and (preview_data["valid_slots_count"] + preview_data["warning_slots_count"]) > 0:
        try:
            apply_res = await apply_timetable_sync_rows(
                rows=preview_data["preview_rows"],
                replace_existing=True,
                actor_id=current_user.id,
                actor_role=current_user.role,
                db=db,
            )
            preview_data["applied_result"] = apply_res
            cfg.pending_preview = None
            cfg.last_sync_status = "success"
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to auto-apply timetable slots: {str(e)}")
    else:
        cfg.pending_preview = preview_data
        cfg.last_sync_status = "pending_review" if preview_data["error_slots_count"] == 0 else "warning"

    await db.commit()
    await db.refresh(cfg)

    return TimetableSyncPreviewResponse(**preview_data)


@router.post("/apply", response_model=TimetableApplyResponse)
async def apply_timetable_slots(
    payload: TimetableApplyRequest,
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.FACULTY, RoleEnum.STUDENT])),
    db: AsyncSession = Depends(get_db),
):
    """
    Commits validated timetable slots to the database:
    - Auto-creates any missing courses, rooms, or class sections.
    - If replace_existing is True, clears existing timetable slots for the affected sections.
    - Inserts new TimetableSlot entries.
    - Links faculty to subjects via SectionSubjectFaculty.
    - Writes immutable audit log and updates sheet sync status.
    """
    if not payload.rows:
        raise HTTPException(status_code=400, detail="No timetable slots provided to apply.")

    try:
        result = await apply_timetable_sync_rows(
            rows=payload.rows,
            replace_existing=payload.replace_existing,
            actor_id=current_user.id,
            actor_role=current_user.role,
            db=db,
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to apply timetable slots: {str(e)}")

    return TimetableApplyResponse(**result)


@router.get("/template")
async def download_timetable_template(
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.FACULTY, RoleEnum.STUDENT])),
):
    """
    Returns an official CSV template with standard timetable column headers and sample data rows.
    """
    csv_content = generate_timetable_csv_template()
    filename = "academic_timetable_template.csv"

    return StreamingResponse(
        io.BytesIO(csv_content.encode("utf-8")),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )


# =========================================================================
# Public / Student Timetable Portal Router
# Serves Per-Section Weekly Matrices, Per-Student Lookups, and 1-Click Sync
# =========================================================================

public_timetable_router = APIRouter(prefix="/timetable", tags=["Timetable Portal"])

DEFAULT_MASTER_SHEET_URL = "https://docs.google.com/spreadsheets/d/1aSq6dYmaSuXOBSmFHMIUyDINmO2konnEAd23bU5nnSI/export?format=csv&gid=0"

STANDARD_PERIODS = [
    {"period": "I", "periodNumber": 1, "startTime": "08:45", "endTime": "09:35", "timeRange": "8:45 AM – 9:35 AM"},
    {"period": "II", "periodNumber": 2, "startTime": "09:35", "endTime": "10:25", "timeRange": "9:35 AM – 10:25 AM"},
    {"period": "III", "periodNumber": 3, "startTime": "10:40", "endTime": "11:30", "timeRange": "10:40 AM – 11:30 AM"},
    {"period": "IV", "periodNumber": 4, "startTime": "11:30", "endTime": "12:20", "timeRange": "11:30 AM – 12:20 PM"},
    {"period": "V", "periodNumber": 5, "startTime": "13:30", "endTime": "15:10", "timeRange": "1:30 PM – 3:10 PM"},
    {"period": "VI", "periodNumber": 6, "startTime": "15:30", "endTime": "16:25", "timeRange": "3:30 PM – 4:25 PM"},
]

PERIOD_TIME_TO_NUM = {
    "08:45": 1,
    "09:35": 2,
    "10:40": 3,
    "11:30": 4,
    "13:30": 5,
    "15:30": 6,
}

DAYS_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


def _format_slot_dict(slot: TimetableSlot, course: Optional[Course], fac_name: str, room_name: str, section_name: str) -> Dict[str, Any]:
    st = slot.start_time
    p_num = PERIOD_TIME_TO_NUM.get(st, 1)
    period_roman = {1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI"}.get(p_num, "I")
    time_range_str = {
        "08:45": "8:45 AM – 9:35 AM",
        "09:35": "9:35 AM – 10:25 AM",
        "10:40": "10:40 AM – 11:30 AM",
        "11:30": "11:30 AM – 12:20 PM",
        "13:30": "1:30 PM – 3:10 PM",
        "15:30": "3:30 PM – 4:25 PM",
    }.get(st, f"{slot.start_time} - {slot.end_time}")

    return {
        "id": slot.id,
        "day": slot.day_of_week,
        "periodNumber": p_num,
        "periodRoman": period_roman,
        "startTime": slot.start_time,
        "endTime": slot.end_time,
        "timeRange": time_range_str,
        "courseCode": course.code if course else (slot.course_id or "SUB"),
        "courseName": course.name if course else (slot.course_id or "Class Lecture"),
        "facultyName": fac_name or "Faculty Member",
        "room": room_name or "LH-201",
        "section": section_name,
        "color": slot.color or "indigo",
    }


@public_timetable_router.get("/sections")
async def list_available_sections(db: AsyncSession = Depends(get_db)):
    """
    Returns all class sections that have timetable schedules available.
    """
    from sqlalchemy import func
    sections = (await db.execute(select(ClassSection).order_by(ClassSection.year, ClassSection.section))).scalars().all()
    result = []
    for s in sections:
        cnt = (await db.execute(
            select(func.count(TimetableSlot.id)).where(TimetableSlot.section_id == s.id)
        )).scalar() or 0
        if cnt > 0:
            result.append({
                "id": s.id,
                "name": f"Section {s.section}",
                "displayName": s.name,
                "code": s.section,
                "department": s.department,
                "year": s.year,
                "slotCount": cnt,
            })
    return result


@public_timetable_router.get("/section/{section_name}")
async def get_section_timetable_matrix(section_name: str, db: AsyncSession = Depends(get_db)):
    """
    Returns the complete weekly timetable matrix (Days Mon-Sat x Periods I-VI) for a given section.
    Supports section queries like 'A', 'B', 'Sec A', 'Section A', 'Sec-B', or section UUID.
    """
    from sqlalchemy import or_
    import re

    clean_sec = section_name.strip()
    m = re.search(r"([A-Za-z0-9]+)$", clean_sec)
    sec_letter = m.group(1).upper() if m else clean_sec.upper()

    # Find matching ClassSection
    sec_stmt = select(ClassSection).where(
        or_(
            ClassSection.id == clean_sec,
            ClassSection.section == sec_letter,
            ClassSection.name.ilike(f"%{clean_sec}%"),
            ClassSection.name.ilike(f"%Section {sec_letter}%"),
        )
    )
    sections = (await db.execute(sec_stmt)).scalars().all()
    if not sections:
        raise HTTPException(status_code=404, detail=f"No class section matching '{section_name}' was found.")

    # Target primary section (prefer IT Year 3 if multiple)
    target_sec = next((s for s in sections if s.year == 3 and s.section.upper() == sec_letter and ("it" in s.department.lower() or "information" in s.department.lower())), None)
    if not target_sec:
        target_sec = next((s for s in sections if s.year == 3 and s.section.upper() == sec_letter), sections[0])
    target_sec_ids = [target_sec.id]

    # Fetch slots
    stmt = (
        select(TimetableSlot, Course, Faculty, User, Room, ClassSection)
        .outerjoin(Course, TimetableSlot.course_id == Course.id)
        .outerjoin(Faculty, TimetableSlot.faculty_id == Faculty.id)
        .outerjoin(User, Faculty.user_id == User.id)
        .outerjoin(Room, TimetableSlot.room_id == Room.id)
        .outerjoin(ClassSection, TimetableSlot.section_id == ClassSection.id)
        .where(TimetableSlot.section_id.in_(target_sec_ids))
        .order_by(TimetableSlot.day_of_week, TimetableSlot.start_time)
    )
    res = await db.execute(stmt)
    raw_slots = res.all()

    formatted_slots = []
    matrix: Dict[str, List[Optional[Dict[str, Any]]]] = {d: [None] * 6 for d in DAYS_ORDER}

    for slot, course, fac, u, room, cs in raw_slots:
        fac_name = u.name if u else (slot.faculty_id or "Faculty Member")
        clean_fac_name = re.sub(r'^[.\s,]+', '', str(fac_name)).strip()
        room_name = room.name if room else (slot.room_id or "LH-201")
        sec_name = f"Section {cs.section if cs else sec_letter}"

        slot_data = _format_slot_dict(slot, course, clean_fac_name, room_name, sec_name)
        formatted_slots.append(slot_data)

        # Place into matrix
        day = slot.day_of_week
        p_idx = slot_data["periodNumber"] - 1
        if day in matrix and 0 <= p_idx < 6:
            matrix[day][p_idx] = slot_data

    return {
        "section": f"Section {target_sec.section}",
        "sectionCode": target_sec.section,
        "displayName": target_sec.name,
        "department": target_sec.department,
        "year": target_sec.year,
        "totalWeeklyLectures": len(formatted_slots),
        "periods": STANDARD_PERIODS,
        "days": DAYS_ORDER,
        "matrix": matrix,
        "slots": formatted_slots,
    }


@public_timetable_router.get("/student/{identifier}")
async def get_student_timetable(identifier: str, db: AsyncSession = Depends(get_db)):
    """
    Looks up a student by Roll Number (e.g. '7376242IT303'), Full Name (e.g. 'SIVAGOKUL C'),
    email, or student ID, maps them to their Section timetable, and determines their today's schedule.
    """
    from app.models.user import Student
    from sqlalchemy import or_
    import re
    from datetime import datetime, timezone, timedelta

    clean_id = identifier.strip()

    # 1. Lookup Student and User
    stmt = (
        select(Student, User)
        .join(User, Student.user_id == User.id)
        .where(
            or_(
                Student.roll_number.ilike(f"%{clean_id}%"),
                User.name.ilike(f"%{clean_id}%"),
                User.email.ilike(f"%{clean_id}%"),
                Student.id == clean_id,
            )
        )
    )
    student_row = (await db.execute(stmt)).first()
    if not student_row:
        # Check if searching for generic section or roll
        raise HTTPException(
            status_code=404,
            detail=f"Student '{clean_id}' was not found in institutional roster. Please search by Roll Number (e.g. 7376242IT303) or Student Name."
        )

    student, user = student_row
    sec_letter = (student.section or "A").strip().upper()

    # 2. Find ClassSection for student's department, year, and section
    all_sections = (await db.execute(select(ClassSection))).scalars().all()
    matched_sec = next(
        (s for s in all_sections if s.section.upper() == sec_letter and (
            student.department.lower() in s.department.lower() or s.department.lower() in student.department.lower()
        )),
        None
    )
    if not matched_sec:
        # Fallback to any section with that letter
        matched_sec = next((s for s in all_sections if s.section.upper() == sec_letter), None)

    if not matched_sec:
        raise HTTPException(status_code=404, detail=f"No timetable found for student's section (Section {sec_letter}).")

    # 3. Fetch section slots
    slots_stmt = (
        select(TimetableSlot, Course, Faculty, User, Room, ClassSection)
        .outerjoin(Course, TimetableSlot.course_id == Course.id)
        .outerjoin(Faculty, TimetableSlot.faculty_id == Faculty.id)
        .outerjoin(User, Faculty.user_id == User.id)
        .outerjoin(Room, TimetableSlot.room_id == Room.id)
        .outerjoin(ClassSection, TimetableSlot.section_id == ClassSection.id)
        .where(TimetableSlot.section_id == matched_sec.id)
        .order_by(TimetableSlot.day_of_week, TimetableSlot.start_time)
    )
    raw_slots = (await db.execute(slots_stmt)).all()

    formatted_slots = []
    matrix: Dict[str, List[Optional[Dict[str, Any]]]] = {d: [None] * 6 for d in DAYS_ORDER}

    for slot, course, fac, u, room, cs in raw_slots:
        fac_name = u.name if u else (slot.faculty_id or "Faculty Member")
        clean_fac_name = re.sub(r'^[.\s,]+', '', str(fac_name)).strip()
        room_name = room.name if room else (slot.room_id or "LH-201")
        sec_name = f"Section {sec_letter}"

        slot_data = _format_slot_dict(slot, course, clean_fac_name, room_name, sec_name)
        formatted_slots.append(slot_data)

        day = slot.day_of_week
        p_idx = slot_data["periodNumber"] - 1
        if day in matrix and 0 <= p_idx < 6:
            matrix[day][p_idx] = slot_data

    # 4. Resolve current time in IST (UTC+5:30) for active lecture indicator
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    current_day_name = ist_now.strftime("%a")  # e.g. Mon, Tue, Wed...
    current_time_str = ist_now.strftime("%H:%M")

    today_slots = [s for s in formatted_slots if s["day"] == current_day_name]
    current_class = None
    for s in today_slots:
        if s["startTime"] <= current_time_str <= s["endTime"]:
            current_class = s
            break

    return {
        "student": {
            "id": student.id,
            "name": user.name,
            "rollNumber": student.roll_number,
            "email": user.email,
            "department": student.department,
            "year": student.year,
            "section": sec_letter,
            "attendanceRate": student.attendance_rate,
        },
        "section": f"Section {sec_letter}",
        "sectionCode": sec_letter,
        "department": matched_sec.department,
        "year": matched_sec.year,
        "totalWeeklyLectures": len(formatted_slots),
        "periods": STANDARD_PERIODS,
        "days": DAYS_ORDER,
        "matrix": matrix,
        "slots": formatted_slots,
        "today": current_day_name,
        "todaySchedule": today_slots,
        "currentClass": current_class,
    }


@public_timetable_router.get("/students")
async def list_students_for_autocomplete(
    search: Optional[str] = Query(None, description="Optional search filter by name or roll number"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns list of students with roll numbers and sections for fast autocomplete search.
    """
    from app.models.user import Student
    from sqlalchemy import or_

    stmt = select(Student, User).join(User, Student.user_id == User.id)
    if search and search.strip():
        q = f"%{search.strip()}%"
        stmt = stmt.where(or_(Student.roll_number.ilike(q), User.name.ilike(q)))

    res = (await db.execute(stmt.limit(50))).all()
    return [
        {
            "id": st.id,
            "name": u.name,
            "rollNumber": st.roll_number,
            "department": st.department,
            "year": st.year,
            "section": st.section,
        }
        for st, u in res
    ]


@public_timetable_router.post("/sync")
async def trigger_1click_timetable_sync(
    url: Optional[str] = Query(None, description="Optional Google Sheet CSV URL"),
    db: AsyncSession = Depends(get_db)
):
    """
    1-Click Master Timetable Re-Sync:
    Fetches the master Google Sheet CSV, parses all 72 dual-section slots, and applies updates
    directly to Section A and Section B schedules.
    """
    target_url = url.strip() if url and url.strip() else DEFAULT_MASTER_SHEET_URL
    try:
        csv_text = await fetch_sheet_csv(target_url)
        df = pd.read_csv(io.StringIO(csv_text), header=None)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch Google Sheet: {str(e)}")

    validation_res = await parse_and_validate_timetable({"S5 MINI PROJECT TIME TABLE": df}, db)
    if not validation_res.get("preview_rows"):
        raise HTTPException(status_code=400, detail="No timetable slots found in sheet.")

    apply_res = await apply_timetable_sync_rows(
        rows=validation_res["preview_rows"],
        replace_existing=True,
        actor_id="admin-1click-sync",
        actor_role="admin",
        db=db,
    )
    await db.commit()

    return {
        "success": True,
        "importedSlots": apply_res.get("imported_slots", len(validation_res["preview_rows"])),
        "sectionsAssigned": apply_res.get("sections_assigned", 2),
        "syncedAt": datetime.now(timezone.utc).isoformat(),
        "sheetUrl": target_url,
        "message": f"Successfully synchronized {apply_res.get('imported_slots', 72)} slots for Section A and Section B.",
    }

