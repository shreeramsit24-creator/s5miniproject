// report_chap4_aligned.cjs
// Chapter 4: Proposed Work Modules matching the exact 4.1 to 4.12 headings of the uploaded PDF.
// NO italic words anywhere. Pure black (#000000) typography.

// ==========================================
// CHAPTER 4: PROPOSED WORK MODULES (PAGES 18 TO 22)
// ==========================================

const p27_mod_1 = `
<h2 class="chapter-heading" style="margin-top: 10px; margin-bottom: 5px;">CHAPTER 4</h2>
<h2 class="chapter-heading" style="margin-top: 0; margin-bottom: 25px;">PROPOSED WORK MODULES</h2>

<p>
  This chapter presents the detailed description of the proposed work modules of the Smart Attendance System. The system is designed using a modular architecture where each module performs a specific dedicated function. This modular structure improves system efficiency, scalability, and maintainability across academic deployments.
</p>

<p>
  The proposed system consists of several interconnected modules including classroom beacon registration, BLE proximity tracking, biometric facial liveness verification, user interface, backend processing, database management, and administrative control. Each module works independently but interacts with other modules to provide real-time and accurate attendance verification to users.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.1 OVERVIEW OF PROPOSED MODULES</h3>

<p>The Smart Attendance System is divided into the following major modules:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li>Beacon Registration Module</li>
  <li>BLE Tracking Module</li>
  <li>Biometric Liveness Module</li>
  <li>User Interface Module</li>
  <li>Backend Server Module</li>
  <li>Database Management Module</li>
  <li>API Communication Module</li>
  <li>Admin Control Module</li>
</ul>

<p>
  These modules collectively ensure smooth functioning of the system and provide real-time attendance verification updates to students, faculty, and administrative authorities.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.2 BEACON REGISTRATION MODULE</h3>

<p>
  The Beacon Registration Module is responsible for configuring and registering classroom beacons into the administrative system. This module records essential venue details such as room number, building block, seating capacity, assigned course timetables, and hardware MAC address.
</p>

<p>
  Each classroom is assigned a unique Major and Minor identifier matching its physical venue (for example, Major 200 for Academic Block A, Minor 204 for Lecture Hall LH-204). The ESP32 device installed in the classroom is linked to this identifier in the database.
</p>
`;

const p28_mod_2 = `
<p>
  This module ensures that all classroom beacon nodes are properly recorded in the system before they are made active for student attendance tracking. It also allows administrators to update or reassign beacon parameters whenever classroom layouts or schedules are modified.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.3 BLE TRACKING MODULE</h3>

<p>
  The BLE Tracking Module is one of the core components of the system. It is responsible for capturing real-time proximity signals from classroom beacons using the student mobile smartphone.
</p>

<p>
  The BLE receiver on the mobile client continuously scans for background advertising packets matching the institutional beacon UUID. When a classroom beacon is detected, the module extracts the Received Signal Strength Indicator (RSSI) in dBm.
</p>

<p>
  The module applies a moving-average filter across five consecutive signal samples to eliminate RF multipath fluctuations. It evaluates the smoothed signal using the log-distance path-loss model to compute physical distance.
</p>

<p>
  This module ensures accurate spatial fencing, verifying that the student is located strictly within the 15-meter classroom boundary before permitting biometric identity verification.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.4 BIOMETRIC LIVENESS MODULE</h3>

<p>
  The Biometric Liveness Module provides real-time verification of student physical presence and prevents presentation attacks such as printed 2D photos, video replays, and mobile screen spoofs.
</p>

<p>This module operates through two automated stages:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li><strong>Eye Aspect Ratio (EAR) Blink Detection:</strong> Tracks facial landmark contours across frames to detect natural, involuntary physiological blinking.</li>
  <li><strong>Feature Embedding Comparison:</strong> Extracts on-device facial embeddings and compares them with enrolled student profile vectors using Cosine Similarity.</li>
</ul>

<p>
  The system continuously verifies liveness scores and confirms that the authentic student is physically holding the phone during attendance registration.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.5 USER INTERFACE MODULE</h3>

<p>
  The User Interface Module provides seamless interaction between the system and users. It is designed to be simple, responsive, and easy to use.
</p>

<p>The main features of this module include:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li>One-tap BLE scanning and distance feedback on mobile phones.</li>
  <li>Interactive camera guidance for natural facial blink detection.</li>
  <li>Real-time Faculty Live Radar dashboard rendering verified seating dots.</li>
  <li>Timetable schedule viewers and student attendance history cards.</li>
</ul>
`;

const p29_mod_3 = `
<p>
  The interface is developed using modern frontend technologies and is accessible through both native Android mobile APKs and administrative web dashboards. This module plays an essential role in enhancing user experience and eliminating user friction.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.6 BACKEND SERVER MODULE</h3>

<p>
  The Backend Server Module acts as the central processing unit of the system. It manages secure communication between all other modules and coordinates business logic.
</p>

<p>The main functions of the backend server include:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li>Receiving and verifying student check-in transaction payloads.</li>
  <li>Validating active session timeframes, classroom allocations, and enrollments.</li>
  <li>Broadcasting instantaneous check-in events over full-duplex WebSockets.</li>
  <li>Executing timetable interval conflict analysis to prevent venue collisions.</li>
  <li>Updating relational database records atomically with zero packet loss.</li>
</ul>

<p>
  The backend is developed using FastAPI (Python 3.14) with asynchronous ASGI workers, ensuring efficient high-concurrency request processing and sub-150ms radar updates.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.7 DATABASE MANAGEMENT MODULE</h3>

<p>
  The Database Management Module is responsible for storing, organizing, and securing all academic records and real-time operational data.
</p>

<p>The database architecture includes:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li><strong>Students Table:</strong> Enrolled roll numbers, student names, department, and facial embeddings.</li>
  <li><strong>Classrooms Table:</strong> Room numbers, seating capacity, and beacon UUIDs.</li>
  <li><strong>Timetables Table:</strong> Course periods, day mappings, room IDs, and faculty allocations.</li>
  <li><strong>Attendance Records Table:</strong> Timestamped logs, session IDs, calculated distances, and verification flags.</li>
  <li><strong>Leave & OD Table:</strong> Medical leave and official On-Duty applications with mentor authorization states.</li>
</ul>

<p>
  The system utilizes cloud Supabase PostgreSQL alongside a synchronized local MySQL mirror to guarantee fast data retrieval, zero data loss, and uninterrupted offline campus operation.
</p>
`;

const p30_mod_4 = `
<h3 class="section-heading" style="margin-top: 10px; margin-bottom: 12px;">4.8 API COMMUNICATION MODULE</h3>

<p>
  The API Communication Module enables secure data transfer between the mobile application, web dashboard, and backend server.
</p>

<p>RESTful APIs are used for:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li>Authenticating user logins and generating cryptographically signed JWT tokens.</li>
  <li>Submitting verified attendance check-in payloads with cryptographic nonces.</li>
  <li>Fetching live session rosters, attendance streaks, and timetable slots.</li>
  <li>Streaming real-time radar updates through WebSocket RFC 6455 channels.</li>
</ul>

<p>
  Secure API communication ensures reliable data transfer, payload validation, and system integration across all network environments.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.9 ADMIN CONTROL MODULE</h3>

<p>
  The Admin Control Module provides administrative functionalities for managing and auditing the smart attendance system.
</p>

<p>The main features include:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li>Adding and configuring classroom beacons and lecture hall parameters.</li>
  <li>Managing institutional timetables and resolving scheduling collisions.</li>
  <li>Monitoring system performance, database synchronization, and API latencies.</li>
  <li>Viewing real-time attendance percentages across academic departments.</li>
  <li>Managing user roles, permissions, and faculty mentor assignments.</li>
</ul>

<p>This module ensures proper institutional control, governance, and system maintenance.</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.10 WORKING OF THE PROPOSED SYSTEM</h3>

<p>
  The system begins with classroom registration and beacon installation. Once a lecture session starts, the ceiling-mounted ESP32 beacon broadcasts advertising packets continuously.
</p>

<p>
  Students launch the mobile client and initiate check-in. The app discovers the beacon, calculates distance via the path-loss model, and prompts the student to blink for on-device liveness verification. Upon clearing both security gates, the verified payload is submitted to the backend. The server updates the database atomically and broadcasts the check-in event to the faculty radar screen.
</p>

<p>
  When the faculty member views the dashboard, the live radar updates dynamically, displaying verified student seating dots within 150 milliseconds. The process continues seamlessly throughout the attendance window.
</p>
`;

const p31_mod_5 = `
<h3 class="section-heading" style="margin-top: 10px; margin-bottom: 12px;">4.11 INTEGRATION OF MODULES</h3>

<p>
  All modules in the Smart Attendance System are tightly integrated to work seamlessly together across physical, client, and cloud tiers:
</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li>ESP32 hardware beacon broadcasts RF advertising signals to mobile clients.</li>
  <li>Mobile client captures beacon signals, estimates distance, and executes biometric scans.</li>
  <li>API communication module transfers verified check-in data to the backend server.</li>
  <li>Backend processes transactions, validates timetable schedules, and updates databases.</li>
  <li>WebSocket hub broadcasts check-in events to the faculty radar dashboard.</li>
  <li>Database management module maintains real-time synchronization between cloud and local mirrors.</li>
</ul>

<p>
  This seamless integration ensures smooth data flow, immediate feedback, and high overall system efficiency.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">4.12 ADVANTAGES OF MODULAR DESIGN</h3>

<p>
  The modular architecture of the Smart Attendance System provides several significant operational benefits:
</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li><strong>Easy Maintenance:</strong> Subsystems can be debugged, updated, or maintained independently without affecting other components.</li>
  <li><strong>High Scalability:</strong> New classrooms, student cohorts, or departments can be integrated simply by adding new beacon entries.</li>
  <li><strong>Flexibility in Development:</strong> Individual modules can be enhanced with new algorithms (such as upgrading computer vision models) without rewriting the entire codebase.</li>
  <li><strong>Independent Module Testing:</strong> Each module is verified with dedicated unit tests, ensuring robust reliability across the whole application.</li>
  <li><strong>Continuous System Updates:</strong> Software updates can be deployed to the frontend or backend without requiring hardware modifications to installed beacons.</li>
</ul>

<p>
  This modular design significantly improves the overall reliability, scalability, and lifespan of the Smart Attendance System.
</p>
`;

module.exports = {
  p27_mod_1,
  p28_mod_2,
  p29_mod_3,
  p30_mod_4,
  p31_mod_5
};
