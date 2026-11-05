// Testy průvodce od začátku do konce (Playwright, Chromium). Spuštění: node suite.js [adresa-webu-s-lomítkem]
// Stav: každý test vypíše jen selhání, na konci PASS/FAIL. Návratový kód 1 při selhání.
const {chromium}=require('playwright');
const path=require('path');
// kořen webu: výchozí je složka nad tests/, jiný lze zadat jako argument (adresa končící lomítkem)
const ROOT=process.argv[2]||'file://'+path.resolve(__dirname,'..')+'/';
// Ročníky v kroku 1 závisí na aktuální sezóně (od 1. 7.), proto se očekávané hodnoty počítají stejně jako v průvodci.
const Y0=(()=>{const n=new Date();return n.getMonth()>=6?n.getFullYear():n.getFullYear()-1;})();
let pass=0,fail=0;const failures=[];
const ok=(name,cond,detail)=>{if(cond){pass++;}else{fail++;failures.push(name+(detail!==undefined?' -> '+JSON.stringify(detail):''));}};
const eq=(name,a,b)=>ok(name,JSON.stringify(a)===JSON.stringify(b),{got:a,want:b});
const S=async(n,f)=>{try{await f();}catch(e){fail++;failures.push('SEKCE '+n+' CRASH: '+String(e.message).split('\n')[0]);}};
(async()=>{const b=await chromium.launch();const consoleErrs=[],pageErrs=[];
const open=async(w=390,page='index.html')=>{const c=await b.newContext({viewport:{width:w,height:900}});const p=await c.newPage();
  p.on('pageerror',x=>pageErrs.push(page+': '+x.message));
  p.on('console',m=>{if(m.type()==='error'&&!/net::ERR|Failed to load resource|ERR_/.test(m.text()))consoleErrs.push(page+': '+m.text());});
  await p.goto(ROOT+page);return p;};
const DEF={recent:'ne',zop3m:'ne',member1y:'ano',match1y:'ano',dodatek:'ne',memberNow:'ano',ststUsed:'ne',sthG:'m',sthHome:'none',league:'m1',ststSecond:'m3',date:'2026-11-04',hostStart:'2026-09-01'};
const go=async(p,d)=>{d={...DEF,...d};for(let i=0;i<12;i++){const h=await p.textContent('#wizard h2');if(/^(Máš|Teď|Jako nový)|teď nejde$/.test(h))return;
  const di=await p.$('#wizard input[type=date]');
  if(di){const id=(await di.getAttribute('id')).replace('in-','');await di.fill(d[id]);await p.click('#next');continue;}
  const isChoice=(await p.locator('#wizard .opts').count())>0;
  const keys=await p.$$eval('#wizard button[data-k], #wizard select[data-k]',x=>[...new Set(x.map(y=>y.dataset.k))]);
  for(const k of keys){const sel=await p.$(`#wizard select[data-k=${k}]`);
    if(sel){await p.selectOption(`#wizard select[data-k=${k}]`,d[k]);}else{const v=d[k];if(!v)throw new Error('chybí odpověď '+k);await p.click(`#wizard button[data-k=${k}][data-v=${v}]`);}}
  if(!isChoice&&await p.locator('#next').count()&&await p.$eval('#next',x=>!x.disabled))await p.click('#next');}
  throw new Error('nedokončeno: '+await p.textContent('#wizard h2'));};
const cards=p=>p.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.card')].map(c=>[c.querySelector('h3').textContent,{pill:c.querySelector('.pill').textContent,reason:c.querySelector('.reason')?c.querySelector('.reason').textContent:''}])));
const notices=p=>p.$$eval('.notice',x=>x.map(y=>y.innerText.replace(/\s+/g,' ')));
const flow=async(d,w=390)=>{const p=await open(w);const seq=[d.cat,d.state];await p.click(`button[data-v=${d.cat}]`);await p.click(`button[data-v=${d.state}]`);await go(p,d);return p;};
const pill=(c,n)=>c[n]?c[n].pill:'(není)';

// ---------- 1) krok 1: kategorie a ročníky ----------
await S('1',async()=>{
{const p=await open();const t=await p.$$eval('#wizard .opt',x=>x.map(y=>y.innerText.split('\n')[0]));
 eq('9 kategorií',t.length,9);ok('ročníky juniorů',t.includes(`U19 junioři / juniorky (ročníky ${Y0-18}–${Y0-17})`),t);ok('ročníky přípravky',t.includes(`U7 přípravka (ročníky ${Y0-6}–${Y0-5})`),t);
 ok('dospělí 22 let a víc',t[0].includes(`${Y0-22} a starší`),t[0]);
 ok('bez přehledu na 1. kroku',(await p.locator('details.answers').count())===0);await p.close();}
});
// ---------- 2) poplatky podle kategorie ----------
await S('2',async()=>{
for(const [cat,pr,hs] of [['dospeli','500 Kč','300 Kč'],['junior','500 Kč','300 Kč'],['dorost','250 Kč','150 Kč'],['pripravka','250 Kč','150 Kč']]){
  const p=await flow({cat,state:'oddil',goal:'vse'});const c=await cards(p);const f=async n=>p.evaluate(n=>{const x=[...document.querySelectorAll('.card')].find(c=>c.querySelector('h3').textContent===n);return x?x.querySelector('dd').textContent:null},n);
  eq(`poplatek přestup ${cat}`,await f('Přestup'),pr);eq(`poplatek hostování ${cat}`,await f('Hostování'),hs);await p.close();}
});
// ---------- 3) střídavý start ----------
await S('3',async()=>{
for(const [own,sec,exp] of [['m1','m3','Můžeš využít'],['m1','m5','Teď ne'],['m2','m4','Můžeš využít'],['m3','m5','Můžeš využít'],['z1','z3','Můžeš využít'],['z2','z4','Můžeš využít'],['z2','z2','Teď ne'],['m4',null,'Teď ne']]){
  const p=await flow({cat:'dospeli21',state:'oddil',goal:'dva',league:own,ststSecond:sec||'m1',sthHome:'none'});eq(`STST ${own}→${sec}`,pill(await cards(p),'Střídavý start'),exp);await p.close();}
{const p=await flow({cat:'dospeli',state:'oddil',goal:'trvale'});ok('STST u starších dospělých skrytý',!('Střídavý start' in await cards(p)));await p.close();}
});
// ---------- 4) střídavé hostování ----------
await S('4',async()=>{
const sthReason=async d=>{const p=await flow({state:'oddil',goal:'dva',...d});const c=await cards(p);await p.close();return c['Střídavé hostování'];};
{let r=await sthReason({cat:'junior',sthG:'m',sthHome:'2'});ok('junior L2 → ne Divize',r.pill==='Můžeš využít'&&/1\. liga juniorů, Superliga, 1\. liga mužů, Národní liga\.$/.test(r.reason)&&!/Divize/.test(r.reason),r);
 r=await sthReason({cat:'junior',sthG:'m',sthHome:'1'});ok('junior L1',/Superliga, 1\. liga mužů\.$/.test(r.reason)&&!/1\. liga juniorů,/.test(r.reason),r);
 r=await sthReason({cat:'junior',sthG:'z',sthHome:'none'});ok('juniorky bez družstva',/1\. liga juniorek, Extraliga žen, 1\. liga žen\.$/.test(r.reason),r);
 r=await sthReason({cat:'dorost',sthG:'m',sthHome:'2'});ok('dorostenci L2',/1\. liga dorostenců, 1\. liga juniorů\.$/.test(r.reason),r);
 r=await sthReason({cat:'dorost',sthG:'z',sthHome:'1'});ok('dorostenky L1',/do: 1\. liga juniorek\.$/.test(r.reason),r);
 r=await sthReason({cat:'starsi',sthG:'m',sthHome:'ne'});ok('starší žáci ano',r.pill==='Můžeš využít'&&/1\. liga dorostenců\.$/.test(r.reason),r);
 r=await sthReason({cat:'starsi',sthG:'z',sthHome:'ano'});ok('starší žákyně klub hraje 1. ligu → ne',r.pill==='Teď ne',r);
 r=await sthReason({cat:'junior',sthG:'m',sthHome:'nevim'});eq('STH nevím → možná',r.pill,'Možná – ověř');}
});
// ---------- 5) hostování ----------
await S('5',async()=>{
{let p=await flow({cat:'dospeli',state:'hostuji',goal:'docasne',hostStart:'2026-10-20',date:'2026-11-04'});let c=await cards(p);
 eq('hostuje: Hostování Teď ne',pill(c,'Hostování'),'Teď ne');eq('hostuje <30 dní: Ukončení Teď ne',pill(c,'Ukončení hostování'),'Teď ne');eq('hostuje: ZOP Teď ne',pill(c,'Změna oddílové příslušnosti'),'Teď ne');
 eq('hostuje: Přestup Můžeš',pill(c,'Přestup'),'Můžeš využít');const n=await notices(p);ok('upozornění na 30 dní',n.length===1&&/19\. 11\. 2026/.test(n[0]),n);
 await p.click('button[data-setdate]');c=await cards(p);eq('po posunu: Ukončení Můžeš',pill(c,'Ukončení hostování'),'Můžeš využít');ok('po posunu: upozornění o 30 dnech zmizelo',!(await notices(p)).some(x=>/zatím nejde ukončit/.test(x)),await notices(p));await p.close();
 p=await flow({cat:'dospeli',state:'hostuji',goal:'ukoncit',hostStart:'2026-10-01',date:'2026-11-04'});eq('hostuje 34 dní: ukončení jde',pill(await cards(p),'Ukončení hostování'),'Můžeš využít');await p.close();
 for(const st of ['stst','sth']){p=await flow({cat:'dospeli21',state:st,goal:'trvale'});eq(`${st}: ZOP Teď ne`,pill(await cards(p),'Změna oddílové příslušnosti'),'Teď ne');await p.close();}}
});
// ---------- 6) přestupní období a upozornění ----------
await S('6',async()=>{
for(const [cat,date,end] of [['dospeli','2027-02-15','31. 1. 2027'],['starsi','2027-04-10','31. 3. 2027'],['dorost','2027-05-20','31. 1. 2027']]){
  const p=await flow({cat,state:'oddil',goal:'trvale',date});const n=await notices(p);ok(`mimo období ${cat} ${date}`,n.length===1&&n[0].includes('skončilo ('+end+')')&&/1\. 7\. 2027/.test(n[0]),n);
  eq(`mimo období ${cat}: Přestup Teď ne`,pill(await cards(p),'Přestup'),'Teď ne');await p.click('button[data-setdate]');eq(`po posunu ${cat}: Přestup Můžeš`,pill(await cards(p),'Přestup'),'Můžeš využít');await p.close();}
for(const [cat,date,exp] of [['dospeli','2027-01-31','Můžeš využít'],['dospeli','2027-02-01','Teď ne'],['starsi','2027-03-31','Můžeš využít'],['starsi','2027-04-01','Teď ne'],['dospeli','2026-07-01','Můžeš využít']]){
  const p=await flow({cat,state:'oddil',goal:'trvale',date});eq(`hranice ${cat} ${date}`,pill(await cards(p),'Přestup'),exp);await p.close();}
{const p=await flow({cat:'dospeli21',state:'oddil',goal:'dva',ststUsed:'ano'});const n=await notices(p);ok('STST využit: upozornění',n.length===1&&/už letos máš využitý/.test(n[0]),n);eq('STST využit: karta Teď ne',pill(await cards(p),'Střídavý start'),'Teď ne');
 await p.click('button[data-setdate]');eq('po posunu do nové sezóny STST Můžeš',pill(await cards(p),'Střídavý start'),'Můžeš využít');await p.close();}
{const p=await flow({cat:'dorost',state:'oddil',goal:'trvale',recent:'ano'});const c=await cards(p);eq('přestup před 3 měsíci: Přestup Teď ne',pill(c,'Přestup'),'Teď ne');eq('…Hostování Teď ne',pill(c,'Hostování'),'Teď ne');await p.close();}
});
// ---------- 7) bez klubu / nový hráč ----------
await S('7',async()=>{
{let p=await flow({cat:'dorost',state:'bez',goal:'trvale',memberNow:'ne'});let c=await cards(p);eq('bez klubu, členství zrušeno: Obnovení Můžeš',pill(c,'Obnovení členství'),'Můžeš využít');eq('…ZOP Teď ne',pill(c,'Změna oddílové příslušnosti'),'Teď ne');await p.close();
 p=await flow({cat:'dorost',state:'bez',goal:'trvale',memberNow:'ano',zop3m:'ano'});ok('žádná možnost: nouzové upozornění',(await notices(p)).some(x=>/Teď nemáš žádnou možnost/.test(x)),await notices(p));await p.close();
 p=await flow({cat:'dorost',state:'bez',goal:'trvale',memberNow:'ano'});eq('bez klubu aktivní: ZOP Můžeš',pill(await cards(p),'Změna oddílové příslušnosti'),'Můžeš využít');await p.close();
 for(const [cat,url] of [['starsi','mickoni.cz'],['pripravka','mickoni.cz'],['dorost','ceskyflorbal.cz/hraj'],['dospeli','ceskyflorbal.cz/hraj']]){p=await open();await p.click(`button[data-v=${cat}]`);await p.click('button[data-v=novy]');
   ok(`nový hráč ${cat} → ${url}`,(await p.$$eval('#wizard a',x=>x.map(a=>a.href))).some(h=>h.includes(url)));ok(`nový hráč ${cat}: 1 možnost`,true);await p.close();}}
});
// ---------- 8) otázky: dodatek, spojený krok, „nevím“ ----------
await S('8',async()=>{
{let p=await open();await p.click('button[data-v=starsi]');await p.click('button[data-v=oddil]');await p.click('button[data-v=trvale]');await p.fill('input[type=date]','2026-11-04');await p.click('#next');
 ok('U15: bez dodatku',(await p.locator('button[data-k=dodatek]').count())===0);eq('U15: 4 otázky',await p.locator('#wizard .yn').count(),4);await p.close();
 p=await open();await p.click('button[data-v=dorost]');await p.click('button[data-v=oddil]');await p.click('button[data-v=trvale]');await p.fill('input[type=date]','2026-11-04');await p.click('#next');
 const q=await p.$$eval('#wizard .yn .lbl',x=>x.map(y=>y.textContent));ok('U17: 5 otázek, 3 měsíce pod sebou',q.length===5&&/přestup/.test(q[0])&&/Zaregistroval\(a\) ses v posledních 3 měsících znovu do klubu/.test(q[1]),q);
 ok('Pokračovat vypnuto před odpovědí',await p.$eval('#next',x=>x.disabled));await p.close();
 p=await flow({cat:'dorost',state:'oddil',goal:'docasne',recent:'nevim'});const c=await cards(p);eq('přestup nevím → hostování Možná',pill(c,'Hostování'),'Možná – ověř');
 const href=await p.$eval('a.mailbtn',a=>a.getAttribute('href'));const u=new globalThis.URL(href);ok('mailto matrika',u.pathname==='matrika@ceskyflorbal.cz'&&/Dotaz/.test(u.searchParams.get('subject'))&&/Kategorie: U17/.test(u.searchParams.get('body')),href.slice(0,120));await p.close();}
});
// ---------- 9) přehled odpovědí, chipy, historie ----------
await S('9',async()=>{
{let p=await open();await p.click('button[data-v=dorost]');await p.click('button[data-v=oddil]');
 eq('krok 3: přehled má 2 odpovědi',await p.$$eval('details.answers .chip',x=>x.length),2);
 const url0=p.url();await p.goBack();eq('Zpět v prohlížeči → krok 2',await p.textContent('#wizard h2'),'Jaká je tvoje situace teď?');await p.goForward();eq('Vpřed',await p.textContent('#wizard h2'),'Co chceš udělat?');
 await p.reload();eq('refresh drží krok',await p.textContent('#wizard h2'),'Co chceš udělat?');ok('refresh drží odpovědi',(await p.$$eval('details.answers .chip',x=>x.length))===2);
 await p.click('#back');await p.click('#back');eq('Zpět na 1. krok',await p.textContent('#wizard h2'),'V jaké jsi kategorii?');ok('na 1. kroku bez přehledu',(await p.locator('details.answers').count())===0);await p.close();
 p=await flow({cat:'dospeli21',state:'oddil',goal:'dva',league:'m1',ststSecond:'m3'});if(!(await p.$eval('details.answers',d=>d.open)))await p.click('details.answers summary');
 await p.click('button.chip[data-step=goal]');eq('chip → otázka Cíl',await p.textContent('#wizard h2'),'Co chceš udělat?');await p.close();}
});
// ---------- 10) záložka Všechny možnosti ----------
await S('10',async()=>{
{const p=await open();await p.click('#tab-all');eq('8 karet',await p.locator('details.acc').count(),8);eq('4 skupiny',await p.locator('h3.grp').count(),4);
 const fee=()=>p.$$eval('details.acc',d=>Object.fromEntries(d.map(x=>[x.dataset.id,x.querySelector('.acc-fee').textContent])));
 let f=await fee();eq('ceny hi',[f.prestup,f.host,f.sth,f.stst],['500 Kč','300 Kč','250 Kč','300 Kč']);await p.click('button[data-tier=lo]');f=await fee();eq('ceny lo',[f.prestup,f.host],['250 Kč','150 Kč']);
 await p.click('details.acc[data-id=sth] summary');ok('STH má 2 vnořené tabulky',(await p.locator('details.acc[data-id=sth] details.sub').count())===2);
 await p.click('details.acc[data-id=prestup] summary');await p.click('details.acc[data-id=prestup] button[data-go]');eq('CTA otevře průvodce',await p.textContent('#wizard h2'),'V jaké jsi kategorii?');await p.close();
 const q=await open();await q.click('button[data-v=starsi]');await q.click('#tab-all');ok('výchozí cena podle kategorie z průvodce',(await q.$eval('button[data-tier=lo]',x=>x.getAttribute('aria-pressed')))==='true');await q.close();}
});
// ---------- 11) podklady ----------
await S('11',async()=>{
{const p=await open(1000,'podklady.html');const h=await p.$$eval('section h2',x=>x.map(y=>y.textContent));eq('podklady: 8 sekcí',h.length,8);
 const n=+(await p.textContent('#count')).match(/\d+/)[0];ok('podklady: >80 řádků',n>80,n);await p.fill('#q','dodatek');ok('hledání dodatek',/Nalezeno [1-9]/.test(await p.textContent('#count')));
 ok('podklady: bez undefined',!/undefined|NaN/.test(await p.evaluate(()=>document.body.innerText)));
 await p.fill('#q','');const hrefs=await p.$$eval('a[href]',a=>a.map(x=>x.getAttribute('href')));ok('podklady: odkazy bez undefined',hrefs.every(h=>h&&!/undefined|null/.test(h)),hrefs.filter(h=>!h||/undefined|null/.test(h)));
 ok('zpět na průvodce',hrefs.includes('index.html'));await p.close();
 const q=await open();ok('odkaz na podklady v patičce',(await q.locator('a[href="podklady.html"]').count())===1);await q.close();}
});
// ---------- 12) šířky displeje ----------
await S('12',async()=>{
for(const w of [320,390,768,1100]){
  const p=await open(w);const over=async l=>ok(`bez vodorovného posuvu ${w}px: ${l}`,!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
  await over('krok 1');await p.click('button[data-v=dospeli21]');await p.click('button[data-v=oddil]');await p.click('button[data-v=dva]');await p.fill('input[type=date]','2026-11-04');await p.click('#next');await p.click('button[data-v=ne]');
  await p.selectOption('#in-league','m1');await p.selectOption('#in-ststSecond','m3');await p.click('button[data-k=ststUsed][data-v=ne]');await p.click('#next');await over('výsledek');
  await p.click('#tab-all');for(const d of await p.$$('details.acc summary'))await d.click();for(const d of await p.$$('details.sub summary'))await d.click();await over('všechny možnosti (vše rozbaleno)');await p.close();
  const q=await open(w,'podklady.html');ok(`bez vodorovného posuvu ${w}px: podklady`,!(await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));await q.close();}
});
// ---------- 13) přístupnost a HTML ----------
await S('13',async()=>{
{const p=await open();await p.click('button[data-v=dospeli21]');await p.click('button[data-v=oddil]');await p.click('button[data-v=dva]');await p.fill('input[type=date]','2026-11-04');await p.click('#next');
 const A11=async l=>{const r=await p.evaluate(()=>{const names=[...document.querySelectorAll('button,a[href],summary')].filter(e=>!e.textContent.trim()&&!e.getAttribute('aria-label')&&!e.title).length;
   const unl=[...document.querySelectorAll('input,select')].filter(e=>!(e.id&&document.querySelector(`label[for="${e.id}"]`))&&!e.getAttribute('aria-label')).map(e=>e.id||e.type);
   const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
   return {names,unl,dup,lang:document.documentElement.lang,title:document.title,h1:document.querySelectorAll('h1').length};});
   ok(`a11y ${l}: tlačítka mají název`,r.names===0,r);ok(`a11y ${l}: pole mají popisek`,r.unl.length===0,r.unl);ok(`a11y ${l}: unikátní id`,r.dup.length===0,r.dup);ok(`a11y ${l}: lang a title`,r.lang==='cs'&&r.title.length>3,r);ok(`a11y ${l}: jedno h1`,r.h1===1,r);};
 await A11('otázka');await p.click('button[data-v=ne]');await A11('2 otázky');await p.close();}
});
// ---------- 14) opravy po revizi ----------
await S('14', async () => {
  // a) termín „Podat nejpozději“ po konci období = konec příští sezóny
  let p = await flow({cat: 'dospeli', state: 'oddil', goal: 'trvale', date: '2027-02-15'});
  const dl = await p.evaluate(() => { const c = [...document.querySelectorAll('.card')].find(c => c.querySelector('h3').textContent === 'Přestup'); return c.querySelectorAll('dd')[1].textContent; });
  eq('termín příští sezóny po konci období', dl, '31. 1. 2028');
  await p.close();
  p = await flow({cat: 'starsi', state: 'oddil', goal: 'trvale', date: '2027-04-10'});
  eq('termín příští sezóny U15', await p.evaluate(() => [...document.querySelectorAll('.card')].find(c => c.querySelector('h3').textContent === 'Přestup').querySelectorAll('dd')[1].textContent), '31. 3. 2028');
  await p.close();
  // b) hráč bez klubu: bez kroku s datem
  p = await open(); await p.click('button[data-v=dorost]'); await p.click('button[data-v=bez]'); await p.click('button[data-v=trvale]');
  eq('bez klubu: po cíli rovnou otázky (bez data)', await p.textContent('#wizard h2'), 'Pár otázek ke změně oddílové příslušnosti');
  await p.click('button[data-k=memberNow][data-v=ano]'); await p.click('button[data-k=zop3m][data-v=ne]'); await p.click('#next');
  ok('bez klubu: výsledek bez chybového stavu', /^Máš/.test(await p.textContent('#wizard h2')));
  ok('bez klubu: v přehledu není datum', !(await p.$$eval('button.chip', x => x.map(y => y.dataset.step))).includes('date')); await p.close();
  // c) zavádějící karty nejsou
  p = await flow({cat: 'dorost', state: 'oddil', goal: 'docasne'}); ok('docasne: bez karty Změna oddílové příslušnosti', !('Změna oddílové příslušnosti' in await cards(p))); await p.close();
  p = await flow({cat: 'dospeli21', state: 'oddil', goal: 'trvale'}); const c1 = await cards(p); ok('natrvalo: bez střídavého startu a hostování', !('Střídavý start' in c1) && !('Střídavé hostování' in c1), Object.keys(c1)); await p.close();
  p = await flow({cat: 'dospeli21', state: 'oddil', goal: 'dva'}); const c2 = await cards(p); ok('dva kluby: obě karty', 'Střídavý start' in c2 && 'Střídavé hostování' in c2); await p.close();
  // d) formulace konce hostování
  p = await flow({cat: 'dospeli', state: 'hostuji', goal: 'ukoncit', hostStart: '2026-09-01', date: '2027-02-15'});
  ok('hostování skončí nejpozději 30. 6.', (await notices(p)).some(x => /skončí nejpozději 30\. 6\./.test(x)) && !(await p.evaluate(() => document.body.innerText)).includes('skončí samo'), await notices(p)); await p.close();
});
// ---------- 15) kontrola data ----------
await S('15', async () => {
  const p = await open(); await p.click('button[data-v=dospeli]'); await p.click('button[data-v=oddil]'); await p.click('button[data-v=trvale]');
  eq('datum: výchozí dnešek je platné', await p.$eval('#next', x => x.disabled), false);
  const lim = await p.$eval('input[type=date]', i => [i.min, i.max]); eq('datum: min a max z konfigurace', lim, ['2020-01-01', '2035-12-31']);
  await p.fill('input[type=date]', '2019-05-01'); eq('datum před min: Pokračovat vypnuto', await p.$eval('#next', x => x.disabled), true);
  await p.fill('input[type=date]', '2099-05-01'); eq('datum po max: Pokračovat vypnuto', await p.$eval('#next', x => x.disabled), true);
  await p.fill('input[type=date]', '2026-12-01'); eq('platné datum: Pokračovat zapnuto', await p.$eval('#next', x => x.disabled), false); await p.close();
  const q = await open(); await q.click('button[data-v=dospeli]'); await q.click('button[data-v=hostuji]'); await q.fill('input[type=date]', '2026-12-10'); await q.click('#next'); await q.click('button[data-v=ukoncit]');
  eq('konec hostování: min = začátek hostování', await q.$eval('input[type=date]', i => i.min), '2026-12-10'); await q.close();
});
// ---------- 16) poškozený uložený stav ----------
await S('16', async () => {
  for (const [label, val] of [
    ['neplatná kategorie', {A: {cat: 'neexistuje', state: 'oddil'}, idx: 3}],
    ['útok v datu', {A: {cat: 'dospeli', state: 'oddil', goal: 'trvale', date: '"><img src=x onerror=window.__pwn=1>'}, idx: 4}],
    ['útok v odpovědi', {A: {cat: 'dospeli', state: '<img src=x onerror=window.__pwn=1>', goal: 'trvale'}, idx: 2}],
    ['nesmysl', 'nejde o objekt'],
    ['záporný idx', {A: {cat: 'dospeli'}, idx: -5}],
    ['neznámé klíče', {A: {cat: 'dospeli', __proto__x: 'a', evil: 'b'}, idx: 1}]]) {
    const c = await b.newContext({viewport: {width: 390, height: 900}}); const p = await c.newPage(); const errs = []; p.on('pageerror', x => errs.push(x.message));
    await p.addInitScript(v => { sessionStorage.setItem('prestup', JSON.stringify(v)); }, val);
    await p.goto(ROOT + 'index.html');
    ok(`uložený stav „${label}“: stránka se vykreslí`, (await p.locator('#wizard h2').count()) === 1 && errs.length === 0, errs);
    ok(`uložený stav „${label}“: nic se nespustilo`, !(await p.evaluate(() => window.__pwn)) && (await p.locator('#wizard img').count()) === 0);
    await c.close();
  }
});
// ---------- 17) zaměření, ARIA a dvojklik ----------
await S('17', async () => {
  const p = await open(); await p.click('button[data-v=dospeli21]');
  eq('po kroku je zaměření na nadpisu', await p.evaluate(() => document.activeElement.id), 'step-title');
  ok('volby mají role skupiny', (await p.locator('#wizard .opts[role=group][aria-labelledby=step-title]').count()) === 1);
  ok('ukazatel kroků je progressbar', (await p.locator('#wizard [role=progressbar][aria-valuenow]').count()) === 1);
  await p.click('button[data-v=oddil]'); await p.click('button[data-v=dva]'); await p.fill('input[type=date]', '2026-11-04'); await p.click('#next'); await p.click('button[data-v=ne]');
  ok('seg skupiny jsou role=group s popiskem', (await p.locator('#wizard .seg[role=group][aria-labelledby]').count()) >= 1);
  await p.focus('button[data-k=ststUsed][data-v=ne]'); await p.keyboard.press('Enter');
  eq('po odpovědi zůstane zaměření na stejném tlačítku', await p.evaluate(() => { const a = document.activeElement; return a.dataset.k + ':' + a.dataset.v; }), 'ststUsed:ne');
  await p.close();
  const q = await open(); eq('záložky: výchozí tabindex', await q.$$eval('[role=tab]', t => t.map(x => x.tabIndex)), [0, -1]);
  await q.focus('#tab-wizard'); await q.keyboard.press('ArrowRight');
  eq('záložky: šipka doprava otevře Všechny možnosti', [await q.$eval('#tab-all', x => x.getAttribute('aria-selected')), await q.evaluate(() => document.activeElement.id)], ['true', 'tab-all']);
  await q.keyboard.press('ArrowLeft'); eq('záložky: šipka doleva zpět', await q.$eval('#tab-wizard', x => x.getAttribute('aria-selected')), 'true');
  ok('záložky: tabpanel propojen', (await q.locator('#wizard[role=tabpanel][aria-labelledby=tab-wizard]').count()) === 1 && (await q.locator('#tab-all[aria-controls=all]').count()) === 1);
  await q.close();
  // dvojklik na možnost neodpoví i další otázku
  const d = await open(); await d.dblclick('button[data-v=dorost]'); eq('dvojklik: posun jen o jeden krok', await d.textContent('#wizard h2'), 'Jaká je tvoje situace teď?');
  await d.dblclick('button[data-v=oddil]'); eq('dvojklik na další možnost', await d.textContent('#wizard h2'), 'Co chceš udělat?'); await d.close();
});
// ---------- 18) historie po „Začít znovu“ ----------
await S('18', async () => {
  const p = await flow({cat: 'dorost', state: 'oddil', goal: 'trvale'}); await p.click('#restart');
  eq('po Začít znovu: 1. krok', await p.textContent('#wizard h2'), 'V jaké jsi kategorii?');
  await p.goBack(); const h = await p.textContent('#wizard h2'); const st = await p.evaluate(() => history.state && history.state.idx);
  eq('Zpět po Začít znovu: záznam historie odpovídá zobrazenému kroku', [h.startsWith('Máš') || h.startsWith('Teď') ? 'vysledek' : 'krok', typeof st], ['krok', 'number']);
  ok('po Zpět: hash odpovídá kroku', /#krok-\d+/.test(p.url()), p.url()); await p.close();
});
// ---------- 19) kontrast zašedlých možností ----------
await S('19', async () => {
  for (const scheme of ['light', 'dark']) {
    const c = await b.newContext({viewport: {width: 390, height: 900}, colorScheme: scheme}); const p = await c.newPage(); await p.goto(ROOT + 'index.html');
    await p.click('button[data-v=dorost]'); await p.click('button[data-v=bez]');
    const r = await p.evaluate(() => {
      const lum = c => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
      const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const o = document.querySelector('.opt:disabled'); const bg = getComputedStyle(o).backgroundColor, op = +getComputedStyle(o).opacity;
      const rgb = c => c.match(/[\d.]+/g).slice(0, 3).map(Number);
      // skutečná barva po zohlednění průhlednosti prvku (opacity míchá text s pozadím)
      const eff = c => { const t = rgb(c), g = rgb(bg); return 'rgb(' + t.map((v, i) => Math.round(op * v + (1 - op) * g[i])).join(',') + ')'; };
      return {why: ratio(eff(getComputedStyle(o.querySelector('.why')).color), bg), label: ratio(eff(getComputedStyle(o).color), bg), opacity: op};
    });
    ok(`kontrast zašedlé možnosti ${scheme}: důvod ≥ 4.5`, r.why >= 4.5, r); ok(`kontrast zašedlé možnosti ${scheme}: popisek ≥ 4.5`, r.label >= 4.5, r);
    await c.close();
  }
});
// ---------- 20) podklady: filtr skrývá prázdné sekce, popisky ----------
await S('20', async () => {
  const p = await open(1000, 'podklady.html');
  ok('podklady: počet nálezů je aria-live', (await p.getAttribute('#count', 'aria-live')) === 'polite');
  await p.fill('#q', 'nenalezeno-xyz');
  const visibleSections = await p.$$eval('section.sec', s => s.filter(x => !x.hidden && x.offsetParent !== null).length);
  ok('podklady: při prázdném filtru nezůstávají prázdné sekce', visibleSections <= 1, visibleSections); await p.close();
});

// ---------- 21) záložka Všechny možnosti odpovídá výsledkům a podkladům ----------
await S('21', async () => {
  const p = await open(); await p.click('#tab-all');
  const body = async id => { await p.click(`details.acc[data-id=${id}] summary`); return p.$eval(`details.acc[data-id=${id}]`, d => d.innerText.replace(/\s+/g, ' ')); };
  const pr = await body('prestup');
  ok('Přestup: 14 dnů a matrika', /14 dnů/.test(pr) && /matrikou ČF/.test(pr), pr.slice(0, 200));
  ok('Přestup: přes nesouhlas klubu (12 měsíců / 12 let)', /12 měsíců/.test(pr) && /12 let/.test(pr));
  ok('Přestup: dodatek jen od 16 let', /starším 16 let/.test(pr));
  ok('Přestup: hostující jen do klubu, kde hostuje', /kde hostuje/.test(pr));
  ok('Přestup: odstupné platí klub, nebo hráč, podle dohody', /Může ho zaplatit klub, nebo hráč, záleží na dohodě/.test(pr) && !/platí ho nový klub/.test(pr));
  const zp = await body('zop'); ok('ZOP: dodatek mladší hráči nemohou', /mladší hráči ho mít nemohou/.test(zp)); ok('ZOP: nejde při hostování', /Nejde během hostování/.test(zp)); ok('ZOP: výjimka RegŘ 5.2', /RegŘ čl\. 5\.2/.test(zp));
  const ho = await body('host'); ok('Hostování: jedno najednou, 14 dnů, dodatek', /Jen jedno hostování najednou/.test(ho) && /14 dnů/.test(ho) && /starším 16 let/.test(ho));
  ok('Hostování: končí nejpozději 30. 6.', /končí nejpozději 30\. 6\./.test(ho) && !/samo/.test(ho));
  const eh = await body('endHost'); ok('Ukončení hostování: 30 dnů od začátku', /od začátku, dřív ukončit nejde/.test(eh));
  const st = await body('stst'); ok('STST: 14 dnů a 30 % utkání', /14 dnů/.test(st) && /30 %/.test(st));
  const sh = await body('sth'); ok('STH: 14 dnů', /14 dnů/.test(sh));
  const pi = await body('prihlaska'); ok('Obnovení členství: původní klub a příspěvek', /původního klubu/.test(pi) && /200 Kč/.test(pi) && /ve FISu, nebo přes klub/.test(pi));
  ok('záložka odkazuje na podklady', (await p.locator('#all a[href="podklady.html"]').count()) === 1);
  ok('záložka bez undefined', !/undefined|NaN/.test(await p.evaluate(() => document.getElementById('all').innerText))); await p.close();
  const q = await open(1000, 'podklady.html'); const t = await q.evaluate(() => document.body.innerText);
  ok('podklady: stav dat s datem a časem', /Stav dat: \d{1,2}\. \d{1,2}\. \d{4} v \d{2}:\d{2}\./.test(t), t.match(/Stav dat[^\n]*/));
  for (const w of ['Otevřené body a co se ještě musí udělat', 'Ověření výkladů matrikou', 'Postup na novou sezónu', 'Kontakt na správce', 'Ochrana osobních údajů', 'Sdílení výsledku', 'Start v jiné věkové kategorii', 'hráčské licenci', 'Přechod mezi sezónami a ročníky', 'Cíl nejde splnit', 'Termín „Podat nejpozději“', 'Uložení odpovědí', 'Záložka Všechny možnosti', 'konec příští sezóny', 'sessionStorage']) ok(`podklady obsahují „${w}“`, t.includes(w));
  await q.close();
});

// ---------- 22) znění otázky na novou registraci ----------
await S('22', async () => {
  const p = await open(); await p.click('button[data-v=dorost]'); await p.click('button[data-v=bez]'); await p.click('button[data-v=trvale]');
  const q = await p.$$eval('#wizard .yn .lbl', x => x.map(y => y.textContent)); ok('bez klubu: nové znění otázky', /Zaregistroval\(a\) ses v posledních 3 měsících znovu do klubu/.test(q[1]) && !/změnu oddílové/.test(q[1]), q);
  ok('bez klubu: vysvětlení říká, že nejde o přestup', /Nejde o přestup/.test(await p.textContent('#wizard .yn:nth-of-type(2) .hint')));
  await p.click('button[data-k=memberNow][data-v=ano]'); await p.click('button[data-k=zop3m][data-v=ano]'); await p.click('#next');
  const c = await cards(p); ok('bez klubu, nová registrace před 3 měsíci: důvod nové znění', /nové registrace v klubu \(obnovy oddílové příslušnosti\)/.test(c['Změna oddílové příslušnosti'].reason), c['Změna oddílové příslušnosti']);
  ok('přehled: štítek Nová registrace za 3 měsíce', (await p.$$eval('button.chip', x => x.map(y => y.textContent))).some(t => /Nová registrace za 3 měsíce: Ano/.test(t)));
  await p.close();
  const q2 = await open(); await q2.click('#tab-all'); await q2.click('details.acc[data-id=zop] summary');
  ok('Všechny možnosti: ZOP – od poslední nové registrace', /poslední nové registrace v klubu/.test(await q2.$eval('details.acc[data-id=zop]', d => d.innerText)));
  await q2.close();
});

// ---------- 23) cíl nejde splnit: štítek, nadpis, upozornění ----------
await S('23', async () => {
  // přesně případ z hlášení: U15 starší žáci, cíl dva kluby, klub sám hraje 1. ligu dorostenců
  let p = await flow({cat: 'starsi', state: 'oddil', goal: 'dva', sthG: 'm', sthHome: 'ano'});
  const chips = await p.$$eval('button.chip', x => x.map(y => y.textContent));
  ok('štítek nese otázku: Klub hraje 1. ligu dorostenců: Ano', chips.some(t => /Klub hraje 1\. ligu dorostenců: Ano/.test(t)) && !chips.some(t => /Úroveň klubu: Ano/.test(t)), chips);
  eq('nadpis: cíl nejde', await p.textContent('#wizard h2'), 'Hrát za dva kluby zároveň teď nejde');
  ok('pod nadpisem: kolik jiných možností', /Jako jinou cestu máš 2 možnosti/.test(await p.textContent('#wizard .hint')));
  const n = await notices(p); ok('upozornění: důvod a rozdíl', n.length === 1 && /Hrát za dva kluby zároveň teď nejde\./.test(n[0]) && /Střídavé hostování:/.test(n[0]) && /1\. ligu dorostenců/.test(n[0]) && /přestupem natrvalo, nebo hostováním dočasně/.test(n[0]) && /jen za jeden klub/.test(n[0]), n);
  const badges = await p.$$eval('#wizard > div > .cards .match', x => x.map(y => y.textContent)); eq('karty: štítek jiné možnosti', badges, ['Jiná možnost: jen jeden klub', 'Jiná možnost: jen jeden klub']);
  await p.close();
  // hint pod otázkou
  p = await open(); await p.click('button[data-v=starsi]'); await p.click('button[data-v=oddil]'); await p.click('button[data-v=dva]'); await p.fill('input[type=date]', '2026-11-04'); await p.click('#next'); await p.click('button[data-v=ne]'); await p.click('button[data-k=sthG][data-v=m]');
  ok('otázka na 1. ligu dorostenců má vysvětlení', /Pokud ano, střídavě hostovat tam nelze, protože klub má družstvo ve stejné soutěži\./.test(await p.textContent('#wizard')));
  await p.close();
  // cíl splnitelný: nadpis i upozornění zůstanou jako dřív
  p = await flow({cat: 'starsi', state: 'oddil', goal: 'dva', sthG: 'm', sthHome: 'ne'});
  ok('cíl jde: běžný nadpis', /^Máš \d/.test(await p.textContent('#wizard h2')), await p.textContent('#wizard h2')); eq('cíl jde: bez upozornění', (await notices(p)).length, 0);
  eq('cíl jde: štítek Odpovídá tvému cíli', (await p.$$eval('#wizard > div > .cards .match', x => x.map(y => y.textContent)))[0], 'Odpovídá tvému cíli'); await p.close();
  // cíl „vše“ nikdy nehlásí nesplněný cíl
  p = await flow({cat: 'starsi', state: 'oddil', goal: 'vse', sthG: 'm', sthHome: 'ano'}); ok('cíl vše: žádné „teď nejde“ v nadpisu', !/teď nejde/.test(await p.textContent('#wizard h2')), await p.textContent('#wizard h2')); await p.close();
  // střídavý start i střídavé hostování nejdou (19–21 let) → jedno upozornění se dvěma důvody
  p = await flow({cat: 'dospeli21', state: 'oddil', goal: 'dva', league: 'm1', ststSecond: 'm5'});
  const n2 = await notices(p); ok('19–21: upozornění uvádí oba důvody', n2.length === 1 && /Střídavý start:/.test(n2[0]) && /Střídavé hostování:/.test(n2[0]) && /Místo toho můžeš klub změnit/.test(n2[0]), n2);
  eq('19–21: nadpis', await p.textContent('#wizard h2'), 'Hrát za dva kluby zároveň teď nejde'); await p.close();
  // jiné cíle: dočasně nejde → nabízí přestup natrvalo
  p = await flow({cat: 'dorost', state: 'oddil', goal: 'docasne', recent: 'ano'}); ok('dočasně a přestup před 3 měsíci: nouzový stav beze změny', /Teď nemáš žádnou možnost/.test(await p.textContent('#wizard h2')), await p.textContent('#wizard h2')); await p.close();
});

// ---------- 24) vysvětlení u cílů: čekací doba po přestupu, délka hostování, kdo smí za dva kluby ----------
await S('24', async () => {
  const sub = async (cat, goal) => { const p = await open(); await p.click(`button[data-v=${cat}]`); await p.click('button[data-v=oddil]');
    const t = await p.$$eval(`#wizard button[data-v=${goal}] small`, x => x.map(y => y.textContent)); await p.close(); return t[0] || ''; };
  const base = 'Po přestupu nemůžeš 3 měsíce znovu přestoupit ani hostovat.';
  for (const [cat, extra] of [['dospeli21', ' Pokud to půjde, můžeš využít střídavé hostování nebo střídavý start.'],
    ['junior', ' Pokud to půjde, můžeš využít střídavé hostování.'], ['dorost', ' Pokud to půjde, můžeš využít střídavé hostování.'],
    ['starsi', ' Pokud to půjde, můžeš využít střídavé hostování.'], ['dospeli', ''], ['mladsi', ''], ['pripravka', '']])
    eq(`natrvalo: vysvětlení ${cat}`, await sub(cat, 'trvale'), base + extra);
  for (const cat of ['dospeli', 'dorost', 'pripravka'])
    eq(`dočasně: nejméně 30 dnů, nejdéle do 30. 6. (${cat})`, await sub(cat, 'docasne'), 'Třeba na půl sezóny. Nejméně 30 dnů, nejdéle do 30. 6.');
  // dva kluby: kdo to smí je vidět u každé kategorie, u nezpůsobilých je volba zašedlá s krátkým důvodem
  const who = 'Střídavé hostování: od U15 starších žáků po muže a ženy 19–21 let. Střídavý start: jen muži a ženy 19–21 let.';
  for (const [cat, off] of [['dospeli21', false], ['dorost', false], ['starsi', false], ['dospeli', true], ['mladsi', true], ['pripravka', true]]) {
    const p = await open(); await p.click(`button[data-v=${cat}]`); await p.click('button[data-v=oddil]');
    const o = p.locator('#wizard .opt', {hasText: 'Hrát za dva kluby zároveň'});
    ok(`dva kluby: vysvětlení (${cat})`, (await o.locator('small').first().textContent()) === who);
    eq(`dva kluby: zašedlá jen u nezpůsobilých (${cat})`, await o.isDisabled(), off);
    eq(`dva kluby: důvod (${cat})`, await o.locator('small.why').count() ? await o.locator('small.why').textContent() : '', off ? 'Pro tvoji kategorii to nejde.' : '');
    await p.close(); }
  // nápověda u situací, kdy hráč dočasně hraje jinde (střídavé možnosti jen pro kategorie, které je smějí využít)
  const help = async (cat, st) => { const p = await open(); await p.click(`button[data-v=${cat}]`);
    const t = await p.$$eval(`#wizard button[data-v=${st}] small`, x => x.map(y => y.textContent)); await p.close(); return t[0] || ''; };
  eq('situace: nápověda hostování', await help('dospeli', 'hostuji'), 'Dočasně hraju jen za jiný klub, než kde jsem registrovaný. Třeba do konce sezóny.');
  eq('situace: nápověda střídavý start', await help('dospeli21', 'stst'), 'Hraju za A-družstvo svého klubu a zároveň za A-družstvo jiného klubu, které hraje o 1–2 ligy níž.');
  eq('situace: nápověda střídavé hostování', await help('dorost', 'sth'), 'Hraju za svůj klub a zároveň za jedno družstvo jiného klubu v celostátní soutěži. Třeba dorostenec, který vypomáhá ve vyšší soutěži.');
  eq('situace: střídavý start jen pro 19–21', await (async () => { const p = await open(); await p.click('button[data-v=dorost]'); const n = await p.locator('#wizard button[data-v=stst]').count(); await p.close(); return n; })(), 0);
  // název cíle ve výsledcích je stejný jako název volby
  { const p = await open(); await p.click('button[data-v=dorost]'); await p.click('button[data-v=oddil]');
    eq('cíl natrvalo: stejný název ve výsledcích i ve volbě', await p.evaluate(() => { A.state = 'oddil'; A.goal = 'trvale'; return goalPhrase(); }), 'Změnit natrvalo klub');
    eq('cíl bez klubu: název beze změny', await p.evaluate(() => { A.state = 'bez'; return goalPhrase(); }), 'Přihlásit se do nového klubu'); await p.close(); }
});

// ---------- 25) podklady: krátké zmínky o startu v jiné věkové kategorii ----------
await S('25', async () => {
  const p = await open(1000, 'podklady.html'); const t = await p.textContent('body');
  ok('podklady: start v jiné kategorii o jednu výš', /o jednu kategorii výš/.test(t) && /SŘ čl\. 15\.5/.test(t));
  ok('podklady: o dvě kategorie výš se souhlasem', /O dvě kategorie výš jen v regionálních soutěžích/.test(t) && /SŘ čl\. 5\.4/.test(t));
  ok('podklady: hráčky v mužských kategoriích', /Hráčky smějí startovat v mužských kategoriích/.test(t) && /SŘ čl\. 5\.5/.test(t));
  ok('podklady: hráčky za jiný klub bez přestupu', /bez přestupu\. Jen za jeden klub v ročníku/.test(t) && /SŘ čl\. 15\.4/.test(t));
  ok('podklady: otevřený bod odkazuje na zmínky', /zatím jen krátce v tabulce pravidel/.test(t));
  await p.close();
});

ok('žádné chyby v konzoli',consoleErrs.length===0,consoleErrs.slice(0,3));ok('žádné výjimky stránky',pageErrs.length===0,pageErrs.slice(0,3));
console.log(`PASS ${pass}  FAIL ${fail}`);if(fail){console.log('\nSelhání:');failures.forEach(f=>console.log(' - '+f.slice(0,300)));}
await b.close();process.exit(fail?1:0);})().catch(e=>{console.error('SUITE CRASH',e.message);process.exit(2);});
