# Project Abstract: Smart Attendance System

## Title
**Next-Generation Multi-Modal Touchless Attendance System with Hardware-Calibrated BLE Beacons, Biometric Verification, and Real-Time WebSocket Radar**

---

## Abstract
Traditional manual and paper-based attendance logging in academic and corporate institutions suffers from significant time wastage, proxy attendance vulnerabilities, human clerical errors, and a lack of real-time auditability. While conventional biometric solutions (such as centralized fingerprint scanners) mitigate buddy-punching, they introduce hygiene concerns, physical bottlenecks at classroom entrances, and hardware scalability limits.

This project introduces **Smart Attendance**, an enterprise-grade, touchless, multi-modal attendance management platform built on a distributed micro-service architecture. The system combines physical micro-location verification using **ESP32 Bluetooth Low Energy (BLE) classroom beacons** with **on-device biometric facial liveness verification** to establish cryptographic proof of physical presence before granting attendance credit.

Proximity is determined dynamically using the **log-distance path-loss propagation model** ($d = 10^{\frac{\text{TxPower} - \text{RSSI}}{10n}}$), enforcing a calibrated boundary threshold ($< 15.0\text{ m}$ and $\ge -75\text{ dBm}$) alongside a minimum $85\%$ biometric confidence threshold to prevent GPS spoofing, photo-of-photo attacks, and remote check-ins. Concurrently, an **AsyncIO WebSocket engine** pushes verified check-ins in real time to an interactive **Faculty Live Radar dashboard**, displaying live classroom fill rates and student attendance statuses with sub-second latency.

The platform employs a resilient, hybrid persistence layer consisting of **Cloud Supabase PostgreSQL** as the primary datastore and a synchronized **Local MySQL mirror** for fault tolerance during network outages. An automated **Timetable Engine** detects room and instructor double-booking collisions, while an integrated **AsyncIOScheduler** manages scheduled session auto-expiry, automated audit logging, and bi-directional **Google Sheets synchronization**. Furthermore, the system includes a hierarchical **Leave & On-Duty (OD) Management Pipeline** that automatically routes student applications to assigned faculty mentors, recalculating academic streaks and adjusting timetable substitutes in real time upon approval. The client ecosystem is realized as a unified responsive web application and cross-platform native Android app built using **React 19, Vite, TypeScript, and Capacitor**, backed by high-performance asynchronous **FastAPI** microservices.

---

## Architectural Workflow & Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SMART ATTENDANCE SYSTEM                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Multi-Modal Identity   │ Institutional JWT + Google OAuth + Fallback│
│ 2. Micro-Location BLE     │ ESP32 Beacons + Path-Loss Distance Engine  │
│ 3. Biometric Liveness     │ >85% Confidence Facial Anti-Spoofing Gate  │
│ 4. Real-Time Radar        │ Full-Duplex WebSockets (RAD-XXXX Codes)    │
│ 5. Timetable & Collisions │ Mon-Sat Grid with Double-Booking Defense   │
│ 6. Leaves & OD Oversight  │ Mentor Approval Cascade to Attendance Rates│
│ 7. Fault-Tolerant Hybrid  │ Supabase Postgres + Local MySQL + Sheets   │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Highlights
1. **Anti-Proxy Dual Verification**: Requires simultaneous BLE proximity inside the physical classroom ($<15$m, $\ge -75$ dBm) and biometric facial verification ($\ge 85\%$ confidence).
2. **Real-Time Faculty Radar**: Full-duplex WebSocket push feeds live check-ins into the faculty terminal within milliseconds of submission.
3. **High-Availability Hybrid Persistence**: Cloud PostgreSQL (Supabase AsyncPG) operates in tandem with a local MySQL replica and Google Sheets synchronization to ensure zero downtime or data loss during internet outages.
4. **Automated Academic Operations**: Institutional Excel roster onboarding, collision-free timetable scheduling, and mentor-approved On-Duty (OD) attendance credit adjustments.
5. **Cross-Platform Accessibility**: Fully responsive web portal for administrators and faculty, complemented by an Android APK built with Capacitor.

---

## Keywords
*Touchless Smart Attendance, Bluetooth Low Energy (BLE), ESP32 Micro-Beacons, Log-Distance Path Loss, Biometric Facial Recognition, Real-Time WebSockets, FastAPI, Supabase PostgreSQL, Hybrid Database Replication, Academic Timetable Engine.*
