// ===== IRON EMPIRE - GAME ENGINE =====

let game = {
  gymName: 'Mi Gimnasio',
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
  activeBranch: null,
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

  // Gym zones
  zones: { ground_floor: true },
  zoneBuilding: {},

  // Champion
  champion: {
    recruited: false,
    name: 'Campeón',
    stats: { fuerza: 1, resistencia: 1, velocidad: 1, tecnica: 1, stamina: 1, mentalidad: 1 },
    level: 1,
    xp: 0,
    fatigue: 0,
    equipment: { hands: null, waist: null, feet: null, head: null },
    trainingUntil: 0,
    trainingStat: null,
    wins: 0,
    losses: 0,
  },

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

// ===== BRANCH SYSTEM =====
const BRANCH_PROPERTIES = [
  'gymName', 'money', 'totalMoneyEarned', 'members', 'maxMembers', 'reputation',
  'level', 'xp', 'xpToNext', 'equipment', 'staff', 'competitions',
  'classes', 'instructors', 'marketing', 'supplements', 'rivals',
  'zones', 'zoneBuilding', 'ownProperty', 'vipMembers', 'lastVipTime',
  'nextVipIn', 'lastEventTime', 'nextEventIn', 'log', 'tickCount',
  'dailyTracking', 'decoration'
];

function extractBranchData(neighborhoodId) {
  var data = {};
  BRANCH_PROPERTIES.forEach(function(key) {
    var val = game[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      data[key] = JSON.parse(JSON.stringify(val));
    } else if (Array.isArray(val)) {
      data[key] = JSON.parse(JSON.stringify(val));
    } else {
      data[key] = val;
    }
  });
  // Preserve neighborhoodId: use explicit param > existing branch data > fallback
  if (neighborhoodId) {
    data.neighborhoodId = neighborhoodId;
  } else if (game.activeBranch && game.branches[game.activeBranch] && game.branches[game.activeBranch].neighborhoodId) {
    data.neighborhoodId = game.branches[game.activeBranch].neighborhoodId;
  }
  return data;
}

function applyBranchToGame(branchData) {
  BRANCH_PROPERTIES.forEach(function(key) {
    if (branchData.hasOwnProperty(key)) {
      game[key] = branchData[key];
    }
  });
}

function switchBranch(branchId) {
  if (branchId === game.activeBranch) return;
  if (!game.branches[branchId]) return;
  // Save current branch (preserve its neighborhoodId)
  if (game.activeBranch && game.branches[game.activeBranch]) {
    var oldHood = game.branches[game.activeBranch].neighborhoodId;
    game.branches[game.activeBranch] = extractBranchData(oldHood);
  }
  // Load target branch
  applyBranchToGame(game.branches[branchId]);
  game.activeBranch = branchId;
  var hood = getNeighborhoodForBranch(branchId);
  showToast('📍', '¡Cambiaste a ' + (hood ? hood.name : 'sucursal') + '!');
  renderAll();
  updateUI();
}

function getNeighborhoodForBranch(branchId) {
  var branch = game.branches[branchId];
  if (!branch || !branch.neighborhoodId) return NEIGHBORHOODS[0];
  return NEIGHBORHOODS.find(function(n) { return n.id === branch.neighborhoodId; }) || NEIGHBORHOODS[0];
}

function getActiveNeighborhood() {
  if (!game.activeBranch || !game.branches[game.activeBranch]) return NEIGHBORHOODS[0];
  var nId = game.branches[game.activeBranch].neighborhoodId;
  return NEIGHBORHOODS.find(function(n) { return n.id === nId; }) || NEIGHBORHOODS[0];
}

function getBranchPassiveIncome(branchId) {
  var branch = game.branches[branchId];
  if (!branch) return 0;
  var base = 0;
  EQUIPMENT.forEach(function(eq) {
    var lvl = branch.equipment[eq.id]?.level || 0;
    base += eq.incomePerLevel * lvl;
  });
  var zoneIncome = 0;
  GYM_ZONES.forEach(function(z) {
    if (branch.zones && branch.zones[z.id]) zoneIncome += z.incomeBonus;
  });
  var prestigeMult = 1 + (game.prestigeStars * 0.25);
  return (base + zoneIncome) * prestigeMult * 0.5; // 50% of active rate
}

function getTotalEmpireIncomePerSecond() {
  var total = getIncomePerSecond(); // active branch full income
  Object.keys(game.branches).forEach(function(id) {
    if (id === game.activeBranch) return;
    total += getBranchPassiveIncome(id);
  });
  return total;
}

function getDefaultBranchState() {
  return {
    gymName: 'Mi Gimnasio',
    money: 0,
    totalMoneyEarned: 0,
    members: 0,
    maxMembers: 10,
    reputation: 0,
    level: 1,
    xp: 0,
    xpToNext: 100,
    equipment: {},
    staff: {},
    competitions: {},
    classes: {},
    instructors: {},
    marketing: {},
    supplements: {},
    rivals: {},
    zones: { ground_floor: true },
    zoneBuilding: {},
    ownProperty: false,
    vipMembers: [],
    lastVipTime: 0,
    nextVipIn: 300,
    lastEventTime: 0,
    nextEventIn: 180,
    log: [],
    tickCount: 0,
    dailyTracking: {
      moneyEarned: 0, equipmentBought: 0, competitionsWon: 0,
      reputationGained: 0, classesRun: 0, campaignsLaunched: 0,
      xpEarned: 0, eventsHandled: 0, supplementsBought: 0,
    },
    decoration: { theme: 'classic', unlockedThemes: ['classic'], items: {} }
  };
}

// ===== UTILITY FUNCTIONS =====
function fmt(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n).toLocaleString('es-AR');
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
  if (game.staff.manager?.hired && !isStaffTraining('manager', 0)) {
    var mgrDef = STAFF.find(s => s.id === 'manager');
    cost *= (1 - mgrDef.costReduction * getStaffLevelMult(game.staff.manager.level || 1));
  }
  cost *= getSkillEffect('equipCostMult');
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
    showToast('❌', '¡Ya hay 2 entrenamientos en curso!');
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
    showToast('❌', '¡Nivel máximo alcanzado!');
    return;
  }

  var cost = getTrainingCost(s, level);
  if (game.money < cost) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= cost;
  var duration = Math.ceil(getTrainingDuration(level + 1) * getSkillEffect('trainingSpeedMult'));
  target.trainingUntil = Date.now() + duration * 1000;

  addLog('📚 <span class="highlight">' + s.name + '</span> empezó entrenamiento a LVL ' + (level + 1) + ' (' + Math.floor(duration / 60) + ' min)');
  showToast('📚', s.name + ' entrenando → LVL ' + (level + 1));
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
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= cost;
  state.extras.push({ level: 1, trainingUntil: 0 });
  addLog('🤝 Contrataste otro <span class="highlight">' + s.name + '</span> (#' + (copyIdx + 1) + ')');
  showToast(s.icon, '¡Nuevo ' + s.name + ' #' + (copyIdx + 1) + '!');
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
      game.xp += xpGain;
      game.dailyTracking.xpEarned += xpGain;
      addLog('🎓 <span class="highlight">' + s.name + '</span> subió a LVL ' + state.level + '!');
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
          game.xp += xpGain;
          game.dailyTracking.xpEarned += xpGain;
          addLog('🎓 <span class="highlight">' + s.name + ' #' + (i + 2) + '</span> subió a LVL ' + ex.level + '!');
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
  if (!game.champion.name) game.champion.name = 'Campeón';
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
  if (!game.stats.championWins) game.stats.championWins = 0;
  if (!game.stats.championCompetitions) game.stats.championCompetitions = 0;
  if (!game.stats.championTrainings) game.stats.championTrainings = 0;
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
  addLog('🎨 Desbloqueaste el tema <span class="highlight">' + theme.name + '</span>!');
  showToast(theme.icon, 'Tema ' + theme.name + ' desbloqueado!');
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
  addLog('🎨 Compraste <span class="highlight">' + item.name + '</span> ' + item.icon);
  showToast(item.icon, item.name + ' agregado al gym!');
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
    showToast('❌', '¡Ya hay ' + repairingCount + ' equipo(s) en reparación!');
    return;
  }

  var cost = getRepairCost(eq, state.level);
  if (game.money < cost) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= cost;
  var duration = Math.ceil(getRepairDuration(state.level) * getSkillEffect('repairSpeedMult'));
  state.brokenUntil = Date.now() + duration * 1000;

  addLog('🔧 Reparando <span class="highlight">' + eq.name + '</span> (' + Math.floor(duration / 60) + ' min ' + (duration % 60) + 's)');
  showToast('🔧', 'Reparando ' + eq.name + '...');
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
      addLog('⚠️ <span class="highlight">' + eq.name + '</span> se rompió! Reparación: ' + fmtMoney(repairCost));
      showToast('⚠️', '¡' + eq.name + ' se rompió!');
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
      addLog('✅ <span class="highlight">' + eq.name + '</span> reparado y funcionando!');
      showToast('✅', eq.name + ' reparado!');
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
      addLog('🏗️ <span class="highlight">' + eq.name + '</span> mejorado a nivel ' + state.level + '!');
      showToast('⬆️', eq.name + ' — Nivel ' + state.level + '!');
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
          addLog('🏗️ ¡Construcción terminada: <span class="highlight">' + zone.name + '</span>! ' + zone.icon);
          showToast(zone.icon, '¡' + zone.name + ' lista!');
          floatNumber('+' + zone.capacityBonus + ' capacidad', 'var(--accent)');
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
    var xpGain = 80;
    game.xp += xpGain;
    game.dailyTracking.xpEarned += xpGain;

    if (skillInfo) {
      addLog('🔬 Investigación completa: <span class="highlight">' + skillInfo.name + '</span> (' + SKILL_TREE[branchKey].name + ')');
      showToast(skillInfo.icon, '¡Mejora lista: ' + skillInfo.name + '!');
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
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= cost;
  target.sickUntil = 0;
  game.stats.staffHealed++;
  addLog('💊 <span class="highlight">' + s.name + '</span> se recuperó con tratamiento médico.');
  showToast('💊', s.name + ' curado!');
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
        addLog('🤒 <span class="highlight">' + s.name + '</span> se enfermó! Curar: ' + fmtMoney(healCost));
        showToast('🤒', s.name + ' se enfermó!');
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
            addLog('🤒 <span class="highlight">' + s.name + ' #' + (i + 2) + '</span> se enfermó!');
            showToast('🤒', s.name + ' #' + (i + 2) + ' se enfermó!');
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
  return totalIncome * suppEffects.incomeMult * (1 + decoIncome);
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
  // Combo bonus: Proteína + Creatina → +10% ingresos
  var proteinActive = game.supplements['protein'] && now < game.supplements['protein'].activeUntil;
  var creatineActive = game.supplements['creatine'] && now < game.supplements['creatine'].activeUntil;
  if (proteinActive && creatineActive) effects.incomeMult *= 1.1;
  return effects;
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
    showToast('❌', '¡Ya está activo!');
    return;
  }

  var cost = getSupplementCost(sup);

  if (game.money < cost) {
    showToast('❌', '¡No tenés suficiente plata!');
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
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  updateMembers();

  addLog('🧃 Suplemento <span class="highlight">' + sup.name + '</span> activado! Duración: ' + fmtTime(sup.duration));
  showToast(sup.icon, '¡' + sup.name + ' activado!');

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
    showToast('❌', '¡Ya tenés una promo activa contra este rival!');
    return;
  }

  var cost = getRivalPromoCost(rival);

  if (game.money < cost) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= cost;
  if (!game.rivals[id]) game.rivals[id] = {};
  game.rivals[id].promoUntil = Date.now() + rival.promoDuration * 1000;

  var xpGain = 20;
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  updateMembers();

  addLog('🏪 Promoción contra <span class="highlight">' + rival.name + '</span>! Neutralizado por ' + fmtTime(rival.promoDuration));
  showToast('📣', '¡Promo contra ' + rival.name + '!');

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
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  if (!confirm('¿Superar a ' + rival.name + ' por ' + fmtMoney(cost) + '? Bonus permanente al derrotarlo.')) return;

  game.money -= cost;
  if (!game.rivals[id]) game.rivals[id] = {};
  game.rivals[id].defeated = true;

  game.stats.rivalsDefeated++;

  var xpGain = 100;
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  var bonusParts = [];
  if (rival.defeatBonus.income) bonusParts.push('+' + rival.defeatBonus.income + ' income/s');
  if (rival.defeatBonus.capacity) bonusParts.push('+' + rival.defeatBonus.capacity + ' capacidad');

  updateMembers();

  addLog('🏆 ¡Superaste a <span class="highlight">' + rival.name + '</span>! Bonus: ' + bonusParts.join(', '));
  showToast('🏆', '¡' + rival.name + ' superado!');

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
    daily += OPERATING_COSTS.baseRent + (game.level * OPERATING_COSTS.rentPerLevel);
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

function getOperatingCostsPerSecond() {
  return getOperatingCostsPerDay() / 600;
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
    showToast('❌', '¡Ya sos dueño del local!');
    return;
  }
  if (game.level < OPERATING_COSTS.propertyReqLevel) return;
  if (game.money < OPERATING_COSTS.propertyPrice) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }
  if (!confirm('¿Comprar el local por ' + fmtMoney(OPERATING_COSTS.propertyPrice) + '? No pagás más alquiler.')) return;
  game.money -= OPERATING_COSTS.propertyPrice;
  game.ownProperty = true;
  addLog('🏠 ¡Compraste el local! No pagás más alquiler.');
  showToast('🏠', '¡Local propio! Sin más alquiler.');
  game.xp += 200;
  game.dailyTracking.xpEarned += 200;
  renderExpansion();
  updateUI();
  saveGame();
}

// ===== EVENT COST SCALING =====
function getEventCostScale() {
  var levelScale = 1 + (game.level - 1) * 0.2;
  // Scale with income so events always feel meaningful
  var income = getIncomePerSecond();
  var incomeScale = Math.max(1, income * 0.5);
  return Math.max(levelScale, incomeScale);
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
  // Marketing boost
  var campaignMembersMult = getSkillEffect('campaignMembersMult');
  MARKETING_CAMPAIGNS.forEach(mc => {
    const state = game.marketing[mc.id];
    if (state?.activeUntil && Date.now() < state.activeUntil) {
      base += Math.ceil(mc.membersBoost * campaignMembersMult);
    }
  });
  // Rival gyms steal members (reduced by skill)
  base = Math.max(0, base - Math.ceil(getRivalMemberSteal() * getSkillEffect('rivalStealMult')));
  return Math.min(base, getMaxMembers());
}

// ===== GYM TIER =====
function getGymTier() {
  const m = game.totalMoneyEarned;
  if (m >= 10000000) return '🏛️ Imperio del Fitness';
  if (m >= 5000000) return '🏛️ Mega Gym de Elite';
  if (m >= 1000000) return '🏢 Cadena Premium';
  if (m >= 500000) return '💎 Gym VIP';
  if (m >= 100000) return '🏋️ Gym Profesional';
  if (m >= 50000) return '💪 Gym Establecido';
  if (m >= 10000) return '🔨 Gym en Crecimiento';
  if (m >= 1000) return '🌱 Gym Principiante';
  return '🏠 Garage Gym';
}

// ===== LOGGING =====
function addLog(msg) {
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  game.log.unshift({ time, msg });
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
    showToast('❌', '¡Ya se está mejorando!');
    return;
  }

  // Equipment level cannot exceed player level
  if (state.level >= game.level) {
    showToast('❌', 'El equipo no puede superar tu nivel (' + game.level + ')');
    return;
  }

  const isNew = state.level === 0;

  // Concurrent upgrade limit only applies to upgrades, not new purchases
  if (!isNew) {
    var activeUpgrades = getActiveEquipUpgrades();
    var maxUpgrades = getMaxConcurrentUpgrades();
    if (activeUpgrades >= maxUpgrades) {
      showToast('❌', '¡Ya hay ' + activeUpgrades + ' mejora(s) en curso! Máx: ' + maxUpgrades);
      return;
    }
  }

  const cost = getEquipCost(eq, state.level);
  if (game.money < cost) return;

  game.money -= cost;
  if (!game.equipment[id]) game.equipment[id] = { level: 0, brokenUntil: 0, upgradingUntil: 0 };

  const nextLevel = state.level + 1;
  const xpGain = 15 + nextLevel * 3;
  game.xp += xpGain;
  game.dailyTracking.equipmentBought++;
  game.dailyTracking.xpEarned += xpGain;

  if (isNew) {
    // First purchase is instant
    game.equipment[id].level = 1;
    addLog('🛒 Compraste <span class="highlight">' + eq.name + '</span> ' + eq.icon);
    showToast(eq.icon, '¡Nuevo equipo: ' + eq.name + '!');
    updateMembers();
  } else {
    // Upgrades take time
    var duration = getEquipUpgradeDuration(state.level) * getSkillEffect('equipUpgradeSpeedMult') * 1000;
    game.equipment[id].upgradingUntil = Date.now() + duration;
    var secs = Math.ceil(duration / 1000);
    addLog('🏗️ Mejorando <span class="highlight">' + eq.name + '</span> a nivel ' + nextLevel + ' (' + fmtTime(secs) + ')');
    showToast('🏗️', 'Mejorando ' + eq.name + '... ' + fmtTime(secs));
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
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  addLog('🤝 Contrataste a <span class="highlight">' + s.name + '</span> (' + s.role + ')');
  showToast(s.icon, '¡' + s.name + ' se unió al equipo!');

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
    game.xp += Math.ceil(c.xpReward * compXpMult);
    game.competitions[id].wins++;
    game.stats.competitionsWon++;
    game.dailyTracking.competitionsWon++;
    game.dailyTracking.moneyEarned += reward;
    game.dailyTracking.reputationGained += c.repReward;
    game.dailyTracking.xpEarned += c.xpReward;
    addLog('🏆 ¡VICTORIA en <span class="highlight">' + c.name + '</span>! +<span class="money-log">' + fmtMoney(reward) + '</span> +' + c.repReward + '⭐');
    showToast('🏆', '¡Victoria en ' + c.name + '!');
    floatNumber('+' + fmtMoney(reward));
  } else {
    const xpGain = Math.ceil(c.xpReward * 0.2);
    game.xp += xpGain;
    game.dailyTracking.xpEarned += xpGain;
    game.competitions[id].losses++;
    addLog('😤 Derrota en <span class="highlight">' + c.name + '</span>. A seguir entrenando...');
    showToast('😤', 'Derrota en ' + c.name + '...');
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
function checkLevelUp() {
  while (game.xp >= game.xpToNext) {
    game.xp -= game.xpToNext;
    game.level++;
    game.xpToNext = Math.ceil(100 * Math.pow(1.55, game.level - 1));
    addLog('🎉 ¡Subiste al <span class="highlight">Nivel ' + game.level + '</span>!');
    showToast('🎉', '¡Nivel ' + game.level + '!');
    renderEquipment();
    renderStaff();
    renderClasses();
    renderMarketing();
    renderSupplements();
    renderRivals();
  }
}

// ===== CHAMPION SYSTEM =====

function getChampionTotalStats() {
  if (!game.champion || !game.champion.recruited) return 0;
  return CHAMPION_STATS.reduce(function(sum, s) { return sum + (game.champion.stats[s] || 0); }, 0);
}

// Returns estimated full recovery time in seconds given current stamina
function getChampionRecoveryRate() {
  var stamina = getChampionEffectiveStat('stamina');
  return 2 + Math.floor(stamina * 0.5); // fatigue points recovered per 30 ticks
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
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= CHAMPION_RECRUIT_COST;
  game.champion.recruited = true;

  addLog('🏅 ¡Reclutaste a tu <span class="highlight">Campeón</span>! Entrenalo y llevalo a la gloria.');
  showToast('🏅', '¡Campeón reclutado!');
  renderChampion();
  updateUI();
  checkAchievements();
  saveGame();
}

function trainChampion(stat) {
  if (!game.champion.recruited) return;
  if (game.champion.trainingUntil && Date.now() < game.champion.trainingUntil) {
    showToast('❌', '¡Tu campeón ya está entrenando!');
    return;
  }
  if (game.champion.fatigue >= CHAMPION_FATIGUE_THRESHOLD) {
    showToast('😴', '¡Campeón agotado! Esperá a que recupere energía.');
    return;
  }

  var cost = getChampionTrainingCost(stat);
  if (game.money < cost) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= cost;
  game.champion.fatigue = Math.min(CHAMPION_MAX_FATIGUE, game.champion.fatigue + CHAMPION_FATIGUE_PER_TRAIN);
  var duration = getChampionTrainingDuration(stat);
  game.champion.trainingUntil = Date.now() + duration * 1000;
  game.champion.trainingStat = stat;
  game.stats.championTrainings++;

  addLog('🏅 Campeón entrenando <span class="highlight">' + CHAMPION_STAT_NAMES[stat] + '</span>...');
  showToast('🏋️', 'Entrenando ' + CHAMPION_STAT_NAMES[stat] + '...');
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
      addLog('🏅 ¡Campeón mejoró <span class="highlight">' + CHAMPION_STAT_NAMES[stat] + '</span> a ' + game.champion.stats[stat] + '!');
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
  if (game.champion.fatigue >= CHAMPION_FATIGUE_THRESHOLD) {
    showToast('😴', '¡Campeón agotado! Necesita descansar antes de competir.');
    return;
  }
  if (game.champion.trainingUntil && Date.now() < game.champion.trainingUntil) {
    showToast('⏳', '¡Tu campeón está entrenando, esperá que termine!');
    return;
  }

  var c = COMPETITIONS.find(function(co) { return co.id === compId; });
  if (!c) return;
  if (game.reputation < c.minRep) return;

  if (!game.competitions[compId]) game.competitions[compId] = { wins: 0, losses: 0, cooldownUntil: 0 };
  var state = game.competitions[compId];
  if (Date.now() < state.cooldownUntil) return;

  // Compute fatigue cost (resistencia reduces it slightly)
  var resistencia = getChampionEffectiveStat('resistencia');
  var fatigueCost = Math.max(15, CHAMPION_FATIGUE_PER_COMPETE - Math.floor(resistencia * 0.5));
  game.champion.fatigue = Math.min(CHAMPION_MAX_FATIGUE, game.champion.fatigue + fatigueCost);

  // Win chance: base + fuerza + velocidad + mentalidad bonus
  var fuerza = getChampionEffectiveStat('fuerza');
  var velocidad = getChampionEffectiveStat('velocidad');
  var mentalidad = getChampionEffectiveStat('mentalidad');
  var statBonus = (fuerza * 0.008) + (velocidad * 0.012) + (mentalidad * 0.01);
  var chance = c.winChance + statBonus + getSkillEffect('compWinChanceBonus', 0);
  chance = Math.min(chance, 0.95);

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
    var reward = Math.ceil(c.reward * rewardMult);
    var compRepMult = getSkillEffect('compRepMult');
    var repGain = Math.ceil(c.repReward * compRepMult * (1 + tecnica * 0.01));
    var compXpMult = getSkillEffect('compXpMult');
    var xpGain = Math.ceil(c.xpReward * compXpMult);

    game.money += reward;
    game.totalMoneyEarned += reward;
    game.reputation += repGain;
    game.xp += xpGain;
    state.wins++;
    game.champion.wins++;
    game.stats.championWins++;
    game.stats.competitionsWon++;
    game.dailyTracking.competitionsWon++;
    game.dailyTracking.moneyEarned += reward;
    game.dailyTracking.reputationGained += repGain;
    game.dailyTracking.xpEarned += xpGain;

    addLog('🏅 ¡VICTORIA en <span class="highlight">' + c.name + '</span>! +<span class="money-log">' + fmtMoney(reward) + '</span> +' + repGain + '⭐');
    showToast('🏅', '¡Victoria en ' + c.name + '!');
    floatNumber('+' + fmtMoney(reward));
  } else {
    var consolationXp = Math.ceil(c.xpReward * 0.2);
    game.xp += consolationXp;
    game.dailyTracking.xpEarned += consolationXp;
    state.losses++;
    game.champion.losses++;

    addLog('🏅 Derrota en <span class="highlight">' + c.name + '</span>. ¡A seguir entrenando!');
    showToast('😤', 'Derrota en ' + c.name);
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
    addLog('🏅 ¡Campeón subió a <span class="highlight">Nivel ' + game.champion.level + '</span>!');
    showToast('🏅', '¡Campeón Nivel ' + game.champion.level + '!');
    xpNeeded = getChampionXpToNext();
  }
}

// Fatigue recovers automatically every 30 ticks. Rate scales with Stamina stat.
function championFatigueTick() {
  if (!game.champion || !game.champion.recruited) return;
  if (game.champion.fatigue <= 0) return;
  if (game.tickCount % 30 === 0) {
    var stamina = getChampionEffectiveStat('stamina');
    var recovery = 2 + Math.floor(stamina * 0.5);
    game.champion.fatigue = Math.max(0, game.champion.fatigue - recovery);
  }
}

function equipChampion(eqId) {
  if (!game.champion || !game.champion.recruited) return;
  var eq = CHAMPION_EQUIPMENT.find(function(e) { return e.id === eqId; });
  if (!eq) return;
  if (game.champion.level < eq.reqChampLevel) return;
  if (game.money < eq.cost) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= eq.cost;
  game.champion.equipment[eq.slot] = eq.id;
  addLog('🏅 Campeón equipó <span class="highlight">' + eq.icon + ' ' + eq.name + '</span>');
  showToast(eq.icon, '¡' + eq.name + ' equipado!');
  renderChampion();
  updateUI();
  checkAchievements();
  saveGame();
}


// ===== PRESTIGE =====
function getPrestigeStars() {
  // Sum totalMoneyEarned across ALL branches
  var totalEarned = 0;
  if (game.branches && Object.keys(game.branches).length > 0) {
    // Sync active branch first
    if (game.activeBranch && game.branches[game.activeBranch]) {
      game.branches[game.activeBranch].totalMoneyEarned = game.totalMoneyEarned;
    }
    Object.values(game.branches).forEach(function(b) { totalEarned += (b.totalMoneyEarned || 0); });
  } else {
    totalEarned = game.totalMoneyEarned;
  }
  if (totalEarned < 2000000) return 0;
  return Math.floor(Math.sqrt(totalEarned / 2000000));
}

function doPrestige() {
  // Redirect to city map — old prestige is replaced by branch system
  switchTab('prestige');
  showToast('🏙️', 'Abrí una nueva sucursal desde el mapa de ciudad');
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
  el.textContent = 'Día ' + day + ' — ' + timeStr;
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
        addLog('👥 +' + (game.members - prev) + ' nuevos miembros (staff)');
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
  if (repGain > 0) {
    game.reputation += repGain;
    game.dailyTracking.reputationGained += repGain;
  }
}

// ===== CLASS TICK =====
function classTick() {
  GYM_CLASSES.forEach(gc => {
    const state = game.classes[gc.id];
    if (state?.runningUntil && Date.now() >= state.runningUntil && !state.collected) {
      // Class finished
      game.classes[gc.id].collected = true;
      var reward = getClassReward(gc);
      var commissionAmt = Math.ceil(reward.income * reward.commission);
      var netIncome = reward.income - commissionAmt;
      game.money += netIncome;
      game.totalMoneyEarned += netIncome;
      game.xp += reward.xp;
      game.reputation += reward.rep;
      game.stats.classesCompleted++;
      game.dailyTracking.classesRun++;
      game.dailyTracking.moneyEarned += netIncome;
      game.dailyTracking.xpEarned += reward.xp;
      game.dailyTracking.reputationGained += reward.rep;

      var logMsg = '🧘 Clase <span class="highlight">' + gc.name + '</span> completada! +<span class="money-log">' + fmtMoney(netIncome) + '</span>';
      if (commissionAmt > 0) logMsg += ' <span style="color:var(--text-dim);">(comisión: -' + fmtMoney(commissionAmt) + ')</span>';
      addLog(logMsg);
      showToast(gc.icon, '¡Clase ' + gc.name + ': +' + fmtMoney(netIncome) + '!');
      floatNumber('+' + fmtMoney(netIncome));

      checkAchievements();
      checkMissionProgress();
      renderClasses();
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
      addLog('⚠️ Campaña <span class="highlight">' + mc.name + '</span> pausada por falta de fondos.');
      showToast('⚠️', mc.name + ': sin fondos, campaña pausada!');
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

  // Passive income for inactive branches (every 10 ticks)
  if (game.tickCount % 10 === 0 && game.branches) {
    Object.keys(game.branches).forEach(function(id) {
      if (id === game.activeBranch) return;
      var passiveIncome = getBranchPassiveIncome(id);
      if (passiveIncome > 0) {
        game.branches[id].money = (game.branches[id].money || 0) + passiveIncome * 10;
        game.branches[id].totalMoneyEarned = (game.branches[id].totalMoneyEarned || 0) + passiveIncome * 10;
      }
    });
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
  showToast('💾', '¡Partida guardada!');
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
      game.xp += xpGain;
      report.xp += xpGain;
      state.trainingUntil = 0;
      report.staffTrained.push(s.name + ' → LVL ' + state.level);
    }
    if (state.extras) {
      state.extras.forEach(function(ex, i) {
        if (ex.trainingUntil > 0 && Date.now() >= ex.trainingUntil) {
          ex.level = (ex.level || 1) + 1;
          var xpGain = 25 * ex.level;
          game.xp += xpGain;
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
        game.xp += reward.xp;
        game.reputation += reward.rep;
        game.stats.classesCompleted++;
        report.classesCompleted.push(gc.name + ': +' + fmtMoney(netIncome) + (commissionAmt > 0 ? ' (comisión: -' + fmtMoney(commissionAmt) + ')' : ''));
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
      var recoveryPerCycle = 2 + Math.floor(stamina * 0.5);
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
      if (id === game.activeBranch) return;
      var passiveIncome = getBranchPassiveIncome(id);
      var passiveMoney = Math.max(0, passiveIncome * capped * OFFLINE_INCOME_RATE);
      if (passiveMoney > 0) {
        game.branches[id].money = (game.branches[id].money || 0) + passiveMoney;
        game.branches[id].totalMoneyEarned = (game.branches[id].totalMoneyEarned || 0) + passiveMoney;
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
  lines.push('<h3>Mientras no estabas...</h3>');
  lines.push('<div class="offline-report-time">' + fmtTime(report.elapsed) + ' offline</div>');
  if (report.offlineRate && report.offlineRate < 1) {
    lines.push('<div class="offline-report-rate">📉 Tu gym generó el ' + Math.round(report.offlineRate * 100) + '% de sus ganancias sin vos al mando</div>');
  }
  lines.push('</div>');

  lines.push('<div class="offline-report-body">');

  // Money section
  if (report.money > 0 || report.expenses > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">💰 Economía</div>');
    if (report.money > 0) lines.push('<div class="offline-item positive">Ingresos brutos: +' + fmtMoney(report.money) + '</div>');
    if (report.expenses > 0) lines.push('<div class="offline-item negative">Gastos (salarios + mantenimiento): -' + fmtMoney(report.expenses) + '</div>');
    var net = report.money - report.expenses;
    lines.push('<div class="offline-item ' + (net >= 0 ? 'positive' : 'negative') + ' net">Neto: ' + (net >= 0 ? '+' : '') + fmtMoney(net) + '</div>');
    lines.push('</div>');
  }

  // Construction & upgrades
  var constructions = [].concat(report.equipUpgraded, report.equipRepaired, report.zonesBuilt, report.staffTrained);
  if (constructions.length > 0 || report.skillResearched) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">🏗️ Completado</div>');
    if (report.skillResearched) lines.push('<div class="offline-item">🔬 Investigación: ' + report.skillResearched + '</div>');
    report.equipUpgraded.forEach(function(e) { lines.push('<div class="offline-item">⬆️ ' + e + '</div>'); });
    report.equipRepaired.forEach(function(e) { lines.push('<div class="offline-item">🔧 ' + e + ' reparado</div>'); });
    report.zonesBuilt.forEach(function(e) { lines.push('<div class="offline-item">🏗️ ' + e + '</div>'); });
    report.staffTrained.forEach(function(e) { lines.push('<div class="offline-item">🎓 ' + e + '</div>'); });
    lines.push('</div>');
  }

  // Classes
  if (report.classesCompleted.length > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">🧘 Clases Completadas</div>');
    report.classesCompleted.forEach(function(c) { lines.push('<div class="offline-item">✅ ' + c + '</div>'); });
    lines.push('</div>');
  }

  // Marketing
  if (report.campaignMembers > 0 || report.campaignCosts > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">📢 Marketing</div>');
    if (report.campaignCosts > 0) lines.push('<div class="offline-item negative">Costo campañas: -' + fmtMoney(report.campaignCosts) + '</div>');
    if (report.campaignMembers > 0) lines.push('<div class="offline-item positive">Nuevos miembros: +' + report.campaignMembers + '</div>');
    if (report.campaignRep > 0) lines.push('<div class="offline-item positive">Reputación: +' + fmt(report.campaignRep) + '</div>');
    report.burstCampaignsFinished.forEach(function(c) { lines.push('<div class="offline-item">📣 ' + c + ' terminó</div>'); });
    lines.push('</div>');
  }

  // Members & Rep
  if (report.members > 0 || report.reputation > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">👥 Crecimiento</div>');
    if (report.members > 0) lines.push('<div class="offline-item positive">Miembros (staff): +' + report.members + '</div>');
    if (report.reputation > 0) lines.push('<div class="offline-item positive">Reputación: +' + fmt(Math.floor(report.reputation)) + '</div>');
    if (report.xp > 0) lines.push('<div class="offline-item positive">XP: +' + fmt(report.xp) + '</div>');
    lines.push('</div>');
  }

  // Inactive branches
  if (report.inactiveBranchIncome > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">🏙️ Otras Sucursales</div>');
    lines.push('<div class="offline-item positive">Ingresos pasivos: +' + fmtMoney(report.inactiveBranchIncome) + '</div>');
    lines.push('</div>');
  }

  // Champion
  if (report.championTrained || report.championFatigue > 0) {
    lines.push('<div class="offline-section">');
    lines.push('<div class="offline-section-title">🏆 Campeón</div>');
    if (report.championTrained) lines.push('<div class="offline-item">💪 Entrenamiento completo: ' + report.championTrained + '</div>');
    if (report.championFatigue > 0) lines.push('<div class="offline-item positive">Fatiga recuperada: -' + report.championFatigue + '</div>');
    lines.push('</div>');
  }

  lines.push('</div>'); // close body

  lines.push('<div class="offline-report-footer">');
  lines.push('<button class="btn btn-buy" onclick="closeOfflineReport()">¡Vamos! 💪</button>');
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
function saveGame() {
  try {
    // Sync active branch data before saving (preserve neighborhoodId)
    if (game.activeBranch && game.branches[game.activeBranch]) {
      var activeHood = game.branches[game.activeBranch].neighborhoodId;
      game.branches[game.activeBranch] = extractBranchData(activeHood);
    }
    localStorage.setItem('ironEmpireSave', JSON.stringify(game));
    localStorage.setItem('ironEmpireLastTick', Date.now().toString());
  } catch (e) { /* silently fail */ }
}

function loadGame() {
  try {
    const saved = localStorage.getItem('ironEmpireSave');
    if (saved) {
      const data = JSON.parse(saved);
      // Deep merge preserving new default properties
      game = deepMerge(game, data);
      // Migration: old save without branches
      if (!game.activeBranch) {
        game.activeBranch = 'branch_0';
        game.branchCount = 1;
        game.branches = {};
        game.branches.branch_0 = extractBranchData();
        game.branches.branch_0.neighborhoodId = 'palermo';
      }
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
  showToast('💾', '¡Partida exportada!');
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
        showToast('📂', '¡Partida importada!');
      } catch (err) {
        showToast('❌', 'Error al importar');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetGame() {
  if (!confirm('¿Estás seguro? Se borra TODO el progreso permanentemente.')) return;
  if (!confirm('¿Realmente seguro? No hay vuelta atrás.')) return;
  // Flag PRIMERO — onAuthSuccess lo chequea y saltea todo cloud load al recargar
  localStorage.setItem('ironEmpireReset', '1');
  localStorage.removeItem('ironEmpireSave');
  localStorage.removeItem('ironEmpireLastTick');
  // Fire-and-forget cloud delete (el flag garantiza el reset aunque no llegue a borrarse)
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
  normalizeProfileData();
  applyTheme();
  renderEquipment();
  renderStaff();
  renderAchievements();
  renderClasses();
  renderMarketing();
  renderSupplements();
  renderRivals();
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
}

// ===== START GAME =====
function startGame() {
  const nameInput = document.getElementById('gymNameInput');
  const name = nameInput.value.trim() || 'Iron Empire';
  game.gymName = name;
  game.started = true;

  // Initialize branch system for new games
  if (!game.activeBranch) {
    game.activeBranch = 'branch_0';
    game.branchCount = 1;
    game.branches = {};
    game.branches.branch_0 = extractBranchData();
    game.branches.branch_0.neighborhoodId = 'palermo';
  }

  document.getElementById('nameModal').classList.add('hidden');

  addLog('🏋️ ¡<span class="highlight">' + game.gymName + '</span> abrió sus puertas!');
  showToast('🏋️', '¡' + game.gymName + ' está abierto!');

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

  // Tab-specific actions
  if (tabId === 'prestige') { renderCityMap(); renderLeaderboard(); }
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
