// NarcoLens executive pitch deck (16 slides) - Presight Eureka 3.0
// Run: NODE_PATH=<node_modules with pptxgenjs, react, react-dom, sharp, react-icons> node build_deck.js <out.pptx> <assets dir>
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const lu = require('react-icons/lu');
const fs = require('fs');

const OUT = process.argv[2];
const A = process.argv[3].replace(/\/?$/, '/');
const MJS = fs.readFileSync(__dirname + '/../../narcolens-prototype/js/models/models.js', 'utf8');
const MET = JSON.parse(MJS.match(/NL\.MODEL_METRICS = (\{.*\});/)[1]);
const pct = (v, d) => (v * 100).toFixed(d === undefined ? 1 : d).replace(/\.0$/, '') + '%';

const K = { bg: '050A14', panel: '0B1626', panel2: '0F2037', line: '1E3A52', cyan: '22D3EE', cyanDim: '0E7490', em: '10B981', white: 'FFFFFF', mute: '94A3B8', soft: 'CBD5E1', red: 'F43F5E', amber: 'F97316' };

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
  pres.theme = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' };
  pres.title = 'NarcoLens: AI-Assisted Substance Screening for Police & Airport Customs';
  pres.author = 'Farah Shaik and Riazat Rasool';

  // ---------- helpers ----------
  const cache = {};
  async function icon(name, hex) {
    if (!lu[name]) name = 'LuCircle';
    const k = name + hex;
    if (!cache[k]) {
      const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(lu[name], { color: '#' + hex, size: '256' }));
      cache[k] = 'image/png;base64,' + (await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer()).toString('base64');
    }
    return cache[k];
  }
  async function ico(s, name, x, y, d, color) {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: color || K.cyan, transparency: 86 }, line: { color: color || K.cyan, width: 0.75, transparency: 55 } });
    const p = d * 0.24;
    s.addImage({ data: await icon(name, color || K.cyan), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  }
  const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontSize: 14, color: K.white, valign: 'top', fit: 'none' }, o));
  const card = (s, x, y, w, h, o) => {
    o = o || {};
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: o.fill || K.panel, transparency: o.tr || 0 }, line: { color: o.line || K.line, width: o.lw || 0.75 } });
  };
  const pill = (s, text, x, y, w, h, o) => {
    o = o || {};
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: h / 2, fill: { color: o.fill || K.cyan, transparency: o.tr === undefined ? 85 : o.tr }, line: { color: o.line || K.cyan, width: 0.75, transparency: o.ltr === undefined ? 40 : o.ltr } });
    T(s, text, { x, y, w, h, align: 'center', valign: 'middle', fontSize: o.fs || 11, bold: o.bold !== false, color: o.color || K.cyan, charSpacing: o.cs || 0 });
  };
  const bullets = (items, o) => items.map((t, i) => ({ text: t, options: Object.assign({ bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: 4 }, o || {}) }));
  const arrow = (s, x, y, w, h) => s.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h, fill: { color: K.cyan }, line: { type: 'none' } });
  const line = (s, x1, y1, x2, y2, c) => s.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(0.01, Math.abs(x2 - x1)), h: Math.max(0.01, Math.abs(y2 - y1)),
    flipV: (x2 - x1) * (y2 - y1) < 0, line: { color: c || K.cyanDim, width: 1.25, dashType: 'dash' }
  });
  const img = (s, file, x, y, w, h, o) => s.addImage(Object.assign({ path: A + file, x, y, w, h }, o || {}));
  const glow = () => ({ type: 'outer', color: '22D3EE', opacity: 0.35, blur: 14, offset: 0, angle: 90 });

  pres.defineSlideMaster({
    title: 'NL', background: { color: K.bg },
    objects: [
      { rect: { x: 0, y: 0, w: 13.333, h: 0.06, fill: { color: K.cyan, transparency: 55 } } },
      { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.32, w: 12.13, h: 0.95, fontSize: 32, bold: true, color: K.white, margin: 0, valign: 'middle', align: 'left' }, text: '' } },
      { text: { text: 'NarcoLens - AI-Assisted Substance Screening for Police & Airport Customs', options: { x: 0.6, y: 7.05, w: 9, h: 0.28, fontSize: 9.5, color: K.mute, margin: 0 } } }
    ],
    slideNumber: { x: 12.23, y: 7.05, w: 0.5, h: 0.28, fontSize: 9.5, color: K.mute, align: 'right' }
  });
  pres.defineSlideMaster({ title: 'COVER', background: { color: K.bg }, objects: [] });
  const slide = (title, size) => {
    const s = pres.addSlide({ masterName: 'NL' });
    s.addText(size ? [{ text: title, options: { fontSize: size } }] : title, { placeholder: 'title' });
    return s;
  };
  const NOTE = (t) => t.replace(/\n[ \t]+/g, '\n');
  const M1 = MET.m1, M2 = MET.m2;

  // ================= 1. COVER =================
  let s = pres.addSlide({ masterName: 'COVER' });
  s.addImage({ path: A + 'cover.png', x: 0, y: 0, w: 13.333, h: 7.5 });
  T(s, 'PRESIGHT EUREKA 3.0', { x: 0.7, y: 0.85, w: 5.5, h: 0.3, fontSize: 12, bold: true, color: K.cyan, charSpacing: 2 });
  T(s, 'NarcoLens', { x: 0.7, y: 1.5, w: 5.4, h: 1.0, fontSize: 56, bold: true });
  T(s, 'From Scan to Evidence.', { x: 0.7, y: 2.55, w: 5.4, h: 0.6, fontSize: 28, bold: true, color: K.cyan });
  T(s, 'AI-Assisted Substance Screening for Police & Airport Customs', { x: 0.7, y: 3.4, w: 5.0, h: 0.85, fontSize: 18, color: K.white });
  T(s, 'Transforming existing customs scanners into an intelligent, explainable narcotics screening network.', { x: 0.7, y: 4.4, w: 5.0, h: 0.95, fontSize: 13, color: K.soft });
  s.addShape(pres.shapes.LINE, { x: 0.7, y: 6.2, w: 4.3, h: 0, line: { color: K.line, width: 1 } });
  T(s, 'Farah Shaik & Riazat Rasool', { x: 0.7, y: 6.4, w: 5.5, h: 0.3, fontSize: 14, bold: true });
  T(s, 'Simulated scan. Prototype output on synthetic data.', { x: 7.2, y: 5.2, w: 5.6, h: 0.3, fontSize: 10, italic: true, color: K.mute, align: 'right' });
  s.addNotes(NOTE(`NarcoLens: From Scan to Evidence.

NarcoLens is an AI-assisted substance screening and evidence workflow for police and airport customs. It proposes an intelligence layer that runs beside the scanners customs already operate, and turns them into one connected, explainable narcotics screening network.

The image is an output of our working prototype: a simulated dual-energy X-ray scan, with the AI heatmap marking a suspicious concealment region for the officer to review.

We are Farah Shaik and Riazat Rasool, presenting at Presight Eureka 3.0.`));

  // ================= 2. THREAT =================
  s = slide('Drug concealment is evolving faster than traditional inspection workflows', 26);
  [['502', 'seizures'], ['406 kg', 'narcotic and psychotropic substances'], ['2.3 M+', 'tablets']].forEach((n, i) => {
    const x = 0.6 + i * 4.115;
    card(s, x, 1.45, 3.9, 2.15, { fill: K.panel2 });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.55, w: 0.07, h: 1.95, fill: { color: K.amber }, line: { type: 'none' } });
    T(s, n[0], { x: x + 0.35, y: 1.6, w: 3.4, h: 1.2, fontSize: 60, bold: true, color: K.white, valign: 'middle' });
    T(s, n[1], { x: x + 0.35, y: 2.85, w: 3.4, h: 0.6, fontSize: 14, color: K.soft });
  });
  T(s, 'Dubai Customs, January to May 2026. Source: Emirates News Agency (WAM), June 2026; also reported by Gulf News and Khaleej Times.', { x: 0.6, y: 3.7, w: 12.13, h: 0.3, fontSize: 10.5, italic: true, color: K.mute });
  T(s, 'Concealment keeps changing', { x: 0.6, y: 4.1, w: 6, h: 0.35, fontSize: 15, bold: true, color: K.cyan });
  const conc = [['LuShirt', 'Drugs inside clothing or buttons'], ['LuPackage', 'Narcotics in food or protein containers'], ['LuPill', 'Tablets in legitimate packaging'], ['LuAtom', 'Synthetic substances that keep changing'], ['LuBoxes', 'Complex parcel and cargo concealment']];
  for (let i = 0; i < 5; i++) {
    const x = 0.6 + i * 2.45;
    card(s, x, 4.55, 2.3, 1.2);
    await ico(s, conc[i][0], x + 0.15, 4.75, 0.5, K.amber);
    T(s, conc[i][1], { x: x + 0.78, y: 4.62, w: 1.45, h: 1.05, fontSize: 11.5, valign: 'middle' });
  }
  card(s, 0.6, 5.95, 12.13, 0.9, { fill: K.cyan, tr: 90, line: K.cyanDim });
  T(s, [{ text: 'The challenge is no longer simply scanning more items.  ', options: { color: K.soft } }, { text: 'It is understanding suspicious items faster and more intelligently.', options: { bold: true, color: K.white } }], { x: 0.9, y: 5.95, w: 11.6, h: 0.9, fontSize: 16, valign: 'middle' });
  s.addNotes(NOTE(`The threat is evolving.

Trafficking methods increasingly hide illegal substances inside ordinary objects and legitimate products: clothing and buttons, food and protein containers, tablets in normal-looking packaging, synthetic substances whose composition keeps changing, and complex parcel and cargo concealment.

Dubai Customs reported 502 seizures, 406 kilograms of narcotic and psychotropic substances and more than 2.3 million tablets between January and May 2026. The source is the Emirates News Agency, June 2026.

We read these figures as the scale of findings that officers must assess. They do not show that current systems fail.

The challenge is no longer simply scanning more items. It is understanding suspicious items faster and more intelligently.`));

  // ================= 3. GAP =================
  s = slide('Today\'s scanner can show an anomaly. The officer must still determine what it means.', 24);
  const wf = ['Scanner', 'Operator interpretation', 'Manual inspection', 'Possible field test', 'Laboratory confirmation', 'Case documentation'];
  wf.forEach((t, i) => {
    const x = 0.6 + i * 2.05;
    card(s, x, 1.5, 1.8, 1.0, { fill: K.panel2 });
    T(s, String(i + 1), { x: x + 0.12, y: 1.57, w: 0.4, h: 0.3, fontSize: 11, bold: true, color: K.cyan });
    T(s, t, { x: x + 0.12, y: 1.8, w: 1.58, h: 0.65, fontSize: 12.5, bold: true, valign: 'middle' });
    if (i < 5) arrow(s, x + 1.84, 1.93, 0.18, 0.14);
  });
  const prob = [
    ['LuUserCog', 'Heavy dependence on operator experience'], ['LuScanSearch', 'Suspicious regions can be hard to interpret'],
    ['LuFlaskConical', 'Substance identity often needs additional testing'], ['LuFiles', 'Supporting evidence sits in different systems'],
    ['LuDna', 'Emerging synthetic drugs keep creating new detection challenges'], ['LuNetwork', 'What one site learns may not automatically benefit another']
  ];
  for (let i = 0; i < 6; i++) {
    const x = 0.6 + (i % 3) * 4.115, y = 2.85 + Math.floor(i / 3) * 1.45;
    card(s, x, y, 3.9, 1.25);
    await ico(s, prob[i][0], x + 0.2, y + 0.33, 0.6, K.amber);
    T(s, prob[i][1], { x: x + 1.0, y: y + 0.1, w: 2.75, h: 1.05, fontSize: 13.5, valign: 'middle' });
  }
  card(s, 0.6, 5.85, 12.13, 0.95, { fill: K.cyan, tr: 90, line: K.cyanDim });
  T(s, 'Detection exists.  Intelligence remains fragmented.', { x: 0.6, y: 5.85, w: 12.13, h: 0.95, fontSize: 28, bold: true, align: 'center', valign: 'middle' });
  s.addNotes(NOTE(`Here is the current workflow. A scanner shows an anomaly. An operator interprets it. The item may be opened, perhaps field tested, then confirmed by a laboratory, and the case is documented.

Each step does its job. The gap is between them. Results depend heavily on operator experience. Suspicious regions can be hard to interpret. Identifying a substance often needs additional testing. The supporting evidence sits in different systems. Emerging synthetic drugs keep creating new detection challenges. And what one site learns does not automatically benefit another.

In the public sources we reviewed, we did not find a published system that automatically flags narcotics in UAE customs X-ray images. That does not prove none exists, and we make no claim about systems we cannot see.

Detection exists. Intelligence remains fragmented.`));

  // ================= 4. INTRODUCING =================
  s = slide('NarcoLens adds an intelligence layer to the equipment customs already owns', 26);
  pill(s, 'EXPLAINABLE SUBSTANCE SCREENING', 0.6, 1.4, 3.6, 0.38, { fs: 11, cs: 1 });
  card(s, 0.6, 2.0, 6.4, 0.95);
  T(s, 'Officer review and action', { x: 0.85, y: 2.0, w: 5.9, h: 0.95, fontSize: 18, bold: true, valign: 'middle' });
  card(s, 0.6, 3.15, 6.4, 1.15, { fill: K.cyan, tr: 82, line: K.cyan, lw: 1.25 });
  T(s, 'NarcoLens intelligence layer', { x: 0.85, y: 3.2, w: 5.9, h: 0.5, fontSize: 18, bold: true, color: K.cyan, valign: 'middle' });
  T(s, 'Software and edge AI running beside existing infrastructure', { x: 0.85, y: 3.7, w: 5.9, h: 0.5, fontSize: 12.5, color: K.soft, valign: 'middle' });
  card(s, 0.6, 4.5, 6.4, 0.95, { fill: K.panel2 });
  T(s, 'Existing scanners  ·  desk camera  ·  laboratory referral', { x: 0.85, y: 4.5, w: 5.9, h: 0.95, fontSize: 15, color: K.soft, valign: 'middle' });
  s.addShape(pres.shapes.UP_ARROW, { x: 3.65, y: 2.97, w: 0.3, h: 0.16, fill: { color: K.cyan }, line: { type: 'none' } });
  s.addShape(pres.shapes.UP_ARROW, { x: 3.65, y: 4.32, w: 0.3, h: 0.16, fill: { color: K.cyan }, line: { type: 'none' } });
  card(s, 7.3, 2.0, 2.55, 3.45);
  T(s, 'NarcoLens', { x: 7.5, y: 2.12, w: 2.2, h: 0.4, fontSize: 17, bold: true, color: K.cyan });
  T(s, bullets(['Detects', 'Correlates', 'Assesses', 'Explains', 'Records']), { x: 7.5, y: 2.65, w: 2.2, h: 2.7, fontSize: 15 });
  card(s, 10.0, 2.0, 2.73, 3.45);
  T(s, 'The officer', { x: 10.2, y: 2.12, w: 2.3, h: 0.4, fontSize: 17, bold: true });
  T(s, bullets(['Reviews', 'Re-scans', 'Opens', 'Clears', 'Escalates', 'Seizes']), { x: 10.2, y: 2.65, w: 2.3, h: 2.7, fontSize: 15 });
  card(s, 0.6, 5.7, 12.13, 1.1, { fill: K.cyan, tr: 90, line: K.cyanDim });
  T(s, [{ text: 'AI recommends.  ', options: { color: K.cyan } }, { text: 'Officers decide.', options: { color: K.white } }], { x: 0.6, y: 5.7, w: 12.13, h: 0.75, fontSize: 34, bold: true, align: 'center', valign: 'middle' });
  T(s, 'One digital case for every suspicious bag or parcel, with evidence added by multiple AI modules.', { x: 0.6, y: 6.4, w: 12.13, h: 0.35, fontSize: 12.5, color: K.soft, align: 'center' });
  s.addNotes(NOTE(`NarcoLens adds an intelligence layer to the equipment customs already owns. It is software and edge AI that runs beside the existing infrastructure. It does not replace the scanner, the desk or the laboratory.

For every suspicious bag or parcel, NarcoLens opens one digital case and keeps adding evidence from several AI modules.

NarcoLens detects, correlates, assesses, explains and records. The officer reviews, re-scans, opens, clears, escalates or seizes.

NarcoLens does not replace the officer and never decides on its own. AI recommends. Officers decide.`));

  // ================= 5. FIVE LENSES =================
  s = slide('Five AI lenses. One assessment.');
  const lens = [
    ['M1', 'X-Ray Vision', 'AI segmentation identifies suspicious organic concealment regions in luggage or cargo.', 'AI heatmap and concealment probability', 0.6, 1.45],
    ['M2', 'Pills, Vials & Labels', 'Computer vision analyses tablet shape, size, colour, markings and packaging.', 'Tablet and package similarity assessment', 0.6, 3.2],
    ['M3', 'Hyperspectral ID', 'Short-wave infrared spectra are compared with a reference substance library.', 'Probable substance identification', 0.6, 4.95],
    ['M4', 'Novel Drug Predictor', 'Graph-based AI is proposed to predict signatures of emerging synthetic variants for forensic validation.', 'Candidate spectral signatures', 8.78, 1.45],
    ['M5', 'Explainable Risk Fusion', 'Combines the available evidence into one risk score and shows each signal\'s contribution.', 'Explainable case risk', 8.78, 3.2]
  ];
  lens.forEach((l) => {
    card(s, l[4], l[5], 3.95, 1.6);
    pill(s, l[0], l[4] + 0.18, l[5] + 0.16, 0.55, 0.3, { fs: 11, fill: K.cyan, tr: 20, color: K.bg });
    T(s, l[1], { x: l[4] + 0.85, y: l[5] + 0.14, w: 3.0, h: 0.34, fontSize: 15, bold: true, valign: 'middle' });
    T(s, l[2], { x: l[4] + 0.18, y: l[5] + 0.56, w: 3.6, h: 0.6, fontSize: 11.5, color: K.soft });
    T(s, [{ text: 'Output: ', options: { color: K.cyan, bold: true } }, { text: l[3], options: { color: K.white } }], { x: l[4] + 0.18, y: l[5] + 1.18, w: 3.6, h: 0.35, fontSize: 11 });
  });
  card(s, 8.78, 4.95, 3.95, 1.6, { fill: K.em, tr: 88, line: K.em });
  T(s, 'Explainable assessment', { x: 8.98, y: 5.1, w: 3.6, h: 0.4, fontSize: 15, bold: true, color: K.em });
  T(s, 'One fused score with the contribution of every signal. The officer reviews and acts.', { x: 8.98, y: 5.55, w: 3.55, h: 0.9, fontSize: 12, color: K.soft });
  // hub
  card(s, 4.95, 2.85, 3.43, 2.3, { fill: K.cyan, tr: 84, line: K.cyan, lw: 1.5 });
  T(s, 'NarcoLens Risk Engine', { x: 5.1, y: 3.05, w: 3.13, h: 0.5, fontSize: 18, bold: true, color: K.cyan, align: 'center' });
  T(s, 'One item.\nFive intelligence layers.\nOne explainable assessment.', { x: 5.1, y: 3.65, w: 3.13, h: 1.3, fontSize: 14, align: 'center', color: K.white });
  [[4.55, 2.25, 4.95, 3.6], [4.55, 4.0, 4.95, 4.0], [4.55, 5.75, 4.95, 4.6], [8.78, 2.25, 8.38, 3.6], [8.78, 4.0, 8.38, 4.0]].forEach((c) => line(s, c[0], c[1], c[2], c[3]));
  line(s, 10.75, 4.8, 10.75, 4.95);
  s.addNotes(NOTE(`NarcoLens combines five AI lenses around one risk engine.

M1, X-ray vision, uses AI segmentation to mark suspicious organic concealment regions and gives a heatmap with a concealment probability.

M2 analyses tablet shape, size, colour, markings and packaging with computer vision.

M3 compares short-wave infrared spectra with a reference substance library, to give a probable substance identification.

M4 is proposed. A graph-based model would predict the signatures of emerging synthetic variants, for forensic validation before use.

M5 combines the available evidence into one risk score and shows how much each signal contributed.

One item. Five intelligence layers. One explainable assessment.`));

  // ================= 6. JOURNEY =================
  s = slide('From first scan to laboratory referral', 32);
  const jr = [
    ['Scan', 'A bag, cargo item or parcel enters an existing scanner.', 'LuScanLine'], ['Detect', 'NarcoLens highlights suspicious concealment regions.', 'LuCrosshair'],
    ['Inspect', 'The officer opens or photographs the object when required.', 'LuCamera'], ['Identify', 'Tablet analysis and hyperspectral screening add evidence.', 'LuAtom'],
    ['Fuse', 'Evidence is combined into an explainable risk score.', 'LuGauge'], ['Act', 'The officer chooses the action. Seizures need supervisor approval.', 'LuUserCheck'],
    ['Record', 'Every action joins one timestamped evidence trail.', 'LuClipboardList'], ['Confirm', 'Laboratory results can confirm the substance and feed validated learning.', 'LuFlaskConical']
  ];
  for (let i = 0; i < 8; i++) {
    const x = 0.6 + (i % 4) * 3.08, y = i < 4 ? 1.5 : 4.2;
    card(s, x, y, 2.85, 2.5, { fill: i === 5 ? K.panel2 : K.panel, line: i === 5 ? K.cyan : K.line, lw: i === 5 ? 1.25 : 0.75 });
    T(s, String(i + 1).padStart(2, '0'), { x: x + 0.2, y: y + 0.16, w: 0.7, h: 0.3, fontSize: 12, bold: true, color: K.cyan });
    await ico(s, jr[i][2], x + 2.1, y + 0.14, 0.55);
    T(s, jr[i][0], { x: x + 0.2, y: y + 0.62, w: 2.45, h: 0.45, fontSize: 21, bold: true });
    T(s, jr[i][1], { x: x + 0.2, y: y + 1.12, w: 2.45, h: 0.8, fontSize: 12, color: K.soft });
    if (i === 5) ['CLEAR', 'RE-SCAN', 'OPEN', 'SEIZE'].forEach((t, j) => pill(s, t, x + 0.2 + (j % 2) * 1.25, y + 1.6 + Math.floor(j / 2) * 0.4, 1.15, 0.32, { fs: 10, bold: true, tr: 82 }));
    if (i % 4 < 3) arrow(s, x + 2.9, y + 1.17, 0.16, 0.16);
  }
  s.addNotes(NOTE(`This is the journey of one item, from first scan to laboratory referral.

One, scan: a passenger bag, cargo item or parcel enters an existing scanner. Two, detect: NarcoLens highlights suspicious concealment regions. Three, inspect: the officer opens or photographs the object when required. Four, identify: tablet analysis and hyperspectral screening add evidence. Five, fuse: the evidence is combined into an explainable risk score.

Six, act: the officer chooses clear, re-scan, open or seize, and a seizure needs supervisor approval. Seven, record: every action becomes part of one timestamped evidence trail. Eight, confirm: laboratory results can later confirm the substance and feed validated learning.

Cargo and postal parcels follow the same flow, with the air waybill or parcel barcode as the case identifier. The prototype demonstrates this flow on simulated data.`));

  // ================= 7. EXPLAINABLE =================
  s = slide('Every alert comes with its evidence', 32);
  s.addImage({ path: A + 'xray_dark.png', x: 0.6, y: 1.45, w: 6.2, h: 6.2 * 754 / 1300, shadow: glow() });
  T(s, 'Illustrative case. Simulated scan with the AI heatmap.', { x: 0.6, y: 5.07, w: 6.2, h: 0.25, fontSize: 10, italic: true, color: K.mute });
  s.addImage({ path: A + 'spec.png', x: 0.6, y: 5.4, w: 3.0, h: 3.0 * 350 / 814 });
  T(s, 'Spectral match against the library', { x: 0.6, y: 6.72, w: 3.0, h: 0.25, fontSize: 10, italic: true, color: K.mute });
  card(s, 3.85, 5.4, 2.95, 1.3);
  T(s, [{ text: 'Officer timeline\n', options: { bold: true, color: K.cyan } }, { text: '1  Flagged by M1\n2  Bag opened\n3  Spectrum attached\n4  Seized, lab referral' }], { x: 4.02, y: 5.45, w: 2.7, h: 1.2, fontSize: 10.5, color: K.soft });
  card(s, 7.1, 1.45, 5.63, 3.65);
  s.addShape(pres.shapes.OVAL, { x: 7.35, y: 1.7, w: 1.55, h: 1.55, fill: { color: K.bg }, line: { color: K.red, width: 5 } });
  T(s, '92', { x: 7.35, y: 1.88, w: 1.55, h: 0.8, fontSize: 40, bold: true, align: 'center', valign: 'middle' });
  T(s, 'RISK', { x: 7.35, y: 2.65, w: 1.55, h: 0.3, fontSize: 10, bold: true, align: 'center', color: K.mute, charSpacing: 2 });
  T(s, 'Fused risk score', { x: 9.15, y: 1.75, w: 3.4, h: 0.4, fontSize: 18, bold: true });
  T(s, 'Illustrative example. Each bar shows one signal. The score is a weighted noisy-OR over the available evidence.', { x: 9.15, y: 2.2, w: 3.4, h: 1.0, fontSize: 11, color: K.soft });
  [['Pre-arrival risk', 0.20], ['X-ray concealment', 0.75], ['Tablet / package analysis', 0.50], ['Hyperspectral match', 0.55]].forEach((e, i) => {
    const y = 3.5 + i * 0.38;
    T(s, e[0], { x: 7.35, y, w: 2.3, h: 0.3, fontSize: 11.5, valign: 'middle' });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.7, y: y + 0.08, w: 2.3, h: 0.14, fill: { color: K.line }, line: { type: 'none' } });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.7, y: y + 0.08, w: 2.3 * e[1], h: 0.14, fill: { color: i === 0 ? K.mute : K.cyan }, line: { type: 'none' } });
    T(s, e[1].toFixed(2), { x: 12.1, y, w: 0.5, h: 0.3, fontSize: 11, valign: 'middle', align: 'right', color: K.soft });
  });
  card(s, 7.1, 5.3, 5.63, 1.5, { fill: K.cyan, tr: 90, line: K.cyanDim });
  T(s, 'Evidence, not just an alert', { x: 7.3, y: 5.36, w: 5.2, h: 0.35, fontSize: 15, bold: true, color: K.cyan });
  T(s, bullets(['Faster officer review', 'Findings that stand up to review', 'Stronger evidence continuity', 'Easier supervisor review and laboratory referral']), { x: 7.3, y: 5.75, w: 5.2, h: 1.05, fontSize: 11.5, color: K.soft });
  s.addNotes(NOTE(`Every alert should come with its evidence.

On the left is a simulated scan, with the AI heatmap showing where the model looked. Below it is the spectrum matched against the library, and the officer's timeline.

On the right is the fused risk score. In this illustrative example it is 92. Each bar shows one signal: pre-arrival risk, X-ray concealment, tablet and package analysis, and hyperspectral match. The score is a weighted noisy-OR over the evidence that is available. The values here are illustrative, and the weights are design parameters that have not yet been calibrated on real outcomes.

NarcoLens gives evidence, not just an alert. That means faster officer review, findings that stand up to review, stronger evidence continuity, and easier supervisor review and laboratory referral.`));

  // ================= 7b. ROLES =================
  s = slide('Two roles. One accountable workflow.', 32);
  const roles = [
    ['inspector.png', 'LuUserCheck', 'Inspector mode', 'Frontline screening and evidence',
      ['Screens bags on the live lane and reviews the AI heatmap', 'Checks tablets and labels and runs hyperspectral scans', 'Reviews the fused score and the evidence timeline', 'Asks NarcoLens why an item was flagged', 'Clears, re-scans or opens the item and refers a seizure for sign-off']],
    ['supervisor.png', 'LuShieldCheck', 'Supervisor mode', 'Oversight and accountability',
      ['Approves seizures once the laboratory confirms the substance', 'Reviews cases where the AI flagged and the officer cleared', 'Compares screening and flag rates across entry points', 'Reads the audit log of officer, laboratory and supervisor actions']]
  ];
  for (let i = 0; i < 2; i++) {
    const x = 0.6 + i * 6.18, r = roles[i];
    s.addImage({ path: A + r[0], x, y: 1.4, w: 5.95, h: 5.95 * 540 / 1190, shadow: glow() });
    await ico(s, r[1], x, 4.2, 0.5);
    T(s, r[2], { x: x + 0.65, y: 4.17, w: 3.2, h: 0.32, fontSize: 17, bold: true });
    T(s, r[3], { x: x + 0.65, y: 4.47, w: 4.6, h: 0.25, fontSize: 11, color: K.cyan });
    T(s, bullets(r[4], { fontSize: 11.5, color: K.soft }), { x, y: 4.85, w: 5.95, h: 1.55 });
  }
  card(s, 0.6, 6.45, 12.13, 0.5, { fill: K.cyan, tr: 90, line: K.cyanDim });
  T(s, 'Every action by either role is time-stamped in one audit trail. Demo accounts in the prototype are fictional.', { x: 0.85, y: 6.45, w: 11.6, h: 0.5, fontSize: 12.5, bold: true, valign: 'middle' });
  s.addNotes(NOTE(`NarcoLens has two roles, so the workflow stays accountable from the scanner to the laboratory.

Inspector mode is for frontline screening. The inspector screens bags on the live lane and reviews the AI heatmap, checks tablets and labels, runs hyperspectral scans, and reviews the fused score and the evidence timeline. An assistant can explain why an item was flagged. The inspector clears, re-scans or opens the item, and refers a seizure for sign-off.

Supervisor mode is for oversight. The supervisor approves seizures once the laboratory confirms the substance. The supervisor also reviews cases where the AI flagged an item and the officer cleared it, which keeps a human check on both sides and can feed model calibration. The screen compares screening and flag rates across entry points, and an audit log lists officer, laboratory and supervisor actions.

Every action is time-stamped in one audit trail. The accounts in the prototype are fictional demo accounts.`));

  // ================= 8. CONNECTED INTELLIGENCE =================
  s = slide('A seizure at one entry point can strengthen awareness across the network', 26);
  s.addImage({ path: A + 'map.png', x: 0.6, y: 1.45, w: 6.9, h: 6.9 * 694 / 1224, shadow: glow() });
  T(s, 'Seven simulated entry points', { x: 0.6, y: 5.4, w: 6.9, h: 0.25, fontSize: 10, italic: true, color: K.mute });
  ['Airports', 'Seaports', 'Postal hubs', 'Courier facilities', 'Cargo terminals'].forEach((t, i) => pill(s, t, 0.6 + i * 1.4, 5.72, 1.3, 0.34, { fs: 10, bold: false, color: K.soft }));
  card(s, 0.6, 6.2, 6.9, 0.7, { fill: K.cyan, tr: 88, line: K.cyanDim });
  T(s, [{ text: 'Three suspicious parcels. Two entry points. One sender pattern.', options: { bold: true } }], { x: 0.8, y: 6.2, w: 6.5, h: 0.7, fontSize: 14.5, valign: 'middle' });
  card(s, 7.8, 1.45, 4.93, 2.0);
  T(s, 'Network analytics link cases by', { x: 8.0, y: 1.55, w: 4.5, h: 0.35, fontSize: 14, bold: true, color: K.cyan });
  T(s, bullets(['Sender', 'Route', 'Concealment method', 'Packaging pattern', 'Related case characteristics'], { fontSize: 11.5, color: K.soft }), { x: 8.0, y: 1.95, w: 4.5, h: 1.45 });
  s.addImage({ path: A + 'net.png', x: 8.0, y: 3.6, w: 4.5, h: 4.5 * 786 / 1296, shadow: glow() });
  T(s, 'Case link graph on simulated cases', { x: 7.8, y: 6.38, w: 4.93, h: 0.25, fontSize: 10, italic: true, color: K.mute, align: 'center' });
  s.addNotes(NOTE(`A seizure at one entry point can strengthen awareness across the network.

NarcoLens is designed to connect airports, seaports, postal hubs, courier facilities and cargo terminals to a sovereign government core.

Network analytics links cases by sender, route, concealment method, packaging pattern and related case characteristics. For example, three suspicious parcels, at two entry points, with one sender pattern may point to a single supply route that no individual site would see on its own.

This positions NarcoLens as an intelligence network, and not only an object detector. The map and the link graph are from our prototype, built on simulated cases.`));

  // ================= 9. PRIVACY =================
  s = slide('The intelligence can travel without the raw inspection image', 28);
  const fl = [['Local inspection data', 'Stays at the site'], ['Local model improvement', 'Trained on site'], ['Protected model update', 'Encrypted and noised'], ['Sovereign aggregation', 'Abnormal updates rejected'], ['Updated model returned', 'To participating sites']];
  T(s, 'AT EACH SITE', { x: 0.6, y: 1.3, w: 6.3, h: 0.25, fontSize: 10, bold: true, color: K.mute, charSpacing: 2 });
  T(s, 'SOVEREIGN CORE', { x: 9.1, y: 1.3, w: 2.2, h: 0.25, fontSize: 10, bold: true, color: K.mute, charSpacing: 2 });
  fl.forEach((f, i) => {
    const x = 0.6 + i * 2.48;
    card(s, x, 1.6, 2.2, 1.6, { fill: i === 3 ? K.cyan : K.panel, tr: i === 3 ? 84 : 0, line: i === 3 ? K.cyan : K.line });
    T(s, String(i + 1), { x: x + 0.18, y: 1.7, w: 0.4, h: 0.3, fontSize: 12, bold: true, color: K.cyan });
    T(s, f[0], { x: x + 0.18, y: 2.0, w: 1.9, h: 0.65, fontSize: 14, bold: true });
    T(s, f[1], { x: x + 0.18, y: 2.7, w: 1.9, h: 0.4, fontSize: 11, color: K.soft });
    if (i < 4) arrow(s, x + 2.24, 2.33, 0.2, 0.14);
  });
  card(s, 0.6, 3.5, 6.5, 2.55);
  pill(s, 'PROPOSED  ·  SIMULATED IN THE PROTOTYPE', 0.8, 3.62, 3.9, 0.3, { fs: 9.5, color: K.amber, fill: K.amber, line: K.amber, cs: 1 });
  T(s, bullets(['Raw inspection images remain at the site', 'Protected model updates are shared instead', 'Updates can be encrypted', 'Differential privacy techniques are proposed', 'Robust aggregation can help reject abnormal or poisoned updates', 'Sovereign government infrastructure can host the central services'], { fontSize: 12.5 }), { x: 0.8, y: 4.05, w: 6.1, h: 1.95 });
  s.addImage({ path: A + 'fed.png', x: 7.6, y: 3.5, w: 4.2, h: 4.2 * 780 / 1300, shadow: glow() });
  T(s, 'Federated learning simulator in the prototype', { x: 7.3, y: 6.1, w: 5.4, h: 0.25, fontSize: 10, italic: true, color: K.mute, align: 'center' });
  T(s, [{ text: 'Learn together.  ', options: { color: K.cyan } }, { text: 'Keep sensitive inspection data local.', options: { color: K.white } }], { x: 0.6, y: 6.3, w: 12.13, h: 0.6, fontSize: 24, bold: true, align: 'center', valign: 'middle' });
  s.addNotes(NOTE(`Privacy by design. The intelligence can travel without the raw inspection image.

We propose federated learning. At each site, local inspection data improves a local model. Only a protected model update is shared. Updates can be encrypted, and differential privacy techniques are proposed. At the sovereign core, robust aggregation can help reject abnormal or poisoned updates. The updated model is then returned to the participating sites.

Raw inspection images remain at the site, and sovereign government infrastructure can host the central services.

In the prototype this cycle is a simulation, with a privacy slider that shows the trade-off between protection and learning speed. It is a proposal, not a deployed capability.

Learn together. Keep sensitive inspection data local.`));

  // ================= 10. PROTOTYPE =================
  s = slide('From concept to working proof of concept', 32);
  card(s, 0.6, 1.45, 4.0, 2.55, { line: K.em });
  pill(s, 'LIVE IN THE PROTOTYPE', 0.8, 1.58, 2.2, 0.3, { fs: 9.5, color: K.em, fill: K.em, line: K.em, cs: 1 });
  T(s, bullets(['X-ray concealment AI', 'Tablet and imprint classifier', 'Hyperspectral matching algorithm', 'Explainable risk fusion', 'Offline web interface'], { fontSize: 13 }), { x: 0.8, y: 2.0, w: 3.7, h: 1.9 });
  card(s, 0.6, 4.2, 4.0, 1.75);
  pill(s, 'SIMULATED OR PROPOSED', 0.8, 4.33, 2.4, 0.3, { fs: 9.5, color: K.amber, fill: K.amber, line: K.amber, cs: 1 });
  T(s, bullets(['Novel-drug prediction workflow', 'Federated learning cycle', 'Multi-site operational data'], { fontSize: 13 }), { x: 0.8, y: 4.75, w: 3.7, h: 1.1 });
  const tiles = (label, y, arr) => {
    T(s, label, { x: 4.9, y, w: 7.8, h: 0.3, fontSize: 12, bold: true, color: K.cyan, charSpacing: 1 });
    arr.forEach((t, i) => {
      const x = 4.9 + i * 2.665;
      card(s, x, y + 0.36, 2.5, 1.75, { fill: K.panel2 });
      T(s, t[0], { x: x + 0.2, y: y + 0.42, w: 2.2, h: 0.85, fontSize: 38, bold: true, color: K.white, valign: 'middle' });
      T(s, t[1], { x: x + 0.2, y: y + 1.27, w: 2.2, h: 0.35, fontSize: 12, bold: true, color: K.cyan });
      T(s, t[2], { x: x + 0.2, y: y + 1.6, w: 2.2, h: 0.45, fontSize: 10, color: K.soft });
    });
  };
  tiles('M1  X-RAY MODEL', 1.4, [[pct(M1.bag_recall, 0), 'Bag-level recall', `${M1.test_positive} / ${M1.test_positive} synthetic concealment bags`], [pct(M1.bag_false_alarm), 'False alarms', 'on synthetic clean bags'], [pct(M1.bag_accuracy), 'Bag-level accuracy', '595 / 600 synthetic bags']]);
  tiles('M2  TABLET MODEL', 3.85, [[pct(M2.accuracy), 'Four-class accuracy', '1,200 synthetic tablet images'], [pct(M2.crescent_recall, 0), 'Twin-crescent recall', 'synthetic test set']]);
  card(s, 10.22, 4.21, 2.5, 1.75, { fill: K.bg, line: K.line });
  T(s, 'Held-out test sets', { x: 10.4, y: 4.3, w: 2.2, h: 0.3, fontSize: 12, bold: true });
  T(s, '600 synthetic bags\n1,200 synthetic tablet images\nNever seen in training', { x: 10.4, y: 4.65, w: 2.2, h: 1.2, fontSize: 11, color: K.soft });
  card(s, 0.6, 6.2, 12.13, 0.7, { fill: K.cyan, tr: 90, line: K.cyanDim });
  T(s, 'Results are from held-out synthetic test data and are not estimates of real-world field performance.', { x: 0.85, y: 6.2, w: 11.6, h: 0.7, fontSize: 14, bold: true, valign: 'middle' });
  s.addNotes(NOTE(`The prototype works end to end, and we are careful to separate what is live from what is simulated.

Live in the prototype: the X-ray concealment model, the tablet and imprint classifier, the hyperspectral matching algorithm, the explainable risk fusion, and an offline web interface. The first two are trained neural networks.

Simulated or proposed: the novel-drug prediction workflow, the federated learning cycle, and multi-site operational data.

On held-out synthetic test data, the X-ray model flagged all 311 concealment bags, with a ${pct(M1.bag_false_alarm)} false alarm rate on clean bags and ${pct(M1.bag_accuracy)} bag-level accuracy. The tablet model reached ${pct(M2.accuracy)} four-class accuracy and 100% twin-crescent recall.

These results are from synthetic test data. They show that the method works, and they are not estimates of real-world field performance.`));

  // ================= 11. TRL =================
  s = slide('Current Technology Readiness: TRL 3', 32);
  const trl = ['Basic principles', 'Technology concept', 'Experimental proof of concept', 'Lab validation', 'Relevant environment', 'Demonstration', 'Operational prototype', 'Qualified system', 'Proven operational deployment'];
  trl.forEach((t, i) => {
    const y = 1.45 + i * 0.56, w = 4.7 + i * 0.28, on = i === 2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w, h: 0.48, rectRadius: 0.08, fill: { color: on ? K.cyan : K.panel }, line: { color: on ? K.cyan : K.line, width: 0.75 }, shadow: on ? glow() : undefined });
    T(s, [{ text: 'TRL ' + (i + 1) + '   ', options: { bold: true } }, { text: t }], { x: 0.8, y, w: w - 0.3, h: 0.48, fontSize: 12.5, valign: 'middle', color: on ? K.bg : (i < 2 ? K.soft : K.mute), bold: on });
  });
  pill(s, 'NARCOLENS TODAY', 0.6 + 4.7 + 2 * 0.28 + 0.15, 1.45 + 2 * 0.56 + 0.07, 1.75, 0.34, { fs: 10.5, color: K.cyan, tr: 80, cs: 1 });
  card(s, 8.1, 1.45, 4.63, 3.3);
  T(s, 'NarcoLens currently demonstrates', { x: 8.3, y: 1.55, w: 4.3, h: 0.4, fontSize: 15, bold: true, color: K.cyan });
  T(s, bullets(['End-to-end workflow', 'Working AI components', 'Synthetic test environment', 'Explainable case management', 'Multi-module integration'], { fontSize: 13.5 }), { x: 8.3, y: 2.05, w: 4.3, h: 2.6 });
  card(s, 8.1, 4.95, 4.63, 1.55, { fill: K.cyan, tr: 88, line: K.cyan });
  T(s, 'Next major milestone', { x: 8.3, y: 5.05, w: 4.3, h: 0.35, fontSize: 12, bold: true, color: K.cyan, charSpacing: 1 });
  T(s, 'Validation using real customs scanner data', { x: 8.3, y: 5.42, w: 4.3, h: 1.0, fontSize: 19, bold: true });
  s.addNotes(NOTE(`We place NarcoLens at Technology Readiness Level 3, an experimental proof of concept.

TRL 1 and 2 are the basic principles and the technology concept. TRL 3 is an experimental proof of concept, and that is where we are today. TRL 4 is lab validation, then a relevant environment, a demonstration, an operational prototype, a qualified system, and finally proven operational deployment at TRL 9.

At TRL 3 we demonstrate an end-to-end workflow, working AI components, a synthetic test environment, explainable case management and multi-module integration.

The next major milestone is validation using real customs scanner data. Until then we claim no field performance. We would rather show an honest TRL 3 and a clear path than overstate our maturity.`));

  // ================= 12. PILOT =================
  s = slide('Start invisible. Measure everything.', 36);
  T(s, 'Side-by-side trial: NarcoLens runs beside existing customs procedures and takes no operational action.', { x: 0.6, y: 1.3, w: 12.13, h: 0.35, fontSize: 14, color: K.soft });
  const ph = [['Data preparation', 'Controlled integration with existing scanner outputs'], ['Side-by-side trial', 'Runs on real scanner traffic with no operational effect'], ['Measure', 'Performance and officer workflow against real outcomes'], ['Calibrate and retrain', 'Risk fusion tuned and models retrained on validated real-world data'], ['Controlled deployment', 'Operational use after agreed targets are met']];
  ph.forEach((p, i) => {
    const x = 0.6 + i * 2.48;
    card(s, x, 1.85, 2.2, 2.3, { fill: i === 1 ? K.cyan : K.panel, tr: i === 1 ? 86 : 0, line: i === 1 ? K.cyan : K.line });
    pill(s, 'PHASE ' + (i + 1), x + 0.18, 1.98, 1.0, 0.28, { fs: 9.5, cs: 1 });
    T(s, p[0], { x: x + 0.18, y: 2.38, w: 1.9, h: 0.7, fontSize: 14.5, bold: true });
    T(s, p[1], { x: x + 0.18, y: 3.1, w: 1.9, h: 1.0, fontSize: 11, color: K.soft });
    if (i < 4) arrow(s, x + 2.24, 2.92, 0.2, 0.14);
  });
  T(s, 'PHASE 3 MEASURES', { x: 0.6, y: 4.45, w: 7, h: 0.28, fontSize: 11, bold: true, color: K.cyan, charSpacing: 2 });
  ['Detection recall', 'False-alarm rate', 'Scanner-vendor performance', 'Officer review time', 'Assessment time', 'Evidence-record completeness'].forEach((m, i) => {
    const x = 0.6 + (i % 3) * 2.55, y = 4.85 + Math.floor(i / 3) * 0.7;
    card(s, x, y, 2.4, 0.58);
    T(s, m, { x: x + 0.15, y, w: 2.15, h: 0.58, fontSize: 12, valign: 'middle' });
  });
  card(s, 8.45, 4.45, 4.28, 2.4, { fill: K.panel2, line: K.cyan, lw: 1.25 });
  T(s, 'Proposed pilot acceptance target', { x: 8.65, y: 4.55, w: 3.9, h: 0.3, fontSize: 11, bold: true, color: K.cyan, charSpacing: 1 });
  T(s, '≤ 5%', { x: 8.65, y: 4.9, w: 3.9, h: 0.95, fontSize: 52, bold: true, valign: 'middle' });
  T(s, 'false alarms per lane', { x: 8.65, y: 5.85, w: 3.9, h: 0.35, fontSize: 15, bold: true });
  T(s, 'A proposed acceptance criterion, not an achieved real-world result.', { x: 8.65, y: 6.25, w: 3.9, h: 0.5, fontSize: 10.5, italic: true, color: K.soft });
  s.addNotes(NOTE(`Our proposal is a side-by-side pilot: start invisible, and measure everything.

In a side-by-side trial NarcoLens operates beside existing customs procedures and takes no operational action, so there is no effect on passengers or on current workflow.

Phase one is data preparation and controlled integration. Phase two is the side-by-side trial on real scanner traffic. In phase three we measure detection recall, false-alarm rate, performance by scanner vendor, officer review time, assessment time and evidence-record completeness. In phase four we calibrate the risk fusion and retrain on validated real-world data. Phase five is controlled operational deployment.

A proposed acceptance target is no more than five percent false alarms per lane. That is a proposed pilot criterion. It is not an achieved real-world result.`));

  // ================= 13. DIFFERENT =================
  s = slide('Why NarcoLens is different', 36);
  const hd = (t) => ({ text: t, options: { bold: true, color: K.bg, fill: { color: K.cyan } } });
  const rows = [
    ['X-ray scanning', '✓', '✓'], ['AI concealment localisation', 'Limited / system dependent', '✓'], ['Tablet visual verification', 'Separate process', '✓'],
    ['Hyperspectral identification', 'Separate tool', '✓'], ['Multi-sensor risk fusion', 'Fragmented', '✓'], ['Explainable AI', 'Limited', '✓'],
    ['Cross-site intelligence', 'Fragmented', '✓  on simulated cases'], ['Privacy-preserving shared learning', 'Limited', 'Proposed  ✓'], ['Unified case evidence trail', 'Multiple systems', '✓']
  ];
  s.addTable([[hd('Capability'), hd('Traditional screening'), hd('NarcoLens')]].concat(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: j !== 1, color: j === 2 ? (c.indexOf('Proposed') === 0 ? K.amber : K.cyan) : (j === 1 ? K.mute : K.white), fill: { color: i % 2 ? K.panel : K.panel2 }, align: j === 0 ? 'left' : 'center' } })))), {
    x: 0.6, y: 1.4, w: 12.13, colW: [5.0, 3.7, 3.43], fontSize: 13.5, valign: 'middle', margin: 0.08, border: { type: 'solid', pt: 0.75, color: K.line }, rowH: [0.42].concat(rows.map(() => 0.43))
  });
  T(s, 'Traditional screening describes typical current workflows; capabilities vary by site and scanner vendor. NarcoLens items are demonstrated in the prototype on simulated data, except those marked proposed.', { x: 0.6, y: 5.75, w: 12.13, h: 0.5, fontSize: 10.5, italic: true, color: K.mute });
  card(s, 0.6, 6.3, 12.13, 0.65, { fill: K.cyan, tr: 90, line: K.cyanDim });
  T(s, [{ text: 'NarcoLens does not add another scanner.  ', options: { color: K.soft } }, { text: 'It connects the intelligence around the scanner.', options: { bold: true } }], { x: 0.85, y: 6.3, w: 11.6, h: 0.65, fontSize: 16.5, valign: 'middle' });
  s.addNotes(NOTE(`This comparison shows where NarcoLens is different.

Traditional screening means typical current workflows, and capabilities vary by site and scanner vendor, so please read the left column as a general description, not a claim about any one system.

X-ray scanning is the same. NarcoLens adds AI concealment localisation, tablet visual verification, hyperspectral identification, multi-sensor risk fusion, explainable output, cross-site intelligence and a unified case evidence trail. In the prototype these are demonstrated on simulated data, and cross-site intelligence runs on simulated cases. Privacy-preserving shared learning is proposed.

NarcoLens does not add another scanner. It connects the intelligence around the scanner.`));

  // ================= 14. IMPACT =================
  s = slide('From reactive inspection to intelligent interdiction', 30);
  const pil = [['FASTER', 'Reduce the time required to understand a suspicious item.', 'LuTimer'], ['SMARTER', 'Combine multiple signals instead of relying on a single detection method.', 'LuBrainCircuit'], ['CONNECTED', 'Identify patterns across parcels, routes and entry points.', 'LuNetwork'], ['DEFENSIBLE', 'Maintain an explainable evidence trail from first scan to laboratory referral.', 'LuShieldCheck']];
  for (let i = 0; i < 4; i++) {
    const x = 0.6 + i * 3.08;
    card(s, x, 1.45, 2.89, 2.75, { fill: K.panel2 });
    await ico(s, pil[i][2], x + 0.25, 1.65, 0.62);
    T(s, pil[i][0], { x: x + 0.25, y: 2.4, w: 2.5, h: 0.5, fontSize: 24, bold: true, color: K.cyan });
    T(s, pil[i][1], { x: x + 0.25, y: 2.98, w: 2.45, h: 1.15, fontSize: 12.5, color: K.soft });
  }
  T(s, 'POTENTIAL OPERATIONAL OUTCOMES TO VALIDATE', { x: 0.6, y: 4.5, w: 9, h: 0.3, fontSize: 11, bold: true, color: K.cyan, charSpacing: 2 });
  ['Fewer unnecessary manual inspections', 'Faster assessment of suspicious items', 'Better prioritisation of inspections', 'Stronger laboratory referral records', 'Improved intelligence across sites', 'Faster adaptation to emerging synthetic drugs'].forEach((o, i) => {
    const x = 0.6 + (i % 3) * 4.115, y = 4.95 + Math.floor(i / 3) * 0.7;
    card(s, x, y, 3.9, 0.58);
    T(s, o, { x: x + 0.2, y, w: 3.55, h: 0.58, fontSize: 12.5, valign: 'middle' });
  });
  T(s, 'Hypotheses to test in the pilot. They are not achieved results.', { x: 0.6, y: 6.5, w: 12.13, h: 0.3, fontSize: 12, italic: true, color: K.mute });
  s.addNotes(NOTE(`The expected impact moves from reactive inspection to intelligent interdiction.

Faster: reduce the time required to understand a suspicious item. Smarter: combine multiple signals instead of relying on a single detection method. Connected: identify patterns across parcels, routes and entry points. Defensible: keep an explainable evidence trail from the first scan to the laboratory referral.

The potential operational outcomes to validate are fewer unnecessary manual inspections, faster assessment of suspicious items, better prioritisation of inspections, stronger laboratory referral records, improved intelligence across sites, and faster adaptation to emerging synthetic drugs.

These are hypotheses for the pilot to test. We do not present them as achieved results.`));

  // ================= 15. VISION =================
  s = slide('Every scan becomes intelligence', 36);
  s.addImage({ path: A + 'map.png', x: 5.6, y: 1.5, w: 7.13, h: 7.13 * 694 / 1224, shadow: glow() });
  T(s, 'UAE entry points (simulated network)', { x: 5.6, y: 5.6, w: 7.13, h: 0.25, fontSize: 10, italic: true, color: K.mute, align: 'center' });
  T(s, 'Today, customs systems inspect millions of items independently.', { x: 0.6, y: 1.55, w: 4.7, h: 0.9, fontSize: 15, color: K.soft });
  T(s, 'NarcoLens envisions a future where every validated seizure can improve the intelligence available to the next officer, at the next scanner, at the next border entry point.', { x: 0.6, y: 2.55, w: 4.7, h: 1.9, fontSize: 15, color: K.white });
  T(s, ['Detect earlier.', 'Understand faster.', 'Learn together.'].map((t, i) => ({ text: t, options: { breakLine: i < 2, color: i === 2 ? K.cyan : K.white } })), { x: 0.6, y: 4.75, w: 4.7, h: 1.9, fontSize: 28, bold: true });
  s.addNotes(NOTE(`This is our vision: every scan becomes intelligence.

Today, customs systems inspect millions of items independently. NarcoLens envisions a future where every validated seizure can improve the intelligence available to the next officer, at the next scanner, at the next border entry point.

The map shows the seven simulated entry points in our prototype, connected as one network.

Detect earlier. Understand faster. Learn together.`));

  // ================= 16. ASK =================
  s = slide('Help us take NarcoLens from simulation to the border', 30);
  const ask = [['ACCESS', 'Anonymised or controlled real scanner data for validation.', 'LuDatabase'], ['EXPERTISE', 'Collaboration with customs officers, forensic laboratories and anti-narcotics specialists.', 'LuUsers'], ['PILOT', 'A controlled side-by-side trial at a selected customs environment.', 'LuRadar']];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 4.115;
    card(s, x, 1.5, 3.9, 2.55, { fill: K.panel2 });
    await ico(s, ask[i][2], x + 0.3, 1.75, 0.62);
    T(s, ask[i][0], { x: x + 1.1, y: 1.8, w: 2.6, h: 0.55, fontSize: 22, bold: true, color: K.cyan, valign: 'middle' });
    T(s, ask[i][1], { x: x + 0.3, y: 2.65, w: 3.35, h: 1.3, fontSize: 14, color: K.soft });
  }
  card(s, 0.6, 4.35, 12.13, 2.45, { fill: K.cyan, tr: 90, line: K.cyanDim });
  T(s, 'NarcoLens', { x: 0.6, y: 4.5, w: 12.13, h: 0.8, fontSize: 40, bold: true, align: 'center', valign: 'middle' });
  T(s, 'From Scan to Evidence.', { x: 0.6, y: 5.3, w: 12.13, h: 0.5, fontSize: 24, bold: true, color: K.cyan, align: 'center' });
  T(s, 'AI intelligence for the officers protecting our borders.', { x: 0.6, y: 5.85, w: 12.13, h: 0.4, fontSize: 16, color: K.soft, align: 'center' });
  T(s, 'Farah Shaik & Riazat Rasool', { x: 0.6, y: 6.35, w: 12.13, h: 0.3, fontSize: 12, color: K.white, align: 'center' });
  s.addNotes(NOTE(`Help us take NarcoLens from simulation to the border.

We are seeking three things. Access: anonymised or controlled real scanner data for validation. Expertise: collaboration with customs officers, forensic laboratories and anti-narcotics specialists. And a pilot: a controlled side-by-side trial at a selected customs environment.

We are not claiming any partnership, approval or deployment today. What we have is a working proof of concept, an honest maturity level, and a clear route to validation.

NarcoLens. From Scan to Evidence. AI intelligence for the officers protecting our borders. Thank you. We are Farah Shaik and Riazat Rasool.`));

  await pres.writeFile({ fileName: OUT });
  console.log('written', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
