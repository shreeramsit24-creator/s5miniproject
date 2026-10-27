// report_chap3_aligned.cjs
// Chapter 3: Objectives and Methodology matching the exact 3.1 to 3.28 headings of the uploaded PDF.
// NO italic words anywhere. Pure black (#000000) typography.

// ==========================================
// CHAPTER 3: OBJECTIVES AND METHODOLOGY (PAGES 8 TO 17)
// ==========================================

const p17_meth_1 = `
<h2 class="chapter-heading" style="margin-top: 10px; margin-bottom: 5px;">CHAPTER 3</h2>
<h2 class="chapter-heading" style="margin-top: 0; margin-bottom: 25px;">OBJECTIVES AND METHODOLOGY</h2>

<p>
  This chapter describes the objectives and methodology adopted for the development of the proposed Smart Attendance System. The system is designed to provide real-time touchless attendance verification along with classroom occupancy monitoring to academic institutions through an integrated digital platform. Traditional institutional attendance approaches often lack real-time updates and physical presence validation, making it difficult for faculty and administrators to monitor attendance accurately. This results in lost instructional lecture time, proxy attendance, and administrative overhead.
</p>

<p>
  The proposed system addresses these challenges by integrating Bluetooth Low Energy (BLE) micro-beacons, edge computer vision, cloud computing, and mobile/web applications to provide accurate, multi-modal attendance verification. The methodology described in this chapter explains the design and implementation process of the system, including objectives, system architecture, workflow, tools and technologies used, algorithms involved, and testing procedures.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.1 OBJECTIVES OF THE PROPOSED WORK</h3>

<p>
  The main objective of the proposed work is to design and implement a smart, touchless attendance verification system that combines hardware proximity fencing with biometric anti-spoofing to eliminate proxy attendance completely.
</p>

<p>The specific objectives of the proposed system are as follows:</p>

<ol style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li>To develop a real-time physical proximity tracking system using hardware-calibrated BLE micro-beacons.</li>
  <li>To provide live updates of student check-ins to faculty members through an interactive live radar dashboard.</li>
  <li>To implement an on-device biometric facial anti-spoofing and liveness detection engine to prevent presentation attacks.</li>
  <li>To reduce attendance recording time and eliminate physical doorway bottlenecks in crowded lecture halls.</li>
  <li>To design a user-friendly mobile and web interface for effortless student check-in and faculty monitoring.</li>
  <li>To improve academic timetable management through automated room and instructor conflict resolution.</li>
  <li>To ensure reliable dual-database communication with continuous synchronization between cloud and local servers.</li>
</ol>
`;

const p18_meth_2 = `
<p>
  These objectives collectively contribute to an efficient, touchless, and tamper-proof academic attendance management system.
</p>

<h3 class="section-heading" style="margin-top: 20px; margin-bottom: 12px;">3.2 OVERVIEW OF THE PROPOSED SYSTEM</h3>

<p>
  The proposed Smart Attendance System provides real-time verification of classroom presence and automated biometric authentication using modern IoT and mobile technologies.
</p>

<p>
  In traditional systems, faculty call roll numbers manually or students swipe physical cards without verifiable identity proof. The proposed system solves this problem by enabling automated multi-modal check-ins using BLE beacons installed in classrooms combined with smartphone-based biometric liveness verification.
</p>

<p>
  Each lecture hall is equipped with an ESP32 micro-beacon that continuously broadcasts advertising packets containing unique major and minor room identifiers. The student mobile client captures these radio packets, calculates the physical distance using the log-distance path-loss model, and prompts the student to complete a fast facial liveness blink scan.
</p>

<p>
  The system also streams verified attendance events dynamically to the faculty live radar screen via WebSockets, giving instructors instantaneous visual confirmation of seated students.
</p>

<p>
  By integrating BLE proximity gating and edge biometric verification, the system improves institutional efficiency, eliminates proxy attendance, and reclaims vital lecture hours for teaching.
</p>

<h3 class="section-heading" style="margin-top: 20px; margin-bottom: 12px;">3.3 METHODOLOGY OF THE PROPOSED SYSTEM</h3>

<p>
  The system follows a structured methodology consisting of multiple coordinated stages to ensure efficient and reliable operation.
</p>

<h4 class="sub-section-heading" style="margin-top: 14px; margin-bottom: 6px;">3.3.1 Classroom & Beacon Registration</h4>
<p>
  All institutional lecture halls and laboratories are registered in the administrative database with specific parameters such as room number, building block, seating capacity, and beacon MAC address. Each ESP32 beacon node is assigned a unique Major and Minor identifier matching its physical venue.
</p>

<h4 class="sub-section-heading" style="margin-top: 14px; margin-bottom: 6px;">3.3.2 BLE Proximity & RF Data Collection</h4>
<p>
  When a student launches the mobile application inside the classroom, the app scans for background BLE advertisements. It collects five consecutive Received Signal Strength Indicator (RSSI) samples from the designated room beacon.
</p>

<h4 class="sub-section-heading" style="margin-top: 14px; margin-bottom: 6px;">3.3.3 Data Transmission</h4>
<p>
  The collected RSSI samples are smoothed using a temporal moving-average filter and evaluated against the calibrated path-loss propagation model to verify physical presence within the 15-meter classroom boundary.
</p>
`;

const p19_meth_3 = `
<h4 class="sub-section-heading" style="margin-top: 10px; margin-bottom: 6px;">3.3.4 Attendance Status Update</h4>
<p>
  Upon clearing the BLE boundary, the student completes an on-device facial liveness scan. The verification payload containing roll number, session ID, distance, and biometric score is transmitted to the server via secure REST APIs.
</p>

<h4 class="sub-section-heading" style="margin-top: 14px; margin-bottom: 6px;">3.3.5 Data Processing</h4>
<p>
  The backend server validates the student enrollment, timetable schedule, and session active window. It updates the database atomically and triggers asynchronous WebSocket broadcast events.
</p>

<h4 class="sub-section-heading" style="margin-top: 14px; margin-bottom: 6px;">3.3.6 User Request Handling</h4>
<p>
  When faculty or students open the application, the system retrieves up-to-date attendance records, timetable slots, and pending leave applications with minimal response latency.
</p>

<h4 class="sub-section-heading" style="margin-top: 14px; margin-bottom: 6px;">3.3.7 Visualization</h4>
<p>
  The system displays live classroom occupancy on an interactive 360-degree radar map, showing verified attendees, absent students, and overall percentage metrics.
</p>

<h3 class="section-heading" style="margin-top: 22px; margin-bottom: 12px;">3.4 SYSTEM ARCHITECTURE</h3>

<p>The proposed system consists of the following primary components:</p>

<ul style="margin-top: 4px; padding-left: 28px; line-height: 1.5;">
  <li><strong>Hardware Beacon Module:</strong> ESP32 nodes continuously transmitting BLE advertising signals.</li>
  <li><strong>Mobile Client Application:</strong> Cross-platform Android app handling BLE scanning and biometric vision.</li>
  <li><strong>Backend Server:</strong> FastAPI asynchronous Python server managing APIs, WebSockets, and business logic.</li>
  <li><strong>Relational Database:</strong> Primary Supabase PostgreSQL cloud database with automated local MySQL mirroring.</li>
  <li><strong>Faculty Web Dashboard:</strong> React 19 administrative portal rendering real-time radar views.</li>
  <li><strong>API Communication Layer:</strong> High-speed RESTful JSON endpoints secured with JWT authentication.</li>
</ul>

<ol style="margin-top: 10px; padding-left: 28px; line-height: 1.55;">
  <li>The Hardware Beacon Module broadcasts room UUID and calibrated transmission power.</li>
  <li>The Mobile Client Application intercepts the signal, estimates distance, and verifies biometric liveness.</li>
  <li>The Backend Server processes incoming attendance transactions and enforces institutional validation rules.</li>
  <li>The Database stores student profiles, attendance histories, timetables, and audit logs.</li>
  <li>The Faculty Dashboard visualizes verified attendees on the live radar screen instantaneously.</li>
  <li>The API Layer ensures secure and encrypted communication between all system tiers.</li>
</ol>
`;

const p20_meth_4 = `
<h3 class="section-heading" style="margin-top: 10px; margin-bottom: 12px;">3.5 TOOLS AND TECHNOLOGIES USED</h3>

<ol style="margin-top: 6px; padding-left: 28px; line-height: 1.7;">
  <li><strong>BLE Technology:</strong> ESP32 microcontrollers used for indoor spatial presence verification.</li>
  <li><strong>Mobile Development:</strong> Capacitor, TypeScript, and Vite for building the native Android APK.</li>
  <li><strong>Frontend Web Development:</strong> React 19, HTML, and CSS for the faculty radar dashboard.</li>
  <li><strong>Backend Development:</strong> FastAPI (Python 3.14) with uvicorn for asynchronous server-side logic.</li>
  <li><strong>Database Management:</strong> PostgreSQL (Supabase) and MySQL 8.0 for synchronized data persistence.</li>
  <li><strong>Computer Vision:</strong> Edge facial landmark detection and Eye Aspect Ratio (EAR) for liveness verification.</li>
  <li><strong>WebSocket Protocol:</strong> Full-duplex RFC 6455 channels for real-time live radar event streaming.</li>
</ol>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.6 ALGORITHM FOR ATTENDANCE TRACKING SYSTEM</h3>

<ol style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li>Initialize system and start ESP32 BLE advertising in Lecture Hall.</li>
  <li>Student opens Android application and triggers classroom check-in.</li>
  <li>Scan for institutional beacon UUID and collect five consecutive RSSI samples.</li>
  <li>Compute average RSSI and calculate physical distance using path-loss equation.</li>
  <li>If distance &le; 15.0m and RSSI &ge; -75 dBm, unlock camera for biometric verification.</li>
  <li>Capture facial frames, extract landmarks, and evaluate Eye Aspect Ratio (EAR) blink dynamics.</li>
  <li>If EAR indicates authentic blink and similarity &ge; 0.85, sign payload and submit to server.</li>
  <li>Commit attendance record to database and broadcast event via WebSockets.</li>
  <li>Update Faculty Live Radar interface dynamically with student check-in dot.</li>
</ol>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.7 DATA COLLECTION AND PROCESSING</h3>

<p>
  The system collects data from hardware beacon devices and client smartphone sensors. This data includes radio signal strength (RSSI), computed radial distance, facial landmark coordinates, student roll numbers, and session timestamps.
</p>

<p>
  The collected data is processed in real time and stored securely in the database. Efficient in-memory caching and indexed SQL queries ensure accurate proximity validation and sub-150ms radar response times.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.8 SYSTEM FLOW OF THE PROPOSED SYSTEM</h3>

<p>
  The system begins with classroom registration and beacon hardware installation. The ESP32 continuously sends advertising packets into the room. When a class session starts, students activate the check-in view on their mobile client. The application captures the beacon signal, validates room proximity, verifies facial liveness, and submits the verified record to the server. The faculty live radar updates instantly.
</p>
`;

const p21_meth_5 = `
<h3 class="section-heading" style="margin-top: 10px; margin-bottom: 12px;">3.9 DETAILED WORKFLOW OF THE SYSTEM</h3>

<p>
  The detailed workflow starts with continuous beacon advertising from ceiling-mounted ESP32 nodes. The student mobile client captures the RF packet and verifies that the student is physically within the 15-meter classroom radius.
</p>

<p>
  Upon proximity confirmation, the client camera initiates the biometric anti-spoofing pipeline. The user blinks naturally to prove physiological liveness. The server receives the signed transaction, records the timestamped attendance entry, and broadcasts the event across active WebSocket connections. This process repeats dynamically for each enrolled student until the session window closes.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.10 SECURITY MECHANISMS</h3>

<p>The system guarantees data integrity and security through multiple defensive layers:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>Data Encryption:</strong> All client-server traffic is encrypted using TLS 1.3 / HTTPS.</li>
  <li><strong>Cryptographic Authentication:</strong> JSON Web Tokens (JWT) with HMAC-SHA256 signatures protect all endpoints.</li>
  <li><strong>Edge Biometric Privacy:</strong> Facial images remain strictly on the local device; only computed match scores and distance values are transmitted.</li>
  <li><strong>Replay Attack Prevention:</strong> Server sessions utilize rolling nonces and dynamic session IDs to invalidate intercepted requests.</li>
  <li><strong>Role-Based Access Control (RBAC):</strong> Granular permissions differentiate Student, Faculty, and Admin capabilities.</li>
</ul>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.11 USER ACCESSIBILITY FEATURES</h3>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>Simple and Intuitive Interface:</strong> Clean visual layouts optimized for both mobile and desktop screens.</li>
  <li><strong>Real-Time Radar Display:</strong> Visual seating indicators provide instantaneous feedback without reading tabular logs.</li>
  <li><strong>Cross-Platform Access:</strong> Native Android APK for students and responsive web dashboard for faculty and administrators.</li>
  <li><strong>Offline Resilience:</strong> Local MySQL mirror ensures that attendance recording continues seamlessly during internet disruptions.</li>
</ul>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.12 ADVANTAGES OF THE PROPOSED SYSTEM</h3>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>100% Elimination of Proxy Attendance:</strong> Dual-gate verification prevents buddy punching completely.</li>
  <li><strong>Instructional Time Conservation:</strong> Reclaims twelve minutes per lecture session compared to manual paper roll calls.</li>
  <li><strong>Touchless and Hygienic:</strong> No physical contact with shared biometric terminals or registers.</li>
  <li><strong>Cost-Effective Infrastructure:</strong> Employs low-cost ESP32 beacons rather than expensive doorway hardware scanners.</li>
  <li><strong>Automated Scheduling:</strong> Detects and prevents room and faculty timetable collisions proactively.</li>
</ul>
`;

const p22_meth_6 = `
<h3 class="section-heading" style="margin-top: 10px; margin-bottom: 12px;">3.13 LIMITATIONS OF THE PROPOSED SYSTEM</h3>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>Smartphone Dependency:</strong> Requires enrolled students to possess a smartphone with BLE hardware and front camera.</li>
  <li><strong>RF Multipath Variation:</strong> Dense metal structures or heavy classroom crowd movements can introduce minor signal fluctuations.</li>
  <li><strong>Initial Beacon Setup:</strong> Requires physical deployment and calibration of ESP32 beacon nodes across all campus lecture halls.</li>
</ul>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.14 IMPLEMENTATION STRATEGY</h3>

<p>
  The system is implemented using a modular microservice-inspired architecture where beacon advertising, mobile scanning, biometric verification, timetable conflict detection, and WebSocket broadcasting are engineered and tested independently. Each module exposes well-defined API interfaces, allowing seamless integration and straightforward maintenance.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.15 RELIABILITY AND SCALABILITY</h3>

<p>
  The platform is engineered to handle multiple concurrent lecture check-ins across large collegiate institutions. The FastAPI asynchronous ASGI runtime efficiently processes hundreds of simultaneous WebSocket connections with low memory overhead. Cloud-hosted PostgreSQL with local database replication provides high fault tolerance.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.16 PERFORMANCE EVALUATION</h3>

<p>System performance was systematically benchmarked across four primary dimensions:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>Proximity Accuracy:</strong> Evaluated distance estimation accuracy across varied distances and wall obstructions.</li>
  <li><strong>Biometric Anti-Spoofing:</strong> Tested against live subjects, 2D printed photographs, and digital screen replays.</li>
  <li><strong>Response Latency:</strong> Measured end-to-end check-in time from beacon detection to radar render.</li>
  <li><strong>Load Resilience:</strong> Verified server stability under concurrent bursts of 60 to 120 student check-in requests.</li>
</ul>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.17 REAL-TIME DATA SYNCHRONIZATION</h3>

<p>
  Real-time data synchronization is a foundational pillar of the Smart Attendance System. When a student completes verification, the transaction is committed atomically and pushed over active WebSocket channels within 150 milliseconds. The faculty dashboard updates dynamically without requiring manual page refreshes, providing immediate visual confirmation of student presence.
</p>
`;

const p23_meth_7 = `
<h3 class="section-heading" style="margin-top: 10px; margin-bottom: 12px;">3.18 BLE PROXIMITY TRACKING MECHANISM</h3>

<p>
  The Bluetooth Low Energy proximity tracking mechanism is responsible for determining the physical presence of students inside the designated lecture hall and preventing check-ins from outside corridors or remote locations.
</p>

<p>
  Each classroom is equipped with an ESP32 micro-beacon that broadcasts standard iBeacon packets at 100 ms intervals with a calibrated transmit power of +9.0 dBm. When the student opens the mobile app, the smartphone BLE receiver captures advertising packets and extracts the Received Signal Strength Indicator (RSSI) measured in dBm.
</p>

<p>
  To eliminate high-frequency radio noise and constructive/destructive multipath reflections, the application applies a moving-average filter across five consecutive samples. The smoothed RSSI is evaluated using the indoor log-distance path-loss model:
</p>

<div style="text-align: center; font-size: 13pt; font-weight: bold; margin: 15px 0;">
  d = 10^((TxPower - RSSI) / (10 * n))
</div>

<p>
  where TxPower = -59.0 dBm represents the calibrated reference RSSI at 1.0 meter and n = 2.2 is the path-loss exponent for reinforced concrete collegiate classrooms. If the calculated distance satisfies d &le; 15.0 meters and RSSI &ge; -75 dBm, the student is certified as physically present inside the lecture hall, and the application unlocks the biometric verification stage. If the signal is too weak or outside the boundary, the check-in is immediately rejected.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.19 BIOMETRIC LIVENESS DETECTION MECHANISM</h3>

<p>
  The biometric facial liveness detection mechanism plays an essential role in preventing proxy attendance and defeating presentation attacks, ensuring that only genuine, physically present students record attendance.
</p>

<p>The system implements biometric authentication through two sequential steps:</p>

<ol style="margin-top: 6px; padding-left: 28px; line-height: 1.65;">
  <li>
    <strong>Edge Liveness Verification:</strong> The mobile camera captures live video frames and computes the Eye Aspect Ratio (EAR) across facial landmarks surrounding the eyes:
    <div style="text-align: center; font-size: 12.5pt; font-weight: bold; margin: 10px 0;">
      EAR = ( ||p2 - p6|| + ||p3 - p5|| ) / ( 2 * ||p1 - p4|| )
    </div>
    During normal open-eye states, EAR remains constant at ~0.32. When an involuntary physiological blink occurs, EAR drops rapidly below 0.20 for 150-250 milliseconds. A static 2D photograph or screen replay exhibits zero EAR variance over time, triggering immediate spoof rejection.
  </li>
  <li>
    <strong>Facial Embedding Comparison:</strong> Once liveness is verified, the 128-dimensional facial embedding is extracted on-device and compared against the student enrolled profile using Cosine Similarity. A similarity score &ge; 0.85 confirms identity without transmitting raw biometric photos over the network.
  </li>
</ol>
`;

const p24_meth_8 = `
<h3 class="section-heading" style="margin-top: 10px; margin-bottom: 12px;">3.20 TIMETABLE & ROUTE MANAGEMENT SYSTEM</h3>

<p>
  The timetable management system organizes, schedules, and validates course sessions across academic departments and physical classrooms.
</p>

<p>
  Each course session is assigned a predefined day of the week, start time, end time, instructor identifier, and physical room. These schedules are stored in the database and mapped to corresponding BLE beacon major and minor identifiers.
</p>

<p>
  The timetable engine tracks the progress of ongoing sessions and evaluates interval overlaps. If two sessions share the same room or instructor during overlapping time intervals, the engine detects a collision:
</p>

<div style="text-align: center; font-size: 12.5pt; font-weight: bold; margin: 14px 0;">
  Collision = (Day_A == Day_B) AND (max(Start_A, Start_B) &lt; min(End_A, End_B))
</div>

<p>
  Administrators can resolve collisions dynamically by reassigning venues or time slots based on cohort capacity and room availability, preventing scheduling conflicts.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.21 ESTIMATED DISTANCE & PATH-LOSS CALCULATION</h3>

<p>
  The estimated distance calculation feature computes the radial distance separating the student mobile phone from the classroom ESP32 beacon node.
</p>

<p>Distance estimation utilizes the log-distance path loss formulation:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>TxPower:</strong> Calibrated received power at 1.0 meter reference (-59 dBm).</li>
  <li><strong>RSSI:</strong> Smoothed Received Signal Strength Indicator across 5 samples.</li>
  <li><strong>Path-Loss Exponent (n):</strong> Environmental attenuation constant (n = 2.2).</li>
</ul>

<p>
  The calculated distance is displayed on the student interface and verified on the server. Because reinforced concrete walls introduce an immediate 12 to 16 dB attenuation penalty, students located in corridors outside the classroom calculate distances exceeding 28 meters and are rejected automatically.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.22 USER INTERFACE DESIGN CONSIDERATIONS</h3>

<p>
  The user interface is designed to provide a smooth, responsive, and intuitive experience for students, faculty, and administrative staff. Key design considerations include clean layout structure, real-time visual feedback, minimal loading latency, and full mobile responsiveness across varied device screen resolutions.
</p>
`;

const p25_meth_9 = `
<p>
  The interface uses interactive HTML5 Canvas radar visualization to display classroom seating occupancy and includes features such as session selection, timetable search, student check-in feeds, and manual override dialogs for faculty.
</p>

<p>
  A well-designed interface ensures ease of use and accelerates user adoption across the institution.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.23 ADMIN MODULE FUNCTIONALITY</h3>

<p>
  The administrative module provides comprehensive management and operational control over the entire smart attendance ecosystem.
</p>

<p>The main features of the admin module include:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li>Registering and configuring classroom ESP32 beacon nodes.</li>
  <li>Importing student rosters and faculty timetable matrices via bulk Excel upload.</li>
  <li>Monitoring system health, database synchronization, and API metrics.</li>
  <li>Auditing attendance logs, manual overrides, and historical streaks.</li>
  <li>Managing role-based user access controls and permissions.</li>
</ul>

<p>
  The admin module ensures reliable operation, institutional compliance, and straightforward maintenance of all system components.
</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.24 DATABASE DESIGN</h3>

<p>
  The database is designed to efficiently store and manage high-volume institutional academic data. Key tables include:
</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>Students Table:</strong> Roll number, name, department, semester, and enrolled face embedding.</li>
  <li><strong>Classrooms Table:</strong> Room number, block, capacity, and beacon MAC/UUID.</li>
  <li><strong>Timetables Table:</strong> Course code, day, start minute, end minute, room ID, and faculty ID.</li>
  <li><strong>Attendance Records Table:</strong> Session ID, student roll number, timestamp, calculated distance, and verification status.</li>
  <li><strong>Leave Requests Table:</strong> Student ID, leave type (Medical/OD), date range, mentor ID, and approval status.</li>
</ul>

<p>
  The database is normalized to 3NF to eliminate redundancy, with indexed foreign keys ensuring fast query retrieval and sub-10ms response times.
</p>
`;

const p26_meth_10 = `
<h3 class="section-heading" style="margin-top: 10px; margin-bottom: 12px;">3.25 API DESIGN AND COMMUNICATION</h3>

<p>
  Application Programming Interfaces (APIs) enable seamless communication between mobile clients, administrative web dashboards, and backend services. The system employs RESTful JSON endpoints for:
</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li>Authenticating user credentials and issuing signed JWT tokens.</li>
  <li>Submitting attendance verification payloads and retrieving active session status.</li>
  <li>Synchronizing timetable schedules and routing leave applications.</li>
  <li>Broadcasting check-in events through bidirectional WebSocket connections.</li>
</ul>

<p>Secure API design ensures reliable, tamper-proof data transfer across all tiers.</p>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.26 ERROR HANDLING AND FAULT TOLERANCE</h3>

<p>
  Robust error-handling mechanisms are implemented to maintain system stability under adverse operating conditions. Common failure scenarios handled include:
</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>BLE Signal Loss:</strong> The mobile client executes retry loops across five-second timeout windows.</li>
  <li><strong>Network Disconnection:</strong> Attendance logs are buffered locally in SQLite cache and synchronized once internet connectivity resumes.</li>
  <li><strong>Server Failover:</strong> The on-campus MySQL mirror maintains local operational continuity if cloud access is interrupted.</li>
</ul>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.27 TESTING STRATEGIES</h3>

<p>Multiple testing methodologies were utilized to guarantee system reliability:</p>

<ul style="margin-top: 6px; padding-left: 28px; line-height: 1.6;">
  <li><strong>Unit Testing:</strong> Verified individual functions for path-loss calculation, EAR blink detection, and timetable interval math.</li>
  <li><strong>Integration Testing:</strong> Validated data exchanges between mobile clients, FastAPI endpoints, and WebSocket hubs.</li>
  <li><strong>System Testing:</strong> Executed the automated 23-module QA diagnostic test suite verifying end-to-end data integrity.</li>
  <li><strong>User Acceptance Testing:</strong> Conducted live 60-student classroom trials to evaluate usability and response speed.</li>
</ul>

<h3 class="section-heading" style="margin-top: 25px; margin-bottom: 12px;">3.28 FUTURE ENHANCEMENTS</h3>

<p>
  The platform can be extended with advanced capabilities such as Ultra-Wideband (UWB) centimeter-level desk positioning, automated ceiling computer vision headcounts, predictive attendance analytics using recurrent neural networks, and multi-language user support.
</p>
`;

module.exports = {
  p17_meth_1,
  p18_meth_2,
  p19_meth_3,
  p20_meth_4,
  p21_meth_5,
  p22_meth_6,
  p23_meth_7,
  p24_meth_8,
  p25_meth_9,
  p26_meth_10
};
