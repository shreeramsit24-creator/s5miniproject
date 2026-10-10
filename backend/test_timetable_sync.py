import asyncio
import io
import pandas as pd

from app.services.sheet_sync import validate_and_normalize_sheet_url
from app.services.timetable_sync import (
    normalize_day,
    normalize_time_str,
    parse_grid_time_range,
    generate_timetable_csv_template,
    parse_and_validate_timetable,
    apply_timetable_sync_rows,
)
from app.core.database import AsyncSessionLocal
from app.models.academic import TimetableSlot, SectionSubjectFaculty, Course, Room, ClassSection
from app.models.user import Faculty, User
from sqlalchemy import select


def test_ssrf_and_url_normalization():
    # Valid Google Sheets URLs
    valid_pub = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSampleId123/pub?gid=0&single=true&output=csv"
    norm_pub = validate_and_normalize_sheet_url(valid_pub)
    assert "output=csv" in norm_pub

    valid_edit = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0"
    norm_edit = validate_and_normalize_sheet_url(valid_edit)
    assert "/export" in norm_edit
    assert "format=csv" in norm_edit
    assert "gid=0" in norm_edit

    # Multi-account scoped URLs (e.g. /u/0/ or /u/1/)
    valid_u0 = "https://docs.google.com/spreadsheets/u/0/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
    norm_u0 = validate_and_normalize_sheet_url(valid_u0)
    assert "/export" in norm_u0
    assert "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" in norm_u0

    # URLs without scheme (auto-prepended https://)
    no_scheme = "docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
    norm_no_scheme = validate_and_normalize_sheet_url(no_scheme)
    assert norm_no_scheme.startswith("https://")
    assert "/export" in norm_no_scheme

    # Insecure and SSRF malicious URLs
    invalid_urls = [
        "https://evil-site.com/spreadsheets/d/123",
        "https://localhost:8000/steal",
        "https://169.254.169.254/latest/meta-data/",
    ]
    for bad_url in invalid_urls:
        failed = False
        try:
            validate_and_normalize_sheet_url(bad_url)
        except ValueError:
            failed = True
        assert failed, f"Expected ValueError for {bad_url}"
    print("[OK] SSRF & URL Normalization tests passed.")



def test_time_and_day_normalization():
    assert normalize_day("monday") == "Mon"
    assert normalize_day("Mon") == "Mon"
    assert normalize_day("tuesday") == "Tue"
    assert normalize_day("Friday") == "Fri"
    assert normalize_day("Sat") == "Sat"
    assert normalize_day("Sunday") is None

    assert normalize_time_str("09:00") == "09:00"
    assert normalize_time_str("9:00") == "09:00"
    assert normalize_time_str("09:00 AM") == "09:00"
    assert normalize_time_str("1:30 PM") == "13:30"
    assert normalize_time_str("14:00") == "14:00"
    # Test dot-formatted times
    st, et = parse_grid_time_range("8.45 - 9.35 AM")
    assert st == "08:45"
    assert et == "09:35"
    print("[OK] Day and Time Normalization tests passed.")


async def test_template_and_parsing_and_collision():
    template_csv = generate_timetable_csv_template()
    assert "Period" in template_csv
    assert "Day / Timings" in template_csv

    df_template = pd.read_csv(io.StringIO(template_csv))

    async with AsyncSessionLocal() as db:
        res = await parse_and_validate_timetable(df_template, db)
        assert res["total_slots"] >= 25
        assert res["error_slots_count"] == 0
        assert len(res["preview_rows"]) >= 25
        print(f"[OK] Template parsed successfully: {res['valid_slots_count']} valid, {res['warning_slots_count']} warnings, 0 errors.")

        # Test Collision Detection
        # Inject intentional room, faculty, and section collisions on Monday 09:30 - 10:30 (overlaps 09:00 - 10:00)
        collision_csv = """Day,Start Time,End Time,Course Code,Course Name,Department,Year,Section,Faculty,Room
Mon,09:00,10:00,CS301,Machine Learning,CSE,3,A,faculty@campus.edu,LH-204
Mon,09:30,10:30,CS302,Mobile Computing,CSE,3,A,faculty@campus.edu,LH-204
"""
        df_coll = pd.read_csv(io.StringIO(collision_csv))
        res_coll = await parse_and_validate_timetable(df_coll, db)

        assert res_coll["conflict_count"] >= 3  # Room collision, faculty collision, and section collision
        conflict_types = {c["conflict_type"] for c in res_coll["conflicts"]}
        assert "room_collision" in conflict_types
        assert "faculty_collision" in conflict_types
        assert "section_collision" in conflict_types
        print(f"[OK] Collision detection successfully detected: {conflict_types}")


async def test_apply_timetable_slots():
    async with AsyncSessionLocal() as db:
        test_csv = """Day,Start Time,End Time,Course Code,Course Name,Department,Year,Section,Faculty,Room,Color
Mon,09:00,10:00,CS301,Machine Learning,Computer Science,3,A,faculty@campus.edu,LH-204,indigo
Tue,10:00,11:00,CS302,Mobile & Cloud Computing,Computer Science,3,A,anandhi@campus.edu,LH-204,emerald
"""
        df = pd.read_csv(io.StringIO(test_csv))
        preview = await parse_and_validate_timetable(df, db)
        assert preview["error_slots_count"] == 0

        # Apply timetable
        apply_res = await apply_timetable_sync_rows(
            rows=preview["preview_rows"],
            replace_existing=True,
            actor_id="usr-admin-test",
            actor_role="admin",
            db=db
        )
        assert apply_res["imported_slots"] == 2
        assert apply_res["sections_assigned"] >= 1
        assert apply_res["faculty_assigned"] >= 1

        # Verify in DB
        slots = (await db.execute(select(TimetableSlot))).scalars().all()
        assert len(slots) >= 2

        ssf = (await db.execute(select(SectionSubjectFaculty))).scalars().all()
        assert len(ssf) >= 1
        print("[OK] Apply timetable slots and SectionSubjectFaculty mapping verified successfully in DB.")


async def test_multisheet_excel_parsing():
    # 1. Create multi-sheet data with CSE and AD sheets
    cse_rows = [
        ["Period", "I", "II"],
        ["Day / Timings", "8:45 AM - 9:35 AM", "9:35 AM - 10:25 AM"],
        ["MON", "22CS301 DATABASE MANAGEMENT SYSTEMS Dr.Ramya (SEC A) (A-205)", "22CS302 COMPILER DESIGN Prof.Kumar (SEC A) (A-205)"],
        ["TUE", "22CS303 COMPUTER NETWORKS Dr.Ramya (SEC A) (A-205)", "22CS301 DATABASE MANAGEMENT SYSTEMS Dr.Ramya (SEC A) (A-205)"],
    ]
    df_cse = pd.DataFrame(cse_rows[1:], columns=cse_rows[0])

    ad_rows = [
        ["Period", "I", "II"],
        ["Day / Timings", "8:45 AM - 9:35 AM", "9:35 AM - 10:25 AM"],
        ["MON", "22AD301 ARTIFICIAL INTELLIGENCE & EXPERT SYSTEMS Mr.Stephen (SEC A) (A-201)", "22AD302 DATA SCIENCE & BIG DATA ANALYTICS Mr.Stephen (SEC A) (A-201)"],
        ["TUE", "22AD301 ARTIFICIAL INTELLIGENCE & EXPERT SYSTEMS Mr.Stephen (SEC A) (A-201)", "22AD303 DEEP LEARNING Dr.Priya (SEC A) (A-201)"],
    ]
    df_ad = pd.DataFrame(ad_rows[1:], columns=ad_rows[0])

    # Write to in-memory Excel file to test actual multi-sheet Excel file parsing
    excel_buffer = io.BytesIO()
    with pd.ExcelWriter(excel_buffer, engine="openpyxl") as writer:
        df_cse.to_excel(writer, sheet_name="CSE", index=False)
        df_ad.to_excel(writer, sheet_name="AD", index=False)
    excel_buffer.seek(0)

    # Read all sheets using pd.ExcelFile as timetable_router does
    excel_file = pd.ExcelFile(excel_buffer)
    sheets_dict = {
        s_name: pd.read_excel(excel_file, sheet_name=s_name, dtype=str)
        for s_name in excel_file.sheet_names
    }
    assert "CSE" in sheets_dict
    assert "AD" in sheets_dict

    async with AsyncSessionLocal() as db:
        res = await parse_and_validate_timetable(sheets_dict, db)
        assert res["total_slots"] == 8, f"Expected 8 slots across CSE and AD, got {res['total_slots']}"
        assert set(res["sheet_names"]) == {"CSE", "AD"}

        # Verify that CSE rows are mapped to Computer Science and Engineering
        cse_slots = [r for r in res["preview_rows"] if r["sheet_name"] == "CSE"]
        assert len(cse_slots) == 4
        for slot in cse_slots:
            assert slot["department"] == "Computer Science and Engineering"
            assert slot["section"] == "A"

        # Verify that AD rows are mapped to Artificial Intelligence and Data Science
        ad_slots = [r for r in res["preview_rows"] if r["sheet_name"] == "AD"]
        assert len(ad_slots) == 4
        for slot in ad_slots:
            assert slot["department"] == "Artificial Intelligence and Data Science"
            assert slot["section"] == "A"

        # Apply to database
        apply_res = await apply_timetable_sync_rows(
            rows=res["preview_rows"],
            replace_existing=True,
            actor_id="usr-admin-multisheet",
            actor_role="admin",
            db=db,
        )
        assert apply_res["imported_slots"] == 8
        assert apply_res["sections_assigned"] >= 2
        print(f"[OK] Multi-sheet Excel test passed! Both CSE and AD parsed and applied ({apply_res['imported_slots']} slots across {apply_res['sections_assigned']} sections).")


async def main():
    test_ssrf_and_url_normalization()
    test_time_and_day_normalization()
    await test_template_and_parsing_and_collision()
    await test_apply_timetable_slots()
    await test_multisheet_excel_parsing()
    print("\nALL TIMETABLE BACKEND TESTS PASSED!")



if __name__ == "__main__":
    asyncio.run(main())
