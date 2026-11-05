# Průvodce přestupem Českého florbalu

Statický web, který hráči a rodičům řekne, jakou možnost změny klubu mají (přestup, hostování, střídavý start,
střídavé hostování, změna oddílové příslušnosti), kolik stojí a co udělat dál. Pravidla vycházejí z Přestupního (PŘ),
Registračního (RegŘ) a Soutěžního řádu (SŘ) ČF, Edice 2026, platné od 1. 7. 2026. Řády jsou ve složce `rady/`
(viz níže). Web běží na GitHub Pages: https://fialacf.github.io/prestup-hostovani/
(repozitář `fialacf/prestup-hostovani`, větev `main`). Repozitář je veřejný, nepiš do něj osobní údaje.

## Řády (zdroj pravidel)
Složka `rady/` obsahuje řády ČF, Edice 2026, jako PDF a vedle nich textovou verzi (`pdftotext -layout`), kterou jde
prohledávat příkazem `grep`:
- `rady/Prestupni-rad-2026.pdf` a `.txt` – Přestupní řád (PŘ),
- `rady/Registracni-rad-2026.pdf` a `.txt` – Registrační řád (RegŘ).
Soutěžní řád (SŘ) zatím v repozitáři není, požádej o něj zadavatelku. Před každou změnou pravidla otevři příslušný
článek v `.txt` (u sporného místa i v PDF, kde je přesné znění) a cituj ho jen tak, jak skutečně stojí. Když zadavatelka
nahraje novou edici, nahraď soubory (název s ročníkem edice), znovu vytvoř `.txt` a projdi pravidla na stránce Podklady.
Řády jsou veřejné dokumenty ČF, repozitář je veřejný a stránka je tak jako soubory dostupná na GitHub Pages.

## Technologie
Čisté HTML, CSS a JavaScript bez sestavování a bez závislostí. Písma z Google Fonts. Testy používají Playwright
(jen vývojová závislost ve složce `tests/`). Web se nahrává přímo z `main`, `.nojekyll` je prázdný soubor.

## Kde co je
- `config.js` – data: kategorie a věky, přestupní období, poplatky, žebříčky lig, odkazy, e-mail matriky,
  `dataUpdated`. Cokoliv, co se mění se sezónou, patří sem.
- `index.html` – průvodce: pole `STEPS` (otázky), funkce `evaluate()` (výsledek každé možnosti), `renderResult()`,
  upozornění (`periodNotice`, `hostEndNotice`, `ststUsedNotice`, `goalNotice`), `renderAll()` (záložka Všechny možnosti).
- `podklady.html` – všechna pravidla s uvedeným zdrojem, popis chování průvodce a otevřené body. Vykresluje se
  z `config.js`, texty pravidel jsou ručně v poli `R`, chování v `B`, otevřené body a úkoly v `O`.
- `style.css` – společný vzhled, světlý i tmavý režim podle zařízení.
- `tests/` – `suite.js` (kontroly od začátku do konce) a `fuzz.js` (náhodné průchody průvodcem).

## Styl
- Texty pro hráče česky, tykání, krátké věty, srozumitelně. Bez emoji.
- Žádné zkratky ZOP, STST, STH: používej plné názvy „změna oddílové příslušnosti“, „střídavý start“, „střídavé hostování“.
- Komentáře v kódu česky, stručné, vysvětlují proč, ne co. Commity česky, popis co a proč.
- Žádné nové závislosti. Odpovědi hráče zůstávají v prohlížeči, nikam se neposílají.

## Pravidla práce (zadavatelka je vyžaduje)
1. **Před změnou napiš, co upravíš, a počkej na souhlas.** Platí i pro drobnosti, které mění chování nebo text.
   Výjimka: zadavatelka sama přesně zadá, co mám udělat.
2. **Nevymýšlej pravidla.** Každé pravidlo má zdroj: „Z řádu“ (číslo článku), „Upřesnění ČF“ (od zadavatelky,
   v řádu není nebo je to výklad) nebo „Předpoklad“. Štítek „Z řádu“ dej jen tomu, co v článku skutečně stojí,
   a ověř to proti řádu ve složce `rady/`. Když si nejsi jistý, zeptej se.
3. **Změna pravidla nebo textu = ve stejné změně upravit všechna místa:** `config.js` / `evaluate()`, stránku
   `podklady.html` (pole `R`, `B`, `O`), záložku Všechny možnosti (`renderAll()` v `index.html`) a `dataUpdated`
   v `config.js` (tvar `RRRR-MM-DD HH:MM`, pražský čas, čas skutečné změny).
4. **Před každým nahráním na `main` spusť z kořene repozitáře přesně tento příkaz a nahrávej jen tehdy, když
   projdou oba testy (oba skončí kódem 0):**
   `node tests/suite.js && node tests/fuzz.js 3000`
   Potom se podívej na změněné obrazovky (mobil i počítač, světlý i tmavý režim). Když test selže kvůli záměrné
   změně textu, uprav test, ne obráceně. Nová funkce nebo oprava chyby = nový test.
5. Hotové změny nahraj na `main`. Pull request jen na výslovné přání.
6. Do repozitáře nepatří screenshoty, výstupy testů ani pomocné soubory. **Výjimka: složka `tests/`**, kde jsou
   povolené testovací skripty a jejich `package.json`, a složka `rady/` s řády. Dočasné soubory ukládej mimo repozitář (`.gitignore`
   blokuje `*.png` a `node_modules`).
7. Jména z řádu a od zadavatelky se nepřejmenovávají (například „Změna oddílové příslušnosti“, „Divize“).

## Testy
Spuštění před každým nahráním (z kořene repozitáře): `node tests/suite.js && node tests/fuzz.js 3000`
- V cloudové relaci je Playwright už nainstalovaný. Jinde jednou: `cd tests && npm install && npx playwright install chromium`.
- `npm test` ve složce `tests/` dělá totéž. `node tests/fuzz.js 6000 12345 --save=soubor.json` uloží strukturu
  výsledků pro porovnání dvou verzí (soubor ulož mimo repozitář). Náhodný průchod se stejným seedem před úpravou
  a po ní je dobrý důkaz, že úklid kódu nic nezměnil.
- `suite.js` hlídá poplatky, pravidla, upozornění, historii prohlížeče, mobilní šířky, přístupnost a podklady.
  `fuzz.js` hlásí výjimky a texty „undefined“ nebo „NaN“.

## Dohody se zadavatelkou (neměnit bez ptaní)
**Vzhled a chování průvodce**
- Kategorie v tomto pořadí a s těmito názvy, ročníky se počítají automaticky a jsou v závorce: Muži / ženy;
  Muži / ženy 19–21 let (první tři sezóny v dospělých); U19 junioři / juniorky; U17 dorostenci / dorostenky;
  U15 starší žáci / žákyně; U13 mladší žáci / žákyně; U11 starší elévové / elévky; U9 mladší elévové / elévky;
  U7 přípravka (jedna kategorie, bez mini přípravky).
- Průvodce nemá být zbytečně velký. Vysvětlení patří ke každé otázce, která se dá splést. Dvě podobné otázky
  („přestup za poslední 3 měsíce“ a „nová registrace za poslední 3 měsíce“) jsou v jednom kroku přímo pod sebou.
- Když něco nejde, ukaž to nahoře jako upozornění: proč a od kdy to půjde, s tlačítkem „Zobrazit k datu“. Neschovávat
  to jen do části „Teď nejde“. Když cíl hráče nejde splnit, ale nabízejí se jiné možnosti, řekni to a vysvětli rozdíl.
- Přehled „Moje odpovědi“ je vidět už při odpovídání, jen z předchozích kroků, a kliknutím na odpověď se hráč vrátí
  k otázce.
- V části „Dobré vědět“ zůstávají tři poznámky (nesouhlas klubu, nevyjádření klubu, evidenční dodatek). Poznámku
  o opakovaném přestupu zadavatelka zrušila („nedává smysl“), nevracet.
- Mezinárodní přestup: jen informační věta v patičce. Odkaz na stránku Podklady a pravidla je v patičce.
  Na stránce Podklady je „Stav dat“ s datem a časem.

**Pravidla, která upřesnila zadavatelka**
- Hostování musí trvat minimálně 30 dnů a nejde ukončit dřív než 30 dnů od jeho **začátku**. Je to vědomá odchylka
  od PŘ čl. 3.5 (ten mluví o schválení). Jedno hostování najednou: chce-li hráč hostovat jinde, nejdřív ukončí
  současné a pak (je-li přestupní období) podá nové. Hostující hráč může přestoupit jen do klubu, kde hostuje.
- Změna oddílové příslušnosti nejde během hostování, střídavého startu ani střídavého hostování. Žádost je papírová
  (ne elektronická) a řeší se e-mailem na matrika@ceskyflorbal.cz. Podmínky zůstávají, včetně „člen ČF déle než
  1 rok“ (výklad: rok neaktivity). Otázka na novou registraci za poslední 3 měsíce je přeformulovaná, aby se
  nepletla s přestupem.
- Když se mateřský klub do 14 dnů nevyjádří (zadavatelka potvrdila, že „lhůta“ je těch 14 dnů), nic se neděje
  automaticky: hráč to aktivně řeší s matrikou před vypršením lhůty a matrika může žádost posoudit, jako by klub souhlasil. Přestup se schválí i přes nesouhlas klubu,
  pokud je hráč členem ČF nejvýš 12 měsíců, nebo mu není 12 let.
- Zrušení členství není způsob, jak změnit klub. Obnoví-li hráč členství do roka od posledního zápasu, vrátí se do
  původního klubu. Obnovuje se přihlášením ve FISu. Členský příspěvek 200 Kč na sezónu platí hráč ve FISu, nebo přes klub.
- Evidenční dodatek lze uzavřít jen s hráčem starším 16 let, proto se na něj ptáme až od U17.
- Hráč bez klubu: zůstává, jak je. Otázky na důvod a datum ztráty klubu zadavatelka zatím odložila.
- Nový hráč: odkaz na hledání klubu podle věku (do U15 mickoni.cz, od U17 ceskyflorbal.cz/hraj).
- Střídavý start: jen muži a ženy 19–21 let, jen za A-družstva. Mateřský klub musí hrát nejvyšší celostátní soutěž,
  druhý klub hraje o 1–2 úrovně níže, muži a ženy se porovnávají zvlášť (žebříčky jsou v `config.js`).
- Střídavé hostování: pravidla podle kategorie a úrovně soutěže klubu (starší žáci, dorost, junioři a juniorky);
  1. liga dorostenek se pro střídavé hostování počítá jako celostátní. Žebříčky lig mládeže dodala zadavatelka
  (`config.js`, `sthLadders`) a řády je neuvádějí.

## Jak odpovídat zadavatelce
- Česky, stručně, bez zkratek. Napiš, co se změnilo, co jsi ověřil (a čím) a co ne.
- Nikdy netvrď, že je změna vidět na `fialacf.github.io`: z cloudové relace ta doména není dostupná. Po nahrání ji
  upozorni, že má stránku obnovit natvrdo (Ctrl+F5).
- Snímky obrazovky od zadavatelky bývají z telefonu a často v tmavém režimu. Kontroluj mobil i tmavý režim.
- Větší revizi dělej s nezávislým přečtením kódu a porovnáním pravidel s řády ve složce `rady/`, ne jen vlastním pohledem.

## Co vědět a co zbývá
- Ročníky narození se počítají z věku dovršeného v kalendářním roce začátku sezóny a dnes se přepínají 1. 7.
  Žádosti na novou sezónu se ale podávají od 1. 5., přechod mezi sezónami není vyřešen a návrh je přepnout vždy k 1. 5.
- Přestupní období: 1. 7. – 31. 1. (dorost, junioři, dospělí) a 1. 7. – 31. 3. (starší žáci a mladší).
- Mimo rozsah: mezinárodní přestupy. Odloženo: obnova po zrušení klubem a opakovaný přestup.
- Úplný seznam otevřených bodů a úkolů je na stránce Podklady a pravidla (pole `O` v `podklady.html`). Při práci
  na nich ho aktualizuj.
