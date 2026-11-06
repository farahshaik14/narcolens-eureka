// Renders src/paper_ieee.html to narcolens-technical-paper.pdf (needs playwright with Chromium)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'src/paper_ieee.html')); await p.waitForTimeout(800);
  await p.pdf({ path: path.join(__dirname, 'narcolens-technical-paper.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await b.close();
})();
