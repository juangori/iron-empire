// ===== IRON EMPIRE - GAME ENGINE =====

let game = {
  gymName: 'My Gym',
  money: 0,
  totalMoneyEarned: 0,
  members: 0,
  maxMembers: 10,
  reputation: 0,
  level: 1,
  xp: 0,
  xpToNext: 100,
  prestigeStars: 0,
  branches: {},
  mainNeighborhoodId: 'palermo',
  branchCount: 0,
  equipment: {},
  staff: {},
  competitions: {},
  achievements: {},
  classes: {},
  instructors: {},
  marketing: {},
  log: [],
  tickCount: 0,
  started: false,
  tutorialDone: false,
  tutorialStep: 0,

  // Daily bonus
  dailyBonus: {
    streak: 0,
    lastClaim: null,
    claimedToday: false
  },

  // Daily missions
  dailyMissions: {
    missions: [],
    lastReset: null,
    progress: {}
  },

  // Daily mission tracking (resets daily)
  dailyTracking: {
    moneyEarned: 0,
    equipmentBought: 0,
    competitionsWon: 0,
    reputationGained: 0,
    classesRun: 0,
    campaignsLaunched: 0,
    xpEarned: 0,
    eventsHandled: 0,
    supplementsBought: 0,
  },

  // Supplements
  supplements: {},

  // Rivals
  rivals: {},

  // Skill tree
  skills: {},

  // Fame / prestige shop (reputation is spent here)
  reputationSpent: 0,   // total rep spent — lifetime = reputation + reputationSpent
  famePerks: {},        // { perkId: level }
  fameBoosts: {},       // { boostId: expiresAtTimestamp }
  fameUnlocks: {},      // { unlockId: true }

  // Gym zones
  zones: { ground_floor: true },
  zoneBuilding: {},

  // Champion
  champion: {
    recruited: false,
    name: 'Champion',
    stats: { fuerza: 1, resistencia: 1, velocidad: 1, tecnica: 1, stamina: 1, mentalidad: 1 },
    level: 1,
    xp: 0,
    fatigue: 0,
    equipment: { hands: null, waist: null, feet: null, head: null },
    trainingUntil: 0,
    trainingStat: null,
    wins: 0,
    losses: 0,
    injuredUntil: 0,
    injurySeverity: 0,
  },

  // Grand Tournaments (high-risk champion circuit)
  grandTournaments: {},   // { id: { wins, losses, cooldownUntil } }
  grandPrep: {},          // { id: { pasajes, nutricion, medico, concentracionUntil } }

  // Opportunities / risky ventures (same loop, at the gym level)
  opportunities: {},      // { id: { wins, losses, cooldownUntil } }
  oppPrep: {},            // { id: { permisos, contactos, seguro, duediligenceUntil } }
  gymSetback: { active: false, name: '', icon: '', until: 0, incomeMult: 1 },

  // VIP members
  vipMembers: [],
  lastVipTime: 0,
  nextVipIn: 300,

  // Random events
  lastEventTime: 0,
  nextEventIn: 180,

  // Operating costs
  ownProperty: false,

  // Profile
  profile: {
    activeTitle: 'principiante'
  },

  // Gym decoration
  decoration: {
    theme: 'classic',
    unlockedThemes: ['classic'],
    items: {}
  },

  // Skill research timer (one at a time)
  skillResearching: null, // { skillId, until }

  // Tab visit tracking (for reminders)
  tabLastVisited: {},
  // First-visit walkthrough tracking
  tabsSeen: {},

  // Lifetime stats
  stats: {
    classesCompleted: 0,
    campaignsLaunched: 0,
    missionsCompleted: 0,
    skillsResearched: 0,
    zonesUnlocked: 1,
    vipsServed: 0,
    eventsHandled: 0,
    supplementsBought: 0,
    rivalsDefeated: 0,
    totalPlayTime: 0,
    daysPlayed: 0,
    equipRepaired: 0,
    staffHealed: 0,
    equipBreakdowns: 0,
    staffIllnesses: 0,
    competitionsWon: 0,
    championWins: 0,
    championCompetitions: 0,
    championTrainings: 0,
    maxMembers: 0,
    maxStreak: 0,
    prestigeCount: 0,
    instructorsHired: 0,
    instructorUpgrades: 0,
  }
};

// ===== BRANCH SYSTEM (passive franchise — idle model) =====
// You actively manage ONE gym (game.* directly), located in game.mainNeighborhoodId.
// Other branches are lightweight PASSIVE income nodes — no switching, no per-branch level.
// game.branches = { branch_1: { id, neighborhoodId, name, level, openedAt } }

// Tuning (easy to balance)
var BRANCH_INCOME_PAYBACK = 1500; // a level-1 branch returns its unlock cost in ~this many seconds
var BRANCH_LEVEL_STEP = 0.25;     // each "Ampliar" level adds +25% passive income
var BRANCH_UPGRADE_BASE = 0.5;    // upgrade cost = unlockCost * BRANCH_UPGRADE_BASE * currentLevel

function branchIncomeBasis(hood) {
  return (hood && hood.unlockCost) ? hood.unlockCost : 250000;
}

function getNeighborhoodForBranch(branchId) {
  var branch = game.branches[branchId];
  if (!branch || !branch.neighborhoodId) return NEIGHBORHOODS[0];
  return NEIGHBORHOODS.find(function(n) { return n.id === branch.neighborhoodId; }) || NEIGHBORHOODS[0];
}

function getActiveNeighborhood() {
  var nId = game.mainNeighborhoodId || 'palermo';
  return NEIGHBORHOODS.find(function(n) { return n.id === nId; }) || NEIGHBORHOODS[0];
}

function getTotalGymCount() {
  return 1 + Object.keys(game.branches || {}).length;
}

function getBranchPassiveIncome(branchId) {
  var branch = game.branches[branchId];
  if (!branch) return 0;
  var hood = NEIGHBORHOODS.find(function(n) { return n.id === branch.neighborhoodId; }) || NEIGHBORHOODS[0];
  var level = branch.level || 1;
  // Intentionally does NOT scale with franchise stars — avoids stars×branches runaway compounding.
  var perSec = (branchIncomeBasis(hood) / BRANCH_INCOME_PAYBACK) * (1 + (level - 1) * BRANCH_LEVEL_STEP);
  return Math.max(0, perSec);
}

function getBranchUpgradeCost(branchId) {
  var branch = game.branches[branchId];
  if (!branch) return 0;
  var hood = NEIGHBORHOODS.find(function(n) { return n.id === branch.neighborhoodId; }) || NEIGHBORHOODS[0];
  var level = branch.level || 1;
  return Math.ceil(branchIncomeBasis(hood) * BRANCH_UPGRADE_BASE * level);
}

function getTotalEmpireIncomePerSecond() {
  var total = getIncomePerSecond(); // active main gym income
  Object.keys(game.branches || {}).forEach(function(id) {
    total += getBranchPassiveIncome(id);
  });
  return total;
}

function migrateBranchesToPassive() {
  // Convert the old "active branch swap" save into the passive franchise model.
  var oldBranches = game.branches || {};
  var activeId = game.activeBranch;
  // The main gym keeps the neighborhood of whatever branch was active when saved
  if (activeId && oldBranches[activeId] && oldBranches[activeId].neighborhoodId) {
    game.mainNeighborhoodId = oldBranches[activeId].neighborhoodId;
  } else {
    game.mainNeighborhoodId = game.mainNeighborhoodId || 'palermo';
  }
  var newBranches = {};
  Object.keys(oldBranches).forEach(function(id) {
    if (id === activeId) return;
    var b = oldBranches[id];
    if (!b || !b.neighborhoodId) return;
    // Derive an investment level from how developed the old branch was
    var eqLevels = 0;
    if (b.equipment) Object.keys(b.equipment).forEach(function(k) { eqLevels += (b.equipment[k] && b.equipment[k].level) || 0; });
    var lvl = Math.max(1, Math.min(10, Math.round(eqLevels / 5)));
    newBranches[id] = { id: id, neighborhoodId: b.neighborhoodId, name: b.gymName || 'Branch', level: lvl, openedAt: 0 };
  });
  game.branches = newBranches;
  delete game.activeBranch;
}

// Run after EVERY load (localStorage or cloud) so old saves migrate and new fields exist. Idempotent.
function normalizeBranchesOnLoad() {
  if (game.activeBranch) {
    // Pool any leftover per-branch money into the global wallet first
    Object.keys(game.branches || {}).forEach(function(id) {
      if (id !== game.activeBranch && game.branches[id] && game.branches[id].money > 0) {
        game.money = (game.money || 0) + game.branches[id].money;
      }
    });
    migrateBranchesToPassive();
  }
  if (!game.mainNeighborhoodId) game.mainNeighborhoodId = 'palermo';
  if (!game.branches) game.branches = {};
  if (!game.branchCount) game.branchCount = Object.keys(game.branches).length + 1;
}

// ===== UTILITY FUNCTIONS =====
function fmt(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString('en-US');
}

function fmtMoney(n) { return '$' + fmt(n); }

function fmtTime(seconds) {
  if (seconds < 60) return seconds + 's';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return h + 'h ' + (rm > 0 ? rm + 'm' : '');
  }
  return m + 'm ' + (s > 0 ? s + 's' : '');
}

function getDateString(date) {
  const d = date || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// ===== SKILL HELPERS =====
function hasSkill(skillId) {
  return !!game.skills[skillId];
}

function getSkillEffect(effectName, defaultVal) {
  let val = defaultVal !== undefined ? defaultVal : 1;
  Object.values(SKILL_TREE).forEach(branch => {
    branch.skills.forEach(skill => {
      if (game.skills[skill.id] && skill.effect[effectName]) {
        if (defaultVal === 1 || defaultVal === undefined) {
          val *= skill.effect[effectName];
        } else {
          val += skill.effect[effectName];
        }
      }
    });
  });
  return val;
}

// ===== COST CALCULATIONS =====
function getEquipCost(equip, level) {
  let cost = equip.baseCost * Math.pow(equip.costMult, level);
  if (game.staff.manager?.hired) {
    var mgrDef = STAFF.find(s => s.id === 'manager');
    // costReduction stacks across manager copies (skips sick/training) + scales with level, capped 60%
    cost *= (1 - Math.min(0.6, getStaffTotalEffect(mgrDef, 'costReduction')));
  }
  cost *= getSkillEffect('equipCostMult');
  // Fama: perk "Proveedores Premium" reduce costos
  cost *= (1 - getFameCostReduction());
  return Math.ceil(cost);
}

function getStaffCost(staff, copyIndex) {
  let cost = staff.costBase;
  if (copyIndex && copyIndex > 0) cost *= Math.pow(3, copyIndex); // 2nd=x3, 3rd=x9
  if (game.staff.manager?.hired && staff.id !== 'manager') cost *= 0.8;
  cost *= getSkillEffect('staffCostMult');
  return Math.ceil(cost);
}

// ===== STAFF TRAINING SYSTEM =====
function normalizeStaffData() {
  STAFF.forEach(function(s) {
    var state = game.staff[s.id];
    if (state && state.hired) {
      if (!state.level) state.level = 1;
      if (!state.trainingUntil) state.trainingUntil = 0;
      if (!state.sickUntil) state.sickUntil = 0;
      if (!state.extras) state.extras = [];
      state.extras.forEach(function(ex) {
        if (!ex.level) ex.level = 1;
        if (!ex.trainingUntil) ex.trainingUntil = 0;
        if (!ex.sickUntil) ex.sickUntil = 0;
      });
    }
  });
}

function getStaffLevelMult(level) {
  // Effect multiplier: level 1=1.0, 2=1.2, 3=1.4, 4=1.6, 5=1.8
  return 1 + ((level || 1) - 1) * 0.2;
}

function getStaffSalaryAtLevel(baseSalary, level) {
  // Salary scaling: level 1=1.0, 2=1.3, 3=1.6, 4=1.9, 5=2.2
  return baseSalary * (1 + ((level || 1) - 1) * 0.3);
}

function isStaffTraining(staffId, copyIdx) {
  var state = game.staff[staffId];
  if (!state || !state.hired) return false;
  if (copyIdx === undefined || copyIdx === 0) {
    return state.trainingUntil && Date.now() < state.trainingUntil;
  }
  var extra = state.extras && state.extras[copyIdx - 1];
  return extra && extra.trainingUntil && Date.now() < extra.trainingUntil;
}

function getStaffCopyLevel(staffId, copyIdx) {
  var state = game.staff[staffId];
  if (!state || !state.hired) return 0;
  if (copyIdx === 0 || copyIdx === undefined) return state.level || 1;
  var extra = state.extras && state.extras[copyIdx - 1];
  return extra ? (extra.level || 1) : 0;
}

function getTrainingCost(staffDef, currentLevel) {
  return Math.ceil(staffDef.salary * 10 * (currentLevel + 1));
}

function getTrainingDuration(nextLevel) {
  // level^2 * 60 seconds: lvl2=4min, lvl3=9min, lvl4=16min, lvl5=25min
  return nextLevel * nextLevel * 60;
}

function trainStaff(id, copyIdx) {
  var s = STAFF.find(function(st) { return st.id === id; });
  if (!s) return;
  var state = game.staff[id];
  if (!state || !state.hired) return;

  // Check concurrent training limit (max 2)
  var trainingCount = 0;
  STAFF.forEach(function(st) {
    var st2 = game.staff[st.id];
    if (st2 && st2.hired) {
      if (st2.trainingUntil && Date.now() < st2.trainingUntil) trainingCount++;
      if (st2.extras) {
        st2.extras.forEach(function(ex) {
          if (ex.trainingUntil && Date.now() < ex.trainingUntil) trainingCount++;
        });
      }
    }
  });
  if (trainingCount >= 2) {
    showToast('❌', '2 training sessions are already in progress!');
    return;
  }

  var level, target;
  if (copyIdx === 0 || copyIdx === undefined) {
    level = state.level || 1;
    target = state;
  } else {
    target = state.extras[copyIdx - 1];
    if (!target) return;
    level = target.level || 1;
  }

  if (level >= STAFF_MAX_LEVEL) {
    showToast('❌', 'Max level reached!');
    return;
  }

  var cost = getTrainingCost(s, level);
  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= cost;
  var duration = Math.ceil(getTrainingDuration(level + 1) * getSkillEffect('trainingSpeedMult'));
  target.trainingUntil = Date.now() + duration * 1000;

  addLog('📚 <span class="highlight">' + s.name + '</span> started training to LVL ' + (level + 1) + ' (' + Math.floor(duration / 60) + ' min)');
  showToast('📚', s.name + ' training → LVL ' + (level + 1));
  renderStaff();
  saveGame();
}

function hireExtraStaff(id) {
  var s = STAFF.find(function(st) { return st.id === id; });
  if (!s) return;
  var state = game.staff[id];
  if (!state || !state.hired) return;
  if (!state.extras) state.extras = [];

  var copyIdx = state.extras.length + 1; // 2nd or 3rd
  var reqLevel = STAFF_EXTRA_UNLOCK[copyIdx + 1]; // copyIdx+1 because extras[0] is the 2nd
  if (!reqLevel || game.level < reqLevel) return;

  var cost = getStaffCost(s, copyIdx);
  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= cost;
  state.extras.push({ level: 1, trainingUntil: 0 });
  addLog('🤝 You hired another <span class="highlight">' + s.name + '</span> (#' + (copyIdx + 1) + ')');
  showToast(s.icon, 'New ' + s.name + ' #' + (copyIdx + 1) + '!');
  renderStaff();
  renderGymScene();
  updateUI();
  saveGame();
}

function checkTrainingCompletion() {
  STAFF.forEach(function(s) {
    var state = game.staff[s.id];
    if (!state || !state.hired) return;
    // Main copy
    if (state.trainingUntil && Date.now() >= state.trainingUntil && state.trainingUntil > 0) {
      state.level = (state.level || 1) + 1;
      state.trainingUntil = 0;
      var xpGain = 25 * state.level;
      addXp(xpGain);
      game.dailyTracking.xpEarned += xpGain;
      addLog('🎓 <span class="highlight">' + s.name + '</span> leveled up to LVL ' + state.level + '!', 'important');
      showToast('🎓', s.name + ' → LVL ' + state.level + '!');
      renderStaff();
    }
    // Extras
    if (state.extras) {
      state.extras.forEach(function(ex, i) {
        if (ex.trainingUntil && Date.now() >= ex.trainingUntil && ex.trainingUntil > 0) {
          ex.level = (ex.level || 1) + 1;
          ex.trainingUntil = 0;
          var xpGain = 25 * ex.level;
          addXp(xpGain);
          game.dailyTracking.xpEarned += xpGain;
          addLog('🎓 <span class="highlight">' + s.name + ' #' + (i + 2) + '</span> leveled up to LVL ' + ex.level + '!');
          showToast('🎓', s.name + ' #' + (i + 2) + ' → LVL ' + ex.level + '!');
          renderStaff();
        }
      });
    }
  });
}

// Get total effect for a staff type (sum of all copies, scaled by level, 0 if training)
function getStaffTotalEffect(staffDef, effectKey) {
  var state = game.staff[staffDef.id];
  if (!state || !state.hired) return 0;
  var baseVal = staffDef[effectKey];
  if (!baseVal) return 0;

  var total = 0;
  // Main copy (skip if training or sick)
  if (!isStaffTraining(staffDef.id, 0) && !isStaffSick(staffDef.id, 0)) {
    total += baseVal * getStaffLevelMult(state.level || 1);
  }
  // Extra copies
  if (state.extras) {
    state.extras.forEach(function(ex, i) {
      if (!isStaffTraining(staffDef.id, i + 1) && !isStaffSick(staffDef.id, i + 1)) {
        total += baseVal * getStaffLevelMult(ex.level || 1);
      }
    });
  }
  return total;
}

// ===== CHAOS MECHANICS: EQUIPMENT BREAKDOWN =====
function normalizeEquipmentData() {
  EQUIPMENT.forEach(function(eq) {
    var state = game.equipment[eq.id];
    if (state && state.level > 0) {
      if (!state.brokenUntil) state.brokenUntil = 0;
      if (!state.upgradingUntil) state.upgradingUntil = 0;
    }
  });
  // Normalize zone building state
  if (!game.zoneBuilding) game.zoneBuilding = {};
}

function normalizeChampionData() {
  if (!game.champion) game.champion = {};
  if (game.champion.recruited === undefined) game.champion.recruited = false;
  if (!game.champion.name) game.champion.name = 'Champion';
  if (!game.champion.stats) game.champion.stats = {};
  // Init all 6 stats with defaults
  CHAMPION_STATS.forEach(function(s) {
    if (game.champion.stats[s] === undefined) game.champion.stats[s] = 1;
  });
  if (game.champion.level === undefined) game.champion.level = 1;
  if (game.champion.xp === undefined) game.champion.xp = 0;
  // Migrate energy → fatigue
  if (game.champion.fatigue === undefined) game.champion.fatigue = 0;
  delete game.champion.energy;
  delete game.champion.appearance;
  delete game.champion.previousStage;
  if (!game.champion.equipment) game.champion.equipment = { hands: null, waist: null, feet: null, head: null };
  if (!game.champion.trainingUntil) game.champion.trainingUntil = 0;
  if (!game.champion.trainingStat) game.champion.trainingStat = null;
  if (!game.champion.wins) game.champion.wins = 0;
  if (!game.champion.losses) game.champion.losses = 0;
  if (game.champion.injuredUntil === undefined) game.champion.injuredUntil = 0;
  if (game.champion.injurySeverity === undefined) game.champion.injurySeverity = 0;
  if (!game.stats.championWins) game.stats.championWins = 0;
  if (!game.stats.championLosses) game.stats.championLosses = 0;
  if (!game.stats.championCompetitions) game.stats.championCompetitions = 0;
  if (!game.stats.championTrainings) game.stats.championTrainings = 0;
  // Grand Tournaments
  if (!game.grandTournaments) game.grandTournaments = {};
  if (!game.grandPrep) game.grandPrep = {};
  if (!game.stats.grandWins) game.stats.grandWins = 0;
  if (!game.stats.grandLosses) game.stats.grandLosses = 0;
  if (!game.stats.championInjuries) game.stats.championInjuries = 0;
}

function normalizeOpportunityData() {
  if (!game.opportunities) game.opportunities = {};
  if (!game.oppPrep) game.oppPrep = {};
  if (!game.gymSetback || typeof game.gymSetback !== 'object') game.gymSetback = { active: false, name: '', icon: '', until: 0, incomeMult: 1 };
  if (game.gymSetback.active === undefined) game.gymSetback.active = false;
  if (!game.stats) game.stats = {};
  if (!game.stats.oppWins) game.stats.oppWins = 0;
  if (!game.stats.oppLosses) game.stats.oppLosses = 0;
  if (!game.stats.gymSetbacks) game.stats.gymSetbacks = 0;
}

function normalizeProfileData() {
  if (!game.profile) game.profile = { activeTitle: 'principiante' };
  if (!game.profile.activeTitle) game.profile.activeTitle = 'principiante';
  if (!game.decoration) game.decoration = { theme: 'classic', unlockedThemes: ['classic'], items: {} };
  if (!game.decoration.unlockedThemes) game.decoration.unlockedThemes = ['classic'];
  if (!game.decoration.items) game.decoration.items = {};
  if (!game.decoration.theme) game.decoration.theme = 'classic';
  if (!game.stats.maxMembers) game.stats.maxMembers = 0;
  if (!game.stats.maxStreak) game.stats.maxStreak = 0;
  if (!game.stats.prestigeCount) game.stats.prestigeCount = 0;
  if (!game.tabLastVisited) game.tabLastVisited = {};
  if (!game.tabsSeen) game.tabsSeen = {};
  if (game.skillResearching && (!game.skillResearching.skillId || !game.skillResearching.until)) {
    game.skillResearching = null;
  }
}

// ===== PROFILE & TITLES =====
function getUnlockedTitles() {
  return PLAYER_TITLES.filter(function(t) { return t.check(); });
}

function setActiveTitle(titleId) {
  var title = PLAYER_TITLES.find(function(t) { return t.id === titleId; });
  if (!title || !title.check()) return;
  game.profile.activeTitle = titleId;
  renderProfile();
  saveGame();
}

function getActiveTitle() {
  var t = PLAYER_TITLES.find(function(title) { return title.id === game.profile.activeTitle; });
  return t || PLAYER_TITLES[0];
}

// ===== GYM DECORATION =====
function buyTheme(themeId) {
  var theme = GYM_THEMES.find(function(t) { return t.id === themeId; });
  if (!theme) return;
  if (game.decoration.unlockedThemes.indexOf(themeId) >= 0) return;
  if (game.money < theme.cost || game.level < theme.reqLevel) return;
  game.money -= theme.cost;
  game.decoration.unlockedThemes.push(themeId);
  game.decoration.theme = themeId;
  applyTheme();
  addLog('🎨 You unlocked the <span class="highlight">' + theme.name + '</span> theme!');
  showToast(theme.icon, theme.name + ' theme unlocked!');
  renderDecorationPanel();
  updateUI();
  checkAchievements();
  saveGame();
}

function setTheme(themeId) {
  if (game.decoration.unlockedThemes.indexOf(themeId) < 0) return;
  game.decoration.theme = themeId;
  applyTheme();
  renderDecorationPanel();
  saveGame();
}

function applyTheme() {
  var theme = GYM_THEMES.find(function(t) { return t.id === game.decoration.theme; });
  if (!theme) theme = GYM_THEMES[0];
  var root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-glow', theme.accentGlow);
  root.style.setProperty('--accent-dark', theme.accentDark);
  root.style.setProperty('--bg-dark', theme.bgDark);
  root.style.setProperty('--bg-card', theme.bgCard);
}

function buyDecoration(itemId) {
  var item = GYM_DECORATIONS.find(function(d) { return d.id === itemId; });
  if (!item) return;
  if (game.decoration.items[itemId]) return;
  if (game.money < item.cost || game.level < item.reqLevel) return;
  game.money -= item.cost;
  game.decoration.items[itemId] = true;
  addLog('🎨 You bought <span class="highlight">' + item.name + '</span> ' + item.icon);
  showToast(item.icon, item.name + ' added to your gym!');
  renderDecorationPanel();
  renderGymScene();
  updateUI();
  checkAchievements();
  saveGame();
}

function getDecorationBonus(type) {
  var total = 0;
  GYM_DECORATIONS.forEach(function(item) {
    if (game.decoration.items[item.id] && item.bonuses[type]) {
      total += item.bonuses[type];
    }
  });
  return total;
}

function isEquipmentBroken(id) {
  var state = game.equipment[id];
  if (!state) return false;
  // brokenUntil = -1 means broken waiting for repair
  // brokenUntil = timestamp means repairing until that time
  return state.brokenUntil === -1 || (state.brokenUntil > 0 && Date.now() < state.brokenUntil);
}

function isEquipmentRepairing(id) {
  var state = game.equipment[id];
  return state && state.brokenUntil > 0 && Date.now() < state.brokenUntil;
}

function getRepairCost(equipDef, level) {
  var cost = Math.ceil(equipDef.baseCost * Math.pow(equipDef.costMult, level - 1) * 0.3);
  if (game.staff.manager?.hired && !isStaffTraining('manager', 0) && !isStaffSick('manager', 0)) {
    cost = Math.ceil(cost * 0.8);
  }
  return cost;
}

function getRepairDuration(level) {
  return 60 + level * 30; // seconds: lvl1=90s, lvl5=210s, lvl10=360s
}

function repairEquipment(id) {
  var eq = EQUIPMENT.find(function(e) { return e.id === id; });
  var state = game.equipment[id];
  if (!eq || !state || state.brokenUntil !== -1) return; // must be broken (not already repairing)

  // Check concurrent repair limit: 1 normally, 2 with manager
  var repairingCount = 0;
  EQUIPMENT.forEach(function(e) {
    if (isEquipmentRepairing(e.id)) repairingCount++;
  });
  var maxRepairs = (game.staff.manager?.hired && !isStaffTraining('manager', 0) && !isStaffSick('manager', 0)) ? 2 : 1;
  if (repairingCount >= maxRepairs) {
    showToast('❌', repairingCount + ' machine(s) are already under repair!');
    return;
  }

  var cost = getRepairCost(eq, state.level);
  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= cost;
  var duration = Math.ceil(getRepairDuration(state.level) * getSkillEffect('repairSpeedMult'));
  state.brokenUntil = Date.now() + duration * 1000;

  addLog('🔧 Repairing <span class="highlight">' + eq.name + '</span> (' + Math.floor(duration / 60) + ' min ' + (duration % 60) + 's)');
  showToast('🔧', 'Repairing ' + eq.name + '...');
  renderEquipment();
  saveGame();
}

function checkEquipmentBreakdown() {
  if (game.tickCount % 30 !== 0) return;

  // Cleaner reduces breakdown chance
  var cleanerReduction = 0;
  var cleanerDef = STAFF.find(function(s) { return s.id === 'cleaner'; });
  if (game.staff.cleaner?.hired) {
    cleanerReduction = 0.4 * getStaffLevelMult(game.staff.cleaner.level || 1);
    if (isStaffTraining('cleaner', 0) || isStaffSick('cleaner', 0)) cleanerReduction = 0;
    // Extra cleaners
    if (game.staff.cleaner.extras) {
      game.staff.cleaner.extras.forEach(function(ex, i) {
        if (!isStaffTraining('cleaner', i + 1) && !isStaffSick('cleaner', i + 1)) {
          cleanerReduction += 0.4 * getStaffLevelMult(ex.level || 1);
        }
      });
    }
  }
  cleanerReduction = Math.min(cleanerReduction, 0.9); // cap at 90%

  EQUIPMENT.forEach(function(eq) {
    var state = game.equipment[eq.id];
    if (!state || state.level <= 0) return;
    if (isEquipmentBroken(eq.id)) return; // already broken
    if (isEquipmentUpgrading(eq.id)) return; // being upgraded

    var baseChance = 0.003; // 0.3% per check
    // More expensive/advanced equipment breaks more often
    var tierBonus = EQUIPMENT.indexOf(eq) * 0.0003;
    var chance = (baseChance + tierBonus) * (1 - cleanerReduction) * getSkillEffect('breakdownChanceMult');

    if (Math.random() < chance) {
      state.brokenUntil = -1; // broken, waiting for repair
      game.stats.equipBreakdowns++;
      var repairCost = getRepairCost(eq, state.level);
      addLog('⚠️ <span class="highlight">' + eq.name + '</span> broke down! Repair: ' + fmtMoney(repairCost), 'critical');
      showToast('⚠️', eq.name + ' broke down!');
      renderEquipment();
    }
  });
}

function checkRepairCompletion() {
  EQUIPMENT.forEach(function(eq) {
    var state = game.equipment[eq.id];
    if (!state) return;
    if (state.brokenUntil > 0 && Date.now() >= state.brokenUntil) {
      state.brokenUntil = 0;
      game.stats.equipRepaired++;
      addLog('✅ <span class="highlight">' + eq.name + '</span> repaired and back in service!', 'important');
      showToast('✅', eq.name + ' repaired!');
      renderEquipment();
      updateUI();
    }
  });
}

// ===== CONSTRUCTION TIMERS =====
function getEquipUpgradeDuration(level) {
  // seconds: lvl 1→2: 20s, lvl 5→6: 100s, lvl 10→11: 200s, lvl 15→16: 300s
  return 20 * level;
}

function isEquipmentUpgrading(id) {
  var state = game.equipment[id];
  return state && state.upgradingUntil > 0 && Date.now() < state.upgradingUntil;
}

function getActiveEquipUpgrades() {
  var count = 0;
  EQUIPMENT.forEach(function(eq) {
    if (isEquipmentUpgrading(eq.id)) count++;
  });
  return count;
}

function getMaxConcurrentUpgrades() {
  var max = 1;
  if (game.staff.manager?.hired && !isStaffTraining('manager', 0) && !isStaffSick('manager', 0)) max = 2;
  max += getSkillEffect('extraConcurrentUpgrades', 0);
  return max;
}

function isZoneBuilding(zoneId) {
  return game.zoneBuilding && game.zoneBuilding[zoneId] && Date.now() < game.zoneBuilding[zoneId];
}

function getActiveZoneBuilds() {
  var count = 0;
  if (!game.zoneBuilding) return 0;
  Object.keys(game.zoneBuilding).forEach(function(zId) {
    if (Date.now() < game.zoneBuilding[zId]) count++;
  });
  return count;
}

function checkConstructionCompletion() {
  // Equipment upgrades
  EQUIPMENT.forEach(function(eq) {
    var state = game.equipment[eq.id];
    if (!state) return;
    if (state.upgradingUntil > 0 && Date.now() >= state.upgradingUntil) {
      state.upgradingUntil = 0;
      state.level++;
      addLog('🏗️ <span class="highlight">' + eq.name + '</span> upgraded to level ' + state.level + '!', 'important');
      showToast('⬆️', eq.name + ' — Level ' + state.level + '!');
      updateMembers();
      renderEquipment();
      renderGymScene();
      updateUI();
    }
  });
  // Zone builds
  if (game.zoneBuilding) {
    Object.keys(game.zoneBuilding).forEach(function(zId) {
      if (Date.now() >= game.zoneBuilding[zId]) {
        game.zones[zId] = true;
        delete game.zoneBuilding[zId];
        var zone = GYM_ZONES.find(function(z) { return z.id === zId; });
        if (zone) {
          game.stats.zonesUnlocked++;
          addLog('🏗️ Construction complete: <span class="highlight">' + zone.name + '</span>! ' + zone.icon, 'important');
          showToast(zone.icon, zone.name + ' is ready!');
          floatNumber('+' + zone.capacityBonus + ' capacity', 'var(--accent)');
        }
        updateMembers();
        renderAll();
        updateUI();
      }
    });
  }
}

// ===== SKILL RESEARCH TIMER =====
function getSkillResearchTime(cost) {
  // Scale research time based on skill cost
  // Cheap skills ($12K-$30K): 60-90s
  // Mid skills ($125K-$250K): 3-5 min
  // Expensive skills ($750K-$1.75M): 10-15 min
  // Very expensive ($5M-$15M): 20-30 min
  // Ultra ($40M-$75M): 45-60 min
  if (cost <= 30000) return 60;
  if (cost <= 200000) return 180;
  if (cost <= 1000000) return 420;
  if (cost <= 5000000) return 900;
  if (cost <= 20000000) return 1800;
  if (cost <= 50000000) return 2700;
  return 3600;
}

function checkSkillResearchCompletion() {
  if (!game.skillResearching) return;
  if (Date.now() >= game.skillResearching.until) {
    var skillId = game.skillResearching.skillId;
    game.skillResearching = null;

    // Find skill info
    var skillInfo = null;
    var branchKey = null;
    Object.entries(SKILL_TREE).forEach(function(entry) {
      entry[1].skills.forEach(function(s) {
        if (s.id === skillId) { skillInfo = s; branchKey = entry[0]; }
      });
    });

    game.skills[skillId] = true;
    game.stats.skillsResearched++;
    // XP scales with skill cost so endgame research stays meaningful for leveling (flat 80 was ~0.02% of an L25 level)
    var xpGain = Math.max(80, Math.round((skillInfo ? skillInfo.cost : 0) / 50000));
    addXp(xpGain);
    game.dailyTracking.xpEarned += xpGain;

    if (skillInfo) {
      addLog('🔬 Research complete: <span class="highlight">' + skillInfo.name + '</span> (' + SKILL_TREE[branchKey].name + ')', 'important');
      showToast(skillInfo.icon, 'Upgrade ready: ' + skillInfo.name + '!');
    }

    updateMembers();
    renderAll();
    saveGame();
  }
}

// ===== CHAOS MECHANICS: STAFF ILLNESS =====
function isStaffSick(staffId, copyIdx) {
  var state = game.staff[staffId];
  if (!state || !state.hired) return false;
  if (copyIdx === undefined || copyIdx === 0) {
    return state.sickUntil && Date.now() < state.sickUntil;
  }
  var extra = state.extras && state.extras[copyIdx - 1];
  return extra && extra.sickUntil && Date.now() < extra.sickUntil;
}

function getHealCost(staffDef, level) {
  return Math.ceil(getStaffSalaryAtLevel(staffDef.salary, level) * 5);
}

function healStaff(id, copyIdx) {
  var s = STAFF.find(function(st) { return st.id === id; });
  if (!s) return;
  var state = game.staff[id];
  if (!state || !state.hired) return;

  var target;
  if (copyIdx === 0 || copyIdx === undefined) {
    target = state;
  } else {
    target = state.extras && state.extras[copyIdx - 1];
  }
  if (!target || !target.sickUntil || Date.now() >= target.sickUntil) return;

  var lvl = target.level || 1;
  var cost = getHealCost(s, lvl);
  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= cost;
  target.sickUntil = 0;
  game.stats.staffHealed++;
  addLog('💊 <span class="highlight">' + s.name + '</span> recovered with medical treatment.');
  showToast('💊', s.name + ' healed!');
  renderStaff();
  updateUI();
  saveGame();
}

function checkStaffIllness() {
  if (game.tickCount % 60 !== 0) return;

  // Physio reduces illness chance
  var physioReduction = 0;
  if (game.staff.physio?.hired) {
    physioReduction = 0.5 * getStaffLevelMult(game.staff.physio.level || 1);
    if (isStaffTraining('physio', 0) || isStaffSick('physio', 0)) physioReduction = 0;
    if (game.staff.physio.extras) {
      game.staff.physio.extras.forEach(function(ex, i) {
        if (!isStaffTraining('physio', i + 1) && !isStaffSick('physio', i + 1)) {
          physioReduction += 0.5 * getStaffLevelMult(ex.level || 1);
        }
      });
    }
  }
  physioReduction = Math.min(physioReduction, 0.9); // cap at 90%

  var baseChance = 0.005; // 0.5% per check per staff
  var chance = baseChance * (1 - physioReduction) * getSkillEffect('sickChanceMult');

  STAFF.forEach(function(s) {
    var state = game.staff[s.id];
    if (!state || !state.hired) return;

    // Main copy
    if (!isStaffTraining(s.id, 0) && !isStaffSick(s.id, 0)) {
      if (Math.random() < chance) {
        var sickDuration = 180 + Math.floor(Math.random() * 300); // 3-8 min
        state.sickUntil = Date.now() + sickDuration * 1000;
        game.stats.staffIllnesses++;
        var healCost = getHealCost(s, state.level || 1);
        addLog('🤒 <span class="highlight">' + s.name + '</span> got sick! Heal: ' + fmtMoney(healCost), 'critical');
        showToast('🤒', s.name + ' got sick!');
        renderStaff();
      }
    }

    // Extra copies
    if (state.extras) {
      state.extras.forEach(function(ex, i) {
        if (!isStaffTraining(s.id, i + 1) && !isStaffSick(s.id, i + 1)) {
          if (Math.random() < chance) {
            var sickDuration = 180 + Math.floor(Math.random() * 300);
            ex.sickUntil = Date.now() + sickDuration * 1000;
            game.stats.staffIllnesses++;
            addLog('🤒 <span class="highlight">' + s.name + ' #' + (i + 2) + '</span> got sick!');
            showToast('🤒', s.name + ' #' + (i + 2) + ' got sick!');
            renderStaff();
          }
        }
      });
    }
  });
}

// ===== INCOME CALCULATION =====
function getIncomePerSecond() {
  let base = 0;
  EQUIPMENT.forEach(eq => {
    const lvl = game.equipment[eq.id]?.level || 0;
    if (isEquipmentBroken(eq.id)) return; // broken equipment earns nothing
    base += eq.incomePerLevel * lvl;
  });

  // Skill: equipment income mult
  base *= getSkillEffect('equipIncomeMult');

  let mult = 1;
  STAFF.forEach(s => {
    if (game.staff[s.id]?.hired && s.incomeMult) {
      mult += getStaffTotalEffect(s, 'incomeMult') * getSkillEffect('staffEffectMult');
    }
  });

  // Skill: staff synergy bonus (each hired staff gives % income)
  if (hasSkill('st_synergy')) {
    var hiredCount = 0;
    STAFF.forEach(function(s) {
      if (game.staff[s.id]?.hired) {
        hiredCount++;
        if (game.staff[s.id].extras) hiredCount += game.staff[s.id].extras.length;
      }
    });
    mult += hiredCount * SKILL_TREE.staff.skills.find(s => s.id === 'st_synergy').effect.staffSynergyBonus;
  }

  // Skill: member income mult
  const memberIncomeMult = getSkillEffect('memberIncomeMult');
  const memberBonus = Math.min(3.0, 1 + game.members * 0.002) * memberIncomeMult;

  const prestigeMult = 1 + (game.prestigeStars * 0.25);

  // Zone income bonus
  let zoneIncome = 0;
  GYM_ZONES.forEach(z => {
    if (game.zones[z.id]) zoneIncome += z.incomeBonus;
  });

  // Rival defeat bonus income
  const rivalIncome = getRivalIncomeBonus();

  // Supplement effects
  const suppEffects = getActiveSupplementEffects();
  if (suppEffects.equipIncomeMult !== 1) base *= suppEffects.equipIncomeMult;
  const totalIncome = (base + zoneIncome + rivalIncome) * mult * memberBonus * prestigeMult;
  // Decoration income bonus
  var decoIncome = getDecorationBonus('income');
  // Fame: passive floor (lifetime) × perks × unlocks × active boost. Setback: temporary penalty if a
  // venture went wrong (bad press / raid). Only affects the active gym, not the passive branches.
  return totalIncome * suppEffects.incomeMult * (1 + decoIncome) * getFameIncomeMult() * getGymSetbackIncomeMult();
}

// ===== SUPPLEMENT EFFECTS =====
// Tolerance multipliers per level: 0=100%, 1=85%, 2=65%, 3=45%
var TOLERANCE_MULTS = [1.0, 0.85, 0.65, 0.45];

function getActiveSupplementEffects() {
  var effects = { incomeMult: 1, equipIncomeMult: 1, classIncomeMult: 1, marketingMult: 1, capacityBonus: 0, repBonus: 0, repPerMin: 0 };
  var now = Date.now();
  SUPPLEMENTS.forEach(function(sup) {
    var state = game.supplements[sup.id];
    if (state && state.activeUntil && now < state.activeUntil) {
      var tolerance = Math.min(3, state.toleranceLevel || 0);
      var tMult = TOLERANCE_MULTS[tolerance];
      var e = sup.effects;
      // Scale bonus by tolerance (1.0 at 0, degrading toward 0.45 at 3)
      if (e.incomeMult) effects.incomeMult *= 1 + (e.incomeMult - 1) * tMult;
      if (e.equipIncomeMult) effects.equipIncomeMult *= 1 + (e.equipIncomeMult - 1) * tMult;
      if (e.classIncomeMult) effects.classIncomeMult *= 1 + (e.classIncomeMult - 1) * tMult;
      if (e.marketingMult) effects.marketingMult *= 1 + (e.marketingMult - 1) * tMult;
      if (e.capacityBonus) effects.capacityBonus += Math.round(e.capacityBonus * tMult);
      if (e.repBonus) effects.repBonus += Math.round(e.repBonus * tMult);
      if (e.repPerMin) effects.repPerMin += e.repPerMin * tMult;
    }
  });
  // Combo bonus: Protein + Creatine → +10% income
  var proteinActive = game.supplements['protein'] && now < game.supplements['protein'].activeUntil;
  var creatineActive = game.supplements['creatine'] && now < game.supplements['creatine'].activeUntil;
  if (proteinActive && creatineActive) effects.incomeMult *= 1.1;
  return effects;
}

// ===== FAME / REPUTATION SPENDING =====
// Reputation goes from a dead number to a currency. lifetime = spendable balance + spent,
// so spending does NOT lower the "passive floor" (which tracks your accumulated lifetime fame).

function getReputationLifetime() {
  return (game.reputation || 0) + (game.reputationSpent || 0);
}

// Real rep generation rate (mirror of repTick). Base for the shop's pricing.
function getReputationPerSecond() {
  var r = (game.members || 0) * 0.02 * getSkillEffect('memberRepMult');
  STAFF.forEach(function(s) {
    if (game.staff[s.id] && game.staff[s.id].hired && s.repMult) {
      r *= (1 + getStaffTotalEffect(s, 'repMult') * getSkillEffect('staffRepMult'));
    }
  });
  r *= (1 + getDecorationBonus('reputation'));
  return r;
}

// Passive floor: logarithmic income bonus from your ACCUMULATED (lifetime) fame.
// Grows smoothly from 1K to 20M+ without saturating. Cap +15% (or +30% with Legend).
function getReputationFloorBonus() {
  var life = getReputationLifetime();
  if (life <= 0) return 0;
  var cap = (game.fameUnlocks && game.fameUnlocks.unlock_legacy) ? 0.30 : 0.15;
  return Math.min(cap, 0.0125 * (Math.log(1 + life / 1000) / Math.log(2)));
}

function getFamePerkLevel(id) {
  return (game.famePerks && game.famePerks[id]) || 0;
}

// Additive sum of permanent perks for an effect key (income/cost/capacity/retention/vipspeed)
function getFamePerkEffect(key) {
  var total = 0;
  if (typeof FAME_SHOP === 'undefined') return 0;
  FAME_SHOP.perks.forEach(function(p) {
    if (p.effect && p.effect.key === key) total += (p.effect.perLevel || 0) * getFamePerkLevel(p.id);
  });
  return total;
}

// Multipliers from active temporary boosts
function getActiveFameBoosts() {
  var b = { incomeMult: 1, repMult: 1, classMult: 1, memberAttractMult: 1 };
  if (typeof FAME_SHOP === 'undefined' || !game.fameBoosts) return b;
  var now = Date.now();
  FAME_SHOP.boosts.forEach(function(bo) {
    var until = game.fameBoosts[bo.id];
    if (until && now < until && bo.effect) {
      if (bo.effect.incomeMult) b.incomeMult *= bo.effect.incomeMult;
      if (bo.effect.repMult) b.repMult *= bo.effect.repMult;
      if (bo.effect.classMult) b.classMult *= bo.effect.classMult;
      if (bo.effect.memberAttractMult) b.memberAttractMult *= bo.effect.memberAttractMult;
    }
  });
  return b;
}

function getFameUnlockIncome() {
  var m = 0;
  if (game.fameUnlocks) {
    if (game.fameUnlocks.unlock_sponsor) m += 0.15;
    if (game.fameUnlocks.unlock_legacy) m += 0.10;
  }
  return m;
}

// Total Fame income multiplier: passive floor × perks × unlocks × active boost
function getFameIncomeMult() {
  return (1 + getReputationFloorBonus())
    * (1 + getFamePerkEffect('income'))
    * (1 + getFameUnlockIncome())
    * getActiveFameBoosts().incomeMult;
}

// Cost reduction from the Premium Suppliers perk (capped for safety)
function getFameCostReduction() {
  return Math.min(0.5, getFamePerkEffect('cost'));
}

// ----- Shop costs (scale with the real rep generation rate) -----
function getFameRate() {
  return Math.max(1, getReputationPerSecond());
}
function getFameBoostCost(b) {
  return Math.ceil(getFameRate() * b.costSeconds);
}
function getFamePerkCost(p) {
  var lvl = getFamePerkLevel(p.id); // cost of the NEXT level
  return Math.ceil(getFameRate() * p.baseSeconds * Math.pow(p.growth, lvl));
}
function getFameUnlockCost(u) {
  return Math.ceil(getFameRate() * u.costSeconds);
}

// ----- Purchases (spend reputation) -----
function spendReputation(amount) {
  game.reputation = Math.max(0, game.reputation - amount);
  game.reputationSpent = (game.reputationSpent || 0) + amount;
}

function buyFameBoost(id) {
  var b = FAME_SHOP.boosts.find(function(x) { return x.id === id; });
  if (!b) return;
  var now = Date.now();
  if (game.fameBoosts[id] && now < game.fameBoosts[id]) { showToast('⏳', b.name + ' is already active!'); return; }
  var cost = getFameBoostCost(b);
  if (game.reputation < cost) { showToast('❌', 'Not enough reputation!'); return; }
  spendReputation(cost);
  game.fameBoosts[id] = now + b.duration * 1000;
  addLog('🌟 You activated <span class="highlight">' + b.name + '</span> (' + fmtTime(b.duration) + ') — cost ' + fmt(cost) + ' fame.', 'important');
  showToast(b.icon, b.name + ' activated!');
  updateUI(); renderFameShop(); saveGame();
}

function buyFamePerk(id) {
  var p = FAME_SHOP.perks.find(function(x) { return x.id === id; });
  if (!p) return;
  var lvl = getFamePerkLevel(id);
  if (lvl >= p.maxLevel) { showToast('✅', p.name + ' is maxed out!'); return; }
  var cost = getFamePerkCost(p);
  if (game.reputation < cost) { showToast('❌', 'Not enough reputation!'); return; }
  spendReputation(cost);
  game.famePerks[id] = lvl + 1;
  addLog('🌟 You upgraded <span class="highlight">' + p.name + '</span> to level ' + (lvl + 1) + ' — cost ' + fmt(cost) + ' fame.', 'important');
  showToast(p.icon, p.name + ' Lv' + (lvl + 1) + '!');
  updateUI(); renderFameShop(); saveGame();
}

function buyFameUnlock(id) {
  var u = FAME_SHOP.unlocks.find(function(x) { return x.id === id; });
  if (!u) return;
  if (game.fameUnlocks[id]) { showToast('✅', 'You already have it!'); return; }
  if (getReputationLifetime() < u.reqLifetime) { showToast('🔒', 'Requires ' + fmt(u.reqLifetime) + ' accumulated fame.'); return; }
  var cost = getFameUnlockCost(u);
  if (game.reputation < cost) { showToast('❌', 'Not enough reputation!'); return; }
  spendReputation(cost);
  game.fameUnlocks[id] = true;
  addLog('👑 You unlocked <span class="highlight">' + u.name + '</span> — cost ' + fmt(cost) + ' fame.', 'important');
  showToast(u.icon, u.name + ' unlocked!');
  updateUI(); renderFameShop(); saveGame();
}

function normalizeFameData() {
  if (typeof game.reputationSpent !== 'number') game.reputationSpent = 0;
  if (!game.famePerks) game.famePerks = {};
  if (!game.fameBoosts) game.fameBoosts = {};
  if (!game.fameUnlocks) game.fameUnlocks = {};
}

function getSupplementCost(sup) {
  // Base cost scales with player level: +15% per level above reqLevel
  var levelScale = 1 + Math.max(0, game.level - sup.reqLevel) * 0.15;
  var cost = Math.ceil(sup.cost * levelScale);
  if (game.staff.manager && game.staff.manager.hired) cost = Math.ceil(cost * 0.8);
  return cost;
}

function getRivalPromoCost(rival) {
  var levelScale = 1 + Math.max(0, game.level - rival.reqLevel) * 0.2;
  var cost = Math.ceil(rival.promoCost * levelScale);
  if (game.staff.manager && game.staff.manager.hired) cost = Math.ceil(cost * 0.8);
  return cost;
}

function getRivalDefeatCost(rival) {
  var levelScale = 1 + Math.max(0, game.level - rival.reqLevel) * 0.2;
  var cost = Math.ceil(rival.defeatCost * levelScale);
  if (game.staff.manager && game.staff.manager.hired) cost = Math.ceil(cost * 0.8);
  return cost;
}

function buySupplement(id) {
  var sup = SUPPLEMENTS.find(function(s) { return s.id === id; });
  if (!sup) return;

  if (game.level < sup.reqLevel) return;

  var state = game.supplements[id];
  if (state && state.activeUntil && Date.now() < state.activeUntil) {
    showToast('❌', "It's already active!");
    return;
  }

  var cost = getSupplementCost(sup);

  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= cost;
  var prevTolerance = (game.supplements[id] && game.supplements[id].toleranceLevel) || 0;
  game.supplements[id] = {
    activeUntil: Date.now() + sup.duration * 1000,
    toleranceLevel: Math.min(3, prevTolerance + 1),
    lastUsedTick: game.tickCount,
  };

  if (sup.effects.repBonus) {
    game.reputation += sup.effects.repBonus;
    game.dailyTracking.reputationGained += sup.effects.repBonus;
  }

  game.stats.supplementsBought++;
  game.dailyTracking.supplementsBought++;

  var xpGain = 15;
  addXp(xpGain);
  game.dailyTracking.xpEarned += xpGain;

  updateMembers();

  addLog('🧃 Supplement <span class="highlight">' + sup.name + '</span> activated! Duration: ' + fmtTime(sup.duration));
  showToast(sup.icon, sup.name + ' activated!');

  renderSupplements();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

// Reduce supplement tolerance by 1 per game day of inactivity (called every 600 ticks)
function supplementToleranceDecay() {
  var now = Date.now();
  SUPPLEMENTS.forEach(function(sup) {
    var state = game.supplements[sup.id];
    if (!state || !state.toleranceLevel) return;
    // Don't decay while still active
    if (state.activeUntil && now < state.activeUntil) return;
    // Decay once per game day of inactivity since last use
    var ticksSinceUse = game.tickCount - (state.lastUsedTick || 0);
    if (ticksSinceUse >= 600) {
      state.toleranceLevel = Math.max(0, state.toleranceLevel - 1);
      state.lastUsedTick = game.tickCount;
    }
  });
}

// ===== RIVAL GYMS =====
function getRivalMemberSteal() {
  var total = 0;
  RIVAL_GYMS.forEach(function(r) {
    if (game.level < r.reqLevel) return;
    var state = game.rivals[r.id];
    if (state && state.defeated) return;
    if (state && state.promoUntil && Date.now() < state.promoUntil) return;
    total += r.memberSteal;
  });
  return total;
}

// Rival steal as a REAL % of members (mirror of getMembersAttracted), so it displays consistently.
// The steal is NOT a flat number: it's a % of the member pool, capped at 30%, reduced by Brand Loyalty.
function getRivalStealInfo() {
  var totalSteal = getRivalMemberSteal();
  var stealMult = getSkillEffect('rivalStealMult');
  var retention = (typeof getFamePerkEffect === 'function') ? getFamePerkEffect('retention') : 0;
  var pct = Math.min(0.30, totalSteal * 0.0025 * stealMult) * (1 - retention);
  var members = game.members || 0;
  return { totalSteal: totalSteal, pct: pct, lost: Math.round(members * pct), members: members, capped: (totalSteal * 0.0025 * stealMult) > 0.30 };
}

// % of members stolen by a SINGLE rival (standalone, without the total cap) — for the card.
function getRivalStealPct(rival) {
  var stealMult = getSkillEffect('rivalStealMult');
  var retention = (typeof getFamePerkEffect === 'function') ? getFamePerkEffect('retention') : 0;
  return (rival.memberSteal || 0) * 0.0025 * stealMult * (1 - retention);
}

function getRivalIncomeBonus() {
  var total = 0;
  RIVAL_GYMS.forEach(function(r) {
    var state = game.rivals[r.id];
    if (state && state.defeated && r.defeatBonus.income) {
      total += r.defeatBonus.income;
    }
  });
  return total;
}

function getRivalCapacityBonus() {
  var total = 0;
  RIVAL_GYMS.forEach(function(r) {
    var state = game.rivals[r.id];
    if (state && state.defeated && r.defeatBonus.capacity) {
      total += r.defeatBonus.capacity;
    }
  });
  return total;
}

function launchRivalPromo(id) {
  var rival = RIVAL_GYMS.find(function(r) { return r.id === id; });
  if (!rival) return;

  if (game.level < rival.reqLevel) return;

  var state = game.rivals[id];
  if (state && state.defeated) return;
  if (state && state.promoUntil && Date.now() < state.promoUntil) {
    showToast('❌', 'You already have an active promo against this rival!');
    return;
  }

  var cost = getRivalPromoCost(rival);

  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= cost;
  if (!game.rivals[id]) game.rivals[id] = {};
  game.rivals[id].promoUntil = Date.now() + rival.promoDuration * 1000;

  var xpGain = 20;
  addXp(xpGain);
  game.dailyTracking.xpEarned += xpGain;

  updateMembers();

  addLog('🏪 Promo against <span class="highlight">' + rival.name + '</span>! Neutralized for ' + fmtTime(rival.promoDuration));
  showToast('📣', 'Promo against ' + rival.name + '!');

  renderRivals();
  updateUI();
  saveGame();
}

function defeatRival(id) {
  var rival = RIVAL_GYMS.find(function(r) { return r.id === id; });
  if (!rival) return;

  if (game.level < rival.reqLevel) return;

  var state = game.rivals[id];
  if (state && state.defeated) return;

  var cost = getRivalDefeatCost(rival);

  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  if (!confirm('Defeat ' + rival.name + ' for ' + fmtMoney(cost) + '? Permanent bonus on victory.')) return;

  game.money -= cost;
  if (!game.rivals[id]) game.rivals[id] = {};
  game.rivals[id].defeated = true;

  game.stats.rivalsDefeated++;

  var xpGain = 100;
  addXp(xpGain);
  game.dailyTracking.xpEarned += xpGain;

  var bonusParts = [];
  if (rival.defeatBonus.income) bonusParts.push('+' + rival.defeatBonus.income + ' income/s');
  if (rival.defeatBonus.capacity) bonusParts.push('+' + rival.defeatBonus.capacity + ' capacity');

  updateMembers();

  addLog('🏆 You defeated <span class="highlight">' + rival.name + '</span>! Bonus: ' + bonusParts.join(', '));
  showToast('🏆', rival.name + ' defeated!');

  renderRivals();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

// ===== STAFF SALARY CALCULATION =====
function getStaffSalaryPerSecond() {
  return getTotalStaffSalaryPerDay() / 600;
}

function getTotalStaffSalaryPerDay() {
  let total = 0;
  STAFF.forEach(s => {
    var state = game.staff[s.id];
    if (state?.hired && s.salary) {
      total += getStaffSalaryAtLevel(s.salary, state.level || 1);
      if (state.extras) {
        state.extras.forEach(function(ex) {
          total += getStaffSalaryAtLevel(s.salary, ex.level || 1);
        });
      }
    }
  });
  return total;
}

// ===== OPERATING COSTS =====
function getOperatingCostsPerDay() {
  let daily = 0;
  // Rent (unless property owned) - scales with player level and zones
  if (!game.ownProperty) {
    // Continuous rent ramp — no cliff. Soft grace slope to L5, then steeper per-level (no flat base jump).
    if (game.level <= 5) {
      daily += game.level * 800;
    } else {
      daily += (5 * 800) + (game.level - 5) * OPERATING_COSTS.rentPerLevel;
    }
    let extraZones = 0;
    GYM_ZONES.forEach(function(z) {
      if (z.id !== 'ground_floor' && game.zones[z.id]) extraZones++;
    });
    daily += extraZones * (OPERATING_COSTS.rentPerExtraZone + game.level * OPERATING_COSTS.rentZoneMultPerLevel);
  }
  // Utilities based on total equipment levels
  let totalEquipLevels = 0;
  EQUIPMENT.forEach(function(eq) {
    totalEquipLevels += (game.equipment[eq.id]?.level || 0);
  });
  daily += totalEquipLevels * OPERATING_COSTS.utilitiesPerEquipLevel;
  // Neighborhood rent multiplier
  var hood = typeof getActiveNeighborhood === 'function' ? getActiveNeighborhood() : null;
  if (hood) daily *= hood.rentMult;
  return daily;
}

// "Utilities and taxes": a cost that SCALES with gross income, so expenses stay a relevant
// fraction at every scale (without this, flat costs land at ~1% of income at mid/high
// level and the tycoon's economic tension is lost). Reducible with the Manager — agency:
// you optimize your margin by hiring/upgrading administration.
function getIncomeOverheadPerSecond() {
  var rate = OPERATING_COSTS.overheadRate || 0;
  if (rate <= 0) return 0;
  var overhead = getIncomePerSecond() * rate;
  if (game.staff.manager && game.staff.manager.hired) {
    var mgrDef = STAFF.find(function(s) { return s.id === 'manager'; });
    // stacks across copies (skips sick/training) + scales with level, capped 60% — extra managers now matter
    overhead *= Math.max(0, 1 - Math.min(0.6, getStaffTotalEffect(mgrDef, 'costReduction')));
  }
  // Fame: the "Premium Suppliers" perk also reduces the utilities-and-taxes overhead
  overhead *= (1 - getFameCostReduction());
  return Math.max(0, overhead);
}

function getOperatingCostsPerSecond() {
  return getOperatingCostsPerDay() / 600 + getIncomeOverheadPerSecond();
}

function getCampaignCostsPerSecond() {
  var total = 0;
  if (typeof MARKETING_CAMPAIGNS === 'undefined') return 0;
  MARKETING_CAMPAIGNS.forEach(function(mc) {
    if (mc.type !== 'always_on') return;
    var state = game.marketing[mc.id];
    if (!state || !state.active) return;
    var costPerTick = mc.costPerDay / 600;
    if (game.staff.manager && game.staff.manager.hired && !isStaffSick('manager', 0)) costPerTick *= 0.8;
    costPerTick *= getSkillEffect('campaignCostMult');
    total += costPerTick;
  });
  return total;
}

function buyProperty() {
  if (game.ownProperty) {
    showToast('❌', 'You already own the property!');
    return;
  }
  if (game.level < OPERATING_COSTS.propertyReqLevel) return;
  if (game.money < OPERATING_COSTS.propertyPrice) {
    showToast('❌', 'Not enough cash!');
    return;
  }
  if (!confirm('Buy the property for ' + fmtMoney(OPERATING_COSTS.propertyPrice) + '? You stop paying rent.')) return;
  game.money -= OPERATING_COSTS.propertyPrice;
  game.ownProperty = true;
  addLog('🏠 You bought the property! No more rent.');
  showToast('🏠', 'You own the property! No more rent.');
  addXp(200);
  game.dailyTracking.xpEarned += 200;
  renderExpansion();
  updateUI();
  saveGame();
}

// ===== RANDOM EVENT OUTCOME SCALING =====
// Outcomes are DECLARED as signed tier magnitudes (1=small, 2=medium, 3=large; sign=gain/loss)
// and resolved into real numbers that scale with the player's economy, so every event stays
// relevant early AND late. Cash: gains = seconds-of-income; costs = same but capped
// as a % of cash (never bankrupts you). Rep/XP/members scale with level and with the cap.
function evIncSec() { var i = getIncomePerSecond(); return i > 5 ? i : 5; }
function evMoney(tier) {
  if (!tier) return 0;
  var t = Math.abs(tier);
  var secs  = [0, 40, 110, 280][t] || 60;
  var floor = [0, 250, 800, 2200][t] || 500;
  var amt = Math.max(floor, Math.round(evIncSec() * secs));
  if (tier < 0) {
    var pctCap = [0, 0.12, 0.25, 0.45][t] || 0.2;
    amt = Math.min(amt, Math.floor((game.money || 0) * pctCap)); // a cost NEVER exceeds this % of cash → never bankrupts
    return -amt;
  }
  return amt;
}
function evRep(tier)  { if (!tier) return 0; var t = Math.abs(tier); var v = Math.ceil([0,12,28,55][t] * (1 + (game.level - 1) * 0.22)); return tier < 0 ? -v : v; }
function evXp(tier)   { if (!tier) return 0; var t = Math.abs(tier); return Math.ceil([0,35,90,190][t] * (1 + (game.level - 1) * 0.18)); }
function evMembers(tier) { if (!tier) return 0; var t = Math.abs(tier); var v = Math.max([0,2,5,10][t], Math.ceil(getMaxMembers() * [0,0.04,0.09,0.18][t])); return tier < 0 ? -v : v; }

// spec: { money, rep, xp, members } signed tiers -> actual numbers
function resolveEventSpec(spec) {
  if (!spec) return { money:0, rep:0, xp:0, members:0 };
  return { money: evMoney(spec.money || 0), rep: evRep(spec.rep || 0), xp: evXp(spec.xp || 0), members: evMembers(spec.members || 0) };
}
function applyEventDeltas(d, special) {
  if (d.money) { game.money += d.money; if (d.money > 0) game.totalMoneyEarned += d.money; if (game.money < 0) game.money = 0; }
  if (d.rep) { game.reputation = Math.max(0, game.reputation + d.rep); if (d.rep > 0) game.dailyTracking.reputationGained += d.rep; }
  if (d.xp) { addXp(d.xp); game.dailyTracking.xpEarned += d.xp; }
  if (d.members) game.members = Math.max(0, Math.min(game.members + d.members, getMaxMembers()));
  if (special === 'curestaff') {
    STAFF.forEach(function(s){ var st = game.staff[s.id]; if (st && st.hired) { st.sickUntil = 0; if (st.extras) st.extras.forEach(function(e){ e.sickUntil = 0; }); } });
  } else if (special === 'randomsupp') {
    var avail = SUPPLEMENTS.filter(function(s){ return game.level >= s.reqLevel && !(game.supplements[s.id] && game.supplements[s.id].activeUntil && Date.now() < game.supplements[s.id].activeUntil); });
    if (avail.length) { var pick = avail[Math.floor(Math.random() * avail.length)]; game.supplements[pick.id] = { activeUntil: Date.now() + pick.duration * 1000, toleranceLevel: 0, lastUsedTick: game.tickCount }; }
  }
}
function fmtEventDeltas(d, special) {
  var parts = [];
  if (d.money) parts.push((d.money > 0 ? '+' : '-') + fmtMoney(Math.abs(d.money)));
  if (d.rep) parts.push((d.rep > 0 ? '+' : '') + d.rep + ' rep');
  if (d.xp) parts.push('+' + d.xp + ' XP');
  if (d.members) parts.push((d.members > 0 ? '+' : '') + d.members + ' members');
  if (special === 'curestaff') parts.push('staff recovered');
  if (special === 'randomsupp') parts.push('free supplement');
  return parts.length ? parts.join(' · ') : 'Nothing';
}

function getMaxMembers() {
  let cap = 0;
  // Zone capacity
  GYM_ZONES.forEach(z => {
    if (game.zones[z.id]) cap += z.capacityBonus;
  });

  EQUIPMENT.forEach(eq => {
    const lvl = game.equipment[eq.id]?.level || 0;
    let eqCap = eq.capacityPerLevel * lvl;
    eqCap *= getSkillEffect('equipCapacityMult');
    cap += eqCap;
  });
  STAFF.forEach(s => {
    if (game.staff[s.id]?.hired && s.capacityBonus) {
      cap += getStaffTotalEffect(s, 'capacityBonus');
    }
  });
  // Marketing active campaigns
  var campaignMembersMult = getSkillEffect('campaignMembersMult');
  MARKETING_CAMPAIGNS.forEach(mc => {
    const state = game.marketing[mc.id];
    if (state?.activeUntil && Date.now() < state.activeUntil) {
      cap += Math.ceil(mc.membersBoost * campaignMembersMult);
    }
  });
  // Supplement capacity bonus
  cap += getActiveSupplementEffects().capacityBonus;
  // Rival defeat bonus capacity
  cap += getRivalCapacityBonus();
  // Skill: capacity mult
  cap *= getSkillEffect('capacityMult');
  // Fame: "Trendy Gym" perk (+5% cap/level)
  cap *= (1 + getFamePerkEffect('capacity'));
  // Decoration capacity bonus
  cap += getDecorationBonus('capacity');
  // Neighborhood max members cap
  var hood = typeof getActiveNeighborhood === 'function' ? getActiveNeighborhood() : null;
  if (hood && hood.maxMembersCap) {
    cap = Math.min(cap, hood.maxMembersCap + getZoneCapacityBonus());
  }
  return Math.floor(cap);
}

function getZoneCapacityBonus() {
  var bonus = 0;
  GYM_ZONES.forEach(function(z) {
    if (z.id !== 'ground_floor' && game.zones[z.id]) bonus += z.capacityBonus;
  });
  return bonus;
}

function getMembersAttracted() {
  let base = 0;
  EQUIPMENT.forEach(eq => {
    const lvl = game.equipment[eq.id]?.level || 0;
    base += eq.membersPerLevel * lvl;
  });
  base *= getSkillEffect('memberAttractionMult');
  // Fame: "Open House" temporary boost (+50% attraction)
  base *= getActiveFameBoosts().memberAttractMult;
  // Marketing boost
  var campaignMembersMult = getSkillEffect('campaignMembersMult');
  MARKETING_CAMPAIGNS.forEach(mc => {
    const state = game.marketing[mc.id];
    if (state?.activeUntil && Date.now() < state.activeUntil) {
      base += Math.ceil(mc.membersBoost * campaignMembersMult);
    }
  });
  var capped = Math.min(base, getMaxMembers());
  // Rivals steal a PERCENTAGE of your actual members. (Flat steal was absorbed by the attraction
  // surplus over capacity → it never reduced members. Now it bites, so promo/defeat have real value.)
  // Reduced by the rivalStealMult skill; capped so it can't wipe you. Defeating a rival removes its share.
  var stealPct = Math.min(0.30, getRivalMemberSteal() * 0.0025 * getSkillEffect('rivalStealMult')) * (1 - getFamePerkEffect('retention'));
  return Math.max(0, Math.floor(capped * (1 - stealPct)));
}

// ===== GYM TIER =====
function getGymTier() {
  const m = game.totalMoneyEarned;
  if (m >= 10000000) return '🏛️ Fitness Empire';
  if (m >= 5000000) return '🏛️ Elite Mega Gym';
  if (m >= 1000000) return '🏢 Premium Chain';
  if (m >= 500000) return '💎 VIP Gym';
  if (m >= 100000) return '🏋️ Pro Gym';
  if (m >= 50000) return '💪 Established Gym';
  if (m >= 10000) return '🔨 Growing Gym';
  if (m >= 1000) return '🌱 Rookie Gym';
  return '🏠 Garage Gym';
}

// ===== LOGGING =====
// level: 'critical' | 'important' | 'normal' (default)
function addLog(msg, level) {
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  game.log.unshift({ time, msg, level: level || 'normal' });
  if (game.log.length > 80) game.log.pop();
  renderLog();
}

// ===== TOAST =====
let toastQueue = [];
let toastActive = false;

function showToast(icon, text) {
  toastQueue.push({ icon, text });
  if (!toastActive) processToastQueue();
}

function processToastQueue() {
  if (toastQueue.length === 0) { toastActive = false; return; }
  toastActive = true;
  const { icon, text } = toastQueue.shift();
  const toast = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastText').textContent = text;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => processToastQueue(), 300);
  }, 2500);
}

// ===== FLOATING NUMBERS =====
function floatNumber(text, color) {
  color = color || 'var(--green)';
  const el = document.createElement('div');
  el.className = 'float-number';
  el.textContent = text;
  el.style.color = color;
  el.style.left = (Math.random() * 60 + 20) + '%';
  el.style.top = '40%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// ===== GAME ACTIONS =====
function buyEquipment(id) {
  const eq = EQUIPMENT.find(e => e.id === id);
  const state = game.equipment[id] || { level: 0 };

  // Can't upgrade if already upgrading
  if (isEquipmentUpgrading(id)) {
    showToast('❌', "It's already being upgraded!");
    return;
  }

  // Equipment level cannot exceed player level
  if (state.level >= game.level) {
    showToast('❌', "Equipment can't exceed your level (" + game.level + ')');
    return;
  }

  const isNew = state.level === 0;

  // Concurrent upgrade limit only applies to upgrades, not new purchases
  if (!isNew) {
    var activeUpgrades = getActiveEquipUpgrades();
    var maxUpgrades = getMaxConcurrentUpgrades();
    if (activeUpgrades >= maxUpgrades) {
      showToast('❌', activeUpgrades + ' upgrade(s) already in progress! Max: ' + maxUpgrades);
      return;
    }
  }

  const cost = getEquipCost(eq, state.level);
  if (game.money < cost) return;

  game.money -= cost;
  if (!game.equipment[id]) game.equipment[id] = { level: 0, brokenUntil: 0, upgradingUntil: 0 };

  const nextLevel = state.level + 1;
  const xpGain = 15 + nextLevel * 3;
  addXp(xpGain);
  game.dailyTracking.equipmentBought++;
  game.dailyTracking.xpEarned += xpGain;

  if (isNew) {
    // First purchase is instant
    game.equipment[id].level = 1;
    addLog('🛒 You bought <span class="highlight">' + eq.name + '</span> ' + eq.icon);
    showToast(eq.icon, 'New equipment: ' + eq.name + '!');
    updateMembers();
  } else {
    // Upgrades take time
    var duration = getEquipUpgradeDuration(state.level) * getSkillEffect('equipUpgradeSpeedMult') * 1000;
    game.equipment[id].upgradingUntil = Date.now() + duration;
    var secs = Math.ceil(duration / 1000);
    addLog('🏗️ Upgrading <span class="highlight">' + eq.name + '</span> to level ' + nextLevel + ' (' + fmtTime(secs) + ')');
    showToast('🏗️', 'Upgrading ' + eq.name + '... ' + fmtTime(secs));
  }

  renderEquipment();
  renderGymScene();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function hireStaff(id) {
  const s = STAFF.find(st => st.id === id);
  const cost = getStaffCost(s, 0);
  if (game.money < cost || game.staff[id]?.hired) return;

  game.money -= cost;
  game.staff[id] = { hired: true, level: 1, trainingUntil: 0, sickUntil: 0, extras: [] };
  const xpGain = 50;
  addXp(xpGain);
  game.dailyTracking.xpEarned += xpGain;

  addLog('🤝 You hired <span class="highlight">' + s.name + '</span> (' + s.role + ')');
  showToast(s.icon, s.name + ' joined the team!');

  updateMembers();
  renderStaff();
  renderEquipment();
  renderGymScene();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function enterCompetition(id) {
  const c = COMPETITIONS.find(co => co.id === id);
  const state = game.competitions[id] || { wins: 0, losses: 0, cooldownUntil: 0 };

  if (Date.now() < state.cooldownUntil) return;

  let rewardMult = 1;
  if (game.staff.champion?.hired) {
    var champDef = STAFF.find(s => s.id === 'champion');
    var champEffect = getStaffTotalEffect(champDef, 'compMult');
    if (champEffect > 0) rewardMult = champEffect; // level-scaled: 2.0 at lvl1, 2.4 at lvl2, etc.
  }

  let chance = c.winChance + (game.reputation * 0.0001) + getSkillEffect('compWinChanceBonus', 0);
  chance = Math.min(chance, 0.95);

  const won = Math.random() < chance;

  if (!game.competitions[id]) game.competitions[id] = { wins: 0, losses: 0, cooldownUntil: 0 };
  var cooldownMult = getSkillEffect('compCooldownMult');
  game.competitions[id].cooldownUntil = Date.now() + c.cooldown * cooldownMult * 1000;

  if (won) {
    rewardMult *= getSkillEffect('compRewardMult');
    rewardMult *= (1 + getDecorationBonus('compReward'));
    const reward = Math.ceil(c.reward * rewardMult);
    game.money += reward;
    game.totalMoneyEarned += reward;
    var compRepMult = getSkillEffect('compRepMult');
    game.reputation += Math.ceil(c.repReward * compRepMult);
    var compXpMult = getSkillEffect('compXpMult');
    addXp(Math.ceil(c.xpReward * compXpMult * (1 + (game.level - 1) * 0.15)));
    game.competitions[id].wins++;
    game.stats.competitionsWon++;
    game.dailyTracking.competitionsWon++;
    game.dailyTracking.moneyEarned += reward;
    game.dailyTracking.reputationGained += c.repReward;
    game.dailyTracking.xpEarned += c.xpReward;
    addLog('🏆 VICTORY at <span class="highlight">' + c.name + '</span>! +<span class="money-log">' + fmtMoney(reward) + '</span> +' + c.repReward + '⭐', 'important');
    showToast('🏆', 'Victory at ' + c.name + '!');
    floatNumber('+' + fmtMoney(reward));
  } else {
    const xpGain = Math.ceil(c.xpReward * 0.2 * (1 + (game.level - 1) * 0.15));
    addXp(xpGain);
    game.dailyTracking.xpEarned += xpGain;
    game.competitions[id].losses++;
    addLog('😤 Loss at <span class="highlight">' + c.name + '</span>. Keep training...');
    showToast('😤', 'Loss at ' + c.name + '...');
  }

  renderChampion();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

// ===== MEMBER LOGIC =====
function updateMembers() {
  const attracted = getMembersAttracted();
  const max = getMaxMembers();
  game.maxMembers = max;
  game.members = Math.min(attracted, max);
  // Track max members stat
  if (game.members > game.stats.maxMembers) game.stats.maxMembers = game.members;
}

// ===== LEVEL UP =====
function addXp(amount) {
  game.xp += amount;
  checkLevelUp();
}

function checkLevelUp() {
  var leveled = false;
  while (game.xp >= game.xpToNext) {
    game.xp -= game.xpToNext;
    game.level++;
    game.xpToNext = Math.ceil(100 * Math.pow(1.40, game.level - 1));
    addLog('🎉 You reached <span class="highlight">Level ' + game.level + '</span>!', 'critical');
    showToast('🎉', 'Level ' + game.level + '!');
    leveled = true;
  }
  if (leveled) {
    renderEquipment();
    renderStaff();
    renderClasses();
    renderMarketing();
    renderSupplements();
    renderRivals();
    updateTabVisibility(true);
    saveGame(); // Save immediately so level-up survives a page reload
  }
}

// ===== CHAMPION SYSTEM =====

function getChampionFatiguePenalty() {
  var fatigue = game.champion ? (game.champion.fatigue || 0) : 0;
  if (fatigue < 50) return { mult: 1.0, chancePenalty: 0, label: null };
  if (fatigue < 75) return { mult: 0.85, chancePenalty: 0.05, label: '😓 Tired: -15% rewards' };
  if (fatigue < 90) return { mult: 0.70, chancePenalty: 0.10, label: '😰 Very tired: -30% rewards' };
  return { mult: 0.50, chancePenalty: 0.20, label: '💀 Exhausted: -50% rewards' };
}

function getChampionTotalStats() {
  if (!game.champion || !game.champion.recruited) return 0;
  return CHAMPION_STATS.reduce(function(sum, s) { return sum + (game.champion.stats[s] || 0); }, 0);
}

// Returns estimated full recovery time in seconds given current stamina
function getChampionRecoveryRate() {
  var stamina = getChampionEffectiveStat('stamina');
  return 3 + Math.floor(stamina * 0.6); // fatigue points recovered per 30 ticks
}

function getChampionRecoveryTimeSeconds() {
  var remaining = game.champion.fatigue || 0;
  if (remaining <= 0) return 0;
  var rate = getChampionRecoveryRate(); // per 30 ticks
  return Math.ceil((remaining / rate) * 30); // seconds
}

function renameChampion(newName) {
  if (!game.champion) return;
  newName = (newName || '').trim().slice(0, 20);
  if (!newName) return;
  game.champion.name = newName;
  renderChampion();
  saveGame();
}

function getChampionEffectiveStat(stat) {
  var base = game.champion.stats[stat] || 0;
  var slots = game.champion.equipment;
  ['hands', 'waist', 'feet', 'head'].forEach(function(slot) {
    var eqId = slots[slot];
    if (!eqId) return;
    var eq = CHAMPION_EQUIPMENT.find(function(e) { return e.id === eqId; });
    if (eq && eq.stats[stat]) base += eq.stats[stat];
  });
  return base;
}


function getChampionTrainingCost(stat) {
  var currentVal = game.champion.stats[stat] || 1;
  return Math.ceil(500 * Math.pow(1.4, currentVal - 1));
}

function getChampionTrainingDuration(stat) {
  var currentVal = game.champion.stats[stat] || 1;
  return 30 + currentVal * 15;
}

function getChampionXpToNext() {
  return Math.ceil(CHAMPION_XP_PER_LEVEL * Math.pow(1.3, game.champion.level - 1));
}

function recruitChampion() {
  if (game.champion.recruited) return;
  if (game.level < CHAMPION_UNLOCK_LEVEL) return;
  if (game.money < CHAMPION_RECRUIT_COST) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= CHAMPION_RECRUIT_COST;
  game.champion.recruited = true;

  addLog('🏅 You recruited your <span class="highlight">Champion</span>! Train them and lead them to glory.');
  showToast('🏅', 'Champion recruited!');
  renderChampion();
  updateUI();
  checkAchievements();
  saveGame();
}

function trainChampion(stat) {
  if (!game.champion.recruited) return;
  if (isChampionInjured()) {
    showToast('🤕', 'Your champion is injured! Wait for them to recover.');
    return;
  }
  if (isChampionInCamp()) {
    showToast('🏕️', 'Your champion is at training camp! They can\'t train right now.');
    return;
  }
  if (game.champion.trainingUntil && Date.now() < game.champion.trainingUntil) {
    showToast('❌', 'Your champion is already training!');
    return;
  }
  if ((game.champion.fatigue || 0) >= CHAMPION_FATIGUE_THRESHOLD) {
    showToast('😴', 'Your champion is exhausted! Let them rest before training.');
    return;
  }

  var cost = getChampionTrainingCost(stat);
  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= cost;
  game.champion.fatigue = Math.min(CHAMPION_MAX_FATIGUE, game.champion.fatigue + CHAMPION_FATIGUE_PER_TRAIN);
  var duration = getChampionTrainingDuration(stat);
  game.champion.trainingUntil = Date.now() + duration * 1000;
  game.champion.trainingStat = stat;
  game.stats.championTrainings++;

  addLog('🏅 Champion training <span class="highlight">' + CHAMPION_STAT_NAMES[stat] + '</span>...');
  showToast('🏋️', 'Training ' + CHAMPION_STAT_NAMES[stat] + '...');
  renderChampion();
  updateUI();
  saveGame();
}

function checkChampionTraining() {
  if (!game.champion || !game.champion.recruited) return;
  if (game.champion.trainingUntil && Date.now() >= game.champion.trainingUntil) {
    var stat = game.champion.trainingStat;
    if (stat) {
      game.champion.stats[stat]++;
      addLog('🏅 Champion improved <span class="highlight">' + CHAMPION_STAT_NAMES[stat] + '</span> to ' + game.champion.stats[stat] + '!');
      showToast('💪', CHAMPION_STAT_NAMES[stat] + ' → ' + game.champion.stats[stat]);
    }
    game.champion.trainingUntil = 0;
    game.champion.trainingStat = null;
    renderChampion();
    checkAchievements();
    saveGame();
  }
}

function championCompete(compId) {
  if (!game.champion || !game.champion.recruited) return;
  if (isChampionInjured()) {
    showToast('🤕', 'Your champion is injured! They can\'t compete until they recover.');
    return;
  }
  if (isChampionInCamp()) {
    showToast('🏕️', 'Your champion is at training camp! They can\'t compete right now.');
    return;
  }
  if (game.champion.trainingUntil && Date.now() < game.champion.trainingUntil) {
    showToast('⏳', 'Your champion is training, wait for it to finish!');
    return;
  }

  var c = COMPETITIONS.find(function(co) { return co.id === compId; });
  if (!c) return;
  if (game.reputation < c.minRep) return;

  if (!game.competitions[compId]) game.competitions[compId] = { wins: 0, losses: 0, cooldownUntil: 0 };
  var state = game.competitions[compId];
  if (Date.now() < state.cooldownUntil) return;
  if ((game.champion.fatigue || 0) >= CHAMPION_FATIGUE_THRESHOLD) {
    showToast('😴', 'Your champion is exhausted! They can\'t compete until they rest.');
    return;
  }

  // Compute fatigue cost (resistencia reduces it slightly)
  var resistencia = getChampionEffectiveStat('resistencia');
  var fatigueCost = Math.max(15, CHAMPION_FATIGUE_PER_COMPETE - Math.floor(resistencia * 0.5));
  game.champion.fatigue = Math.min(CHAMPION_MAX_FATIGUE, game.champion.fatigue + fatigueCost);

  // Win chance: base + fuerza + velocidad + mentalidad bonus, modified by fatigue
  var fuerza = getChampionEffectiveStat('fuerza');
  var velocidad = getChampionEffectiveStat('velocidad');
  var mentalidad = getChampionEffectiveStat('mentalidad');
  // mentalidad scales with difficulty (lower base winChance = harder) — matches its description
  var statBonus = (fuerza * 0.008) + (velocidad * 0.012) + (mentalidad * 0.01 * (1.5 - c.winChance));
  var fatiguePenalty = getChampionFatiguePenalty();
  var chance = c.winChance + statBonus + getSkillEffect('compWinChanceBonus', 0);
  chance = Math.max(0.05, Math.min(chance, 0.95) - fatiguePenalty.chancePenalty);

  var won = Math.random() < chance;

  // Cooldown (skill-modified)
  var cooldownMult = getSkillEffect('compCooldownMult');
  state.cooldownUntil = Date.now() + c.cooldown * cooldownMult * 0.75 * 1000;

  // Champion XP
  var champXp = Math.ceil(c.xpReward * 0.5);
  game.champion.xp += champXp;
  game.stats.championCompetitions++;
  game.dailyTracking.competitionsWon = (game.dailyTracking.competitionsWon || 0);

  if (won) {
    var tecnica = getChampionEffectiveStat('tecnica');
    var rewardMult = CHAMPION_REWARD_MULT * getSkillEffect('compRewardMult') * (1 + tecnica * 0.02) * (1 + fuerza * 0.01) * (1 + getDecorationBonus('compReward'));
    var reward = Math.ceil(c.reward * rewardMult * fatiguePenalty.mult);
    // Income-scaled floor so high-tier wins stay meaningful late game (tier weighted by xpReward)
    reward = Math.max(reward, Math.ceil(getIncomePerSecond() * (c.xpReward / 50) * fatiguePenalty.mult));
    var compRepMult = getSkillEffect('compRepMult');
    var repGain = Math.ceil(c.repReward * compRepMult * (1 + tecnica * 0.01) * fatiguePenalty.mult);
    var compXpMult = getSkillEffect('compXpMult');
    var xpGain = Math.ceil(c.xpReward * compXpMult * (1 + (game.level - 1) * 0.15));

    game.money += reward;
    game.totalMoneyEarned += reward;
    game.reputation += repGain;
    addXp(xpGain);
    state.wins++;
    game.champion.wins++;
    game.stats.championWins++;
    game.stats.competitionsWon++;
    game.dailyTracking.competitionsWon++;
    game.dailyTracking.moneyEarned += reward;
    game.dailyTracking.reputationGained += repGain;
    game.dailyTracking.xpEarned += xpGain;

    var penaltyNote = fatiguePenalty.label ? ' <span style="color:var(--accent);font-size:11px;">(' + fatiguePenalty.label + ')</span>' : '';
    addLog('🏅 VICTORY at <span class="highlight">' + c.name + '</span>! +<span class="money-log">' + fmtMoney(reward) + '</span> +' + repGain + '⭐' + penaltyNote, 'important');
    showToast('🏅', 'Victory at ' + c.name + '!');
    floatNumber('+' + fmtMoney(reward));
  } else {
    var consolationXp = Math.ceil(c.xpReward * 0.2 * (1 + (game.level - 1) * 0.15));
    addXp(consolationXp);
    game.dailyTracking.xpEarned += consolationXp;
    state.losses++;
    game.champion.losses++;
    game.stats.championLosses++;

    addLog('🏅 Loss at <span class="highlight">' + c.name + '</span>. Keep training!');
    showToast('😤', 'Loss at ' + c.name);
  }

  checkChampionLevelUp();
  checkLevelUp();
  renderChampion();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function checkChampionLevelUp() {
  if (!game.champion || !game.champion.recruited) return;
  var xpNeeded = getChampionXpToNext();
  while (game.champion.xp >= xpNeeded) {
    game.champion.xp -= xpNeeded;
    game.champion.level++;
    addLog('🏅 Champion reached <span class="highlight">Level ' + game.champion.level + '</span>!', 'important');
    showToast('🏅', 'Champion Level ' + game.champion.level + '!');
    xpNeeded = getChampionXpToNext();
  }
}

// Fatigue recovers automatically every 30 ticks. Rate scales with Stamina stat.
function championFatigueTick() {
  if (!game.champion || !game.champion.recruited) return;
  if (game.champion.fatigue <= 0) return;
  if (game.tickCount % 30 === 0) {
    var stamina = getChampionEffectiveStat('stamina');
    var recovery = 3 + Math.floor(stamina * 0.6);
    game.champion.fatigue = Math.max(0, game.champion.fatigue - recovery);
  }
}

// ===== GRAND TOURNAMENTS (high-risk champion circuit) =====
function getGrandTournament(id) { return GRAND_TOURNAMENTS.find(function(t) { return t.id === id; }); }

function getGrandPrep(id) {
  if (!game.grandPrep) game.grandPrep = {};
  if (!game.grandPrep[id]) game.grandPrep[id] = { pasajes: false, nutricion: false, medico: false, concentracionUntil: 0 };
  return game.grandPrep[id];
}

function getGrandState(id) {
  if (!game.grandTournaments) game.grandTournaments = {};
  if (!game.grandTournaments[id]) game.grandTournaments[id] = { wins: 0, losses: 0, cooldownUntil: 0 };
  return game.grandTournaments[id];
}

function getGrandPrepItemCost(t, item) { return Math.ceil(t.entryFee * item.costMult); }

// training camp counts as "ready" only when the timer finished; the rest are direct flags
function isGrandPrepItemDone(t, itemId) {
  var p = getGrandPrep(t.id);
  if (itemId === 'concentracion') return p.concentracionUntil > 0 && Date.now() >= p.concentracionUntil;
  return !!p[itemId];
}

function getGrandReadiness(t) {
  var r = 0;
  GRAND_PREP_ITEMS.forEach(function(it) { if (isGrandPrepItemDone(t, it.id)) r += it.readiness; });
  return Math.min(100, r);
}

function isChampionInjured() {
  return !!(game.champion && game.champion.injuredUntil && Date.now() < game.champion.injuredUntil);
}

function getChampionInjurySecondsLeft() {
  if (!isChampionInjured()) return 0;
  return Math.ceil((game.champion.injuredUntil - Date.now()) / 1000);
}

// "In training camp" = some tournament still has its pre-season running (the champion is away)
function isChampionInCamp() {
  if (!game.grandPrep) return false;
  return Object.keys(game.grandPrep).some(function(id) {
    var u = game.grandPrep[id].concentracionUntil;
    return u > 0 && Date.now() < u;
  });
}

// Busy state that blocks training / competing (normal and Grand)
function getChampionBusyState() {
  if (isChampionInjured()) return { busy: true, reason: 'injured', secs: getChampionInjurySecondsLeft() };
  if (isChampionInCamp()) {
    var until = 0;
    Object.keys(game.grandPrep).forEach(function(id) { var u = game.grandPrep[id].concentracionUntil; if (u > until && Date.now() < u) until = u; });
    return { busy: true, reason: 'camp', secs: Math.ceil((until - Date.now()) / 1000) };
  }
  if (game.champion && game.champion.trainingUntil && Date.now() < game.champion.trainingUntil) {
    return { busy: true, reason: 'training', secs: Math.ceil((game.champion.trainingUntil - Date.now()) / 1000) };
  }
  return { busy: false, reason: null, secs: 0 };
}

function getGrandWinChance(t) {
  var fuerza = getChampionEffectiveStat('fuerza');
  var velocidad = getChampionEffectiveStat('velocidad');
  var mentalidad = getChampionEffectiveStat('mentalidad');
  var statBonus = (fuerza * 0.008) + (velocidad * 0.012) + (mentalidad * 0.01 * (1.5 - t.baseWinChance));
  var readiness = getGrandReadiness(t) / 100;
  var fp = getChampionFatiguePenalty();
  var chance = t.baseWinChance + statBonus + readiness * GRAND_READINESS_WIN_WEIGHT + getSkillEffect('compWinChanceBonus', 0);
  return Math.max(0.05, Math.min(0.95, chance) - fp.chancePenalty);
}

function getGrandInjuryChance(t) {
  var readiness = getGrandReadiness(t) / 100;
  var resist = getChampionEffectiveStat('resistencia');
  var chance = t.injury.baseChance - readiness * (t.injury.baseChance - t.injury.minChance) - resist * 0.004;
  if (isGrandPrepItemDone(t, 'medico')) chance *= 0.5;
  return Math.max(0.02, Math.min(t.injury.baseChance, chance));
}

// Why can't I enter? (null = I can). Doesn't check cooldown or tickets/fee (the button reports that).
function getGrandLockReason(t) {
  if (!game.champion || !game.champion.recruited) return 'Recruit a champion first';
  if (game.champion.level < t.champLevelReq) return 'Champion level ' + t.champLevelReq;
  if (game.reputation < t.minRep) return t.minRep + ' reputation';
  if (t.minStat) {
    var keys = Object.keys(t.minStat);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (getChampionEffectiveStat(k) < t.minStat[k]) return CHAMPION_STAT_NAMES[k] + ' ' + t.minStat[k] + '+';
    }
  }
  return null;
}

function buyGrandPrep(tId, itemId) {
  var t = getGrandTournament(tId);
  if (!t || !game.champion || !game.champion.recruited) return;
  if (isChampionInjured()) { showToast('🤕', 'Your champion is injured! Wait for them to recover.'); return; }
  var it = GRAND_PREP_ITEMS.find(function(i) { return i.id === itemId; });
  if (!it) return;
  var p = getGrandPrep(tId);
  var cost = getGrandPrepItemCost(t, it);

  if (itemId === 'concentracion') {
    if (isGrandPrepItemDone(t, 'concentracion')) { showToast('✅', 'The training camp is already done.'); return; }
    if (p.concentracionUntil > 0 && Date.now() < p.concentracionUntil) { showToast('⏳', 'The training camp is already in progress.'); return; }
    var busy = getChampionBusyState();
    if (busy.busy) { showToast('⏳', 'The champion is busy and can\'t go to training camp right now.'); return; }
    if (game.money < cost) { showToast('❌', 'Not enough cash!'); return; }
    game.money -= cost;
    p.concentracionUntil = Date.now() + t.concentracionSecs * 1000;
    addLog('🏕️ The champion entered <span class="highlight">training camp</span> for ' + t.name + '.');
    showToast('🏕️', 'Training camp started');
  } else {
    if (p[itemId]) { showToast('✅', 'You already have it!'); return; }
    if (game.money < cost) { showToast('❌', 'Not enough cash!'); return; }
    game.money -= cost;
    p[itemId] = true;
    addLog('✅ You got <span class="highlight">' + it.name + '</span> for ' + t.name + '. (-' + fmtMoney(cost) + ')');
    showToast(it.icon, it.name + ' ready');
  }
  renderChampion();
  updateUI();
  saveGame();
}

function attemptGrandTournament(tId) {
  var t = getGrandTournament(tId);
  if (!t || !game.champion || !game.champion.recruited) return;

  var lock = getGrandLockReason(t);
  if (lock) { showToast('🔒', 'Requirement: ' + lock); return; }

  var busy = getChampionBusyState();
  if (busy.busy) {
    var msg = busy.reason === 'injured' ? 'Your champion is injured!' : busy.reason === 'camp' ? 'Your champion is still at training camp!' : 'Your champion is training!';
    showToast('⏳', msg);
    return;
  }
  if ((game.champion.fatigue || 0) >= CHAMPION_FATIGUE_THRESHOLD) { showToast('😴', 'Your champion is exhausted! Let them rest.'); return; }

  var state = getGrandState(tId);
  if (Date.now() < state.cooldownUntil) { showToast('⏱️', 'Still on cooldown.'); return; }

  var p = getGrandPrep(tId);
  if (!p.pasajes) { showToast('✈️', 'You need Tickets and Visa to enter!'); return; }
  if (game.money < t.entryFee) { showToast('❌', "You can't afford the entry fee (" + fmtMoney(t.entryFee) + ').'); return; }

  // ---- Commitment: the entry fee is paid, the cooldown starts, fatigue goes up ----
  game.money -= t.entryFee;
  state.cooldownUntil = Date.now() + t.cooldown * 1000;
  var fatigueCost = Math.max(30, GRAND_FATIGUE_PER_ATTEMPT - Math.floor(getChampionEffectiveStat('resistencia') * 0.5));
  game.champion.fatigue = Math.min(CHAMPION_MAX_FATIGUE, (game.champion.fatigue || 0) + fatigueCost);

  var winChance = getGrandWinChance(t);
  var injuryChance = getGrandInjuryChance(t);
  var won = Math.random() < winChance;
  var injured = Math.random() < injuryChance;

  var fp = getChampionFatiguePenalty();
  var fuerza = getChampionEffectiveStat('fuerza');
  var tecnica = getChampionEffectiveStat('tecnica');

  var result = { tournament: t, won: won, injured: injured, money: 0, rep: 0, xp: 0, champXp: 0, injurySecs: 0, winChance: winChance, injuryChance: injuryChance, newTitle: null };

  if (won) {
    var rewardMult = getSkillEffect('compRewardMult') * (1 + tecnica * 0.02) * (1 + fuerza * 0.01) * (1 + getDecorationBonus('compReward'));
    var money = Math.ceil(t.reward.money * rewardMult * fp.mult);
    money = Math.max(money, Math.ceil(getIncomePerSecond() * t.floorSecs * fp.mult)); // floor scaled by economy
    var rep = Math.ceil(t.reward.rep * getSkillEffect('compRepMult') * (1 + tecnica * 0.01) * fp.mult);
    var xp = Math.ceil(t.reward.xp * getSkillEffect('compXpMult') * (1 + (game.level - 1) * 0.15));
    var champXp = Math.ceil(t.reward.xp * 0.5);

    var firstWin = state.wins === 0;
    game.money += money;
    game.totalMoneyEarned += money;
    game.reputation += rep;
    addXp(xp);
    game.champion.xp += champXp;
    state.wins++;
    game.champion.wins++;
    game.stats.grandWins = (game.stats.grandWins || 0) + 1;
    game.stats.championWins++;
    game.stats.competitionsWon = (game.stats.competitionsWon || 0) + 1;
    game.dailyTracking.competitionsWon = (game.dailyTracking.competitionsWon || 0) + 1;
    game.dailyTracking.moneyEarned += money;
    game.dailyTracking.reputationGained += rep;
    game.dailyTracking.xpEarned += xp;

    result.money = money; result.rep = rep; result.xp = xp; result.champXp = champXp;
    if (firstWin && t.title) result.newTitle = t.title;

    addLog('🏆 VICTORY at <span class="highlight">' + t.name + '</span>! +<span class="money-log">' + fmtMoney(money) + '</span> +' + rep + '⭐', 'important');
    showToast('🏆', 'You won ' + t.name + '!');
    floatNumber('+' + fmtMoney(money));
  } else {
    var consolationRep = Math.ceil(t.reward.rep * 0.08 * (1 + (game.level - 1) * 0.1));
    var consolationXp = Math.ceil(t.reward.xp * 0.15 * (1 + (game.level - 1) * 0.15));
    game.reputation += consolationRep;
    addXp(consolationXp);
    game.champion.xp += Math.ceil(t.reward.xp * 0.1);
    state.losses++;
    game.champion.losses++;
    game.stats.grandLosses = (game.stats.grandLosses || 0) + 1;
    game.stats.championLosses++;
    game.dailyTracking.xpEarned += consolationXp;
    game.dailyTracking.reputationGained += consolationRep;

    result.rep = consolationRep; result.xp = consolationXp;
    addLog('😤 Loss at <span class="highlight">' + t.name + '</span>. +' + consolationRep + '⭐ consolation.');
    showToast('😤', 'Loss at ' + t.name);
  }

  // ---- Injury (the rare tail; mitigated by prep + medic + endurance) ----
  if (injured) {
    var inj = applyChampionInjury(t);
    result.injurySecs = inj.secs;
    game.stats.championInjuries = (game.stats.championInjuries || 0) + 1;
    addLog('🤕 Your champion got injured! Out of action ~' + fmtTime(inj.secs) + '.', 'important');
  }

  // ---- Prep is consumed (win or lose) ----
  game.grandPrep[tId] = { pasajes: false, nutricion: false, medico: false, concentracionUntil: 0 };

  game.stats.championCompetitions++;
  checkChampionLevelUp();
  checkLevelUp();
  checkAchievements();
  checkMissionProgress();
  if (typeof showGrandResult === 'function') showGrandResult(result);
  renderChampion();
  updateUI();
  saveGame();
}

function applyChampionInjury(t) {
  var resist = getChampionEffectiveStat('resistencia');
  var severity = 0.3 + Math.random() * 0.7;                 // 0.3 - 1.0
  if (isGrandPrepItemDone(t, 'medico')) severity *= 0.6;    // the medical kit softens it
  severity *= Math.max(0.4, 1 - resist * 0.01);             // endurance softens it
  severity = Math.max(0.15, Math.min(1, severity));
  var secs = Math.ceil(severity * t.injury.maxHours * 3600);
  game.champion.injuredUntil = Date.now() + secs * 1000;
  game.champion.injurySeverity = severity;
  return { severity: severity, secs: secs };
}

// Tick: notifies when the champion recovers from an injury
function checkChampionInjury() {
  if (!game.champion || !game.champion.recruited) return;
  if (game.champion._wasInjured && !isChampionInjured()) {
    game.champion._wasInjured = false;
    game.champion.injurySeverity = 0;
    addLog('💚 Your champion recovered from the injury! Ready to get back in action.', 'important');
    showToast('💚', 'Champion recovered!');
    renderChampion();
  } else if (isChampionInjured()) {
    game.champion._wasInjured = true;
  }
}

// Tick: notifies when a training camp ends
function checkGrandConcentracion() {
  if (!game.grandPrep) return;
  Object.keys(game.grandPrep).forEach(function(id) {
    var p = game.grandPrep[id];
    if (p.concentracionUntil > 0 && !p._campDone && Date.now() >= p.concentracionUntil) {
      p._campDone = true;
      var t = getGrandTournament(id);
      addLog('🏕️ Training camp ended for <span class="highlight">' + (t ? t.name : 'the tournament') + '</span>. Readiness set.');
      renderChampion();
    } else if (p.concentracionUntil > 0 && Date.now() < p.concentracionUntil) {
      p._campDone = false;
    }
  });
}

// ===== OPPORTUNITIES / RISKY VENTURES (same engine, at the gym level) =====
function getOpportunity(id) { return OPPORTUNITIES.find(function(o) { return o.id === id; }); }

function getOppPrep(id) {
  if (!game.oppPrep) game.oppPrep = {};
  if (!game.oppPrep[id]) game.oppPrep[id] = { permisos: false, contactos: false, seguro: false, duediligenceUntil: 0 };
  return game.oppPrep[id];
}

function getOppState(id) {
  if (!game.opportunities) game.opportunities = {};
  if (!game.opportunities[id]) game.opportunities[id] = { wins: 0, losses: 0, cooldownUntil: 0 };
  return game.opportunities[id];
}

function getOppPrepItemCost(o, item) { return Math.ceil(o.entryFee * item.costMult); }

function isOppPrepItemDone(o, itemId) {
  var p = getOppPrep(o.id);
  if (itemId === 'duediligence') return p.duediligenceUntil > 0 && Date.now() >= p.duediligenceUntil;
  return !!p[itemId];
}

function getOppReadiness(o) {
  var r = 0;
  OPP_PREP_ITEMS.forEach(function(it) { if (isOppPrepItemDone(o, it.id)) r += it.readiness; });
  return Math.min(100, r);
}

function getOppSuccessChance(o) {
  var readiness = getOppReadiness(o) / 100;
  var repBonus = Math.min(0.25, getReputationLifetime() * 0.00002); // your standing/connections help
  return Math.max(0.05, Math.min(0.95, o.baseSuccessChance + readiness * OPP_READINESS_WIN_WEIGHT + repBonus));
}

function getOppBackfireChance(o) {
  var readiness = getOppReadiness(o) / 100;
  var repFactor = Math.min(0.10, getReputationLifetime() * 0.000008);
  var chance = o.backfire.baseChance - readiness * (o.backfire.baseChance - o.backfire.minChance) - repFactor;
  if (isOppPrepItemDone(o, 'seguro')) chance *= 0.5;
  return Math.max(0.02, Math.min(o.backfire.baseChance, chance));
}

function getOppLockReason(o) {
  if (game.level < o.reqLevel) return 'Level ' + o.reqLevel;
  if (getReputationLifetime() < o.reqRepLifetime) return o.reqRepLifetime + ' fame (accumulated rep)';
  return null;
}

// ---- Gym setback (the "damage" when a venture goes wrong) ----
function isGymSetbackActive() {
  return !!(game.gymSetback && game.gymSetback.active && Date.now() < game.gymSetback.until);
}
function getGymSetbackSecondsLeft() {
  return isGymSetbackActive() ? Math.ceil((game.gymSetback.until - Date.now()) / 1000) : 0;
}
function getGymSetbackIncomeMult() {
  return isGymSetbackActive() ? (game.gymSetback.incomeMult || 1) : 1;
}
function getGymSetbackRepMult() {
  return isGymSetbackActive() ? 0.5 : 1; // bad press also slows reputation generation
}

function buyOppPrep(oId, itemId) {
  var o = getOpportunity(oId);
  if (!o) return;
  var it = OPP_PREP_ITEMS.find(function(i) { return i.id === itemId; });
  if (!it) return;
  var p = getOppPrep(oId);
  var cost = getOppPrepItemCost(o, it);

  if (itemId === 'duediligence') {
    if (isOppPrepItemDone(o, 'duediligence')) { showToast('✅', 'The due diligence is already done.'); return; }
    if (p.duediligenceUntil > 0 && Date.now() < p.duediligenceUntil) { showToast('⏳', 'The due diligence is already in progress.'); return; }
    if (game.money < cost) { showToast('❌', 'Not enough cash!'); return; }
    game.money -= cost;
    p.duediligenceUntil = Date.now() + o.dueDiligenceSecs * 1000;
    addLog('🔍 The <span class="highlight">due diligence</span> for ' + o.name + ' began.');
    showToast('🔍', 'Due diligence started');
  } else {
    if (p[itemId]) { showToast('✅', 'You already have it!'); return; }
    if (game.money < cost) { showToast('❌', 'Not enough cash!'); return; }
    game.money -= cost;
    p[itemId] = true;
    addLog('✅ You got <span class="highlight">' + it.name + '</span> for ' + o.name + '. (-' + fmtMoney(cost) + ')');
    showToast(it.icon, it.name + ' ready');
  }
  renderCityMap();
  updateUI();
  saveGame();
}

function attemptOpportunity(oId) {
  var o = getOpportunity(oId);
  if (!o) return;

  var lock = getOppLockReason(o);
  if (lock) { showToast('🔒', 'Requirement: ' + lock); return; }

  var state = getOppState(oId);
  if (Date.now() < state.cooldownUntil) { showToast('⏱️', 'Still on cooldown.'); return; }

  var p = getOppPrep(oId);
  if (!p.permisos) { showToast('📋', 'You need Paperwork and Permits to enter!'); return; }
  if (game.money < o.entryFee) { showToast('❌', "You can't afford the entry fee (" + fmtMoney(o.entryFee) + ').'); return; }

  // ---- Commitment: the entry fee is paid and the cooldown starts (whatever happens) ----
  game.money -= o.entryFee;
  state.cooldownUntil = Date.now() + o.cooldown * 1000;

  var successChance = getOppSuccessChance(o);
  var backfireChance = getOppBackfireChance(o);
  var success = Math.random() < successChance;
  var backfired = Math.random() < backfireChance;

  var result = { opportunity: o, success: success, backfired: backfired, money: 0, rep: 0, members: 0, setbackSecs: 0, setback: o.backfire, successChance: successChance, backfireChance: backfireChance, newTitle: null };

  if (success) {
    var money = Math.max(Math.ceil(o.reward.money), Math.ceil(getIncomePerSecond() * o.floorSecs));
    var rep = Math.ceil(o.reward.rep);
    var members = o.reward.membersPct ? Math.ceil(getMaxMembers() * o.reward.membersPct) : 0;
    game.money += money;
    game.totalMoneyEarned += money;
    game.reputation += rep;
    if (members) game.members = Math.min(getMaxMembers(), game.members + members);
    state.wins++;
    game.stats.oppWins = (game.stats.oppWins || 0) + 1;
    game.dailyTracking.moneyEarned += money;
    game.dailyTracking.reputationGained += rep;
    result.money = money; result.rep = rep; result.members = members;

    addLog('💼 SUCCESS at <span class="highlight">' + o.name + '</span>! +<span class="money-log">' + fmtMoney(money) + '</span>' + (members ? ' +' + members + ' members' : ''), 'important');
    showToast('💰', o.name + ' paid off!');
    floatNumber('+' + fmtMoney(money));
  } else {
    var consolationRep = Math.ceil(o.reward.rep * 0.05);
    game.reputation += consolationRep;
    state.losses++;
    game.stats.oppLosses = (game.stats.oppLosses || 0) + 1;
    game.dailyTracking.reputationGained += consolationRep;
    result.rep = consolationRep;

    addLog('💼 <span class="highlight">' + o.name + '</span> didn\'t pan out. You lost the entry fee.');
    showToast('😞', o.name + ' failed');
  }

  // ---- Backfire: temporary gym setback (mitigated by prep + insurance + fame) ----
  if (backfired) {
    var sb = applyGymSetback(o);
    result.setbackSecs = sb.secs;
    game.stats.gymSetbacks = (game.stats.gymSetbacks || 0) + 1;
    addLog('🚨 <span class="highlight">' + o.backfire.name + '</span>: income -' + Math.round(o.backfire.incomePenalty * 100) + '% for ~' + fmtTime(sb.secs) + '.', 'important');
  }

  // Prep is consumed
  game.oppPrep[oId] = { permisos: false, contactos: false, seguro: false, duediligenceUntil: 0 };

  checkLevelUp();
  checkAchievements();
  checkMissionProgress();
  if (typeof showOpportunityResult === 'function') showOpportunityResult(result);
  if (typeof renderCityMap === 'function') renderCityMap();
  updateUI();
  saveGame();
}

function applyGymSetback(o) {
  var severity = 0.4 + Math.random() * 0.6;                 // 0.4 - 1.0 (scales the DURATION)
  if (isOppPrepItemDone(o, 'seguro')) severity *= 0.6;     // insurance shortens the hit
  severity = Math.max(0.2, Math.min(1, severity));
  var secs = Math.ceil(severity * o.backfire.maxHours * 3600);
  game.gymSetback = {
    active: true, name: o.backfire.name, icon: o.backfire.icon,
    until: Date.now() + secs * 1000, incomeMult: 1 - o.backfire.incomePenalty,
  };
  return { secs: secs, severity: severity };
}

// Tick: notifies when the gym recovers from the setback
function checkGymSetback() {
  if (game.gymSetback && game.gymSetback.active && Date.now() >= game.gymSetback.until) {
    var name = game.gymSetback.name;
    game.gymSetback = { active: false, name: '', icon: '', until: 0, incomeMult: 1 };
    addLog('💚 Your gym recovered from "' + name + '". Income back to normal.', 'important');
    showToast('💚', 'Gym recovered!');
    if (typeof renderCityMap === 'function') renderCityMap();
  }
}

// Tick: notifies when a due diligence ends
function checkOppDueDiligence() {
  if (!game.oppPrep) return;
  Object.keys(game.oppPrep).forEach(function(id) {
    var p = game.oppPrep[id];
    if (p.duediligenceUntil > 0 && !p._ddDone && Date.now() >= p.duediligenceUntil) {
      p._ddDone = true;
      var o = getOpportunity(id);
      addLog('🔍 Due diligence finished for <span class="highlight">' + (o ? o.name : 'the opportunity') + '</span>. Readiness set.');
      if (typeof renderCityMap === 'function') renderCityMap();
    } else if (p.duediligenceUntil > 0 && Date.now() < p.duediligenceUntil) {
      p._ddDone = false;
    }
  });
}

function equipChampion(eqId) {
  if (!game.champion || !game.champion.recruited) return;
  var eq = CHAMPION_EQUIPMENT.find(function(e) { return e.id === eqId; });
  if (!eq) return;
  if (game.champion.level < eq.reqChampLevel) return;
  if (game.money < eq.cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= eq.cost;
  game.champion.equipment[eq.slot] = eq.id;
  addLog('🏅 Champion equipped <span class="highlight">' + eq.icon + ' ' + eq.name + '</span>');
  showToast(eq.icon, eq.name + ' equipped!');
  renderChampion();
  updateUI();
  checkAchievements();
  saveGame();
}


// ===== PRESTIGE =====
function getPrestigeStars() {
  // Franchise stars scale with total money earned (global). Capped + slower curve to avoid runaway inflation.
  if (game.totalMoneyEarned < 8000000) return 0;
  return Math.min(10, Math.floor(Math.sqrt(game.totalMoneyEarned / 8000000)));
}

function doPrestige() {
  // Redirect to city map — old prestige is replaced by branch system
  switchTab('prestige');
  showToast('🏙️', 'Open a new branch from the city map');
}

// ===== SESSION TIMER =====
function updateGameClock() {
  var el = document.getElementById('gameDayDisplay');
  if (!el) return;
  var day = Math.floor(game.tickCount / 600) + 1;
  var tickInDay = game.tickCount % 600;
  // Map 600 ticks to 06:00–05:59 (24h cycle, gym opens at 6am)
  var totalMinutes = Math.floor(tickInDay * 1440 / 600); // 0-1439 minutes in a 24h day
  var hour = Math.floor((totalMinutes / 60 + 6) % 24); // offset to start at 6:00
  var minute = totalMinutes % 60;
  var timeStr = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  el.textContent = 'Day ' + day + ' — ' + timeStr;
}

// ===== AUTO-MEMBER TICK =====
let autoMemberTimer = 0;
function autoMemberTick() {
  autoMemberTimer++;
  if (autoMemberTimer >= 25) {
    autoMemberTimer = 0;
    let autoAdd = 0;
    STAFF.forEach(s => {
      if (game.staff[s.id]?.hired && s.autoMembers) {
        autoAdd += getStaffTotalEffect(s, 'autoMembers');
      }
    });
    autoAdd = Math.ceil(autoAdd * getSkillEffect('autoMembersMult'));
    // Neighborhood member multiplier
    var hood = typeof getActiveNeighborhood === 'function' ? getActiveNeighborhood() : null;
    if (hood) autoAdd = Math.ceil(autoAdd * hood.memberMult);
    if (autoAdd > 0 && game.members < game.maxMembers) {
      const prev = game.members;
      game.members = Math.min(game.members + autoAdd, game.maxMembers);
      if (game.members > prev) {
        addLog('👥 +' + (game.members - prev) + ' new members (staff)');
      }
    }
  }
}

// ===== REP TICK =====
function repTick() {
  let repGain = game.members * 0.02 * getSkillEffect('memberRepMult');
  STAFF.forEach(s => {
    if (game.staff[s.id]?.hired && s.repMult) {
      repGain *= (1 + getStaffTotalEffect(s, 'repMult') * getSkillEffect('staffRepMult'));
    }
  });
  // Decoration reputation bonus
  repGain *= (1 + getDecorationBonus('reputation'));
  // Fame: the "Viral on Social" temporary boost doubles generation
  repGain *= getActiveFameBoosts().repMult;
  // Setback: bad press also slows reputation while it lasts
  repGain *= getGymSetbackRepMult();
  if (repGain > 0) {
    game.reputation += repGain;
    game.dailyTracking.reputationGained += repGain;
  }
}

// ===== CLASS TICK =====
function classTick() {
  GYM_CLASSES.forEach(gc => {
    const state = game.classes[gc.id];
    if (!state) return;

    // Class just finished — give rewards and set cooldown
    if (state.runningUntil && Date.now() >= state.runningUntil && !state.collected) {
      game.classes[gc.id].collected = true;
      game.classes[gc.id].cooldownUntil = Date.now() + gc.cooldown * 1000;
      var reward = getClassReward(gc);
      var commissionAmt = Math.ceil(reward.income * reward.commission);
      var netIncome = reward.income - commissionAmt;
      game.money += netIncome;
      game.totalMoneyEarned += netIncome;
      addXp(reward.xp);
      game.reputation += reward.rep;
      game.stats.classesCompleted++;
      game.dailyTracking.classesRun++;
      game.dailyTracking.moneyEarned += netIncome;
      game.dailyTracking.xpEarned += reward.xp;
      game.dailyTracking.reputationGained += reward.rep;

      var logMsg = '🧘 <span class="highlight">' + gc.name + '</span> class complete! +<span class="money-log">' + fmtMoney(netIncome) + '</span>';
      if (commissionAmt > 0) logMsg += ' <span style="color:var(--text-dim);">(commission: -' + fmtMoney(commissionAmt) + ')</span>';
      if (state.autoRestart) logMsg += ' <span style="color:var(--cyan);">🔄 auto</span>';
      addLog(logMsg);
      showToast(gc.icon, gc.name + ' class: +' + fmtMoney(netIncome) + '!');
      floatNumber('+' + fmtMoney(netIncome));

      checkAchievements();
      checkMissionProgress();
      renderClasses();
      return;
    }

    // Auto-restart: cooldown expired and toggle is on
    if (state.collected && state.cooldownUntil && Date.now() >= state.cooldownUntil && state.autoRestart) {
      startClass(gc.id);
    }
  });
}

// ===== SUPPLEMENT TICK (rep per min) =====
let supplementRepTimer = 0;
function supplementTick() {
  supplementRepTimer++;
  if (supplementRepTimer >= 60) {
    supplementRepTimer = 0;
    var effects = getActiveSupplementEffects();
    if (effects.repPerMin > 0) {
      game.reputation += effects.repPerMin;
      game.dailyTracking.reputationGained += effects.repPerMin;
    }
  }
}

// Always-on campaigns: deduct cost per tick, generate members & rep gradually
function campaignAlwaysOnTick() {
  MARKETING_CAMPAIGNS.forEach(function(mc) {
    if (mc.type !== 'always_on') return;
    var state = game.marketing[mc.id];
    if (!state || !state.active) return;

    // Cost per tick (game day = 600 ticks)
    var costPerTick = mc.costPerDay / 600;
    if (game.staff.manager && game.staff.manager.hired && !isStaffSick('manager', 0)) costPerTick *= 0.8;
    costPerTick *= getSkillEffect('campaignCostMult');

    if (game.money < costPerTick) {
      game.marketing[mc.id].active = false;
      addLog('⚠️ <span class="highlight">' + mc.name + '</span> campaign paused due to lack of funds.');
      showToast('⚠️', mc.name + ': out of funds, campaign paused!');
      return;
    }

    game.money -= costPerTick;
    state.totalSpent = (state.totalSpent || 0) + costPerTick;

    // Members per tick
    var membersPerTick = mc.membersPerDay / 600;
    membersPerTick *= getSkillEffect('campaignMembersMult');
    membersPerTick *= getActiveSupplementEffects().marketingMult;

    state.memberAccumulator = (state.memberAccumulator || 0) + membersPerTick;
    var wholeMembers = Math.floor(state.memberAccumulator);
    if (wholeMembers > 0) {
      state.memberAccumulator -= wholeMembers;
      var added = Math.min(wholeMembers, Math.max(0, game.maxMembers - game.members));
      if (added > 0) {
        game.members += added;
        game.stats.totalMembersJoined = (game.stats.totalMembersJoined || 0) + added;
        state.totalMembersGenerated = (state.totalMembersGenerated || 0) + added;
      }
    }

    // Rep per tick
    var repPerTick = mc.repPerDay / 600;
    repPerTick *= getSkillEffect('campaignRepMult');
    state.repAccumulator = (state.repAccumulator || 0) + repPerTick;
    var wholeRep = Math.floor(state.repAccumulator);
    if (wholeRep > 0) {
      state.repAccumulator -= wholeRep;
      game.reputation += wholeRep;
      game.dailyTracking.reputationGained += wholeRep;
    }
  });
}

// Burst campaigns: distribute promised members gradually over duration
function campaignBurstTick() {
  var now = Date.now();
  MARKETING_CAMPAIGNS.forEach(function(mc) {
    if (mc.type !== 'burst') return;
    var state = game.marketing[mc.id];
    if (!state || !state.activeUntil || now >= state.activeUntil) return;
    if (!state.membersToGive || (state.membersGiven || 0) >= state.membersToGive) return;
    var totalSec = (state.activeUntil - state.startedAt) / 1000;
    if (totalSec <= 0) return;
    var membersPerSec = state.membersToGive / totalSec;
    var newGiven = Math.min(state.membersToGive, (state.membersGiven || 0) + membersPerSec);
    var wholeDelta = Math.floor(newGiven) - Math.floor(state.membersGiven || 0);
    state.membersGiven = newGiven;
    if (wholeDelta > 0 && game.members < game.maxMembers) {
      game.members = Math.min(game.members + wholeDelta, game.maxMembers);
      game.stats.totalMembersJoined = (game.stats.totalMembersJoined || 0) + wholeDelta;
    }
  });
}

// ===== MAIN GAME TICK (every second) =====
function gameTick() {
  if (!game.started) return;
  if (!game.tutorialDone) { updateUI(); return; }

  const income = getIncomePerSecond();
  const salaries = getStaffSalaryPerSecond();
  const opCosts = getOperatingCostsPerSecond();
  const totalExpenses = salaries + opCosts;
  const netIncome = income - totalExpenses;
  game.money += netIncome;
  if (netIncome > 0) game.totalMoneyEarned += netIncome;
  game.dailyTracking.moneyEarned += Math.max(0, netIncome);
  if (netIncome !== 0) showFloatingIncome(netIncome);

  game.tickCount++;
  game.stats.totalPlayTime++;
  updateGameClock();
  checkTrainingCompletion();
  checkRepairCompletion();
  checkConstructionCompletion();
  checkSkillResearchCompletion();
  checkEquipmentBreakdown();
  checkStaffIllness();
  checkChampionTraining();
  championFatigueTick();
  checkChampionInjury();
  checkGrandConcentracion();
  checkGymSetback();
  checkOppDueDiligence();
  autoMemberTick();
  campaignAlwaysOnTick();
  campaignBurstTick();
  repTick();
  classTick();
  supplementTick();
  checkLevelUp();

  // Random event check
  checkRandomEvent();
  // VIP member check
  checkVipSpawn();
  checkVipExpiry();

  if (game.tickCount % 5 === 0) {
    checkAchievements();
    checkMissionProgress();
  }

  // Passive income from franchise branches flows directly to the owner's wallet
  if (game.tickCount % 10 === 0 && game.branches) {
    Object.keys(game.branches).forEach(function(id) {
      var passiveIncome = getBranchPassiveIncome(id);
      if (passiveIncome > 0) {
        var earned = passiveIncome * 10;
        game.money += earned;
        game.totalMoneyEarned += earned;
      }
    });
  }

  // Log rival member stealing every 5 min real time (300 ticks)
  if (game.tickCount % 300 === 0) {
    var stealTotal = getRivalMemberSteal();
    if (stealTotal > 0) {
      var stealerNames = [];
      RIVAL_GYMS.forEach(function(r) {
        if (game.level < r.reqLevel) return;
        var st = game.rivals[r.id];
        if (st && st.defeated) return;
        if (st && st.promoUntil && Date.now() < st.promoUntil) return;
        stealerNames.push(r.name);
      });
      var stealPct = Math.min(0.30, stealTotal * 0.0025 * getSkillEffect('rivalStealMult')) * (1 - getFamePerkEffect('retention'));
      if (stealerNames.length > 0 && stealPct > 0) {
        addLog('🏪 Active rivals are stealing <span class="highlight">' + Math.round(stealPct * 100) + '% of your members</span> (' + stealerNames.join(', ') + '). Run a promo or defeat them.');
      }
    }
  }

  // Supplement tolerance decay: once per game day (600 ticks)
  if (game.tickCount % 600 === 0) {
    supplementToleranceDecay();
  }

  if (game.tickCount % 30 === 0) {
    saveGame();
    if (typeof updateTabReminders === 'function') updateTabReminders();
    // Cloud save every 60 seconds
    if (game.tickCount % 60 === 0 && typeof saveCloudSave === 'function' && typeof currentUser !== 'undefined' && currentUser) {
      saveCloudSave();
    }
  }

  updateUI();

  // Refresh timers every 2 seconds (classes, marketing, supplements, rivals, staff training, equipment repair)
  if (game.tickCount % 2 === 0) {
    renderClasses();
    renderMarketing();
    renderSupplements();
    renderRivals();
    renderStaff();
    renderEquipment();
    renderExpansion();
    renderChampion();
    renderSkillTree();
    if (activeTab === 'prestige') renderCityMap();
  }

  // Refresh gym scene every 10 ticks (people count may change)
  if (game.tickCount % 10 === 0) {
    renderGymScene();
  }
}

// ===== MANUAL SAVE (button) =====
function manualSave() {
  saveGame();
  if (typeof saveCloudSave === 'function' && typeof currentUser !== 'undefined' && currentUser) {
    saveCloudSave();
  }
  showToast('💾', 'Game saved!');
}

// ===== OFFLINE PROGRESSION =====
function calculateOfflineProgress(elapsedSeconds) {
  var cap = 28800; // 8 hours max
  var capped = Math.min(elapsedSeconds, cap);
  if (capped < 10) return null;

  var report = {
    elapsed: capped,
    money: 0,
    expenses: 0,
    members: 0,
    reputation: 0,
    xp: 0,
    equipUpgraded: [],
    equipRepaired: [],
    zonesBuilt: [],
    staffTrained: [],
    classesCompleted: [],
    championTrained: null,
    championFatigue: 0,
    campaignCosts: 0,
    campaignMembers: 0,
    campaignRep: 0,
    burstCampaignsFinished: []
  };

  // 1. Net income (income - salaries - operating costs)
  // Offline penalty: only earn 10% of income when away
  var OFFLINE_INCOME_RATE = 0.10;
  var income = getIncomePerSecond();
  var salaries = getStaffSalaryPerSecond();
  var opCosts = getOperatingCostsPerSecond();
  var netIncome = income - salaries - opCosts;
  var totalMoney = Math.max(0, netIncome * capped * OFFLINE_INCOME_RATE);
  report.money = totalMoney;
  report.expenses = (salaries + opCosts) * capped;
  report.offlineRate = OFFLINE_INCOME_RATE;
  game.money += totalMoney;
  if (totalMoney > 0) {
    game.totalMoneyEarned += totalMoney;
  }

  // 1b. Skill research completion
  if (game.skillResearching && Date.now() >= game.skillResearching.until) {
    var rsId = game.skillResearching.skillId;
    game.skillResearching = null;
    game.skills[rsId] = true;
    game.stats.skillsResearched++;
    var skillInfo = null;
    Object.values(SKILL_TREE).forEach(function(branch) {
      branch.skills.forEach(function(s) { if (s.id === rsId) skillInfo = s; });
    });
    if (skillInfo) report.skillResearched = skillInfo.name;
  }

  // 2. Equipment upgrade completion
  EQUIPMENT.forEach(function(eq) {
    var state = game.equipment[eq.id];
    if (!state) return;
    if (state.upgradingUntil > 0 && Date.now() >= state.upgradingUntil) {
      state.upgradingUntil = 0;
      state.level++;
      report.equipUpgraded.push(eq.name + ' → LVL ' + state.level);
    }
  });

  // 3. Equipment repair completion
  EQUIPMENT.forEach(function(eq) {
    var state = game.equipment[eq.id];
    if (!state) return;
    if (state.brokenUntil > 0 && Date.now() >= state.brokenUntil) {
      state.brokenUntil = 0;
      game.stats.equipRepaired++;
      report.equipRepaired.push(eq.name);
    }
  });

  // 4. Zone construction completion
  if (game.zoneBuilding) {
    Object.keys(game.zoneBuilding).forEach(function(zId) {
      if (Date.now() >= game.zoneBuilding[zId]) {
        game.zones[zId] = true;
        delete game.zoneBuilding[zId];
        var zone = GYM_ZONES.find(function(z) { return z.id === zId; });
        if (zone) {
          game.stats.zonesUnlocked++;
          report.zonesBuilt.push(zone.name + ' ' + zone.icon);
        }
      }
    });
  }

  // 5. Staff training completion
  STAFF.forEach(function(s) {
    var state = game.staff[s.id];
    if (!state || !state.hired) return;
    if (state.trainingUntil > 0 && Date.now() >= state.trainingUntil) {
      state.level = (state.level || 1) + 1;
      var xpGain = 25 * state.level;
      addXp(xpGain);
      report.xp += xpGain;
      state.trainingUntil = 0;
      report.staffTrained.push(s.name + ' → LVL ' + state.level);
    }
    if (state.extras) {
      state.extras.forEach(function(ex, i) {
        if (ex.trainingUntil > 0 && Date.now() >= ex.trainingUntil) {
          ex.level = (ex.level || 1) + 1;
          var xpGain = 25 * ex.level;
          addXp(xpGain);
          report.xp += xpGain;
          ex.trainingUntil = 0;
          report.staffTrained.push(s.name + ' #' + (i + 2) + ' → LVL ' + ex.level);
        }
      });
    }
    // Clear illness if it expired
    if (state.sickUntil > 0 && Date.now() >= state.sickUntil) {
      state.sickUntil = 0;
    }
    if (state.extras) {
      state.extras.forEach(function(ex) {
        if (ex.sickUntil > 0 && Date.now() >= ex.sickUntil) ex.sickUntil = 0;
      });
    }
  });

  // 6. Class completion (with instructor commission)
  if (typeof GYM_CLASSES !== 'undefined') {
    GYM_CLASSES.forEach(function(gc) {
      var state = game.classes[gc.id];
      if (state && state.runningUntil && Date.now() >= state.runningUntil && !state.collected) {
        state.collected = true;
        var reward = getClassReward(gc);
        var commissionAmt = Math.ceil(reward.income * reward.commission);
        var netIncome = reward.income - commissionAmt;
        game.money += netIncome;
        game.totalMoneyEarned += netIncome;
        addXp(reward.xp);
        game.reputation += reward.rep;
        game.stats.classesCompleted++;
        report.classesCompleted.push(gc.name + ': +' + fmtMoney(netIncome) + (commissionAmt > 0 ? ' (commission: -' + fmtMoney(commissionAmt) + ')' : ''));
        report.xp += reward.xp;
        report.reputation += reward.rep;
        report.money += netIncome;
      }
    });
  }

  // 7. Always-on marketing campaigns (cost + members + rep)
  if (typeof MARKETING_CAMPAIGNS !== 'undefined') {
    MARKETING_CAMPAIGNS.forEach(function(mc) {
      if (mc.type !== 'always_on') return;
      var state = game.marketing[mc.id];
      if (!state || !state.active) return;

      var costPerTick = mc.costPerDay / 600;
      if (game.staff.manager && game.staff.manager.hired && !isStaffSick('manager', 0)) costPerTick *= 0.8;
      costPerTick *= getSkillEffect('campaignCostMult');
      var totalCampaignCost = costPerTick * capped;

      // Campaigns cost is capped so they never make money go negative
      totalCampaignCost = Math.min(totalCampaignCost, Math.max(0, game.money));
      if (totalCampaignCost > 0) {
        game.money -= totalCampaignCost;
        state.totalSpent = (state.totalSpent || 0) + totalCampaignCost;
        report.campaignCosts += totalCampaignCost;

        // Members generated (reduced offline)
        var membersPerTick = mc.membersPerDay / 600;
        membersPerTick *= getSkillEffect('campaignMembersMult');
        var totalNewMembers = Math.floor(membersPerTick * capped * OFFLINE_INCOME_RATE);
        var added = Math.min(totalNewMembers, Math.max(0, game.maxMembers - game.members));
        if (added > 0) {
          game.members += added;
          game.stats.totalMembersJoined = (game.stats.totalMembersJoined || 0) + added;
          state.totalMembersGenerated = (state.totalMembersGenerated || 0) + added;
          report.campaignMembers += added;
        }

        // Rep generated (reduced offline)
        var repPerTick = mc.repPerDay / 600;
        repPerTick *= getSkillEffect('campaignRepMult');
        var totalRep = repPerTick * capped * OFFLINE_INCOME_RATE;
        game.reputation += totalRep;
        report.campaignRep += totalRep;
      } else {
        // Not enough money - pause campaign
        game.marketing[mc.id].active = false;
      }
    });

    // 8. Burst campaign completion
    MARKETING_CAMPAIGNS.forEach(function(mc) {
      if (mc.type !== 'burst') return;
      var state = game.marketing[mc.id];
      if (!state || !state.activeUntil) return;
      if (Date.now() >= state.activeUntil && state.membersToGive > (state.membersGiven || 0)) {
        var remaining = state.membersToGive - (state.membersGiven || 0);
        var added = Math.min(remaining, Math.max(0, game.maxMembers - game.members));
        if (added > 0) {
          game.members += added;
          state.membersGiven = (state.membersGiven || 0) + added;
          report.campaignMembers += added;
          report.burstCampaignsFinished.push(mc.name);
        }
      }
    });
  }

  // 9. Reputation from members (passive) - reduced offline
  var repGain = game.members * 0.02 * getSkillEffect('memberRepMult');
  STAFF.forEach(function(s) {
    if (game.staff[s.id] && game.staff[s.id].hired && s.repMult) {
      repGain *= (1 + getStaffTotalEffect(s, 'repMult') * getSkillEffect('staffRepMult'));
    }
  });
  repGain *= (1 + getDecorationBonus('reputation'));
  var totalRep = repGain * capped * OFFLINE_INCOME_RATE;
  game.reputation += totalRep;
  report.reputation += totalRep;

  // 10. Auto-members from staff (every 25 ticks) - reduced offline
  var autoMemberCycles = Math.floor(capped / 25);
  if (autoMemberCycles > 0) {
    var autoAdd = 0;
    STAFF.forEach(function(s) {
      if (game.staff[s.id] && game.staff[s.id].hired && s.autoMembers) {
        autoAdd += getStaffTotalEffect(s, 'autoMembers');
      }
    });
    autoAdd = Math.ceil(autoAdd * getSkillEffect('autoMembersMult'));
    var totalAutoMembers = Math.floor(autoAdd * autoMemberCycles * OFFLINE_INCOME_RATE);
    var added = Math.min(totalAutoMembers, Math.max(0, game.maxMembers - game.members));
    if (added > 0) {
      game.members += added;
      report.members += added;
    }
  }

  // 11. Champion training completion + fatigue recovery
  if (game.champion && game.champion.recruited) {
    // Training completion
    if (game.champion.trainingUntil && Date.now() >= game.champion.trainingUntil) {
      var stat = game.champion.trainingStat;
      if (stat) {
        game.champion.stats[stat]++;
        report.championTrained = CHAMPION_STAT_NAMES[stat] + ' → ' + game.champion.stats[stat];
      }
      game.champion.trainingUntil = 0;
      game.champion.trainingStat = null;
    }
    // Fatigue recovery (every 30 ticks)
    if (game.champion.fatigue > 0) {
      var recoveryCycles = Math.floor(capped / 30);
      var stamina = getChampionEffectiveStat('stamina');
      var recoveryPerCycle = 3 + Math.floor(stamina * 0.6);
      var totalRecovery = recoveryCycles * recoveryPerCycle;
      var oldFatigue = game.champion.fatigue;
      game.champion.fatigue = Math.max(0, game.champion.fatigue - totalRecovery);
      report.championFatigue = oldFatigue - game.champion.fatigue;
    }
  }

  // 12. Supplement expiry (just let them expire naturally, no special handling needed)

  // 13. Passive income for inactive branches during offline time
  report.inactiveBranchIncome = 0;
  if (game.branches) {
    Object.keys(game.branches).forEach(function(id) {
      var passiveIncome = getBranchPassiveIncome(id);
      var passiveMoney = Math.max(0, passiveIncome * capped * OFFLINE_INCOME_RATE);
      if (passiveMoney > 0) {
        game.money += passiveMoney;
        game.totalMoneyEarned += passiveMoney;
        report.inactiveBranchIncome += passiveMoney;
      }
    });
  }

  // 14. Level up check
  checkLevelUp();

  // 15. Update members count
  updateMembers();

  return report;
}

function showOfflineReport(report) {
  if (!report) return;

  var lines = [];
  lines.push('<div class="offline-report-header">');
  lines.push('<div class="offline-report-icon">💤</div>');
  lines.push('<h3>While you were away...</h3>');
  lines.push('<div class="offline-report-time">' + fmtTime(report.elapsed) + ' offline</div>');
  if (report.offlineRate && report.offlineRate < 1) {
    lines.push('<div class="offline-report-rate">📉 Your gym earned ' + Math.round(report.offlineRate * 100) + '% of its profits without you at the helm</div>');
  }
  lines.push('</div>');

  lines.push('<div class="offline-report-body">');

  // Money section
  if (report.money > 0 || report.expenses > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">💰 Economy</div>');
    if (report.money > 0) lines.push('<div class="offline-item positive">Gross income: +' + fmtMoney(report.money) + '</div>');
    if (report.expenses > 0) lines.push('<div class="offline-item negative">Expenses (salaries + maintenance): -' + fmtMoney(report.expenses) + '</div>');
    var net = report.money - report.expenses;
    lines.push('<div class="offline-item ' + (net >= 0 ? 'positive' : 'negative') + ' net">Net: ' + (net >= 0 ? '+' : '') + fmtMoney(net) + '</div>');
    lines.push('</div>');
  }

  // Construction & upgrades
  var constructions = [].concat(report.equipUpgraded, report.equipRepaired, report.zonesBuilt, report.staffTrained);
  if (constructions.length > 0 || report.skillResearched) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">🏗️ Completed</div>');
    if (report.skillResearched) lines.push('<div class="offline-item">🔬 Research: ' + report.skillResearched + '</div>');
    report.equipUpgraded.forEach(function(e) { lines.push('<div class="offline-item">⬆️ ' + e + '</div>'); });
    report.equipRepaired.forEach(function(e) { lines.push('<div class="offline-item">🔧 ' + e + ' repaired</div>'); });
    report.zonesBuilt.forEach(function(e) { lines.push('<div class="offline-item">🏗️ ' + e + '</div>'); });
    report.staffTrained.forEach(function(e) { lines.push('<div class="offline-item">🎓 ' + e + '</div>'); });
    lines.push('</div>');
  }

  // Classes
  if (report.classesCompleted.length > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">🧘 Classes Completed</div>');
    report.classesCompleted.forEach(function(c) { lines.push('<div class="offline-item">✅ ' + c + '</div>'); });
    lines.push('</div>');
  }

  // Marketing
  if (report.campaignMembers > 0 || report.campaignCosts > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">📢 Marketing</div>');
    if (report.campaignCosts > 0) lines.push('<div class="offline-item negative">Campaign cost: -' + fmtMoney(report.campaignCosts) + '</div>');
    if (report.campaignMembers > 0) lines.push('<div class="offline-item positive">New members: +' + report.campaignMembers + '</div>');
    if (report.campaignRep > 0) lines.push('<div class="offline-item positive">Reputation: +' + fmt(report.campaignRep) + '</div>');
    report.burstCampaignsFinished.forEach(function(c) { lines.push('<div class="offline-item">📣 ' + c + ' finished</div>'); });
    lines.push('</div>');
  }

  // Members & Rep
  if (report.members > 0 || report.reputation > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">👥 Growth</div>');
    if (report.members > 0) lines.push('<div class="offline-item positive">Members (staff): +' + report.members + '</div>');
    if (report.reputation > 0) lines.push('<div class="offline-item positive">Reputation: +' + fmt(Math.floor(report.reputation)) + '</div>');
    if (report.xp > 0) lines.push('<div class="offline-item positive">XP: +' + fmt(report.xp) + '</div>');
    lines.push('</div>');
  }

  // Inactive branches
  if (report.inactiveBranchIncome > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">🏙️ Other Branches</div>');
    lines.push('<div class="offline-item positive">Passive income: +' + fmtMoney(report.inactiveBranchIncome) + '</div>');
    lines.push('</div>');
  }

  // Champion
  if (report.championTrained || report.championFatigue > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">🏆 Champion</div>');
    if (report.championTrained) lines.push('<div class="offline-item">💪 Training complete: ' + report.championTrained + '</div>');
    if (report.championFatigue > 0) lines.push('<div class="offline-item positive">Fatigue recovered: -' + report.championFatigue + '</div>');
    lines.push('</div>');
  }

  lines.push('</div>'); // close body

  lines.push('<div class="offline-report-footer">');
  lines.push('<button class="btn btn-buy" onclick="closeOfflineReport()">Let\'s go! 💪</button>');
  lines.push('</div>');

  // Show modal
  var modal = document.getElementById('offlineReportModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'offlineReportModal';
    modal.className = 'offline-report-overlay';
    document.body.appendChild(modal);
  }
  modal.innerHTML = '<div class="offline-report-card">' + lines.join('') + '</div>';
  modal.style.display = 'flex';
}

function closeOfflineReport() {
  var modal = document.getElementById('offlineReportModal');
  if (modal) modal.style.display = 'none';
}

// ===== SAVE / LOAD =====
var _lastCloudSaveTime = 0;
function saveGame() {
  try {
    localStorage.setItem('ironEmpireSave', JSON.stringify(game));
    localStorage.setItem('ironEmpireLastTick', Date.now().toString());
    if (typeof flashSaveIndicator === 'function') flashSaveIndicator();
  } catch (e) { /* silently fail */ }
  // Also trigger cloud save if logged in (throttled to once every 30s)
  var now = Date.now();
  if (now - _lastCloudSaveTime > 30000 && typeof saveCloudSave === 'function' && typeof currentUser !== 'undefined' && currentUser) {
    _lastCloudSaveTime = now;
    saveCloudSave();
  }
}

function loadGame() {
  try {
    const saved = localStorage.getItem('ironEmpireSave');
    if (saved) {
      const data = JSON.parse(saved);
      // Deep merge preserving new default properties
      game = deepMerge(game, data);
      // Migrate old "active branch swap" saves → passive franchise model + ensure new fields
      normalizeBranchesOnLoad();
      return true;
    }
  } catch (e) { /* silently fail */ }
  return false;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function exportSave() {
  const data = JSON.stringify(game);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'iron-empire-save.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('💾', 'Game exported!');
}

function importSave() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        game = deepMerge(game, data);
        renderAll();
        updateUI();
        saveGame();
        showToast('📂', 'Game imported!');
      } catch (err) {
        showToast('❌', 'Import error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetGame() {
  if (!confirm('Are you sure? This permanently deletes ALL progress.')) return;
  if (!confirm('Really sure? There\'s no going back.')) return;
  // Flag FIRST — onAuthSuccess checks it and skips all cloud loading on reload
  localStorage.setItem('ironEmpireReset', '1');
  localStorage.removeItem('ironEmpireSave');
  localStorage.removeItem('ironEmpireLastTick');
  // Fire-and-forget cloud delete (the flag guarantees the reset even if the delete doesn't go through)
  if (typeof currentUser !== 'undefined' && currentUser && typeof db !== 'undefined') {
    db.collection('saves').doc(currentUser.uid).delete().catch(function() {});
    db.collection('leaderboard').doc(currentUser.uid).delete().catch(function() {});
  }
  location.reload();
}

// ===== RENDER ALL =====
function renderAll() {
  normalizeStaffData();
  normalizeEquipmentData();
  normalizeChampionData();
  normalizeOpportunityData();
  normalizeProfileData();
  normalizeFameData();
  applyTheme();
  renderEquipment();
  renderStaff();
  renderAchievements();
  renderClasses();
  renderMarketing();
  renderSupplements();
  renderRivals();
  renderFameShop();
  renderDailyMissions();
  renderDailyBonus();
  renderSkillTree();
  renderExpansion();
  renderVipMembers();
  renderChampion();
  renderProfile();
  renderLog();
  renderGymScene();
  updateUI();
  updateTabNotifications();
  updateTabVisibility(false);
}

// ===== START GAME =====
function startGame() {
  const nameInput = document.getElementById('gymNameInput');
  const name = nameInput.value.trim() || 'Iron Empire';
  game.gymName = name;
  game.started = true;

  // Initialize franchise system for new games
  if (!game.mainNeighborhoodId) game.mainNeighborhoodId = 'palermo';
  if (!game.branches) game.branches = {};
  if (!game.branchCount) game.branchCount = 1;

  document.getElementById('nameModal').classList.add('hidden');

  addLog('🏋️ <span class="highlight">' + game.gymName + '</span> opened its doors!');
  showToast('🏋️', game.gymName + ' is open!');

  // Generate first daily missions
  generateDailyMissions();

  renderAll();
  saveGame();

  // Start game loop
  setInterval(gameTick, 1000);

  // Start tutorial for new players
  if (!game.tutorialDone) {
    game.money = 100; // Starting money for tutorial (buy first equipment)
    renderAll();
    setTimeout(() => startTutorial(), 1000);
  }
}

// ===== TAB PROGRESSIVE UNLOCK =====
const TAB_UNLOCK_LEVELS = {
  gym: 1, missions: 1, achievements: 1, settings: 1, wiki: 1,
  equipment: 1, staff: 1, marketing: 1,
  profile: 3,
  classes: 3,
  rivals: 4,
  supplements: 5,
  fame: 5,
  skills: 5,
  expansion: 6,
  vip: 6,
  prestige: 7,
  champion: 8,
};

function updateTabVisibility(isLevelUp) {
  var newlyUnlocked = [];
  document.querySelectorAll('.sidebar-item[data-tab]').forEach(function(item) {
    var tabId = item.dataset.tab;
    var minLevel = TAB_UNLOCK_LEVELS[tabId] || 1;
    var shouldBeVisible = game.level >= minLevel;
    var wasHidden = item.classList.contains('tab-hidden');
    if (isLevelUp && shouldBeVisible && wasHidden) newlyUnlocked.push(tabId);
    item.classList.toggle('tab-hidden', !shouldBeVisible);
  });
  document.querySelectorAll('.sidebar-category').forEach(function(cat) {
    var visibleItems = cat.querySelectorAll('.sidebar-item:not(.tab-hidden)');
    cat.classList.toggle('tab-hidden', visibleItems.length === 0);
  });
  if (newlyUnlocked.length > 0) {
    newlyUnlocked.forEach(function(tabId) {
      var item = document.querySelector('.sidebar-item[data-tab="' + tabId + '"]');
      var label = item ? item.querySelector('.item-label') : null;
      addLog('🔓 New section unlocked: <span class="highlight">' + (label ? label.textContent : tabId) + '</span>!', 'important');
    });
    showToast('🔓', newlyUnlocked.length === 1 ? 'New section unlocked!' : newlyUnlocked.length + ' new sections!');
  }
}

// ===== SIDEBAR NAVIGATION =====
var activeTab = 'gym';

function switchTab(tabId) {
  document.querySelectorAll('.sidebar-item').forEach(function(i) { i.classList.remove('active'); });
  document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });

  var item = document.querySelector('.sidebar-item[data-tab="' + tabId + '"]');
  if (item) item.classList.add('active');
  var tabEl = document.getElementById('tab-' + tabId);
  if (tabEl) tabEl.classList.add('active');

  activeTab = tabId;

  // First-visit walkthrough
  if (game.tutorialDone && !game.tabsSeen[tabId] && typeof TAB_WALKTHROUGHS !== 'undefined' && TAB_WALKTHROUGHS[tabId]) {
    setTimeout(function() { showTabWalkthrough(tabId); }, 150);
  }

  // Track last visited time for reminders
  if (!game.tabLastVisited) game.tabLastVisited = {};
  game.tabLastVisited[tabId] = Date.now();

  // Ensure parent category is expanded
  if (item) {
    var category = item.closest('.sidebar-category');
    if (category) category.classList.remove('collapsed-cat');
  }

  // Daily bonus banner: only on Home (recovers vertical space on the other tabs)
  var dbc = document.getElementById('dailyBonusContainer');
  if (dbc) {
    if (tabId === 'gym') renderDailyBonus(); // renderDailyBonus auto-hides if already claimed
    else dbc.style.display = 'none';
  }

  // Tab-specific actions
  if (tabId === 'prestige') { renderCityMap(); renderLeaderboard(); }
  if (tabId === 'fame') renderFameShop();
  if (tabId === 'wiki') renderWiki();
  if (tabId === 'achievements') {
    game._lastSeenAchievementCount = ACHIEVEMENTS.filter(function(a) { return game.achievements[a.id]; }).length;
  }

  // Mobile: close sidebar after selection
  closeMobileSidebar();
}

function closeMobileSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

function saveSidebarState() {
  try {
    var sidebar = document.getElementById('sidebar');
    var state = { collapsed: sidebar.classList.contains('collapsed'), categories: {} };
    document.querySelectorAll('.sidebar-category').forEach(function(cat) {
      state.categories[cat.dataset.category] = !cat.classList.contains('collapsed-cat');
    });
    localStorage.setItem('ironEmpireSidebar', JSON.stringify(state));
  } catch(e) {}
}

function restoreSidebarState() {
  try {
    var raw = localStorage.getItem('ironEmpireSidebar');
    if (!raw) return;
    var state = JSON.parse(raw);
    if (state.collapsed) document.getElementById('sidebar').classList.add('collapsed');
    var cats = state.categories || {};
    for (var catId in cats) {
      if (!cats[catId]) {
        var cat = document.querySelector('[data-category="' + catId + '"]');
        if (cat) cat.classList.add('collapsed-cat');
      }
    }
  } catch(e) {}
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  // Hide name modal by default (auth screen shows first)
  document.getElementById('nameModal').classList.add('hidden');

  // Sidebar item clicks
  document.querySelectorAll('.sidebar-item').forEach(function(item) {
    item.addEventListener('click', function() { switchTab(item.dataset.tab); });
  });

  // Category toggle (collapse/expand)
  document.querySelectorAll('.sidebar-category-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var cat = btn.closest('.sidebar-category');
      cat.classList.toggle('collapsed-cat');
      saveSidebarState();
    });
  });

  // Sidebar collapse toggle (desktop)
  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    saveSidebarState();
  });

  // Mobile hamburger
  document.getElementById('hamburgerBtn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
  });

  // Overlay click closes sidebar
  document.getElementById('sidebarOverlay').addEventListener('click', closeMobileSidebar);

  // Restore sidebar state
  restoreSidebarState();

  // Enter key for name modal
  document.getElementById('gymNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startGame();
  });

  // Enter key for auth forms
  document.getElementById('loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginWithEmail();
  });
  document.getElementById('regPassword2').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') registerWithEmail();
  });
  document.getElementById('resetEmail').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') resetPassword();
  });
});
