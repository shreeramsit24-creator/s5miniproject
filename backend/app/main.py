import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
import app.models  # Ensures all 16 models are registered in Base.metadata
from app.routers import (
    auth_router, student_router, faculty_router, admin_router,
    sheet_router, timetable_router, public_timetable_router
)
from app.services.sheet_sync import check_and_execute_scheduled_syncs
from app.websockets.session_manager import ws_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("main")

scheduler = AsyncIOScheduler()


async def scheduled_sheet_sync_job():
    try:
        async with AsyncSessionLocal() as session:
            await check_and_execute_scheduled_syncs(session)
    except Exception as e:
        logger.error(f"Error in background scheduled sheet sync job: {e}")


async def scheduled_session_expiry_job():
    """Auto-closes stale attendance sessions whose expires_at timestamp has passed."""
    try:
        from datetime import datetime, timezone
        from sqlalchemy import select, and_
        from app.models.attendance import AttendanceSession

        now_dt = datetime.now(timezone.utc)
        async with AsyncSessionLocal() as session:
            stale_sessions = (await session.execute(
                select(AttendanceSession).where(
                    and_(
                        AttendanceSession.status == "broadcasting",
                        AttendanceSession.expires_at <= now_dt
                    )
                )
            )).scalars().all()
            for s in stale_sessions:
                s.status = "ended"
                logger.info(f"AsyncIOScheduler: Auto-closed expired attendance session {s.id} (expired at {s.expires_at})")
                await ws_manager.broadcast_session_status(
                    s.id,
                    "ended",
                    {"sessionId": s.id, "status": "ended"}
                )
            if stale_sessions:
                await session.commit()
    except Exception as e:
        logger.error(f"Error in background scheduled session expiry job: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Smart Attendance Database Engine...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized successfully.")

    # Administrative bootstrapping and optional demo data seeding
    try:
        import os
        from app.models.user import User, RoleEnum
        from app.models.settings import AdminSettings
        from app.core.security import get_password_hash
        from sqlalchemy import select, func

        seed_demo = os.getenv("SEED_DEMO_DATA", "false").strip().lower() == "true"

        async with AsyncSessionLocal() as session:
            # 1. Guarantee initial super-admin exists if zero admins exist
            admin_count = (await session.execute(
                select(func.count(User.id)).where(User.role == RoleEnum.ADMIN)
            )).scalar() or 0

            if admin_count == 0:
                admin_email = os.getenv("INITIAL_ADMIN_EMAIL", "admin@smartattendance.edu").strip()
                admin_password = os.getenv("INITIAL_ADMIN_PASSWORD", "Admin@1234").strip()
                logger.info(f"No administrator found. Bootstrapping initial super-admin ({admin_email})...")
                bootstrap_admin = User(
                    id="usr-admin-initial",
                    name="System Administrator",
                    email=admin_email,
                    password_hash=get_password_hash(admin_password),
                    role=RoleEnum.ADMIN,
                    department="Institutional Administration",
                    phone=""
                )
                session.add(bootstrap_admin)
                await session.commit()
                logger.info("Initial super-admin bootstrap complete.")

            # 2. Guarantee default AdminSettings exist
            settings_row = (await session.execute(select(AdminSettings))).scalar_one_or_none()
            if not settings_row:
                logger.info("Initializing default institutional admin settings...")
                new_settings = AdminSettings(
                    id="settings-1",
                    ble_signal_range=15,
                    ble_rssi_threshold=-75,
                    face_confidence_threshold=85.0,
                    liveness_check_enabled=True,
                    auto_sync_offline=True,
                    faculty_manual_override_allowed=True,
                )
                session.add(new_settings)
                await session.commit()

            # 3. Explicit demo data seeding ONLY if SEED_DEMO_DATA=true
            if seed_demo:
                user_count = (await session.execute(select(func.count(User.id)))).scalar() or 0
                if user_count <= 1:
                    logger.info("SEED_DEMO_DATA=true detected. Seeding demo institutional data...")
                    from seed import seed_database
                    await seed_database()

                    for r_path in ["institutional_roster.xlsx", "../institutional_roster.xlsx"]:
                        if os.path.exists(r_path):
                            logger.info(f"Auto-importing demo roster from {r_path}...")
                            from load_excel_roster import load_roster_from_excel
                            await load_roster_from_excel(r_path)
                            break
            else:
                logger.info("Production mode: Demo data seeding skipped (SEED_DEMO_DATA=false).")
    except Exception as e:
        logger.warning(f"Notice during startup bootstrap check: {e}")

    logger.info("Starting Background Schedulers (Google Sheets Sync & Attendance Session Expiry)...")
    scheduler.add_job(scheduled_sheet_sync_job, "interval", minutes=1, id="google_sheet_sync_job")
    scheduler.add_job(scheduled_session_expiry_job, "interval", minutes=1, id="attendance_session_auto_expiry_job")
    scheduler.start()

    yield

    logger.info("Shutting down Google Sheet Background Scheduler...")
    try:
        scheduler.shutdown(wait=False)
    except Exception as e:
        logger.warning(f"Error shutting down scheduler: {e}")
    logger.info("Shutting down Smart Attendance API server...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware: Permissive regex allows Render domains, Vercel, localhost, Capacitor and mobile webviews with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(https?|capacitor|ionic):\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server Error: {str(exc)}"}
    )

# Include REST Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(student_router, prefix=settings.API_V1_STR)
app.include_router(faculty_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(sheet_router, prefix=settings.API_V1_STR)
app.include_router(timetable_router, prefix=settings.API_V1_STR)
app.include_router(public_timetable_router, prefix=settings.API_V1_STR)



# ================================================================
# WebSocket Endpoints
# ================================================================

@app.websocket("/ws/faculty/session/{session_id}/live")
async def websocket_faculty_session(websocket: WebSocket, session_id: str):
    channel = f"session:{session_id}"
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            # Keep-alive heartbeat listener
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, channel)
    except Exception as e:
        logger.warning(f"WebSocket error in {channel}: {e}")
        await ws_manager.disconnect(websocket, channel)


@app.websocket("/ws/admin/live-oversight")
async def websocket_admin_oversight(websocket: WebSocket):
    channel = "admin:oversight"
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, channel)
    except Exception as e:
        logger.warning(f"WebSocket error in {channel}: {e}")
        await ws_manager.disconnect(websocket, channel)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": settings.DATABASE_URL.split("://")[0]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
