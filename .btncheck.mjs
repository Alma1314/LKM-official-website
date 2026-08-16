import { chromium } from '@playwright/test';
const b = await chromium.launch();
const page = await b.newPage();
const errors = [];
page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERR: '+e.message));
await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
const res = await page.evaluate(() => {
  const btn = document.querySelector('.btn-primary');
  if (!btn) return {found:false};
  const cs = getComputedStyle(btn);
  return { found:true, textColor: cs.color, bg: cs.backgroundColor, cls: btn.className };
});
console.log('computed:', JSON.stringify(res));
console.log('console errors:', errors.length);
errors.slice(0,10).forEach(e=>console.log('  -',e));
await b.close();
