const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

async function waitPort(port, timeout = 30000) {
  const start = Date.now();
  const net = require('net');
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const sock = net.createConnection(port, '127.0.0.1');
        sock.on('connect', () => { sock.destroy(); resolve(); });
        sock.on('error', reject);
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error(`Timeout waiting for port ${port}`);
}

(async () => {
  console.log('Starting Vite server...');
  const vite = spawn('npx.cmd', ['vite', '--port', '5173'], {
    cwd: 'd:\\Smart Attendance',
    stdio: 'ignore',
    shell: true,
  });

  try {
    await waitPort(5173, 20000);
    console.log('Vite server is ready on http://localhost:5173!');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2
    });

    const page = await context.newPage();

    // 1. Capture Admin Dashboard / Overview
    console.log('Navigating to Admin login...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Fill' }).click();
    await page.getByRole('button', { name: /^Sign In$/i }).click();
    await page.waitForURL(/.*\/admin/);
    await page.waitForTimeout(2000);

    const outDir = 'd:\\Smart Attendance\\report_assets';
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    console.log('Capturing Admin Overview screenshot...');
    await page.screenshot({ path: path.join(outDir, 'real_admin_overview.png') });

    // 2. Capture Admin Leave Oversight
    console.log('Navigating to Leave Oversight...');
    const leaveBtn = page.getByRole('button', { name: /Leaves/i }).first();
    if (await leaveBtn.isVisible()) {
      await leaveBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outDir, 'real_leave_oversight.png') });
    }

    // 3. Capture Admin Timetable / Conflicts
    console.log('Navigating to Timetable / Conflicts...');
    const timetableBtn = page.getByRole('button', { name: /Timetable/i }).first();
    if (await timetableBtn.isVisible()) {
      await timetableBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outDir, 'real_timetable_conflicts.png') });
    }

    // 4. Capture Admin Rooms / Beacons
    console.log('Navigating to Rooms & Beacons...');
    const beaconBtn = page.getByRole('button', { name: /Rooms|Beacons/i }).first();
    if (await beaconBtn.isVisible()) {
      await beaconBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outDir, 'real_room_beacons.png') });
    }

    // 5. Capture Faculty Live Monitor
    console.log('Navigating to Faculty Login...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Faculty/i }).click();
    await page.getByRole('button', { name: /VERIFY & LOG IN/i }).click();
    await page.waitForURL(/.*\/faculty/);
    await page.waitForTimeout(1500);

    console.log('Capturing Faculty Home...');
    await page.screenshot({ path: path.join(outDir, 'real_faculty_home.png') });

    // Try starting session or opening live monitor
    const startSessionBtn = page.getByRole('button', { name: /Start Session|Launch Session/i }).first();
    if (await startSessionBtn.isVisible()) {
      await startSessionBtn.click();
      await page.waitForTimeout(1000);
      const confirmStart = page.getByRole('button', { name: /Start Attendance|Confirm/i }).first();
      if (await confirmStart.isVisible()) {
        await confirmStart.click();
        await page.waitForTimeout(2000);
      }
      await page.screenshot({ path: path.join(outDir, 'real_faculty_live_monitor.png') });
    }

    // 6. Capture Student App
    console.log('Navigating to Student Login...');
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /Student/i }).click();
    await page.getByRole('button', { name: /VERIFY & LOG IN/i }).click();
    await page.waitForURL(/.*\/student/);
    await page.waitForTimeout(1500);

    console.log('Capturing Student Dashboard...');
    await page.screenshot({ path: path.join(outDir, 'real_student_home.png') });

    // Student Scan BLE
    const checkinBtn = page.getByRole('button', { name: /Check In|Scan BLE|Mark Attendance/i }).first();
    if (await checkinBtn.isVisible()) {
      await checkinBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outDir, 'real_student_checkin.png') });
    }

    await browser.close();
    console.log('All real application screenshots captured successfully!');
  } finally {
    vite.kill();
  }
})();
