// ===== IRON EMPIRE - ENGAGEMENT SYSTEMS =====
// Daily Bonus, Daily Missions, Random Events, Tutorial, Classes, Marketing

// ===== DAILY BONUS =====
function checkDailyReset() {
  const today = getDateString();
  const lastClaim = game.dailyBonus.lastClaim;

  if (lastClaim === today) {
    game.dailyBonus.claimedToday = true;
  } else {
    game.dailyBonus.claimedToday = false;

    // Check streak
    if (lastClaim) {
      const lastDate = new Date(lastClaim);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 1) {
        // Streak broken
        game.dailyBonus.streak = 0;
      }
    }
  }

  // Reset daily tracking if new day
  const lastMissionReset = game.dailyMissions.lastReset;
  if (lastMissionReset !== today) {
    game.dailyTracking = {
      moneyEarned: 0,
      equipmentBought: 0,
      competitionsWon: 0,
      reputationGained: 0,
      classesRun: 0,
      campaignsLaunched: 0,
      xpEarned: 0,
      eventsHandled: 0,
    };
    generateDailyMissions();
    game.dailyMissions.lastReset = today;
    game.stats.daysPlayed++;
    saveGame();
  }
}

function claimDailyBonus() {
  if (game.dailyBonus.claimedToday) return;

  const streakDay = (game.dailyBonus.streak % 7);
  const reward = DAILY_BONUS_REWARDS[streakDay];

  const prestigeMult = 1 + (game.prestigeStars * 0.25);
  const moneyReward = Math.ceil(reward.money * prestigeMult);

  game.money += moneyReward;
  game.totalMoneyEarned += moneyReward;
  game.xp += reward.xp;
  game.dailyTracking.moneyEarned += moneyReward;
  game.dailyTracking.xpEarned += reward.xp;

  game.dailyBonus.streak++;
  game.dailyBonus.lastClaim = getDateString();
  game.dailyBonus.claimedToday = true;

  addLog('🎁 Bonus diario (día ' + game.dailyBonus.streak + '): +<span class="money-log">' + fmtMoney(moneyReward) + '</span> +' + reward.xp + ' XP');
  showToast('🎁', '¡Bonus día ' + game.dailyBonus.streak + '! +' + fmtMoney(moneyReward));
  floatNumber('+' + fmtMoney(moneyReward));

  renderDailyBonus();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function renderDailyBonus() {
  const container = document.getElementById('dailyBonusContainer');
  if (!container) return;

  const streakDay = game.dailyBonus.streak % 7;
  const claimed = game.dailyBonus.claimedToday;

  let dotsHTML = '';
  for (let i = 0; i < 7; i++) {
    let cls = 'streak-dot';
    if (i < streakDay || (i === streakDay && claimed)) cls += ' claimed';
    if (i === streakDay && !claimed) cls += ' today';
    const reward = DAILY_BONUS_REWARDS[i];
    dotsHTML += '<div class="' + cls + '" title="Día ' + (i + 1) + ': ' + reward.label + '">' + (i + 1) + '</div>';
  }

  container.innerHTML =
    '<div class="daily-bonus-card">' +
      '<div class="daily-bonus-info">' +
        '<div class="daily-bonus-icon">' + (claimed ? '✅' : '🎁') + '</div>' +
        '<div class="daily-bonus-text">' +
          '<h3>' + (claimed ? 'BONUS RECLAMADO' : 'BONUS DIARIO DISPONIBLE') + '</h3>' +
          '<p>' + (claimed ? 'Streak: ' + game.dailyBonus.streak + ' día(s). ¡Volvé mañana!' : '¡Reclamá tu bonus de hoy! Streak: ' + game.dailyBonus.streak + ' día(s)') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="streak-dots">' + dotsHTML + '</div>' +
      (!claimed ? '<button class="btn btn-purple btn-small" onclick="claimDailyBonus()">🎁 RECLAMAR</button>' : '') +
    '</div>';
}

// ===== DAILY MISSIONS =====
function generateDailyMissions() {
  // Pick 3 random missions from the pool with level-appropriate targets
  const pool = [...DAILY_MISSIONS_POOL];
  const selected = [];
  const usedTypes = new Set();

  while (selected.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const mission = pool.splice(idx, 1)[0];
    if (usedTypes.has(mission.type)) continue;
    usedTypes.add(mission.type);

    // Pick target based on level
    const levelIdx = Math.min(Math.floor(game.level / 3), mission.targets.length - 1);
    const target = mission.targets[levelIdx];

    selected.push({
      ...mission,
      target: target,
      desc: mission.desc.replace('${target}', target.toLocaleString('es-AR')),
      claimed: false,
    });
  }

  game.dailyMissions.missions = selected;
  game.dailyMissions.lastReset = getDateString();
}

function checkMissionProgress() {
  if (!game.dailyMissions.missions) return;

  game.dailyMissions.missions.forEach(mission => {
    if (mission.claimed) return;
    let current = 0;
    switch (mission.type) {
      case 'money_earned': current = game.dailyTracking.moneyEarned; break;
      case 'equipment_bought': current = game.dailyTracking.equipmentBought; break;
      case 'competitions_won': current = game.dailyTracking.competitionsWon; break;
      case 'reputation_gained': current = game.dailyTracking.reputationGained; break;
      case 'classes_run': current = game.dailyTracking.classesRun; break;
      case 'campaigns_launched': current = game.dailyTracking.campaignsLaunched; break;
      case 'xp_earned': current = game.dailyTracking.xpEarned; break;
      case 'events_handled': current = game.dailyTracking.eventsHandled; break;
    }
    mission.current = Math.floor(current);
    mission.completed = current >= mission.target;
  });

  renderDailyMissions();
  updateTabNotifications();
}

function claimMission(index) {
  const mission = game.dailyMissions.missions[index];
  if (!mission || !mission.completed || mission.claimed) return;

  mission.claimed = true;
  const prestigeMult = 1 + (game.prestigeStars * 0.25);
  const moneyReward = Math.ceil(mission.rewards.money * prestigeMult);

  game.money += moneyReward;
  game.totalMoneyEarned += moneyReward;
  game.xp += mission.rewards.xp;
  game.stats.missionsCompleted++;
  game.dailyTracking.moneyEarned += moneyReward;
  game.dailyTracking.xpEarned += mission.rewards.xp;

  addLog('📋 Misión completada: <span class="highlight">' + mission.name + '</span> +<span class="money-log">' + fmtMoney(moneyReward) + '</span>');
  showToast('📋', '¡Misión: ' + mission.name + '!');
  floatNumber('+' + fmtMoney(moneyReward));

  // Check if all missions are claimed - bonus!
  const allClaimed = game.dailyMissions.missions.every(m => m.claimed);
  if (allClaimed) {
    const bonusMoney = Math.ceil(1000 * prestigeMult);
    game.money += bonusMoney;
    game.totalMoneyEarned += bonusMoney;
    game.xp += 100;
    addLog('⭐ ¡Todas las misiones del día completadas! BONUS: +<span class="money-log">' + fmtMoney(bonusMoney) + '</span> +100 XP');
    showToast('⭐', '¡Todas las misiones completas! BONUS');
    floatNumber('+' + fmtMoney(bonusMoney), 'var(--purple)');
  }

  renderDailyMissions();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function renderDailyMissions() {
  const container = document.getElementById('missionsContainer');
  if (!container) return;

  const missions = game.dailyMissions.missions || [];

  if (missions.length === 0) {
    container.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px;">Cargando misiones...</p>';
    return;
  }

  let html = '<div class="missions-container">';

  missions.forEach((m, i) => {
    const progress = Math.min((m.current || 0) / m.target, 1);
    const progressPct = Math.round(progress * 100);
    let statusClass = '';
    if (m.claimed) statusClass = 'claimed';
    else if (m.completed) statusClass = 'completed';

    html +=
      '<div class="mission-card ' + statusClass + '">' +
        '<div class="mission-icon">' + m.icon + '</div>' +
        '<div class="mission-info">' +
          '<div class="mission-name">' + m.name + '</div>' +
          '<div class="mission-desc">' + m.desc + '</div>' +
          '<div class="mission-progress-bar"><div class="mission-progress-fill" style="width:' + progressPct + '%"></div></div>' +
          '<div class="mission-progress-text">' + fmt(m.current || 0) + ' / ' + fmt(m.target) + '</div>' +
        '</div>' +
        '<div class="mission-reward">' +
          '<div class="mission-reward-text">💰 ' + fmtMoney(m.rewards.money) + '</div>' +
          '<div class="mission-reward-text">✨ ' + m.rewards.xp + ' XP</div>' +
          (m.completed && !m.claimed ?
            '<button class="btn btn-green btn-small" onclick="claimMission(' + i + ')">RECLAMAR</button>' :
            (m.claimed ? '<span style="color:var(--green);font-size:12px;">✅ Hecho</span>' : '')
          ) +
        '</div>' +
      '</div>';
  });

  // Timer until reset
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const secsLeft = Math.floor((tomorrow - now) / 1000);

  html += '<div class="missions-timer">⏰ Nuevas misiones en: ' + fmtTime(secsLeft) + '</div>';
  html += '</div>';

  container.innerHTML = html;
}

// ===== RANDOM EVENTS =====
function checkRandomEvent() {
  if (!game.started) return;

  game.lastEventTime++;
  if (game.lastEventTime >= game.nextEventIn) {
    game.lastEventTime = 0;
    game.nextEventIn = 180 + Math.floor(Math.random() * 180); // 3-6 minutes

    // Filter events by level
    const available = RANDOM_EVENTS.filter(e => game.level >= e.minLevel);
    if (available.length === 0) return;

    const event = available[Math.floor(Math.random() * available.length)];
    showRandomEvent(event);
  }
}

function showRandomEvent(event) {
  const overlay = document.getElementById('eventOverlay');
  const card = document.getElementById('eventCard');

  let choicesHTML = '';
  event.choices.forEach((choice, i) => {
    choicesHTML +=
      '<div class="event-choice" onclick="handleEventChoice(\'' + event.id + '\',' + i + ')">' +
        '<span class="event-choice-text">' + choice.text + '</span>' +
        '<span class="event-choice-cost">' + choice.cost + '</span>' +
      '</div>';
  });

  card.innerHTML =
    '<div class="event-icon">' + event.icon + '</div>' +
    '<div class="event-title">' + event.title + '</div>' +
    '<div class="event-desc">' + event.desc + '</div>' +
    '<div class="event-choices">' + choicesHTML + '</div>';

  overlay.classList.remove('hidden');
  window._currentEvent = event;
}

function handleEventChoice(eventId, choiceIndex) {
  const event = window._currentEvent;
  if (!event || event.id !== eventId) return;

  const choice = event.choices[choiceIndex];

  // Check if player can afford
  if (choice.cost.includes('-$')) {
    const costAmount = parseInt(choice.cost.replace('-$', '').replace(',', ''));
    if (game.money < costAmount) {
      showToast('❌', '¡No tenés suficiente plata!');
      return;
    }
  }

  // Apply effect
  choice.effect(game);

  game.stats.eventsHandled++;
  game.dailyTracking.eventsHandled++;

  addLog('⚡ Evento: <span class="highlight">' + event.title + '</span> → ' + choice.text + ' (' + choice.result + ')');
  showToast(event.icon, choice.result);

  document.getElementById('eventOverlay').classList.add('hidden');
  window._currentEvent = null;

  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

// ===== CLASSES =====
function startClass(id) {
  const gc = GYM_CLASSES.find(c => c.id === id);
  if (!gc) return;

  const state = game.classes[id];
  // Check cooldown
  if (state?.cooldownUntil && Date.now() < state.cooldownUntil) return;
  // Check not already running
  if (state?.runningUntil && Date.now() < state.runningUntil) return;

  game.classes[id] = {
    runningUntil: Date.now() + gc.duration * 1000,
    cooldownUntil: 0,
    collected: false
  };

  addLog('🧘 Clase <span class="highlight">' + gc.name + '</span> iniciada! (' + fmtTime(gc.duration) + ')');
  showToast(gc.icon, '¡Clase ' + gc.name + ' en curso!');

  renderClasses();
  saveGame();
}

function renderClasses() {
  const grid = document.getElementById('classesGrid');
  if (!grid) return;

  grid.innerHTML = GYM_CLASSES.map(gc => {
    const state = game.classes[gc.id] || {};
    const locked = game.level < gc.reqLevel;
    const isRunning = state.runningUntil && Date.now() < state.runningUntil;
    const onCooldown = state.cooldownUntil && Date.now() < state.cooldownUntil;

    // When class finishes, set cooldown
    if (state.runningUntil && Date.now() >= state.runningUntil && state.collected && !state.cooldownUntil) {
      game.classes[gc.id].cooldownUntil = Date.now() + gc.cooldown * 1000;
    }

    let timerText = '';
    let btnHTML = '';

    if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;">Requiere Nivel ' + gc.reqLevel + '</div>';
    } else if (isRunning) {
      const timeLeft = Math.ceil((state.runningUntil - Date.now()) / 1000);
      timerText = '<div class="class-timer">⏳ ' + fmtTime(timeLeft) + '</div>';
      btnHTML = '<button class="btn btn-green" disabled>EN CURSO...</button>';
    } else if (onCooldown) {
      const coolLeft = Math.ceil((state.cooldownUntil - Date.now()) / 1000);
      timerText = '<div class="class-timer" style="color:var(--text-muted);">⏱️ Cooldown: ' + fmtTime(coolLeft) + '</div>';
      btnHTML = '<button class="btn btn-buy" disabled>ESPERANDO</button>';
    } else {
      btnHTML = '<button class="btn btn-buy" onclick="startClass(\'' + gc.id + '\')">🎯 INICIAR CLASE</button>';
    }

    return (
      '<div class="class-card ' + (locked ? 'locked' : '') + ' ' + (isRunning ? 'running' : '') + '">' +
        '<div class="class-icon">' + gc.icon + '</div>' +
        '<div class="class-name">' + gc.name + '</div>' +
        '<div class="class-desc">' + gc.desc + '</div>' +
        '<div class="class-stats">' +
          '<div class="class-stat">💰 <span class="val">' + fmtMoney(gc.income) + '</span></div>' +
          '<div class="class-stat">✨ <span class="val">' + gc.xp + ' XP</span></div>' +
          '<div class="class-stat">⭐ <span class="val">+' + gc.rep + '</span></div>' +
          '<div class="class-stat">⏱️ <span class="val">' + fmtTime(gc.duration) + '</span></div>' +
        '</div>' +
        timerText +
        btnHTML +
      '</div>'
    );
  }).join('');
}

// ===== MARKETING =====
function launchCampaign(id) {
  const mc = MARKETING_CAMPAIGNS.find(c => c.id === id);
  if (!mc) return;

  const state = game.marketing[id];
  if (state?.activeUntil && Date.now() < state.activeUntil) return;

  let cost = mc.cost;
  if (game.staff.manager?.hired) cost = Math.ceil(cost * 0.8);

  if (game.money < cost) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= cost;
  game.marketing[id] = {
    activeUntil: Date.now() + mc.duration * 1000
  };

  game.reputation += mc.repBoost;
  game.stats.campaignsLaunched++;
  game.dailyTracking.campaignsLaunched++;
  game.dailyTracking.reputationGained += mc.repBoost;

  const xpGain = 30;
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  updateMembers();

  addLog('📢 Campaña <span class="highlight">' + mc.name + '</span> lanzada! +' + mc.membersBoost + ' miembros, +' + mc.repBoost + '⭐');
  showToast(mc.icon, '¡Campaña ' + mc.name + ' en marcha!');

  renderMarketing();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function renderMarketing() {
  const grid = document.getElementById('marketingGrid');
  if (!grid) return;

  grid.innerHTML = MARKETING_CAMPAIGNS.map(mc => {
    const state = game.marketing[mc.id] || {};
    const locked = game.level < mc.reqLevel;
    const isActive = state.activeUntil && Date.now() < state.activeUntil;

    let cost = mc.cost;
    if (game.staff.manager?.hired) cost = Math.ceil(cost * 0.8);
    const canAfford = game.money >= cost;

    let timerHTML = '';
    let btnHTML = '';

    if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px;">Requiere Nivel ' + mc.reqLevel + '</div>';
    } else if (isActive) {
      const timeLeft = Math.ceil((state.activeUntil - Date.now()) / 1000);
      timerHTML = '<div style="text-align:center;margin-bottom:8px;"><span class="marketing-badge running">ACTIVA — ' + fmtTime(timeLeft) + '</span></div>';
      btnHTML = '<button class="btn btn-green" disabled>✅ EN CURSO</button>';
    } else {
      btnHTML = '<button class="btn btn-cyan" ' + (canAfford ? '' : 'disabled') + ' onclick="launchCampaign(\'' + mc.id + '\')">📢 LANZAR — ' + fmtMoney(cost) + '</button>';
    }

    return (
      '<div class="marketing-card ' + (locked ? 'locked' : '') + ' ' + (isActive ? 'active' : '') + '">' +
        '<div class="marketing-header">' +
          '<span class="marketing-icon">' + mc.icon + '</span>' +
          (isActive ? '' : '') +
        '</div>' +
        '<div class="marketing-name">' + mc.name + '</div>' +
        '<div class="marketing-desc">' + mc.desc + '</div>' +
        '<div class="marketing-stats">' +
          '<div class="marketing-stat">👥 <span class="val">+' + mc.membersBoost + '</span></div>' +
          '<div class="marketing-stat">⭐ <span class="val">+' + mc.repBoost + '</span></div>' +
          '<div class="marketing-stat">⏱️ <span class="val">' + fmtTime(mc.duration) + '</span></div>' +
        '</div>' +
        timerHTML +
        btnHTML +
      '</div>'
    );
  }).join('');
}

// ===== TUTORIAL =====
function startTutorial() {
  game.tutorialStep = 0;
  showTutorialStep();
}

function showTutorialStep() {
  const steps = TUTORIAL_STEPS;
  if (game.tutorialStep >= steps.length) {
    endTutorial();
    return;
  }

  const step = steps[game.tutorialStep];

  // Switch tab if needed
  if (step.tab) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const tabBtn = document.querySelector('[data-tab="' + step.tab + '"]');
    if (tabBtn) tabBtn.classList.add('active');
    const tabContent = document.getElementById('tab-' + step.tab);
    if (tabContent) tabContent.classList.add('active');
  }

  const target = document.querySelector(step.target);
  const overlay = document.getElementById('tutorialOverlay');
  const tooltip = document.getElementById('tutorialTooltip');

  overlay.classList.remove('hidden');
  tooltip.style.display = 'block';

  // Position highlight
  if (target) {
    const rect = target.getBoundingClientRect();
    const highlight = document.getElementById('tutorialHighlight');
    highlight.style.top = (rect.top - 4) + 'px';
    highlight.style.left = (rect.left - 4) + 'px';
    highlight.style.width = (rect.width + 8) + 'px';
    highlight.style.height = (rect.height + 8) + 'px';
    highlight.style.display = 'block';

    // Position tooltip below or above target
    const tooltipTop = rect.bottom + 16;
    const tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 380));
    tooltip.style.top = (tooltipTop > window.innerHeight - 200 ? rect.top - 200 : tooltipTop) + 'px';
    tooltip.style.left = tooltipLeft + 'px';
  }

  tooltip.innerHTML =
    '<div class="tutorial-step-indicator">Paso ' + (game.tutorialStep + 1) + ' de ' + steps.length + '</div>' +
    '<h4>' + step.title + '</h4>' +
    '<p>' + step.text + '</p>' +
    '<div class="tutorial-buttons">' +
      '<button class="btn btn-small btn-red" onclick="endTutorial()">SALTAR</button>' +
      '<button class="btn btn-small btn-buy" onclick="nextTutorialStep()">SIGUIENTE →</button>' +
    '</div>';
}

function nextTutorialStep() {
  game.tutorialStep++;
  showTutorialStep();
}

function endTutorial() {
  game.tutorialDone = true;
  document.getElementById('tutorialOverlay').classList.add('hidden');
  document.getElementById('tutorialHighlight').style.display = 'none';
  document.getElementById('tutorialTooltip').style.display = 'none';

  // Return to gym tab
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="gym"]').classList.add('active');
  document.getElementById('tab-gym').classList.add('active');

  showToast('🎓', '¡Tutorial completado! ¡A construir tu imperio!');
  saveGame();
}

// ===== SKILL TREE =====
function researchSkill(skillId) {
  // Find the skill
  let skill = null;
  let branchKey = null;
  Object.entries(SKILL_TREE).forEach(([key, branch]) => {
    branch.skills.forEach(s => {
      if (s.id === skillId) { skill = s; branchKey = key; }
    });
  });
  if (!skill || game.skills[skillId]) return;

  // Check requirements
  if (game.level < skill.reqLevel) return;
  if (skill.requires && !game.skills[skill.requires]) return;
  if (game.money < skill.cost) return;

  game.money -= skill.cost;
  game.skills[skillId] = true;
  game.stats.skillsResearched++;

  const xpGain = 80;
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  addLog('🔬 Investigaste <span class="highlight">' + skill.name + '</span> (' + SKILL_TREE[branchKey].name + ')');
  showToast(skill.icon, '¡Mejora: ' + skill.name + '!');

  // Recalculate everything
  updateMembers();
  renderAll();
  saveGame();
}

function renderSkillTree() {
  const container = document.getElementById('skillTreeContainer');
  if (!container) return;

  let html = '';

  Object.entries(SKILL_TREE).forEach(([key, branch]) => {
    html += '<div class="skill-branch">';
    html += '<div class="skill-branch-header" style="color:' + branch.color + ';">';
    html += '<span style="font-size:24px;">' + branch.icon + '</span> ';
    html += '<span class="section-title" style="color:' + branch.color + ';margin-bottom:0;">' + branch.name + '</span>';
    html += '</div>';
    html += '<div class="skill-branch-skills">';

    branch.skills.forEach((skill, i) => {
      const owned = game.skills[skill.id];
      const reqMet = game.level >= skill.reqLevel;
      const depMet = !skill.requires || game.skills[skill.requires];
      const canAfford = game.money >= skill.cost;
      const available = !owned && reqMet && depMet;

      let cls = 'skill-node';
      if (owned) cls += ' owned';
      else if (!reqMet || !depMet) cls += ' locked';

      html += '<div class="' + cls + '" style="border-color:' + (owned ? branch.color : 'var(--border)') + ';">';
      html += '<div class="skill-node-icon">' + skill.icon + '</div>';
      html += '<div class="skill-node-name">' + skill.name + '</div>';
      html += '<div class="skill-node-desc">' + skill.desc + '</div>';

      if (owned) {
        html += '<div class="skill-node-status" style="color:var(--green);">✅ Investigado</div>';
      } else if (!reqMet) {
        html += '<div class="skill-node-status">🔒 Nivel ' + skill.reqLevel + '</div>';
      } else if (!depMet) {
        html += '<div class="skill-node-status">🔒 Requiere: ' + branch.skills.find(s => s.id === skill.requires).name + '</div>';
      } else {
        html += '<button class="btn btn-buy btn-small" ' + (canAfford ? '' : 'disabled') + ' onclick="researchSkill(\'' + skill.id + '\')">🔬 INVESTIGAR — ' + fmtMoney(skill.cost) + '</button>';
      }

      html += '</div>';

      // Arrow between skills
      if (i < branch.skills.length - 1) {
        html += '<div class="skill-arrow" style="color:' + (owned ? branch.color : 'var(--border)') + ';">→</div>';
      }
    });

    html += '</div></div>';
  });

  container.innerHTML = html;
}

// ===== GYM EXPANSION =====
function buyZone(zoneId) {
  const zone = GYM_ZONES.find(z => z.id === zoneId);
  if (!zone || game.zones[zoneId]) return;
  if (game.level < zone.reqLevel) return;
  if (game.money < zone.cost) return;

  game.money -= zone.cost;
  game.zones[zoneId] = true;
  game.stats.zonesUnlocked++;

  const xpGain = 100;
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  addLog('🏗️ Nueva zona: <span class="highlight">' + zone.name + '</span> ' + zone.icon);
  showToast(zone.icon, '¡Zona desbloqueada: ' + zone.name + '!');
  floatNumber('+' + zone.capacityBonus + ' capacidad', 'var(--accent)');

  updateMembers();
  renderAll();
  saveGame();
}

function renderExpansion() {
  const container = document.getElementById('expansionContainer');
  if (!container) return;

  // Gym visual map
  let mapHTML = '<div class="expansion-map">';
  GYM_ZONES.forEach(z => {
    const owned = game.zones[z.id];
    mapHTML += '<div class="expansion-zone-icon ' + (owned ? 'owned' : 'locked') + '">';
    mapHTML += '<span>' + z.icon + '</span>';
    mapHTML += '<span class="expansion-zone-label">' + z.name + '</span>';
    mapHTML += '</div>';
  });
  mapHTML += '</div>';

  let cardsHTML = '<div class="expansion-grid">';
  GYM_ZONES.forEach(z => {
    const owned = game.zones[z.id];
    const locked = game.level < z.reqLevel;
    const canAfford = game.money >= z.cost;

    let btnHTML = '';
    if (owned) {
      btnHTML = '<button class="btn btn-green" disabled>✅ DESBLOQUEADA</button>';
    } else if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;">🔒 Requiere Nivel ' + z.reqLevel + '</div>';
    } else {
      btnHTML = '<button class="btn btn-buy" ' + (canAfford ? '' : 'disabled') + ' onclick="buyZone(\'' + z.id + '\')">🏗️ CONSTRUIR — ' + fmtMoney(z.cost) + '</button>';
    }

    cardsHTML += '<div class="expansion-card ' + (owned ? 'owned' : '') + ' ' + (locked && !owned ? 'locked' : '') + '">';
    cardsHTML += '<div class="expansion-card-icon">' + z.icon + '</div>';
    cardsHTML += '<div class="expansion-card-name">' + z.name + '</div>';
    cardsHTML += '<div class="expansion-card-desc">' + z.desc + '</div>';
    cardsHTML += '<div class="expansion-card-stats">';
    cardsHTML += '<span>📦 +' + z.capacityBonus + ' capacidad</span>';
    cardsHTML += '<span>💰 +' + fmtMoney(z.incomeBonus) + '/s</span>';
    cardsHTML += '</div>';
    cardsHTML += btnHTML;
    cardsHTML += '</div>';
  });
  cardsHTML += '</div>';

  container.innerHTML = mapHTML + cardsHTML;
}

// ===== VIP MEMBERS =====
function checkVipSpawn() {
  game.lastVipTime++;
  if (game.lastVipTime < game.nextVipIn) return;
  if (game.vipMembers.length >= 3) return; // Max 3 VIPs at a time

  game.lastVipTime = 0;
  game.nextVipIn = 250 + Math.floor(Math.random() * 200); // 4-7.5 minutes

  // Filter VIPs by what the player can satisfy
  const available = VIP_MEMBERS.filter(v => {
    // Don't show if already active
    if (game.vipMembers.some(av => av.id === v.id)) return false;
    return true;
  });

  if (available.length === 0) return;

  const vip = available[Math.floor(Math.random() * available.length)];
  const expiresAt = Date.now() + vip.stayDuration * 1000;

  game.vipMembers.push({
    id: vip.id,
    expiresAt: expiresAt,
    accepted: false
  });

  addLog('⭐ VIP: <span class="highlight">' + vip.name + '</span> quiere unirse! "' + vip.request + '"');
  showToast(vip.icon, '¡VIP: ' + vip.name + ' quiere unirse!');

  renderVipMembers();
  updateTabNotifications();
}

function checkVipExpiry() {
  const now = Date.now();
  const expired = game.vipMembers.filter(v => now >= v.expiresAt && !v.accepted);
  expired.forEach(v => {
    const vipDef = VIP_MEMBERS.find(vd => vd.id === v.id);
    if (vipDef) {
      addLog('😔 VIP <span class="highlight">' + vipDef.name + '</span> se fue... no cumplías sus requisitos.');
    }
  });

  const before = game.vipMembers.length;
  game.vipMembers = game.vipMembers.filter(v => now < v.expiresAt || v.accepted);

  // Remove accepted VIPs whose stay is over
  game.vipMembers = game.vipMembers.filter(v => {
    if (v.accepted && now >= v.expiresAt) return false;
    return true;
  });

  if (game.vipMembers.length !== before) {
    renderVipMembers();
  }
}

function acceptVip(vipId) {
  const vipState = game.vipMembers.find(v => v.id === vipId);
  if (!vipState || vipState.accepted) return;

  const vipDef = VIP_MEMBERS.find(v => v.id === vipId);
  if (!vipDef) return;

  // Check requirements
  const meetsReqs = vipDef.requires.every(req => {
    // Check equipment
    if (game.equipment[req]?.level > 0) return true;
    // Check staff
    if (game.staff[req]?.hired) return true;
    // Check zones
    if (game.zones[req]) return true;
    // Check class types (yoga_class → check if 'yoga' class exists)
    const classId = req.replace('_class', '');
    if (GYM_CLASSES.find(c => c.id === classId)) {
      // Just need the class to be available (level unlocked)
      const gc = GYM_CLASSES.find(c => c.id === classId);
      return game.level >= gc.reqLevel;
    }
    return false;
  });

  if (!meetsReqs) {
    showToast('❌', '¡No cumplís los requisitos del VIP!');
    return;
  }

  vipState.accepted = true;

  const prestigeMult = 1 + (game.prestigeStars * 0.25);
  const moneyReward = Math.ceil(vipDef.reward.money * prestigeMult);

  game.money += moneyReward;
  game.totalMoneyEarned += moneyReward;
  game.reputation += vipDef.reward.rep;
  game.xp += vipDef.reward.xp;
  game.stats.vipsServed++;
  game.dailyTracking.moneyEarned += moneyReward;
  game.dailyTracking.reputationGained += vipDef.reward.rep;
  game.dailyTracking.xpEarned += vipDef.reward.xp;

  addLog('⭐ VIP <span class="highlight">' + vipDef.name + '</span> aceptado! +<span class="money-log">' + fmtMoney(moneyReward) + '</span> +' + vipDef.reward.rep + '⭐');
  showToast(vipDef.icon, '¡VIP ' + vipDef.name + ' se unió!');
  floatNumber('+' + fmtMoney(moneyReward));

  renderVipMembers();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function renderVipMembers() {
  const container = document.getElementById('vipContainer');
  if (!container) return;

  const vips = game.vipMembers || [];

  if (vips.length === 0) {
    container.innerHTML = '<div class="vip-empty"><div style="font-size:40px;margin-bottom:12px;">👀</div><p style="color:var(--text-dim);">No hay miembros VIP esperando. Aparecen cada 4-7 minutos.<br>Mientras más equipamiento y zonas tengas, más VIPs podés satisfacer.</p></div>';
    return;
  }

  let html = '<div class="vip-list">';
  vips.forEach(v => {
    const vipDef = VIP_MEMBERS.find(vd => vd.id === v.id);
    if (!vipDef) return;

    const timeLeft = Math.max(0, Math.ceil((v.expiresAt - Date.now()) / 1000));
    const meetsReqs = vipDef.requires.every(req => {
      if (game.equipment[req]?.level > 0) return true;
      if (game.staff[req]?.hired) return true;
      if (game.zones[req]) return true;
      const classId = req.replace('_class', '');
      const gc = GYM_CLASSES.find(c => c.id === classId);
      if (gc) return game.level >= gc.reqLevel;
      return false;
    });

    html += '<div class="vip-card ' + (v.accepted ? 'accepted' : '') + '">';
    html += '<div class="vip-icon">' + vipDef.icon + '</div>';
    html += '<div class="vip-info">';
    html += '<div class="vip-name">' + vipDef.name + '</div>';
    html += '<div class="vip-request">"' + vipDef.request + '"</div>';
    html += '<div class="vip-reward">💰 ' + fmtMoney(vipDef.reward.money) + ' · ⭐ ' + vipDef.reward.rep + ' · ✨ ' + vipDef.reward.xp + ' XP</div>';
    html += '<div class="vip-timer">' + (v.accepted ? '✅ Miembro activo' : '⏱️ Se va en: ' + fmtTime(timeLeft)) + '</div>';
    html += '</div>';

    if (!v.accepted) {
      html += '<button class="btn ' + (meetsReqs ? 'btn-buy' : 'btn-red') + ' btn-small" onclick="acceptVip(\'' + v.id + '\')">';
      html += meetsReqs ? '✅ ACEPTAR' : '❌ NO CUMPLÍS';
      html += '</button>';
    }

    html += '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

// ===== TAB NOTIFICATIONS =====
function updateTabNotifications() {
  // Missions tab - count unclaimed completed missions
  const missionsDot = document.getElementById('dot-missions');
  if (missionsDot) {
    const unclaimedCount = (game.dailyMissions.missions || []).filter(m => m.completed && !m.claimed).length;
    if (unclaimedCount > 0) {
      missionsDot.classList.remove('hidden');
      missionsDot.textContent = unclaimedCount;
    } else {
      missionsDot.classList.add('hidden');
      missionsDot.textContent = '';
    }
  }

  // Classes tab - count finished classes ready to collect
  const classesDot = document.getElementById('dot-classes');
  if (classesDot) {
    const finishedCount = GYM_CLASSES.filter(gc => {
      const state = game.classes[gc.id];
      return state?.runningUntil && Date.now() >= state.runningUntil && !state.collected;
    }).length;
    // Also count classes available to start (not running, not on cooldown)
    const availableCount = GYM_CLASSES.filter(gc => {
      if (game.level < gc.reqLevel) return false;
      const state = game.classes[gc.id];
      if (!state) return true;
      if (state.runningUntil && Date.now() < state.runningUntil) return false;
      if (state.cooldownUntil && Date.now() < state.cooldownUntil) return false;
      return true;
    }).length;
    const totalNotif = finishedCount > 0 ? finishedCount : 0;
    if (totalNotif > 0) {
      classesDot.classList.remove('hidden');
      classesDot.textContent = totalNotif;
    } else {
      classesDot.classList.add('hidden');
      classesDot.textContent = '';
    }
  }

  // VIP tab - count pending VIPs
  const vipDot = document.getElementById('dot-vip');
  if (vipDot) {
    const pendingCount = (game.vipMembers || []).filter(v => !v.accepted).length;
    if (pendingCount > 0) {
      vipDot.classList.remove('hidden');
      vipDot.textContent = pendingCount;
    } else {
      vipDot.classList.add('hidden');
      vipDot.textContent = '';
    }
  }
}
