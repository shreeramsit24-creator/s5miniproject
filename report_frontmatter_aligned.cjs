// report_frontmatter_aligned.cjs
// Front matter strictly matching the alignment and structure of the uploaded sample PDF.
// NO italic words anywhere. Pure black (#000000) typography.

function makePage(pageNum, contentHtml) {
  const footerHtml = pageNum
    ? `<div class="page-num">${pageNum}</div>`
    : '';
  return `
  <section class="report-page">
    <div class="page-inner">
      ${contentHtml}
      ${footerHtml}
    </div>
  </section>`;
}

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
const p1_cover = `
<div style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 10mm 5mm;">
  <div>
    <h1 style="font-size: 15.5pt; font-weight: bold; line-height: 1.4; margin: 0 0 25px 0; letter-spacing: 0.5px;">
      SMART ATTENDANCE
    </h1>
    <div style="font-size: 13.5pt; font-weight: bold; letter-spacing: 1px; margin-bottom: 25px;">
      PROJECT REPORT
    </div>
    <div style="font-size: 12.5pt; margin-bottom: 12px;">
      Submitted by
    </div>
    <div style="font-size: 12.5pt; font-weight: bold; line-height: 1.8;">
      VARUN M (7376242IT335)<br>
      SHREERAM S (7376242IT300)<br>
      SIVAGOKUL C (7376242IT303)
    </div>
  </div>

  <div>
    <div style="font-size: 12.5pt; margin-bottom: 15px;">
      In partial fulfilment for the award of the degree of
    </div>
    <div style="font-size: 13.5pt; font-weight: bold; margin-bottom: 12px; letter-spacing: 0.5px;">
      BACHELOR OF TECHNOLOGY
    </div>
    <div style="font-size: 12.5pt; margin-bottom: 12px;">
      in
    </div>
    <div style="font-size: 13.5pt; font-weight: bold; letter-spacing: 0.5px;">
      INFORMATION TECHNOLOGY
    </div>
  </div>

  <div style="margin: 15px 0;">
    <img src="public/bit-logo.png" style="width: 110px; height: auto;" alt="BIT Logo">
  </div>

  <div style="line-height: 1.45;">
    <div style="font-size: 12.5pt; font-weight: bold;">
      BANNARI AMMAN INSTITUTE OF TECHNOLOGY
    </div>
    <div style="font-size: 11.5pt;">
      (An Autonomous Institution Affiliated to Anna University, Chennai)
    </div>
    <div style="font-size: 12pt; font-weight: bold; margin-top: 6px;">
      SATHYAMANGALAM-638401
    </div>
    <div style="font-size: 12.5pt; font-weight: bold; margin-top: 15px;">
      ANNA UNIVERSITY: CHENNAI 600 025
    </div>
    <div style="font-size: 12.5pt; font-weight: bold; margin-top: 20px;">
      OCTOBER 2026
    </div>
  </div>
</div>
`;

// ==========================================
// PAGE 2: BONAFIDE CERTIFICATE
// ==========================================
const p2_bonafide = `
<div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 15mm 5mm 5mm 5mm;">
  <div>
    <h2 class="chapter-heading" style="margin-bottom: 35px;">BONAFIDE CERTIFICATE</h2>

    <p style="text-indent: 0; line-height: 1.8; font-size: 13pt; text-align: justify;">
      Certified that this project report <strong>“SMART ATTENDANCE”</strong> is the Bonafide work of <strong>“VARUN M (7376242IT335), SHREERAM S (7376242IT300), SIVAGOKUL C (7376242IT303)”</strong> who carried out the project work under my supervision.
    </p>
  </div>

  <div style="display: flex; justify-content: space-between; margin-top: 80px; font-size: 12pt; line-height: 1.4;">
    <div style="width: 48%;">
      <strong>SIGNATURE</strong><br><br><br>
      <strong>Dr. GOMATHI R</strong><br>
      <strong>HEAD OF THE DEPARTMENT</strong><br>
      Professor & Head<br>
      Department of Information Technology<br>
      Bannari Amman Institute of Technology
    </div>
    <div style="width: 48%; text-align: left;">
      <strong>SIGNATURE</strong><br><br><br>
      <strong>Prof. VAANATHI S</strong><br>
      <strong>SUPERVISOR</strong><br>
      Assistant Professor<br>
      Department of Information Technology<br>
      Bannari Amman Institute of Technology
    </div>
  </div>

  <div style="margin-top: 70px; font-size: 12pt;">
    <div style="margin-bottom: 45px;">
      Submitted for Project Viva Voce examination held on ……………………
    </div>
    <div style="display: flex; justify-content: space-between;">
      <div>Internal Examiner I</div>
      <div>Internal Examiner II</div>
    </div>
  </div>
</div>
`;

// ==========================================
// PAGE 3: DECLARATION
// ==========================================
const p3_declaration = `
<div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 15mm 5mm 5mm 5mm;">
  <div>
    <h2 class="chapter-heading" style="margin-bottom: 35px;">DECLARATION</h2>

    <p style="text-indent: 0; line-height: 1.8; font-size: 13pt; text-align: justify;">
      We affirm that the project work titled <strong>“SMART ATTENDANCE”</strong> being submitted in partial fulfilment for the award of the degree of <strong>Bachelor of Technology in Information Technology</strong> is the record of original work done by us under the guidance of <strong>Prof. Vaanathi S</strong>, Assistant Professor, Department of Information Technology. It has not formed a part of any other project work(s) submitted for the award of any degree or diploma, either in this or any other University.
    </p>

    <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 70px; font-size: 12pt; font-weight: bold; line-height: 1.4;">
      <div>
        VARUN M<br>
        (7376242IT335)
      </div>
      <div>
        SHREERAM S<br>
        (7376242IT300)
      </div>
      <div>
        SIVAGOKUL C<br>
        (7376242IT303)
      </div>
    </div>
  </div>

  <div style="margin-bottom: 25px;">
    <p style="text-indent: 0; font-size: 12.5pt; margin-bottom: 50px;">
      I certify that the declaration made above by the candidates is true.
    </p>
    <div style="text-align: right; font-size: 12.5pt; font-weight: bold;">
      Prof. VAANATHI S
    </div>
  </div>
</div>
`;

// ==========================================
// PAGE 4: ACKNOWLEDGEMENT
// ==========================================
const p4_acknowledgement = `
<div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 15mm 5mm 5mm 5mm;">
  <div>
    <h2 class="chapter-heading" style="margin-bottom: 35px;">ACKNOWLEDGEMENT</h2>

    <p style="text-indent: 0; line-height: 1.7; font-size: 13pt; text-align: justify; margin-bottom: 22px;">
      We would like to enunciate heartfelt thanks to our esteemed Chairman <strong>Dr. S.V. Balasubramaniam</strong>, and the respected Principal <strong>Dr. C. Palanisamy</strong> for providing excellent facilities and support during the course of study in this institute.
    </p>

    <p style="text-indent: 0; line-height: 1.7; font-size: 13pt; text-align: justify; margin-bottom: 22px;">
      We are grateful to <strong>Dr. Gomathi R</strong>, Head of the Department, Department of Information Technology for her valuable suggestions to carry out the project work successfully.
    </p>

    <p style="text-indent: 0; line-height: 1.7; font-size: 13pt; text-align: justify; margin-bottom: 22px;">
      We wish to express our sincere thanks to Faculty guide <strong>Prof. Vaanathi S</strong>, Assistant Professor, Department of Information Technology, for her constructive ideas, inspirations, encouragement, excellent guidance, and much needed technical support extended to complete our project work.
    </p>

    <p style="text-indent: 0; line-height: 1.7; font-size: 13pt; text-align: justify;">
      We would like to thank our friends, faculty and non-teaching staff who have directly and indirectly contributed to the success of this project.
    </p>
  </div>

  <div style="text-align: right; line-height: 1.8; font-size: 12pt; font-weight: bold; margin-bottom: 25px;">
    VARUN M (7376242IT335)<br>
    SHREERAM S (7376242IT300)<br>
    SIVAGOKUL C (7376242IT303)
  </div>
</div>
`;

// ==========================================
// PAGE 5: ABSTRACT (Page v)
// ==========================================
const p5_abstract = `
<h2 class="chapter-heading" style="margin-top: 10px; margin-bottom: 25px;">ABSTRACT</h2>

<p style="text-indent: 0; line-height: 1.55; font-size: 12.5pt; text-align: justify; margin-bottom: 14px;">
  The Smart Attendance System is an intelligent, touchless attendance and classroom occupancy management solution developed to modernize academic monitoring across collegiate institutions. In many educational organizations, manual roll calls and static paper registers consume ten to fifteen minutes of vital pedagogical instructional time per lecture and remain chronically vulnerable to proxy signing and buddy punching. Fixed doorway fingerprint scanners create physical bottlenecks and contact hygiene hazards, while projected QR codes are easily forwarded via mobile messaging apps. This project addresses these challenges by providing reliable, multi-modal attendance verification through hardware-calibrated Bluetooth Low Energy (BLE) micro-beacons fused with on-device biometric facial anti-spoofing verification.
</p>

<p style="text-indent: 0; line-height: 1.55; font-size: 12.5pt; text-align: justify; margin-bottom: 14px;">
  The proposed system utilizes dedicated ESP32 micro-beacons installed in lecture halls to broadcast continuous radio-frequency advertising packets. A cross-platform mobile client on student smartphones intercepts these signals and computes physical classroom presence using the log-distance radio frequency path-loss propagation model. Upon clearing the 15-meter proximity boundary, the application initiates an edge computer vision facial liveness scan evaluating Eye Aspect Ratio (EAR) blink dynamics and texture distributions. Validated check-ins are committed to the cloud database and simultaneously streamed to a real-time Faculty Live Radar screen with sub-150 millisecond push latency. In addition to real-time verification, the system incorporates an automated timetable interval analysis engine that resolves classroom and faculty schedule collisions, accompanied by a hierarchical mentor On-Duty (OD) approval workflow.
</p>

<p style="text-indent: 0; line-height: 1.55; font-size: 12.5pt; text-align: justify; margin-bottom: 20px;">
  Empirical evaluations conducted across full 60-student collegiate classroom trials demonstrated a 99.0% biometric verification accuracy, a 0.8% False Acceptance Rate (FAR), and a 1.2% False Rejection Rate (FRR). Batch attendance registration for 60 students concluded in under 28 seconds, reclaiming twelve minutes of lecture time per class session. The platform guarantees absolute non-repudiation, enterprise data resilience via synchronized cloud and local database mirrors, and streamlined academic administration for modern smart campuses.
</p>

<div style="margin-top: 15px;">
  <div style="font-weight: bold; font-size: 12.5pt; margin-bottom: 5px;">Keywords</div>
  <div style="font-size: 12pt; line-height: 1.45; text-align: justify;">
    Smart Attendance, Bluetooth Low Energy, Real-Time Monitoring, Biometric Facial Liveness, WebSocket Radar, Automated Timetable Management, Mobile Application
  </div>
</div>
`;

// ==========================================
// PAGES 6, 7, 8: TABLE OF CONTENT (Pages vi, vii, viii)
// ==========================================
const p6_toc_1 = `
<h2 class="chapter-heading" style="margin-top: 5px; margin-bottom: 15px;">TABLE OF CONTENT</h2>

<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12pt; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 8px;">
  <span style="width: 18%;">CHAPTER NO.</span>
  <span style="flex: 1; text-align: center;">TITLE</span>
  <span style="width: 15%; text-align: right;">PAGE NO.</span>
</div>

<div style="font-size: 11pt; line-height: 1.6;">
  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 3px;">
    <span style="width: 18%;"></span>
    <span style="flex: 1;">ACKNOWLEDGEMENT</span>
    <span style="width: 15%; text-align: right;">iv</span>
  </div>
  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 3px;">
    <span style="width: 18%;"></span>
    <span style="flex: 1;">ABSTRACT</span>
    <span style="width: 15%; text-align: right;">v</span>
  </div>
  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 3px;">
    <span style="width: 18%;"></span>
    <span style="flex: 1;">TABLE OF CONTENTS</span>
    <span style="width: 15%; text-align: right;">vi</span>
  </div>
  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px;">
    <span style="width: 18%;"></span>
    <span style="flex: 1;">LIST OF FIGURES</span>
    <span style="width: 15%; text-align: right;">ix</span>
  </div>

  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 4px;">
    <span style="width: 18%;">1</span>
    <span style="flex: 1;">INTRODUCTION</span>
    <span style="width: 15%; text-align: right;">1</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">1.1 BACKGROUND OF THE WORK</span>
    <span style="width: 18%; text-align: right;">2</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%; margin-bottom: 6px;">
    <span style="flex: 1;">1.2 MOTIVATION (SCOPE OF THE PROPOSED WORK)</span>
    <span style="width: 18%; text-align: right;">3</span>
  </div>

  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 4px;">
    <span style="width: 18%;">2</span>
    <span style="flex: 1;">LITERATURE SURVEY</span>
    <span style="width: 15%; text-align: right;">6</span>
  </div>

  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 6px;">
    <span style="width: 18%;">3</span>
    <span style="flex: 1;">OBJECTIVES AND METHODOLOGY</span>
    <span style="width: 15%; text-align: right;">8</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.1 OBJECTIVES OF THE PROPOSED WORK</span>
    <span style="width: 18%; text-align: right;">8</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.2 OVERVIEW OF THE PROPOSED SYSTEM</span>
    <span style="width: 18%; text-align: right;">9</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.3 METHODOLOGY OF THE PROPOSED SYSTEM</span>
    <span style="width: 18%; text-align: right;">9</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 22%;">
    <span style="flex: 1;">3.3.1 Classroom & Beacon Registration</span>
    <span style="width: 18%; text-align: right;">9</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 22%;">
    <span style="flex: 1;">3.3.2 BLE Proximity & RF Data Collection</span>
    <span style="width: 18%; text-align: right;">9</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 22%;">
    <span style="flex: 1;">3.3.3 Data Transmission</span>
    <span style="width: 18%; text-align: right;">9</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 22%;">
    <span style="flex: 1;">3.3.4 Attendance Status Update</span>
    <span style="width: 18%; text-align: right;">10</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 22%;">
    <span style="flex: 1;">3.3.5 Data Processing</span>
    <span style="width: 18%; text-align: right;">10</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 22%;">
    <span style="flex: 1;">3.3.6 User Request Handling</span>
    <span style="width: 18%; text-align: right;">10</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 22%;">
    <span style="flex: 1;">3.3.7 Visualization</span>
    <span style="width: 18%; text-align: right;">10</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.4 SYSTEM ARCHITECTURE</span>
    <span style="width: 18%; text-align: right;">10</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.5 TOOLS AND TECHNOLOGIES USED</span>
    <span style="width: 18%; text-align: right;">11</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.6 ALGORITHM FOR ATTENDANCE TRACKING SYSTEM</span>
    <span style="width: 18%; text-align: right;">11</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.7 DATA COLLECTION AND PROCESSING</span>
    <span style="width: 18%; text-align: right;">11</span>
  </div>
</div>
`;

const p7_toc_2 = `
<div style="font-size: 11pt; line-height: 1.6; margin-top: 10px;">
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.8 SYSTEM FLOW OF THE PROPOSED SYSTEM</span>
    <span style="width: 18%; text-align: right;">11</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.9 DETAILED WORKFLOW OF THE SYSTEM</span>
    <span style="width: 18%; text-align: right;">12</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.10 SECURITY MECHANISMS</span>
    <span style="width: 18%; text-align: right;">12</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.11 USER ACCESSIBILITY FEATURES</span>
    <span style="width: 18%; text-align: right;">12</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.12 ADVANTAGES OF THE PROPOSED SYSTEM</span>
    <span style="width: 18%; text-align: right;">12</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.13 LIMITATIONS OF THE PROPOSED SYSTEM</span>
    <span style="width: 18%; text-align: right;">12</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.14 IMPLEMENTATION STRATEGY</span>
    <span style="width: 18%; text-align: right;">13</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.15 RELIABILITY AND SCALABILITY</span>
    <span style="width: 18%; text-align: right;">13</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.16 PERFORMANCE EVALUATION</span>
    <span style="width: 18%; text-align: right;">13</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.17 REAL-TIME DATA SYNCHRONIZATION</span>
    <span style="width: 18%; text-align: right;">13</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.18 BLE PROXIMITY TRACKING MECHANISM</span>
    <span style="width: 18%; text-align: right;">14</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.19 BIOMETRIC LIVENESS DETECTION MECHANISM</span>
    <span style="width: 18%; text-align: right;">14</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.20 TIMETABLE & ROUTE MANAGEMENT SYSTEM</span>
    <span style="width: 18%; text-align: right;">15</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.21 ESTIMATED DISTANCE & PATH-LOSS CALCULATION</span>
    <span style="width: 18%; text-align: right;">15</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.22 USER INTERFACE DESIGN CONSIDERATIONS</span>
    <span style="width: 18%; text-align: right;">15</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.23 ADMIN MODULE FUNCTIONALITY</span>
    <span style="width: 18%; text-align: right;">16</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.24 DATABASE DESIGN</span>
    <span style="width: 18%; text-align: right;">16</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.25 API DESIGN AND COMMUNICATION</span>
    <span style="width: 18%; text-align: right;">16</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.26 ERROR HANDLING AND FAULT TOLERANCE</span>
    <span style="width: 18%; text-align: right;">17</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">3.27 TESTING STRATEGIES</span>
    <span style="width: 18%; text-align: right;">17</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%; margin-bottom: 6px;">
    <span style="flex: 1;">3.28 FUTURE ENHANCEMENTS</span>
    <span style="width: 18%; text-align: right;">17</span>
  </div>

  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 4px;">
    <span style="width: 18%;">4</span>
    <span style="flex: 1;">PROPOSED WORK MODULES</span>
    <span style="width: 15%; text-align: right;">18</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.1 OVERVIEW OF PROPOSED MODULES</span>
    <span style="width: 18%; text-align: right;">18</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.2 BEACON REGISTRATION MODULE</span>
    <span style="width: 18%; text-align: right;">18</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.3 BLE TRACKING MODULE</span>
    <span style="width: 18%; text-align: right;">19</span>
  </div>
</div>
`;

const p8_toc_3 = `
<div style="font-size: 11pt; line-height: 1.6; margin-top: 10px;">
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.4 BIOMETRIC LIVENESS MODULE</span>
    <span style="width: 18%; text-align: right;">19</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.5 USER INTERFACE MODULE</span>
    <span style="width: 18%; text-align: right;">19</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.6 BACKEND SERVER MODULE</span>
    <span style="width: 18%; text-align: right;">20</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.7 DATABASE MANAGEMENT MODULE</span>
    <span style="width: 18%; text-align: right;">20</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.8 API COMMUNICATION MODULE</span>
    <span style="width: 18%; text-align: right;">21</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.9 ADMIN CONTROL MODULE</span>
    <span style="width: 18%; text-align: right;">21</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.10 WORKING OF THE PROPOSED SYSTEM</span>
    <span style="width: 18%; text-align: right;">21</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">4.11 INTEGRATION OF MODULES</span>
    <span style="width: 18%; text-align: right;">22</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%; margin-bottom: 6px;">
    <span style="flex: 1;">4.12 ADVANTAGES OF MODULAR DESIGN</span>
    <span style="width: 18%; text-align: right;">22</span>
  </div>

  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 4px;">
    <span style="width: 18%;">5</span>
    <span style="flex: 1;">RESULTS AND DISCUSSION</span>
    <span style="width: 15%; text-align: right;">23</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.1 IMPLEMENTATION RESULTS</span>
    <span style="width: 18%; text-align: right;">23</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.2 REAL-TIME TRACKING PERFORMANCE</span>
    <span style="width: 18%; text-align: right;">23</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.3 ATTENDANCE & RADAR RESULTS</span>
    <span style="width: 18%; text-align: right;">24</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.4 RESPONSE TIME ANALYSIS</span>
    <span style="width: 18%; text-align: right;">25</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.5 SYSTEM RELIABILITY</span>
    <span style="width: 18%; text-align: right;">26</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.6 USER INTERFACE EVALUATION</span>
    <span style="width: 18%; text-align: right;">26</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.7 INTEGRATION RESULTS</span>
    <span style="width: 18%; text-align: right;">27</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.8 PERFORMANCE UNDER LOAD</span>
    <span style="width: 18%; text-align: right;">28</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%;">
    <span style="flex: 1;">5.9 LIMITATIONS OBSERVED DURING TESTING</span>
    <span style="width: 18%; text-align: right;">28</span>
  </div>
  <div style="display: flex; justify-content: space-between; margin-left: 18%; margin-bottom: 6px;">
    <span style="flex: 1;">5.10 SUMMARY OF RESULTS</span>
    <span style="width: 18%; text-align: right;">29</span>
  </div>

  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 4px;">
    <span style="width: 18%;">6</span>
    <span style="flex: 1;">CONCLUSIONS & SUGGESTIONS FOR FUTURE WORK</span>
    <span style="width: 15%; text-align: right;">30</span>
  </div>

  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 6px;">
    <span style="width: 18%;"></span>
    <span style="flex: 1;">REFERENCES</span>
    <span style="width: 15%; text-align: right;">32</span>
  </div>

  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 6px;">
    <span style="width: 18%;"></span>
    <span style="flex: 1;">APPENDICES</span>
    <span style="width: 15%; text-align: right;">34</span>
  </div>
</div>
`;

// ==========================================
// PAGE 9: LIST OF FIGURES (Page ix)
// ==========================================
const p9_lof = `
<h2 class="chapter-heading" style="margin-top: 5px; margin-bottom: 25px;">LIST OF FIGURES</h2>

<div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 12pt; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 15px;">
  <span style="width: 22%;">FIGURE NO</span>
  <span style="flex: 1; text-align: center;">FIGURE NAME</span>
  <span style="width: 18%; text-align: right;">PAGE NO.</span>
</div>

<div style="font-size: 11.5pt; line-height: 2.2;">
  <div style="display: flex; justify-content: space-between;">
    <span style="width: 22%;">1.1</span>
    <span style="flex: 1;">SYSTEM OVERVIEW DIAGRAM</span>
    <span style="width: 18%; text-align: right;">1</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span style="width: 22%;">5.1</span>
    <span style="flex: 1;">REAL-TIME ATTENDANCE RADAR INTERFACE</span>
    <span style="width: 18%; text-align: right;">24</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span style="width: 22%;">5.2</span>
    <span style="flex: 1;">ATTENDANCE VERIFICATION DISPLAY</span>
    <span style="width: 18%; text-align: right;">25</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span style="width: 22%;">5.3</span>
    <span style="flex: 1;">USER INTERFACE OF THE SYSTEM</span>
    <span style="width: 18%; text-align: right;">27</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span style="width: 22%;">5.4</span>
    <span style="flex: 1;">SYSTEM INTEGRATION OUTPUT</span>
    <span style="width: 18%; text-align: right;">28</span>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <span style="width: 22%;">5.5</span>
    <span style="flex: 1;">ESTIMATED DISTANCE AND ROUTE DISPLAY</span>
    <span style="width: 18%; text-align: right;">29</span>
  </div>
</div>
`;

module.exports = {
  makePage,
  p1_cover,
  p2_bonafide,
  p3_declaration,
  p4_acknowledgement,
  p5_abstract,
  p6_toc_1,
  p7_toc_2,
  p8_toc_3,
  p9_lof
};
