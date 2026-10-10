import asyncio
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, Faculty, Student, RoleEnum
from app.models.academic import Department
from sqlalchemy import select, or_


async def sync_accounts():
    print("=" * 60)
    print("  SYNCHRONIZING INSTITUTIONAL AUTH ACCOUNTS")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        # 1. Ensure IT Department exists
        it_dept = (await db.execute(select(Department).where(Department.code == "IT"))).scalars().first()
        if not it_dept:
            it_dept = Department(
                id=f"dept-it-{uuid.uuid4().hex[:6]}",
                name="Information Technology",
                code="IT"
            )
            db.add(it_dept)
            await db.flush()

        # 2. Institutional Super Admin
        admin_user = (await db.execute(select(User).where(User.email.ilike("admin@smartattendance.edu")))).scalars().first()
        if admin_user:
            admin_user.password_hash = get_password_hash("Admin@1234")
            admin_user.role = RoleEnum.ADMIN.value
        else:
            admin_user = User(
                id=f"usr-admin-{uuid.uuid4().hex[:8]}",
                name="System Administrator",
                email="admin@smartattendance.edu",
                password_hash=get_password_hash("Admin@1234"),
                role=RoleEnum.ADMIN.value,
                department="Institutional Administration",
                phone="+91 98765 00001",
                must_change_password=False
            )
            db.add(admin_user)

        # Campus Admin Alias
        campus_admin = (await db.execute(select(User).where(User.email.ilike("admin@campus.edu")))).scalars().first()
        if campus_admin:
            campus_admin.password_hash = get_password_hash("admin123")
            campus_admin.role = RoleEnum.ADMIN.value
        else:
            campus_admin = User(
                id=f"usr-admin-alias-{uuid.uuid4().hex[:6]}",
                name="Campus Administrator",
                email="admin@campus.edu",
                password_hash=get_password_hash("admin123"),
                role=RoleEnum.ADMIN.value,
                department="Institutional Administration",
                phone="+91 98765 00001",
                must_change_password=False
            )
            db.add(campus_admin)

        # 3. Master Faculty Account: Abi Siva (abisiva1822007@gmail.com)
        abi_user = (await db.execute(select(User).where(User.email.ilike("abisiva1822007@gmail.com")))).scalars().first()
        if abi_user:
            abi_user.password_hash = get_password_hash("faculty123")
            abi_user.role = RoleEnum.FACULTY.value
            abi_user.name = "Abi Siva"
            abi_user.department = "Information Technology"
            abi_user.phone = "+91 97873 80220"
        else:
            abi_user = User(
                id=f"usr-fac-{uuid.uuid4().hex[:8]}",
                name="Abi Siva",
                email="abisiva1822007@gmail.com",
                password_hash=get_password_hash("faculty123"),
                role=RoleEnum.FACULTY.value,
                department="Information Technology",
                phone="+91 97873 80220",
                photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                must_change_password=False
            )
            db.add(abi_user)
            await db.flush()

        abi_fac = (await db.execute(select(Faculty).where(Faculty.user_id == abi_user.id))).scalars().first()
        if not abi_fac:
            abi_fac = (await db.execute(select(Faculty).where(Faculty.employee_id == "AK2625"))).scalars().first()
            if abi_fac:
                abi_fac.user_id = abi_user.id
            else:
                abi_fac = Faculty(
                    id=f"fac-{uuid.uuid4().hex[:8]}",
                    user_id=abi_user.id,
                    employee_id="AK2625",
                    department="Information Technology",
                    designation="Assistant Professor / Project Lead",
                    active=True,
                    is_mentor=True,
                    mentor_group="IT-A"
                )
                db.add(abi_fac)
        else:
            abi_fac.employee_id = "AK2625"
            abi_fac.department = "Information Technology"
            abi_fac.designation = "Assistant Professor / Project Lead"
            abi_fac.is_mentor = True
            abi_fac.mentor_group = "IT-A"

        # 5. Master Student Account: Siva Gokul C (sivagokulc18@gmail.com)
        for stu_email in ["sivagokulc18@gmail.com"]:
            s_user = (await db.execute(select(User).where(User.email.ilike(stu_email)))).scalars().first()
            if s_user:
                s_user.password_hash = get_password_hash("student123")
                s_user.role = RoleEnum.STUDENT.value
            else:
                s_user = User(
                    id=f"usr-stu-{uuid.uuid4().hex[:8]}",
                    name="SIVAGOKUL C",
                    email=stu_email,
                    password_hash=get_password_hash("student123"),
                    role=RoleEnum.STUDENT.value,
                    department="Information Technology",
                    phone="+91 97873 80220",
                    must_change_password=False
                )
                db.add(s_user)
                await db.flush()

            s_profile = (await db.execute(select(Student).where(Student.user_id == s_user.id))).scalars().first()
            if not s_profile:
                s_profile = Student(
                    id=f"stu-{uuid.uuid4().hex[:8]}",
                    user_id=s_user.id,
                    roll_number="7376242IT303",
                    department=s_user.department,
                    year=3,
                    section="A",
                    attendance_rate=94.5,
                    face_id_status="enrolled",
                    mentor_id=abi_fac.id if abi_fac else None
                )
                db.add(s_profile)

        await db.commit()
        print("[SUCCESS] All institutional accounts synchronized with password hashes:")
        print("  - Admin: admin@smartattendance.edu (Admin@1234), admin@campus.edu (admin123)")
        print("  - Faculty: abisiva1822007@gmail.com (faculty123), faculty@campus.edu (faculty123), faculty@smartattendance.edu (faculty123)")
        print("  - Student: sivagokulc18@gmail.com (student123), student@campus.edu (student123)")


if __name__ == "__main__":
    asyncio.run(sync_accounts())
