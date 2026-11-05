# Průvodce přestupem

Interaktivní průvodce tuzemskými přestupy v Českém florbalu. Hráč odpoví na pár otázek a uvidí, které možnosti změny klubu může využít (změna oddílové příslušnosti, přestup, hostování, střídavý start, střídavé hostování a jejich ukončení), kolik stojí a co udělat dál.

Web: https://fialacf.github.io/prestup-hostovani/

## Jak to funguje

Statická stránka bez sestavování:

- `index.html` – průvodce a záložka Všechny možnosti,
- `podklady.html` – všechna data a pravidla pro kontrolu (vykresluje se z `config.js`),
- `config.js` – kategorie, termíny, poplatky, žebříčky soutěží a odkazy,
- `style.css` – společný vzhled.
- `tests/` – testy průvodce (Playwright), spuštění viz níže,
- `rady/` – Přestupní a Registrační řád (Edice 2026) jako PDF a text, zdroj pravidel,
- `CLAUDE.md` – popis projektu a pravidla práce pro Claude Code.

## Úpravy pro novou sezónu

Termíny přestupních období, poplatky, žebříčky soutěží a odkazy jsou v `config.js`. Po změně dat nebo pravidel přepiš i `dataUpdated` ve tvaru `RRRR-MM-DD HH:MM` (pražský čas, zobrazuje se na stránce Podklady). Pravidla a jejich zdroje na stránce Podklady (tabulka „Pravidla podle možností“) jsou v `podklady.html`, logika vyhodnocení je ve funkci `evaluate()` v `index.html`.

## Nasazení

GitHub Pages: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.

> Průvodce je orientační, závazný je Přestupní řád Českého florbalu.

## Testy

```bash
cd tests
npm install
npx playwright install chromium
npm test
```

`suite.js` jsou kontroly od začátku do konce (poplatky, pravidla, upozornění, historie, mobilní šířky, přístupnost, podklady), `fuzz.js` náhodně projde průvodce tisíci kombinací odpovědí a hlásí chyby.
