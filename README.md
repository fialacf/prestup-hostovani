# Průvodce přestupem

Interaktivní průvodce tuzemskými přestupy v Českém florbalu. Hráč odpoví na pár otázek a uvidí, které možnosti změny klubu může využít (změna oddílové příslušnosti, přestup, hostování, střídavý start, střídavé hostování a jejich ukončení), kolik stojí a co udělat dál.

Web: https://fialacf.github.io/prestup-hostovani/

## Jak to funguje

Celá aplikace je jeden statický soubor `index.html` bez závislostí a bez sestavování.

## Úpravy pro novou sezónu

Termíny přestupních období, poplatky a seznam nejvyšších soutěží jsou na jednom místě v objektu `CONFIG` na začátku skriptu v `index.html`. Logika vyhodnocení je ve funkci `evaluate()`.

## Nasazení

GitHub Pages: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.

> Průvodce je orientační, závazný je Přestupní řád Českého florbalu.
