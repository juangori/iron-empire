// sim_reputation.js — ¿Cuánta reputación junta un jugador típico, de dónde, y a qué ritmo?
// Carga data.js + game.js reales (vm sandbox) y mide el ritmo de rep por nivel.
// Objetivo: calibrar con datos antes de decidir QUÉ debe hacer la reputación.
// game/EQUIPMENT/etc son let/const -> el sim corre DENTRO del mismo scope léxico.
const fs = require('fs'), vm = require('vm');
const JS = 'c:/Users/bevid/Documents/GitHub/iron-empire/js/';
const data = fs.readFileSync(JS + 'data.js', 'utf8');
const gamejs = fs.readFileSync(JS + 'game.js', 'utf8');

const sim = `
function fmtN(n){ n=Math.round(n); if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'K'; return ''+n; }

function setupPlayer(level) {
  game.level = level;
  game.mainNeighborhoodId = 'palermo';
  game.branches = {};
  game.reputation = 0;
  game.money = 1e9;
  game.skills = {};
  game.supplements = {};
  game.rivals = {};
  game.decoration = { items: {} };
  game.instructors = {};
  game.dailyTracking = { reputationGained: 0 };

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

function passiveRepPerSec() {
  var before = game.reputation;
  repTick();
  var delta = game.reputation - before;
  game.reputation = before;
  return delta;
}

function competitionRepPerHour(level) {
  var total = 0;
  var compRepMult = (typeof getSkillEffect === 'function') ? getSkillEffect('compRepMult', 1) : 1;
  COMPETITIONS.forEach(function(c){
    if (level < (c.reqLevel || 0)) return;
    var perWin = Math.ceil((c.repReward || 0) * compRepMult);
    var cdHours = (c.cooldown || 600) / 3600;
    if (cdHours > 0) total += perWin / cdHours;
  });
  return total;
}

function classRepPerHour(level) {
  var total = 0;
  GYM_CLASSES.forEach(function(gc){
    if (level < (gc.reqLevel || 0)) return;
    game.instructors[gc.id] = { hired:true, level:1 };
    var rep = 0;
    try { rep = getClassReward(gc).rep || 0; } catch(e) { rep = gc.rep || 0; }
    var cycleHours = ((gc.duration || 0) + (gc.cooldown || 0)) / 3600;
    if (cycleHours > 0) total += rep / cycleHours;
  });
  return total;
}

console.log('='.repeat(78));
console.log('SIMULACION DE REPUTACION - ritmo de acumulacion por nivel');
console.log('='.repeat(78));
console.log('Fuente dominante esperada: rep pasiva = members x 0.02/seg (repTick)\\n');

var levels = [3, 5, 8, 11, 15, 20, 25];
var rows = [];
levels.forEach(function(lvl){
  setupPlayer(lvl);
  var members = game.members;
  var passSec = passiveRepPerSec();
  var passHour = passSec * 3600;
  var compHour = competitionRepPerHour(lvl);
  var classHour = classRepPerHour(lvl);
  var totalHour = passHour + compHour + classHour;
  rows.push({ lvl:lvl, members:members, passSec:passSec, passHour:passHour, compHour:compHour, classHour:classHour, totalHour:totalHour });
});

console.log('Nv | Miembros | Rep pasiva/s | Rep pasiva/h | Comp/h | Clases/h | TOTAL/h');
console.log('-'.repeat(78));
rows.forEach(function(r){
  console.log(
    String(r.lvl).padStart(2) + ' | ' +
    String(Math.round(r.members)).padStart(8) + ' | ' +
    r.passSec.toFixed(2).padStart(12) + ' | ' +
    String(Math.round(r.passHour)).padStart(12) + ' | ' +
    String(Math.round(r.compHour)).padStart(6) + ' | ' +
    String(Math.round(r.classHour)).padStart(8) + ' | ' +
    String(Math.round(r.totalHour)).padStart(8)
  );
});

console.log('\\n% del total que viene de cada fuente:');
console.log('-'.repeat(78));
rows.forEach(function(r){
  var p = r.passHour / r.totalHour * 100;
  var c = r.compHour / r.totalHour * 100;
  var cl = r.classHour / r.totalHour * 100;
  console.log('Nv ' + String(r.lvl).padStart(2) + ': pasiva ' + p.toFixed(0) + '% | comp ' + c.toFixed(0) + '% | clases ' + cl.toFixed(0) + '%');
});

console.log('\\nRep ACUMULADA (pasiva+comp+clases, jugando activo):');
console.log('-'.repeat(78));
console.log('Nv | tras 10min | tras 1h | tras 1 dia (8h) | tras 1 semana (8h/dia)');
rows.forEach(function(r){
  var perMin = r.totalHour / 60;
  console.log(
    String(r.lvl).padStart(2) + ' | ' +
    fmtN(perMin*10).padStart(10) + ' | ' +
    fmtN(r.totalHour).padStart(7) + ' | ' +
    fmtN(r.totalHour*8).padStart(15) + ' | ' +
    fmtN(r.totalHour*8*7).padStart(20)
  );
});

console.log('\\nValor ACTUAL de la rep (lo unico que hace hoy):');
console.log('-'.repeat(78));
console.log('* Gate minRep de competencias:');
COMPETITIONS.forEach(function(c){ console.log('   ' + String(c.name||c.id).padEnd(24) + ' requiere rep >= ' + (c.minRep||0)); });
console.log('* Bonus win-chance: reputation x 0.0001 (1000 rep = +10% chance)');
`;

const noop = () => {};
const renderNames = ['renderLog','renderEquipment','renderStaff','renderClasses','renderMarketing','renderSupplements','renderRivals','renderVipMembers','renderChampion','renderExpansion','renderSkillTree','renderProfile','renderDailyMissions','renderDailyBonus','renderGymScene','renderCityMap','renderAll','updateUI','updateTabNotifications','updateTabVisibility','floatNumber','showFloatingIncome','flashSaveIndicator','showToast','addLog','saveGame','checkAchievements','checkMissionProgress','renderWiki'];
const renders = {}; renderNames.forEach(n => renders[n] = noop);
const elMock = { textContent:'', innerHTML:'', value:'', style:{}, classList:{add(){},remove(){},contains(){return false},toggle(){}}, insertAdjacentHTML(){}, appendChild(){}, querySelector(){return null}, remove(){} };
const sb = { Math, JSON, console, Date, ...renders,
  document:{ getElementById:()=>elMock, querySelectorAll:()=>[], createElement:()=>elMock, body:{appendChild(){},insertAdjacentHTML(){}} },
  localStorage:{getItem:()=>null,setItem:()=>{}}, window:{addEventListener:()=>{}}, setInterval:()=>0, setTimeout:()=>0 };
vm.createContext(sb);
vm.runInContext(data + '\n' + gamejs + '\n' + sim, sb);
