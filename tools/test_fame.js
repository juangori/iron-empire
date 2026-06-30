// test_fame.js — valida el sistema de Fama (reputación gastable) + calibra precios.
// Carga data.js + game.js reales en vm; corre el test en el mismo scope léxico.
const fs = require('fs'), vm = require('vm');
const JS = 'c:/Users/bevid/Documents/GitHub/iron-empire/js/';
const data = fs.readFileSync(JS + 'data.js', 'utf8');
const gamejs = fs.readFileSync(JS + 'game.js', 'utf8');

const test = `
let P=0,F=0; function ok(c,m){ if(c){P++}else{F++;console.log('  x FALLA: '+m)} }
function approx(a,b,tol){ return Math.abs(a-b) <= tol*Math.max(1,Math.abs(b)); }

function setupPlayer(level) {
  game.level = level; game.mainNeighborhoodId='palermo'; game.branches={};
  game.reputation=0; game.reputationSpent=0; game.money=1e12;
  game.skills={}; game.supplements={}; game.rivals={}; game.decoration={items:{}}; game.instructors={};
  game.famePerks={}; game.fameBoosts={}; game.fameUnlocks={};
  game.dailyTracking={reputationGained:0,moneyEarned:0,xpEarned:0};
  game.equipment={};
  var tiers = Math.min(EQUIPMENT.length, Math.max(3, Math.floor(level*0.6)));
  for (var i=0;i<tiers;i++){ var e=EQUIPMENT[i]; game.equipment[e.id]={level:Math.min(level,e.maxLevel||level),brokenUntil:0,upgradingUntil:0}; }
  game.zones={}; GYM_ZONES.forEach(function(z){ if(level>=(z.reqLevel||0)&&z.id!=='property') game.zones[z.id]=true; });
  game.staff={}; STAFF.forEach(function(s){ if(level>=(s.reqLevel||1)) game.staff[s.id]={hired:true,level:Math.min(3,Math.ceil(level/5)),extras:[],sickUntil:0,trainingUntil:0}; });
  game.maxMembers=getMaxMembers(); game.members=game.maxMembers;
}
function fmtN(n){ n=Math.round(n); if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'K'; return ''+n; }

console.log('='.repeat(76));
console.log('TEST FAMA — funcionalidad');
console.log('='.repeat(76));

setupPlayer(12);

console.log('\\n1) INVARIANTE lifetime: gastar NO baja la fama acumulada');
game.reputation = 100000;
var lifeBefore = getReputationLifetime();
var cost = getFameBoostCost(FAME_SHOP.boosts[0]);
buyFameBoost('boost_press');
ok(getReputationLifetime() === lifeBefore, 'lifetime constante al gastar (era '+fmtN(lifeBefore)+', ahora '+fmtN(getReputationLifetime())+')');
ok(approx(game.reputation, 100000-cost, 0.001), 'balance bajó exactamente el costo');
ok(game.reputationSpent === cost, 'reputationSpent = costo');

console.log('2) PISO PASIVO: monotónico y capeado');
game.reputation=0; game.reputationSpent=0; game.fameUnlocks={};
var f0=getReputationFloorBonus();
game.reputation=1000; var f1=getReputationFloorBonus();
game.reputation=1000000; var f2=getReputationFloorBonus();
game.reputation=50000000; var f3=getReputationFloorBonus();
ok(f0===0, 'sin fama => piso 0');
ok(f1>0 && f2>f1, 'crece con la fama ('+(f1*100).toFixed(1)+'% -> '+(f2*100).toFixed(1)+'%)');
ok(f3<=0.15+1e-9, 'capeado a 15% ('+(f3*100).toFixed(1)+'%)');
game.fameUnlocks={unlock_legacy:true};
ok(getReputationFloorBonus()>0.15, 'Leyenda sube el techo >15% ('+(getReputationFloorBonus()*100).toFixed(1)+'%)');
game.fameUnlocks={};

console.log('3) PERK income (Marca Reconocida) sube el ingreso');
setupPlayer(12);
var inc0=getIncomePerSecond();
game.famePerks={perk_brand:3};
var inc1=getIncomePerSecond();
ok(approx(inc1/inc0, 1.18, 0.02), '+18% con 3 niveles (x'+(inc1/inc0).toFixed(3)+')');
game.famePerks={};

console.log('4) PERK costos (Proveedores Premium) baja getEquipCost');
var c0=getEquipCost(EQUIPMENT.find(function(e){return e.id==='bench';}),5);
game.famePerks={perk_suppliers:5};
var c1=getEquipCost(EQUIPMENT.find(function(e){return e.id==='bench';}),5);
ok(approx(c1/c0, 0.80, 0.01), '-20% costo con 5 niveles (x'+(c1/c0).toFixed(3)+')');
ok(getFameCostReduction()===0.20, 'getFameCostReduction = 0.20');
game.famePerks={};

console.log('5) PERK capacidad (Gimnasio de Moda) sube getMaxMembers');
var m0=getMaxMembers();
game.famePerks={perk_capacity:5};
var m1=getMaxMembers();
ok(m1>m0 && approx(m1/m0,1.25,0.03), '+25% cap con 5 niveles (x'+(m1/m0).toFixed(3)+')');
game.famePerks={};

console.log('6) PERK retención (Lealtad) reduce el robo de rivales');
setupPlayer(12); RIVAL_GYMS.forEach(function(r){ game.rivals[r.id]={}; }); // todos activos
game.members=getMaxMembers();
var steal0=getMembersAttracted();
game.famePerks={perk_loyalty:3};
var steal1=getMembersAttracted();
ok(steal1>steal0, 'con Lealtad perdés menos miembros ('+steal0+' -> '+steal1+')');
game.famePerks={}; game.rivals={};

console.log('7) BOOST income (Prensa Deportiva) duplica ingreso');
setupPlayer(12);
var bi0=getIncomePerSecond();
game.fameBoosts={boost_press: Date.now()+100000};
var bi1=getIncomePerSecond();
ok(approx(bi1/bi0,2.0,0.001), 'x2 ingreso con boost activo (x'+(bi1/bi0).toFixed(3)+')');
game.fameBoosts={};

console.log('8) BOOST rep (Viral) duplica generación de reputación');
setupPlayer(12);
game.reputation=0; repTick(); var rNo=game.reputation;
game.reputation=0; game.fameBoosts={boost_viral:Date.now()+100000}; repTick(); var rYes=game.reputation;
ok(approx(rYes/rNo,2.0,0.001), 'x2 rep con Viral (x'+(rYes/rNo).toFixed(3)+')');
game.fameBoosts={};

console.log('9) UNLOCK gating + efecto');
setupPlayer(12);
game.reputation=1e9; game.reputationSpent=0; game.fameUnlocks={};
// lifetime = 1e9 (>= reqs) -> debería poder
var incBefore=getIncomePerSecond();
buyFameUnlock('unlock_sponsor');
ok(game.fameUnlocks.unlock_sponsor===true, 'sponsor comprado con fama suficiente');
ok(getIncomePerSecond()>incBefore, 'sponsor sube el ingreso (+15%)');
// gating: lifetime bajo no permite
game.fameUnlocks={}; game.reputation=1000; game.reputationSpent=0; // lifetime=1000 < 150000
buyFameUnlock('unlock_vipsalon');
ok(!game.fameUnlocks.unlock_vipsalon, 'vipsalon BLOQUEADO con fama insuficiente');

console.log('10) PERK no pasa de maxLevel; sin plata no compra');
setupPlayer(12); game.reputation=1e9;
for(var k=0;k<9;k++) buyFamePerk('perk_loyalty'); // max 3
ok(getFamePerkLevel('perk_loyalty')===3, 'perk capeado en maxLevel=3 (nivel '+getFamePerkLevel('perk_loyalty')+')');
game.famePerks={}; game.reputation=1; // casi sin rep
var lvlPre=getFamePerkLevel('perk_brand');
buyFamePerk('perk_brand');
ok(getFamePerkLevel('perk_brand')===lvlPre, 'sin fama suficiente NO compra');

console.log('11) ANTI always-on: boost income cuesta más que su duración (en fama-seg)');
ok(FAME_SHOP.boosts[0].costSeconds >= FAME_SHOP.boosts[0].duration, 'Prensa: costSeconds('+FAME_SHOP.boosts[0].costSeconds+') >= duration('+FAME_SHOP.boosts[0].duration+')');

console.log('\\n'+(F===0?'OK':'HAY FALLAS')+': '+P+' pass, '+F+' fail');

// ===== TABLA DE PRECIOS (calibración) =====
console.log('\\n'+'='.repeat(76));
console.log('CALIBRACION DE PRECIOS — costo en fama y en "minutos de generación"');
console.log('='.repeat(76));
[5,8,11,15,20,25].forEach(function(lvl){
  setupPlayer(lvl);
  var rate=getReputationPerSecond();
  console.log('\\nNivel '+lvl+'  (rep/seg='+rate.toFixed(1)+', rep/h='+fmtN(rate*3600)+')');
  console.log('  BOOSTS:');
  FAME_SHOP.boosts.forEach(function(b){ var c=getFameBoostCost(b); console.log('    '+b.name.padEnd(20)+' '+fmtN(c).padStart(8)+'  ('+(c/rate/60).toFixed(0)+' min de fama, dura '+(b.duration/60)+'min)'); });
  console.log('  PERKS (costo del 1er nivel):');
  FAME_SHOP.perks.forEach(function(p){ var c=getFamePerkCost(p); console.log('    '+p.name.padEnd(20)+' '+fmtN(c).padStart(8)+'  ('+(c/rate/60).toFixed(0)+' min de fama)'); });
  console.log('  UNLOCKS:');
  FAME_SHOP.unlocks.forEach(function(u){ var c=getFameUnlockCost(u); console.log('    '+u.name.padEnd(20)+' '+fmtN(c).padStart(8)+'  ('+(c/rate/3600).toFixed(1)+' h de fama, req '+fmtN(u.reqLifetime)+')'); });
});

if(F>0) throw new Error('FAIL');
`;

const noop = () => {};
const renderNames = ['renderLog','renderEquipment','renderStaff','renderClasses','renderMarketing','renderSupplements','renderRivals','renderVipMembers','renderChampion','renderExpansion','renderSkillTree','renderProfile','renderDailyMissions','renderDailyBonus','renderGymScene','renderCityMap','renderAll','renderFameShop','updateUI','updateTabNotifications','updateTabVisibility','floatNumber','showFloatingIncome','flashSaveIndicator','showToast','addLog','saveGame','checkAchievements','checkMissionProgress','renderWiki'];
const renders = {}; renderNames.forEach(n => renders[n] = noop);
const elMock = { textContent:'', innerHTML:'', value:'', style:{}, classList:{add(){},remove(){},contains(){return false},toggle(){}}, insertAdjacentHTML(){}, appendChild(){}, querySelector(){return null}, remove(){} };
const sb = { Math, JSON, console, Date, ...renders,
  document:{ getElementById:()=>elMock, querySelectorAll:()=>[], createElement:()=>elMock, body:{appendChild(){},insertAdjacentHTML(){}} },
  localStorage:{getItem:()=>null,setItem:()=>{}}, window:{addEventListener:()=>{}}, setInterval:()=>0, setTimeout:()=>0 };
vm.createContext(sb);
vm.runInContext(data + '\n' + gamejs + '\n' + test, sb);
