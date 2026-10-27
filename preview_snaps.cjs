const { chromium } = require('./node_modules/playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
  
  const targetHtml = path.resolve('BIT_SMART_ATTENDANCE_PROJECT_REPORT.html');
  const fileUrl = 'file:///' + targetHtml.replace(/\\\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  const previewDir = path.resolve('scratch_previews');
  if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir);

  const pages = await page.$$('.report-page');
  console.log(`Found ${pages.length} pages in DOM.`);

  // Indices: 49 (p50), 50 (p51), 60 (p61), 61 (p62), 62 (p63)
  const sampleIndices = [49, 50, 60, 61, 62];
  for (const idx of sampleIndices) {
    if (pages[idx]) {
      const snapPath = path.join(previewDir, `page_${idx + 1}.png`);
      await pages[idx].screenshot({ path: snapPath });
      console.log(`Snapped Page ${idx + 1} -> ${snapPath}`);
    }
  }

  await browser.close();
  console.log('Preview snapshots saved successfully!');
})();
