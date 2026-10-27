// report_chap3.cjs
// Chapter 3: Objectives and Methodology (Pages 10 to 25 -> 16 full pages)

const p21_meth_1 = `
<h2 class="chapter-heading">CHAPTER 3</h2>
<h2 class="chapter-heading" style="margin-top: -15px; border-bottom: 2px solid #000; padding-bottom: 5px;">OBJECTIVES AND METHODOLOGY</h2>

<p>
  This chapter delineates the comprehensive engineering methodology, system architecture, mathematical formulations, hardware parameters, and validation metrics formulated for the design and deployment of the Smart Attendance System. Drawing upon the analytical findings, operational gaps, and technological trade-offs identified in the literature survey, this research establishes an integrated, touchless, multi-modal presence verification ecosystem. The proposed methodology replaces fragmented manual procedures with a cohesive three-tier platform uniting hardware-calibrated Bluetooth Low Energy (BLE) micro-beacons, edge biometric facial liveness algorithms, sub-150ms WebSocket live radar broadcasting, automated timetable interval collision detection, and hierarchical mentor leave workflows.
</p>

<h3 class="section-heading">3.1 Objectives of the Proposed Work</h3>

<p>
  To ensure systematic engineering execution, rigorous quality assurance, and balanced modular division across the project team, three primary technical objectives were established based on the identified research gaps. Each objective corresponds directly to the specialized domain responsibilities of the three team members:
</p>

<p class="no-indent">
  <strong>Objective 1: High-Performance Asynchronous Backend, Security Architecture, and Real-Time WebSocket Radar Engine (Varun M – Team Leader & Backend Architect)</strong><br>
  To design, architect, and deploy a robust, asynchronous RESTful microservice backend using FastAPI (Python 3.10+). This objective encompasses engineering role-based access control (RBAC) via cryptographically signed JSON Web Tokens (JWT HMAC-SHA256), formulating the mathematical indoor log-distance path-loss algorithm (d = 10<sup>(TxPower &minus; RSSI) / (10 &times; n)</sup>) for physical boundary enforcement, implementing a full-duplex WebSocket hub capable of broadcasting verified check-ins to the Faculty Live Radar dashboard within 150 milliseconds, and constructing an automated timetable interval analysis engine to detect and prevent classroom and instructor double-booking collisions.
</p>
`;

const p22_meth_2 = `
<p class="no-indent">
  <strong>Objective 2: Cross-Platform Native Mobile Client, Reactive Web Dashboard, and Biometric Liveness Verification (Shreeram S – Frontend & Mobile Lead)</strong><br>
  To engineer an intuitive, highly responsive client-side interface ecosystem comprising a reactive web dashboard (React 19, TypeScript, Tailwind CSS) and a production-grade native Android mobile application compiled via Capacitor 6. This objective includes implementing the client-side BLE scanning service utilizing <code>@capacitor-community/bluetooth-le</code> to detect room beacons within 100ms, integrating camera-based on-device biometric facial anti-spoofing and liveness detection algorithms (analyzing eye aspect ratios, micro-motion, and texture frequencies to achieve &ge; 85% confidence), and developing the circular canvas-based Faculty Live Radar sweep visualization for real-time classroom occupancy monitoring.
</p>

<p class="no-indent">
  <strong>Objective 3: Resilient Hybrid Database Architecture, Roster Data Ingestion, and Hierarchical Workflow Management (Sivagokul C – Database Management & Security Lead)</strong><br>
  To formulate, normalize, and optimize a comprehensive 16-table relational database architecture spanning Cloud Supabase PostgreSQL and a synchronized Local MySQL mirror for zero-downtime offline campus resilience. This objective entails developing high-throughput bulk Excel (.xlsx) roster ingestion pipelines with automated deduplication and column normalization, establishing transactional integrity for immutable attendance records, engineering the hierarchical mentor-guided leave and On-Duty (OD) approval workflow with automatic attendance percentage streak recalculation, and deploying bi-directional Google Sheets synchronization for administrative reporting.
</p>

<h3 class="section-heading">3.2 Synthetic Procedure and Flow Diagram of the Proposed Work</h3>

<p>
  The synthetic operational procedure of the Smart Attendance System coordinates physical radio transmission, mobile sensing, cryptographic verification, and asynchronous cloud streaming into a unified multi-stage pipeline. The entire verification lifecycle completes within seconds of a student entering the lecture venue.
</p>
`;

const p23_meth_3 = `
<div class="figure-container">
  <img src="report_assets/fig1_proposed_approach.png" alt="Figure 1: Proposed Approach">
  <div class="figure-caption">Figure 3.1: Flow Diagram of the Proposed Multi-Modal Touchless Smart Attendance System</div>
</div>

<h3 class="section-heading">3.3 Step-by-Step Explanation of the Flow Diagram</h3>

<p>
  The proposed system operates through eight interconnected functional stages that transform raw environmental radio signals and optical sensor streams into verified institutional records:
</p>

<p class="no-indent">
  <strong>1. User Authentication & Session Initialization:</strong><br>
  The workflow begins with multi-tier role authentication. Administrators, faculty members, and students authenticate via the web portal or mobile app. The FastAPI server validates credentials against bcrypt hashes (work factor &ge; 12) and issues cryptographically signed JWT tokens embedding user identity, department, and assigned role permissions (<code>admin</code>, <code>faculty</code>, <code>student</code>). When an instructor enters an assigned lecture venue (e.g., LH-204), they initiate an attendance session from the faculty dashboard, generating a dynamic rolling token and opening a dedicated WebSocket channel.
</p>
`;

const p24_meth_4 = `
<p class="no-indent">
  <strong>2. Hardware ESP32 BLE Beacon Broadcasting:</strong><br>
  Each academic lecture room is outfitted with an Espressif ESP32 microcontroller mounted centrally on the ceiling or instructor podium. The ESP32 firmware continuously advertises non-connectable Apple iBeacon protocol packets at a fixed transmission interval of 100 milliseconds. Each packet contains a 128-bit proximity UUID unique to the institution, a 16-bit Major number designating the classroom building, a 16-bit Minor number designating the specific room (e.g., Major: 200, Minor: 204), and a calibrated reference radio power (TxPower = -59.0 dBm) corresponding to signal strength at a 1-meter distance.
</p>

<p class="no-indent">
  <strong>3. RF Path-Loss Signal Filtration & Distance Computation:</strong><br>
  Upon launching the check-in view on the Android client, the mobile app initiates a targeted BLE scan filtering exclusively for the institutional beacon UUID. When the room beacon packet is intercepted, the mobile client extracts the raw Received Signal Strength Indicator (RSSI) in decibels-milliwatts (dBm). Because raw 2.4 GHz radio frequencies experience high-frequency noise and constructive/destructive multipath fading from walls, desks, and student bodies, the application applies a moving-average filter across five consecutive signal samples. The smoothed RSSI and calibrated TxPower are transmitted to the backend, which executes the indoor log-distance path loss equation:
</p>

<div style="text-align: center; font-style: italic; font-size: 14pt; margin: 14px 0; color: #000000;">
  d = 10<sup>(TxPower &minus; RSSI) / (10 &times; n)</sup>
</div>

<p>
  where n = 2.2 represents the empirical path-loss exponent calibrated for concrete academic lecture halls. If the computed distance satisfies d &le; 15.0 m and RSSI &ge; -75 dBm, the system confirms physical room presence and unlocks the second verification stage.
</p>
`;

const p25_meth_5 = `
<p class="no-indent">
  <strong>4. Edge Biometric Facial Liveness & Anti-Spoofing Verification:</strong><br>
  Once physical proximity is verified, the mobile client activates the front-facing smartphone camera. To defeat proxy attendance ("buddy punching") and presentation attacks, the client executes an edge computer vision liveness pipeline. Rather than transmitting raw biometric facial video to the cloud—which would violate student privacy and incur high bandwidth latency—facial analysis is executed on the edge device. The algorithm extracts 68 facial landmarks, computes real-time Eye Aspect Ratios (EAR) across successive video frames to detect natural involuntary blinking, and applies high-frequency texture analysis (Laplacian variance) to detect screen glare or static paper photo edges. If the liveness confidence score reaches or exceeds the institutional threshold (85.0%) and matches the enrolled facial embedding, biometric authorization is granted.
</p>

<p class="no-indent">
  <strong>5. Asynchronous WebSocket Live Radar Broadcasting:</strong><br>
  Upon successful dual-gate clearance (BLE proximity AND facial liveness), the mobile app sends a cryptographically signed payload containing student roll number, session ID, calculated distance, and biometric score to the backend endpoint <code>/api/v1/attendance/verify-and-record</code>. The server commits the attendance record and immediately broadcasts an asynchronous <code>STUDENT_CHECKIN</code> JSON event through the active WebSocket connection (<code>/ws/faculty/session/{session_id}/live</code>). Within 150 milliseconds, the faculty live radar screen renders a pulsating green indicator representing the verified student, updating classroom attendance percentages instantaneously.
</p>
`;

const p26_meth_6 = `
<p class="no-indent">
  <strong>6. Automated Timetable Engine & Collision Resolution:</strong><br>
  Concurrently with daily attendance operations, the platform runs an automated timetable scheduling engine. Academic curricula require coordinating dozens of student cohorts across constrained physical venues. When administrators import weekly timetable schedules, the engine parses day-of-week, period timings, room identifiers, and instructor assignments. It converts time strings into absolute minute intervals ([S<sub>i</sub>, E<sub>i</sub>]) and evaluates pairwise intersection conditions:
</p>

<div style="text-align: center; font-style: italic; font-size: 13pt; margin: 14px 0; color: #000000;">
  Collision = (Day<sub>a</sub> == Day<sub>b</sub>) &nbsp;&and;&nbsp; (max(S<sub>a</sub>, S<sub>b</sub>) &lt; min(E<sub>a</sub>, E<sub>b</sub>))
</div>

<p>
  If two course slots share the same room or instructor during overlapping intervals, the engine flags a collision (<code>ROOM_COLLISION</code> or <code>FACULTY_COLLISION</code>), preventing double-booking and recommending optimal alternate venues based on room capacity.
</p>

<p class="no-indent">
  <strong>7. Hierarchical Mentor Leave & On-Duty (OD) Processing Pipeline:</strong><br>
  To eliminate paper leave slips, the platform provides a digitized leave management workflow. Students submit medical leave or institutional On-Duty (OD) applications via their mobile client, attaching relevant certificates. The system inspects the student's academic record, identifies their assigned faculty mentor (<code>mentor_id</code>), and routes the application to the mentor's pending queue. Upon mentor approval, the backend automatically recalculates the student's cumulative attendance percentage and restores attendance streaks.
</p>

<p class="no-indent">
  <strong>8. Resilient Hybrid Persistence Layer:</strong><br>
  All transactional records, timetable slots, and security audit trails are mirrored between cloud Supabase PostgreSQL and a synchronized local campus MySQL 8.0 server, guaranteeing continuous operation even during external internet connectivity disruptions.
</p>
`;

const p27_meth_7 = `
<h3 class="section-heading">3.4 Selection of Components, Tools, Techniques, and Standards</h3>

<p>
  The engineering components and software frameworks selected for the Smart Attendance platform were chosen based on execution speed, architectural modularity, open-source community support, and robust enterprise scalability.
</p>

<p class="no-indent">
  <strong>A. Development Software Tools and Frameworks:</strong>
</p>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">LIBRARY / TOOL</th>
      <th style="width: 15%;">VERSION</th>
      <th>PURPOSE AND FUNCTIONALITY IN PROJECT</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>FastAPI</strong></td>
      <td>0.115.0</td>
      <td>High-performance asynchronous ASGI REST API framework; manages routing, Pydantic validation, and WebSockets.</td>
    </tr>
    <tr>
      <td><strong>React</strong></td>
      <td>19.0.0</td>
      <td>Client-side reactive component framework powering the Administrative Portal, Faculty Radar, and Student interfaces.</td>
    </tr>
    <tr>
      <td><strong>TypeScript</strong></td>
      <td>5.7.3</td>
      <td>Provides static type-safety, interface definitions, and compile-time error checking across all frontend modules.</td>
    </tr>
    <tr>
      <td><strong>Capacitor</strong></td>
      <td>6.2.0</td>
      <td>Cross-platform native runtime container; compiles web application code into a high-performance Android APK.</td>
    </tr>
    <tr>
      <td><strong>Bluetooth LE Plugin</strong></td>
      <td>8.3.0</td>
      <td><code>@capacitor-community/bluetooth-le</code>; interfaces directly with native Android Bluetooth hardware for low-latency scanning.</td>
    </tr>
    <tr>
      <td><strong>SQLAlchemy</strong></td>
      <td>2.0.38</td>
      <td>Asynchronous Object-Relational Mapping (ORM) library managing database connection pooling and relational schema queries.</td>
    </tr>
    <tr>
      <td><strong>Supabase Postgres</strong></td>
      <td>15.1</td>
      <td>Primary enterprise cloud relational database hosting 16 normalized tables with connection pooling and JSONB support.</td>
    </tr>
    <tr>
      <td><strong>MySQL</strong></td>
      <td>8.0.36</td>
      <td>Local intranet mirror database providing offline operational survivability during campus internet downtime.</td>
    </tr>
    <tr>
      <td><strong>Playwright</strong></td>
      <td>1.48.0</td>
      <td>Automated end-to-end browser and API testing framework validating the 23-module QA diagnostic test suite.</td>
    </tr>
  </tbody>
</table>
<div class="figure-caption" style="text-align: center; margin-top: 4px;">Table 1: Development Software Tools, Frameworks, and Libraries</div>
`;

const p28_meth_8 = `
<p class="no-indent">
  <strong>B. Hardware Specifications for Classroom Transmitters:</strong>
</p>

<p>
  Each academic lecture room is designated as a smart venue through the installation of a standalone Espressif ESP32 micro-beacon transmitter. The ESP32 platform was selected over commercial proprietary beacon pucks due to its cost-efficiency, open programmability, support for high-gain PCB antenna configurations, and zero ongoing subscription fees.
</p>

<table>
  <thead>
    <tr>
      <th style="width: 30%;">HARDWARE PARAMETER</th>
      <th>TECHNICAL SPECIFICATION & SELECTION JUSTIFICATION</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Microcontroller Board</strong></td>
      <td>Espressif ESP32-WROOM-32 Development Board (38-pin module).</td>
    </tr>
    <tr>
      <td><strong>Processor Core</strong></td>
      <td>32-bit Xtensa Dual-Core LX6 Microprocessor operating up to 240 MHz.</td>
    </tr>
    <tr>
      <td><strong>Wireless Radio</strong></td>
      <td>Integrated 2.4 GHz Bluetooth v4.2 BR/EDR and BLE Specification compliant.</td>
    </tr>
    <tr>
      <td><strong>RF Antenna</strong></td>
      <td>On-board Meandered Inverted-F Antenna (MIFA) with +2.0 dBi peak gain.</td>
    </tr>
    <tr>
      <td><strong>Transmit Radio Power</strong></td>
      <td>Configured via software register at +9.0 dBm (maximum transmit class).</td>
    </tr>
    <tr>
      <td><strong>Calibrated Reference Power</strong></td>
      <td>TxPower = -59.0 dBm (measured average RSSI at exactly 1.0 meter).</td>
    </tr>
    <tr>
      <td><strong>Advertising Interval</strong></td>
      <td>100 milliseconds (10 Hz broadcast rate for sub-second mobile discovery).</td>
    </tr>
    <tr>
      <td><strong>Power Consumption</strong></td>
      <td>Approximately 80 mA active current at 5V DC (&approx; 0.40 W operating power).</td>
    </tr>
    <tr>
      <td><strong>Power Delivery</strong></td>
      <td>Standard 5V/1A Micro-USB mains adapter or Power-over-Ethernet (PoE) splitter.</td>
    </tr>
    <tr>
      <td><strong>Physical Enclosure</strong></td>
      <td>Flame-retardant ABS plastic ceiling enclosure mounted 2.8m above ground.</td>
    </tr>
  </tbody>
</table>
<div class="figure-caption" style="text-align: center; margin-top: 6px;">Table 2: Hardware Specifications for ESP32 Classroom Beacon Nodes</div>

<p>
  By fixing the advertising interval at 100 milliseconds and transmit power at +9.0 dBm, the beacon guarantees that any entering student device captures at least three valid advertising packets within 300 milliseconds of cross-threshold entry.
</p>
`;

const p29_meth_9 = `
<div class="figure-container">
  <img src="report_assets/fig34_system_architecture.png" alt="Figure 3.4: System Architecture">
  <div class="figure-caption">Figure 3.4: High-Level 3-Tier Enterprise System Architecture</div>
</div>

<h3 class="section-heading">C. Presentation Layer Architecture</h3>

<p>
  The Presentation Layer provides responsive user interfaces tailored for three distinct institutional roles: administrators, faculty, and students.
</p>

<ul>
  <li>
    <strong>Administrative Web Portal:</strong> Provides institutional oversight, managing department hierarchies, faculty assignments, classroom beacon UUID mapping, and course timetables. Incorporates real-time conflict inspection tools and Excel roster sync modals.
  </li>
  <li>
    <strong>Faculty Radar Terminal:</strong> Implemented as an interactive HTML5 Canvas radar display. Renders a continuous 360-degree sweep line with green student blips appearing as check-ins are received over WebSockets. Features instant metrics cards and manual override dialogs with required audit logging.
  </li>
  <li>
    <strong>Student Mobile Application:</strong> Built using React 19 and compiled into an Android APK via Capacitor. Manages on-device BLE scanning, camera liveness capture, attendance percentage ring progress, and leave application submissions.
  </li>
</ul>
`;

const p30_meth_10 = `
<h3 class="section-heading">D. Application and Analytics Layer Architecture</h3>

<p>
  The Application Layer serves as the computational backbone of the platform, implemented entirely within the Python asynchronous ASGI framework FastAPI.
</p>

<p>
  Conventional synchronous web servers (such as standard WSGI Flask or Django) allocate one dedicated operating system thread per client connection. When dozens of students submit attendance check-ins simultaneously at the start of a lecture period, thread pools become exhausted, resulting in request queuing and high tail latencies. In contrast, FastAPI utilizes Python's native <code>asyncio</code> event loop. All network I/O operations, database queries, and WebSocket frame dispatches are executed non-blockingly using asynchronous coroutines (<code>async</code>/<code>await</code>).
</p>

<p class="no-indent">
  The Application Layer is architected into modular domain services:
</p>

<ul>
  <li>
    <strong>Authentication Service:</strong> Executes password hashing via <code>passlib.context.CryptContext</code> (bcrypt with 12 rounds), validates institutional email domains, and mints signed JWT bearer tokens.
  </li>
  <li>
    <strong>Proximity Validation Service:</strong> Ingests measured RSSI values, applies Gaussian moving-average noise smoothing, and evaluates the log-distance path loss equation to enforce classroom radial boundaries (d &le; 15.0 m).
  </li>
  <li>
    <strong>Live Radar WebSocket Hub:</strong> Manages active WebSocket connections per session ID using a thread-safe connection pool, dispatching instantaneous check-in payloads to faculty terminals.
  </li>
  <li>
    <strong>Timetable Collision Engine:</strong> Executes pairwise interval overlap analysis across scheduled course slots to detect classroom and faculty scheduling conflicts.
  </li>
  <li>
    <strong>Leave & OD Processing Service:</strong> Queries relational mentor mappings, validates leave date intervals, and cascades status transitions into cumulative attendance recalculations.
  </li>
</ul>
`;

const p31_meth_11 = `
<h3 class="section-heading">E. Database Management and Relational Data Design</h3>

<p>
  The data tier employs an enterprise relational schema designed to guarantee Third Normal Form (3NF) compliance, referential integrity, and sub-10ms query performance. The schema comprises 16 normalized tables:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 22%;">TABLE NAME</th>
      <th style="width: 25%;">PRIMARY KEY & KEYS</th>
      <th>ATTRIBUTES AND BUSINESS RESPONSIBILITY</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>users</code></td>
      <td><code>id</code> (UUID), <code>email</code> (UQ)</td>
      <td>Central authentication entity; stores email, bcrypt password hash, role (<code>admin</code>, <code>faculty</code>, <code>student</code>), and status.</td>
    </tr>
    <tr>
      <td><code>students</code></td>
      <td><code>id</code>, <code>user_id</code> (FK), <code>roll_no</code></td>
      <td>Student profile; links to user account, department ID, semester, enrolled facial vector embedding, and assigned <code>mentor_id</code>.</td>
    </tr>
    <tr>
      <td><code>faculty</code></td>
      <td><code>id</code>, <code>user_id</code> (FK), <code>emp_id</code></td>
      <td>Faculty profile; employee code, department, academic designation, room office, and mentor capability flag.</td>
    </tr>
    <tr>
      <td><code>rooms</code></td>
      <td><code>id</code>, <code>room_number</code> (UQ)</td>
      <td>Lecture hall registry; stores physical seating capacity, calibrated beacon UUID, major/minor codes, and reference TxPower.</td>
    </tr>
    <tr>
      <td><code>timetable_slots</code></td>
      <td><code>id</code>, <code>course_id</code> (FK), <code>room_id</code></td>
      <td>Weekly schedule; day-of-week, period number, start minute, end minute, assigned instructor, and student cohort.</td>
    </tr>
    <tr>
      <td><code>attendance_sessions</code></td>
      <td><code>id</code>, <code>slot_id</code> (FK), <code>token</code></td>
      <td>Active lecture session; dynamic rolling cryptographic token, session start/end timestamps, and active broadcast status.</td>
    </tr>
    <tr>
      <td><code>attendance_records</code></td>
      <td><code>id</code>, <code>session_id</code>, <code>student_id</code></td>
      <td>Immutable check-in log; verified timestamp, measured RSSI, computed distance, facial confidence score, and verification status.</td>
    </tr>
    <tr>
      <td><code>leave_requests</code></td>
      <td><code>id</code>, <code>student_id</code>, <code>mentor_id</code></td>
      <td>Student leave and On-Duty applications; start/end dates, category (Medical/OD), reason, mentor approval state, and audit notes.</td>
    </tr>
  </tbody>
</table>
<div class="figure-caption" style="text-align: center; margin-top: 6px;">Table 3: Core Relational Database Schema Architecture</div>
`;

const p32_meth_12 = `
<div class="figure-container">
  <div style="border: 1.5px solid #000; border-radius: 4px; padding: 18px; background: #fafafa; margin: 15px auto; width: 95%;">
    <div style="font-weight: bold; text-align: center; font-size: 12.5pt; margin-bottom: 15px; color: #000;">
      Figure 3.5: Attendance Verification State Machine & Security Gate Transitions
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10pt; text-align: center;">
      <div style="background: #f1f5f9; border: 1px solid #000; padding: 10px; border-radius: 4px; width: 20%; color: #000;">
        <strong>STATE 1: IDLE</strong><br>App Open<br>Awaiting Session
      </div>
      <div style="color: #000; font-weight: bold;">➔ Scan ➔</div>
      <div style="background: #ffffff; border: 1px solid #000; padding: 10px; border-radius: 4px; width: 22%; color: #000;">
        <strong>GATE 1: BLE RF</strong><br>RSSI &ge; -75 dBm<br>Dist &le; 15.0m
      </div>
      <div style="color: #000; font-weight: bold;">➔ Pass ➔</div>
      <div style="background: #f1f5f9; border: 1px solid #000; padding: 10px; border-radius: 4px; width: 22%; color: #000;">
        <strong>GATE 2: LIVENESS</strong><br>EAR Blink Detect<br>Score &ge; 85%
      </div>
      <div style="color: #000; font-weight: bold;">➔ Push ➔</div>
      <div style="background: #ffffff; border: 1px solid #000; padding: 10px; border-radius: 4px; width: 20%; color: #000;">
        <strong>STATE 4: VERIFIED</strong><br>WebSocket Push<br>Record Committed
      </div>
    </div>
  </div>
</div>

<h3 class="section-heading">F. Data Flow Modeling and Security Transition States</h3>

<p>
  Figure 3.5 illustrates the sequential state transitions enforced during the verification lifecycle. A student client cannot transition from State 1 (Idle) to State 4 (Verified) without sequentially satisfying both intermediate security gates:
</p>

<ul>
  <li>
    <strong>State 1 to Gate 1 Transition:</strong> The mobile client intercepts an active classroom beacon. If the signal fails the boundary check (d &gt; 15.0 m or RSSI &lt; -75 dBm), the application transitions immediately to <code>PROXIMITY_REJECTED</code>, prohibiting camera activation.
  </li>
  <li>
    <strong>Gate 1 to Gate 2 Transition:</strong> Once proximity is certified, the client activates the camera. If the liveness confidence score falls below 85.0% (e.g., photo spoof or occlusion), the transition to State 4 is aborted with <code>BIOMETRIC_REJECTED</code>.
  </li>
  <li>
    <strong>Gate 2 to State 4 Transition:</strong> Both gates having passed, the transaction is committed atomically to <code>attendance_records</code>, triggering the WebSocket broadcast.
  </li>
</ul>
`;

const p33_meth_13 = `
<h3 class="section-heading">3.5 Mathematical Formulations and Radio-Frequency Modeling</h3>

<p>
  To establish physical rigor and scientific accuracy, the Smart Attendance System relies on formal mathematical modeling across radio propagation physics, moving-average signal filtration, and biometric feature comparison.
</p>

<h4 class="sub-section-heading">A. Indoor Radio-Frequency Path-Loss Propagation Model</h4>

<p>
  Electromagnetic wave propagation in enclosed indoor environments is governed by the Log-Distance Path-Loss Model. The Received Signal Strength Indicator (RSSI) at a physical radial distance d from the transmitter is modeled as:
</p>

<div style="text-align: center; font-style: italic; font-size: 13pt; margin: 12px 0; color: #000000;">
  RSSI(d) = TxPower &minus; 10 &middot; n &middot; log<sub>10</sub>(d / d<sub>0</sub>) + X<sub>&sigma;</sub>
</div>

<p>where:</p>
<ul>
  <li><strong>TxPower</strong> is the calibrated received signal power in dBm measured at reference distance d<sub>0</sub> = 1.0 meter (empirically determined as -59.0 dBm for the ESP32 transmitter).</li>
  <li><strong>n</strong> is the path-loss exponent characterizing rate of signal attenuation with distance (empirically calibrated as n = 2.2 for reinforced concrete collegiate lecture halls).</li>
  <li><strong>X<sub>&sigma;</sub></strong> represents a zero-mean Gaussian distributed random variable with standard deviation &sigma; (X<sub>&sigma;</sub> &sim; N(0, &sigma;<sup>2</sup>)), modeling shadow fading from classroom furniture and human movement.</li>
</ul>

<p>
  Rearranging the propagation equation to solve for the estimated radial distance d yields:
</p>

<div style="text-align: center; font-style: italic; font-size: 13.5pt; margin: 14px 0; color: #000000;">
  d = d<sub>0</sub> &middot; 10<sup>(TxPower &minus; RSSI) / (10 &times; n)</sup> = 10<sup>(&minus;59.0 &minus; RSSI) / 22.0</sup>
</div>

<p>
  To attenuate high-frequency multipath fluctuations, raw RSSI samples are smoothed over a sliding temporal window of size W = 5:
</p>

<div style="text-align: center; font-style: italic; font-size: 13pt; margin: 12px 0; color: #000000;">
  RSSI<sub>avg</sub>(t) = (1 / W) &sum;<sub>k=0</sub><sup>W&minus;1</sup> RSSI(t &minus; k)
</div>
`;

const p34_meth_14 = `
<h4 class="sub-section-heading">B. Biometric Facial Liveness Geometry & Anti-Spoofing Formulations</h4>

<p>
  To detect involuntary physiological eye blinking and defeat static photograph attacks, the edge computer vision pipeline computes the <strong>Eye Aspect Ratio (EAR)</strong> across video frames. Given six 2D facial landmark coordinates (p<sub>1</sub>, p<sub>2</sub>, p<sub>3</sub>, p<sub>4</sub>, p<sub>5</sub>, p<sub>6</sub>) defining the eye contour:
</p>

<div style="text-align: center; font-style: italic; font-size: 13.5pt; margin: 14px 0; color: #000000;">
  EAR = ( ||p<sub>2</sub> &minus; p<sub>6</sub>|| + ||p<sub>3</sub> &minus; p<sub>5</sub>|| ) / ( 2 &middot; ||p<sub>1</sub> &minus; p<sub>4</sub>|| )
</div>

<p>
  During normal open-eye states, EAR remains constant at approximately 0.32 &plusmn; 0.04. When an involuntary blink occurs, EAR drops rapidly toward zero (EAR &lt; 0.20) for a duration of 150 to 250 milliseconds before returning to baseline. A static 2D photograph exhibits zero EAR variance over time (d(EAR)/dt = 0), causing immediate spoof rejection.
</p>

<h4 class="sub-section-heading">C. Biometric Feature Embedding Cosine Distance</h4>

<p>
  Identity authentication compares the 128-dimensional facial feature vector u extracted from the live camera frame against the enrolled reference embedding v stored in <code>students.face_embedding</code> using Cosine Similarity:
</p>

<div style="text-align: center; font-style: italic; font-size: 13.5pt; margin: 14px 0; color: #000000;">
  Cosine Similarity(u, v) = (u &middot; v) / ( ||u|| &middot; ||v|| ) = &sum;<sub>i=1</sub><sup>128</sup> (u<sub>i</sub> &middot; v<sub>i</sub>) / [ &radic;(&sum; u<sub>i</sub><sup>2</sup>) &middot; &radic;(&sum; v<sub>i</sub><sup>2</sup>) ]
</div>

<p>
  Biometric verification requires Cosine Similarity(u, v) &ge; 0.85 (85.0% match confidence).
</p>

<h4 class="sub-section-heading">D. Timetable Interval Collision Logic</h4>

<p>
  Two academic sessions A and B scheduled on day D with start minutes S<sub>A</sub>, S<sub>B</sub> and end minutes E<sub>A</sub>, E<sub>B</sub> exhibit an overlap collision if and only if:
</p>

<div style="text-align: center; font-style: italic; font-size: 13pt; margin: 12px 0; color: #000000;">
  Collision(A, B) &hArr; (Day<sub>A</sub> == Day<sub>B</sub>) &nbsp;&and;&nbsp; (max(S<sub>A</sub>, S<sub>B</sub>) &lt; min(E<sub>A</sub>, E<sub>B</sub>))
</div>
`;

const p35_meth_15 = `
<h3 class="section-heading">3.6 Testing and Validation Metrics</h3>

<p>
  To rigorously quantify system performance, reliability, and security, a structured set of empirical verification metrics was defined across radio frequency, biometric, and network dimensions:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 28%;">EVALUATION METRIC</th>
      <th style="width: 25%;">MATHEMATICAL FORMULATION</th>
      <th>ACCEPTABLE THRESHOLD & OPERATIONAL GOAL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>False Acceptance Rate (FAR)</strong></td>
      <td>FAR = False Positives / Impostor Attempts</td>
      <td>FAR &le; 1.0% (Strict security; prevents unauthorized or proxy check-ins).</td>
    </tr>
    <tr>
      <td><strong>False Rejection Rate (FRR)</strong></td>
      <td>FRR = False Negatives / Genuine Attempts</td>
      <td>FRR &le; 2.0% (User convenience; genuine students verified smoothly).</td>
    </tr>
    <tr>
      <td><strong>Path-Loss Distance Error (&Delta;d)</strong></td>
      <td>&Delta;d = |d<sub>estimated</sub> &minus; d<sub>physical</sub>|</td>
      <td>&Delta;d &le; 1.5 m within 10m radius; wall attenuation &gt; 10m.</td>
    </tr>
    <tr>
      <td><strong>Radar Push Latency (T<sub>radar</sub>)</strong></td>
      <td>T<sub>radar</sub> = t<sub>rendered</sub> &minus; t<sub>clicked</sub></td>
      <td>T<sub>radar</sub> &le; 250 ms (Average target: &lt; 150 ms for real-time feel).</td>
    </tr>
    <tr>
      <td><strong>Classroom Batch Duration</strong></td>
      <td>T<sub>batch</sub> = t<sub>last_student</sub> &minus; t<sub>session_start</sub></td>
      <td>T<sub>batch</sub> &le; 45 seconds for 60 enrolled students.</td>
    </tr>
    <tr>
      <td><strong>Timetable Collision Recall</strong></td>
      <td>Recall = Collisions Flagged / Total Collisions</td>
      <td>100.0% (Zero tolerance for double-booked classrooms or instructors).</td>
    </tr>
    <tr>
      <td><strong>Database Failover Latency</strong></td>
      <td>T<sub>failover</sub> = t<sub>local_ready</sub> &minus; t<sub>cloud_down</sub></td>
      <td>T<sub>failover</sub> &le; 500 ms seamless switch to local MySQL mirror.</td>
    </tr>
  </tbody>
</table>
<div class="figure-caption" style="text-align: center; margin-top: 6px;">Table 4: Testing and Verification Evaluation Metrics</div>
`;

const p36_meth_16 = `
<h3 class="section-heading">3.7 Future Scope of the Methodology</h3>

<p>
  While the proposed methodology successfully addresses proximity verification, biometric anti-spoofing, real-time radar broadcasting, and timetable optimization, several methodological extensions can expand its institutional utility:
</p>

<ul>
  <li>
    <strong>Integration of Ultra-Wideband (UWB) Centimeter Ranging:</strong> Incorporating IEEE 802.15.4z UWB transceiver nodes alongside BLE to achieve precise two-way time-of-flight spatial positioning within 10 centimeters, enabling automatic row-and-seat assignment detection.
  </li>
  <li>
    <strong>Edge Vision Micro-Sensors for Continuous Headcount:</strong> Deploying low-power ESP32-CAM micro-cameras at lecture room ceilings to perform automated, continuous headcount tallies, cross-verifying active physical chair occupancy against logged digital check-ins.
  </li>
  <li>
    <strong>Zero-Knowledge Cryptographic Attendance Proofs:</strong> Implementing zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) to prove that a student is inside the classroom and biometrically verified without storing or transmitting raw facial vector embeddings to central servers.
  </li>
  <li>
    <strong>Predictive Student Absenteeism Analytics:</strong> Leveraging recurrent sequence models to analyze historical attendance streaks, forecasting student dropout risks and automatically scheduling academic counseling sessions.
  </li>
</ul>

<p>
  In summary, this chapter established the mathematical foundations, multi-tier system architecture, hardware specifications, relational database schema, and validation criteria governing the Smart Attendance platform. The combination of hardware-calibrated BLE beacons, on-device biometric liveness verification, and asynchronous WebSocket streaming delivers an uncompromised, zero-proxy institutional standard.
</p>
`;

module.exports = {
  p21_meth_1,
  p22_meth_2,
  p23_meth_3,
  p24_meth_4,
  p25_meth_5,
  p26_meth_6,
  p27_meth_7,
  p28_meth_8,
  p29_meth_9,
  p30_meth_10,
  p31_meth_11,
  p32_meth_12,
  p33_meth_13,
  p34_meth_14,
  p35_meth_15,
  p36_meth_16
};
