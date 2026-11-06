// Records a scripted walkthrough of the NarcoLens prototype (inspector + supervisor modes).
// Usage: node record_demo.js <base url> <output dir>   (needs playwright + Chromium; convert with ffmpeg afterwards)
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:6001/';
const OUT = process.argv[3] || '.';
const W = 1600, H = 900;

const OVERLAY = () => {
  const css = document.createElement('style');
  css.textContent = `
  #nvCap{pointer-events:none;position:fixed;left:50%;bottom:34px;transform:translateX(-50%) translateY(10px);max-width:1180px;min-width:560px;z-index:2147483000;opacity:0;transition:opacity .45s ease,transform .45s ease;
    padding:14px 24px 15px;border-radius:16px;background:rgba(5,10,20,.92);border:1px solid rgba(34,211,238,.55);box-shadow:0 18px 60px rgba(0,0,0,.55),0 0 34px rgba(34,211,238,.18);color:#fff;font-family:Inter,Arial,sans-serif;text-align:center}
  #nvCap.on{opacity:1;transform:translateX(-50%) translateY(0)}
  #nvCap .tag{display:inline-block;font:700 11.5px/1 "JetBrains Mono",monospace;letter-spacing:.16em;color:#22d3ee;background:rgba(34,211,238,.12);border:1px solid rgba(34,211,238,.45);padding:5px 10px;border-radius:999px;margin-bottom:8px}
  #nvCap .tag.sup{color:#10b981;background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.5)}
  #nvCap .ti{font-size:23px;font-weight:700;letter-spacing:.005em}
  #nvCap .su{font-size:15.5px;color:#cbd5e1;margin-top:4px}
  #nvCur{position:fixed;left:0;top:0;width:30px;height:30px;z-index:2147483600;pointer-events:none;transform:translate(-100px,-100px);filter:drop-shadow(0 2px 6px rgba(0,0,0,.6))}
  #nvRip{position:fixed;z-index:2147483500;pointer-events:none;width:14px;height:14px;border-radius:50%;border:3px solid #22d3ee;opacity:0;transform:translate(-50%,-50%) scale(.4)}
  #nvRip.go{animation:nvr .55s ease-out}
  @keyframes nvr{0%{opacity:.95;transform:translate(-50%,-50%) scale(.4)}100%{opacity:0;transform:translate(-50%,-50%) scale(3.2)}}
  #nvCard{position:fixed;inset:0;z-index:2147483300;display:grid;place-items:center;text-align:center;color:#fff;font-family:Inter,Arial,sans-serif;
    background:radial-gradient(900px 520px at 50% 40%,rgba(34,211,238,.20),transparent 70%),#050a14;opacity:0;pointer-events:none;transition:opacity .7s ease}
  #nvCard.on{opacity:1}
  #nvCard h1{font-size:76px;margin:0 0 10px;font-weight:800;letter-spacing:.01em}
  #nvCard h2{font-size:30px;margin:0 0 22px;font-weight:600;color:#22d3ee}
  #nvCard p{font-size:21px;margin:0;color:#cbd5e1;line-height:1.5}
  #nvCard small{display:block;margin-top:26px;font:600 14px/1 "JetBrains Mono",monospace;letter-spacing:.16em;color:#94a3b8}
  `;
  document.head.appendChild(css);
  const cap = document.createElement('div'); cap.id = 'nvCap'; document.body.appendChild(cap);
  const cur = document.createElement('div'); cur.id = 'nvCur';
  cur.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 2l7.2 18.2 2.6-7.4 7.4-2.6z" fill="#fff" stroke="#050a14" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  document.body.appendChild(cur);
  const rip = document.createElement('div'); rip.id = 'nvRip'; document.body.appendChild(rip);
  const card = document.createElement('div'); card.id = 'nvCard'; document.body.appendChild(card);
  document.addEventListener('mousemove', (e) => { cur.style.transform = 'translate(' + (e.clientX - 3) + 'px,' + (e.clientY - 2) + 'px)'; }, true);
  document.addEventListener('mousedown', (e) => { rip.style.left = e.clientX + 'px'; rip.style.top = e.clientY + 'px'; rip.classList.remove('go'); void rip.offsetWidth; rip.classList.add('go'); }, true);
  window.__cap = (tag, ti, su, sup) => {
    cap.classList.remove('on');
    setTimeout(() => { cap.innerHTML = '<div class="tag' + (sup ? ' sup' : '') + '">' + tag + '</div><div class="ti">' + ti + '</div>' + (su ? '<div class="su">' + su + '</div>' : ''); cap.classList.add('on'); }, 200);
  };
  window.__capOff = () => cap.classList.remove('on');
  window.__card = (html) => { if (html) { card.innerHTML = html; card.classList.add('on'); } else card.classList.remove('on'); };
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: 'dark', recordVideo: { dir: OUT, size: { width: W, height: H } } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  const hold = (ms) => page.waitForTimeout(ms);
  let SUP = false;
  const cap = (tag, ti, su) => page.evaluate(([a, b, c, d]) => window.__cap(a, b, c, d), [tag, ti, su || '', SUP]);
  const glide = async (sel, dx, dy) => {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded(); await hold(150);
    const b = await el.boundingBox();
    await page.mouse.move(b.x + (dx !== undefined ? b.width * dx : b.width / 2), b.y + (dy !== undefined ? b.height * dy : b.height / 2), { steps: 28 });
  };
  const click = async (sel, dx, dy) => { await glide(sel, dx, dy); await hold(280); await page.mouse.down(); await page.mouse.up(); await hold(350); };
  const smoothScroll = (y, ms) => page.evaluate(([yy, m]) => new Promise((res) => { const y0 = scrollY, t0 = performance.now(); (function s(n) { const p = Math.min(1, (n - t0) / m), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; scrollTo(0, y0 + (yy - y0) * e); p < 1 ? requestAnimationFrame(s) : res(); })(t0); }), [y, ms]);

  await page.goto(BASE); await hold(900);
  await page.evaluate(() => { try { localStorage.setItem('nl-theme', 'dark'); } catch (e) { } }); await page.reload(); await hold(900);
  await page.evaluate(OVERLAY);

  // ---- intro card
  await page.evaluate(() => window.__card('<div><h1>NarcoLens</h1><h2>From Scan to Evidence.</h2><p>AI-Assisted Substance Screening<br>for Police &amp; Airport Customs</p><small>PROTOTYPE DEMO &middot; SIMULATED DATA</small></div>'));
  await hold(5200);
  await page.evaluate(() => window.__card(''));
  await hold(1000);

  // ---- inspector: sign in
  await cap('INSPECTOR MODE', 'Sign in as an inspector', 'A fictional pharmaceutical control inspector. All data in this demo is synthetic or simulated.');
  await hold(3600);
  await click('#loginBtn'); await hold(2600);

  // ---- dashboard
  await cap('INSPECTOR MODE', 'Command dashboard', 'Seven simulated entry points, the inspection queue and a live event log');
  await glide('#map', 0.55, 0.45); await hold(3800);
  await smoothScroll(520, 2200); await hold(1800);
  await cap('INSPECTOR MODE', 'Shift planning', 'A simulated heat calendar recommends where to place K9 teams next week');
  await hold(3600); await smoothScroll(0, 1600); await hold(600);

  // ---- M1
  await click('a[data-screen="lane"]'); await hold(1200);
  await cap('M1 · X-RAY VISION', 'Scan a bag on the live lane', 'A trained segmentation network runs in the browser on the simulated X-ray scan');
  await hold(2600);
  await click('[data-bag="2"]'); await hold(2600);
  await cap('M1 · X-RAY VISION', 'The AI heatmap marks a concealment', 'Fused risk 92. The officer sees where the model looked and why.');
  await hold(3600);
  await click('#truthToggle'); await hold(2400);
  await cap('M1 · X-RAY VISION', 'Ground truth confirms the finding', 'Synthetic scans carry exact labels, so the model can be checked');
  await hold(3000);
  await click('button:has-text("Open case")'); await hold(2000);

  // ---- case
  await cap('INSPECTOR MODE', 'One case per bag', 'Every module adds evidence and a time stamp to the same case');
  await hold(3800);

  // ---- M2
  await click('a[data-screen="desk"]'); await hold(1200);
  await cap('M2 · TABLETS AND LABELS', 'Analyse the officer\'s photo', 'An imprint classifier checks each tablet. Size, shape and colour are measured from the scale.');
  await click('#deskAnalyse'); await hold(3200);
  await smoothScroll(300, 1600); await hold(2600); await smoothScroll(0, 1000); await hold(500);
  await click('#deskAttach'); await hold(1500);

  // ---- M3
  await click('a[data-screen="hyper"]'); await hold(1200);
  await cap('M3 · HYPERSPECTRAL', 'Identify through the packaging', 'Each pixel\'s infrared spectrum is matched to a reference library');
  await click('#hyperScan'); await hold(4200);
  await glide('#hyperCanvas', 0.57, 0.5); await hold(2600);
  await cap('M3 · HYPERSPECTRAL', 'Probable substance and mixture', 'Matching and unmixing are live algorithms. The library holds synthetic profiles.');
  await hold(4000);
  await click('#hyperAttach'); await hold(1500);

  // ---- M5
  await click('a[data-screen="case"]'); await hold(1500);
  await cap('M5 · EXPLAINABLE RISK FUSION', 'One score, with every signal shown', 'The inspector sees how much each module contributed to the assessment');
  await hold(4200);
  await click('#whatIf summary'); await hold(2200);
  await cap('M5 · EXPLAINABLE RISK FUSION', 'What-if: change the evidence', 'See how each signal moves the score before acting');
  await hold(3600);
  await click('#whatIf summary'); await hold(800);
  await click('[data-ask="why"]'); await hold(1800);
  await cap('INSPECTOR MODE', 'Ask NarcoLens', 'A scripted assistant explains the flag from the case\'s own evidence. No external AI is used.');
  await hold(4000);
  await click('[data-act="report"]'); await hold(2000);
  await cap('INSPECTOR MODE', 'Evidence pack', 'A court-style report with the heatmap, spectrum and chain of custody, ready to print as PDF');
  await hold(2600); await smoothScroll(700, 2600); await hold(2600); await smoothScroll(1500, 2600); await hold(2000); await smoothScroll(0, 1200);
  await click('#repBack'); await hold(1400);
  await cap('INSPECTOR MODE', 'Refer the seizure', 'The inspector sends a sample to the laboratory. A supervisor must approve the seizure.');
  await click('[data-act="seize"]'); await hold(3600);

  // ---- AI Lab
  await cap('AI LAB', 'Test the models yourself', 'The AI Lab holds a live model test and a challenge against the AI');
  await click('#fanBtn'); await hold(2200);
  await click('#fanModels'); await hold(1600);
  await cap('AI LAB', 'Run the models on brand-new bags', 'Fresh random inputs each time. Results come from synthetic data only.');
  await click('#benchM1');
  await page.waitForFunction(() => !document.getElementById('benchM1').disabled, null, { timeout: 90000 }); await hold(3000);
  await click('#fanBtn'); await hold(900); await click('#fanChallenge'); await hold(1600);
  await cap('AI LAB', 'Challenge: you versus the AI', 'Click where you think drugs are hidden, then compare with the model');
  await glide('#chCanvas', 0.55, 0.5); await hold(900); await page.mouse.down(); await page.mouse.up(); await hold(3800);

  // ---- language
  await click('#userBtn'); await hold(1200);
  await cap('INSPECTOR MODE', 'English and Arabic', 'The whole interface switches to Arabic with right-to-left layout');
  await click('#userMenu [data-v="ar"]'); await hold(4200);
  await click('#userMenu [data-v="en"]'); await hold(2000);
  await page.keyboard.press('Escape'); await hold(500);

  // ---- switch to supervisor
  await cap('ROLE SWITCH', 'Now the supervisor\'s view', 'Signing out and back in as a duty supervisor');
  await click('#userBtn'); await hold(800);
  await click('#userMenu [data-um="out"]'); await hold(2000);
  SUP = true;
  await click('[data-role="supervisor"]'); await hold(1600);
  await cap('SUPERVISOR MODE', 'Sign in as a supervisor', 'A fictional duty supervisor. Oversight is built into the workflow.');
  await hold(3000);
  await click('#loginBtn'); await hold(2800);

  await cap('SUPERVISOR MODE', 'Review and sign-off', 'Seizures await approval, including the one the inspector just referred');
  await hold(4800);
  await click('[data-sup="approve"]'); await hold(2400);
  await cap('SUPERVISOR MODE', 'Approve a seizure', 'The approval is written to the case timeline with the supervisor\'s name');
  await hold(3800);
  if (await page.locator('[data-sup="approve"]').count()) { await click('[data-sup="approve"]'); await hold(2000); }
  await cap('SUPERVISOR MODE', 'Review an override', 'The AI flagged this bag and the officer cleared it. The supervisor can agree or order a re-inspection.');
  if (await page.locator('[data-sup="agree"]').count()) { await click('[data-sup="agree"]'); }
  await hold(4400);
  await cap('SUPERVISOR MODE', 'Site performance and audit log', 'Every officer, laboratory and supervisor action is time-stamped');
  await smoothScroll(520, 2200); await hold(5200);

  // ---- outro
  await smoothScroll(0, 800);
  await page.evaluate(() => { window.__capOff(); window.__card('<div><h1>NarcoLens</h1><h2>From Scan to Evidence.</h2><p>Detect earlier. Understand faster. Learn together.</p><small>PROTOTYPE ON SYNTHETIC DATA &middot; VALIDATION ON REAL SCANS IS THE NEXT STEP</small></div>'); });
  await hold(6000);

  console.log('errors:', errs.length ? errs : 'none');
  await ctx.close(); await browser.close();
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
