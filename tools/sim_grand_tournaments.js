// sim_grand_tournaments.js — ¿Está balanceado el circuito de Grandes Torneos?
// Carga data.js + game.js reales (vm sandbox) y mide, por nivel:
//   1) chance de ganar y de lesión con preparación mínima vs full
//   2) plata/hora del circuito vs ingreso/hora del jugador (debe ser un "premio", no la economía)
//   3) ROI por intento y tasa de "malherido sin nada" (derrota + lesión)
// Objetivo de diseño: bien preparado => victoria casi segura y lesión rara; el castigo real es el
// cooldown largo + perder inscripción/prep. El aporte $/h del circuito debe quedar MUY por debajo
// del ingreso pasivo para que sea un golpe ocasional, no la fuente principal.
const fs = require('fs'), vm = require('vm');
const JS = 'c:/Users/bevid/Documents/GitHub/iron-empire/js/';
const data = fs.readFileSync(JS + 'data.js', 'utf8');
const gamejs = fs.readFileSync(JS + 'game.js', 'utf8');

const sim = `
function fmtN(n){ n=Math.round(n); if(Math.abs(n)>=1e6) return (n/1e6).toFixed(2)+'M'; if(Math.abs(n)>=1e3) return (n/1e3).toFixed(1)+'K'; return ''+n; }

function setupPlayer(level, champLevel, champStat) {
  game.level = level;
  game.mainNeighborhoodId = 'palermo';
  game.branches = {};
  game.reputation = 999999;          // así nunca bloquea el gate de rep en el sim
  game.money = 1e12;
  game.skills = {};
  game.supplements = {};
  game.rivals = {};
  game.decoration = { items: {} };
  game.instructors = {};
  game.dailyTracking = { reputationGained: 0, moneyEarned: 0, xpEarned: 0, competitionsWon: 0 };
  game.stats = game.stats || {};

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

  // Campeón típico para ese nivel
  game.champion = {
    recruited: true, name: 'Test',
    stats: { fuerza: champStat, resistencia: champStat, velocidad: champStat, tecnica: champStat, stamina: champStat, mentalidad: champStat },
    level: champLevel, xp: 0, fatigue: 0,
    equipment: { hands: null, waist: null, feet: null, head: null },
    trainingUntil: 0, trainingStat: null, wins: 0, losses: 0, injuredUntil: 0, injurySeverity: 0,
  };
  game.grandTournaments = {};
  game.grandPrep = {};
}

// Marca prep: 'min' = sólo pasajes (obligatorio), 'full' = todo listo
function setPrep(tId, mode) {
  if (mode === 'full') game.grandPrep[tId] = { pasajes:true, nutricion:true, medico:true, concentracionUntil: 1 };
  else game.grandPrep[tId] = { pasajes:true, nutricion:false, medico:false, concentracionUntil: 0 };
}

function prepCost(t, mode) {
  var total = 0;
  GRAND_PREP_ITEMS.forEach(function(it){
    if (mode === 'full' || it.id === 'pasajes') total += getGrandPrepItemCost(t, it);
  });
  return total;
}

// Premio de victoria con mults neutros (sin skills/deco/fatiga), igual que attempt
function winReward(t) {
  return Math.max(Math.ceil(t.reward.money), Math.ceil(getIncomePerSecond() * t.floorSecs));
}

function monteCarlo(t, mode, N) {
  setPrep(t.id, mode);
  var wc = getGrandWinChance(t), ic = getGrandInjuryChance(t);
  var wins=0, injuries=0, lossInjury=0, winInjury=0;
  for (var i=0;i<N;i++){
    var won = Math.random() < wc;
    var inj = Math.random() < ic;
    if (won) wins++;
    if (inj) injuries++;
    if (won && inj) winInjury++;
    if (!won && inj) lossInjury++;
  }
  return { wc:wc, ic:ic, winRate:wins/N, injRate:injuries/N, lossInjuryRate:lossInjury/N, winInjuryRate:winInjury/N };
}

console.log('='.repeat(80));
console.log('SIMULACION GRANDES TORNEOS — odds, riesgo y aporte economico');
console.log('='.repeat(80));

var N = 20000;
// escenarios [playerLevel, champLevel, champStat] representativos para cada torneo
var SCEN = {
  copa_elite:       [{lvl:14, cl:7,  st:14}, {lvl:20, cl:12, st:22}],
  mundial_leyendas: [{lvl:22, cl:13, st:24}, {lvl:30, cl:20, st:34}],
};

GRAND_TOURNAMENTS.forEach(function(t){
  console.log('\\n' + t.icon + '  ' + t.name + '  (cooldown ' + (t.cooldown/3600) + 'h, inscripcion ' + fmtN(t.entryFee) + ')');
  console.log('-'.repeat(80));
  SCEN[t.id].forEach(function(s){
    setupPlayer(s.lvl, s.cl, s.st);
    var incomeH = getIncomePerSecond() * 3600;
    var reward = winReward(t);

    ['min','full'].forEach(function(mode){
      var mc = monteCarlo(t, mode, N);
      var commit = t.entryFee + prepCost(t, mode);
      var expNet = mc.winRate * reward - commit;          // valor esperado por intento
      var attemptsPerH = 3600 / t.cooldown;
      var circuitPerH = expNet * attemptsPerH;
      var pctOfIncome = incomeH > 0 ? (circuitPerH / incomeH * 100) : 0;

      console.log(
        '  Jugador Nv' + String(s.lvl).padStart(2) + ' (camp Nv' + s.cl + ', stats ' + s.st + ') · prep ' + mode.padEnd(4) +
        ' | ganar ' + (mc.winRate*100).toFixed(0).padStart(3) + '% · lesion ' + (mc.injRate*100).toFixed(0).padStart(2) + '%' +
        ' · "malherido s/nada" ' + (mc.lossInjuryRate*100).toFixed(1).padStart(4) + '%'
      );
      console.log(
        '       premio ' + fmtN(reward).padStart(7) + ' · compromiso ' + fmtN(commit).padStart(7) +
        ' · E[neto]/intento ' + fmtN(expNet).padStart(8) +
        ' · circuito ' + fmtN(circuitPerH).padStart(7) + '/h = ' + pctOfIncome.toFixed(1) + '% del ingreso (' + fmtN(incomeH) + '/h)'
      );
    });
  });
});

console.log('\\n' + '='.repeat(80));
console.log('LECTURA:');
console.log(' - "ganar" full deberia ser muy alto (premio casi seguro si te preparas).');
console.log(' - "malherido s/nada" full deberia ser bajo (rara vez salis lastimado sin nada).');
console.log(' - "% del ingreso" deberia ser BAJO: el circuito es un premio ocasional, no la economia.');
console.log('='.repeat(80));
`;

const noop = () => {};
const renderNames = ['renderLog','renderEquipment','renderStaff','renderClasses','renderMarketing','renderSupplements','renderRivals','renderVipMembers','renderChampion','renderExpansion','renderSkillTree','renderProfile','renderDailyMissions','renderDailyBonus','renderGymScene','renderCityMap','renderAll','updateUI','updateTabNotifications','updateTabVisibility','floatNumber','showFloatingIncome','flashSaveIndicator','showToast','addLog','saveGame','checkAchievements','checkMissionProgress','renderWiki','showGrandResult','checkLevelUp','checkChampionLevelUp','addXp'];
const renders = {}; renderNames.forEach(n => renders[n] = noop);
const elMock = { textContent:'', innerHTML:'', value:'', style:{}, classList:{add(){},remove(){},contains(){return false},toggle(){}}, insertAdjacentHTML(){}, appendChild(){}, querySelector(){return null}, remove(){} };
const sb = { Math, JSON, console, Date, ...renders,
  document:{ getElementById:()=>elMock, querySelectorAll:()=>[], createElement:()=>elMock, body:{appendChild(){},insertAdjacentHTML(){}} },
  localStorage:{getItem:()=>null,setItem:()=>{}}, window:{addEventListener:()=>{}}, setInterval:()=>0, setTimeout:()=>0 };
vm.createContext(sb);
vm.runInContext(data + '\n' + gamejs + '\n' + sim, sb);
