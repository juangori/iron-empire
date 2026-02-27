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
  equipment: {},
  staff: {},
  competitions: {},
  achievements: {},
  classes: {},
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
  },

  // Skill tree
  skills: {},

  // Gym zones
  zones: { ground_floor: true },

  // VIP members
  vipMembers: [],
  lastVipTime: 0,
  nextVipIn: 300,

  // Random events
  lastEventTime: 0,
  nextEventIn: 180,

  // Lifetime stats
  stats: {
    classesCompleted: 0,
    campaignsLaunched: 0,
    missionsCompleted: 0,
    skillsResearched: 0,
    zonesUnlocked: 1,
    vipsServed: 0,
    eventsHandled: 0,
    totalPlayTime: 0,
    daysPlayed: 0,
  }
};

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
  if (game.staff.manager?.hired) cost *= (1 - STAFF.find(s => s.id === 'manager').costReduction);
  cost *= getSkillEffect('equipCostMult');
  return Math.ceil(cost);
}

function getStaffCost(staff) {
  let cost = staff.costBase;
  if (game.staff.manager?.hired && staff.id !== 'manager') cost *= 0.8;
  cost *= getSkillEffect('staffCostMult');
  return Math.ceil(cost);
}

// ===== INCOME CALCULATION =====
function getIncomePerSecond() {
  let base = 0;
  EQUIPMENT.forEach(eq => {
    const lvl = game.equipment[eq.id]?.level || 0;
    base += eq.incomePerLevel * lvl;
  });

  // Skill: equipment income mult
  base *= getSkillEffect('equipIncomeMult');

  let mult = 1;
  STAFF.forEach(s => {
    if (game.staff[s.id]?.hired && s.incomeMult) {
      mult += s.incomeMult * getSkillEffect('staffEffectMult');
    }
  });

  // Skill: staff synergy bonus (each hired staff gives % income)
  if (hasSkill('st_synergy')) {
    const hiredCount = STAFF.filter(s => game.staff[s.id]?.hired).length;
    mult += hiredCount * SKILL_TREE.staff.skills.find(s => s.id === 'st_synergy').effect.staffSynergyBonus;
  }

  // Skill: member income mult
  const memberIncomeMult = getSkillEffect('memberIncomeMult');
  const memberBonus = (1 + (game.members * 0.005)) * memberIncomeMult;

  const prestigeMult = 1 + (game.prestigeStars * 0.25);

  // Zone income bonus
  let zoneIncome = 0;
  GYM_ZONES.forEach(z => {
    if (game.zones[z.id]) zoneIncome += z.incomeBonus;
  });

  return (base + zoneIncome) * mult * memberBonus * prestigeMult;
}

// ===== STAFF SALARY CALCULATION =====
function getStaffSalaryPerSecond() {
  let total = 0;
  STAFF.forEach(s => {
    if (game.staff[s.id]?.hired && s.salary) {
      total += s.salary;
    }
  });
  // salary is per in-game "day" (600 ticks = 10 min real time)
  return total / 600;
}

function getTotalStaffSalaryPerDay() {
  let total = 0;
  STAFF.forEach(s => {
    if (game.staff[s.id]?.hired && s.salary) {
      total += s.salary;
    }
  });
  return total;
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
      cap += s.capacityBonus;
    }
  });
  // Marketing active campaigns
  MARKETING_CAMPAIGNS.forEach(mc => {
    const state = game.marketing[mc.id];
    if (state?.activeUntil && Date.now() < state.activeUntil) {
      cap += mc.membersBoost;
    }
  });
  // Skill: capacity mult
  cap *= getSkillEffect('capacityMult');
  return Math.floor(cap);
}

function getMembersAttracted() {
  let base = 0;
  EQUIPMENT.forEach(eq => {
    const lvl = game.equipment[eq.id]?.level || 0;
    base += eq.membersPerLevel * lvl;
  });
  base *= getSkillEffect('memberAttractionMult');
  // Marketing boost
  MARKETING_CAMPAIGNS.forEach(mc => {
    const state = game.marketing[mc.id];
    if (state?.activeUntil && Date.now() < state.activeUntil) {
      base += mc.membersBoost;
    }
  });
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
  const cost = getEquipCost(eq, state.level);
  if (game.money < cost) return;

  game.money -= cost;
  if (!game.equipment[id]) game.equipment[id] = { level: 0 };
  game.equipment[id].level++;

  const xpGain = 20 + game.equipment[id].level * 5;
  game.xp += xpGain;
  game.dailyTracking.equipmentBought++;
  game.dailyTracking.xpEarned += xpGain;

  const isNew = game.equipment[id].level === 1;
  if (isNew) {
    addLog('🛒 Compraste <span class="highlight">' + eq.name + '</span> ' + eq.icon);
    showToast(eq.icon, '¡Nuevo equipo: ' + eq.name + '!');
  } else {
    addLog('⬆️ Mejoraste <span class="highlight">' + eq.name + '</span> a nivel ' + game.equipment[id].level);
  }

  updateMembers();
  renderEquipment();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function hireStaff(id) {
  const s = STAFF.find(st => st.id === id);
  const cost = getStaffCost(s);
  if (game.money < cost || game.staff[id]?.hired) return;

  game.money -= cost;
  game.staff[id] = { hired: true };
  const xpGain = 50;
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  addLog('🤝 Contrataste a <span class="highlight">' + s.name + '</span> (' + s.role + ')');
  showToast(s.icon, '¡' + s.name + ' se unió al equipo!');

  updateMembers();
  renderStaff();
  renderEquipment();
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
  if (game.staff.champion?.hired) rewardMult = STAFF.find(s => s.id === 'champion').compMult;

  let chance = c.winChance + (game.reputation * 0.0001);
  chance = Math.min(chance, 0.95);

  const won = Math.random() < chance;

  if (!game.competitions[id]) game.competitions[id] = { wins: 0, losses: 0, cooldownUntil: 0 };
  game.competitions[id].cooldownUntil = Date.now() + c.cooldown * 1000;

  if (won) {
    const reward = Math.ceil(c.reward * rewardMult);
    game.money += reward;
    game.totalMoneyEarned += reward;
    game.reputation += c.repReward;
    game.xp += c.xpReward;
    game.competitions[id].wins++;
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

  renderCompetitions();
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
}

// ===== LEVEL UP =====
function checkLevelUp() {
  while (game.xp >= game.xpToNext) {
    game.xp -= game.xpToNext;
    game.level++;
    game.xpToNext = Math.ceil(100 * Math.pow(1.4, game.level - 1));
    addLog('🎉 ¡Subiste al <span class="highlight">Nivel ' + game.level + '</span>!');
    showToast('🎉', '¡Nivel ' + game.level + '!');
    renderEquipment();
    renderStaff();
    renderClasses();
    renderMarketing();
  }
}

// ===== PRESTIGE =====
function getPrestigeStars() {
  if (game.totalMoneyEarned < 100000) return 0;
  return Math.floor(Math.sqrt(game.totalMoneyEarned / 100000));
}

function doPrestige() {
  const stars = getPrestigeStars();
  if (stars <= 0) {
    showToast('❌', 'Necesitás más ingresos para abrir una franquicia');
    return;
  }

  if (!confirm('¿Abrir franquicia? Ganás ' + stars + ' ⭐ pero se reinicia todo (excepto estrellas, logros y stats).')) return;

  game.prestigeStars += stars;
  game.money = 0;
  game.totalMoneyEarned = 0;
  game.members = 0;
  game.reputation = 0;
  game.level = 1;
  game.xp = 0;
  game.xpToNext = 100;
  game.equipment = {};
  game.staff = {};
  game.competitions = {};
  game.classes = {};
  game.marketing = {};
  game.zones = { ground_floor: true };
  game.vipMembers = [];
  // Skills persist through prestige!
  game.log = [];

  addLog('🌟 ¡Abriste una nueva franquicia! +' + stars + ' estrellas');
  showToast('🌟', '¡Franquicia! +' + stars + ' estrellas');

  renderAll();
  updateUI();
  checkAchievements();
  saveGame();
}

// ===== SESSION TIMER =====
let sessionSeconds = 0;

function updateSessionTimer() {
  sessionSeconds++;
  const el = document.getElementById('sessionTimeDisplay');
  if (el) {
    const h = Math.floor(sessionSeconds / 3600);
    const m = Math.floor((sessionSeconds % 3600) / 60);
    const s = sessionSeconds % 60;
    if (h > 0) {
      el.textContent = h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    } else {
      el.textContent = m + ':' + String(s).padStart(2, '0');
    }
  }
}

// ===== AUTO-MEMBER TICK =====
let autoMemberTimer = 0;
function autoMemberTick() {
  autoMemberTimer++;
  if (autoMemberTimer >= 10) {
    autoMemberTimer = 0;
    let autoAdd = 0;
    STAFF.forEach(s => {
      if (game.staff[s.id]?.hired && s.autoMembers) {
        autoAdd += s.autoMembers;
      }
    });
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
  let repGain = game.members * 0.02;
  STAFF.forEach(s => {
    if (game.staff[s.id]?.hired && s.repMult) {
      repGain *= (1 + s.repMult);
    }
  });
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
      const prestigeMult = 1 + (game.prestigeStars * 0.25);
      const income = Math.ceil(gc.income * prestigeMult);
      game.money += income;
      game.totalMoneyEarned += income;
      game.xp += gc.xp;
      game.reputation += gc.rep;
      game.stats.classesCompleted++;
      game.dailyTracking.classesRun++;
      game.dailyTracking.moneyEarned += income;
      game.dailyTracking.xpEarned += gc.xp;
      game.dailyTracking.reputationGained += gc.rep;

      addLog('🧘 Clase <span class="highlight">' + gc.name + '</span> completada! +<span class="money-log">' + fmtMoney(income) + '</span>');
      showToast(gc.icon, '¡Clase ' + gc.name + ' completada!');
      floatNumber('+' + fmtMoney(income));

      checkAchievements();
      checkMissionProgress();
      renderClasses();
    }
  });
}

// ===== MAIN GAME TICK (every second) =====
function gameTick() {
  if (!game.started) return;

  const income = getIncomePerSecond();
  const salaries = getStaffSalaryPerSecond();
  const netIncome = income - salaries;
  game.money += netIncome;
  if (netIncome > 0) game.totalMoneyEarned += netIncome;
  game.dailyTracking.moneyEarned += Math.max(0, netIncome);

  game.tickCount++;
  game.stats.totalPlayTime++;
  updateSessionTimer();
  autoMemberTick();
  repTick();
  classTick();
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

  if (game.tickCount % 30 === 0) {
    saveGame();
    // Cloud save every 60 seconds
    if (game.tickCount % 60 === 0 && typeof saveCloudSave === 'function' && typeof currentUser !== 'undefined' && currentUser) {
      saveCloudSave();
    }
  }

  updateUI();
  renderCompetitions();
}

// ===== MANUAL SAVE (button) =====
function manualSave() {
  saveGame();
  if (typeof saveCloudSave === 'function' && typeof currentUser !== 'undefined' && currentUser) {
    saveCloudSave();
  }
  showToast('💾', '¡Partida guardada!');
}

// ===== SAVE / LOAD =====
function saveGame() {
  try {
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
  localStorage.removeItem('ironEmpireSave');
  localStorage.removeItem('ironEmpireLastTick');
  // Also delete cloud save if logged in
  if (typeof currentUser !== 'undefined' && currentUser && typeof db !== 'undefined') {
    db.collection('saves').doc(currentUser.uid).delete().catch(() => {});
  }
  location.reload();
}

// ===== RENDER ALL =====
function renderAll() {
  renderEquipment();
  renderStaff();
  renderCompetitions();
  renderAchievements();
  renderClasses();
  renderMarketing();
  renderDailyMissions();
  renderDailyBonus();
  renderSkillTree();
  renderExpansion();
  renderVipMembers();
  renderLog();
  updateUI();
  updateTabNotifications();
}

// ===== START GAME =====
function startGame() {
  const nameInput = document.getElementById('gymNameInput');
  const name = nameInput.value.trim() || 'Iron Empire';
  game.gymName = name;
  game.started = true;

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
    setTimeout(() => startTutorial(), 1000);
  }
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  // Hide name modal by default (auth screen shows first)
  document.getElementById('nameModal').classList.add('hidden');

  // Tab switching
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

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
