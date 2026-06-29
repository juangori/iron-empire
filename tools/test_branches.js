// Iron Empire — branch/franchise logic regression tests.
// Loads the REAL data.js + game.js in a sandbox and asserts the passive-franchise
// formulas + save migration behave as designed. Run: `node tools/test_branches.js`
// Exits non-zero if any assertion fails (CI-friendly).

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const JS = path.join(__dirname, '..', 'js');

const data = fs.readFileSync(path.join(JS, 'data.js'), 'utf8');
const gamejs = fs.readFileSync(path.join(JS, 'game.js'), 'utf8');

const test = `
let __pass = 0, __fail = 0;
function assert(cond, msg) { if (cond) { __pass++; } else { __fail++; console.log('  x FAIL: ' + msg); } }

console.log('=== TEST 1: passive income formula ===');
game.prestigeStars = 0;
game.branches = { branch_1: { id:'branch_1', neighborhoodId:'la_boca', name:'Test', level:1, openedAt:0 } };
game.mainNeighborhoodId = 'palermo';
var expectedL1 = 500000 / 1500;
var incL1 = getBranchPassiveIncome('branch_1');
assert(Math.abs(incL1 - expectedL1) < 0.01, 'La Boca lvl1 income exp ' + expectedL1 + ' got ' + incL1);
console.log('  La Boca Nv.1 income/s = ' + incL1.toFixed(2));
game.branches.branch_1.level = 2;
var incL2 = getBranchPassiveIncome('branch_1');
assert(Math.abs(incL2 - expectedL1*1.25) < 0.01, 'lvl2 +25% got ' + incL2);
console.log('  La Boca Nv.2 income/s = ' + incL2.toFixed(2));
game.prestigeStars = 4; game.branches.branch_1.level = 1;
var incStar = getBranchPassiveIncome('branch_1');
assert(Math.abs(incStar - expectedL1) < 0.01, 'branches do NOT scale with stars (no compounding) got ' + incStar);
console.log('  La Boca Nv.1 w/4 stars = ' + incStar.toFixed(2) + ' (unchanged — no star compounding)');
game.prestigeStars = 0;

console.log('=== TEST 2: upgrade cost ===');
game.branches.branch_1.level = 1;
var up1 = getBranchUpgradeCost('branch_1');
assert(up1 === Math.ceil(500000*0.5*1), 'up lvl1 250000 got ' + up1);
game.branches.branch_1.level = 2;
var up2 = getBranchUpgradeCost('branch_1');
assert(up2 === Math.ceil(500000*0.5*2), 'up lvl2 500000 got ' + up2);
console.log('  upgrade costs: ' + up1 + ', ' + up2);

console.log('=== TEST 3: prestige stars (slower curve, divisor 8M, cap 10) ===');
game.totalMoneyEarned = 0;  assert(getPrestigeStars()===0, '0 earned 0 stars');
game.totalMoneyEarned = 2000000; assert(getPrestigeStars()===0, '2M=0 (below 8M threshold) got ' + getPrestigeStars());
game.totalMoneyEarned = 8000000; assert(getPrestigeStars()===1, '8M=1 got ' + getPrestigeStars());
game.totalMoneyEarned = 32000000; assert(getPrestigeStars()===2, '32M=2 got ' + getPrestigeStars());
game.totalMoneyEarned = 1e12; assert(getPrestigeStars()===10, 'huge total caps at 10 got ' + getPrestigeStars());
console.log('  32M=2 stars, 1e12 caps at ' + getPrestigeStars());

console.log('=== TEST 4: getTotalGymCount ===');
game.branches = { branch_1:{neighborhoodId:'la_boca',level:1}, branch_2:{neighborhoodId:'caballito',level:1} };
assert(getTotalGymCount()===3, 'main+2=3 got ' + getTotalGymCount());

console.log('=== TEST 5: migration from old active-swap save ===');
game.activeBranch = 'branch_0';
game.mainNeighborhoodId = undefined;
game.branches = {
  branch_0: { neighborhoodId:'palermo', gymName:'Principal', equipment:{dumbbells:{level:5}}, level:12 },
  branch_2: { neighborhoodId:'recoleta', gymName:'Recoleta Gym', equipment:{dumbbells:{level:10},cardio:{level:10},bench:{level:10}}, level:8 },
};
migrateBranchesToPassive();
assert(game.mainNeighborhoodId==='palermo', 'main hood palermo got ' + game.mainNeighborhoodId);
assert(game.activeBranch===undefined, 'activeBranch deleted');
assert(!game.branches.branch_0, 'active branch removed');
assert(!!game.branches.branch_2, 'other branch kept');
var mig = game.branches.branch_2;
assert(mig.name==='Recoleta Gym', 'name preserved ' + mig.name);
assert(mig.neighborhoodId==='recoleta', 'hood preserved');
assert(typeof mig.level==='number' && mig.level>=1 && mig.level<=10, 'level in range ' + mig.level);
assert(mig.equipment===undefined, 'full state stripped');
console.log('  migrated branch_2 => ' + JSON.stringify(mig));
game.prestigeStars = 0;
console.log('  migrated Recoleta income/s = ' + getBranchPassiveIncome('branch_2').toFixed(2) + ' (Nv.' + mig.level + ')');
assert(getBranchPassiveIncome('branch_2') > 0, 'migrated earns income');

console.log('=== TEST 6: normalizeBranchesOnLoad (cloud path) pools money + no double-count ===');
game.activeBranch = 'branch_0';
game.mainNeighborhoodId = undefined;
game.money = 1000;
game.branches = {
  branch_0: { neighborhoodId:'palermo', gymName:'Principal', equipment:{dumbbells:{level:5}}, level:10, money:0 },
  branch_2: { neighborhoodId:'la_boca', gymName:'Boca', equipment:{dumbbells:{level:5}}, level:5, money:7500 },
};
normalizeBranchesOnLoad();
assert(game.money === 1000 + 7500, 'pooled inactive money into wallet got ' + game.money);
assert(game.activeBranch === undefined, 'activeBranch cleared');
assert(!game.branches.branch_0, 'main gym dup removed (prevents double-count)');
assert(Object.keys(game.branches).length === 1, 'only 1 passive branch remains');
assert(game.mainNeighborhoodId === 'palermo', 'main hood set');
console.log('  wallet after pooling = ' + game.money + ', branches = ' + JSON.stringify(Object.keys(game.branches)));

console.log('=== TEST 7: idempotent on already-migrated save ===');
var before = JSON.stringify(game.branches);
var moneyBefore = game.money;
normalizeBranchesOnLoad(); // run again
assert(JSON.stringify(game.branches) === before, 'branches unchanged on 2nd run');
assert(game.money === moneyBefore, 'money unchanged on 2nd run (no re-pooling)');
console.log('  second run stable');

console.log('\\n=== RESULT: ' + __pass + ' passed, ' + __fail + ' failed ===');
if (__fail > 0) throw new Error('TESTS FAILED');
`;

const sandbox = {
  Math, JSON, console, Date,
  showToast: () => {}, addLog: () => {}, renderAll: () => {}, updateUI: () => {},
  renderCityMap: () => {}, saveGame: () => {}, checkAchievements: () => {},
  document: { getElementById: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: () => {} },
  window: { addEventListener: () => {} },
  setInterval: () => 0, setTimeout: () => 0,
};
vm.createContext(sandbox);
vm.runInContext(data + '\n' + gamejs + '\n' + test, sandbox);
