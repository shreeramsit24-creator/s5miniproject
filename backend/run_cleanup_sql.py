import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, delete, func
from app.core.database import AsyncSessionLocal
from app.models.academic import Course, ClassSection, TimetableSlot, SectionSubjectFaculty
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.leave import LeaveRequest, FacultyLeaveRequest
from app.models.user import User, Student, Faculty, RoleEnum

async def execute_cleanup():
    print("--- Executing Supabase Dummy Data Cleanup via SQLAlchemy ---")
    async with AsyncSessionLocal() as session:
        # 1. Identify demo users to delete
        demo_users_stmt = select(User).where(
            User.email.like("%@campus.edu"),
            User.role != RoleEnum.ADMIN
        )
        demo_users = (await session.execute(demo_users_stmt)).scalars().all()
        demo_user_ids = [u.id for u in demo_users]
        print(f"Found {len(demo_users)} demo users to purge: {[u.email for u in demo_users]}")

        if demo_user_ids:
            # Find associated student IDs and faculty IDs
            demo_stu_stmt = select(Student.id).where(Student.user_id.in_(demo_user_ids))
            demo_stu_ids = (await session.execute(demo_stu_stmt)).scalars().all()

            demo_fac_stmt = select(Faculty.id).where(Faculty.user_id.in_(demo_user_ids))
            demo_fac_ids = (await session.execute(demo_fac_stmt)).scalars().all()

            print(f"Associated student records: {len(demo_stu_ids)}, faculty records: {len(demo_fac_ids)}")

            # 2. Delete attendance records for these demo students or faculty sessions
            if demo_stu_ids:
                await session.execute(delete(AttendanceRecord).where(AttendanceRecord.student_id.in_(demo_stu_ids)))
                await session.execute(delete(LeaveRequest).where(LeaveRequest.student_id.in_(demo_stu_ids)))

            if demo_fac_ids:
                # Find sessions created by demo faculty
                fac_sess_stmt = select(AttendanceSession.id).where(AttendanceSession.faculty_id.in_(demo_fac_ids))
                fac_sess_ids = (await session.execute(fac_sess_stmt)).scalars().all()
                if fac_sess_ids:
                    await session.execute(delete(AttendanceRecord).where(AttendanceRecord.session_id.in_(fac_sess_ids)))
                    await session.execute(delete(AttendanceSession).where(AttendanceSession.id.in_(fac_sess_ids)))

                await session.execute(delete(FacultyLeaveRequest).where(FacultyLeaveRequest.faculty_id.in_(demo_fac_ids)))
                await session.execute(delete(SectionSubjectFaculty).where(SectionSubjectFaculty.faculty_id.in_(demo_fac_ids)))

            # 3. Delete student and faculty rows
            if demo_stu_ids:
                await session.execute(delete(Student).where(Student.id.in_(demo_stu_ids)))
            if demo_fac_ids:
                await session.execute(delete(Faculty).where(Faculty.id.in_(demo_fac_ids)))

            # 4. Delete demo users
            await session.execute(delete(User).where(User.id.in_(demo_user_ids)))

        # 5. Remove legacy demo courses (CS301 Machine Learning & CS302 Mobile & Cloud Computing)
        await session.execute(
            delete(Course).where(Course.id.in_(["crs-cs301-7e6d", "crs-cs302-91b6"]))
        )

        await session.commit()
        print("[SUCCESS] Commit completed.")

        # Post-cleanup counts
        users_count = (await session.execute(select(func.count(User.id)))).scalar()
        slots_count = (await session.execute(select(func.count(TimetableSlot.id)))).scalar()
        courses_count = (await session.execute(select(func.count(Course.id)))).scalar()

        print(f"\n--- Post-Cleanup Verification ---")
        print(f"Total remaining users: {users_count}")
        print(f"Total preserved timetable slots: {slots_count} (Expected 76)")
        print(f"Total preserved courses: {courses_count}")

        print("\n--- Preserved Users in Database ---")
        users = (await session.execute(select(User))).scalars().all()
        for u in users:
            print(f"  - {u.email} ({u.role}) : {u.name}")

if __name__ == "__main__":
    asyncio.run(execute_cleanup())
