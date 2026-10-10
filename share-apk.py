import os
import sys
import socket
import webbrowser
import threading
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

# Ensure UTF-8 output on Windows consoles and unbuffered flushing
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)

# Resolve paths
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
APK_PATH = os.path.join(PROJECT_ROOT, "SmartAttendance.apk")
PORT = 8080

def get_local_ip():
    """Detect local LAN IP address (192.168.x.x or 10.x.x.x)"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        pass
    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith("127."):
                return ip
    except Exception:
        pass
    return "127.0.0.1"

LOCAL_IP = get_local_ip()

class ApkTransferHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Custom clean logging
        client_ip = self.client_address[0]
        path = getattr(self, 'path', '')
        print(f"[{client_ip}] -> {path}")

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path in ["/SmartAttendance.apk", "/download"]:
            if not os.path.exists(APK_PATH):
                self.send_error(404, "SmartAttendance.apk file not found")
                return
            apk_size = os.path.getsize(APK_PATH)
            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.android.package-archive")
            self.send_header("Content-Disposition", 'attachment; filename="SmartAttendance.apk"')
            self.send_header("Content-Length", str(apk_size))
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/SmartAttendance.apk", "/download"]:
            if not os.path.exists(APK_PATH):
                self.send_error(404, "SmartAttendance.apk file not found in project root!")
                return
            
            apk_size = os.path.getsize(APK_PATH)
            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.android.package-archive")
            self.send_header("Content-Disposition", 'attachment; filename="SmartAttendance.apk"')
            self.send_header("Content-Length", str(apk_size))
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            with open(APK_PATH, "rb") as f:
                while chunk := f.read(64 * 1024):
                    self.wfile.write(chunk)
            print(f" >>> [SUCCESS] Transferred SmartAttendance.apk ({apk_size / (1024*1024):.2f} MB) to {self.client_address[0]}!")
            return

        # Serve mobile-responsive landing page
        if path == "/" or path == "/index.html":
            apk_exists = os.path.exists(APK_PATH)
            apk_size_mb = f"{os.path.getsize(APK_PATH) / (1024*1024):.2f}" if apk_exists else "N/A"
            download_url = f"http://{LOCAL_IP}:{PORT}/SmartAttendance.apk"
            page_url = f"http://{LOCAL_IP}:{PORT}"

            html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Smart Attendance Mobile App</title>
  <style>
    :root {{
      --primary: #4f46e5;
      --primary-hover: #4338ca;
      --bg: #0b0f19;
      --card-bg: rgba(255, 255, 255, 0.05);
      --card-border: rgba(255, 255, 255, 0.12);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent-green: #10b981;
    }}
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }}
    body {{
      background: radial-gradient(ellipse at 50% -20%, #1e1b4b, #0b0f19 80%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }}
    .container {{
      max-width: 460px;
      width: 100%;
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }}
    .badge {{
      display: inline-block;
      padding: 4px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: rgba(79, 70, 229, 0.2);
      color: #818cf8;
      border: 1px solid rgba(129, 140, 248, 0.3);
      border-radius: 9999px;
      margin-bottom: 1rem;
    }}
    .app-icon {{
      width: 76px;
      height: 76px;
      background: linear-gradient(135deg, #6366f1, #4338ca);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5);
    }}
    .app-icon svg {{
      width: 42px;
      height: 42px;
      color: white;
    }}
    h1 {{
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      color: #ffffff;
    }}
    p.subtitle {{
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }}
    .qr-container {{
      background: #ffffff;
      padding: 12px;
      border-radius: 16px;
      display: inline-block;
      margin-bottom: 1.5rem;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }}
    .qr-container img {{
      display: block;
      width: 180px;
      height: 180px;
    }}
    .qr-hint {{
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: -1rem;
      margin-bottom: 1.25rem;
    }}
    .btn {{
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      background: linear-gradient(135deg, #4f46e5, #4338ca);
      color: white;
      text-decoration: none;
      font-size: 1.05rem;
      font-weight: 600;
      padding: 1rem 1.5rem;
      border-radius: 14px;
      transition: all 0.2s ease;
      box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
      border: none;
      cursor: pointer;
    }}
    .btn:hover {{
      background: linear-gradient(135deg, #4338ca, #3730a3);
      transform: translateY(-2px);
      box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.6);
    }}
    .meta-info {{
      margin-top: 1rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      display: flex;
      justify-content: center;
      gap: 16px;
    }}
    .meta-item {{
      display: flex;
      align-items: center;
      gap: 4px;
    }}
    .instructions {{
      margin-top: 1.75rem;
      text-align: left;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 1rem 1.25rem;
    }}
    .instructions h2 {{
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a5b4fc;
      margin-bottom: 0.75rem;
    }}
    .instructions ol {{
      padding-left: 1.25rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.6;
    }}
    .instructions ol li strong {{
      color: var(--text);
    }}
    .footer {{
      margin-top: 1.5rem;
      font-size: 0.75rem;
      color: #64748b;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Android Application Package (APK)</div>
    <div class="app-icon">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
      </svg>
    </div>
    <h1>Smart Attendance</h1>
    <p class="subtitle">Install directly on your Android phone</p>

    <!-- QR Code for PC monitors so phone camera can scan it -->
    <div class="qr-container" id="qr-wrapper">
      <img id="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={urllib.parse.quote(page_url)}" alt="Scan to Download on Phone" onerror="renderFallbackQR()">
    </div>
    <p class="qr-hint" id="qr-hint">Scan with your phone's camera on the same Wi-Fi</p>

    <a href="{download_url}" class="btn" id="download-btn" download="SmartAttendance.apk">
      <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      Download APK ({apk_size_mb} MB)
    </a>

    <div class="meta-info">
      <span class="meta-item">📦 Package: {apk_size_mb} MB</span>
      <span class="meta-item">🛡️ Android 8.0+</span>
    </div>

    <div class="instructions">
      <h2>How to install on Android:</h2>
      <ol>
        <li>Tap <strong>Download APK</strong> above.</li>
        <li>If Chrome shows <em>"File might be harmful"</em>, tap <strong>Download anyway</strong> (standard warning for direct APKs).</li>
        <li>Once finished, tap <strong>Open</strong> and then tap <strong>Install</strong>.</li>
        <li>If prompted with <em>"Install unknown apps"</em>, toggle <strong>Allow from this source</strong>.</li>
      </ol>
    </div>

    <p class="footer">Local Network IP: {LOCAL_IP}:{PORT}</p>
  </div>

  <script>
    // Hide QR code if opened directly on mobile device
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {{
      document.getElementById('qr-wrapper').style.display = 'none';
      document.getElementById('qr-hint').style.display = 'none';
    }}

    function renderFallbackQR() {{
      const wrapper = document.getElementById('qr-wrapper');
      wrapper.innerHTML = '<div style="width:180px;height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#333;font-size:12px;text-align:center;padding:10px;"><strong>Download URL:</strong><br><span style="word-break:break-all;color:#4f46e5;margin-top:6px;font-size:11px;">{page_url}</span></div>';
    }}
  </script>
</body>
</html>"""
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(html_content.encode("utf-8"))))
            self.end_headers()
            self.wfile.write(html_content.encode("utf-8"))
            return

        self.send_error(404, "Not Found")

def start_server():
    if not os.path.exists(APK_PATH):
        print(f"\n[ERROR] Could not find SmartAttendance.apk at: {APK_PATH}")
        sys.exit(1)

    apk_size = os.path.getsize(APK_PATH) / (1024 * 1024)
    server_address = ("0.0.0.0", PORT)
    try:
        httpd = HTTPServer(server_address, ApkTransferHandler)
    except OSError as e:
        print(f"\n[ERROR] Port {PORT} is already in use: {e}")
        print("Freeing the port or try restarting the script.")
        sys.exit(1)

    print("\n" + "=" * 62)
    print("      🚀 SMART ATTENDANCE - MOBILE APK WIRELESS TRANSFER")
    print("=" * 62)
    print(f" [APK File]      : {APK_PATH}")
    print(f" [Size]          : {apk_size:.2f} MB")
    print(f" [Local Wi-Fi IP]: {LOCAL_IP}")
    print("-" * 62)
    print(" TO DOWNLOAD ON YOUR PHONE (Connected to the same Wi-Fi):")
    print(f" 👉 Open Chrome / Browser on your phone and go to:")
    print(f"\n      http://{LOCAL_IP}:{PORT}\n")
    print(" Or directly download the APK:")
    print(f"      http://{LOCAL_IP}:{PORT}/SmartAttendance.apk")
    print("=" * 62)
    print(" [PC Browser] Opening download page on your desktop so you can")
    print("              scan the QR code directly with your phone camera...")
    print(" Press Ctrl + C in this window anytime to stop sharing.")
    print("=" * 62 + "\n")

    # Automatically open local browser so user can see/scan QR code immediately
    threading.Timer(1.0, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping APK transfer server. Bye!")
        httpd.server_close()

if __name__ == "__main__":
    start_server()
