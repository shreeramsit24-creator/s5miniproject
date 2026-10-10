import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, delete, func, text
from app.core.config import settings
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, Student, Faculty, RoleEnum
from app.models.academic import Department, Course, ClassSection, Room, TimetableSlot, SectionSubjectFaculty
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.leave import LeaveRequest, FacultyLeaveRequest
from app.models.audit import AuditLog
from app.models.settings import AdminSettings
from app.models.sheet_sync import SheetConfig


TABLES_TO_WIPE = [
    ("attendance_records", AttendanceRecord),
    ("attendance_sessions", AttendanceSession),
    ("faculty_leave_requests", FacultyLeaveRequest),
    ("leave_requests", LeaveRequest),
    ("section_subject_faculty", SectionSubjectFaculty),
    ("timetable_slots", TimetableSlot),
    ("class_sections", ClassSection),
    ("courses", Course),
    ("rooms", Room),
    ("students", Student),
    ("faculty", Faculty),
    ("audit_logs", AuditLog),
    ("sheet_configs", SheetConfig),
    ("departments", Department),
]


async def get_row_counts(db):
    """Retrieve row counts for all model tables."""
    counts = {}
    for name, model in TABLES_TO_WIPE:
        try:
            cnt = (await db.execute(select(func.count()).select_from(model))).scalar() or 0
            counts[name] = cnt
        except Exception:
            counts[name] = "N/A"
    
    try:
        user_cnt = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
        counts["users"] = user_cnt
    except Exception:
        counts["users"] = "N/A"

    try:
        settings_cnt = (await db.execute(select(func.count()).select_from(AdminSettings))).scalar() or 0
        counts["admin_settings"] = settings_cnt
    except Exception:
        counts["admin_settings"] = "N/A"

    return counts


async def wipe_all_database_data():
    target_info = settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL.split('://')[0]
    print("=" * 70)
    print(f"  SMART ATTENDANCE: FULL DATABASE WIPE & RESET")
    print(f"  Target Database: {target_info}")
    print("=" * 70)

    # 1. Check Row Counts Before
    print("\n[1/4] Checking row counts before wipe...")
    async with AsyncSessionLocal() as db:
        before_counts = await get_row_counts(db)
        for tbl, cnt in before_counts.items():
            print(f"  - {tbl:<28}: {cnt} rows")

    # 2. Perform Deep Clean
    print("\n[2/4] Wiping all data tables (foreign-key safe reverse order)...")
    async with AsyncSessionLocal() as db:
        for name, model in TABLES_TO_WIPE:
            try:
                await db.execute(delete(model))
                await db.commit()
                print(f"  - [CLEARED] Table '{name}' wiped (0 rows).")
            except Exception as e:
                await db.rollback()
                print(f"  - [NOTICE] Table '{name}': {e}")

        # Delete all non-admin users
        print("\n  - Wiping all dummy users, students, and faculty from 'users' table...")
        try:
            # Delete every user
            await db.execute(delete(User))
            await db.commit()
            print("  - [CLEARED] All user records wiped.")
        except Exception as e:
            await db.rollback()
            print(f"  - [NOTICE] Users cleanup: {e}")

    # 3. Create Clean Super Administrator and Settings
    print("\n[3/4] Initializing clean Super Administrator accounts & default settings...")
    async with AsyncSessionLocal() as db:
        # Primary institutional administrator: admin@smartattendance.edu (matches frontend UI & roster)
        admin_primary = User(
            id="usr-admin-primary",
            name="System Administrator",
            email="admin@smartattendance.edu",
            password_hash=get_password_hash("Admin@1234"),
            role=RoleEnum.ADMIN,
            department="Institutional Administration",
            phone="",
            must_change_password=False
        )
        db.add(admin_primary)

        # Alias administrator: admin@campus.edu (with admin123)
        admin_alias = User(
            id="usr-admin-alias",
            name="Campus Administrator",
            email="admin@campus.edu",
            password_hash=get_password_hash("admin123"),
            role=RoleEnum.ADMIN,
            department="Institutional Administration",
            phone="",
            must_change_password=False
        )
        db.add(admin_alias)

        await db.commit()
        print("  - [CREATED] Super Admin: admin@smartattendance.edu (Password: Admin@1234)")
        print("  - [CREATED] Super Admin: admin@campus.edu (Password: admin123)")

        # Verify/initialize clean AdminSettings
        await db.execute(delete(AdminSettings))
        await db.commit()

        new_settings = AdminSettings(
            id="institution-settings-default",
            ble_signal_range=15.0,
            ble_rssi_threshold=-75.0,
            face_confidence_threshold=85.0,
            liveness_check_enabled=True,
            auto_sync_offline=True,
            faculty_manual_override_allowed=True
        )
        db.add(new_settings)
        await db.commit()
        print("  - [INITIALIZED] Baseline institutional settings configured.")

    # 4. Final Verification of Row Counts
    print("\n[4/4] Verifying final database state...")
    async with AsyncSessionLocal() as db:
        after_counts = await get_row_counts(db)
        print("\n" + "-" * 70)
        print(f"  {'TABLE NAME':<28} | {'BEFORE':<10} | {'AFTER':<10} | STATUS")
        print("-" * 70)
        for tbl in before_counts:
            b_cnt = before_counts[tbl]
            a_cnt = after_counts.get(tbl, 0)
            status = "[CLEAN]" if a_cnt == 0 or (tbl in ("users", "admin_settings") and a_cnt <= 2) else "[CHECK]"
            print(f"  {tbl:<28} | {str(b_cnt):<10} | {str(a_cnt):<10} | {status}")
        print("-" * 70)

    # 5. Clean SQLite fallback if it exists
    sqlite_path = os.path.join(os.path.dirname(__file__), "smart_attendance.db")
    if os.path.exists(sqlite_path):
        try:
            os.remove(sqlite_path)
            print(f"\n[OK] Removed local SQLite file: {sqlite_path}")
        except Exception as e:
            print(f"\n[NOTICE] Could not remove {sqlite_path}: {e}")

    print("\n" + "=" * 70)
    print("  DATABASE IS COMPLETELY CLEAN & RESET!")
    print("  All mock/default students, faculty, courses, sections, and logs removed.")
    print("  Login with: admin@smartattendance.edu / Admin@1234")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    asyncio.run(wipe_all_database_data())
