/* Obsah veřejných stránek. Čísla a termíny se berou z CONFIG (../config.js), tady jsou jen texty.
   zdroj: "rad" = Z řádu (článek), "up" = Upřesnění ČF, "pred" = Předpoklad (stejné štítky jako na stránce Podklady). */
const MESICE = {1:"ledna",3:"března"};
const kc = n => n + " Kč";
const OBSAH = {
  prestup: {
    nazev: "Přestup",
    perex: "Přestup je trvalá změna klubu. Od data přestupu hraješ jen za nový klub.",
    zdrojRad: "Přestupní řád ČF, Edice 2026, čl. 1, 2 a 8",
    proKoho: [
      "Chceš přejít do jiného klubu natrvalo a do starého se už nevracet.",
      "Pokud chceš hrát jen na čas a pak se vrátit, hledej v nabídce hostování."
    ],
    osa: {
      stary: "Starý klub",
      novy: "Nový klub",
      znacka: "datum OD = přestup (příklad)",
      zadost: "Žádost jde podat od 1. května",
      obdobi: "Přestupní období (datum OD musí být v něm)",
      blokace: "3 měsíce nejde podat další přestup ani hostování",
      blokaceZdroj: "Počítá se od schválení přestupu, PŘ čl. 1.4 c).",
      pozn: "Datum OD si volíš v žádosti. Musí být v přestupním období, ve kterém žádost podáváš. Žádost lze podat už od 1. května, ale datum OD je nejdřív 1. července."
    },
    kroky: [
      ["Domluv se.", "Požádej starý klub o vyjádření k přestupu, nejlépe e-mailem, aby to šlo doložit. Starý klub se musí vyjádřit do 14 dnů.", "PŘ čl. 2.2", "rad"],
      ["Podej žádost ve FISu.", "Vyplníš formulář Přestup: své údaje, datum OD a starý a nový klub.", "PŘ čl. 1.5, 2.2", "rad"],
      ["Zaplať poplatek.", "Bez zaplaceného poplatku matrika přestup neschválí.", "PŘ čl. 8.2", "rad"],
      ["Počkej na schválení.", "Rozhoduje matrika ČF. Od data OD hraješ za nový klub.", "PŘ čl. 1.3, 2.1", "rad"]
    ],
    podminky: [
      ["Přestup podáš v přestupním období. Od data OD hraješ za nový klub.", "PŘ čl. 1.4, 1.6", "rad"],
      ["Od posledního schváleného přestupu uplynuly aspoň 3 měsíce.", "PŘ čl. 1.4 c)", "rad"],
      ["Nehostuješ jinde. Pokud hostuješ, můžeš přestoupit jen do klubu, kde hostuješ. Do jiného klubu nejdřív hostování ukonči.", "PŘ čl. 8.1 c)", "rad"],
      ["Nemáš s klubem smlouvu, ve které ses přestupu vzdal. S takovou smlouvou je potřeba souhlas starého klubu.", "PŘ čl. 6.1–6.2, 8.1 e)", "rad"],
      ["Pokud střídavě startuješ, informuj o přestupu klub, kde střídavě startuješ. Střídavý start k datu OD zanikne bez poplatku.", "PŘ čl. 2.2, 5.7 b)", "rad"]
    ],
    nesouhlas: {
      nadpis: "Co když starý klub nesouhlasí?",
      text: "Matrika přestup schválí i bez souhlasu starého klubu, a to bez odstupného, když:",
      body: [
        ["jsi členem ČF nejvýše 12 měsíců, nebo", "PŘ čl. 8.3 c)", "rad"],
        ["ti ještě nebylo 12 let (potřebuje to souhlas zákonného zástupce).", "PŘ čl. 8.3 d)", "rad"]
      ],
      dalsi: [
        "Když se starý klub ve lhůtě 14 dnů nevyjádří, matrika může přestup posoudit, jako by klub souhlasil.",
        "PŘ čl. 2.2", "rad"
      ],
      odkaz: "Neshoda u žádosti o přestup"
    },
    odstupne: ["Odstupné je peníze, které nový klub platí starému. Řeší se dohodou mezi kluby, případně rozhoduje Arbitrážní komise. Podle ČF ho v praxi může zaplatit i hráč, záleží na dohodě.", "PŘ čl. 14.1 + ČF", "up"],
    pozor: [
      ["Podaný přestup nejde vzít zpět.", "PŘ čl. 2.4", "rad"],
      ["Po schválení přestupu 3 měsíce nepodáš další přestup ani hostování.", "PŘ čl. 1.4 c)", "rad"],
      ["Žádosti jde podávat už od 1. května, datum OD ale musí být v přestupním období.", "PŘ čl. 1.4 a), 1.6", "rad"]
    ]
  }
};
