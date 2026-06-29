// Iron Empire — random event system tests.
// Loads real data.js + game.js and validates the declarative event outcomes:
// scaling (level/income), cost capping, data integrity of all events. Run: `node tools/test_events.js`

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const JS = path.join(__dirname, '..', 'js');
const data = fs.readFileSync(path.join(JS, 'data.js'), 'utf8');
const gamejs = fs.readFileSync(path.join(JS, 'game.js'), 'utf8');

const test = `
let __pass = 0, __fail = 0;
function assert(cond, msg) { if (cond) { __pass++; } else { __fail++; console.log('  x FAIL: ' + msg); } }

// Minimal economy so getIncomePerSecond/getMaxMembers return sane values
game.mainNeighborhoodId = 'palermo'; game.branches = {};
game.equipment = { dumbbells:{level:5}, bench:{level:5} };
game.zones = { ground_floor:true };
game.members = 30; game.reputation = 100;

console.log('=== TEST 1: data integrity of all events ===');
assert(RANDOM_EVENTS.length >= 30, 'at least 30 events, got ' + RANDOM_EVENTS.length);
console.log('  total events: ' + RANDOM_EVENTS.length);
var badShape = 0, ids = {};
RANDOM_EVENTS.forEach(function(ev){
  if (!ev.id || !ev.title || !ev.icon || !ev.desc || !Array.isArray(ev.choices) || ev.choices.length < 1) badShape++;
  if (ids[ev.id]) { badShape++; console.log('  dup id: ' + ev.id); }
  ids[ev.id] = true;
  if (typeof ev.minLevel !== 'number') badShape++;
  ev.choices.forEach(function(c){
    if (!c.text) badShape++;
    // every choice must be resolvable: deterministic deltas, a gamble, a special, or an explicit no-op
    var hasDet = ('money' in c)||('rep' in c)||('xp' in c)||('members' in c)||c.special;
    if (!hasDet && !c.gamble) { /* allowed: pure no-op choice (Ignorar) */ }
    if (c.gamble) { if (!c.gamble.win || !c.gamble.lose || typeof c.gamble.p !== 'number') { badShape++; console.log('  bad gamble in ' + ev.id); } }
  });
});
assert(badShape === 0, badShape + ' malformed event/choice fields');

console.log('=== TEST 2: every choice resolves + applies without error at low AND high level ===');
[2, 12, 25].forEach(function(lvl){
  game.level = lvl;
  RANDOM_EVENTS.forEach(function(ev){
    ev.choices.forEach(function(c){
      try {
        if (c.gamble) { resolveEventSpec(c.gamble.win); resolveEventSpec(c.gamble.lose); }
        else { var d = resolveEventSpec(c); fmtEventDeltas(d, c.special); }
      } catch(e) { __fail++; console.log('  x resolve threw in ' + ev.id + ' @lvl' + lvl + ': ' + e.message); }
    });
  });
});
assert(true, 'resolve pass');
console.log('  resolved all choices @ levels 2/12/25 without errors');

console.log('=== TEST 3: outcomes scale with level ===');
game.level = 2;  game.equipment = { dumbbells:{level:2} }; var repLow = evRep(2), xpLow = evXp(2);
game.level = 25; var repHi = evRep(2), xpHi = evXp(2);
assert(repHi > repLow * 3, 'rep scales with level (' + repLow + ' -> ' + repHi + ')');
assert(xpHi > xpLow * 3, 'xp scales with level (' + xpLow + ' -> ' + xpHi + ')');
console.log('  rep tier2: lvl2=' + repLow + ' lvl25=' + repHi + ' | xp tier2: lvl2=' + xpLow + ' lvl25=' + xpHi);

console.log('=== TEST 4: money cost is capped as % of cash (never bankrupts) ===');
game.level = 20; game.money = 1000; // small cash, big income would push raw cost high
var cost1 = evMoney(-1), cost2 = evMoney(-2), cost3 = evMoney(-3);
assert(-cost1 <= game.money, 'tier1 cost <= cash (' + cost1 + ' vs ' + game.money + ')');
assert(-cost2 <= game.money, 'tier2 cost <= cash (' + cost2 + ')');
assert(-cost3 <= game.money, 'tier3 cost <= cash (' + cost3 + ')');
console.log('  with $1000 cash: costs = ' + cost1 + ', ' + cost2 + ', ' + cost3 + ' (all within cash)');

console.log('=== TEST 5: money gain scales with income ===');
game.level = 10; game.equipment = { dumbbells:{level:1} }; var gLow = evMoney(2);
game.equipment = { dumbbells:{level:20}, spa:{level:20} }; var gHi = evMoney(2);
assert(gHi > gLow, 'gain scales up with income (' + gLow + ' -> ' + gHi + ')');
console.log('  tier2 gain: lowIncome=' + gLow + ' highIncome=' + gHi);

console.log('=== TEST 6: applyEventDeltas mutates state correctly ===');
game.level = 10; game.money = 100000; game.reputation = 50; game.members = 10; game.maxMembers = 500;
var before = game.money;
applyEventDeltas({ money: 5000, rep: 20, xp: 0, members: 3 });
assert(game.money === before + 5000, 'money applied');
assert(game.reputation === 70, 'rep applied');
assert(game.members === 13, 'members applied');
applyEventDeltas({ money: -999999999, rep: 0, xp: 0, members: 0 });
assert(game.money === 0, 'money clamps at 0 (no negative)');

console.log('\\n=== RESULT: ' + __pass + ' passed, ' + __fail + ' failed ===');
if (__fail > 0) throw new Error('TESTS FAILED');
`;

const sandbox = {
  Math, JSON, console, Date,
  showToast: () => {}, addLog: () => {}, renderAll: () => {}, updateUI: () => {},
  renderCityMap: () => {}, saveGame: () => {}, checkAchievements: () => {}, checkMissionProgress: () => {},
  document: { getElementById: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: () => {} },
  window: { addEventListener: () => {} },
  setInterval: () => 0, setTimeout: () => 0,
};
vm.createContext(sandbox);
vm.runInContext(data + '\n' + gamejs + '\n' + test, sandbox);
