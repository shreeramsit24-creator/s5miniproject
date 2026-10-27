// compile_complete_report.cjs
const fs = require('fs');
const path = require('path');
const { chromium } = require('./node_modules/playwright');

const front = require('./report_frontmatter_aligned.cjs');
const ch1_2 = require('./report_chap1_2_aligned.cjs');
const ch3 = require('./report_chap3_aligned.cjs');
const ch4 = require('./report_chap4_aligned.cjs');
const ch5_6 = require('./report_chap5_6_aligned.cjs');
const app = require('./report_appendices_aligned.cjs');

console.log('Compiling academic project report strictly aligned with sample PDF (Zero italics, pure black)...');

const htmlHead = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SMART ATTENDANCE - Project Report</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      font-style: normal !important;
      color: #000000 !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Times New Roman', Times, serif;
      background-color: #f1f5f9;
      color: #000000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-bar {
      position: static;
      margin: 0 auto 20px auto;
      background: #0f172a;
      color: #fff !important;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: system-ui, -apple-system, sans-serif;
    }
    .print-bar * {
      color: #fff !important;
    }
    .print-btn {
      background: #2563eb;
      color: #fff !important;
      border: none;
      padding: 8px 20px;
      font-size: 13.5px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }
    .report-page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 25mm 20mm 25mm 25mm;
      margin: 20px auto;
      background: #ffffff;
      position: relative;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .page-inner {
      width: 100%;
      height: 100%;
      position: relative;
    }
    @media print {
      body {
        background: #ffffff;
      }
      .report-page {
        margin: 0;
        box-shadow: none;
        width: 210mm;
        height: 297mm;
        page-break-after: always;
        break-after: page;
      }
      .no-print {
        display: none !important;
      }
    }
    .page-num {
      position: absolute;
      bottom: 12mm;
      left: 0;
      right: 0;
      text-align: center;
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      color: #000000 !important;
    }
    h1.center-title {
      text-align: center;
      font-size: 14pt;
      line-height: 1.45;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 25px;
    }
    h2.chapter-heading {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 15px;
      margin-bottom: 20px;
      line-height: 1.3;
    }
    h3.section-heading {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 14px;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    h4.sub-section-heading {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 10px;
      margin-bottom: 6px;
    }
    p {
      font-size: 13pt;
      line-height: 1.5;
      text-align: justify;
      text-justify: inter-word;
      margin-top: 0;
      margin-bottom: 10px;
      text-indent: 30px;
    }
    p.no-indent {
      text-indent: 0;
    }
    ul, ol {
      font-size: 12.5pt;
      line-height: 1.45;
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 28px;
      text-align: justify;
    }
    li {
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 10.5pt;
    }
    th, td {
      border: 1px solid #000;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    .figure-container {
      text-align: center;
      margin: 10px 0;
    }
    .figure-container img {
      max-width: 95%;
      max-height: 120mm;
      height: auto;
      border: 1px solid #000;
      border-radius: 2px;
    }
    .figure-caption {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 5px;
      color: #000000 !important;
      font-style: normal !important;
    }
    pre {
      background: #fafafa;
      border: 1px solid #000;
      border-radius: 3px;
      padding: 8px 10px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 8.5pt;
      line-height: 1.25;
      margin: 6px 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9pt;
      background: #f1f5f9;
      padding: 1px 3px;
      border-radius: 2px;
    }
  </style>
</head>
<body>

<div class="print-bar no-print">
  <span>🎓 <strong>Smart Attendance System</strong> — Formal Academic Project Report (BIT / Anna University Format)</span>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</div>
`;

const pages = [
  // Front matter (Pages 1 to 9)
  front.makePage(null, front.p1_cover),
  front.makePage(null, front.p2_bonafide),
  front.makePage(null, front.p3_declaration),
  front.makePage('iv', front.p4_acknowledgement),
  front.makePage('v', front.p5_abstract),
  front.makePage('vi', front.p6_toc_1),
  front.makePage('vii', front.p7_toc_2),
  front.makePage('viii', front.p8_toc_3),
  front.makePage('ix', front.p9_lof),

  // Chapter 1: Introduction (Pages 1 to 5)
  front.makePage('1', ch1_2.p10_intro_1),
  front.makePage('2', ch1_2.p11_intro_2),
  front.makePage('3', ch1_2.p12_intro_3),
  front.makePage('4', ch1_2.p13_intro_4),
  front.makePage('5', ch1_2.p14_intro_5),

  // Chapter 2: Literature Survey (Pages 6 to 7)
  front.makePage('6', ch1_2.p15_lit_1),
  front.makePage('7', ch1_2.p16_lit_2),

  // Chapter 3: Objectives & Methodology (Pages 8 to 17 -> 10 pages)
  front.makePage('8', ch3.p17_meth_1),
  front.makePage('9', ch3.p18_meth_2),
  front.makePage('10', ch3.p19_meth_3),
  front.makePage('11', ch3.p20_meth_4),
  front.makePage('12', ch3.p21_meth_5),
  front.makePage('13', ch3.p22_meth_6),
  front.makePage('14', ch3.p23_meth_7),
  front.makePage('15', ch3.p24_meth_8),
  front.makePage('16', ch3.p25_meth_9),
  front.makePage('17', ch3.p26_meth_10),

  // Chapter 4: Proposed Work Modules (Pages 18 to 22 -> 5 pages)
  front.makePage('18', ch4.p27_mod_1),
  front.makePage('19', ch4.p28_mod_2),
  front.makePage('20', ch4.p29_mod_3),
  front.makePage('21', ch4.p30_mod_4),
  front.makePage('22', ch4.p31_mod_5),

  // Chapter 5: Results and Discussion (Pages 23 to 29 -> 7 pages)
  front.makePage('23', ch5_6.p32_res_1),
  front.makePage('24', ch5_6.p33_res_2),
  front.makePage('25', ch5_6.p34_res_3),
  front.makePage('26', ch5_6.p35_res_4),
  front.makePage('27', ch5_6.p36_res_5),
  front.makePage('28', ch5_6.p37_res_6),
  front.makePage('29', ch5_6.p38_res_7),

  // Chapter 6: Conclusions & Future Work (Pages 30 to 31 -> 2 pages)
  front.makePage('30', ch5_6.p39_concl_1),
  front.makePage('31', ch5_6.p40_concl_2),

  // References (Pages 32 to 33 -> 2 pages)
  front.makePage('32', ch5_6.p41_ref_1),
  front.makePage('33', ch5_6.p42_ref_2),

  // Appendices (Pages 34 to 44 -> 11 pages)
  front.makePage('34', app.p43_app_bom_1),
  front.makePage('35', app.p43_app_bom_2),
  front.makePage('36', app.p44_app_code_1),
  front.makePage('37', app.p44_app_code_2),
  front.makePage('38', app.p45_app_code_3),
  front.makePage('39', app.p45_app_code_4),
  front.makePage('40', app.p46_app_code_5),
  front.makePage('41', app.p47_work_contrib_1),
  front.makePage('42', app.p47_work_contrib_2),
  front.makePage('43', app.p48_orig_1),
  front.makePage('44', app.p48_orig_2)
];

const fullHtml = htmlHead + pages.join('\n') + '\n</body>\n</html>';

const targetHtml = path.resolve('BIT_SMART_ATTENDANCE_PROJECT_REPORT.html');
fs.writeFileSync(targetHtml, fullHtml, 'utf8');
console.log(`HTML report written successfully to ${targetHtml} (Total pages designed: ${pages.length})`);

(async () => {
  console.log('Rendering high-fidelity PDF via Playwright Chromium...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const fileUrl = 'file:///' + targetHtml.replace(/\\\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  const targetPdf = path.resolve('BIT_SMART_ATTENDANCE_PROJECT_REPORT.pdf');
  await page.pdf({
    path: targetPdf,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    }
  });

  await browser.close();

  const pdfContent = fs.readFileSync(targetPdf, 'latin1');
  const pageMatches = pdfContent.match(/\/Type\s*\/Page[^s]/g);
  const actualPages = pageMatches ? pageMatches.length : 0;
  console.log(`=======================================================`);
  console.log(`PDF COMPILED SUCCESSFULLY: ${targetPdf}`);
  console.log(`ACTUAL COMPILED PDF PAGE COUNT: ${actualPages}`);
  console.log(`=======================================================`);
})();
