/* Vykreslení stránky možnosti z OBSAH (obsah.js) a CONFIG (../config.js). Bez závislostí. */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const popisek = {rad:"Z řádu", up:"Upřesnění ČF", pred:"Předpoklad"};
  const zdroj = (z, t) => z ? `<span class="zdroj"><span class="tag ${t === "rad" ? "" : "up"}">${popisek[t]}</span>${esc(z)}</span>` : "";
  const seznam = (pole, cls) => `<ul class="pole ${cls || ""}">` + pole.map(([t, z, s]) => `<li>${esc(t)}${zdroj(z, s)}</li>`).join("") + `</ul>`;
  const datum = ([m, d]) => `${d}. ${m === 1 ? "ledna" : m === 3 ? "března" : m + "."}`;

  // Kalendář sezóny od 1. 5. do 30. 6. následujícího roku; polohy v procentech podle dnů.
  const T0 = Date.UTC(2026, 4, 1), T1 = Date.UTC(2027, 6, 1), DEN = 864e5;
  const pos = (r, m, d) => (Date.UTC(r, m - 1, d) - T0) / (T1 - T0) * 100;
  const MES = ["kvě","čvn","čvc","srp","zář","říj","lis","pro","led","úno","bře","dub","kvě","čvn"];
  const styl = (l, w) => `left:${l.toFixed(2)}%;width:${w.toFixed(2)}%`;

  function graf(nazev, konec, o) {
    const oPos = pos(2026, 10, 1);                       // příklad: datum OD 1. 10.
    const konecPos = pos(konec[0] === 1 ? 2027 : 2027, konec[0], konec[1] + 1);
    const blok = pos(2027, 1, 1) - oPos;                 // 3 měsíce od 1. 10. do 1. 1.
    const mesice = MES.map((m, i) => {
      const od = Date.UTC(2026, 4 + i, 1), do_ = Date.UTC(2026, 5 + i, 1);
      return `<span style="width:${((do_ - od) / (T1 - T0) * 100).toFixed(3)}%">${m}</span>`;
    }).join("");
    const aria = `${nazev}. Žádost jde podat od 1. května do ${datum(konec)}. Přestupní období je od 1. července do ${datum(konec)}. Po přestupu 3 měsíce nejde podat další přestup ani hostování.`;
    return `<figure class="graf-box"><figcaption><h3>${esc(nazev)}</h3></figcaption>
      <div class="graf" role="img" aria-label="${esc(aria)}">
        <div class="mesice" aria-hidden="true">${mesice}</div>
        <div class="plocha" aria-hidden="true">
          <div class="r"><div class="t">${esc(o.osa.zadost)} do ${datum(konec)}</div>
            <div class="dr"><i class="b zadost" style="${styl(0, konecPos)}"></i></div></div>
          <div class="r"><div class="t">${esc(o.osa.obdobi)}: 1. července – ${datum(konec)}</div>
            <div class="dr"><i class="b obdobi" style="${styl(pos(2026, 7, 1), konecPos - pos(2026, 7, 1))}"></i></div></div>
          <div class="klub">
            <div class="cara" style="left:${oPos.toFixed(2)}%"></div>
            <div class="r"><div class="t od" style="padding-left:calc(${oPos.toFixed(2)}% + 8px)">${esc(o.osa.znacka)}</div></div>
            <div class="r"><div class="t">${esc(o.osa.stary)}</div>
              <div class="dr"><i class="b stary" style="${styl(0, oPos)}"></i></div></div>
            <div class="r"><div class="t" style="padding-left:calc(${oPos.toFixed(2)}% + 8px)">${esc(o.osa.novy)}</div>
              <div class="dr"><i class="b novy" style="${styl(oPos, 100 - oPos)}"></i></div></div>
            <div class="r"><div class="t" style="padding-left:calc(${oPos.toFixed(2)}% + 8px)">${esc(o.osa.blokace)}<span class="zdroj">${esc(o.osa.blokaceZdroj)}</span></div>
              <div class="dr"><i class="b blok" style="${styl(oPos, blok)}"></i></div></div>
          </div>
        </div>
      </div></figure>`;
  }
  const grafy = (o, C) =>
    graf("Dorost, junioři a dospělí (U17 a starší)", C.periodEnd.A, o) +
    graf("Starší žáci a mladší (U15 a mladší)", C.periodEnd.B, o);

  window.renderMoznost = function (id, root) {
    const o = OBSAH[id], C = CONFIG;
    document.title = o.nazev + " | Český florbal";
    const f = C.fees[id] || null;
    let h = `
<header class="top"><div class="wrap"><a class="brand" href="../../index.html">Český florbal</a>
  <span class="crumb"><a href="../">Možnosti změny klubu</a> / ${esc(o.nazev)}</span></div></header>
<main class="wrap">
  <h1>${esc(o.nazev)}</h1>
  <p class="perex">${esc(o.perex)}</p>
  <div class="box">${o.proKoho.map(t => `<p>${esc(t)}</p>`).join("")}</div>

  <section aria-labelledby="h-osa"><h2 id="h-osa">Jak to vypadá</h2>
    <p>Přestupní období se liší podle kategorie, proto jsou dva grafy. Najdi ten svůj.</p>
    ${grafy(o, C)}
    <p class="osa-pozn">${esc(o.osa.pozn)}</p>
  </section>

  <section aria-labelledby="h-kroky"><h2 id="h-kroky">Jak na to</h2>
    <ol class="kroky">${o.kroky.map(([t, d, z, s]) => `<li><div><h3>${esc(t)}</h3><p>${esc(d)}</p>${zdroj(z, s)}</div></li>`).join("")}</ol>
  </section>

  <section aria-labelledby="h-cena"><h2 id="h-cena">Kolik to stojí a do kdy</h2>
    <div class="dvojice">
      <div class="cislo"><span class="velke">${f.lo}&nbsp;Kč</span>U17 dorostenci a mladší${zdroj("PŘ čl. 2.3", "rad")}</div>
      <div class="cislo"><span class="velke">${f.hi}&nbsp;Kč</span>ostatní kategorie${zdroj("PŘ čl. 2.3", "rad")}</div>
    </div>
    <p style="margin-top:16px">Přestupní období trvá od 1. července do <strong>${datum(C.periodEnd.B)}</strong> pro starší žáky a mladší kategorie a do <strong>${datum(C.periodEnd.A)}</strong> pro ostatní. Žádost můžeš podat už od 1. května.${zdroj("PŘ čl. 1.4 a)", "rad")}</p>
    <p>${esc(o.odstupne[0])}${zdroj(o.odstupne[1], o.odstupne[2])}</p>
  </section>

  <section aria-labelledby="h-podm"><h2 id="h-podm">Co musí platit</h2>${seznam(o.podminky)}</section>

  <section aria-labelledby="h-nes"><h2 id="h-nes">${esc(o.nesouhlas.nadpis)}</h2>
    <p>${esc(o.nesouhlas.text)}</p>${seznam(o.nesouhlas.body)}
    <p style="margin-top:12px">${esc(o.nesouhlas.dalsi[0])}${zdroj(o.nesouhlas.dalsi[1], o.nesouhlas.dalsi[2])}</p>
    <p><a href="${esc(C.disputeUrl)}">${esc(o.nesouhlas.odkaz)}</a></p>
  </section>

  <section aria-labelledby="h-poz"><h2 id="h-poz">Na co si dát pozor</h2>${seznam(o.pozor, "pozor")}</section>

  <section aria-labelledby="h-dal"><h2 id="h-dal">Co dál</h2>
    <div class="tlacitka">
      <a class="tl hlavni" href="../../index.html">Hodí se to pro mě?</a>
      <a class="tl vedlejsi" href="${esc(C.fisLoginUrl)}">Podat žádost ve FISu</a>
    </div>
  </section>
</main>
<footer><div class="wrap">
  <p>Zdroj: ${esc(o.zdrojRad)}. Stránka je orientační, závazný je Přestupní řád Českého florbalu. Konkrétní případ ti poradí matrika: <a href="mailto:${esc(C.matrikaEmail)}">${esc(C.matrikaEmail)}</a>.</p>
  <p>Data a pravidla aktualizována ${esc(C.dataUpdated)}. <a href="https://www.ceskyflorbal.cz">ceskyflorbal.cz</a></p>
</div></footer>`;
    root.innerHTML = h;
  };
})();
