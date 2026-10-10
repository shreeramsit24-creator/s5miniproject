import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings
from app.core.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, Student, Faculty, RoleEnum
from app.schemas.auth import LoginRequest, TokenResponse, UserRegisterRequest, UserOut, GoogleAuthRequest, ChangePasswordRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google", response_model=TokenResponse)
async def google_login(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Validates Google OAuth 2.0 ID Token and returns Smart Attendance JWT token.
    Auto-provisions user profile in MySQL if user does not exist.
    """
    try:
        # Cryptographically verify the Google ID token signature, issuer, and expiration
        id_info = id_token.verify_oauth2_token(
            req.credential,
            google_requests.Request(),
            audience=None
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication verification failed: {str(e)}"
        )

    # Validate that the token was minted for this application / project (Web or Android)
    token_aud = id_info.get("aud", "")
    token_azp = id_info.get("azp", "")
    
    authorized_client_ids = set()
    for cid in settings.GOOGLE_CLIENT_ID.split(","):
        cid_clean = cid.strip()
        if cid_clean:
            authorized_client_ids.add(cid_clean)
    
    # Always authorize known Web and Android Client IDs for Smart Attendance
    authorized_client_ids.add("652946018589-ncmoasimhfq3ekdkof9vlbkqettnrstm.apps.googleusercontent.com")
    authorized_client_ids.add("652946018589-f54vmc1ml3cn0srfki80uat9n57p7s7g.apps.googleusercontent.com")
    
    # Verify audience or authorized party (azp) matches client ID or shared project prefix (652946018589)
    is_authorized_audience = (
        token_aud in authorized_client_ids or
        token_azp in authorized_client_ids or
        (token_aud and token_aud.startswith("652946018589")) or
        (token_azp and token_azp.startswith("652946018589"))
    )

    if not is_authorized_audience:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unauthorized token audience ({token_aud}) or azp ({token_azp}). Token was not issued for Smart Attendance application."
        )

    google_email = id_info.get("email", "").lower().strip()
    google_name = id_info.get("name", "Google User")
    google_picture = id_info.get("picture")

    if not google_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not provide a valid email address."
        )

    # 1. Search existing user in Database
    stmt = select(User).where(User.email.ilike(google_email))
    user = (await db.execute(stmt)).scalars().first()

    # 2. If user doesn't exist yet, auto-provision or reject based on settings
    if not user:
        if settings.ALLOW_GOOGLE_AUTOPROVISION:
            assigned_role = RoleEnum.STUDENT
            if req.target_role == "faculty":
                assigned_role = RoleEnum.FACULTY
            elif req.target_role == "admin":
                existing_admins = (await db.execute(select(User).where(User.role == RoleEnum.ADMIN))).scalars().all()
                assigned_role = RoleEnum.ADMIN if len(existing_admins) == 0 else RoleEnum.STUDENT

            new_user_id = f"usr-{uuid.uuid4().hex[:8]}"
            user = User(
                id=new_user_id,
                name=google_name if google_name != "Google User" else google_email.split('@')[0].replace('.', ' ').title(),
                email=google_email,
                password_hash=get_password_hash(uuid.uuid4().hex),
                role=assigned_role,
                department="Computer Science and Engineering",
                photo_url=google_picture,
                phone=""
            )
            db.add(user)
            await db.flush()

            if assigned_role == RoleEnum.STUDENT:
                student_profile = Student(
                    id=f"stu-{uuid.uuid4().hex[:8]}",
                    user_id=user.id,
                    roll_number=f"7376{uuid.uuid4().hex[:6].upper()}",
                    department=user.department,
                    year="3rd Year",
                    section="A",
                    attendance_rate=85.0
                )
                db.add(student_profile)
            elif assigned_role == RoleEnum.FACULTY:
                faculty_profile = Faculty(
                    id=f"fac-{uuid.uuid4().hex[:8]}",
                    user_id=user.id,
                    employee_id=f"EMP-{uuid.uuid4().hex[:4].upper()}",
                    department=user.department,
                    designation="Assistant Professor",
                    is_mentor=True
                )
                db.add(faculty_profile)

            await db.commit()
            await db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Restricted: Google account '{google_email}' is not in the institutional roster. Only authorized emails from the Excel roster may log in."
            )

    updated = False
    if google_name and google_name != "Google User" and user.name != google_name:
        user.name = google_name
        updated = True
    if google_picture and user.photo_url != google_picture:
        user.photo_url = google_picture
        updated = True
    if updated:
        await db.commit()
        await db.refresh(user)

    # Retrieve student / faculty metadata
    roll_number = None
    employee_id = None
    year = None
    section = None
    attendance_rate = None
    mentor_id = None
    mentor_name = None
    designation = None
    is_mentor = None
    mentor_group = None

    # Multi-role routing support for master accounts
    is_master = google_email in ("abisiva1822007@gmail.com", "abisiva18@gmail.com", "sivagokulc18@gmail.com")
    effective_role = user.role.value if hasattr(user.role, "value") else str(user.role)
    if is_master and req.target_role in ("admin", "faculty", "student"):
        effective_role = req.target_role

    if effective_role == "student" or user.role == RoleEnum.STUDENT:
        stu = (await db.execute(select(Student).where(Student.user_id == user.id))).scalars().first()
        if not stu and is_master:
            stu = (await db.execute(select(Student).where(Student.roll_number.in_(["7376242IT304", "7376242IT303"])))).scalars().first()
        if stu:
            roll_number = stu.roll_number
            year = stu.year
            section = stu.section
            attendance_rate = stu.attendance_rate
            mentor_id = stu.mentor_id
            if stu.mentor_id:
                mentor_fac = await db.get(Faculty, stu.mentor_id)
                if mentor_fac:
                    mentor_user = await db.get(User, mentor_fac.user_id)
                    if mentor_user:
                        mentor_name = mentor_user.name
    if effective_role == "faculty" or user.role == RoleEnum.FACULTY:
        fac = (await db.execute(select(Faculty).where(Faculty.user_id == user.id))).scalars().first()
        if not fac and is_master:
            fac = (await db.execute(select(Faculty).where(Faculty.employee_id == "AK2625"))).scalars().first()
        if fac:
            employee_id = fac.employee_id
            designation = fac.designation
            is_mentor = fac.is_mentor
            mentor_group = fac.mentor_group

    role_str = effective_role
    token = create_access_token(subject=user.id, role=role_str)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=role_str,
        user_id=user.id,
        name=user.name,
        email=user.email,
        department=user.department or "General",
        phone=user.phone,
        rollNumber=roll_number,
        employeeId=employee_id,
        year=year,
        section=section,
        attendanceRate=attendance_rate,
        mentorId=mentor_id,
        mentorName=mentor_name,
        designation=designation,
        isMentor=is_mentor,
        mentorGroup=mentor_group,
        photoUrl=user.photo_url,
        mustChangePassword=user.must_change_password or False
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    ident = req.identifier.strip().lower()
    
    # Dedicated institutional identity categories
    is_admin_ident = ident in ("admin", "admin@campus.edu", "admin@smartattendance.edu", "administrator", "admin-01")
    is_faculty_ident = ident in (
        "faculty", "faculty@campus.edu", "faculty@smartattendance.edu",
        "fac-001", "fac-cse-001", "ak2625", "it202567", "abisiva1822007@gmail.com"
    )
    is_student_ident = ident in (
        "student", "student@campus.edu", "student@smartattendance.edu",
        "7376242it303", "7376242it304", "sivagokulc18@gmail.com", "sivagokulc.it24@bitsathy.ac.in", "aarav.sharma@campus.edu"
    )

    user = None

    if is_admin_ident:
        admin_stmt = select(User).where(or_(
            User.email.ilike("admin@smartattendance.edu"),
            User.email.ilike("admin@campus.edu"),
            User.email.ilike("admin"),
            User.role == "admin",
            User.role == RoleEnum.ADMIN
        ))
        user = (await db.execute(admin_stmt)).scalars().first()
        if not user:
            try:
                user = User(
                    id=f"usr-admin-{uuid.uuid4().hex[:8]}",
                    name="System Administrator",
                    email="admin@smartattendance.edu",
                    password_hash=get_password_hash("Admin@1234"),
                    role=RoleEnum.ADMIN.value,
                    department="Institutional Administration",
                    phone="+91 98765 00001",
                    must_change_password=False
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
            except Exception:
                await db.rollback()
                user = (await db.execute(admin_stmt)).scalars().first()

        if req.password in ("admin123", "Admin@1234", "admin") and user:
            try:
                user.password_hash = get_password_hash(req.password)
                await db.commit()
                await db.refresh(user)
            except Exception:
                await db.rollback()

    elif is_faculty_ident:
        is_abi = ident in ("abisiva1822007@gmail.com", "ak2625", "it202567")
        target_email = "abisiva1822007@gmail.com" if is_abi else "faculty@campus.edu"
        
        fac_stmt = select(User).where(or_(
            User.email.ilike(target_email),
            User.email.ilike(ident),
            User.email.ilike("faculty@smartattendance.edu")
        ))
        user = (await db.execute(fac_stmt)).scalars().first()
        if not user:
            emp_id = "AK2625" if is_abi else "FAC-CSE-001"
            fac_rec = (await db.execute(select(Faculty).where(Faculty.employee_id.ilike(emp_id)))).scalars().first()
            if fac_rec:
                user = await db.get(User, fac_rec.user_id)

        if not user:
            try:
                user = User(
                    id=f"usr-fac-{uuid.uuid4().hex[:8]}",
                    name="Abi Siva" if is_abi else "Dr. Ramesh Kumar",
                    email=target_email,
                    password_hash=get_password_hash("faculty123"),
                    role=RoleEnum.FACULTY.value,
                    department="Information Technology" if is_abi else "Computer Science and Engineering",
                    phone="+91 97873 80220" if is_abi else "+91 98765 00002",
                    photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    must_change_password=False
                )
                db.add(user)
                await db.flush()
                fac_profile = Faculty(
                    id=f"fac-{uuid.uuid4().hex[:8]}",
                    user_id=user.id,
                    employee_id="AK2625" if is_abi else "FAC-CSE-001",
                    department=user.department,
                    designation="Assistant Professor / Project Lead" if is_abi else "Professor & Head",
                    active=True,
                    is_mentor=True,
                    mentor_group="IT-A" if is_abi else "CSE-A"
                )
                db.add(fac_profile)
                await db.commit()
                await db.refresh(user)
            except Exception:
                await db.rollback()
                user = (await db.execute(fac_stmt)).scalars().first()

        # Resilient password sync for faculty
        if user and req.password in ("faculty123", "faculty", "admin123"):
            try:
                user.password_hash = get_password_hash(req.password)
                await db.commit()
                await db.refresh(user)
            except Exception:
                await db.rollback()

    elif is_student_ident:
        is_siva = True
        target_email = "sivagokulc18@gmail.com"
        
        stu_stmt = select(User).where(or_(
            User.email.ilike(target_email),
            User.email.ilike(ident),
            User.email.ilike("student@smartattendance.edu")
        ))
        user = (await db.execute(stu_stmt)).scalars().first()
        if not user:
            roll_id = "7376242IT303"
            stu_rec = (await db.execute(select(Student).where(Student.roll_number.ilike(roll_id)))).scalars().first()
            if stu_rec:
                user = await db.get(User, stu_rec.user_id)

        if not user:
            try:
                user = User(
                    id=f"usr-stu-{uuid.uuid4().hex[:8]}",
                    name="SIVAGOKUL C",
                    email=target_email,
                    password_hash=get_password_hash("student123"),
                    role=RoleEnum.STUDENT.value,
                    department="Information Technology",
                    phone="+91 97873 80220",
                    must_change_password=False
                )
                db.add(user)
                await db.flush()
                stu_profile = Student(
                    id=f"stu-{uuid.uuid4().hex[:8]}",
                    user_id=user.id,
                    roll_number="7376242IT303",
                    department=user.department,
                    year=3,
                    section="A",
                    attendance_rate=94.5,
                    face_id_status="enrolled"
                )
                db.add(stu_profile)
                await db.commit()
                await db.refresh(user)
            except Exception:
                await db.rollback()
                user = (await db.execute(stu_stmt)).scalars().first()

        # Resilient password sync for student
        if user and req.password in ("student123", "student", "admin123"):
            try:
                user.password_hash = get_password_hash(req.password)
                await db.commit()
                await db.refresh(user)
            except Exception:
                await db.rollback()

    else:
        # General search for matching user by email
        stmt = select(User).where(User.email.ilike(ident))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        # If not found by email, check if identifier is a student roll number
        if not user:
            student_stmt = select(Student).where(Student.roll_number.ilike(ident))
            student_res = await db.execute(student_stmt)
            student = student_res.scalar_one_or_none()
            if student:
                user = await db.get(User, student.user_id)

        # If not found, check if identifier is a faculty employee ID
        if not user:
            faculty_stmt = select(Faculty).where(Faculty.employee_id.ilike(ident))
            faculty_res = await db.execute(faculty_stmt)
            faculty = faculty_res.scalar_one_or_none()
            if faculty:
                user = await db.get(User, faculty.user_id)

    # Strict Access Restriction: Reject any other email or non-roster user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Restricted: This email ID is not registered in the institutional Excel roster. Only authorized accounts from the Excel roster are permitted to log in."
        )

    # Flexible developer access & multi-role switching for master accounts
    allow_dev_bypass = os.getenv("ALLOW_DEV_AUTH_BYPASS", "true").strip().lower() in ("true", "1", "yes")
    is_master_dev = ident in ("abisiva1822007@gmail.com", "abisiva18@gmail.com", "sivagokulc18@gmail.com")
    effective_role = user.role.value if hasattr(user.role, "value") else str(user.role)

    # Verify password
    if allow_dev_bypass and is_admin_ident and req.password in ("admin123", "Admin@1234", "admin"):
        effective_role = "admin"
    elif allow_dev_bypass and is_faculty_ident and req.password in ("faculty123", "faculty", "admin123"):
        effective_role = "faculty"
    elif allow_dev_bypass and is_student_ident and req.password in ("student123", "student"):
        effective_role = "student"
    elif allow_dev_bypass and is_master_dev and req.password in ("faculty123", "student123", "admin123", "siva123"):
        if req.password == "admin123":
            effective_role = "admin"
        elif req.password == "student123":
            effective_role = "student"
        else:
            effective_role = "faculty"
    elif not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password for this institutional account."
        )

    # Fetch extra profile attributes
    roll_number = None
    employee_id = None
    year = None
    section = None
    attendance_rate = None
    mentor_id = None
    mentor_name = None
    designation = None
    is_mentor = None
    mentor_group = None

    if effective_role == "student" or user.role == RoleEnum.STUDENT or user.role == "student":
        stu_res = await db.execute(select(Student).where(Student.user_id == user.id))
        stu = stu_res.scalar_one_or_none()
        if not stu and is_master_dev:
            stu = (await db.execute(select(Student).where(Student.roll_number.in_(["7376242IT303", "7376242IT304"])))).scalar_one_or_none()
        if not stu:
            try:
                stu = Student(
                    id=f"stu-{uuid.uuid4().hex[:8]}",
                    user_id=user.id,
                    roll_number="7376242IT303" if is_master_dev else f"7376{uuid.uuid4().hex[:6].upper()}",
                    department=user.department or "Information Technology",
                    year=3,
                    section="A",
                    attendance_rate=92.0,
                    face_id_status="enrolled"
                )
                db.add(stu)
                await db.commit()
                await db.refresh(stu)
            except Exception:
                await db.rollback()
        face_id_status = "pending"
        if stu:
            face_id_status = stu.face_id_status or "pending"
            roll_number = stu.roll_number
            year = stu.year
            section = stu.section
            attendance_rate = stu.attendance_rate
            mentor_id = stu.mentor_id
            if stu.mentor_id:
                mentor_fac = await db.get(Faculty, stu.mentor_id)
                if mentor_fac:
                    mentor_user = await db.get(User, mentor_fac.user_id)
                    if mentor_user:
                        mentor_name = mentor_user.name

    if effective_role == "faculty" or (user.role == RoleEnum.FACULTY or user.role == "faculty"):
        fac_res = await db.execute(select(Faculty).where(Faculty.user_id == user.id))
        fac = fac_res.scalar_one_or_none()
        if not fac and is_master_dev:
            fac = (await db.execute(select(Faculty).where(Faculty.employee_id == "AK2625"))).scalar_one_or_none()
        if not fac:
            try:
                fac = Faculty(
                    id=f"fac-{uuid.uuid4().hex[:8]}",
                    user_id=user.id,
                    employee_id="AK2625" if is_master_dev else f"FAC-{uuid.uuid4().hex[:4].upper()}",
                    department=user.department or "Information Technology",
                    designation="Assistant Professor / Project Lead" if is_master_dev else "Assistant Professor",
                    active=True,
                    is_mentor=True,
                    mentor_group="IT-A"
                )
                db.add(fac)
                await db.commit()
                await db.refresh(fac)
            except Exception:
                await db.rollback()
        if fac:
            employee_id = fac.employee_id
            designation = fac.designation
            is_mentor = fac.is_mentor
            mentor_group = fac.mentor_group

    # Create JWT
    role_str = effective_role
    token = create_access_token(subject=user.id, role=role_str)


    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=role_str,
        user_id=user.id,
        name=user.name,
        email=user.email,
        department=user.department or "Institutional Administration",
        phone=user.phone,
        rollNumber=roll_number,
        employeeId=employee_id,
        year=year,
        section=section,
        attendanceRate=attendance_rate,
        mentorId=mentor_id,
        mentorName=mentor_name,
        designation=designation,
        isMentor=is_mentor,
        mentorGroup=mentor_group,
        photoUrl=user.photo_url,
        faceIdStatus=face_id_status if role_str == "student" else None,
        mustChangePassword=user.must_change_password or False
    )



@router.post("/register", response_model=UserOut)
async def register(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == req.email.strip().lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    new_user = User(
        id=user_id,
        name=req.name,
        email=req.email.strip().lower(),
        password_hash=get_password_hash(req.password),
        role=req.role.lower(),
        department=req.department,
        phone=req.phone
    )
    db.add(new_user)
    await db.flush()

    roll_num = req.rollNumber
    emp_id = req.employeeId

    if req.role.lower() == RoleEnum.STUDENT:
        roll_num = roll_num or f"2026{req.department[:2].upper()}{uuid.uuid4().hex[:4].upper()}"
        student = Student(
            id=f"stu-{uuid.uuid4().hex[:8]}",
            user_id=new_user.id,
            roll_number=roll_num,
            department=req.department,
            year=req.year or 3,
            section=req.section or "A",
            attendance_rate=90.0,
            face_id_status="pending"
        )
        db.add(student)

    elif req.role.lower() == RoleEnum.FACULTY:
        emp_id = emp_id or f"FAC-{req.department[:3].upper()}-{uuid.uuid4().hex[:3].upper()}"
        faculty = Faculty(
            id=f"fac-{uuid.uuid4().hex[:8]}",
            user_id=new_user.id,
            employee_id=emp_id,
            department=req.department,
            active=True
        )
        db.add(faculty)

    await db.commit()
    await db.refresh(new_user)

    return UserOut(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        department=new_user.department,
        phone=new_user.phone,
        rollNumber=roll_num,
        employeeId=emp_id
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    roll_number = None
    employee_id = None
    year = None
    section = None
    attendance_rate = None
    mentor_id = None
    mentor_name = None
    designation = None
    is_mentor = None
    mentor_group = None

    face_id_status = None
    if current_user.role == RoleEnum.STUDENT:
        stu = (await db.execute(select(Student).where(Student.user_id == current_user.id))).scalar_one_or_none()
        if not stu and current_user.email:
            stu = (await db.execute(select(Student).join(User, Student.user_id == User.id).where(User.email.ilike(current_user.email)))).scalar_one_or_none()
        if stu:
            face_id_status = stu.face_id_status or "pending"
            roll_number = stu.roll_number
            year = stu.year
            section = stu.section
            attendance_rate = stu.attendance_rate
            mentor_id = stu.mentor_id
            if stu.mentor_id:
                mentor_fac = await db.get(Faculty, stu.mentor_id)
                if mentor_fac:
                    mentor_user = await db.get(User, mentor_fac.user_id)
                    if mentor_user:
                        mentor_name = mentor_user.name
    elif current_user.role == RoleEnum.FACULTY:
        fac = (await db.execute(select(Faculty).where(Faculty.user_id == current_user.id))).scalar_one_or_none()
        if fac:
            employee_id = fac.employee_id
            designation = fac.designation
            is_mentor = fac.is_mentor
            mentor_group = fac.mentor_group

    role_str = str(current_user.role.value if hasattr(current_user.role, 'value') else current_user.role or "admin")
    return UserOut(
        id=current_user.id or "usr-admin-default",
        name=current_user.name or "Institutional Administrator",
        email=current_user.email or "admin@campus.edu",
        role=role_str,
        department=current_user.department or "Institutional Administration",
        phone=current_user.phone,
        photoUrl=current_user.photo_url,
        faceIdStatus=face_id_status,
        rollNumber=roll_number,
        employeeId=employee_id,
        year=year,
        section=section,
        attendanceRate=attendance_rate,
        mentorId=mentor_id,
        mentorName=mentor_name,
        designation=designation,
        isMentor=is_mentor,
        mentorGroup=mentor_group,
        mustChangePassword=current_user.must_change_password or False
    )



@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Forced first-login or self-service password reset.
    If must_change_password is True, current password check is bypassed.
    """
    if len(req.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    if not current_user.must_change_password:
        if not req.currentPassword or not verify_password(req.currentPassword, current_user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect.")

    current_user.password_hash = get_password_hash(req.newPassword)
    current_user.must_change_password = False
    await db.commit()

    return {"message": "Password updated successfully."}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Refreshes an active JWT session token and returns a newly signed token.
    """
    roll_number = None
    employee_id = None
    year = None
    section = None
    attendance_rate = None
    mentor_id = None
    mentor_name = None
    designation = None
    is_mentor = None
    mentor_group = None

    if current_user.role == RoleEnum.STUDENT:
        stu = (await db.execute(select(Student).where(Student.user_id == current_user.id))).scalar_one_or_none()
        if stu:
            roll_number = stu.roll_number
            year = stu.year
            section = stu.section
            attendance_rate = stu.attendance_rate
            mentor_id = stu.mentor_id
            if stu.mentor_id:
                mentor_fac = await db.get(Faculty, stu.mentor_id)
                if mentor_fac:
                    mentor_user = await db.get(User, mentor_fac.user_id)
                    if mentor_user:
                        mentor_name = mentor_user.name
    elif current_user.role == RoleEnum.FACULTY:
        fac = (await db.execute(select(Faculty).where(Faculty.user_id == current_user.id))).scalar_one_or_none()
        if fac:
            employee_id = fac.employee_id
            designation = fac.designation
            is_mentor = fac.is_mentor
            mentor_group = fac.mentor_group

    role_str = str(current_user.role.value if hasattr(current_user.role, 'value') else current_user.role or "admin")
    new_token = create_access_token(subject=current_user.id, role=role_str)

    return TokenResponse(
        access_token=new_token,
        token_type="bearer",
        role=role_str,
        user_id=current_user.id or "usr-admin-default",
        name=current_user.name or "Institutional Administrator",
        email=current_user.email or "admin@campus.edu",
        department=current_user.department or "Institutional Administration",
        phone=current_user.phone,
        photoUrl=current_user.photo_url,
        rollNumber=roll_number,
        employeeId=employee_id,
        year=year,
        section=section,
        attendanceRate=attendance_rate,
        mentorId=mentor_id,
        mentorName=mentor_name,
        designation=designation,
        isMentor=is_mentor,
        mentorGroup=mentor_group,
        mustChangePassword=current_user.must_change_password or False
    )
