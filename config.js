/* ===== Konfigurace: vše, co se mění se sezónou ===== */
const CONFIG = {
  dataUpdated: "2026-11-04 20:39", // datum a čas (pražský) poslední úpravy dat a pravidel, zobrazuje se na stránce Podklady
  dateMin: "2020-01-01", dateMax: "2035-12-31", // rozsah data, které lze v průvodci zadat
  categories: [
    // minAge/maxAge = věk dovršený v kalendářním roce, kdy sezóna začíná; z toho se počítají ročníky narození
    {id:"dospeli", label:"Muži / ženy", group:"A", high:true, minAge:22},
    {id:"dospeli21", label:"Muži / ženy 19–21 let", note:"První tři sezóny v dospělých.", group:"A", high:true, minAge:19, maxAge:21},
    {id:"junior", label:"U19 junioři / juniorky", group:"A", high:true, minAge:17, maxAge:18},
    {id:"dorost", label:"U17 dorostenci / dorostenky", group:"A", high:false, minAge:15, maxAge:16},
    {id:"starsi", label:"U15 starší žáci / žákyně", group:"B", high:false, minAge:13, maxAge:14},
    {id:"mladsi", label:"U13 mladší žáci / žákyně", group:"B", high:false, minAge:11, maxAge:12},
    {id:"starsiElevove", label:"U11 starší elévové / elévky", group:"B", high:false, minAge:9, maxAge:10},
    {id:"mladsiElevove", label:"U9 mladší elévové / elévky", group:"B", high:false, minAge:7, maxAge:8},
    {id:"pripravka", label:"U7 přípravka", group:"B", high:false, minAge:5, maxAge:6}
  ],
  // konec přestupního období: [měsíc, den] v následujícím kalendářním roce sezóny
  periodEnd: {A:[1,31], B:[3,31]},
  fees: {
    zop:{hi:0,lo:0}, prestup:{hi:500,lo:250}, host:{hi:300,lo:150},
    stst:{hi:300,lo:300}, sth:{hi:250,lo:250}, endHost:{hi:200,lo:200}, endStst:{hi:200,lo:200}
  },
  // Úrovně soutěží pro střídavý start (Soutěžní řád, čl. 3.1). Muži a ženy se porovnávají zvlášť; 1 = nejvyšší.
  ladders: {
    m: ["Superliga","1. liga mužů","Národní liga","Divize","Regionální liga mužů"],
    z: ["Extraliga žen","1. liga žen","2. liga žen","3. liga žen"]
  },
  // nejnižší úroveň, kde smí hrát A-družstvo mateřského klubu (nejvyšší celostátní soutěže)
  ststHomeMax: {m:3, z:2},
  // Střídavé hostování: žebříčky vlastních soutěží kategorií (1 = nejvyšší).
  // nat = kolik nejvyšších úrovní se pro střídavé hostování počítá jako celostátní
  // (1. liga dorostenek je regionální, ale pro střídavé hostování se počítá jako celostátní).
  sthLadders: {
    junior: {m:{names:["1. liga juniorů","2. liga juniorů","3. liga juniorů","4. liga juniorů"], nat:1},
             z:{names:["1. liga juniorek","2. liga juniorek"], nat:1}},
    dorost: {m:{names:["1. liga dorostenců","2. liga dorostenců","3. liga dorostenců"], nat:1},
             z:{names:["1. liga dorostenek","2. liga dorostenek"], nat:1}},
    starsi: {m:{names:[], nat:0}, z:{names:[], nat:0}}
  },
  // první liga dorostu ve 4. pádě (do vět typu „klub hraje …“)
  topDorostAcc: {m:"1. ligu dorostenců", z:"1. ligu dorostenek"},
  // celostátní soutěže dospělých pro střídavé hostování (počet nejvyšších úrovní ze žebříčku výše)
  adultNational: {m:4, z:2},
  disputeUrl: "https://www.ceskyflorbal.cz/neshoda-u-zadosti-o-prestup",
  // hledání klubu: pro děti Míčkoni, od dorostenců (od 15 let) web Českého florbalu
  findClub: {
    kids:  {url:"https://mickoni.cz/", label:"mickoni.cz"},
    older: {url:"https://www.ceskyflorbal.cz/hraj", label:"ceskyflorbal.cz/hraj", fromAge:15}
  },
  // Evidenční dodatek: smlouvu lze uzavřít jen s hráčem starším 16 let (PŘ čl. 6.5). Od jaké kategorie (minimální věk v kategorii) se na něj ptáme: U17 dorost a starší.
  dodatekFromCategoryAge: 15,
  matrikaEmail: "matrika@ceskyflorbal.cz", // zrušení a obnova oddílové příslušnosti se řeší papírovou žádostí přes matriku
  membershipFee: 200, // členský příspěvek ČF za sezónu (Kč)
  fisLoginUrl: "https://login.ceskyflorbal.cz/osoba/",
  fisApplicationUrl: "https://fis.ceskyflorbal.cz/index.php?pageid=2599&onlycontent=1" // přihláška; po zadání RČ předvyplní členské číslo
};
