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
  if (game.dailyBonus.streak > (game.stats.maxStreak || 0)) game.stats.maxStreak = game.dailyBonus.streak;
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

  // Hide banner if already claimed
  if (claimed) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  container.style.display = '';

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
    game.nextEventIn = 300 + Math.floor(Math.random() * 300); // 5-10 minutes

    // Filter events by level
    const available = RANDOM_EVENTS.filter(e => game.level >= e.minLevel);
    if (available.length === 0) return;

    const event = available[Math.floor(Math.random() * available.length)];
    showRandomEvent(event);
  }
}

function scaleEventText(text) {
  var scale = getEventCostScale();
  if (scale <= 1) return text;
  return text.replace(/\$(\d[\d,\.]*)/g, function(match, num) {
    var amount = parseInt(num.replace(/[,\.]/g, ''));
    return '$' + fmt(Math.ceil(amount * scale));
  });
}

function showRandomEvent(event) {
  const overlay = document.getElementById('eventOverlay');
  const card = document.getElementById('eventCard');

  let choicesHTML = '';
  event.choices.forEach((choice, i) => {
    choicesHTML +=
      '<div class="event-choice" onclick="handleEventChoice(\'' + event.id + '\',' + i + ')">' +
        '<div class="event-choice-main">' +
          '<span class="event-choice-text">' + choice.text + '</span>' +
          '<span class="event-choice-cost">' + scaleEventText(choice.cost) + '</span>' +
        '</div>' +
        (choice.hint ? '<div class="event-choice-hint">' + scaleEventText(choice.hint) + '</div>' : '') +
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
  var scale = getEventCostScale();

  // Check if player can afford (scaled cost)
  if (choice.cost.includes('-$')) {
    const costAmount = Math.ceil(parseInt(choice.cost.replace('-$', '').replace(',', '')) * scale);
    if (game.money < costAmount) {
      showToast('❌', '¡No tenés suficiente plata!');
      return;
    }
  }

  // Apply effect with money scaling
  var moneyBefore = game.money;
  var totalBefore = game.totalMoneyEarned;
  choice.effect(game);
  var moneyDiff = game.money - moneyBefore;
  if (moneyDiff !== 0 && scale > 1) {
    var scaledDiff = Math.ceil(moneyDiff * scale);
    var adjustment = scaledDiff - moneyDiff;
    game.money += adjustment;
    // Scale totalMoneyEarned if it was a gain
    if (moneyDiff > 0) {
      var totalDiff = game.totalMoneyEarned - totalBefore;
      if (totalDiff > 0) game.totalMoneyEarned += Math.ceil(totalDiff * (scale - 1));
    }
  }

  game.stats.eventsHandled++;
  game.dailyTracking.eventsHandled++;

  addLog('⚡ Evento: <span class="highlight">' + event.title + '</span> → ' + choice.text + ' (' + scaleEventText(choice.result) + ')');
  showToast(event.icon, scaleEventText(choice.result));

  document.getElementById('eventOverlay').classList.add('hidden');
  window._currentEvent = null;

  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

// ===== CLASSES =====
function getClassCost(gc) {
  var cost = gc.cost || 0;
  var levelScale = 1 + (game.level - 1) * 0.15;
  return Math.ceil(cost * levelScale);
}

function getClassReward(gc) {
  var levelScale = 1 + (game.level - 1) * 0.2;
  var prestigeMult = 1 + (game.prestigeStars * 0.25);
  var classMult = getSkillEffect('classIncomeMult');
  // Quality bonus: equipment level + staff level boost rewards
  var qualityBonus = 1;
  if (gc.reqEquipment) {
    var eqLvl = game.equipment[gc.reqEquipment]?.level || 0;
    qualityBonus += eqLvl * 0.05; // +5% per equipment level
  }
  if (gc.reqStaff) {
    var staffState = game.staff[gc.reqStaff];
    if (staffState?.hired) {
      qualityBonus += (staffState.level || 1) * 0.1; // +10% per staff level
    }
  }
  // Decoration class quality bonus
  qualityBonus += getDecorationBonus('classQuality');
  return {
    income: Math.ceil(gc.income * levelScale * prestigeMult * classMult * qualityBonus),
    xp: Math.ceil(gc.xp * levelScale * 0.5), // XP scales slower
    rep: Math.ceil(gc.rep * levelScale * 0.5),
    qualityBonus: qualityBonus
  };
}

function startClass(id) {
  const gc = GYM_CLASSES.find(c => c.id === id);
  if (!gc) return;

  // Check equipment requirement
  if (gc.reqEquipment) {
    var eqLevel = game.equipment[gc.reqEquipment]?.level || 0;
    if (eqLevel <= 0 || isEquipmentBroken(gc.reqEquipment)) {
      var eqData = EQUIPMENT.find(function(e) { return e.id === gc.reqEquipment; });
      showToast('❌', '¡Necesitás ' + (eqData ? eqData.name : gc.reqEquipment) + ' funcionando!');
      return;
    }
  }

  // Check staff requirement
  if (gc.reqStaff) {
    var staffState = game.staff[gc.reqStaff];
    if (!staffState?.hired) {
      var staffData = STAFF.find(function(s) { return s.id === gc.reqStaff; });
      showToast('❌', '¡Necesitás ' + (staffData ? staffData.name : gc.reqStaff) + '!');
      return;
    }
  }

  const state = game.classes[id];
  // Check cooldown
  if (state?.cooldownUntil && Date.now() < state.cooldownUntil) return;
  // Check not already running
  if (state?.runningUntil && Date.now() < state.runningUntil) return;

  // Check cost
  var classCost = getClassCost(gc);
  if (classCost > 0 && game.money < classCost) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  if (classCost > 0) game.money -= classCost;

  game.classes[id] = {
    runningUntil: Date.now() + gc.duration * 1000,
    cooldownUntil: 0,
    collected: false
  };

  addLog('🧘 Clase <span class="highlight">' + gc.name + '</span> iniciada! Costo: ' + fmtMoney(classCost) + ' (' + fmtTime(gc.duration) + ')');
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
    const missingEquip = gc.reqEquipment && ((game.equipment[gc.reqEquipment]?.level || 0) <= 0 || isEquipmentBroken(gc.reqEquipment));
    const missingStaff = gc.reqStaff && !game.staff[gc.reqStaff]?.hired;
    const isRunning = state.runningUntil && Date.now() < state.runningUntil;
    const onCooldown = state.cooldownUntil && Date.now() < state.cooldownUntil;

    // When class finishes, set cooldown
    if (state.runningUntil && Date.now() >= state.runningUntil && state.collected && !state.cooldownUntil) {
      game.classes[gc.id].cooldownUntil = Date.now() + gc.cooldown * 1000;
    }

    var classCost = getClassCost(gc);
    var reward = getClassReward(gc);
    var canAfford = game.money >= classCost;
    var profit = reward.income - classCost;

    let timerText = '';
    let btnHTML = '';
    let reqHTML = '';

    // Requirements display
    var reqs = [];
    if (gc.reqEquipment) {
      var eqData = EQUIPMENT.find(function(e) { return e.id === gc.reqEquipment; });
      var eqName = eqData ? eqData.icon + ' ' + eqData.name : gc.reqEquipment;
      var hasEq = !missingEquip;
      reqs.push('<span style="color:' + (hasEq ? 'var(--green)' : 'var(--red)') + ';">' + (hasEq ? '✅' : '❌') + ' ' + eqName + '</span>');
    }
    if (gc.reqStaff) {
      var staffData = STAFF.find(function(s) { return s.id === gc.reqStaff; });
      var staffName = staffData ? staffData.icon + ' ' + staffData.name : gc.reqStaff;
      var hasStaff = !missingStaff;
      reqs.push('<span style="color:' + (hasStaff ? 'var(--green)' : 'var(--red)') + ';">' + (hasStaff ? '✅' : '❌') + ' ' + staffName + '</span>');
    }
    if (reqs.length > 0 && !locked) {
      reqHTML = '<div style="font-size:11px;margin:4px 0;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">' + reqs.join('') + '</div>';
    }

    if (locked) {
      var reqParts = ['🔒 Requiere Nivel ' + gc.reqLevel];
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;">' + reqParts.join('<br>') + '</div>';
    } else if (missingEquip || missingStaff) {
      btnHTML = '<button class="btn btn-buy" disabled>🎯 INICIAR — ' + fmtMoney(classCost) + '</button>';
    } else if (isRunning) {
      const timeLeft = Math.ceil((state.runningUntil - Date.now()) / 1000);
      timerText = '<div class="class-timer">⏳ ' + fmtTime(timeLeft) + '</div>';
      btnHTML = '<button class="btn btn-green" disabled>EN CURSO...</button>';
    } else if (onCooldown) {
      const coolLeft = Math.ceil((state.cooldownUntil - Date.now()) / 1000);
      timerText = '<div class="class-timer" style="color:var(--text-muted);">⏱️ Cooldown: ' + fmtTime(coolLeft) + '</div>';
      btnHTML = '<button class="btn btn-buy" disabled>ESPERANDO</button>';
    } else {
      btnHTML = '<button class="btn btn-buy" ' + (canAfford ? '' : 'disabled') + ' onclick="startClass(\'' + gc.id + '\')">🎯 INICIAR — ' + fmtMoney(classCost) + '</button>';
    }

    // Quality indicator
    var qualityText = '';
    if (!locked && reward.qualityBonus > 1) {
      var qPct = Math.round((reward.qualityBonus - 1) * 100);
      qualityText = '<div style="font-size:11px;color:var(--accent);text-align:center;margin-top:2px;">⭐ Calidad +' + qPct + '% (equipo + staff)</div>';
    }

    return (
      '<div class="class-card ' + (locked ? 'locked' : '') + ' ' + (isRunning ? 'running' : '') + '">' +
        '<div class="class-icon">' + gc.icon + '</div>' +
        '<div class="class-name">' + gc.name + '</div>' +
        '<div class="class-desc">' + gc.desc + '</div>' +
        reqHTML +
        '<div class="class-stats">' +
          '<div class="class-stat"><span style="color:var(--green);">💰 ' + fmtMoney(reward.income) + '</span></div>' +
          (classCost > 0 ? '<div class="class-stat"><span style="color:var(--red);">💸 -' + fmtMoney(classCost) + '</span></div>' : '') +
          '<div class="class-stat"><span style="color:' + (profit > 0 ? 'var(--green)' : 'var(--red)') + ';">📊 ' + (profit >= 0 ? '+' : '') + fmtMoney(profit) + ' neto</span></div>' +
          '<div class="class-stat"><span style="color:var(--cyan);">✨ +' + reward.xp + ' XP · ⭐ +' + reward.rep + ' rep</span></div>' +
          '<div class="class-stat"><span style="color:var(--text-dim);">⏱️ ' + fmtTime(gc.duration) + ' · CD: ' + fmtTime(gc.cooldown) + '</span></div>' +
        '</div>' +
        qualityText +
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
  cost = Math.ceil(cost * getSkillEffect('campaignCostMult'));

  if (game.money < cost) {
    showToast('❌', '¡No tenés suficiente plata!');
    return;
  }

  game.money -= cost;
  var durationMult = getSkillEffect('campaignDurationMult');
  game.marketing[id] = {
    activeUntil: Date.now() + mc.duration * durationMult * 1000
  };

  var repBoost = Math.ceil(mc.repBoost * getSkillEffect('campaignRepMult'));
  game.reputation += repBoost;
  game.stats.campaignsLaunched++;
  game.dailyTracking.campaignsLaunched++;
  game.dailyTracking.reputationGained += mc.repBoost;

  const xpGain = 20;
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

  // Marketing summary
  var activeCampaigns = MARKETING_CAMPAIGNS.filter(mc => {
    const state = game.marketing[mc.id];
    return state?.activeUntil && Date.now() < state.activeUntil;
  });
  var summaryHTML = '';
  if (activeCampaigns.length > 0) {
    summaryHTML = '<div class="marketing-summary"><div class="marketing-summary-title">📢 Campañas Activas: ' + activeCampaigns.length + '</div>';
    activeCampaigns.forEach(mc => {
      const state = game.marketing[mc.id];
      const timeLeft = Math.ceil((state.activeUntil - Date.now()) / 1000);
      const totalDuration = mc.duration;
      const elapsed = totalDuration - timeLeft;
      const progressPct = Math.round((elapsed / totalDuration) * 100);
      summaryHTML += '<div class="marketing-active-item">' +
        '<span>' + mc.icon + ' ' + mc.name + '</span>' +
        '<span style="color:var(--cyan);">+' + mc.membersBoost + ' miembros</span>' +
        '<span style="color:var(--text-dim);">⏱️ ' + fmtTime(timeLeft) + '</span>' +
        '<div class="marketing-progress-bar"><div class="marketing-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
    });
    summaryHTML += '</div>';
  }

  var cardsHTML = MARKETING_CAMPAIGNS.map(mc => {
    const state = game.marketing[mc.id] || {};
    const locked = game.level < mc.reqLevel;
    const isActive = state.activeUntil && Date.now() < state.activeUntil;

    let cost = mc.cost;
    if (game.staff.manager?.hired) cost = Math.ceil(cost * 0.8);
    cost = Math.ceil(cost * getSkillEffect('campaignCostMult'));
    const canAfford = game.money >= cost;

    let timerHTML = '';
    let btnHTML = '';

    if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px;">🔒 Requiere Nivel ' + mc.reqLevel + '</div>';
    } else if (isActive) {
      const timeLeft = Math.ceil((state.activeUntil - Date.now()) / 1000);
      const totalDuration = mc.duration;
      const progressPct = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);
      timerHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="marketing-badge running">ACTIVA — ' + fmtTime(timeLeft) + '</span>' +
        '<div class="marketing-progress-bar" style="margin-top:6px;"><div class="marketing-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
      btnHTML = '<button class="btn btn-green" disabled>✅ EN CURSO</button>';
    } else {
      btnHTML = '<button class="btn btn-cyan" ' + (canAfford ? '' : 'disabled') + ' onclick="launchCampaign(\'' + mc.id + '\')">📢 LANZAR — ' + fmtMoney(cost) + '</button>';
    }

    return (
      '<div class="marketing-card ' + (locked ? 'locked' : '') + ' ' + (isActive ? 'active' : '') + '">' +
        '<div class="marketing-header">' +
          '<span class="marketing-icon">' + mc.icon + '</span>' +
        '</div>' +
        '<div class="marketing-name">' + mc.name + '</div>' +
        '<div class="marketing-desc">' + mc.desc + '</div>' +
        '<div class="marketing-stats">' +
          '<div class="marketing-stat"><span style="color:var(--cyan);">👥 +' + mc.membersBoost + ' miembros</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--purple);">⭐ +' + mc.repBoost + ' rep</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--text-dim);">⏱️ Duración: ' + fmtTime(mc.duration) + '</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--red);">💰 Costo: ' + fmtMoney(cost) + '</span></div>' +
        '</div>' +
        timerHTML +
        btnHTML +
      '</div>'
    );
  }).join('');

  grid.innerHTML = summaryHTML + cardsHTML;
}

// ===== SUPPLEMENTS =====
function renderSupplements() {
  var grid = document.getElementById('supplementsGrid');
  if (!grid) return;

  // Summary of active supplements
  var activeSupps = SUPPLEMENTS.filter(function(sup) {
    var state = game.supplements[sup.id];
    return state && state.activeUntil && Date.now() < state.activeUntil;
  });

  var summaryHTML = '';
  if (activeSupps.length > 0) {
    summaryHTML = '<div class="supplement-summary"><div class="supplement-summary-title">🧃 Suplementos Activos: ' + activeSupps.length + '</div>';
    activeSupps.forEach(function(sup) {
      var state = game.supplements[sup.id];
      var timeLeft = Math.ceil((state.activeUntil - Date.now()) / 1000);
      var totalDuration = sup.duration;
      var elapsed = totalDuration - timeLeft;
      var progressPct = Math.round((elapsed / totalDuration) * 100);
      summaryHTML += '<div class="supplement-active-item">' +
        '<span>' + sup.icon + ' ' + sup.name + '</span>' +
        '<span style="color:var(--green);">' + getSupplementEffectText(sup) + '</span>' +
        '<span style="color:var(--text-dim);">⏱️ ' + fmtTime(timeLeft) + '</span>' +
        '<div class="supplement-progress-bar"><div class="supplement-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
    });
    summaryHTML += '</div>';
  }

  var cardsHTML = SUPPLEMENTS.map(function(sup) {
    var state = game.supplements[sup.id] || {};
    var locked = game.level < sup.reqLevel;
    var isActive = state.activeUntil && Date.now() < state.activeUntil;

    var cost = getSupplementCost(sup);
    var canAfford = game.money >= cost;

    var timerHTML = '';
    var btnHTML = '';

    if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px;">🔒 Requiere Nivel ' + sup.reqLevel + '</div>';
    } else if (isActive) {
      var timeLeft = Math.ceil((state.activeUntil - Date.now()) / 1000);
      var totalDuration = sup.duration;
      var progressPct = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);
      timerHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="supplement-badge running">ACTIVO — ' + fmtTime(timeLeft) + '</span>' +
        '<div class="supplement-progress-bar" style="margin-top:6px;"><div class="supplement-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
      btnHTML = '<button class="btn btn-green" disabled>✅ EN CURSO</button>';
    } else {
      btnHTML = '<button class="btn btn-buy" ' + (canAfford ? '' : 'disabled') + ' onclick="buySupplement(\'' + sup.id + '\')">🧃 TOMAR — ' + fmtMoney(cost) + '</button>';
    }

    return (
      '<div class="supplement-card ' + (locked ? 'locked' : '') + ' ' + (isActive ? 'active' : '') + '">' +
        '<div class="supplement-header">' +
          '<span class="supplement-icon">' + sup.icon + '</span>' +
        '</div>' +
        '<div class="supplement-name">' + sup.name + '</div>' +
        '<div class="supplement-desc">' + sup.desc + '</div>' +
        '<div class="supplement-stats">' +
          '<div class="supplement-stat">💪 <span class="val">' + getSupplementEffectText(sup) + '</span></div>' +
          '<div class="supplement-stat">⏱️ <span class="val">' + fmtTime(sup.duration) + '</span></div>' +
          '<div class="supplement-stat">💰 <span class="val">' + fmtMoney(cost) + '</span></div>' +
        '</div>' +
        timerHTML +
        btnHTML +
      '</div>'
    );
  }).join('');

  grid.innerHTML = summaryHTML + cardsHTML;
}

function getSupplementEffectText(sup) {
  var parts = [];
  var e = sup.effects;
  if (e.incomeMult) parts.push('+' + Math.round((e.incomeMult - 1) * 100) + '% income');
  if (e.equipIncomeMult) parts.push('+' + Math.round((e.equipIncomeMult - 1) * 100) + '% income equipos');
  if (e.classIncomeMult) parts.push('+' + Math.round((e.classIncomeMult - 1) * 100) + '% income clases');
  if (e.marketingMult) parts.push('+' + Math.round((e.marketingMult - 1) * 100) + '% marketing');
  if (e.capacityBonus) parts.push('+' + e.capacityBonus + ' capacidad');
  if (e.repBonus) parts.push('+' + e.repBonus + ' rep');
  if (e.repPerMin) parts.push('+' + e.repPerMin + ' rep/min');
  return parts.join(', ');
}

// ===== RIVAL GYMS =====
function renderRivals() {
  var grid = document.getElementById('rivalsGrid');
  if (!grid) return;

  var totalSteal = getRivalMemberSteal();
  var defeatedCount = RIVAL_GYMS.filter(function(r) {
    var state = game.rivals[r.id];
    return state && state.defeated;
  }).length;
  var unlockedCount = RIVAL_GYMS.filter(function(r) { return game.level >= r.reqLevel; }).length;

  // Summary
  var summaryHTML = '';
  if (unlockedCount > 0) {
    summaryHTML = '<div class="rival-summary">' +
      '<div class="rival-summary-title">🏪 Competencia del Mercado</div>' +
      '<div class="rival-summary-stats">' +
        '<div class="rival-summary-stat">' +
          '<span class="rival-summary-label">Rivales activos</span>' +
          '<span class="rival-summary-value" style="color:var(--red);">' + (unlockedCount - defeatedCount) + '</span>' +
        '</div>' +
        '<div class="rival-summary-stat">' +
          '<span class="rival-summary-label">Rivales superados</span>' +
          '<span class="rival-summary-value" style="color:var(--green);">' + defeatedCount + ' / ' + RIVAL_GYMS.length + '</span>' +
        '</div>' +
        '<div class="rival-summary-stat">' +
          '<span class="rival-summary-label">Miembros perdidos</span>' +
          '<span class="rival-summary-value" style="color:' + (totalSteal > 0 ? 'var(--red)' : 'var(--green)') + ';">' + (totalSteal > 0 ? '-' + totalSteal : '0') + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  var cardsHTML = RIVAL_GYMS.map(function(r) {
    var state = game.rivals[r.id] || {};
    var locked = game.level < r.reqLevel;
    var defeated = state.defeated;
    var promoActive = state.promoUntil && Date.now() < state.promoUntil;

    var promoCost = getRivalPromoCost(r);
    var defeatCost = getRivalDefeatCost(r);

    var statusHTML = '';
    var actionsHTML = '';

    if (locked) {
      statusHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px;">🔒 Requiere Nivel ' + r.reqLevel + '</div>';
    } else if (defeated) {
      var bonusParts = [];
      if (r.defeatBonus.income) bonusParts.push('+' + r.defeatBonus.income + ' income/s');
      if (r.defeatBonus.capacity) bonusParts.push('+' + r.defeatBonus.capacity + ' capacidad');
      statusHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="rival-badge defeated">SUPERADO</span>' +
      '</div>' +
      '<div style="text-align:center;font-size:12px;color:var(--green);margin-bottom:8px;">Bonus: ' + bonusParts.join(', ') + '</div>';
    } else if (promoActive) {
      var timeLeft = Math.ceil((state.promoUntil - Date.now()) / 1000);
      var totalDuration = r.promoDuration;
      var progressPct = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);
      statusHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="rival-badge promo">NEUTRALIZADO — ' + fmtTime(timeLeft) + '</span>' +
        '<div class="rival-progress-bar" style="margin-top:6px;"><div class="rival-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
      actionsHTML = '<button class="btn btn-red" ' + (game.money >= defeatCost ? '' : 'disabled') + ' onclick="defeatRival(\'' + r.id + '\')">🏆 SUPERAR — ' + fmtMoney(defeatCost) + '</button>';
    } else {
      statusHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="rival-badge threat">AMENAZA — -' + r.memberSteal + ' miembros</span>' +
      '</div>';
      actionsHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn btn-cyan" style="flex:1;" ' + (game.money >= promoCost ? '' : 'disabled') + ' onclick="launchRivalPromo(\'' + r.id + '\')">📣 PROMO — ' + fmtMoney(promoCost) + '</button>' +
        '<button class="btn btn-red" style="flex:1;" ' + (game.money >= defeatCost ? '' : 'disabled') + ' onclick="defeatRival(\'' + r.id + '\')">🏆 SUPERAR — ' + fmtMoney(defeatCost) + '</button>' +
      '</div>';
    }

    return (
      '<div class="rival-card ' + (locked ? 'locked' : '') + ' ' + (defeated ? 'defeated' : '') + ' ' + (promoActive ? 'promo' : '') + '">' +
        '<div class="rival-header">' +
          '<span class="rival-icon">' + r.icon + '</span>' +
        '</div>' +
        '<div class="rival-name">' + r.name + '</div>' +
        '<div class="rival-desc">' + r.desc + '</div>' +
        (!locked && !defeated ? '<div class="rival-stats">' +
          '<div class="rival-stat">👥 <span class="val">-' + r.memberSteal + ' miembros</span></div>' +
          '<div class="rival-stat">⏱️ <span class="val">Promo: ' + fmtTime(r.promoDuration) + '</span></div>' +
        '</div>' : '') +
        statusHTML +
        actionsHTML +
      '</div>'
    );
  }).join('');

  grid.innerHTML = summaryHTML + cardsHTML;
}

// ===== LEADERBOARD =====
let leaderboardLoading = false;

function renderLeaderboard() {
  var container = document.getElementById('leaderboardContainer');
  if (!container) return;

  // Check if user is authenticated
  if (typeof currentUser === 'undefined' || !currentUser) {
    container.innerHTML = '<div class="leaderboard-empty">' +
      '<div style="font-size:40px;margin-bottom:12px;">🔒</div>' +
      '<p style="color:var(--text-dim);">Iniciá sesión para ver el ranking global y competir con otros jugadores.</p>' +
    '</div>';
    return;
  }

  if (leaderboardLoading) return;
  leaderboardLoading = true;

  container.innerHTML = '<div class="leaderboard-loading">Cargando ranking...</div>';

  Promise.all([fetchLeaderboard(false), fetchMyRank()]).then(function(results) {
    var entries = results[0];
    var myRank = results[1];
    leaderboardLoading = false;

    if (!entries || entries.length === 0) {
      container.innerHTML = '<div class="leaderboard-empty">' +
        '<div style="font-size:40px;margin-bottom:12px;">🏆</div>' +
        '<p style="color:var(--text-dim);">Todavía no hay datos en el ranking. ¡Seguí jugando para ser el primero!</p>' +
      '</div>';
      return;
    }

    var rankIcons = ['🥇', '🥈', '🥉'];

    var myRankHTML = '';
    if (myRank) {
      myRankHTML = '<div class="leaderboard-myrank">' +
        '<span>Tu posición:</span> <span class="leaderboard-myrank-value">#' + myRank + '</span>' +
      '</div>';
    }

    var headerHTML = '<div class="leaderboard-row leaderboard-header">' +
      '<div class="lb-rank">#</div>' +
      '<div class="lb-name">Jugador</div>' +
      '<div class="lb-money">Total Ganado</div>' +
      '<div class="lb-level">Nivel</div>' +
      '<div class="lb-stars">⭐</div>' +
    '</div>';

    var rowsHTML = entries.map(function(entry, i) {
      var isMe = currentUser && entry.uid === currentUser.uid;
      var rankDisplay = i < 3 ? rankIcons[i] : (i + 1);
      var starsDisplay = entry.prestigeStars > 0 ? ('⭐' + entry.prestigeStars) : '-';

      return '<div class="leaderboard-row ' + (isMe ? 'me' : '') + '">' +
        '<div class="lb-rank">' + rankDisplay + '</div>' +
        '<div class="lb-name">' +
          '<div class="lb-username">' + escapeHtml(entry.username || 'Anónimo') + '</div>' +
          '<div class="lb-gymname">' + escapeHtml(entry.gymName || 'Sin nombre') + '</div>' +
        '</div>' +
        '<div class="lb-money">' + fmtMoney(entry.totalMoneyEarned || 0) + '</div>' +
        '<div class="lb-level">' + (entry.level || 1) + '</div>' +
        '<div class="lb-stars">' + starsDisplay + '</div>' +
      '</div>';
    }).join('');

    var refreshBtnHTML = '<div style="text-align:center;margin-top:12px;">' +
      '<button class="btn btn-small btn-cyan" onclick="refreshLeaderboard()">🔄 ACTUALIZAR</button>' +
    '</div>';

    container.innerHTML = myRankHTML + headerHTML + rowsHTML + refreshBtnHTML;
  }).catch(function() {
    leaderboardLoading = false;
    container.innerHTML = '<div class="leaderboard-empty">' +
      '<p style="color:var(--text-dim);">Error al cargar el ranking. Intentá de nuevo.</p>' +
      '<button class="btn btn-small btn-cyan" onclick="refreshLeaderboard()" style="margin-top:8px;">🔄 REINTENTAR</button>' +
    '</div>';
  });
}

function refreshLeaderboard() {
  leaderboardLoading = false;
  leaderboardCache = null;
  leaderboardCacheTime = 0;
  renderLeaderboard();
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
    switchTab(step.tab);
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
  switchTab('gym');

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
  if (isZoneBuilding(zoneId)) return;
  if (game.level < zone.reqLevel) return;
  var zoneCost = Math.ceil(zone.cost * getSkillEffect('zoneCostMult'));
  if (game.money < zoneCost) return;

  // Check concurrent zone build limit (1, +1 with manager)
  var activeBuilds = getActiveZoneBuilds();
  var maxBuilds = getMaxConcurrentUpgrades();
  if (activeBuilds >= maxBuilds) {
    showToast('❌', '¡Ya hay ' + activeBuilds + ' construcción(es) en curso!');
    return;
  }

  game.money -= zoneCost;

  const xpGain = 100;
  game.xp += xpGain;
  game.dailyTracking.xpEarned += xpGain;

  if (zone.buildTime > 0) {
    // Start construction timer (speed mult < 1 = faster)
    if (!game.zoneBuilding) game.zoneBuilding = {};
    var buildDuration = Math.ceil(zone.buildTime * getSkillEffect('zoneBuildSpeedMult'));
    game.zoneBuilding[zoneId] = Date.now() + buildDuration * 1000;
    addLog('🏗️ Construyendo <span class="highlight">' + zone.name + '</span> ' + zone.icon + ' (' + fmtTime(buildDuration) + ')');
    showToast('🏗️', 'Construyendo ' + zone.name + '... ' + fmtTime(buildDuration));
  } else {
    // Instant (ground floor)
    game.zones[zoneId] = true;
    game.stats.zonesUnlocked++;
    addLog('🏗️ Nueva zona: <span class="highlight">' + zone.name + '</span> ' + zone.icon);
    showToast(zone.icon, '¡Zona desbloqueada: ' + zone.name + '!');
    floatNumber('+' + zone.capacityBonus + ' capacidad', 'var(--accent)');
    updateMembers();
  }

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
    const building = isZoneBuilding(z.id);
    mapHTML += '<div class="expansion-zone-icon ' + (owned ? 'owned' : (building ? 'building' : 'locked')) + '">';
    mapHTML += '<span>' + z.icon + '</span>';
    mapHTML += '<span class="expansion-zone-label">' + z.name + '</span>';
    mapHTML += '</div>';
  });
  mapHTML += '</div>';

  let cardsHTML = '<div class="expansion-grid">';
  GYM_ZONES.forEach(z => {
    const owned = game.zones[z.id];
    const building = isZoneBuilding(z.id);
    const locked = game.level < z.reqLevel;
    const adjustedCost = Math.ceil(z.cost * getSkillEffect('zoneCostMult'));
    const canAfford = game.money >= adjustedCost;

    let btnHTML = '';
    let cardExtra = '';
    if (owned) {
      btnHTML = '<button class="btn btn-green" disabled>✅ DESBLOQUEADA</button>';
    } else if (building) {
      var bldEnd = game.zoneBuilding[z.id];
      var bldDuration = z.buildTime * 1000;
      var bldStart = bldEnd - bldDuration;
      var bldElapsed = Date.now() - bldStart;
      var bldPct = Math.min(100, (bldElapsed / bldDuration) * 100);
      var bldRemaining = Math.max(0, Math.ceil((bldEnd - Date.now()) / 1000));
      var bldMins = Math.floor(bldRemaining / 60);
      var bldSecs = bldRemaining % 60;
      var bldTimeStr = bldRemaining >= 3600 ? Math.floor(bldRemaining / 3600) + 'h ' + Math.floor((bldRemaining % 3600) / 60) + 'm' : bldMins + ':' + (bldSecs < 10 ? '0' : '') + bldSecs;
      btnHTML = '<div class="zone-build-badge">🏗️ EN CONSTRUCCIÓN</div>';
      btnHTML += '<div class="equip-repair-bar"><div class="equip-upgrade-fill" style="width:' + bldPct + '%"></div></div>';
      btnHTML += '<div class="equip-upgrade-time">Listo en ' + bldTimeStr + '</div>';
      cardExtra = ' building';
    } else if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;">🔒 Requiere Nivel ' + z.reqLevel + '</div>';
    } else {
      var adjustedBuildTime = Math.ceil(z.buildTime * getSkillEffect('zoneBuildSpeedMult'));
      var timeStr = adjustedBuildTime >= 3600 ? Math.floor(adjustedBuildTime / 3600) + 'h' : Math.floor(adjustedBuildTime / 60) + 'min';
      btnHTML = '<button class="btn btn-buy" ' + (canAfford ? '' : 'disabled') + ' onclick="buyZone(\'' + z.id + '\')">🏗️ CONSTRUIR — ' + fmtMoney(adjustedCost) + (z.buildTime > 0 ? ' (' + timeStr + ')' : '') + '</button>';
    }

    cardsHTML += '<div class="expansion-card ' + (owned ? 'owned' : '') + (locked && !owned && !building ? ' locked' : '') + cardExtra + '">';
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

  // Property purchase section
  var propertyHTML = '';
  var propLocked = game.level < OPERATING_COSTS.propertyReqLevel;
  var opDaily = getOperatingCostsPerDay();
  var rentDaily = 0;
  if (!game.ownProperty) {
    rentDaily = OPERATING_COSTS.baseRent;
    var extraZ = 0;
    GYM_ZONES.forEach(function(z) { if (z.id !== 'ground_floor' && game.zones[z.id]) extraZ++; });
    rentDaily += extraZ * OPERATING_COSTS.rentPerExtraZone;
  }
  propertyHTML = '<div class="expansion-property">';
  propertyHTML += '<div class="section-title" style="font-size:16px;margin-top:16px;">🏠 Propiedad del Local</div>';
  if (game.ownProperty) {
    propertyHTML += '<p style="color:var(--green);text-align:center;">✅ Sos dueño del local. No pagás alquiler.</p>';
  } else if (propLocked) {
    propertyHTML += '<p style="color:var(--text-muted);text-align:center;">🔒 Requiere Nivel ' + OPERATING_COSTS.propertyReqLevel + ' para comprar el local.</p>';
    propertyHTML += '<p style="color:var(--red);text-align:center;font-size:13px;">Alquiler actual: ' + fmtMoney(rentDaily) + '/día</p>';
  } else {
    propertyHTML += '<p style="color:var(--text-dim);text-align:center;font-size:13px;">Comprá el local y dejá de pagar alquiler (' + fmtMoney(rentDaily) + '/día).</p>';
    var canAffordProp = game.money >= OPERATING_COSTS.propertyPrice;
    propertyHTML += '<div style="text-align:center;"><button class="btn btn-buy" ' + (canAffordProp ? '' : 'disabled') + ' onclick="buyProperty()">🏠 COMPRAR LOCAL — ' + fmtMoney(OPERATING_COSTS.propertyPrice) + '</button></div>';
  }
  propertyHTML += '<p style="color:var(--text-dim);text-align:center;font-size:12px;margin-top:8px;">Gastos operativos totales: ' + fmtMoney(opDaily) + '/día (alquiler + servicios)</p>';
  propertyHTML += '</div>';

  container.innerHTML = mapHTML + cardsHTML + propertyHTML;
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
  const vipMult = getSkillEffect('vipRewardMult');
  const moneyReward = Math.ceil(vipDef.reward.money * prestigeMult * vipMult);

  game.money += moneyReward;
  game.totalMoneyEarned += moneyReward;
  game.reputation += Math.ceil(vipDef.reward.rep * vipMult);
  game.xp += Math.ceil(vipDef.reward.xp * vipMult);
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

    // Check each requirement individually
    var reqDetails = [];
    var allMet = true;
    vipDef.requires.forEach(function(req) {
      var met = false;
      var label = req;
      // Check equipment
      var eqDef = EQUIPMENT.find(function(e) { return e.id === req; });
      if (eqDef) {
        met = (game.equipment[req]?.level || 0) > 0;
        label = eqDef.icon + ' ' + eqDef.name;
      }
      // Check staff
      var stDef = STAFF.find(function(s) { return s.id === req; });
      if (stDef) {
        met = !!game.staff[req]?.hired;
        label = stDef.icon + ' ' + stDef.name;
      }
      // Check zones
      var znDef = GYM_ZONES.find(function(z) { return z.id === req; });
      if (znDef) {
        met = !!game.zones[req];
        label = znDef.icon + ' ' + znDef.name;
      }
      // Check class types
      var classId = req.replace('_class', '');
      var gcDef = GYM_CLASSES.find(function(c) { return c.id === classId; });
      if (gcDef && !eqDef && !stDef && !znDef) {
        met = game.level >= gcDef.reqLevel;
        label = gcDef.icon + ' ' + gcDef.name;
      }
      if (!met) allMet = false;
      reqDetails.push({ label: label, met: met });
    });

    html += '<div class="vip-card ' + (v.accepted ? 'accepted' : '') + '">';
    html += '<div class="vip-icon">' + vipDef.icon + '</div>';
    html += '<div class="vip-info">';
    html += '<div class="vip-name">' + vipDef.name + '</div>';
    html += '<div class="vip-request">"' + vipDef.request + '"</div>';

    // Show detailed requirements
    if (!v.accepted) {
      html += '<div class="vip-reqs" style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;">';
      reqDetails.forEach(function(rd) {
        html += '<span style="font-size:11px;padding:2px 6px;border-radius:4px;background:' + (rd.met ? 'rgba(0,200,100,0.15)' : 'rgba(255,50,50,0.15)') + ';color:' + (rd.met ? 'var(--green)' : 'var(--red)') + ';">' + (rd.met ? '✅' : '❌') + ' ' + rd.label + '</span>';
      });
      html += '</div>';
    }

    html += '<div class="vip-reward">💰 ' + fmtMoney(vipDef.reward.money) + ' · ⭐ ' + vipDef.reward.rep + ' · ✨ ' + vipDef.reward.xp + ' XP</div>';
    html += '<div class="vip-timer">' + (v.accepted ? '✅ Miembro activo' : '⏱️ Se va en: ' + fmtTime(timeLeft)) + '</div>';
    html += '</div>';

    if (!v.accepted) {
      html += '<button class="btn ' + (allMet ? 'btn-buy' : 'btn-red') + ' btn-small" onclick="acceptVip(\'' + v.id + '\')">';
      html += allMet ? '✅ ACEPTAR' : '❌ NO CUMPLÍS';
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

  // Rivals tab - count active threats
  var rivalsDot = document.getElementById('dot-rivals');
  if (rivalsDot) {
    var threatCount = RIVAL_GYMS.filter(function(r) {
      if (game.level < r.reqLevel) return false;
      var state = game.rivals[r.id];
      if (state && state.defeated) return false;
      if (state && state.promoUntil && Date.now() < state.promoUntil) return false;
      return true;
    }).length;
    if (threatCount > 0) {
      rivalsDot.classList.remove('hidden');
      rivalsDot.textContent = threatCount;
    } else {
      rivalsDot.classList.add('hidden');
      rivalsDot.textContent = '';
    }
  }

  // Supplements tab - count active supplements
  const suppDot = document.getElementById('dot-supplements');
  if (suppDot) {
    const activeCount = SUPPLEMENTS.filter(function(sup) {
      var state = game.supplements[sup.id];
      return state && state.activeUntil && Date.now() < state.activeUntil;
    }).length;
    if (activeCount > 0) {
      suppDot.classList.remove('hidden');
      suppDot.textContent = activeCount;
    } else {
      suppDot.classList.add('hidden');
      suppDot.textContent = '';
    }
  }

  // Update category badges with notification counts
  if (typeof updateCategoryBadges === 'function') updateCategoryBadges();
}

// ===== TAB REMINDER SYSTEM =====
var TAB_REMINDER_CONFIG = {
  equipment: {
    minAbsence: 300,
    check: function() {
      return EQUIPMENT.some(function(eq) {
        var state = game.equipment[eq.id];
        if (!state || !state.level) return game.money >= eq.baseCost && game.level >= eq.reqLevel;
        if (state.level < game.level) return game.money >= getEquipCost(eq, state.level + 1);
        return false;
      });
    }
  },
  staff: {
    minAbsence: 300,
    check: function() {
      return STAFF.some(function(s) {
        var state = game.staff[s.id];
        if (!state || !state.hired) return game.money >= getStaffCost(s, 0) && game.level >= s.reqLevel;
        return state.level < 5 && !isStaffTraining(s.id, 0) && game.money >= getTrainingCost(s, state.level + 1);
      });
    }
  },
  classes: {
    minAbsence: 120,
    check: function() {
      return GYM_CLASSES.some(function(gc) {
        if (game.level < gc.reqLevel) return false;
        var state = game.classes[gc.id];
        if (state && state.runningUntil && Date.now() >= state.runningUntil && !state.collected) return true;
        if (!state) return true;
        if (state.runningUntil && Date.now() < state.runningUntil) return false;
        if (state.cooldownUntil && Date.now() < state.cooldownUntil) return false;
        return true;
      });
    }
  },
  supplements: {
    minAbsence: 300,
    check: function() {
      return SUPPLEMENTS.some(function(sup) {
        if (game.level < sup.reqLevel) return false;
        var state = game.supplements[sup.id];
        if (state && state.activeUntil && Date.now() < state.activeUntil) return false;
        return game.money >= getSupplementCost(sup);
      });
    }
  },
  marketing: {
    minAbsence: 300,
    check: function() {
      return MARKETING.some(function(m) {
        if (game.level < m.reqLevel) return false;
        var state = game.marketing[m.id];
        if (state && state.activeUntil && Date.now() < state.activeUntil) return false;
        var cost = Math.ceil(m.cost * getSkillEffect('campaignCostMult'));
        return game.money >= cost;
      });
    }
  },
  missions: {
    minAbsence: 180,
    check: function() {
      return (game.dailyMissions.missions || []).some(function(m) { return m.completed && !m.claimed; });
    }
  },
  vip: {
    minAbsence: 120,
    check: function() {
      return (game.vipMembers || []).some(function(v) { return !v.accepted; });
    }
  },
  rivals: {
    minAbsence: 300,
    check: function() {
      return RIVAL_GYMS.some(function(r) {
        if (game.level < r.reqLevel) return false;
        var state = game.rivals[r.id];
        if (state && state.defeated) return false;
        if (state && state.promoUntil && Date.now() < state.promoUntil) return false;
        return true;
      });
    }
  },
  champion: {
    minAbsence: 300,
    check: function() {
      if (!game.champion.recruited) return game.level >= 5 && game.money >= 5000;
      return game.champion.energy >= 50 && (!game.champion.trainingUntil || Date.now() >= game.champion.trainingUntil);
    }
  },
  expansion: {
    minAbsence: 600,
    check: function() {
      return GYM_ZONES.some(function(z) {
        if (game.zones[z.id]) return false;
        if (game.zoneBuilding[z.id]) return Date.now() >= game.zoneBuilding[z.id];
        var cost = Math.ceil(z.cost * getSkillEffect('zoneCostMult'));
        return game.money >= cost && game.level >= z.reqLevel;
      });
    }
  },
  skills: {
    minAbsence: 600,
    check: function() {
      var found = false;
      Object.values(SKILL_TREE).forEach(function(branch) {
        branch.skills.forEach(function(sk) {
          if (!game.skills[sk.id] && game.level >= sk.reqLevel && game.money >= sk.cost) found = true;
        });
      });
      return found;
    }
  },
  achievements: {
    minAbsence: 600,
    check: function() {
      var unlocked = ACHIEVEMENTS.filter(function(a) { return game.achievements[a.id]; }).length;
      return unlocked > (game._lastSeenAchievementCount || 0);
    }
  }
};

function updateTabReminders() {
  var now = Date.now();
  if (!game.tabLastVisited) game.tabLastVisited = {};

  for (var tabId in TAB_REMINDER_CONFIG) {
    var config = TAB_REMINDER_CONFIG[tabId];
    var reminderEl = document.getElementById('reminder-' + tabId);
    if (!reminderEl) continue;

    var lastVisit = game.tabLastVisited[tabId] || 0;
    var absentSeconds = (now - lastVisit) / 1000;

    if (absentSeconds >= config.minAbsence && activeTab !== tabId && config.check()) {
      reminderEl.classList.remove('hidden');
    } else {
      reminderEl.classList.add('hidden');
    }
  }

  updateCategoryBadges();
}

function updateCategoryBadges() {
  var categoryMap = {
    general: ['missions', 'achievements'],
    operations: ['equipment', 'staff', 'classes', 'supplements'],
    growth: ['marketing', 'expansion', 'skills'],
    competition: ['champion', 'rivals', 'vip']
  };

  for (var catId in categoryMap) {
    var badge = document.getElementById('cat-badge-' + catId);
    if (!badge) continue;

    var tabIds = categoryMap[catId];
    var totalNotif = 0;
    var hasReminder = false;

    tabIds.forEach(function(tabId) {
      var notifEl = document.getElementById('dot-' + tabId);
      if (notifEl && !notifEl.classList.contains('hidden')) {
        totalNotif += parseInt(notifEl.textContent) || 1;
      }
      var reminderEl = document.getElementById('reminder-' + tabId);
      if (reminderEl && !reminderEl.classList.contains('hidden')) {
        hasReminder = true;
      }
    });

    if (totalNotif > 0) {
      badge.classList.remove('hidden', 'reminder-only');
      badge.textContent = totalNotif;
    } else if (hasReminder) {
      badge.classList.remove('hidden');
      badge.classList.add('reminder-only');
      badge.textContent = '!';
    } else {
      badge.classList.add('hidden');
    }
  }
}

// ===== CHAMPION SYSTEM =====

function renderChampion() {
  var container = document.getElementById('championContainer');
  if (!container) return;

  // Not unlocked yet - show normal competitions
  if (game.level < CHAMPION_UNLOCK_LEVEL) {
    var html = '<div class="champion-locked-panel">' +
      '<div style="font-size:64px;margin-bottom:16px;">🏅</div>' +
      '<h3 style="margin:0 0 8px;">Campeón</h3>' +
      '<p style="color:var(--text-dim);margin:0 0 8px;">Desbloqueá tu campeón en <strong>Nivel ' + CHAMPION_UNLOCK_LEVEL + '</strong></p>' +
      '<p style="color:var(--text-muted);font-size:13px;margin:0;">Estás en Nivel ' + game.level + '</p>' +
    '</div>';
    html += renderNormalCompetitions();
    container.innerHTML = html;
    return;
  }

  // Not recruited yet - show recruit + normal competitions
  if (!game.champion.recruited) {
    var canAfford = game.money >= CHAMPION_RECRUIT_COST;
    var html = '<div class="champion-locked-panel">' +
      '<div style="font-size:64px;margin-bottom:16px;">🏅</div>' +
      '<h3 style="margin:0 0 8px;">Reclutá tu Campeón</h3>' +
      '<p style="color:var(--text-dim);margin:0 0 16px;">Un peleador busca gym. Entrenalo, equipalo y llevalo a competir por premios increíbles. ¡Tu campeón gana el doble!</p>' +
      '<button class="btn btn-buy" style="font-size:16px;padding:14px 28px;" ' +
        (canAfford ? '' : 'disabled') +
        ' onclick="recruitChampion()">🏅 RECLUTAR — ' + fmtMoney(CHAMPION_RECRUIT_COST) + '</button>' +
    '</div>';
    html += renderNormalCompetitions();
    container.innerHTML = html;
    return;
  }

  // Full champion UI
  var stage = getChampionVisualStage();
  var isTraining = game.champion.trainingUntil && Date.now() < game.champion.trainingUntil;
  var html = '';

  // --- Champion Visual Display ---
  html += '<div class="champion-display">';
  html += '<div class="champion-stage-label">' + stage.name.toUpperCase() + '</div>';
  html += renderChampionBody(stage);
  html += '<div class="champion-name">' + game.champion.name + '</div>';
  html += '<div class="champion-record">🏆 ' + game.champion.wins + 'V - ' + game.champion.losses + 'D</div>';
  html += '<button class="btn btn-small btn-cyan" onclick="showChampionCustomize()" style="margin-top:8px;font-size:12px;">✏️ Personalizar</button>';
  html += '</div>';

  // --- Customization panel (hidden by default) ---
  html += '<div class="champion-customize hidden" id="championCustomize">';
  html += renderChampionCustomizePanel();
  html += '</div>';

  // --- Level + XP bar ---
  var xpNeeded = getChampionXpToNext();
  var xpPct = Math.min(100, Math.floor((game.champion.xp / xpNeeded) * 100));
  html += '<div class="champion-info-bar">';
  html += '<div class="champion-level-badge">🏅 NIVEL ' + game.champion.level + '</div>';
  html += '<div class="champion-xp-bar"><div class="champion-xp-fill" style="width:' + xpPct + '%"></div><span class="champion-xp-text">' + game.champion.xp + ' / ' + xpNeeded + ' XP</span></div>';
  html += '</div>';

  // --- Energy bar ---
  var energyPct = Math.floor((game.champion.energy / CHAMPION_MAX_ENERGY) * 100);
  var energyColor = energyPct > 50 ? 'var(--green)' : energyPct > 20 ? 'var(--accent)' : 'var(--red)';
  html += '<div class="champion-info-bar">';
  html += '<div style="font-size:14px;font-weight:600;margin-bottom:8px;">⚡ Energía: ' + game.champion.energy + '/' + CHAMPION_MAX_ENERGY + '</div>';
  html += '<div class="champion-energy-bar"><div class="champion-energy-fill" style="width:' + energyPct + '%;background:' + energyColor + ';"></div></div>';
  var canRest = game.champion.energy < CHAMPION_MAX_ENERGY && game.money >= CHAMPION_REST_COST;
  html += '<button class="btn btn-small btn-purple" ' + (canRest ? '' : 'disabled') + ' onclick="championRest()" style="margin-top:8px;">😴 DESCANSAR — ' + fmtMoney(CHAMPION_REST_COST) + ' (+' + CHAMPION_REST_ENERGY + '⚡)</button>';
  html += '</div>';

  // --- Stats section ---
  html += '<div class="section-title" style="margin-top:16px;">📊 Estadísticas</div>';
  html += '<div class="champion-stats-grid">';
  CHAMPION_STATS.forEach(function(stat) {
    var base = game.champion.stats[stat];
    var effective = getChampionEffectiveStat(stat);
    var bonus = effective - base;
    var cost = getChampionTrainingCost(stat);
    var canAfford = game.money >= cost;
    var canTrain = !isTraining && game.champion.energy >= CHAMPION_TRAINING_ENERGY && canAfford;

    html += '<div class="champion-stat-card">';
    html += '<div class="champion-stat-header">' + CHAMPION_STAT_ICONS[stat] + ' ' + CHAMPION_STAT_NAMES[stat] + '</div>';
    html += '<div class="champion-stat-value">' + base + (bonus > 0 ? ' <span style="color:var(--cyan);font-size:16px;">(+' + bonus + ')</span>' : '') + '</div>';

    if (isTraining && game.champion.trainingStat === stat) {
      var duration = getChampionTrainingDuration(stat) * 1000;
      var startTime = game.champion.trainingUntil - duration;
      var elapsed = Date.now() - startTime;
      var pct = Math.min(100, Math.round((elapsed / duration) * 100));
      var remaining = Math.max(0, Math.ceil((game.champion.trainingUntil - Date.now()) / 1000));
      html += '<div class="staff-training-bar"><div class="staff-training-fill" style="width:' + pct + '%"></div></div>';
      html += '<div class="staff-training-time">Entrenando... ' + fmtTime(remaining) + '</div>';
    } else {
      html += '<button class="btn btn-buy btn-small" style="width:100%;margin-top:8px;" ' + (canTrain ? '' : 'disabled') +
        ' onclick="trainChampion(\'' + stat + '\')">📚 ENTRENAR — ' + fmtMoney(cost) + ' (⚡' + CHAMPION_TRAINING_ENERGY + ')</button>';
    }
    html += '</div>';
  });
  html += '</div>';

  // --- Equipment section ---
  html += '<div class="section-title" style="margin-top:16px;">⚔️ Equipamiento</div>';
  html += '<div class="champion-equip-grid">';
  var slots = ['head', 'hands', 'waist', 'feet'];
  var slotNames = { head: 'Cabeza', hands: 'Manos', waist: 'Cintura', feet: 'Pies' };
  var slotIcons = { head: '🧢', hands: '🧤', waist: '🥋', feet: '👟' };

  slots.forEach(function(slot) {
    var equippedId = game.champion.equipment[slot];
    var equipped = equippedId ? CHAMPION_EQUIPMENT.find(function(e) { return e.id === equippedId; }) : null;

    html += '<div class="champion-equip-slot">';
    html += '<div class="champion-slot-label">' + slotIcons[slot] + ' ' + slotNames[slot] + '</div>';

    if (equipped) {
      var eqStats = Object.keys(equipped.stats).map(function(k) {
        return CHAMPION_STAT_ICONS[k] + '+' + equipped.stats[k];
      }).join(' ');
      html += '<div class="champion-equipped-item">' + equipped.icon + ' ' + equipped.name + '</div>';
      html += '<div class="champion-equip-stats">' + eqStats + '</div>';
    } else {
      html += '<div class="champion-empty-slot">— Vacío —</div>';
    }

    // Available upgrades for this slot
    var available = CHAMPION_EQUIPMENT.filter(function(e) {
      return e.slot === slot && e.id !== equippedId && game.champion.level >= e.reqChampLevel;
    });
    available.forEach(function(eq) {
      var canBuy = game.money >= eq.cost;
      var statText = Object.keys(eq.stats).map(function(k) {
        return CHAMPION_STAT_ICONS[k] + '+' + eq.stats[k];
      }).join(' ');
      html += '<button class="btn btn-small btn-buy" style="width:100%;margin-top:6px;font-size:12px;" ' + (canBuy ? '' : 'disabled') +
        ' onclick="equipChampion(\'' + eq.id + '\')">' + eq.icon + ' ' + eq.name + ' — ' + fmtMoney(eq.cost) +
        ' <span style="opacity:0.8;">(' + statText + ')</span></button>';
    });

    // Locked upgrades hint
    var locked = CHAMPION_EQUIPMENT.filter(function(e) {
      return e.slot === slot && e.id !== equippedId && game.champion.level < e.reqChampLevel;
    });
    if (locked.length > 0) {
      html += '<div style="color:var(--text-muted);font-size:11px;margin-top:4px;">🔒 Más items en nivel ' + locked[0].reqChampLevel + '</div>';
    }

    html += '</div>';
  });
  html += '</div>';

  // --- Compete section ---
  html += '<div class="section-title" style="margin-top:16px;">⚔️ Competir</div>';
  html += '<p class="section-subtitle" style="margin-bottom:12px;">Tu campeón gana el doble de premios. Necesita ⚡' + CHAMPION_COMPETE_ENERGY + ' energía.</p>';
  html += '<div class="champion-comp-list">';
  COMPETITIONS.forEach(function(c) {
    var state = game.competitions[c.id] || { wins: 0, losses: 0, cooldownUntil: 0 };
    var locked = game.reputation < c.minRep;
    var onCooldown = Date.now() < state.cooldownUntil;
    var canCompete = !locked && !onCooldown && !isTraining && game.champion.energy >= CHAMPION_COMPETE_ENERGY;

    var tecnica = getChampionEffectiveStat('tecnica');
    var rewardMult = CHAMPION_REWARD_MULT * getSkillEffect('compRewardMult') * (1 + tecnica * 0.02);
    var fuerza = getChampionEffectiveStat('fuerza');
    var velocidad = getChampionEffectiveStat('velocidad');
    var statBonus = (fuerza * 0.01) + (velocidad * 0.015);
    var chance = Math.min(0.95, c.winChance + statBonus + getSkillEffect('compWinChanceBonus', 0));

    var actionHTML = '';
    if (locked) {
      actionHTML = '<span style="color:var(--text-muted);font-size:12px;">🔒 ' + c.minRep + ' rep</span>';
    } else if (onCooldown) {
      var timeLeft = Math.ceil((state.cooldownUntil - Date.now()) / 1000);
      actionHTML = '<span style="color:var(--text-dim);font-size:12px;">⏱️ ' + fmtTime(timeLeft) + '</span>';
    } else {
      actionHTML = '<button class="btn btn-buy btn-small" ' + (canCompete ? '' : 'disabled') +
        ' onclick="championCompete(\'' + c.id + '\')">🏅 COMPETIR</button>';
    }

    html += '<div class="champion-comp-row' + (locked ? ' locked' : '') + '">' +
      '<div class="champion-comp-info">' +
        '<span class="champion-comp-icon">' + c.icon + '</span>' +
        '<span class="champion-comp-name">' + c.name + '</span>' +
      '</div>' +
      '<div class="champion-comp-details">' +
        '<span>💰 ' + fmtMoney(Math.ceil(c.reward * rewardMult)) + '</span>' +
        '<span>🎯 ' + Math.round(chance * 100) + '%</span>' +
      '</div>' +
      '<div class="champion-comp-action">' + actionHTML + '</div>' +
    '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

// ===== SVG CHARACTER GENERATOR =====
function generateChampionSVG(appearance, stage, equipment) {
  var skin = CHAMPION_SKIN_COLORS[appearance.skin || 0].color;
  var skinDark = darkenColor(skin, 20);
  var hairColor = CHAMPION_HAIR_COLORS[appearance.hairColor || 0].color;
  var eyeColor = CHAMPION_EYE_COLORS[appearance.eyeColor || 0].color;
  var hairId = CHAMPION_HAIR_STYLES[appearance.hair || 0].id;
  var isFemale = appearance.gender === 'female';

  // Base dimensions (center at 100, total viewBox 200x320)
  var cx = 100;
  var tw = 32 * stage.torsoW; // torso half-width
  var sw = 38 * stage.shoulderW; // shoulder half-width
  var aw = 10 * stage.armW; // arm width
  var lw = 14 * stage.legW; // leg half-width
  var headR = 22;

  // Y positions
  var headY = 58;
  var neckY = headY + headR - 2;
  var shoulderY = neckY + 14;
  var torsoBottom = shoulderY + 65;
  var waistW = tw * 0.75;
  var legTop = torsoBottom;
  var legBottom = legTop + 75;
  var footY = legBottom + 6;

  var svg = '<svg class="champion-svg" viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">';

  // Shadow
  svg += '<ellipse cx="' + cx + '" cy="308" rx="35" ry="6" fill="rgba(0,0,0,0.25)"/>';

  // === LEGS ===
  // Left leg
  svg += '<path d="M' + (cx - lw - 3) + ' ' + legTop + ' L' + (cx - lw - 5) + ' ' + legBottom +
    ' L' + (cx - 3) + ' ' + legBottom + ' L' + (cx - 2) + ' ' + legTop + ' Z" fill="' + skin + '"/>';
  // Right leg
  svg += '<path d="M' + (cx + 2) + ' ' + legTop + ' L' + (cx + 3) + ' ' + legBottom +
    ' L' + (cx + lw + 5) + ' ' + legBottom + ' L' + (cx + lw + 3) + ' ' + legTop + ' Z" fill="' + skin + '"/>';

  // Shorts
  var shortsColor = isFemale ? '#2d3436' : '#2d3436';
  svg += '<path d="M' + (cx - tw) + ' ' + (torsoBottom - 5) + ' L' + (cx - lw - 6) + ' ' + (legTop + 28) +
    ' L' + (cx - 1) + ' ' + (legTop + 25) + ' L' + (cx + 1) + ' ' + (legTop + 25) +
    ' L' + (cx + lw + 6) + ' ' + (legTop + 28) + ' L' + (cx + tw) + ' ' + (torsoBottom - 5) +
    ' Z" fill="' + shortsColor + '"/>';

  // Shoes (feet)
  var shoeColor = equipment.feet ? CHAMPION_EQUIPMENT.find(function(e) { return e.id === equipment.feet; }).svgColor : '#555';
  svg += '<rect x="' + (cx - lw - 8) + '" y="' + legBottom + '" width="' + (lw + 8) + '" height="8" rx="4" fill="' + shoeColor + '"/>';
  svg += '<rect x="' + (cx + 1) + '" y="' + legBottom + '" width="' + (lw + 8) + '" height="8" rx="4" fill="' + shoeColor + '"/>';

  // === TORSO ===
  if (isFemale) {
    svg += '<path d="M' + (cx - sw) + ' ' + shoulderY + ' Q' + (cx - tw - 4) + ' ' + (shoulderY + 25) + ' ' + (cx - waistW) + ' ' + torsoBottom +
      ' L' + (cx + waistW) + ' ' + torsoBottom + ' Q' + (cx + tw + 4) + ' ' + (shoulderY + 25) + ' ' + (cx + sw) + ' ' + shoulderY + ' Z" fill="' + skin + '"/>';
  } else {
    svg += '<path d="M' + (cx - sw) + ' ' + shoulderY + ' L' + (cx - waistW) + ' ' + torsoBottom +
      ' L' + (cx + waistW) + ' ' + torsoBottom + ' L' + (cx + sw) + ' ' + shoulderY + ' Z" fill="' + skin + '"/>';
  }

  // Tank top
  var tankColor = isFemale ? '#e84393' : '#2c3e50';
  var tankTopW = sw - 6;
  svg += '<path d="M' + (cx - tankTopW) + ' ' + (shoulderY + 3) + ' L' + (cx - waistW + 2) + ' ' + (torsoBottom - 2) +
    ' L' + (cx + waistW - 2) + ' ' + (torsoBottom - 2) + ' L' + (cx + tankTopW) + ' ' + (shoulderY + 3) + ' Z" fill="' + tankColor + '" opacity="0.85"/>';

  // Belt equipment
  if (equipment.waist) {
    var beltEq = CHAMPION_EQUIPMENT.find(function(e) { return e.id === equipment.waist; });
    svg += '<rect x="' + (cx - waistW - 2) + '" y="' + (torsoBottom - 8) + '" width="' + ((waistW + 2) * 2) + '" height="8" rx="3" fill="' + beltEq.svgColor + '"/>';
    svg += '<circle cx="' + cx + '" cy="' + (torsoBottom - 4) + '" r="3" fill="' + darkenColor(beltEq.svgColor, -30) + '"/>';
  }

  // === ARMS ===
  var armLen = 60;
  // Left arm
  svg += '<path d="M' + (cx - sw) + ' ' + shoulderY + ' L' + (cx - sw - aw * 0.6) + ' ' + (shoulderY + armLen) +
    ' L' + (cx - sw + aw * 0.6) + ' ' + (shoulderY + armLen) + ' L' + (cx - sw + aw * 0.3) + ' ' + shoulderY + ' Z" fill="' + skin + '"/>';
  // Right arm
  svg += '<path d="M' + (cx + sw - aw * 0.3) + ' ' + shoulderY + ' L' + (cx + sw - aw * 0.6) + ' ' + (shoulderY + armLen) +
    ' L' + (cx + sw + aw * 0.6) + ' ' + (shoulderY + armLen) + ' L' + (cx + sw) + ' ' + shoulderY + ' Z" fill="' + skin + '"/>';

  // Hands/gloves
  var handY = shoulderY + armLen;
  if (equipment.hands) {
    var glovesEq = CHAMPION_EQUIPMENT.find(function(e) { return e.id === equipment.hands; });
    svg += '<circle cx="' + (cx - sw) + '" cy="' + (handY + 2) + '" r="' + (aw * 0.65 + 2) + '" fill="' + glovesEq.svgColor + '"/>';
    svg += '<circle cx="' + (cx + sw) + '" cy="' + (handY + 2) + '" r="' + (aw * 0.65 + 2) + '" fill="' + glovesEq.svgColor + '"/>';
  } else {
    svg += '<circle cx="' + (cx - sw) + '" cy="' + (handY + 2) + '" r="' + (aw * 0.4 + 2) + '" fill="' + skin + '"/>';
    svg += '<circle cx="' + (cx + sw) + '" cy="' + (handY + 2) + '" r="' + (aw * 0.4 + 2) + '" fill="' + skin + '"/>';
  }

  // Muscle definition lines for muscular stages
  if (stage.torsoW >= 1.2) {
    svg += '<line x1="' + cx + '" y1="' + (shoulderY + 15) + '" x2="' + cx + '" y2="' + (torsoBottom - 15) + '" stroke="' + skinDark + '" stroke-width="0.8" opacity="0.4"/>';
    // Pecs
    svg += '<path d="M' + (cx - 8) + ' ' + (shoulderY + 15) + ' Q' + cx + ' ' + (shoulderY + 22) + ' ' + (cx + 8) + ' ' + (shoulderY + 15) + '" stroke="' + skinDark + '" fill="none" stroke-width="0.7" opacity="0.35"/>';
    // Bicep lines
    svg += '<line x1="' + (cx - sw + 1) + '" y1="' + (shoulderY + 15) + '" x2="' + (cx - sw - 1) + '" y2="' + (shoulderY + 35) + '" stroke="' + skinDark + '" stroke-width="0.7" opacity="0.3"/>';
    svg += '<line x1="' + (cx + sw - 1) + '" y1="' + (shoulderY + 15) + '" x2="' + (cx + sw + 1) + '" y2="' + (shoulderY + 35) + '" stroke="' + skinDark + '" stroke-width="0.7" opacity="0.3"/>';
  }

  // === NECK ===
  svg += '<rect x="' + (cx - 6) + '" y="' + neckY + '" width="12" height="14" rx="3" fill="' + skin + '"/>';

  // === HEAD ===
  svg += '<circle cx="' + cx + '" cy="' + headY + '" r="' + headR + '" fill="' + skin + '"/>';

  // Ears
  svg += '<ellipse cx="' + (cx - headR + 1) + '" cy="' + headY + '" rx="3" ry="5" fill="' + skinDark + '"/>';
  svg += '<ellipse cx="' + (cx + headR - 1) + '" cy="' + headY + '" rx="3" ry="5" fill="' + skinDark + '"/>';

  // Eyes
  svg += '<ellipse cx="' + (cx - 8) + '" cy="' + (headY - 2) + '" rx="3.5" ry="4" fill="white"/>';
  svg += '<ellipse cx="' + (cx + 8) + '" cy="' + (headY - 2) + '" rx="3.5" ry="4" fill="white"/>';
  svg += '<circle cx="' + (cx - 7.5) + '" cy="' + (headY - 1.5) + '" r="2.2" fill="' + eyeColor + '"/>';
  svg += '<circle cx="' + (cx + 8.5) + '" cy="' + (headY - 1.5) + '" r="2.2" fill="' + eyeColor + '"/>';
  svg += '<circle cx="' + (cx - 7) + '" cy="' + (headY - 2) + '" r="0.8" fill="white"/>';
  svg += '<circle cx="' + (cx + 9) + '" cy="' + (headY - 2) + '" r="0.8" fill="white"/>';

  // Eyebrows
  svg += '<line x1="' + (cx - 11) + '" y1="' + (headY - 8) + '" x2="' + (cx - 4) + '" y2="' + (headY - 7.5) + '" stroke="' + hairColor + '" stroke-width="1.8" stroke-linecap="round"/>';
  svg += '<line x1="' + (cx + 4) + '" y1="' + (headY - 7.5) + '" x2="' + (cx + 11) + '" y2="' + (headY - 8) + '" stroke="' + hairColor + '" stroke-width="1.8" stroke-linecap="round"/>';

  // Nose
  svg += '<path d="M' + cx + ' ' + (headY + 1) + ' L' + (cx - 3) + ' ' + (headY + 7) + ' L' + (cx + 3) + ' ' + (headY + 7) + '" fill="none" stroke="' + skinDark + '" stroke-width="0.8"/>';

  // Mouth
  svg += '<path d="M' + (cx - 6) + ' ' + (headY + 11) + ' Q' + cx + ' ' + (headY + 15) + ' ' + (cx + 6) + ' ' + (headY + 11) + '" fill="none" stroke="' + skinDark + '" stroke-width="1.2" stroke-linecap="round"/>';

  // === HAIR ===
  svg += generateHairSVG(hairId, cx, headY, headR, hairColor, isFemale);

  // === HEAD EQUIPMENT ===
  if (equipment.head) {
    var headEq = CHAMPION_EQUIPMENT.find(function(e) { return e.id === equipment.head; });
    if (headEq.id === 'crown') {
      svg += '<path d="M' + (cx - 18) + ' ' + (headY - headR - 5) + ' L' + (cx - 14) + ' ' + (headY - headR - 18) +
        ' L' + (cx - 6) + ' ' + (headY - headR - 10) + ' L' + cx + ' ' + (headY - headR - 22) +
        ' L' + (cx + 6) + ' ' + (headY - headR - 10) + ' L' + (cx + 14) + ' ' + (headY - headR - 18) +
        ' L' + (cx + 18) + ' ' + (headY - headR - 5) + ' Z" fill="' + headEq.svgColor + '"/>';
      // Jewels
      svg += '<circle cx="' + cx + '" cy="' + (headY - headR - 12) + '" r="2" fill="#e74c3c"/>';
      svg += '<circle cx="' + (cx - 10) + '" cy="' + (headY - headR - 9) + '" r="1.5" fill="#3498db"/>';
      svg += '<circle cx="' + (cx + 10) + '" cy="' + (headY - headR - 9) + '" r="1.5" fill="#2ecc71"/>';
    } else {
      // Headband
      svg += '<rect x="' + (cx - headR - 1) + '" y="' + (headY - headR + 2) + '" width="' + ((headR + 1) * 2) + '" height="6" rx="3" fill="' + headEq.svgColor + '"/>';
    }
  }

  svg += '</svg>';
  return svg;
}

function generateHairSVG(hairId, cx, headY, headR, hairColor, isFemale) {
  var svg = '';
  var top = headY - headR;

  switch (hairId) {
    case 'short':
      svg += '<path d="M' + (cx - headR - 1) + ' ' + (headY - 5) + ' Q' + (cx - headR - 2) + ' ' + (top - 4) + ' ' + cx + ' ' + (top - 6) +
        ' Q' + (cx + headR + 2) + ' ' + (top - 4) + ' ' + (cx + headR + 1) + ' ' + (headY - 5) + '" fill="' + hairColor + '"/>';
      break;
    case 'long':
      svg += '<path d="M' + (cx - headR - 2) + ' ' + (headY - 3) + ' Q' + (cx - headR - 3) + ' ' + (top - 5) + ' ' + cx + ' ' + (top - 8) +
        ' Q' + (cx + headR + 3) + ' ' + (top - 5) + ' ' + (cx + headR + 2) + ' ' + (headY - 3) + '" fill="' + hairColor + '"/>';
      // Side hair flowing down
      svg += '<path d="M' + (cx - headR - 2) + ' ' + (headY - 3) + ' Q' + (cx - headR - 6) + ' ' + (headY + 20) + ' ' + (cx - headR + 2) + ' ' + (headY + 35) + '" fill="' + hairColor + '" stroke="' + hairColor + '" stroke-width="6" stroke-linecap="round"/>';
      svg += '<path d="M' + (cx + headR + 2) + ' ' + (headY - 3) + ' Q' + (cx + headR + 6) + ' ' + (headY + 20) + ' ' + (cx + headR - 2) + ' ' + (headY + 35) + '" fill="' + hairColor + '" stroke="' + hairColor + '" stroke-width="6" stroke-linecap="round"/>';
      break;
    case 'buzzcut':
      svg += '<path d="M' + (cx - headR) + ' ' + (headY - 4) + ' Q' + (cx - headR) + ' ' + (top + 1) + ' ' + cx + ' ' + (top - 1) +
        ' Q' + (cx + headR) + ' ' + (top + 1) + ' ' + (cx + headR) + ' ' + (headY - 4) + '" fill="' + hairColor + '" opacity="0.6"/>';
      break;
    case 'mohawk':
      svg += '<path d="M' + (cx - 5) + ' ' + (headY - 5) + ' L' + (cx - 4) + ' ' + (top - 18) + ' L' + cx + ' ' + (top - 22) +
        ' L' + (cx + 4) + ' ' + (top - 18) + ' L' + (cx + 5) + ' ' + (headY - 5) + ' Z" fill="' + hairColor + '"/>';
      break;
    case 'ponytail':
      svg += '<path d="M' + (cx - headR - 1) + ' ' + (headY - 5) + ' Q' + (cx - headR - 2) + ' ' + (top - 4) + ' ' + cx + ' ' + (top - 6) +
        ' Q' + (cx + headR + 2) + ' ' + (top - 4) + ' ' + (cx + headR + 1) + ' ' + (headY - 5) + '" fill="' + hairColor + '"/>';
      // Ponytail going back
      svg += '<path d="M' + (cx + 2) + ' ' + (headY + headR - 5) + ' Q' + (cx + 15) + ' ' + (headY + headR + 10) + ' ' + (cx + 5) + ' ' + (headY + headR + 25) + '" stroke="' + hairColor + '" fill="none" stroke-width="7" stroke-linecap="round"/>';
      break;
    case 'afro':
      svg += '<circle cx="' + cx + '" cy="' + (headY - 4) + '" r="' + (headR + 10) + '" fill="' + hairColor + '"/>';
      break;
  }
  return svg;
}

function darkenColor(hex, amount) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.min(255, r - amount));
  g = Math.max(0, Math.min(255, g - amount));
  b = Math.max(0, Math.min(255, b - amount));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function renderChampionBody(stage) {
  var app = game.champion.appearance;
  var eq = game.champion.equipment;
  return '<div class="champion-body-wrapper" id="championBodyWrapper">' +
    generateChampionSVG(app, stage, eq) +
    '<canvas id="championCanvas" class="champion-canvas" width="200" height="320"></canvas>' +
    '</div>';
}

function renderChampionCustomizePanel() {
  var app = game.champion.appearance;
  var html = '<div class="champion-customize-inner">';

  // Gender
  html += '<div class="customize-row"><span class="customize-label">Género:</span>';
  html += '<button class="btn btn-small ' + (app.gender === 'male' ? 'btn-cyan' : '') + '" onclick="setChampionAppearance(\'gender\',\'male\')">♂ Masculino</button> ';
  html += '<button class="btn btn-small ' + (app.gender === 'female' ? 'btn-cyan' : '') + '" onclick="setChampionAppearance(\'gender\',\'female\')">♀ Femenino</button>';
  html += '</div>';

  // Skin color
  html += '<div class="customize-row"><span class="customize-label">Piel:</span>';
  CHAMPION_SKIN_COLORS.forEach(function(s, i) {
    html += '<button class="btn btn-small customize-color-btn ' + (app.skin === i ? 'selected' : '') + '" onclick="setChampionAppearance(\'skin\',' + i + ')" title="' + s.name + '">' +
      '<span class="color-swatch" style="background:' + s.color + ';"></span></button> ';
  });
  html += '</div>';

  // Hair style
  html += '<div class="customize-row"><span class="customize-label">Pelo:</span>';
  CHAMPION_HAIR_STYLES.forEach(function(h, i) {
    html += '<button class="btn btn-small ' + (app.hair === i ? 'btn-cyan' : '') + '" onclick="setChampionAppearance(\'hair\',' + i + ')">' + h.name + '</button> ';
  });
  html += '</div>';

  // Hair color
  html += '<div class="customize-row"><span class="customize-label">Color pelo:</span>';
  CHAMPION_HAIR_COLORS.forEach(function(c, i) {
    html += '<button class="btn btn-small customize-color-btn ' + (app.hairColor === i ? 'selected' : '') + '" onclick="setChampionAppearance(\'hairColor\',' + i + ')" title="' + c.name + '">' +
      '<span class="color-swatch" style="background:' + c.color + ';"></span></button> ';
  });
  html += '</div>';

  // Eye color
  html += '<div class="customize-row"><span class="customize-label">Ojos:</span>';
  CHAMPION_EYE_COLORS.forEach(function(c, i) {
    html += '<button class="btn btn-small customize-color-btn ' + (app.eyeColor === i ? 'selected' : '') + '" onclick="setChampionAppearance(\'eyeColor\',' + i + ')" title="' + c.name + '">' +
      '<span class="color-swatch" style="background:' + c.color + ';"></span></button> ';
  });
  html += '</div>';

  html += '</div>';
  return html;
}

function showChampionCustomize() {
  var panel = document.getElementById('championCustomize');
  if (panel) panel.classList.toggle('hidden');
}

// Normal competitions (without champion) — shown in champion tab before recruiting
function renderNormalCompetitions() {
  var html = '<div class="section-title" style="margin-top:20px;">🏆 Competencias</div>';
  html += '<p class="section-subtitle" style="margin-bottom:12px;">Enviá a tus miembros a competir por premios y reputación.</p>';
  html += '<div class="champion-comp-list">';
  COMPETITIONS.forEach(function(c) {
    var state = game.competitions[c.id] || { wins: 0, losses: 0, cooldownUntil: 0 };
    var locked = game.reputation < c.minRep;
    var onCooldown = Date.now() < state.cooldownUntil;

    var rewardMult = 1;
    if (game.staff.champion && game.staff.champion.hired) rewardMult = STAFF.find(function(s) { return s.id === 'champion'; }).compMult;
    rewardMult *= getSkillEffect('compRewardMult');
    var compRepMult = getSkillEffect('compRepMult');
    var compXpMult = getSkillEffect('compXpMult');
    var winBonus = getSkillEffect('compWinChanceBonus', 0);
    var displayChance = Math.min(0.95, c.winChance + winBonus);

    var actionHTML = '';
    if (locked) {
      actionHTML = '<span style="color:var(--text-muted);font-size:12px;">🔒 ' + c.minRep + ' rep</span>';
    } else if (onCooldown) {
      var timeLeft = Math.ceil((state.cooldownUntil - Date.now()) / 1000);
      actionHTML = '<span style="color:var(--text-dim);font-size:12px;">⏱️ ' + fmtTime(timeLeft) + '</span>';
    } else {
      actionHTML = '<button class="btn btn-buy btn-small" onclick="enterCompetition(\'' + c.id + '\')">⚔️ COMPETIR</button>';
    }

    html += '<div class="champion-comp-row' + (locked ? ' locked' : '') + '">' +
      '<div class="champion-comp-info">' +
        '<span class="champion-comp-icon">' + c.icon + '</span>' +
        '<span class="champion-comp-name">' + c.name + '</span>' +
      '</div>' +
      '<div class="champion-comp-details">' +
        '<span>💰 ' + fmtMoney(Math.ceil(c.reward * rewardMult)) + '</span>' +
        '<span>⭐ +' + Math.ceil(c.repReward * compRepMult) + '</span>' +
        '<span>🎯 ' + Math.round(displayChance * 100) + '%</span>' +
      '</div>' +
      '<div class="champion-comp-action">' + actionHTML + '</div>' +
    '</div>';
  });
  html += '</div>';
  return html;
}

// ===== CHAMPION PARTICLE EFFECTS =====
var championParticles = [];
var championEffectActive = false;
var championFlashAlpha = 0;

function triggerLevelUpEffect() {
  var canvas = document.getElementById('championCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  championParticles = [];
  championEffectActive = true;
  championFlashAlpha = 1.0;

  // Spawn particles from center
  var cx = 100, cy = 160;
  var colors = ['#ffd700', '#ffec8b', '#fff8dc', '#ffa500', '#ffffff'];
  for (var i = 0; i < 70; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 1.5 + Math.random() * 4;
    championParticles.push({
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life: 1.0,
      decay: 0.008 + Math.random() * 0.012,
      size: 1.5 + Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  // Sparkles (delayed, smaller, slower)
  for (var j = 0; j < 30; j++) {
    var a2 = Math.random() * Math.PI * 2;
    var s2 = 0.3 + Math.random() * 1.5;
    championParticles.push({
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 80,
      vx: Math.cos(a2) * s2,
      vy: Math.sin(a2) * s2 + 0.5,
      life: 1.0,
      decay: 0.006 + Math.random() * 0.008,
      size: 0.8 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: 20 + Math.floor(Math.random() * 30)
    });
  }

  requestAnimationFrame(function() { animateChampionEffect(ctx, canvas); });
}

function animateChampionEffect(ctx, canvas) {
  if (!championEffectActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Flash
  if (championFlashAlpha > 0) {
    ctx.fillStyle = 'rgba(255, 215, 0, ' + championFlashAlpha * 0.6 + ')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    championFlashAlpha -= 0.04;
  }

  // Particles
  var alive = false;
  for (var i = 0; i < championParticles.length; i++) {
    var p = championParticles[i];
    if (p.delay && p.delay > 0) { p.delay--; alive = true; continue; }
    if (p.life <= 0) continue;

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03; // gravity
    p.life -= p.decay;
    alive = true;

    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    // Star shape for sparkle effect
    if (p.size < 2) {
      drawStar(ctx, p.x, p.y, 4, p.size * 1.5, p.size * 0.5);
    } else {
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (alive || championFlashAlpha > 0) {
    requestAnimationFrame(function() { animateChampionEffect(ctx, canvas); });
  } else {
    championEffectActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function drawStar(ctx, x, y, points, outer, inner) {
  ctx.beginPath();
  for (var i = 0; i < points * 2; i++) {
    var r = i % 2 === 0 ? outer : inner;
    var a = (Math.PI / points) * i - Math.PI / 2;
    if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    else ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
  }
  ctx.closePath();
}

function triggerStageTransition() {
  var wrapper = document.getElementById('championBodyWrapper');
  if (!wrapper) return;
  wrapper.classList.add('champion-transforming');
  triggerLevelUpEffect();

  // Show transformation text
  var textEl = document.createElement('div');
  textEl.className = 'champion-transform-text';
  textEl.textContent = '¡TRANSFORMACIÓN!';
  wrapper.parentElement.appendChild(textEl);

  setTimeout(function() {
    wrapper.classList.remove('champion-transforming');
    if (textEl.parentElement) textEl.parentElement.removeChild(textEl);
  }, 2000);
}

// ===== PLAYER PROFILE =====
function renderProfile() {
  var container = document.getElementById('profileContainer');
  if (!container) return;

  var title = getActiveTitle();
  var tier = getGymTier();
  var xpPct = Math.min(100, Math.floor((game.xp / game.xpToNext) * 100));
  var unlockedAchievements = Object.values(game.achievements).filter(Boolean).length;
  var unlockedTitles = getUnlockedTitles();

  var html = '';

  // --- Profile Card ---
  html += '<div class="profile-card">';
  html += '<div class="profile-header">';
  html += '<div class="profile-avatar">' + title.icon + '</div>';
  html += '<div class="profile-info">';
  html += '<div class="profile-gym-name">' + (game.gymName || 'Mi Gimnasio') + '</div>';
  html += '<div class="profile-title-badge">' + title.icon + ' ' + title.name + '</div>';
  html += '<div class="profile-tier">' + tier + '</div>';
  html += '</div>';
  html += '</div>';

  // Level + XP bar
  html += '<div class="profile-level-row">';
  html += '<span class="profile-level">Nivel ' + game.level + '</span>';
  html += '<div class="profile-xp-bar"><div class="profile-xp-fill" style="width:' + xpPct + '%"></div></div>';
  html += '<span class="profile-xp-text">' + game.xp + '/' + game.xpToNext + ' XP</span>';
  html += '</div>';

  // Prestige stars
  if (game.prestigeStars > 0) {
    var starsText = '';
    for (var s = 0; s < game.prestigeStars; s++) starsText += '⭐';
    html += '<div class="profile-stars">' + starsText + ' x' + (1 + game.prestigeStars * 0.25).toFixed(2) + ' ingresos</div>';
  }

  // Current theme
  var theme = GYM_THEMES.find(function(t) { return t.id === game.decoration.theme; }) || GYM_THEMES[0];
  html += '<div class="profile-theme">' + theme.icon + ' Tema: ' + theme.name + '</div>';
  html += '</div>';

  // --- Titles Section ---
  html += '<div class="section-title" style="margin-top:16px;">🏅 Títulos</div>';
  html += '<p class="section-subtitle">Elegí tu título activo. Se muestra en tu perfil.</p>';
  html += '<div class="profile-titles-grid">';
  PLAYER_TITLES.forEach(function(t) {
    var unlocked = t.check();
    var isActive = game.profile.activeTitle === t.id;
    html += '<div class="profile-title-card' + (unlocked ? '' : ' locked') + (isActive ? ' active' : '') + '"' +
      (unlocked ? ' onclick="setActiveTitle(\'' + t.id + '\')"' : '') + '>';
    html += '<div class="profile-title-icon">' + t.icon + '</div>';
    html += '<div class="profile-title-name">' + t.name + '</div>';
    html += '<div class="profile-title-desc">' + (unlocked ? t.desc : '🔒 ' + t.desc) + '</div>';
    if (isActive) html += '<div class="profile-title-active">ACTIVO</div>';
    html += '</div>';
  });
  html += '</div>';

  // --- Stats Section ---
  html += '<div class="section-title" style="margin-top:16px;">📊 Estadísticas</div>';
  html += '<div class="profile-stats-grid">';

  var stats = [
    { icon: '💰', label: 'Total ganado', value: fmtMoney(game.totalMoneyEarned) },
    { icon: '🕐', label: 'Tiempo jugado', value: formatPlayTime(game.stats.totalPlayTime || 0) },
    { icon: '📅', label: 'Días jugados', value: game.stats.daysPlayed || 0 },
    { icon: '👥', label: 'Máx miembros', value: game.stats.maxMembers || 0 },
    { icon: '🏆', label: 'Competencias ganadas', value: game.stats.competitionsWon || 0 },
    { icon: '🏅', label: 'Champion wins', value: game.stats.championWins || 0 },
    { icon: '🧘', label: 'Clases completadas', value: game.stats.classesCompleted || 0 },
    { icon: '📢', label: 'Campañas lanzadas', value: game.stats.campaignsLaunched || 0 },
    { icon: '🧃', label: 'Suplementos usados', value: game.stats.supplementsBought || 0 },
    { icon: '🏪', label: 'Rivales superados', value: game.stats.rivalsDefeated || 0 },
    { icon: '📋', label: 'Misiones completadas', value: game.stats.missionsCompleted || 0 },
    { icon: '⚡', label: 'Eventos resueltos', value: game.stats.eventsHandled || 0 },
    { icon: '🔬', label: 'Mejoras investigadas', value: game.stats.skillsResearched || 0 },
    { icon: '🏗️', label: 'Zonas desbloqueadas', value: game.stats.zonesUnlocked || 0 },
    { icon: '⭐', label: 'VIPs atendidos', value: game.stats.vipsServed || 0 },
    { icon: '🔥', label: 'Streak máximo', value: game.stats.maxStreak || 0 },
    { icon: '🌟', label: 'Prestigios', value: game.stats.prestigeCount || 0 },
    { icon: '🎖️', label: 'Logros', value: unlockedAchievements + '/' + ACHIEVEMENTS.length },
  ];

  stats.forEach(function(s) {
    html += '<div class="profile-stat-item">';
    html += '<span class="profile-stat-icon">' + s.icon + '</span>';
    html += '<span class="profile-stat-label">' + s.label + '</span>';
    html += '<span class="profile-stat-value">' + s.value + '</span>';
    html += '</div>';
  });
  html += '</div>';

  // --- Recent Achievements ---
  html += '<div class="section-title" style="margin-top:16px;">🎖️ Logros Recientes</div>';
  html += '<div class="profile-achievements-showcase">';
  var unlocked = ACHIEVEMENTS.filter(function(a) { return game.achievements[a.id]; });
  var recent = unlocked.slice(-8).reverse();
  if (recent.length === 0) {
    html += '<p style="color:var(--text-muted);text-align:center;padding:16px;">Todavía no desbloqueaste ningún logro.</p>';
  } else {
    recent.forEach(function(a) {
      html += '<div class="profile-achievement-badge" title="' + a.name + ': ' + a.desc + '">';
      html += '<span class="profile-badge-icon">' + a.icon + '</span>';
      html += '<span class="profile-badge-name">' + a.name + '</span>';
      html += '</div>';
    });
  }
  html += '</div>';
  html += '<button class="btn btn-small" onclick="document.querySelector(\'[data-tab=achievements]\').click()" style="margin-top:8px;">Ver todos los logros →</button>';

  container.innerHTML = html;
}

function formatPlayTime(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return h + 'h ' + m + 'm';
  return m + 'm';
}

// ===== GYM DECORATION PANEL =====
function toggleDecorationPanel() {
  var panel = document.getElementById('decorationPanel');
  if (panel) {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderDecorationPanel();
  }
}

function renderDecorationPanel() {
  var panel = document.getElementById('decorationPanel');
  if (!panel) return;

  var html = '';

  // --- Themes ---
  html += '<div class="section-title">🎨 Temas Visuales</div>';
  html += '<p class="section-subtitle">Cambiá el estilo visual de todo tu gym. Los temas persisten después del prestige.</p>';
  html += '<div class="deco-themes-grid">';
  GYM_THEMES.forEach(function(theme) {
    var owned = game.decoration.unlockedThemes.indexOf(theme.id) >= 0;
    var active = game.decoration.theme === theme.id;
    var locked = game.level < theme.reqLevel;
    var canBuy = !owned && !locked && game.money >= theme.cost;

    html += '<div class="deco-theme-card' + (active ? ' active' : '') + (locked && !owned ? ' locked' : '') + '">';
    html += '<div class="deco-theme-preview" style="background:' + theme.bgDark + ';border-color:' + theme.accent + ';">';
    html += '<div class="deco-theme-accent" style="background:' + theme.accent + ';"></div>';
    html += '</div>';
    html += '<div class="deco-theme-name">' + theme.icon + ' ' + theme.name + '</div>';

    if (active) {
      html += '<div class="deco-theme-status" style="color:var(--green);">✓ Activo</div>';
    } else if (owned) {
      html += '<button class="btn btn-small btn-cyan" onclick="setTheme(\'' + theme.id + '\')">Usar</button>';
    } else if (locked) {
      html += '<div class="deco-theme-status" style="color:var(--text-muted);">🔒 Nivel ' + theme.reqLevel + '</div>';
    } else {
      html += '<button class="btn btn-small btn-buy" ' + (canBuy ? '' : 'disabled') + ' onclick="buyTheme(\'' + theme.id + '\')">' + fmtMoney(theme.cost) + '</button>';
    }
    html += '</div>';
  });
  html += '</div>';

  // --- Decorations ---
  html += '<div class="section-title" style="margin-top:16px;">🏠 Objetos Decorativos</div>';
  html += '<p class="section-subtitle">Comprá decoraciones para tu gym. Dan bonus pasivos. Se reinician con el prestige.</p>';
  html += '<div class="deco-items-grid">';
  GYM_DECORATIONS.forEach(function(item) {
    var owned = game.decoration.items[item.id];
    var locked = game.level < item.reqLevel;
    var canBuy = !owned && !locked && game.money >= item.cost;

    var bonusText = Object.keys(item.bonuses).map(function(k) {
      var v = item.bonuses[k];
      if (k === 'capacity') return '+' + v + ' cap';
      var labels = { income: 'ingreso', reputation: 'rep', classQuality: 'calidad clase', compReward: 'premios comp' };
      return '+' + Math.round(v * 100) + '% ' + (labels[k] || k);
    }).join(', ');

    html += '<div class="deco-item-card' + (owned ? ' owned' : '') + (locked ? ' locked' : '') + '">';
    html += '<div class="deco-item-icon">' + item.icon + '</div>';
    html += '<div class="deco-item-info">';
    html += '<div class="deco-item-name">' + item.name + '</div>';
    html += '<div class="deco-item-bonus">' + bonusText + '</div>';
    html += '</div>';

    if (owned) {
      html += '<div class="deco-item-status" style="color:var(--green);">✓</div>';
    } else if (locked) {
      html += '<div class="deco-item-status" style="color:var(--text-muted);">🔒 Lvl ' + item.reqLevel + '</div>';
    } else {
      html += '<button class="btn btn-small btn-buy" ' + (canBuy ? '' : 'disabled') + ' onclick="buyDecoration(\'' + item.id + '\')">' + fmtMoney(item.cost) + '</button>';
    }
    html += '</div>';
  });
  html += '</div>';

  panel.innerHTML = html;
}
