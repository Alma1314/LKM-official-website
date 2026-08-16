import { chromium } from '@playwright/test';
const b = await chromium.launch();
const page = await b.newPage();
await page.addInitScript(() => {
  window.__samples = [];
  let last=null;
  function S(){
    const btn=document.querySelector('.btn-primary');
    let key;
    if(btn){ key=getComputedStyle(btn).color; }
    if(key&&key!==last){ if(window.__samples.length<50) window.__samples.push({t:performance.now(),color:key}); last=key; }
    requestAnimationFrame(S);
  }
  requestAnimationFrame(S);
});
await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
const samples = await page.evaluate(() => window.__samples);
console.log('sample count', samples.length);
for (const s of samples) console.log(Math.round(s.t), s.color);
await b.close();
