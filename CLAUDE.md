# Průvodce přestupem Českého florbalu

Statický web, který hráči a rodičům řekne, jakou možnost změny klubu mají (přestup, hostování, střídavý start,
střídavé hostování, změna oddílové příslušnosti), kolik stojí a co udělat dál. Pravidla vycházejí z Přestupního,
Registračního a Soutěžního řádu ČF (Edice 2026, platné od 1. 7. 2026). Běží na GitHub Pages:
https://fialacf.github.io/prestup-hostovani/ (repozitář `fialacf/prestup-hostovani`, větev `main`).

## Technologie
Čisté HTML, CSS a JavaScript bez sestavování a bez závislostí. Písma z Google Fonts. Testy používají Playwright
(jen vývojová závislost ve složce `tests/`). Webu se nahrává přímo z `main`, `.nojekyll` je prázdný soubor.

## Kde co je
- `config.js` – data: kategorie a věky, přestupní období, poplatky, žebříčky lig, odkazy, e-mail matriky,
  `dataUpdated`. Cokoliv, co se mění se sezónou, patří sem.
- `index.html` – průvodce: pole `STEPS` (otázky), funkce `evaluate()` (výsledek každé možnosti), `renderResult()`,
  upozornění (`periodNotice`, `hostEndNotice`, `ststUsedNotice`, `goalNotice`), `renderAll()` (záložka Všechny možnosti).
- `podklady.html` – všechna pravidla s uvedeným zdrojem, popis chování průvodce a otevřené body. Vykresluje se
  z `config.js`, texty pravidel jsou ručně v poli `R`, chování v `B`, otevřené body v `O`.
- `style.css` – společný vzhled, světlý i tmavý režim podle zařízení.
- `tests/` – `suite.js` (end-to-end kontroly) a `fuzz.js` (náhodné průchody průvodcem).

## Styl
- Texty pro hráče česky, tykání, krátké věty, srozumitelně. Bez emoji.
- Žádné zkratky ZOP, STST, STH: používej plné názvy „změna oddílové příslušnosti“, „střídavý start“, „střídavé hostování“.
- Komentáře v kódu česky, stručné, vysvětlují proč, ne co. Commity česky, popis co a proč.
- Žádné nové závislosti. Odpovědi hráče zůstávají v prohlížeči, nikam se neposílají.

## Pravidla práce (zadavatelka je vyžaduje)
1. **Před změnou napiš, co upravíš, a počkej na souhlas.** Platí i pro drobnosti, které mění chování nebo text.
2. **Nevymýšlej pravidla.** Každé pravidlo má zdroj: „Z řádu“ (číslo článku), „Upřesnění ČF“ (od zadavatelky,
   v řádu není nebo je to výklad) nebo „Předpoklad“. Když si nejsi jistý, zeptej se.
3. **Změna pravidla nebo textu = ve stejné změně upravit všechna místa:** `config.js` / `evaluate()`, stránku
   `podklady.html` (pole `R`, `B`, `O`), záložku Všechny možnosti (`renderAll()` v `index.html`) a `dataUpdated`
   v `config.js` (tvar `RRRR-MM-DD HH:MM`, pražský čas, čas skutečné změny).
4. **Před nahráním spusť testy** a podívej se na změněné obrazovky (mobil i počítač). Když test selže kvůli záměrné
   změně textu, uprav test, ne obráceně.
5. Hotové změny nahraj na `main`. Pull request jen na výslovné přání.
6. Do repozitáře nepatří screenshoty ani pomocné soubory (`.gitignore` blokuje `*.png`).
7. Jména z řádu a od zadavatelky se nepřejmenovávají (například „Změna oddílové příslušnosti“, „Divize“).

## Testy
```bash
cd tests
npm install                       # jednou
npx playwright install chromium   # jednou (v cloudové relaci je Playwright už nainstalovaný)
npm test                          # suite.js + fuzz.js
node suite.js                     # jen kontroly end-to-end
node fuzz.js 6000 12345 --save=a.json   # náhodné průchody, uloží strukturu výsledků pro porovnání dvou verzí
```
Náhodný průchod je dobrý důkaz, že úklid kódu nic nezměnil: spusť ho před úpravou a po ní se stejným seedem a
porovnej uložené soubory.

## Co vědět
- Ročníky narození se počítají z věku dovršeného v kalendářním roce začátku sezóny a přepínají se 1. 7.
  (žádosti na novou sezónu se přitom podávají od 1. 5., viz otevřené body v podkladech).
- Přestupní období: 1. 7. – 31. 1. (dorost, junioři, dospělí) a 1. 7. – 31. 3. (starší žáci a mladší).
- Mimo rozsah: mezinárodní přestupy. Odloženo: obnova po zrušení klubem (otázka na důvod a datum ztráty klubu)
  a opakovaný přestup. Jsou v podkladech jako otevřené body.
- Z cloudové relace není dostupná doména `fialacf.github.io`, nasazení ověřuje zadavatelka. Po nahrání ji upozorni,
  že má stránku obnovit natvrdo (Ctrl+F5), a neslibuj, že je změna na webu vidět.
