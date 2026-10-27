import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal, engine
from app.models.user import User, Student, Faculty
from app.models.academic import Course, ClassSection, Room
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.leave import LeaveRequest, FacultyLeaveRequest
from app.models.audit import AuditLog

async def seed_attendance_and_logs():
    print("Seeding Attendance Sessions, Records, Leaves, and Audit Logs...")
    async with AsyncSessionLocal() as db:
        # Get existing students, faculty, courses, rooms, sections
        students = (await db.execute(select(Student))).scalars().all()
        faculty_members = (await db.execute(select(Faculty))).scalars().all()
        courses = (await db.execute(select(Course))).scalars().all()
        rooms = (await db.execute(select(Room))).scalars().all()
        sections = (await db.execute(select(ClassSection))).scalars().all()

        if not students or not faculty_members or not courses or not rooms or not sections:
            print("[WARN] Prerequisite data missing. Please run seed.py first.")
            return

        primary_student = students[0]
        primary_faculty = faculty_members[0]
        primary_course = courses[0]
        primary_room = rooms[0]
        primary_section = sections[0]

        # 1. Historical & Active Attendance Sessions
        now = datetime.now(timezone.utc)
        existing_sess = (await db.execute(select(AttendanceSession))).scalars().first()
        if not existing_sess:
            sess1 = AttendanceSession(
                id="sess-hist-001",
                section_id=primary_section.id,
                course_id=primary_course.id,
                faculty_id=primary_faculty.id,
                room_id=primary_room.id,
                started_at=now - timedelta(days=1, hours=2),
                expires_at=now - timedelta(days=1, hours=1),
                status="ended",
                broadcast_power=-59.0,
                rolling_token="tok-hist-9821-ab2",
                duration_minutes=50,
                face_verification_required=True,
                capacity=60
            )
            sess2 = AttendanceSession(
                id="sess-hist-002",
                section_id=primary_section.id,
                course_id=courses[1].id if len(courses) > 1 else primary_course.id,
                faculty_id=faculty_members[1].id if len(faculty_members) > 1 else primary_faculty.id,
                room_id=rooms[1].id if len(rooms) > 1 else primary_room.id,
                started_at=now - timedelta(days=2, hours=3),
                expires_at=now - timedelta(days=2, hours=2),
                status="ended",
                broadcast_power=-59.0,
                rolling_token="tok-hist-9822-cd3",
                duration_minutes=50,
                face_verification_required=True,
                capacity=60
            )
            sess_live = AttendanceSession(
                id="sess-live-001",
                section_id=primary_section.id,
                course_id=primary_course.id,
                faculty_id=primary_faculty.id,
                room_id=primary_room.id,
                started_at=now - timedelta(minutes=15),
                expires_at=now + timedelta(minutes=35),
                status="broadcasting",
                broadcast_power=-59.0,
                rolling_token="tok-live-current-001",
                duration_minutes=50,
                face_verification_required=True,
                capacity=60
            )
            db.add_all([sess1, sess2, sess_live])
            await db.flush()

            # Add Attendance Records for each student
            rec_idx = 1
            for s in students:
                db.add(AttendanceRecord(
                    id=f"rec-att-{rec_idx:03d}",
                    session_id=sess1.id,
                    student_id=s.id,
                    marked_at=now - timedelta(days=1, hours=1, minutes=45 - rec_idx * 2),
                    confidence_score=94.5 + (rec_idx % 5),
                    method="ble+face",
                    face_verified=True,
                    marked_by="system",
                ))
                rec_idx += 1

            for s in students[:max(1, len(students) - 1)]:
                db.add(AttendanceRecord(
                    id=f"rec-att-{rec_idx:03d}",
                    session_id=sess_live.id,
                    student_id=s.id,
                    marked_at=now - timedelta(minutes=10 - (rec_idx % 5)),
                    confidence_score=96.2,
                    method="ble+face",
                    face_verified=True,
                    marked_by="system",
                ))
                rec_idx += 1
            print("[OK] Attendance Sessions and verified student records created.")

        # 2. Student Leave Requests
        existing_leave = (await db.execute(select(LeaveRequest))).scalars().first()
        if not existing_leave:
            db.add(LeaveRequest(
                id="lv-req-001",
                student_id=primary_student.id,
                mentor_id=primary_faculty.id,
                leave_type="On-Duty (OD)",
                start_date=(now + timedelta(days=1)).strftime("%Y-%m-%d"),
                start_session="FN",
                end_date=(now + timedelta(days=2)).strftime("%Y-%m-%d"),
                end_session="AN",
                days_count=2.0,
                is_half_day=False,
                reason="Smart India Hackathon Grand Finale participation representing college AI team.",
                status="pending",
                review_comment="Under mentor review",
                applied_at=now - timedelta(hours=3)
            ))
            if len(students) > 1:
                db.add(LeaveRequest(
                    id="lv-req-002",
                    student_id=students[1].id,
                    mentor_id=primary_faculty.id,
                    leave_type="Academic / Conference",
                    start_date=(now - timedelta(days=3)).strftime("%Y-%m-%d"),
                    start_session="FN",
                    end_date=(now - timedelta(days=3)).strftime("%Y-%m-%d"),
                    end_session="AN",
                    days_count=1.0,
                    is_half_day=False,
                    reason="IEEE International Conference oral presentation on Edge Neural Architectures.",
                    status="approved",
                    review_comment="Approved with full OD attendance credit.",
                    applied_at=now - timedelta(days=4)
                ))
            print("[OK] Student Leave Requests created.")

        # 3. Faculty Leave Requests
        existing_fac_leave = (await db.execute(select(FacultyLeaveRequest))).scalars().first()
        if not existing_fac_leave:
            db.add(FacultyLeaveRequest(
                id="fac-lv-001",
                faculty_id=primary_faculty.id,
                substitute_faculty_id=faculty_members[1].id if len(faculty_members) > 1 else None,
                leave_type="Academic / Conference",
                start_date=(now + timedelta(days=4)).strftime("%Y-%m-%d"),
                start_session="FN",
                end_date=(now + timedelta(days=5)).strftime("%Y-%m-%d"),
                end_session="AN",
                days_count=2.0,
                is_half_day=False,
                reason="Keynote Speaker at National AI & IoT Summit, IIT Madras.",
                status="pending",
                review_comment="Substitute assigned and confirmed.",
                affected_subjects_json='["22IT305 - Full Stack Web Development", "22IT302 - Database Management Systems"]',
                applied_at=now - timedelta(hours=6)
            ))
            print("[OK] Faculty Leave Requests created.")

        # 4. Audit Logs
        existing_audit = (await db.execute(select(AuditLog))).scalars().first()
        if not existing_audit:
            audit_events = [
                ("usr-admin-1", "Super Admin", "system_init", "Institution Config", {"version": "2.4.0", "status": "nominal"}),
                ("usr-27d78211", "Faculty", "broadcast_started", "Room LH-204", {"course": "22IT305", "beacon": "room-lh-204"}),
                ("usr-admin-1", "Super Admin", "beacon_power_adjusted", "Room LH-201", {"txPower": -12, "tier": "Classroom (15m)"}),
                ("usr-admin-1", "Super Admin", "roster_imported", "ClassSection IT-3A", {"imported": 6, "source": "Excel"}),
                ("usr-27d78211", "Faculty", "leave_approved", "LeaveRequest lv-req-002", {"status": "approved", "credit": "OD"}),
                ("usr-stu-8df39371", "Student", "face_biometric_enrolled", "Biometric Vault", {"status": "enrolled", "confidence": 98.4}),
            ]
            for a_idx, (act_id, act_role, act_type, target, meta) in enumerate(audit_events):
                db.add(AuditLog(
                    id=f"audit-{a_idx+1:03d}",
                    actor_id=act_id,
                    actor_role=act_role,
                    action_type=act_type,
                    target_entity=target,
                    metadata_json=meta,
                    ip_address="127.0.0.1 (Localhost Gateway)",
                    created_at=now - timedelta(hours=8 - a_idx)
                ))
            print("[OK] Audit Logs created.")

        await db.commit()
    print("[SUCCESS] All tables populated with comprehensive default institutional data!")

if __name__ == "__main__":
    asyncio.run(seed_attendance_and_logs())
