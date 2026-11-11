// Renders a CV version to PDF: node cv/build.cjs v2  ->  cv/versions/v2-<YYYY-MM>.pdf
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const v = process.argv[2] || 'v2';
  const month = new Date().toISOString().slice(0, 7);
  const out = path.join(__dirname, 'versions', `${v}-${month}.pdf`);
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, `${v}.html`), { waitUntil: 'networkidle' });
  await p.pdf({ path: out, format: 'A4', preferCSSPageSize: true, printBackground: true });
  await p.screenshot({ path: process.argv[3] || '/dev/null', fullPage: true }).catch(() => {});
  await b.close();
  console.log(out);
})();
