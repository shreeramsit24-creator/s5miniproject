// report_frontmatter.cjs
// Front matter generation module for BIT & Anna University project report

function makePage(pageNum, content) {
  let footer = '';
  if (pageNum) {
    footer = `<div class="page-num">${pageNum}</div>`;
  }
  return `
  <div class="report-page">
    <div class="page-inner">
      ${content}
    </div>
    ${footer}
  </div>
`;
}

const p1_cover = `
<div style="text-align: center; padding-top: 25px;">
  <h1 class="center-title" style="font-size: 14pt; margin-bottom: 25px; line-height: 1.45;">
    SMART ATTENDANCE: NEXT-GENERATION MULTI-MODAL TOUCHLESS ATTENDANCE SYSTEM WITH HARDWARE-CALIBRATED BLE BEACONS, BIOMETRIC VERIFICATION, AND REAL-TIME WEBSOCKET RADAR
  </h1>

  <div style="font-size: 13pt; font-weight: bold; margin-bottom: 20px; text-transform: uppercase;">
    PROJECT REPORT
  </div>

  <div style="font-size: 12pt; font-style: italic; margin-bottom: 12px;">
    Submitted by
  </div>

  <div style="font-size: 13pt; font-weight: bold; line-height: 1.8; margin-bottom: 20px;">
    VARUN M (7376242IT335)<br>
    SHREERAM S (7376242IT300)<br>
    SIVAGOKUL C (7376242IT303)
  </div>

  <div style="font-size: 12pt; font-style: italic; margin-bottom: 12px;">
    In partial fulfilment for the award of the degree of
  </div>

  <div style="font-size: 13.5pt; font-weight: bold; margin-bottom: 5px;">
    BACHELOR OF TECHNOLOGY
  </div>
  <div style="font-size: 12pt; margin-bottom: 5px;">in</div>
  <div style="font-size: 13.5pt; font-weight: bold; margin-bottom: 25px;">
    INFORMATION TECHNOLOGY
  </div>

  <div style="margin-bottom: 20px;">
    <img src="public/bit-logo.png" style="width: 140px; height: auto;" alt="BIT Logo">
  </div>

  <div style="font-size: 13pt; font-weight: bold; line-height: 1.4; margin-bottom: 15px;">
    BANNARI AMMAN INSTITUTE OF TECHNOLOGY<br>
    <span style="font-size: 11pt; font-weight: normal;">(An Autonomous Institution Affiliated to Anna University, Chennai)</span><br>
    SATHYAMANGALAM – 638 401
  </div>

  <div style="font-size: 13pt; font-weight: bold; margin-top: 20px;">
    ANNA UNIVERSITY: CHENNAI 600 025<br>
    OCTOBER 2026
  </div>
</div>
`;

const p2_inner_title = p1_cover; // Same as cover page

const p3_bonafide = `
<h2 class="chapter-heading" style="margin-top: 20px; margin-bottom: 30px;">BONAFIDE CERTIFICATE</h2>

<p>
  Certified that this project report <strong>“SMART ATTENDANCE: NEXT-GENERATION MULTI-MODAL TOUCHLESS ATTENDANCE SYSTEM WITH HARDWARE-CALIBRATED BLE BEACONS, BIOMETRIC VERIFICATION, AND REAL-TIME WEBSOCKET RADAR”</strong> is the Bonafide work of <strong>“VARUN M (7376242IT335), SHREERAM S (7376242IT300), SIVAGOKUL C (7376242IT303)”</strong>, who carried out the project work under my supervision.
</p>

<p>
  Certified further that to the best of my knowledge the work reported herein does not form part of any other project work or dissertation on the basis of which a degree or award was conferred on an earlier occasion on this or any other candidate.
</p>

<div style="display: flex; justify-content: space-between; margin-top: 110px; font-size: 12pt;">
  <div style="width: 45%;">
    <div style="height: 45px;"></div>
    <strong>Dr. GOMATHI R</strong><br>
    HEAD OF THE DEPARTMENT<br>
    Department of Information Technology<br>
    Bannari Amman Institute of Technology<br>
    Sathyamangalam – 638 401
  </div>
  <div style="width: 45%; text-align: right;">
    <div style="height: 45px;"></div>
    <strong>Prof. VAANATHI S</strong><br>
    SUPERVISOR / FACULTY GUIDE<br>
    Assistant Professor Level II<br>
    Department of Information Technology<br>
    Bannari Amman Institute of Technology<br>
    Sathyamangalam – 638 401
  </div>
</div>

<div style="margin-top: 90px; font-size: 12pt;">
  Submitted for Project Viva Voce examination held on ………………………………
</div>

<div style="display: flex; justify-content: space-between; margin-top: 70px; font-size: 12pt; font-weight: bold;">
  <div>INTERNAL EXAMINER I</div>
  <div>INTERNAL EXAMINER II</div>
</div>
`;

const p4_declaration = `
<h2 class="chapter-heading" style="margin-top: 20px; margin-bottom: 30px;">DECLARATION</h2>

<p>
  We affirm that the project work titled <strong>“SMART ATTENDANCE: NEXT-GENERATION MULTI-MODAL TOUCHLESS ATTENDANCE SYSTEM WITH HARDWARE-CALIBRATED BLE BEACONS, BIOMETRIC VERIFICATION, AND REAL-TIME WEBSOCKET RADAR”</strong> being submitted in partial fulfillment for the award of the degree of <strong>Bachelor of Technology in Information Technology</strong> is the record of original work done by us under the guidance of <strong>Prof. VAANATHI S</strong>, Assistant Professor Level II, Department of Information Technology. It has not formed a part of any other project work(s) submitted for the award of any degree or diploma, either in this or any other University.
</p>

<div style="margin-top: 70px; display: flex; justify-content: flex-end;">
  <div style="text-align: right; line-height: 2.2; font-size: 12pt;">
    <strong>VARUN M (7376242IT335)</strong><br>
    <strong>SHREERAM S (7376242IT300)</strong><br>
    <strong>SIVAGOKUL C (7376242IT303)</strong>
  </div>
</div>

<p class="no-indent" style="margin-top: 60px;">
  I certify that the declaration made above by the candidates is true.
</p>

<div style="margin-top: 60px; font-size: 12pt;">
  <div style="height: 40px;"></div>
  <strong>Prof. VAANATHI S</strong><br>
  <em>Assistant Professor Level II</em><br>
  <em>Department of Information Technology</em><br>
  <em>Bannari Amman Institute of Technology</em><br>
  <em>Sathyamangalam – 638 401</em>
</div>
`;

const p5_acknowledgement = `
<h2 class="chapter-heading" style="margin-top: 20px; margin-bottom: 25px;">ACKNOWLEDGEMENT</h2>

<p>
  We would like to enunciate heartfelt thanks to our esteemed Chairman <strong>Dr. S.V. Balasubramaniam</strong>, and the respected Principal <strong>Dr. C. Palanisamy</strong>, for providing excellent facilities, institutional infrastructure, and unwavering support during the course of study in this institute.
</p>

<p>
  We are deeply grateful to <strong>Dr. Gomathi R</strong>, Head of the Department, Department of Information Technology, for her valuable suggestions, academic leadership, and continuous encouragement to carry out the project work successfully.
</p>

<p>
  We wish to express our sincere thanks to our Faculty Guide <strong>Prof. Vaanathi S</strong>, Assistant Professor Level II, Department of Information Technology, for her constructive ideas, inspirations, critical guidance, and much needed technical support extended throughout the design, development, and testing phases to complete our project work.
</p>

<p>
  We would also like to thank our friends, departmental faculty members, technical laboratory mentors, and non-teaching staff who have directly and indirectly contributed to the successful completion and demonstration of this project.
</p>

<div style="margin-top: 70px; display: flex; justify-content: flex-end;">
  <div style="text-align: right; line-height: 2.0; font-size: 12pt;">
    <strong>VARUN M (7376242IT335)</strong><br>
    <strong>SHREERAM S (7376242IT300)</strong><br>
    <strong>SIVAGOKUL C (7376242IT303)</strong>
  </div>
</div>
`;

const p6_abstract_1 = `
<h2 class="chapter-heading" style="margin-top: 20px; margin-bottom: 25px;">ABSTRACT</h2>

<p>
  Educational institutions coordinate hundreds of course lectures, student cohorts, and instructional venues daily. However, conventional attendance recording paradigms—ranging from manual roll calls to fixed fingerprint terminals and static QR codes—suffer from substantial structural deficiencies. Manual paper attendance consumes between 10 to 15 minutes of vital pedagogical instructional time per lecture and remains chronically vulnerable to proxy signing ("buddy punching"). Fixed doorway biometric readers cause acute physical entry bottlenecks, take 3 to 5 seconds per student, and raise physical contact hygiene concerns. Meanwhile, projected QR codes and GPS geofences are easily subverted via screenshot distribution over messaging applications and mobile GPS mock-location spoofing tools. Therefore, developing a touchless, multi-modal, and cryptographically verified attendance ecosystem has become imperative for modern smart academic institutions.
</p>

<p>
  To address these critical operational challenges, this project introduces <strong>Smart Attendance</strong>, an enterprise-grade, touchless attendance and classroom occupancy management system. The proposed system unites hardware-calibrated Bluetooth Low Energy (BLE) micro-beacons with on-device biometric facial anti-spoofing verification to establish unambiguous proof of physical presence within concrete lecture halls. The platform operates on a three-tier asynchronous architecture powered by a high-performance FastAPI backend, a cross-platform Capacitor mobile client (Android), and a reactive administrative dashboard built with React 19 and TypeScript. Physical proximity is mathematically enforced using the log-distance radio frequency path-loss propagation model (d = 10<sup>(TxPower &minus; RSSI) / (10 &times; n)</sup>), validating that the student is located strictly within a calibrated 15-meter radial boundary.
</p>
`;

const p7_abstract_2 = `
<p>
  Upon successful BLE proximity gating, students undergo an on-device biometric facial liveness scan analyzing landmark contours, eye blink dynamics, and micro-texture variations to defeat static photo replays, smartphone screen attacks, and printed masks. Validated check-in events are streamed via full-duplex WebSockets to an interactive Faculty Live Radar screen with sub-150 millisecond push latency, presenting instructors with instantaneous visual confirmation of verified seating rates. Concurrently, an automated timetable interval analysis engine detects room and instructor double-booking collisions, while a hierarchical leave and On-Duty (OD) management pipeline dynamically recalculates student attendance streaks upon mentor authorization.
</p>

<p>
  Rigorous empirical testing was conducted across full classroom trials (60 enrolled students), radio-frequency distance calibration experiments, and adversarial presentation attack simulations. The system achieved a 99.0% biometric verification accuracy, a 0.8% False Acceptance Rate (FAR), and a 1.2% False Rejection Rate (FRR). The entire attendance registration process for 60 students was concluded in under 28 seconds, eliminating 12 minutes of wasted instructional time per lecture. Furthermore, the 23-module automated QA test suite verified 100% architectural integrity across cloud Supabase PostgreSQL and local MySQL mirror databases. Smart Attendance establishes a robust, privacy-preserving, and zero-proxy standard for institutional attendance management.
</p>

<p class="no-indent" style="margin-top: 25px;">
  <strong>Keywords:</strong> Bluetooth Low Energy (BLE), Touchless Attendance, Facial Biometrics, Anti-Spoofing, WebSocket Radar, Timetable Collision Resolution, Smart Campus, FastAPI, Android APK.
</p>
`;

const p8_toc_1 = `
<h2 class="chapter-heading" style="margin-top: 15px; margin-bottom: 20px;">TABLE OF CONTENTS</h2>

<table>
  <thead>
    <tr>
      <th style="width: 15%;">CHAPTER NO.</th>
      <th>TITLE</th>
      <th style="width: 15%; text-align: center;">PAGE NO.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td></td><td><strong>BONAFIDE CERTIFICATE</strong></td><td style="text-align: center;">--</td></tr>
    <tr><td></td><td><strong>DECLARATION</strong></td><td style="text-align: center;">--</td></tr>
    <tr><td></td><td><strong>ACKNOWLEDGEMENT</strong></td><td style="text-align: center;">i</td></tr>
    <tr><td></td><td><strong>ABSTRACT</strong></td><td style="text-align: center;">ii</td></tr>
    <tr><td></td><td><strong>LIST OF TABLES</strong></td><td style="text-align: center;">vi</td></tr>
    <tr><td></td><td><strong>LIST OF FIGURES</strong></td><td style="text-align: center;">vii</td></tr>
    <tr><td></td><td><strong>ABBREVIATIONS AND NOMENCLATURE</strong></td><td style="text-align: center;">viii</td></tr>
    <tr><td><strong>1</strong></td><td><strong>INTRODUCTION</strong></td><td style="text-align: center;"><strong>1</strong></td></tr>
    <tr><td></td><td>1.1 Background of the Work</td><td style="text-align: center;">1</td></tr>
    <tr><td></td><td>1.2 Motivation</td><td style="text-align: center;">2</td></tr>
    <tr><td></td><td>1.3 Problem Statement</td><td style="text-align: center;">3</td></tr>
    <tr><td></td><td>1.4 Scope of the Project</td><td style="text-align: center;">4</td></tr>
    <tr><td><strong>2</strong></td><td><strong>LITERATURE SURVEY</strong></td><td style="text-align: center;"><strong>6</strong></td></tr>
    <tr><td></td><td>2.1 Survey of Existing Works</td><td style="text-align: center;">6</td></tr>
    <tr><td></td><td>2.2 Critical Analysis and Research Gaps</td><td style="text-align: center;">9</td></tr>
    <tr><td></td><td>2.3 Summary of Problem Formulation</td><td style="text-align: center;">9</td></tr>
    <tr><td><strong>3</strong></td><td><strong>OBJECTIVES AND METHODOLOGY</strong></td><td style="text-align: center;"><strong>10</strong></td></tr>
    <tr><td></td><td>3.1 Objectives of the Proposed Work</td><td style="text-align: center;">10</td></tr>
    <tr><td></td><td>3.2 Synthetic Procedure and Flow Diagram</td><td style="text-align: center;">11</td></tr>
    <tr><td></td><td>3.3 Step-by-Step Explanation of the Flow Diagram</td><td style="text-align: center;">12</td></tr>
    <tr><td></td><td>3.4 Selection of Components, Tools, Techniques, and Standards</td><td style="text-align: center;">16</td></tr>
    <tr><td></td><td>3.5 Mathematical Formulations and Radio-Frequency Modeling</td><td style="text-align: center;">22</td></tr>
    <tr><td></td><td>3.6 Testing and Validation Metrics</td><td style="text-align: center;">24</td></tr>
    <tr><td></td><td>3.7 Future Scope of the Methodology</td><td style="text-align: center;">25</td></tr>
  </tbody>
</table>
`;

const p9_toc_2 = `
<h2 class="chapter-heading" style="margin-top: 15px; margin-bottom: 20px;">TABLE OF CONTENTS (CONTINUED)</h2>

<table>
  <thead>
    <tr>
      <th style="width: 15%;">CHAPTER NO.</th>
      <th>TITLE</th>
      <th style="width: 15%; text-align: center;">PAGE NO.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>4</strong></td><td><strong>DESIGN AND IMPLEMENTATION</strong></td><td style="text-align: center;"><strong>26</strong></td></tr>
    <tr><td></td><td>4.1 Module 1: Hardware ESP32 Beacon Firmware & Advertising</td><td style="text-align: center;">26</td></tr>
    <tr><td></td><td>4.2 Module 2: Client BLE Device Scanning & RSSI Extraction</td><td style="text-align: center;">28</td></tr>
    <tr><td></td><td>4.3 Module 3: Indoor Path-Loss Distance Calculation Engine</td><td style="text-align: center;">29</td></tr>
    <tr><td></td><td>4.4 Module 4: Biometric Facial Anti-Spoofing & Liveness Pipeline</td><td style="text-align: center;">30</td></tr>
    <tr><td></td><td>4.5 Module 5: Real-Time WebSocket Live Radar & Broadcast Hub</td><td style="text-align: center;">32</td></tr>
    <tr><td></td><td>4.6 Module 6: Automated Timetable Engine & Collision Resolution</td><td style="text-align: center;">34</td></tr>
    <tr><td></td><td>4.7 Module 7: Database Management & Bulk Institutional Ingestion</td><td style="text-align: center;">36</td></tr>
    <tr><td></td><td>4.8 Module 8: Hierarchical Leave & On-Duty Approval Workflow</td><td style="text-align: center;">37</td></tr>
    <tr><td></td><td>4.9 Design Considerations & Practical Notes</td><td style="text-align: center;">38</td></tr>
    <tr><td><strong>5</strong></td><td><strong>RESULTS AND DISCUSSION</strong></td><td style="text-align: center;"><strong>39</strong></td></tr>
    <tr><td></td><td>5.1 Results</td><td style="text-align: center;">39</td></tr>
    <tr><td></td><td>&emsp;5.1.1 BLE RSSI Path-Loss Calibration & Distance Experiments</td><td style="text-align: center;">39</td></tr>
    <tr><td></td><td>&emsp;5.1.2 Biometric Facial Anti-Spoofing & Liveness Test Results</td><td style="text-align: center;">40</td></tr>
    <tr><td></td><td>&emsp;5.1.3 WebSocket Live Radar Concurrency & Broadcast Latency</td><td style="text-align: center;">41</td></tr>
    <tr><td></td><td>&emsp;5.1.4 Timetable Collision Detection & Optimization Benchmarks</td><td style="text-align: center;">42</td></tr>
    <tr><td></td><td>&emsp;5.1.5 Comprehensive Automated End-to-End QA Diagnostic Suite</td><td style="text-align: center;">42</td></tr>
    <tr><td></td><td>&emsp;5.1.6 Stage-by-Stage Latency & Processing Time Analysis</td><td style="text-align: center;">43</td></tr>
    <tr><td></td><td>5.2 Discussion of Important Findings</td><td style="text-align: center;">43</td></tr>
    <tr><td></td><td>&emsp;5.2.4 Comparative Analysis with Existing Attendance Systems</td><td style="text-align: center;">44</td></tr>
    <tr><td></td><td>5.3 Significance, Strengths, and Limitations of Proposed Work</td><td style="text-align: center;">45</td></tr>
    <tr><td></td><td>5.4 Cost-Benefit Analysis</td><td style="text-align: center;">45</td></tr>
    <tr><td><strong>6</strong></td><td><strong>CONCLUSIONS & SUGGESTIONS FOR FUTURE WORK</strong></td><td style="text-align: center;"><strong>46</strong></td></tr>
    <tr><td></td><td>6.1 Conclusion</td><td style="text-align: center;">46</td></tr>
    <tr><td></td><td>6.2 Suggestions for Future Work</td><td style="text-align: center;">47</td></tr>
    <tr><td><strong>7</strong></td><td><strong>REFERENCES</strong></td><td style="text-align: center;"><strong>48</strong></td></tr>
    <tr><td><strong>APPENDIX I</strong></td><td><strong>BILL OF MATERIALS & HARDWARE SPECIFICATIONS</strong></td><td style="text-align: center;"><strong>50</strong></td></tr>
    <tr><td><strong>APPENDIX II</strong></td><td><strong>COMPLETE SOURCE CODE LISTINGS</strong></td><td style="text-align: center;"><strong>52</strong></td></tr>
    <tr><td><strong>APPENDIX III</strong></td><td><strong>STANDARD BENCHMARK TABLES & EXTENDED LOGS</strong></td><td style="text-align: center;"><strong>56</strong></td></tr>
    <tr><td><strong>APPENDIX IV</strong></td><td><strong>PROJECT PARTICIPATION & HACKATHON PROOF</strong></td><td style="text-align: center;"><strong>58</strong></td></tr>
    <tr><td><strong>APPENDIX V</strong></td><td><strong>WORK CONTRIBUTION REPORT</strong></td><td style="text-align: center;"><strong>59</strong></td></tr>
    <tr><td><strong>APPENDIX VI</strong></td><td><strong>ORIGINALITY / PLAGIARISM CLEARANCE REPORT</strong></td><td style="text-align: center;"><strong>61</strong></td></tr>
  </tbody>
</table>
`;

const p10_lot_lof = `
<h2 class="chapter-heading" style="margin-top: 15px; margin-bottom: 15px;">LIST OF TABLES</h2>

<table>
  <thead>
    <tr>
      <th style="width: 20%;">TABLE NO.</th>
      <th>TITLE</th>
      <th style="width: 15%; text-align: center;">PAGE NO.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Table 1</td><td>Development Software Tools, Frameworks, and Libraries</td><td style="text-align: center;">16</td></tr>
    <tr><td>Table 2</td><td>Hardware Specifications for ESP32 Classroom Beacon Nodes</td><td style="text-align: center;">17</td></tr>
    <tr><td>Table 3</td><td>Core Relational Database Schema Architecture (Supabase / MySQL)</td><td style="text-align: center;">20</td></tr>
    <tr><td>Table 4</td><td>Testing and Verification Evaluation Metrics</td><td style="text-align: center;">24</td></tr>
    <tr><td>Table 5</td><td>Empirical BLE RSSI Measurements vs Predicted Distance vs Error</td><td style="text-align: center;">39</td></tr>
    <tr><td>Table 6</td><td>Biometric Liveness Verification and Presentation Attack Evaluation</td><td style="text-align: center;">40</td></tr>
    <tr><td>Table 7</td><td>WebSocket Radar Concurrency Throughput and Latency Benchmarks</td><td style="text-align: center;">41</td></tr>
    <tr><td>Table 8</td><td>Execution Processing Latency Across Sequential Verification Stages</td><td style="text-align: center;">43</td></tr>
    <tr><td>Table 9</td><td>Comparative Evaluation of Proposed System vs Existing Technologies</td><td style="text-align: center;">44</td></tr>
    <tr><td>Table 10</td><td>Hardware and System Deployment Cost Analysis (INR)</td><td style="text-align: center;">45</td></tr>
  </tbody>
</table>

<h2 class="chapter-heading" style="margin-top: 25px; margin-bottom: 15px;">LIST OF FIGURES</h2>

<table>
  <thead>
    <tr>
      <th style="width: 20%;">FIGURE NO.</th>
      <th>TITLE</th>
      <th style="width: 15%; text-align: center;">PAGE NO.</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Figure 1</td><td>Multi-Modal Touchless Smart Attendance Proposed Approach</td><td style="text-align: center;">11</td></tr>
    <tr><td>Figure 3.4</td><td>High-Level 3-Tier Enterprise System Architecture</td><td style="text-align: center;">18</td></tr>
    <tr><td>Figure 3.5</td><td>State Machine and Data Flow of the Attendance Verification Pipeline</td><td style="text-align: center;">21</td></tr>
    <tr><td>Figure 4.1</td><td>Faculty Live Radar Seating Dashboard and Check-in Feed</td><td style="text-align: center;">33</td></tr>
    <tr><td>Figure 4.2</td><td>Student Mobile APK BLE Scanning and Facial Liveness Interfaces</td><td style="text-align: center;">31</td></tr>
    <tr><td>Figure 4.4</td><td>Timetable Interval Conflict Detection and Resource Optimizer</td><td style="text-align: center;">35</td></tr>
    <tr><td>Figure 4.6</td><td>ESP32 Micro-Beacon Hardware Transmitter and Classroom Setup</td><td style="text-align: center;">27</td></tr>
    <tr><td>Figure 5.2</td><td>Empirical BLE RF RSSI Path-Loss Distance Calibration Curve</td><td style="text-align: center;">40</td></tr>
  </tbody>
</table>
`;

const p11_abbreviations = `
<h2 class="chapter-heading" style="margin-top: 15px; margin-bottom: 25px;">ABBREVIATIONS AND NOMENCLATURE</h2>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">ABBREVIATION</th>
      <th>EXPANSION / FULL FORM</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>BLE</strong></td><td>Bluetooth Low Energy</td></tr>
    <tr><td><strong>RSSI</strong></td><td>Received Signal Strength Indicator (measured in dBm)</td></tr>
    <tr><td><strong>TxPower</strong></td><td>Transmitted Radio Power at 1 Meter Calibrated Reference</td></tr>
    <tr><td><strong>UUID</strong></td><td>Universally Unique Identifier (128-bit hexadecimal identifier)</td></tr>
    <tr><td><strong>FAR</strong></td><td>False Acceptance Rate (Biometric security metric)</td></tr>
    <tr><td><strong>FRR</strong></td><td>False Rejection Rate (Biometric convenience metric)</td></tr>
    <tr><td><strong>JWT</strong></td><td>JSON Web Token (RFC 7519 cryptographic token)</td></tr>
    <tr><td><strong>HMAC</strong></td><td>Hash-Based Message Authentication Code (SHA-256)</td></tr>
    <tr><td><strong>ASGI</strong></td><td>Asynchronous Server Gateway Interface</td></tr>
    <tr><td><strong>WebSocket</strong></td><td>Full-Duplex Bidirectional TCP Protocol (RFC 6455)</td></tr>
    <tr><td><strong>RBAC</strong></td><td>Role-Based Access Control</td></tr>
    <tr><td><strong>OD</strong></td><td>On-Duty Sanction (Official institutional academic leave)</td></tr>
    <tr><td><strong>ORM</strong></td><td>Object-Relational Mapping (SQLAlchemy)</td></tr>
    <tr><td><strong>PoE</strong></td><td>Power over Ethernet</td></tr>
    <tr><td><strong>APK</strong></td><td>Android Application Package</td></tr>
    <tr><td><strong>UWB</strong></td><td>Ultra-Wideband (IEEE 802.15.4z spatial pulse technology)</td></tr>
    <tr><td><strong>CNN</strong></td><td>Convolutional Neural Network</td></tr>
    <tr><td><strong>EAR</strong></td><td>Eye Aspect Ratio (Geometric blink metric)</td></tr>
    <tr><td><strong>SSD</strong></td><td>Single Shot MultiBox Detector</td></tr>
    <tr><td><strong>ERP</strong></td><td>Enterprise Resource Planning</td></tr>
  </tbody>
</table>
`;

module.exports = {
  makePage,
  p1_cover,
  p2_inner_title,
  p3_bonafide,
  p4_declaration,
  p5_acknowledgement,
  p6_abstract_1,
  p7_abstract_2,
  p8_toc_1,
  p9_toc_2,
  p10_lot_lof,
  p11_abbreviations
};
