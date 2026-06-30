// sim_opportunities.js — ¿Está balanceado el circuito de Negocios Arriesgados (Fase 2)?
// Mismo enfoque que sim_grand_tournaments.js, pero a nivel gimnasio (sin campeón). Mide por nivel:
//   1) chance de éxito y de backfire con prep mínima vs full
//   2) costo esperado del SETBACK (income -% por horas) — el downside real
//   3) E[neto]/intento (premio − entrada − prep − setback) y aporte $/h vs ingreso/h
// Objetivo: bien preparado => éxito casi seguro y backfire raro; el circuito aporta una fracción
// chica del ingreso (premio ocasional, no la economía). La fama acumulada mejora las chances.
const fs = require('fs'), vm = require('vm');
const JS = 'c:/Users/bevid/Documents/GitHub/iron-empire/js/';
const data = fs.readFileSync(JS + 'data.js', 'utf8');
const gamejs = fs.readFileSync(JS + 'game.js', 'utf8');

const sim = `
function fmtN(n){ n=Math.round(n); if(Math.abs(n)>=1e6) return (n/1e6).toFixed(2)+'M'; if(Math.abs(n)>=1e3) return (n/1e3).toFixed(1)+'K'; return ''+n; }

function setupPlayer(level, lifetimeRep) {
  game.level = level;
  game.mainNeighborhoodId = 'palermo';
  game.branches = {};
  game.reputation = lifetimeRep;
  game.reputationSpent = 0;
  game.money = 1e12;
  game.skills = {};
  game.supplements = {};
  game.rivals = {};
  game.decoration = { items: {} };
  game.instructors = {};
  game.dailyTracking = { reputationGained: 0, moneyEarned: 0, xpEarned: 0, competitionsWon: 0 };
  game.stats = game.stats || {};
  game.opportunities = {};
  game.oppPrep = {};
  game.gymSetback = { active: false, name:'', icon:'', until:0, incomeMult:1 };

  game.equipment = {};
  var tiers = Math.min(EQUIPMENT.length, Math.max(3, Math.floor(level * 0.6)));
  for (var i = 0; i < tiers; i++) {
    var e = EQUIPMENT[i];
    game.equipment[e.id] = { level: Math.min(level, e.maxLevel || level), brokenUntil: 0, upgradingUntil: 0 };
  }
  game.zones = {};
  GYM_ZONES.forEach(function(z){ if (level >= (z.reqLevel || 0) && z.id !== 'property') game.zones[z.id] = true; });
  game.staff = {};
  STAFF.forEach(function(s){ if (level >= (s.reqLevel || 1)) game.staff[s.id] = { hired:true, level: Math.min(3, Math.ceil(level/5)), extras:[], sickUntil:0, trainingUntil:0 }; });

  game.maxMembers = getMaxMembers();
  game.members = game.maxMembers;
}

function setPrep(oId, mode) {
  if (mode === 'full') game.oppPrep[oId] = { permisos:true, contactos:true, seguro:true, duediligenceUntil: 1 };
  else game.oppPrep[oId] = { permisos:true, contactos:false, seguro:false, duediligenceUntil: 0 };
}

function prepCost(o, mode) {
  var total = 0;
  OPP_PREP_ITEMS.forEach(function(it){
    if (mode === 'full' || it.id === 'permisos') total += getOppPrepItemCost(o, it);
  });
  return total;
}

function winReward(o) {
  return Math.max(Math.ceil(o.reward.money), Math.ceil(getIncomePerSecond() * o.floorSecs));
}

// costo esperado del setback por intento (income perdido). avgSeverity: U(0.4,1) -> 0.7; con seguro x0.6
function expectedSetbackLoss(o, mode, backfireChance) {
  var avgSeverity = (mode === 'full' ? 0.42 : 0.7);
  var hoursLost = avgSeverity * o.backfire.maxHours;
  var incomeLostPerSec = getIncomePerSecond() * o.backfire.incomePenalty;
  return backfireChance * hoursLost * 3600 * incomeLostPerSec;
}

console.log('='.repeat(82));
console.log('SIMULACION NEGOCIOS ARRIESGADOS — odds, setback y aporte economico');
console.log('='.repeat(82));

var SCEN = {
  torneo_clandestino: [{lvl:11, rep:800},  {lvl:16, rep:3000}],
  patrocinio:         [{lvl:17, rep:4000}, {lvl:24, rep:12000}],
  inmobiliaria:       [{lvl:23, rep:9000}, {lvl:30, rep:25000}],
};

OPPORTUNITIES.forEach(function(o){
  console.log('\\n' + o.icon + '  ' + o.name + '  (cooldown ' + (o.cooldown/3600) + 'h, entrada ' + fmtN(o.entryFee) + ', backfire ' + o.backfire.name + ' -' + Math.round(o.backfire.incomePenalty*100) + '%/' + o.backfire.maxHours + 'h)');
  console.log('-'.repeat(82));
  SCEN[o.id].forEach(function(s){
    setupPlayer(s.lvl, s.rep);
    var incomeH = getIncomePerSecond() * 3600;
    var reward = winReward(o);

    ['min','full'].forEach(function(mode){
      setPrep(o.id, mode);
      var sc = getOppSuccessChance(o);
      var bc = getOppBackfireChance(o);
      var commit = o.entryFee + prepCost(o, mode);
      var setbackLoss = expectedSetbackLoss(o, mode, bc);
      var expNet = sc * reward - commit - setbackLoss;
      var attemptsPerH = 3600 / o.cooldown;
      var circuitPerH = expNet * attemptsPerH;
      var pctOfIncome = incomeH > 0 ? (circuitPerH / incomeH * 100) : 0;

      console.log(
        '  Nv' + String(s.lvl).padStart(2) + ' (fama ' + fmtN(s.rep).padStart(5) + ') · prep ' + mode.padEnd(4) +
        ' | exito ' + (sc*100).toFixed(0).padStart(3) + '% · backfire ' + (bc*100).toFixed(0).padStart(2) + '%'
      );
      console.log(
        '       premio ' + fmtN(reward).padStart(7) + ' · compromiso ' + fmtN(commit).padStart(7) +
        ' · E[setback] -' + fmtN(setbackLoss).padStart(7) +
        ' · E[neto] ' + fmtN(expNet).padStart(8) +
        ' · circuito ' + (pctOfIncome).toFixed(1).padStart(4) + '% del ingreso (' + fmtN(incomeH) + '/h)'
      );
    });
  });
});

console.log('\\n' + '='.repeat(82));
console.log('LECTURA:');
console.log(' - "exito" full deberia ser alto; "backfire" full deberia ser bajo (raro salir mal preparado).');
console.log(' - E[setback] = ingreso esperado perdido por el revez; full lo reduce mucho (seguro).');
console.log(' - "% del ingreso" BAJO = premio ocasional, no la economia. La fama sube las chances.');
console.log('='.repeat(82));
`;

const noop = () => {};
const renderNames = ['renderLog','renderEquipment','renderStaff','renderClasses','renderMarketing','renderSupplements','renderRivals','renderVipMembers','renderChampion','renderExpansion','renderSkillTree','renderProfile','renderDailyMissions','renderDailyBonus','renderGymScene','renderCityMap','renderOpportunities','renderAll','updateUI','updateTabNotifications','updateTabVisibility','floatNumber','showFloatingIncome','flashSaveIndicator','showToast','addLog','saveGame','checkAchievements','checkMissionProgress','renderWiki','showGrandResult','showOpportunityResult','closeGrandResult','checkLevelUp','checkChampionLevelUp','addXp'];
const renders = {}; renderNames.forEach(n => renders[n] = noop);
const elMock = { textContent:'', innerHTML:'', value:'', style:{}, classList:{add(){},remove(){},contains(){return false},toggle(){}}, insertAdjacentHTML(){}, appendChild(){}, querySelector(){return null}, remove(){} };
const sb = { Math, JSON, console, Date, ...renders,
  document:{ getElementById:()=>elMock, querySelectorAll:()=>[], createElement:()=>elMock, body:{appendChild(){},insertAdjacentHTML(){}} },
  localStorage:{getItem:()=>null,setItem:()=>{}}, window:{addEventListener:()=>{}}, setInterval:()=>0, setTimeout:()=>0 };
vm.createContext(sb);
vm.runInContext(data + '\n' + gamejs + '\n' + sim, sb);
