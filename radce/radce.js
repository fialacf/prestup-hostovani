/* Vykreslení stránky možnosti z OBSAH (obsah.js) a CONFIG (../config.js). Bez závislostí. */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const popisek = {rad:"Z řádu", up:"Upřesnění ČF", pred:"Předpoklad"};
  const zdroj = (z, t) => z ? `<span class="zdroj"><span class="tag ${t === "rad" ? "" : "up"}">${popisek[t]}</span>${esc(z)}</span>` : "";
  const seznam = (pole, cls) => `<ul class="pole ${cls || ""}">` + pole.map(([t, z, s]) => `<li>${esc(t)}${zdroj(z, s)}</li>`).join("") + `</ul>`;
  const datum = ([m, d]) => `${d}. ${m === 1 ? "ledna" : m === 3 ? "března" : m + "."}`;

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
    <div class="osa" role="img" aria-label="${esc(o.osa.stary + " do data OD, " + o.osa.novy + " od data OD")}">
      <div class="znacka"></div>
      <div class="rad stary-r"><div class="pruh stary">${esc(o.osa.stary)}</div></div>
      <div class="rad"><div class="pruh novy">${esc(o.osa.novy)}</div></div>
      <div class="popis"><div>${esc(o.osa.popis[0])}</div><div><strong>${esc(o.osa.znacka)}.</strong> ${esc(o.osa.popis[1])}</div></div>
    </div>
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
