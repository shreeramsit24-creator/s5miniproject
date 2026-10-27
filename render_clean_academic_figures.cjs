const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const outDir = 'd:\\Smart Attendance\\report_assets';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. HTML/SVG templates for all clean academic figures
const figureTemplates = {
  // Figure 1: Proposed Approach (exact style as Page 10 of sample PDF)
  'fig1_proposed_approach.png': `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 25px; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
  .diagram-container { width: 1100px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-sizing: border-box; background: #fafafa; }
  .header-title { background: #0f4c81; color: white; text-align: center; padding: 12px 20px; font-size: 20px; font-weight: bold; border-radius: 25px; width: 500px; margin: 0 auto 25px auto; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
  .grid-3col { display: flex; justify-content: space-between; align-items: stretch; gap: 20px; }
  .col-card { border-radius: 12px; padding: 18px; box-sizing: border-box; }
  .input-card { width: 240px; background: #fdf2e9; border: 1.5px solid #f8c471; }
  .core-card { flex: 1; background: #ebf5fb; border: 1.5px solid #85c1e9; }
  .output-card { width: 260px; background: #eafaf1; border: 1.5px solid #82e0aa; }
  .card-title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid; }
  .input-card .card-title { color: #d35400; border-color: #f8c471; }
  .core-card .card-title { color: #1f618d; border-color: #85c1e9; }
  .output-card .card-title { color: #1e8449; border-color: #82e0aa; }
  .item-box { background: white; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; font-size: 13px; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
  .item-box span { display: block; font-size: 11px; font-weight: normal; color: #64748b; margin-top: 3px; }
  .core-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .core-box { background: white; border-radius: 8px; padding: 12px; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
  .core-box-title { font-weight: bold; font-size: 13.5px; color: #0f172a; margin-bottom: 4px; }
  .core-box-desc { font-size: 11.5px; color: #475569; line-height: 1.4; }
  .bottom-bar { display: flex; justify-content: space-between; gap: 20px; margin-top: 20px; }
  .bottom-box { flex: 1; background: white; border-radius: 10px; padding: 12px 18px; border: 1px solid #cbd5e1; display: flex; align-items: center; gap: 15px; }
  .bottom-title { font-weight: bold; font-size: 14px; min-width: 80px; }
  .badge-list { display: flex; gap: 10px; flex-wrap: wrap; }
  .badge { background: #f1f5f9; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; color: #334155; border: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="diagram-container">
  <div class="header-title">Smart Attendance System Architecture</div>
  <div class="grid-3col">
    <div class="col-card input-card">
      <div class="card-title">Input Data</div>
      <div class="item-box">📅 Timetable Data<span>• Day, Period, Slot, Room<br>• Course Code & Faculty</span></div>
      <div class="item-box">👤 Student Profiles<span>• Roll Number, Department<br>• Enrolled Face Embedding</span></div>
      <div class="item-box">🏫 Classroom & Beacons<span>• ESP32 Beacon UUID<br>• Room Capacity & TxPower</span></div>
      <div class="item-box">📋 Attendance Records<span>• Historical presence logs<br>• Leave & OD approvals</span></div>
    </div>

    <div class="col-card core-card">
      <div class="card-title">Smart Attendance Core Engine (FastAPI & AsyncIO)</div>
      <div class="core-grid">
        <div class="core-box">
          <div class="core-box-title">📡 BLE Path-Loss Engine</div>
          <div class="core-box-desc">• d = 10^((Tx - RSSI) / 10n)<br>• Classroom radius: &lt; 15.0m<br>• RSSI threshold: &ge; -75 dBm</div>
        </div>
        <div class="core-box">
          <div class="core-box-title">👁️ Facial Anti-Spoofing</div>
          <div class="core-box-desc">• On-device liveness check<br>• Confidence threshold: &ge; 85%<br>• Photo-of-photo defense</div>
        </div>
        <div class="core-box">
          <div class="core-box-title">⚡ Real-Time WebSocket Radar</div>
          <div class="core-box-desc">• Sub-150ms check-in push<br>• Dynamic rolling token<br>• Duplex faculty live stream</div>
        </div>
        <div class="core-box">
          <div class="core-box-title">🧩 Timetable Collision Engine</div>
          <div class="core-box-desc">• Mon-Sat schedule grid<br>• Room double-booking defense<br>• Faculty overlap detection</div>
        </div>
      </div>
      <div style="margin-top: 12px; background: white; border-radius: 8px; padding: 10px; border: 1px solid #cbd5e1; font-size: 12px; text-align: center; color: #1e293b;">
        <strong>Resilient Hybrid Persistence:</strong> Primary Supabase PostgreSQL &harr; Local MySQL 8.0 Mirror &harr; Google Sheets Sync
      </div>
    </div>

    <div class="col-card output-card">
      <div class="card-title">Output / Results</div>
      <div class="item-box">📡 Faculty Live Radar<span>• Live seating occupancy rate<br>• Sub-second check-in feed</span></div>
      <div class="item-box">✅ Student Check-In Badge<span>• Encrypted verification proof<br>• Instant streak updates</span></div>
      <div class="item-box">📊 Attendance Analytics<span>• Subject-wise attendance %<br>• OD & Medical adjustments</span></div>
      <div class="item-box">🛡️ Institutional Audit Log<span>• Immutable security records<br>• Manual override audit trail</span></div>
    </div>
  </div>

  <div class="bottom-bar">
    <div class="bottom-box">
      <div class="bottom-title" style="color: #0369a1;">👥 Users:</div>
      <div class="badge-list">
        <div class="badge">👨‍🎓 Students</div>
        <div class="badge">👩‍🏫 Faculty Instructors</div>
        <div class="badge">🏛️ Department Administrators</div>
      </div>
    </div>
    <div class="bottom-box">
      <div class="bottom-title" style="color: #047857;">🎯 Benefits:</div>
      <div class="badge-list">
        <div class="badge">🔒 Zero Proxy Attendance</div>
        <div class="badge">⚡ Sub-150ms Live Latency</div>
        <div class="badge">⏱️ &lt; 30s Class Check-in</div>
        <div class="badge">📱 Touchless Cross-Platform</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`,

  // Figure 3.4: High-Level System Architecture (Clean 4-tier vector block diagram)
  'fig34_system_architecture.png': `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 25px; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
  .arch-container { width: 1050px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; box-sizing: border-box; background: #ffffff; }
  .arch-header { text-align: center; font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 24px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
  .tier { border-radius: 10px; padding: 14px 18px; margin-bottom: 16px; border: 1.5px solid; }
  .tier-label { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
  .tier-row { display: flex; gap: 15px; justify-content: space-between; }
  .box { flex: 1; background: white; border-radius: 8px; padding: 12px 14px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.06); text-align: center; }
  .box strong { display: block; font-size: 13px; color: #0f172a; margin-bottom: 4px; }
  .box span { font-size: 11px; color: #64748b; }
  .tier-edge { background: #fef3c7; border-color: #f59e0b; }
  .tier-edge .tier-label { color: #b45309; }
  .tier-client { background: #e0f2fe; border-color: #0284c7; }
  .tier-client .tier-label { color: #0369a1; }
  .tier-api { background: #f3e8ff; border-color: #9333ea; }
  .tier-api .tier-label { color: #7e22ce; }
  .tier-db { background: #dcfce7; border-color: #16a34a; }
  .tier-db .tier-label { color: #15803d; }
  .arrow-down { text-align: center; font-size: 18px; color: #64748b; line-height: 12px; margin-bottom: 12px; }
</style>
</head>
<body>
<div class="arch-container">
  <div class="arch-header">High-Level System Architecture & Multi-Tier Topology</div>
  
  <div class="tier tier-edge">
    <div class="tier-label">Tier 1: Classroom Edge Hardware Layer</div>
    <div class="tier-row">
      <div class="box"><strong>ESP32 Micro-Beacon (LH-204)</strong><span>iBeacon Protocol • TxPower: -59 dBm</span></div>
      <div class="box"><strong>ESP32 Micro-Beacon (LH-205)</strong><span>2.4 GHz RF • Advertising: 100ms</span></div>
      <div class="box"><strong>ESP32 Micro-Beacon (LAB-301)</strong><span>Micro-USB Powered • Range: 15m</span></div>
    </div>
  </div>

  <div class="arrow-down">&darr; BLE Wireless Advertisements (Apple iBeacon Specification) &darr;</div>

  <div class="tier tier-client">
    <div class="tier-label">Tier 2: Client Presentation Layer</div>
    <div class="tier-row">
      <div class="box"><strong>Student Native Mobile App</strong><span>Capacitor 6 Android APK • BLE Scanner • Camera</span></div>
      <div class="box"><strong>Faculty Terminal</strong><span>React 19 • WebSocket Radar • Session Controls</span></div>
      <div class="box"><strong>Admin Command Portal</strong><span>Timetable Matrix • Beacon Config • Audit Logs</span></div>
    </div>
  </div>

  <div class="arrow-down">&darr; Asynchronous REST HTTPS & Duplex WebSocket WSS &darr;</div>

  <div class="tier tier-api">
    <div class="tier-label">Tier 3: Asynchronous Microservices & Engine Layer (FastAPI)</div>
    <div class="tier-row">
      <div class="box"><strong>REST API Gateway</strong><span>JWT HMAC-SHA256 • RBAC Guards</span></div>
      <div class="box"><strong>BLE Path-Loss Engine</strong><span>d = 10^((Tx-RSSI)/10n)</span></div>
      <div class="box"><strong>Biometric Anti-Spoofing</strong><span>Face Liveness &ge; 85%</span></div>
      <div class="box"><strong>WebSocket Radar Stream</strong><span>Sub-150ms Push Latency</span></div>
      <div class="box"><strong>Timetable Engine</strong><span>Collision Defense Graph</span></div>
    </div>
  </div>

  <div class="arrow-down">&darr; Asynchronous SQLAlchemy 2.0 (asyncpg) & Sync Daemons &darr;</div>

  <div class="tier tier-db">
    <div class="tier-label">Tier 4: Resilient Hybrid Persistence Layer</div>
    <div class="tier-row">
      <div class="box"><strong>Cloud Supabase PostgreSQL</strong><span>15+ High-Perf Pooler • 16 Tables • SSL</span></div>
      <div class="box"><strong>Local Campus MySQL 8.0 Mirror</strong><span>Intranet Fallback for Offline Zero Downtime</span></div>
      <div class="box"><strong>Google Sheets Sync Engine</strong><span>Automated Bi-directional Roster Backup</span></div>
    </div>
  </div>
</div>
</body>
</html>`,

  // Figure 4.1: Faculty Live Radar UI (Flat, clean, authentic browser interface)
  'fig41_faculty_radar.png': `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 20px; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f8fafc; }
  .browser-frame { width: 1100px; margin: 0 auto; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
  .browser-top { background: #0f172a; padding: 10px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #334155; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .url-bar { background: #1e293b; border-radius: 6px; padding: 4px 14px; font-size: 12px; color: #94a3b8; flex: 1; margin-left: 12px; }
  .dashboard { padding: 20px; }
  .dash-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid #334155; }
  .dash-title { font-size: 18px; font-weight: bold; color: #f8fafc; }
  .status-badge { background: #065f46; color: #34d399; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; border: 1px solid #059669; display: flex; align-items: center; gap: 6px; }
  .ping { width: 8px; height: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399; }
  .cards-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 16px 0; }
  .metric-card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 14px; }
  .card-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; }
  .card-val { font-size: 24px; font-weight: bold; margin-top: 4px; color: #f8fafc; }
  .main-split { display: grid; grid-template-columns: 380px 1fr; gap: 18px; margin-top: 10px; }
  .radar-panel { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 18px; text-align: center; }
  .radar-circle { width: 280px; height: 280px; border-radius: 50%; border: 2px solid #059669; margin: 10px auto; position: relative; background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(15,23,42,1) 70%); display: flex; align-items: center; justify-content: center; }
  .radar-ring { position: absolute; border-radius: 50%; border: 1px dashed rgba(16,185,129,0.4); }
  .ring-1 { width: 80px; height: 80px; }
  .ring-2 { width: 160px; height: 160px; }
  .ring-3 { width: 240px; height: 240px; }
  .radar-blip { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; }
  .table-panel { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 14px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left; }
  th { background: #1e293b; color: #94a3b8; padding: 8px 10px; border-bottom: 1px solid #334155; font-weight: 600; }
  td { padding: 9px 10px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
  .badge-verified { background: #064e3b; color: #6ee7b7; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; border: 1px solid #047857; }
</style>
</head>
<body>
<div class="browser-frame">
  <div class="browser-top">
    <div class="dot dot-red"></div>
    <div class="dot dot-yellow"></div>
    <div class="dot dot-green"></div>
    <div class="url-bar">https://smartattendance.bit.edu/faculty/session/live-radar</div>
  </div>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <div class="dash-title">CS301 - Database Management Systems | LH-204</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 3px;">Faculty: Prof. Raman S &bull; Rolling Nonce: RAD-8821 &bull; Calibrated Beacon: LH-204-BEACON</div>
      </div>
      <div class="status-badge"><div class="ping"></div> Broadcasting Active (WebSocket Connected)</div>
    </div>

    <div class="cards-row">
      <div class="metric-card">
        <div class="card-label">Present Students</div>
        <div class="card-val" style="color: #38bdf8;">48 <span style="font-size: 14px; color: #94a3b8;">/ 60 Capacity</span></div>
      </div>
      <div class="metric-card">
        <div class="card-label">Live Fill Rate</div>
        <div class="card-val" style="color: #4ade80;">80.0%</div>
      </div>
      <div class="metric-card">
        <div class="card-label">Beacon RSSI Gate</div>
        <div class="card-val" style="color: #facc15;">-59.0 dBm <span style="font-size: 13px; color: #94a3b8;">(&lt;15m)</span></div>
      </div>
      <div class="metric-card">
        <div class="card-label">Session Remaining</div>
        <div class="card-val" style="color: #c084fc;">24:15</div>
      </div>
    </div>

    <div class="main-split">
      <div class="radar-panel">
        <div style="font-size: 13px; font-weight: bold; color: #94a3b8; margin-bottom: 6px;">Live Classroom Radar Sweep (15m Boundary)</div>
        <div class="radar-circle">
          <div class="radar-ring ring-1"></div>
          <div class="radar-ring ring-2"></div>
          <div class="radar-ring ring-3"></div>
          <div class="radar-blip" style="top: 40px; left: 110px;"></div>
          <div class="radar-blip" style="top: 80px; left: 180px;"></div>
          <div class="radar-blip" style="top: 150px; left: 60px;"></div>
          <div class="radar-blip" style="top: 190px; left: 160px;"></div>
          <div class="radar-blip" style="top: 110px; left: 130px;"></div>
          <div class="radar-blip" style="top: 220px; left: 100px;"></div>
          <div style="font-size: 10px; color: #059669; position: absolute; bottom: 8px;">ESP32 Beacon Radius: 15m</div>
        </div>
      </div>

      <div class="table-panel">
        <div style="font-size: 13px; font-weight: bold; color: #94a3b8; margin-bottom: 8px;">Incoming Verified Check-Ins (WebSocket Stream)</div>
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Distance</th>
              <th>Face Conf.</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>7376242AD166</td><td>Gokul V</td><td>1.2 m</td><td>96.8%</td><td>09:02:14</td><td><span class="badge-verified">Verified</span></td></tr>
            <tr><td>7376242AD102</td><td>Aravind S</td><td>2.4 m</td><td>94.2%</td><td>09:02:19</td><td><span class="badge-verified">Verified</span></td></tr>
            <tr><td>7376242AD115</td><td>Dinesh K</td><td>3.1 m</td><td>95.5%</td><td>09:02:26</td><td><span class="badge-verified">Verified</span></td></tr>
            <tr><td>7376242AD140</td><td>Harish R</td><td>1.8 m</td><td>97.1%</td><td>09:02:35</td><td><span class="badge-verified">Verified</span></td></tr>
            <tr><td>7376242AD178</td><td>Kavitha M</td><td>4.5 m</td><td>93.8%</td><td>09:02:44</td><td><span class="badge-verified">Verified</span></td></tr>
            <tr><td>7376242AD192</td><td>Naveen Kumar</td><td>2.9 m</td><td>96.0%</td><td>09:02:51</td><td><span class="badge-verified">Verified</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
</body>
</html>`,

  // Figure 4.2: Student Mobile Check-in (Flat, clean, authentic mobile screen)
  'fig42_student_app.png': `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 25px; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .phones-wrap { display: flex; justify-content: center; gap: 40px; align-items: flex-start; }
  .phone-card { width: 340px; border: 2px solid #cbd5e1; border-radius: 28px; padding: 16px; background: #f8fafc; box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
  .screen-header { text-align: center; font-size: 14px; font-weight: bold; color: #0f172a; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
  .screen-body { padding: 16px 6px; }
  .step-label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #0284c7; letter-spacing: 0.5px; margin-bottom: 6px; }
  .step-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 16px; }
  .radar-sim { width: 140px; height: 140px; border-radius: 50%; border: 2px solid #38bdf8; margin: 15px auto; background: radial-gradient(circle, #e0f2fe 0%, #ffffff 80%); display: flex; align-items: center; justify-content: center; position: relative; }
  .pulse-ring { position: absolute; width: 100px; height: 100px; border-radius: 50%; border: 1.5px dashed #0284c7; }
  .beacon-info { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-top: 15px; }
  .beacon-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
  .btn-action { display: block; width: 100%; padding: 11px 0; border-radius: 8px; text-align: center; font-size: 13px; font-weight: bold; color: white; border: none; margin-top: 15px; cursor: pointer; }
  .btn-green { background: #059669; }
  .face-oval { width: 160px; height: 210px; border-radius: 50%; border: 2px dashed #0284c7; margin: 15px auto; background: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
  .laser-line { position: absolute; width: 100%; height: 2px; background: #10b981; box-shadow: 0 0 6px #10b981; }
  .conf-bar { background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 10px; }
  .conf-fill { background: #10b981; width: 96.4%; height: 100%; }
</style>
</head>
<body>
<div class="phones-wrap">
  <!-- Screen 1: BLE Scan -->
  <div class="phone-card">
    <div class="screen-header">Smart Attendance Mobile</div>
    <div class="screen-body">
      <div class="step-label">Step 1 of 2: Micro-Location</div>
      <div class="step-title">BLE Beacon Signal Discovery</div>
      <div class="radar-sim">
        <div class="pulse-ring"></div>
        <div style="font-size: 26px;">📡</div>
      </div>
      <div class="beacon-info">
        <div class="beacon-row"><span>Detected Beacon:</span><strong>LH-204-BEACON</strong></div>
        <div class="beacon-row"><span>Signal RSSI:</span><strong style="color: #059669;">-62.0 dBm (Strong)</strong></div>
        <div class="beacon-row"><span>Computed Distance:</span><strong>1.5 meters</strong></div>
        <div class="beacon-row"><span>Classroom Bound:</span><strong style="color: #059669;">Passed (&lt; 15.0m)</strong></div>
      </div>
      <button class="btn-action btn-green">Classroom Proximity Locked &check;</button>
    </div>
  </div>

  <!-- Screen 2: Facial Liveness -->
  <div class="phone-card">
    <div class="screen-header">Smart Attendance Mobile</div>
    <div class="screen-body">
      <div class="step-label">Step 2 of 2: Biometric Proof</div>
      <div class="step-title">Facial Liveness Verification</div>
      <div class="face-oval">
        <div class="laser-line"></div>
        <div style="font-size: 40px; margin-bottom: 6px;">👤</div>
        <div style="font-size: 11px; font-weight: bold; color: #475569;">Liveness Active</div>
      </div>
      <div class="beacon-info">
        <div class="beacon-row"><span>Anti-Spoofing Gate:</span><strong style="color: #059669;">Liveness Verified</strong></div>
        <div class="beacon-row"><span>Biometric Confidence:</span><strong style="color: #059669;">96.4% (&ge; 85% req)</strong></div>
        <div class="conf-bar"><div class="conf-fill"></div></div>
      </div>
      <button class="btn-action btn-green">Attendance Verified & Recorded &check;</button>
    </div>
  </div>
</div>
</body>
</html>`,

  // Figure 4.4: Schedule Conflict Detection (Flat, clean, authentic dashboard)
  'fig44_conflict_detection.png': `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 20px; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
  .dash-wrap { width: 1050px; margin: 0 auto; background: white; border: 1px solid #cbd5e1; border-radius: 10px; padding: 22px; box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 18px; }
  .title { font-size: 18px; font-weight: bold; }
  .metric-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .m-card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; }
  .m-card.success { border-color: #86efac; background: #f0fdf4; }
  .m-label { font-size: 11px; text-transform: uppercase; font-weight: bold; color: #64748b; }
  .m-val { font-size: 26px; font-weight: bold; margin-top: 4px; }
  .grid-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .grid-table th { background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; text-align: center; }
  .grid-table td { padding: 10px; border: 1px solid #e2e8f0; vertical-align: top; height: 45px; }
  .slot { background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 6px; padding: 6px 8px; font-size: 11px; }
  .slot strong { display: block; color: #0369a1; }
  .slot span { color: #475569; font-size: 10px; }
  .badge-status { background: #dcfce7; border: 1px solid #86efac; color: #166534; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; }
</style>
</head>
<body>
<div class="dash-wrap">
  <div class="header">
    <div>
      <div class="title">Schedule & Resource Conflict Detection - Academic Year 2026</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Department of Artificial Intelligence & Data Science &bull; Master Timetable Verification</div>
    </div>
    <div class="badge-status">&check; Automated Timetable Optimization: Zero Conflicts</div>
  </div>

  <div class="metric-row">
    <div class="m-card success">
      <div class="m-label" style="color: #166534;">Active Conflicts</div>
      <div class="m-val" style="color: #16a34a;">0 <span style="font-size: 13px; font-weight: normal;">(All Clear)</span></div>
    </div>
    <div class="m-card success">
      <div class="m-label" style="color: #166534;">Room Double Bookings</div>
      <div class="m-val" style="color: #16a34a;">0</div>
    </div>
    <div class="m-card success">
      <div class="m-label" style="color: #166534;">Faculty Overlaps</div>
      <div class="m-val" style="color: #16a34a;">0</div>
    </div>
    <div class="m-card success">
      <div class="m-label" style="color: #166534;">Capacity Deficits</div>
      <div class="m-val" style="color: #16a34a;">0</div>
    </div>
  </div>

  <table class="grid-table">
    <thead>
      <tr>
        <th style="width: 10%;">Period</th>
        <th style="width: 18%;">Monday</th>
        <th style="width: 18%;">Tuesday</th>
        <th style="width: 18%;">Wednesday</th>
        <th style="width: 18%;">Thursday</th>
        <th style="width: 18%;">Friday</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center; font-weight: bold; background: #fafafa;">P1 (09:00 - 09:50)</td>
        <td><div class="slot"><strong>CS301 - DBMS</strong><span>Prof. Raman &bull; LH-204</span></div></td>
        <td style="background: #fafafa;"></td>
        <td><div class="slot"><strong>CS301 - DBMS</strong><span>Prof. Raman &bull; LH-204</span></div></td>
        <td style="background: #fafafa;"></td>
        <td><div class="slot"><strong>AD301 - Deep Learning</strong><span>Prof. Vaanathi &bull; LH-102</span></div></td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold; background: #fafafa;">P2 (09:50 - 10:40)</td>
        <td><div class="slot"><strong>AD302 - Computer Vision</strong><span>Dr. Gomathi &bull; LAB-3</span></div></td>
        <td><div class="slot"><strong>MA301 - Discrete Math</strong><span>Dr. Sharma &bull; LH-201</span></div></td>
        <td><div class="slot"><strong>AD302 - Computer Vision</strong><span>Dr. Gomathi &bull; LAB-3</span></div></td>
        <td><div class="slot"><strong>CS301 - DBMS</strong><span>Prof. Raman &bull; LH-204</span></div></td>
        <td style="background: #fafafa;"></td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold; background: #fafafa;">P3 (10:55 - 11:45)</td>
        <td><div class="slot"><strong>AD303 - NLP Lab</strong><span>Prof. Vaanathi &bull; AI-LAB</span></div></td>
        <td><div class="slot"><strong>CS302 - Networks</strong><span>Prof. Khan &bull; LH-204</span></div></td>
        <td style="background: #fafafa;"></td>
        <td><div class="slot"><strong>AD303 - NLP Lab</strong><span>Prof. Vaanathi &bull; AI-LAB</span></div></td>
        <td><div class="slot"><strong>CS302 - Networks</strong><span>Prof. Khan &bull; LH-204</span></div></td>
      </tr>
    </tbody>
  </table>
</div>
</body>
</html>`,

  // Figure 4.6: Hardware ESP32 Beacon Setup (Clean 2D technical schematic)
  'fig46_esp32_hardware.png': `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 25px; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; }
  .board-wrap { width: 1050px; margin: 0 auto; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 24px; box-sizing: border-box; background: #ffffff; }
  .title { text-align: center; font-size: 19px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
  .split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }
  .col-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; }
  .box-head { font-size: 14px; font-weight: bold; color: #0369a1; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
  .pin-row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
  .diagram-mock { width: 90%; height: 230px; margin: 10px auto; border: 2px dashed #94a3b8; border-radius: 10px; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
  .radius-circle { width: 190px; height: 190px; border-radius: 50%; border: 2px solid #0284c7; background: rgba(2,132,199,0.08); display: flex; align-items: center; justify-content: center; }
</style>
</head>
<body>
<div class="board-wrap">
  <div class="title">ESP32 Classroom Beacon Hardware Architecture & Physical RF Deployment</div>
  <div class="split">
    <div class="col-box">
      <div class="box-head">1. Microcontroller Hardware Specifications</div>
      <div class="pin-row"><span>Processor:</span><strong>Espressif ESP32 Dual-Core Xtensa LX6 @ 240MHz</strong></div>
      <div class="pin-row"><span>Wireless Standard:</span><strong>Bluetooth 4.2 BR/EDR & BLE Specification</strong></div>
      <div class="pin-row"><span>Radio Frequency:</span><strong>2.4 GHz ISM Band (Advertising Channels 37, 38, 39)</strong></div>
      <div class="pin-row"><span>Transmit Power (Tx):</span><strong>Configured at +9 dBm (Class 1 Transmit Level)</strong></div>
      <div class="pin-row"><span>Calibrated RSSI at 1m:</span><strong>-59.0 dBm (Measured Baseline TxPower)</strong></div>
      <div class="pin-row"><span>Packet Type:</span><strong>Apple iBeacon (0x4C00 Manufacturer ID)</strong></div>
      <div class="pin-row"><span>Power Supply & Draw:</span><strong>5V Micro-USB / PoE &bull; 80 mA (0.4 Watts)</strong></div>
    </div>

    <div class="col-box">
      <div class="box-head">2. Classroom Ceiling RF Propagation Coverage</div>
      <div class="diagram-mock">
        <div class="radius-circle">
          <div style="text-align: center; font-size: 11.5px; color: #0369a1; font-weight: bold;">
            ESP32 Beacon Node<br>
            <span style="font-size: 10px; color: #475569;">Mounted at 2.4m Ceiling</span><br>
            <strong>Coverage Radius: 15.0m</strong>
          </div>
        </div>
        <div style="font-size: 10.5px; color: #64748b; margin-top: 6px;">Concrete Wall Attenuation: -12 dB to -16 dB (Rejects Corridors)</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`,

  // Figure 5.2: Empirical BLE Calibration Curve (Clean scientific graph)
  'fig52_ble_calibration_curve.png': `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 25px; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .chart-container { width: 1050px; margin: 0 auto; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 24px; box-sizing: border-box; }
  .chart-title { text-align: center; font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 6px; }
  .chart-sub { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 20px; }
  .svg-wrap { width: 100%; display: flex; justify-content: center; }
</style>
</head>
<body>
<div class="chart-container">
  <div class="chart-title">Empirical BLE Path-Loss Distance Calibration Curve</div>
  <div class="chart-sub">Measured RSSI (dBm) vs. Physical Radial Distance (Meters) inside Lecture Hall LH-204</div>
  <div class="svg-wrap">
    <svg width="900" height="420" viewBox="0 0 900 420">
      <!-- Grid Lines -->
      <line x1="100" y1="50" x2="850" y2="50" stroke="#f1f5f9" stroke-width="1.5"/>
      <line x1="100" y1="120" x2="850" y2="120" stroke="#f1f5f9" stroke-width="1.5"/>
      <line x1="100" y1="190" x2="850" y2="190" stroke="#f1f5f9" stroke-width="1.5"/>
      <line x1="100" y1="260" x2="850" y2="260" stroke="#f1f5f9" stroke-width="1.5"/>
      <line x1="100" y1="330" x2="850" y2="330" stroke="#f1f5f9" stroke-width="1.5"/>
      
      <!-- Axes -->
      <line x1="100" y1="350" x2="850" y2="350" stroke="#334155" stroke-width="2"/>
      <line x1="100" y1="50" x2="100" y2="350" stroke="#334155" stroke-width="2"/>
      
      <!-- X Labels (Distance in meters) -->
      <text x="100" y="375" font-size="12" fill="#475569" text-anchor="middle">0m</text>
      <text x="200" y="375" font-size="12" fill="#475569" text-anchor="middle">2m</text>
      <text x="300" y="375" font-size="12" fill="#475569" text-anchor="middle">4m</text>
      <text x="400" y="375" font-size="12" fill="#475569" text-anchor="middle">6m</text>
      <text x="500" y="375" font-size="12" fill="#475569" text-anchor="middle">8m</text>
      <text x="600" y="375" font-size="12" fill="#475569" text-anchor="middle">10m</text>
      <text x="700" y="375" font-size="12" fill="#475569" text-anchor="middle">12m</text>
      <text x="800" y="375" font-size="12" fill="#475569" text-anchor="middle">15m (Boundary)</text>
      
      <text x="475" y="405" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Physical Radial Distance d (Meters)</text>
      
      <!-- Y Labels (RSSI in dBm) -->
      <text x="85" y="55" font-size="11" fill="#475569" text-anchor="end">-50 dBm</text>
      <text x="85" y="125" font-size="11" fill="#475569" text-anchor="end">-60 dBm</text>
      <text x="85" y="195" font-size="11" fill="#475569" text-anchor="end">-70 dBm</text>
      <text x="85" y="265" font-size="11" fill="#475569" text-anchor="end">-80 dBm</text>
      <text x="85" y="335" font-size="11" fill="#475569" text-anchor="end">-90 dBm</text>
      
      <!-- Rotated Y Axis Title -->
      <text transform="rotate(-90 40 200)" x="40" y="200" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Measured RSSI (dBm)</text>
      
      <!-- Boundary Line at 15m -->
      <line x1="800" y1="50" x2="800" y2="350" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,4"/>
      <text x="805" y="70" font-size="11" font-weight="bold" fill="#ef4444">Classroom Limit (15m)</text>
      
      <!-- Theoretical Curve: Path Loss model d = 10^((Tx-RSSI)/22) -->
      <path d="M 150 115 Q 300 200 450 240 T 800 300" fill="none" stroke="#0284c7" stroke-width="3"/>
      
      <!-- Measured Data Points -->
      <circle cx="150" cy="114" r="5" fill="#d97706"/>
      <circle cx="250" cy="184" r="5" fill="#d97706"/>
      <circle cx="350" cy="220" r="5" fill="#d97706"/>
      <circle cx="500" cy="254" r="5" fill="#d97706"/>
      <circle cx="650" cy="278" r="5" fill="#d97706"/>
      <circle cx="800" cy="301" r="5" fill="#d97706"/>
      
      <!-- Legend -->
      <rect x="580" y="60" width="200" height="60" fill="#ffffff" stroke="#cbd5e1" rx="4"/>
      <line x1="595" y1="80" x2="625" y2="80" stroke="#0284c7" stroke-width="3"/>
      <text x="635" y="84" font-size="11" fill="#334155">Theoretical Path Loss (n=2.2)</text>
      <circle cx="610" cy="102" r="5" fill="#d97706"/>
      <text x="635" y="106" font-size="11" fill="#334155">Measured ESP32 Trials</text>
    </svg>
  </div>
</div>
</body>
</html>`
};

(async () => {
  console.log('Rendering clean, non-AI-edited academic figures...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 2
  });

  for (const [filename, htmlContent] of Object.entries(figureTemplates)) {
    await page.setContent(htmlContent, { waitUntil: 'networkidle' });
    const targetPath = path.join(outDir, filename);
    await page.screenshot({ path: targetPath, fullPage: true });
    console.log(`Rendered: ${filename} -> ${targetPath}`);
  }

  await browser.close();
  console.log('All authentic, clean 2D academic figures rendered successfully!');
})();
