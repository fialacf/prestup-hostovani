// Náhodný průchod průvodcem jako hráč: stejné kroky jako v UI, pro každou kombinaci odpovědí vykreslí všechny
// obrazovky a výsledek. Hlásí výjimky, texty „undefined“/„NaN“ a karty bez štítku.
// Spuštění: node fuzz.js [počet=3000] [seed=12345] [--save=soubor.json] [--base=adresa-index.html]
// --save uloží strukturu výsledků (nadpis, karty, upozornění) pro porovnání dvou verzí.
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const opt = n => (args.find(a => a.startsWith('--' + n + '=')) || '').split('=').slice(1).join('=');
const pos = args.filter(a => !a.startsWith('--'));
const N = +(pos[0] || 3000), seed = +(pos[1] || 12345);
const base = opt('base') || 'file://' + path.resolve(__dirname, '..', 'index.html');
const save = opt('save');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 390, height: 900}});
  const pageErrors = [];
  p.on('pageerror', e => pageErrors.push(e.message));
  await p.goto(base);
  const t0 = Date.now();
  const res = await p.evaluate(({N, seed}) => {
    let s = seed >>> 0;
    const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const pick = a => a[Math.floor(rnd() * a.length)];
    const dates = ["2026-07-01", "2026-11-04", "2027-01-31", "2027-02-01", "2027-03-31", "2027-04-01", "2027-05-20", "2027-06-30", "2027-07-01"];
    const bad = /undefined|NaN|\[object|\bnull\b/;
    const out = {}, problems = [];
    let screens = 0;
    navFromPop = true; // nezapisovat do historie prohlížeče
    const check = (where, key) => {
      screens++;
      const t = W.textContent;
      if (bad.test(t)) problems.push({where, key, text: t.match(bad)[0], ctx: t.slice(Math.max(0, t.search(bad) - 60), t.search(bad) + 40)});
      for (const a of W.querySelectorAll("a[href]")) if (/undefined|null/.test(a.getAttribute("href"))) problems.push({where, key, href: a.getAttribute("href")});
      for (const c of W.querySelectorAll(".card")) if (!c.querySelector(".pill")) problems.push({where, key, text: "karta bez štítku"});
    };
    for (let n = 0; n < N; n++) {
      for (const k in A) delete A[k];
      A.date = pick(dates);
      let guard = 0;
      try {
        while (guard++ < 25) {
          const steps = visible();
          const st = steps.find(x => !stepDone(x));
          if (!st) break;
          idx = steps.indexOf(st); render(); check("krok " + st.id, JSON.stringify(A));
          if (st.type === "choice") { A[st.id] = pick(st.options().filter(x => !x[3]))[0]; }
          else if (st.type === "date") { A[st.id] = st.id === "hostStart" ? iso(addDays(parse(A.date), -Math.floor(rnd() * 150))) : (A.date || todayIso()); }
          else { for (const [k, q, kind, o] of st.items()) { if (kind === "heading" || A[k]) continue; A[k] = pick(o || YN)[0]; } }
        }
        idx = visible().length; render();
        const key = JSON.stringify(Object.fromEntries(Object.entries(A).sort()));
        check("výsledek", key);
        out[key] = {
          h2: (W.querySelector("h2") || {}).textContent,
          chips: W.querySelectorAll("button.chip").length,
          notices: [...W.querySelectorAll(".notice")].map(x => x.innerText.replace(/\s+/g, " ")),
          cards: [...W.querySelectorAll(".card")].map(c => ({n: c.querySelector("h3").textContent, p: c.querySelector(".pill").textContent, d: (c.querySelectorAll("dd")[1] || {}).textContent, r: c.querySelector(".reason") ? c.querySelector(".reason").textContent : "", mail: !!c.querySelector("a.mailbtn")}))
        };
      } catch (e) { problems.push({where: "výjimka", key: JSON.stringify(A), text: String(e && e.stack || e).slice(0, 300)}); }
    }
    return {out, problems, screens, combos: Object.keys(out).length};
  }, {N, seed});
  if (save) fs.writeFileSync(save, JSON.stringify(res.out));
  console.log(`kombinací: ${res.combos}, obrazovek: ${res.screens}, čas: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log('problémů:', res.problems.length, '| chyby stránky:', pageErrors.length);
  const seen = new Set();
  for (const pr of res.problems) { const k = pr.where + pr.text + (pr.ctx || ''); if (seen.has(k)) continue; seen.add(k); if (seen.size > 12) break; console.log(' -', JSON.stringify(pr).slice(0, 400)); }
  await b.close();
  process.exit(res.problems.length || pageErrors.length ? 1 : 0);
})();
