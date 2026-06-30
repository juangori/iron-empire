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
  const levelScale = 1 + (game.level - 1) * 0.3; // login bonus stays meaningful at high level
  const moneyReward = Math.ceil(reward.money * prestigeMult * levelScale);

  game.money += moneyReward;
  game.totalMoneyEarned += moneyReward;
  addXp(reward.xp);
  game.dailyTracking.moneyEarned += moneyReward;
  game.dailyTracking.xpEarned += reward.xp;

  game.dailyBonus.streak++;
  if (game.dailyBonus.streak > (game.stats.maxStreak || 0)) game.stats.maxStreak = game.dailyBonus.streak;
  game.dailyBonus.lastClaim = getDateString();
  game.dailyBonus.claimedToday = true;

  addLog('🎁 Daily bonus (day ' + game.dailyBonus.streak + '): +<span class="money-log">' + fmtMoney(moneyReward) + '</span> +' + reward.xp + ' XP', 'important');
  showToast('🎁', 'Day ' + game.dailyBonus.streak + ' bonus! +' + fmtMoney(moneyReward));
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
    dotsHTML += '<div class="' + cls + '" title="Day ' + (i + 1) + ': ' + reward.label + '">' + (i + 1) + '</div>';
  }

  container.innerHTML =
    '<div class="daily-bonus-card">' +
      '<div class="daily-bonus-info">' +
        '<div class="daily-bonus-icon">' + (claimed ? '✅' : '🎁') + '</div>' +
        '<div class="daily-bonus-text">' +
          '<h3>' + (claimed ? 'BONUS CLAIMED' : 'DAILY BONUS AVAILABLE') + '</h3>' +
          '<p>' + (claimed ? 'Streak: ' + game.dailyBonus.streak + ' day(s). Come back tomorrow!' : 'Claim your bonus for today! Streak: ' + game.dailyBonus.streak + ' day(s)') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="streak-dots">' + dotsHTML + '</div>' +
      (!claimed ? '<button class="btn btn-purple btn-small" onclick="claimDailyBonus()">🎁 CLAIM</button>' : '') +
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
      desc: mission.desc.replace('${target}', target.toLocaleString('en-US')),
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
  const levelScale = 1 + (game.level - 1) * 0.5; // +50% per level
  const moneyReward = Math.ceil(mission.rewards.money * prestigeMult * levelScale);
  const xpReward = Math.ceil(mission.rewards.xp * (1 + (game.level - 1) * 0.2)); // +20% XP per level

  game.money += moneyReward;
  game.totalMoneyEarned += moneyReward;
  addXp(xpReward);
  game.stats.missionsCompleted++;
  game.dailyTracking.moneyEarned += moneyReward;
  game.dailyTracking.xpEarned += xpReward;

  addLog('📋 Mission completed: <span class="highlight">' + mission.name + '</span> +<span class="money-log">' + fmtMoney(moneyReward) + '</span>', 'important');
  showToast('📋', 'Mission: ' + mission.name + '!');
  floatNumber('+' + fmtMoney(moneyReward));

  // Check if all missions are claimed - bonus!
  const allClaimed = game.dailyMissions.missions.every(m => m.claimed);
  if (allClaimed) {
    const bonusMoney = Math.ceil(1000 * prestigeMult * levelScale);
    game.money += bonusMoney;
    game.totalMoneyEarned += bonusMoney;
    addXp(100);
    addLog('⭐ All daily missions completed! BONUS: +<span class="money-log">' + fmtMoney(bonusMoney) + '</span> +100 XP', 'critical');
    showToast('⭐', 'All missions complete! BONUS');
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
    container.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px;">Loading missions...</p>';
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
          '<div class="mission-reward-text">💰 ' + fmtMoney(Math.ceil(m.rewards.money * (1 + (game.level - 1) * 0.5))) + '</div>' +
          '<div class="mission-reward-text">✨ ' + Math.ceil(m.rewards.xp * (1 + (game.level - 1) * 0.2)) + ' XP</div>' +
          (m.completed && !m.claimed ?
            '<button class="btn btn-green btn-small" onclick="claimMission(' + i + ')">CLAIM</button>' :
            (m.claimed ? '<span style="color:var(--green);font-size:12px;">✅ Done</span>' : '')
          ) +
        '</div>' +
      '</div>';
  });

  html += '<div class="missions-timer" id="missionsResetTimer"></div>';
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

function eventChoiceLabels(choice) {
  // Returns { cost, outcome } display strings for a declarative choice (scaled to current economy)
  if (choice.gamble) {
    var w = resolveEventSpec(choice.gamble.win), l = resolveEventSpec(choice.gamble.lose);
    var p = Math.round(choice.gamble.p * 100);
    return {
      cost: '🎲 ' + p + '%',
      outcome: '✅ ' + fmtEventDeltas(w, (choice.gamble.win || {}).special) + '　❌ ' + fmtEventDeltas(l, (choice.gamble.lose || {}).special)
    };
  }
  var d = resolveEventSpec(choice);
  var cost = d.money ? ((d.money > 0 ? '+' : '-') + fmtMoney(Math.abs(d.money))) : 'Free';
  var outcome = fmtEventDeltas({ money: 0, rep: d.rep, xp: d.xp, members: d.members }, choice.special);
  return { cost: cost, outcome: outcome };
}

function showRandomEvent(event) {
  const overlay = document.getElementById('eventOverlay');
  const card = document.getElementById('eventCard');

  let choicesHTML = '';
  event.choices.forEach((choice, i) => {
    var lbl = eventChoiceLabels(choice);
    choicesHTML +=
      '<div class="event-choice" onclick="handleEventChoice(\'' + event.id + '\',' + i + ')">' +
        '<div class="event-choice-main">' +
          '<span class="event-choice-text">' + choice.text + '</span>' +
          '<span class="event-choice-cost">' + lbl.cost + '</span>' +
        '</div>' +
        (choice.hint ? '<div class="event-choice-hint">' + choice.hint + '</div>' : '') +
        (lbl.outcome && lbl.outcome !== 'Nothing' ? '<div class="event-choice-hint" style="color:var(--cyan);">' + lbl.outcome + '</div>' : '') +
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

  // Deterministic upfront money cost? (gambles resolve after the roll). Costs are %-capped so this
  // almost never blocks; it only protects a very-low-cash player from going to zero on the floor.
  if (!choice.gamble && choice.money && choice.money < 0) {
    var plannedCost = -evMoney(choice.money);
    if (plannedCost > game.money) { showToast('❌', 'Not enough cash!'); return; }
  }

  var d, special, resultLabel;
  if (choice.gamble) {
    var won = Math.random() < choice.gamble.p;
    var spec = won ? choice.gamble.win : choice.gamble.lose;
    d = resolveEventSpec(spec); special = (spec || {}).special;
    resultLabel = (won ? '✅ ' : '❌ ') + fmtEventDeltas(d, special);
  } else {
    d = resolveEventSpec(choice); special = choice.special;
    resultLabel = fmtEventDeltas(d, special);
  }
  applyEventDeltas(d, special);

  game.stats.eventsHandled++;
  game.dailyTracking.eventsHandled++;

  addLog('⚡ Event: <span class="highlight">' + event.title + '</span> → ' + choice.text + ' (' + resultLabel + ')');
  showToast(event.icon, resultLabel);

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

function getInstructorUpgradeCost(inst, currentLevel) {
  return Math.ceil(inst.hireCost * currentLevel * inst.upgradeMult);
}

function hireInstructor(classId) {
  var inst = CLASS_INSTRUCTORS.find(function(i) { return i.id === classId; });
  if (!inst) return;
  if (game.level < inst.reqLevel) {
    showToast('❌', 'Requires level ' + inst.reqLevel + '!');
    return;
  }
  if (game.instructors[classId]?.hired) return;
  if (game.money < inst.hireCost) {
    showToast('❌', 'Not enough cash!');
    return;
  }
  game.money -= inst.hireCost;
  game.instructors[classId] = { hired: true, level: 1 };
  game.stats.instructorsHired = (game.stats.instructorsHired || 0) + 1;
  addLog('👨‍🏫 You hired <span class="highlight">' + inst.name + '</span>! (-' + fmtMoney(inst.hireCost) + ')');
  showToast(inst.icon, inst.name + ' hired!');
  renderClasses();
  checkAchievements();
  saveGame();
}

function upgradeInstructor(classId) {
  var inst = CLASS_INSTRUCTORS.find(function(i) { return i.id === classId; });
  if (!inst) return;
  var state = game.instructors[classId];
  if (!state?.hired) return;
  if (state.level >= 5) {
    showToast('⚠️', 'Already at max level!');
    return;
  }
  var cost = getInstructorUpgradeCost(inst, state.level);
  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }
  game.money -= cost;
  state.level++;
  game.stats.instructorUpgrades = (game.stats.instructorUpgrades || 0) + 1;
  addLog('👨‍🏫 <span class="highlight">' + inst.name + '</span> leveled up to level ' + state.level + '! (-' + fmtMoney(cost) + ')');
  showToast('⬆️', inst.name + ' Lv.' + state.level);
  renderClasses();
  checkAchievements();
  saveGame();
}

function getClassReward(gc) {
  var levelScale = 1 + (game.level - 1) * 0.2;
  var prestigeMult = 1 + (game.prestigeStars * 0.25);
  var classMult = getSkillEffect('classIncomeMult') * getActiveSupplementEffects().classIncomeMult * getActiveFameBoosts().classMult;
  // Classes ride the economy (staff + members) so they don't go vestigial vs scaling equipment income
  var classStaffMult = 1;
  STAFF.forEach(function(s) { if (game.staff[s.id] && game.staff[s.id].hired && s.incomeMult) classStaffMult += getStaffTotalEffect(s, 'incomeMult') * getSkillEffect('staffEffectMult'); });
  var economyMult = classStaffMult * Math.min(3, 1 + game.members * 0.002);
  // Quality bonus: equipment level + instructor level boost rewards
  var qualityBonus = 1;
  if (gc.reqEquipment) {
    var eqLvl = game.equipment[gc.reqEquipment]?.level || 0;
    qualityBonus += eqLvl * 0.05; // +5% per equipment level
  }
  // Instructor level bonus: +20% per level
  var instState = game.instructors[gc.id];
  if (instState?.hired) {
    qualityBonus += (instState.level || 1) * 0.2;
  }
  // Decoration class quality bonus
  qualityBonus += getDecorationBonus('classQuality');
  var instData = CLASS_INSTRUCTORS.find(function(i) { return i.id === gc.id; });
  var commissionRate = instData ? instData.commission : 0;
  return {
    income: Math.ceil(gc.income * levelScale * prestigeMult * classMult * qualityBonus * economyMult),
    xp: Math.ceil(gc.xp * levelScale * 0.5),
    rep: Math.ceil(gc.rep * levelScale * 0.5),
    qualityBonus: qualityBonus,
    commission: commissionRate
  };
}

function startClass(id) {
  const gc = GYM_CLASSES.find(c => c.id === id);
  if (!gc) return;

  // Check instructor hired
  var instState = game.instructors[gc.id];
  if (!instState?.hired) {
    showToast('❌', 'You need to hire an instructor!');
    return;
  }

  // Check equipment requirement
  if (gc.reqEquipment) {
    var eqLevel = game.equipment[gc.reqEquipment]?.level || 0;
    if (eqLevel <= 0 || isEquipmentBroken(gc.reqEquipment)) {
      var eqData = EQUIPMENT.find(function(e) { return e.id === gc.reqEquipment; });
      showToast('❌', 'You need a working ' + (eqData ? eqData.name : gc.reqEquipment) + '!');
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
    showToast('❌', 'Not enough cash!');
    return;
  }

  if (classCost > 0) game.money -= classCost;

  var prevAutoRestart = game.classes[id] ? !!game.classes[id].autoRestart : false;
  game.classes[id] = {
    runningUntil: Date.now() + gc.duration * 1000,
    cooldownUntil: 0,
    collected: false,
    autoRestart: prevAutoRestart
  };

  addLog('🧘 Class <span class="highlight">' + gc.name + '</span> started! Cost: ' + fmtMoney(classCost) + ' (' + fmtTime(gc.duration) + ')');
  showToast(gc.icon, gc.name + ' class in progress!');

  renderClasses();
  saveGame();
}

function setClassAutoRestart(id, val) {
  if (!game.classes[id]) game.classes[id] = {};
  game.classes[id].autoRestart = !!val;
  renderClasses();
}

function renderClasses() {
  const grid = document.getElementById('classesGrid');
  if (!grid) return;

  // --- Synergy banner (Fix 11) ---
  var banner = document.getElementById('classesSynergyBanner');
  if (banner) {
    var hiredCount = GYM_CLASSES.filter(function(gc) { return game.instructors[gc.id]?.hired; }).length;
    var skillMult = getSkillEffect('classIncomeMult');
    var skillPct = Math.round((skillMult - 1) * 100);
    var decBonus = Math.round(getDecorationBonus('classQuality') * 100);
    var parts = [];
    if (hiredCount > 0) parts.push('👨‍🏫 ' + hiredCount + '/' + GYM_CLASSES.length + ' instructors hired');
    if (skillPct > 0) parts.push('🔬 Tree: +' + skillPct + '% income');
    if (decBonus > 0) parts.push('🎨 Decoration: +' + decBonus + '% quality');
    if (hiredCount === 0) parts.push('💡 Hire instructors to unlock classes');
    banner.innerHTML = parts.length ? '<span>' + parts.join(' &nbsp;·&nbsp; ') + '</span>' : '';
    banner.style.display = parts.length ? '' : 'none';
  }

  grid.innerHTML = GYM_CLASSES.map(gc => {
    const state = game.classes[gc.id] || {};
    const inst = CLASS_INSTRUCTORS.find(function(i) { return i.id === gc.id; });
    const instState = game.instructors[gc.id];
    const hasInstructor = instState?.hired;
    const locked = game.level < gc.reqLevel;
    const missingEquip = gc.reqEquipment && ((game.equipment[gc.reqEquipment]?.level || 0) <= 0 || isEquipmentBroken(gc.reqEquipment));
    const isRunning = state.runningUntil && Date.now() < state.runningUntil;
    const onCooldown = state.cooldownUntil && Date.now() < state.cooldownUntil;

    // When class finishes, set cooldown
    if (state.runningUntil && Date.now() >= state.runningUntil && state.collected && !state.cooldownUntil) {
      game.classes[gc.id].cooldownUntil = Date.now() + gc.cooldown * 1000;
    }

    var classCost = getClassCost(gc);
    var reward = getClassReward(gc);
    var commissionAmt = Math.ceil(reward.income * reward.commission);
    var netIncome = reward.income - commissionAmt;
    var canAfford = game.money >= classCost;
    var profit = netIncome - classCost;

    // --- Instructor section ---
    var instructorHTML = '';
    if (locked) {
      // Don't show instructor for locked classes
    } else if (!hasInstructor) {
      var canHire = game.money >= inst.hireCost;
      instructorHTML = '<div class="class-instructor-section no-instructor">' +
        '<div class="instructor-label">👨‍🏫 ' + inst.name + '</div>' +
        '<button class="btn btn-buy btn-small" ' + (canHire ? '' : 'disabled') + ' onclick="hireInstructor(\'' + gc.id + '\')">' +
          'HIRE — ' + fmtMoney(inst.hireCost) +
        '</button>' +
      '</div>';
    } else {
      var instLevel = instState.level || 1;
      var stars = '';
      for (var s = 0; s < 5; s++) stars += s < instLevel ? '★' : '☆';
      var upgradeHTML = '';
      if (instLevel < 5) {
        var upgCost = getInstructorUpgradeCost(inst, instLevel);
        var canUpgrade = game.money >= upgCost;
        upgradeHTML = '<button class="btn btn-buy btn-small" ' + (canUpgrade ? '' : 'disabled') + ' onclick="upgradeInstructor(\'' + gc.id + '\')">' +
          '⬆️ UPGRADE — ' + fmtMoney(upgCost) +
        '</button>';
      } else {
        upgradeHTML = '<span class="instructor-maxed">MAX</span>';
      }
      instructorHTML = '<div class="class-instructor-section">' +
        '<div class="instructor-info">' +
          '<span class="instructor-label">👨‍🏫 ' + inst.name + '</span>' +
          '<span class="instructor-stars">' + stars + '</span>' +
        '</div>' +
        '<div class="instructor-details">' +
          '<span class="instructor-commission">Commission: ' + Math.round(inst.commission * 100) + '% (-' + fmtMoney(commissionAmt) + ')</span>' +
          upgradeHTML +
        '</div>' +
      '</div>';
    }

    // --- Requirements display (equipment only) ---
    var reqHTML = '';
    if (gc.reqEquipment && !locked && hasInstructor) {
      var eqData = EQUIPMENT.find(function(e) { return e.id === gc.reqEquipment; });
      var eqName = eqData ? eqData.icon + ' ' + eqData.name : gc.reqEquipment;
      var hasEq = !missingEquip;
      reqHTML = '<div style="font-size:11px;margin:4px 0;text-align:center;">' +
        '<span style="color:' + (hasEq ? 'var(--green)' : 'var(--red)') + ';">' + (hasEq ? '✅' : '❌') + ' ' + eqName + '</span>' +
      '</div>';
    }

    // --- Timer & Button ---
    let timerText = '';
    let btnHTML = '';

    if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;">🔒 Requires Level ' + gc.reqLevel + '</div>';
    } else if (!hasInstructor) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;">Hire an instructor to unlock</div>';
    } else if (missingEquip) {
      btnHTML = '<button class="btn btn-buy" disabled>🎯 START — ' + fmtMoney(classCost) + '</button>';
    } else if (isRunning) {
      const timeLeft = Math.ceil((state.runningUntil - Date.now()) / 1000);
      timerText = '<div class="class-timer">⏳ ' + fmtTime(timeLeft) + '</div>';
      btnHTML = '<button class="btn btn-green" disabled>IN PROGRESS...</button>';
    } else if (onCooldown) {
      const coolLeft = Math.ceil((state.cooldownUntil - Date.now()) / 1000);
      timerText = '<div class="class-timer" style="color:var(--text-muted);">⏱️ Cooldown: ' + fmtTime(coolLeft) + '</div>';
      btnHTML = '<button class="btn btn-buy" disabled>WAITING</button>';
    } else {
      btnHTML = '<button class="btn btn-buy" ' + (canAfford ? '' : 'disabled') + ' onclick="startClass(\'' + gc.id + '\')">🎯 START — ' + fmtMoney(classCost) + '</button>';
    }

    // --- Quality indicator (Fix 11: break down sources) ---
    var qualityText = '';
    if (!locked && hasInstructor && reward.qualityBonus > 1) {
      var eqBonus = gc.reqEquipment ? Math.round((game.equipment[gc.reqEquipment]?.level || 0) * 5) : 0;
      var instBonus = Math.round(((instState?.level || 1)) * 20);
      var qPct = Math.round((reward.qualityBonus - 1) * 100);
      var qParts = [];
      if (eqBonus > 0) qParts.push('🏋️ +' + eqBonus + '%');
      if (instBonus > 0) qParts.push('👨‍🏫 +' + instBonus + '%');
      qualityText = '<div style="font-size:11px;color:var(--accent);text-align:center;margin-top:2px;">⭐ Total quality +' + qPct + '%' + (qParts.length ? ' (' + qParts.join(' · ') + ')' : '') + '</div>';
    }

    // --- Stats (only show full stats when instructor hired) ---
    var statsHTML = '';
    if (!locked && hasInstructor) {
      statsHTML = '<div class="class-stats">' +
        '<div class="class-stat"><span style="color:var(--green);">💰 ' + fmtMoney(reward.income) + ' gross</span></div>' +
        (commissionAmt > 0 ? '<div class="class-stat"><span style="color:var(--orange);">👨‍🏫 -' + fmtMoney(commissionAmt) + ' commission</span></div>' : '') +
        (classCost > 0 ? '<div class="class-stat"><span style="color:var(--red);">💸 -' + fmtMoney(classCost) + ' cost</span></div>' : '') +
        '<div class="class-stat"><span style="color:' + (profit > 0 ? 'var(--green)' : 'var(--red)') + ';">📊 ' + (profit >= 0 ? '+' : '') + fmtMoney(profit) + ' net</span></div>' +
        '<div class="class-stat"><span style="color:var(--cyan);">✨ +' + reward.xp + ' XP · ⭐ +' + reward.rep + ' rep</span></div>' +
        '<div class="class-stat"><span style="color:var(--text-dim);">⏱️ ' + fmtTime(gc.duration) + ' · CD: ' + fmtTime(gc.cooldown) + '</span></div>' +
      '</div>';
    } else if (!locked) {
      // Preview stats before hiring instructor
      statsHTML = '<div class="class-stats" style="opacity:0.5;">' +
        '<div class="class-stat"><span style="color:var(--text-dim);">💰 ' + fmtMoney(gc.income) + ' base</span></div>' +
        '<div class="class-stat"><span style="color:var(--text-dim);">⏱️ ' + fmtTime(gc.duration) + ' · CD: ' + fmtTime(gc.cooldown) + '</span></div>' +
      '</div>';
    }

    // --- Auto-restart toggle (Fix 10) ---
    var autoRestartHTML = '';
    if (!locked && hasInstructor) {
      var isOn = !!(state.autoRestart);
      autoRestartHTML = '<div class="class-autorestart">' +
        '<label class="autorestart-label">' +
          '<input type="checkbox" ' + (isOn ? 'checked' : '') + ' onchange="setClassAutoRestart(\'' + gc.id + '\', this.checked)">' +
          ' 🔄 Auto-restart' +
        '</label>' +
      '</div>';
    }

    var cardClass = 'class-card';
    if (locked) cardClass += ' locked';
    if (isRunning) cardClass += ' running';
    if (!locked && !hasInstructor) cardClass += ' no-instructor';

    return (
      '<div class="' + cardClass + '">' +
        '<div class="class-icon">' + gc.icon + '</div>' +
        '<div class="class-name">' + gc.name + '</div>' +
        '<div class="class-desc">' + gc.desc + '</div>' +
        instructorHTML +
        reqHTML +
        statsHTML +
        qualityText +
        timerText +
        btnHTML +
        autoRestartHTML +
      '</div>'
    );
  }).join('');
}

// ===== MARKETING =====
// Toggle an always-on campaign ON or OFF
function toggleCampaign(id) {
  const mc = MARKETING_CAMPAIGNS.find(c => c.id === id);
  if (!mc || mc.type !== 'always_on') return;
  if (game.level < mc.reqLevel) return;

  const state = game.marketing[id] || {};

  if (state.active) {
    game.marketing[id].active = false;
    addLog('📢 Campaign <span class="highlight">' + mc.name + '</span> turned off.');
    showToast(mc.icon, mc.name + ' turned off.');
  } else {
    game.marketing[id] = {
      active: true,
      activatedAt: Date.now(),
      totalSpent: state.totalSpent || 0,
      totalMembersGenerated: state.totalMembersGenerated || 0,
      memberAccumulator: state.memberAccumulator || 0,
      repAccumulator: state.repAccumulator || 0,
    };
    addLog('📢 Campaign <span class="highlight">' + mc.name + '</span> turned on!');
    showToast(mc.icon, mc.name + ' turned on!');
    game.stats.campaignsLaunched++;
    game.dailyTracking.campaignsLaunched++;
    var xpGain = 20;
    addXp(xpGain);
    game.dailyTracking.xpEarned += xpGain;
  }

  renderMarketing();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

// Launch a burst (one-time event) campaign
function launchCampaign(id) {
  const mc = MARKETING_CAMPAIGNS.find(c => c.id === id);
  if (!mc || mc.type !== 'burst') return;

  const now = Date.now();
  const state = game.marketing[id];
  if (state?.activeUntil && now < state.activeUntil) return;
  if (state?.cooldownUntil && now < state.cooldownUntil) return;

  let cost = mc.cost;
  if (game.staff.manager?.hired && !isStaffSick('manager', 0)) cost = Math.ceil(cost * 0.8);
  cost = Math.ceil(cost * getSkillEffect('campaignCostMult'));

  if (game.money < cost) {
    showToast('❌', 'Not enough cash!');
    return;
  }

  game.money -= cost;
  var durationMult = getSkillEffect('campaignDurationMult');
  var realDuration = Math.ceil(mc.duration * durationMult);
  var membersToGive = Math.ceil(mc.membersBoost * getSkillEffect('campaignMembersMult'));

  var suppEffects = getActiveSupplementEffects();
  if (suppEffects.marketingMult > 1) {
    membersToGive = Math.ceil(membersToGive * suppEffects.marketingMult);
  }

  game.marketing[id] = {
    startedAt: now,
    activeUntil: now + realDuration * 1000,
    cooldownUntil: now + (realDuration + mc.cooldown) * 1000,
    membersToGive: membersToGive,
    membersGiven: 0,
  };

  var repBoost = Math.ceil(mc.repBoost * getSkillEffect('campaignRepMult'));
  game.reputation += repBoost;
  game.stats.campaignsLaunched++;
  game.dailyTracking.campaignsLaunched++;
  game.dailyTracking.reputationGained += repBoost;

  const xpGain = 20;
  addXp(xpGain);
  game.dailyTracking.xpEarned += xpGain;

  addLog('📢 Campaign <span class="highlight">' + mc.name + '</span> launched! +' + membersToGive + ' members in ' + fmtTime(realDuration) + ', +' + repBoost + '⭐');
  showToast(mc.icon, mc.name + ' underway!');

  renderMarketing();
  updateUI();
  checkAchievements();
  checkMissionProgress();
  saveGame();
}

function renderMarketing() {
  const grid = document.getElementById('marketingGrid');
  if (!grid) return;

  const now = Date.now();

  // --- SECTION 1: Always-on campaigns ---
  const alwaysOnCampaigns = MARKETING_CAMPAIGNS.filter(mc => mc.type === 'always_on');
  const activeAlwaysOn = alwaysOnCampaigns.filter(mc => {
    const st = game.marketing[mc.id];
    return st && st.active;
  });

  let alwaysOnHTML = '<div class="marketing-section-title">📡 Ongoing Campaigns <span style="font-size:12px;color:var(--text-dim);font-weight:400;">— turn on and off whenever you want</span></div>';
  alwaysOnHTML += '<div class="marketing-always-on-grid">';

  alwaysOnCampaigns.forEach(mc => {
    const state = game.marketing[mc.id] || {};
    const locked = game.level < mc.reqLevel;
    const isActive = !!(state.active);

    let costPerDay = mc.costPerDay;
    if (game.staff.manager?.hired && !isStaffSick('manager', 0)) costPerDay *= 0.8;
    costPerDay = Math.ceil(costPerDay * getSkillEffect('campaignCostMult'));
    const membersPerDay = Math.ceil(mc.membersPerDay * getSkillEffect('campaignMembersMult'));
    const repPerDay = Math.ceil(mc.repPerDay * getSkillEffect('campaignRepMult'));
    const costPerMember = membersPerDay > 0 ? (costPerDay / membersPerDay).toFixed(0) : '—';

    let insightsHTML = '';
    if (isActive && state.activatedAt) {
      const totalGens = state.totalMembersGenerated || 0;
      const totalSpent = state.totalSpent || 0;
      const cpm = totalGens > 0 ? Math.round(totalSpent / totalGens) : 0;
      const activeForMs = now - state.activatedAt;
      const activeForStr = fmtTime(Math.floor(activeForMs / 1000));
      insightsHTML = '<div class="campaign-insights">' +
        '<div class="insights-row"><span>⏱️ Time active</span><span>' + activeForStr + '</span></div>' +
        '<div class="insights-row"><span>👥 Members generated</span><span class="val">' + totalGens + '</span></div>' +
        '<div class="insights-row"><span>💸 Total invested</span><span class="val">' + fmtMoney(totalSpent) + '</span></div>' +
        (totalGens > 0 ? '<div class="insights-row"><span>📊 Cost per member</span><span class="val">' + fmtMoney(cpm) + '</span></div>' : '') +
      '</div>';
    }

    let toggleBtn = '';
    if (locked) {
      toggleBtn = '<div class="campaign-locked-msg">🔒 Level ' + mc.reqLevel + ' required</div>';
    } else {
      toggleBtn = '<button class="btn campaign-toggle-btn ' + (isActive ? 'on' : 'off') + '" onclick="toggleCampaign(\'' + mc.id + '\')">' +
        (isActive ? '🟢 ACTIVE — TURN OFF' : '⚫ TURN ON CAMPAIGN') +
      '</button>';
    }

    alwaysOnHTML +=
      '<div class="marketing-card always-on ' + (locked ? 'locked' : '') + ' ' + (isActive ? 'active' : '') + '">' +
        '<div class="marketing-header">' +
          '<span class="marketing-icon">' + mc.icon + '</span>' +
          (isActive ? '<span class="marketing-badge running" style="font-size:11px;padding:3px 8px;">LIVE</span>' : '') +
        '</div>' +
        '<div class="marketing-name">' + mc.name + '</div>' +
        '<div class="marketing-desc">' + mc.desc + '</div>' +
        '<div class="marketing-stats">' +
          '<div class="marketing-stat"><span style="color:var(--cyan);">👥 ' + membersPerDay + ' members/day</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--purple);">⭐ ' + repPerDay + ' rep/day</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--accent);">💰 ' + fmtMoney(costPerDay) + '/day</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--text-dim);">📊 ~$' + costPerMember + '/member</span></div>' +
        '</div>' +
        insightsHTML +
        toggleBtn +
      '</div>';
  });

  alwaysOnHTML += '</div>';

  // --- SECTION 2: Burst campaigns ---
  const burstCampaigns = MARKETING_CAMPAIGNS.filter(mc => mc.type === 'burst');
  const activeBurst = burstCampaigns.filter(mc => {
    const st = game.marketing[mc.id];
    return st?.activeUntil && now < st.activeUntil;
  });

  let burstSummaryHTML = '';
  if (activeBurst.length > 0) {
    burstSummaryHTML = '<div class="marketing-summary">' +
      '<div class="marketing-summary-title">🚀 Active Impact Campaigns: ' + activeBurst.length + '</div>';
    activeBurst.forEach(mc => {
      const state = game.marketing[mc.id];
      const timeLeft = Math.ceil((state.activeUntil - now) / 1000);
      const totalMs = state.activeUntil - (state.startedAt || state.activeUntil - mc.duration * 1000);
      const elapsedMs = now - (state.startedAt || now);
      const progressPct = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
      const membersLeft = Math.ceil((state.membersToGive || mc.membersBoost) - (state.membersGiven || 0));
      burstSummaryHTML += '<div class="marketing-active-item">' +
        '<span>' + mc.icon + ' ' + mc.name + '</span>' +
        '<span style="color:var(--cyan);">👥 ' + membersLeft + ' members left</span>' +
        '<span style="color:var(--text-dim);">⏱️ ' + fmtTime(timeLeft) + '</span>' +
        '<div class="marketing-progress-bar"><div class="marketing-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
    });
    burstSummaryHTML += '</div>';
  }

  let burstSectionHTML = '<div class="marketing-section-title" style="margin-top:24px;">🚀 Impact Campaigns <span style="font-size:12px;color:var(--text-dim);font-weight:400;">— one-time, high-reach events</span></div>';
  burstSectionHTML += burstSummaryHTML;
  burstSectionHTML += '<div class="marketing-grid">';

  burstCampaigns.forEach(mc => {
    const state = game.marketing[mc.id] || {};
    const locked = game.level < mc.reqLevel;
    const isActive = state.activeUntil && now < state.activeUntil;
    const isOnCooldown = !isActive && state.cooldownUntil && now < state.cooldownUntil;

    let cost = mc.cost;
    if (game.staff.manager?.hired && !isStaffSick('manager', 0)) cost = Math.ceil(cost * 0.8);
    cost = Math.ceil(cost * getSkillEffect('campaignCostMult'));
    const canAfford = game.money >= cost;
    const membersEff = Math.ceil(mc.membersBoost * getSkillEffect('campaignMembersMult'));

    let timerHTML = '';
    let btnHTML = '';

    if (locked) {
      btnHTML = '<div class="campaign-locked-msg">🔒 Level ' + mc.reqLevel + ' required</div>';
    } else if (isActive) {
      const timeLeft = Math.ceil((state.activeUntil - now) / 1000);
      const totalMs = state.activeUntil - (state.startedAt || state.activeUntil - mc.duration * 1000);
      const progressPct = Math.min(100, Math.round(((now - (state.startedAt || now)) / totalMs) * 100));
      const membersLeft = Math.ceil((state.membersToGive || mc.membersBoost) - (state.membersGiven || 0));
      timerHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="marketing-badge running">ACTIVE — ' + fmtTime(timeLeft) + '</span>' +
        '<div style="color:var(--cyan);font-size:11px;margin-top:4px;">👥 ' + membersLeft + ' members left</div>' +
        '<div class="marketing-progress-bar" style="margin-top:6px;"><div class="marketing-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
      btnHTML = '<button class="btn btn-green" disabled>✅ IN PROGRESS</button>';
    } else if (isOnCooldown) {
      const cdLeft = Math.ceil((state.cooldownUntil - now) / 1000);
      const cdTotal = mc.cooldown;
      const cdPct = Math.min(100, Math.round(((cdTotal - cdLeft) / cdTotal) * 100));
      timerHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="marketing-badge" style="background:var(--bg-card);color:var(--text-dim);border:1px solid var(--border);">COOLDOWN — ' + fmtTime(cdLeft) + '</span>' +
        '<div class="marketing-progress-bar" style="margin-top:6px;"><div class="marketing-progress-fill" style="width:' + cdPct + '%;background:linear-gradient(90deg,var(--text-dim),var(--border));"></div></div>' +
      '</div>';
      btnHTML = '<button class="btn" style="background:var(--bg-card);color:var(--text-dim);cursor:not-allowed;" disabled>⏳ COOLDOWN</button>';
    } else {
      btnHTML = '<button class="btn btn-cyan" ' + (canAfford ? '' : 'disabled') + ' onclick="launchCampaign(\'' + mc.id + '\')">🚀 LAUNCH — ' + fmtMoney(cost) + '</button>';
    }

    burstSectionHTML +=
      '<div class="marketing-card ' + (locked ? 'locked' : '') + ' ' + (isActive ? 'active' : '') + ' ' + (isOnCooldown ? 'cooldown' : '') + '">' +
        '<div class="marketing-header">' +
          '<span class="marketing-icon">' + mc.icon + '</span>' +
        '</div>' +
        '<div class="marketing-name">' + mc.name + '</div>' +
        '<div class="marketing-desc">' + mc.desc + '</div>' +
        '<div class="marketing-stats">' +
          '<div class="marketing-stat"><span style="color:var(--cyan);">👥 +' + membersEff + ' members</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--purple);">⭐ +' + mc.repBoost + ' reputation</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--text-dim);">⏱️ ' + fmtTime(mc.duration) + ' · CD: ' + fmtTime(mc.cooldown) + '</span></div>' +
          '<div class="marketing-stat"><span style="color:var(--accent);">💰 ' + fmtMoney(cost) + '</span></div>' +
        '</div>' +
        timerHTML +
        btnHTML +
      '</div>';
  });

  burstSectionHTML += '</div>';

  grid.innerHTML = alwaysOnHTML + burstSectionHTML;
}

// ===== SUPPLEMENTS =====
var TOLERANCE_LABELS = [
  { label: 'No tolerance', color: 'var(--green)', pct: 100, warn: false },
  { label: 'Mild tolerance', color: 'var(--accent)', pct: 85, warn: false },
  { label: 'Moderate tolerance', color: 'orange', pct: 65, warn: true },
  { label: 'Max tolerance', color: 'var(--red)', pct: 45, warn: true },
];

// ===== FAME / PRESTIGE SHOP =====
function fameePerkEffectText(perk, level) {
  var pct = Math.round((perk.effect.perLevel || 0) * level * 100);
  switch (perk.effect.key) {
    case 'income':    return '+' + pct + '% income';
    case 'cost':      return '-' + pct + '% costs';
    case 'retention': return '-' + pct + '% rival steal';
    case 'capacity':  return '+' + pct + '% capacity';
    case 'vipspeed':  return 'VIPs +' + pct + '% more often';
    default:          return '+' + pct + '%';
  }
}

function renderFameShop() {
  var container = document.getElementById('fameContainer');
  if (!container || typeof FAME_SHOP === 'undefined') return;
  if (typeof normalizeFameData === 'function') normalizeFameData();

  var now = Date.now();
  var rep = Math.floor(game.reputation || 0);
  var rate = getReputationPerSecond();
  var floor = getReputationFloorBonus();
  var lifetime = getReputationLifetime();

  // ---- Header ----
  var html = '<div class="section-title">🌟 Fame and Prestige</div>';
  html += '<p class="section-subtitle">Your reputation is a currency: spend it on boosts, permanent upgrades and unlocks. Your accumulated fame also gives you passive income.</p>';

  html += '<div class="fame-header">' +
    '<div class="fame-header-box"><div class="fame-hb-label">Reputation available</div><div class="fame-hb-value" style="color:var(--accent);">🌟 ' + fmt(rep) + '</div></div>' +
    '<div class="fame-header-box"><div class="fame-hb-label">You generate</div><div class="fame-hb-value" style="color:var(--cyan);">+' + (rate >= 10 ? fmt(Math.round(rate)) : rate.toFixed(1)) + '/sec</div></div>' +
    '<div class="fame-header-box"><div class="fame-hb-label">Passive income floor</div><div class="fame-hb-value" style="color:var(--green);">+' + (floor * 100).toFixed(1) + '%</div><div class="fame-hb-sub">from ' + fmt(Math.floor(lifetime)) + ' accumulated fame</div></div>' +
    '</div>';

  // ---- Boosts activos ----
  var activeBoosts = FAME_SHOP.boosts.filter(function(b) { return game.fameBoosts[b.id] && now < game.fameBoosts[b.id]; });
  if (activeBoosts.length > 0) {
    html += '<div class="fame-active">';
    html += '<div class="fame-active-title">⚡ Active boosts</div>';
    activeBoosts.forEach(function(b) {
      var left = Math.ceil((game.fameBoosts[b.id] - now) / 1000);
      html += '<div class="fame-active-item"><span>' + b.icon + ' ' + b.name + '</span><span style="color:var(--text-dim);">⏱️ ' + fmtTime(left) + '</span></div>';
    });
    html += '</div>';
  }

  // ---- Boosts ----
  html += '<div class="fame-cat-title">⚡ Temporary boosts <span class="fame-cat-hint">— active-play reward</span></div>';
  html += '<div class="fame-grid">';
  FAME_SHOP.boosts.forEach(function(b) {
    var cost = getFameBoostCost(b);
    var active = game.fameBoosts[b.id] && now < game.fameBoosts[b.id];
    var canAfford = rep >= cost;
    var btn;
    if (active) {
      var left = Math.ceil((game.fameBoosts[b.id] - now) / 1000);
      btn = '<button class="btn btn-small" disabled style="opacity:.6;">⏱️ ACTIVE — ' + fmtTime(left) + '</button>';
    } else {
      btn = '<button class="btn btn-buy btn-small" ' + (canAfford ? '' : 'disabled') + ' onclick="buyFameBoost(\'' + b.id + '\')">ACTIVATE — 🌟 ' + fmt(cost) + '</button>';
    }
    html += '<div class="fame-card' + (active ? ' fame-card-active' : '') + '">' +
      '<div class="fame-card-head"><span class="fame-card-icon">' + b.icon + '</span><span class="fame-card-name">' + b.name + '</span></div>' +
      '<div class="fame-card-desc">' + b.desc + '</div>' +
      '<div class="fame-card-meta">Lasts ' + fmtTime(b.duration) + '</div>' +
      btn +
    '</div>';
  });
  html += '</div>';

  // ---- Perks permanentes ----
  html += '<div class="fame-cat-title">📈 Permanent upgrades <span class="fame-cat-hint">— level up, long-term sink</span></div>';
  html += '<div class="fame-grid">';
  FAME_SHOP.perks.forEach(function(p) {
    var lvl = getFamePerkLevel(p.id);
    var maxed = lvl >= p.maxLevel;
    var cost = getFamePerkCost(p);
    var canAfford = rep >= cost;
    var pips = '';
    for (var i = 0; i < p.maxLevel; i++) pips += '<span class="fame-pip' + (i < lvl ? ' on' : '') + '"></span>';
    var btn;
    if (maxed) {
      btn = '<button class="btn btn-small" disabled style="opacity:.6;">✅ MAX</button>';
    } else {
      btn = '<button class="btn btn-buy btn-small" ' + (canAfford ? '' : 'disabled') + ' onclick="buyFamePerk(\'' + p.id + '\')">UPGRADE (Lv ' + (lvl + 1) + ') — 🌟 ' + fmt(cost) + '</button>';
    }
    html += '<div class="fame-card">' +
      '<div class="fame-card-head"><span class="fame-card-icon">' + p.icon + '</span><span class="fame-card-name">' + p.name + '</span></div>' +
      '<div class="fame-card-desc">' + p.desc + '</div>' +
      '<div class="fame-pips">' + pips + ' <span class="fame-card-meta">Lv ' + lvl + '/' + p.maxLevel + '</span></div>' +
      (lvl > 0 ? '<div class="fame-card-current">Current: ' + fameePerkEffectText(p, lvl) + '</div>' : '') +
      btn +
    '</div>';
  });
  html += '</div>';

  // ---- Unlocks ----
  html += '<div class="fame-cat-title">👑 Unlocks <span class="fame-cat-hint">— one-time milestones, aspirational goals</span></div>';
  html += '<div class="fame-grid">';
  FAME_SHOP.unlocks.forEach(function(u) {
    var owned = !!game.fameUnlocks[u.id];
    var cost = getFameUnlockCost(u);
    var gated = lifetime < u.reqLifetime;
    var canAfford = rep >= cost;
    var btn;
    if (owned) {
      btn = '<div class="fame-owned">✓ UNLOCKED</div>';
    } else if (gated) {
      btn = '<button class="btn btn-small" disabled style="opacity:.6;">🔒 Requires 🌟 ' + fmt(u.reqLifetime) + ' accumulated fame</button>';
    } else {
      btn = '<button class="btn btn-buy btn-small" ' + (canAfford ? '' : 'disabled') + ' onclick="buyFameUnlock(\'' + u.id + '\')">UNLOCK — 🌟 ' + fmt(cost) + '</button>';
    }
    html += '<div class="fame-card' + (owned ? ' fame-card-owned' : '') + '">' +
      '<div class="fame-card-head"><span class="fame-card-icon">' + u.icon + '</span><span class="fame-card-name">' + u.name + '</span></div>' +
      '<div class="fame-card-desc">' + u.desc + '</div>' +
      btn +
    '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

function renderSupplements() {
  var grid = document.getElementById('supplementsGrid');
  if (!grid) return;

  var now = Date.now();

  var activeSupps = SUPPLEMENTS.filter(function(sup) {
    var state = game.supplements[sup.id];
    return state && state.activeUntil && now < state.activeUntil;
  });
  var activeIds = activeSupps.map(function(s) { return s.id; });
  var hasCombo = activeIds.includes('protein') && activeIds.includes('creatine');

  // Summary of active supplements
  var summaryHTML = '';
  if (activeSupps.length > 0) {
    summaryHTML = '<div class="supplement-summary">' +
      '<div class="supplement-summary-title">🧃 Active Supplements: ' + activeSupps.length +
      (hasCombo ? ' <span style="color:var(--accent);font-size:13px;">⚡ COMBO +10% income!</span>' : '') +
      '</div>';
    activeSupps.forEach(function(sup) {
      var state = game.supplements[sup.id];
      var timeLeft = Math.ceil((state.activeUntil - now) / 1000);
      var progressPct = Math.min(100, Math.round(((sup.duration - timeLeft) / sup.duration) * 100));
      var tLevel = Math.min(3, state.toleranceLevel || 0);
      var tInfo = TOLERANCE_LABELS[tLevel];
      summaryHTML += '<div class="supplement-active-item">' +
        '<span>' + sup.icon + ' ' + sup.name + '</span>' +
        '<span style="color:var(--green);">' + getSupplementEffectText(sup, tLevel) + '</span>' +
        '<span style="color:' + tInfo.color + ';font-size:11px;">' + tInfo.label + ' (' + tInfo.pct + '%)</span>' +
        '<span style="color:var(--text-dim);">⏱️ ' + fmtTime(timeLeft) + '</span>' +
        '<div class="supplement-progress-bar"><div class="supplement-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
    });
    summaryHTML += '</div>';
  }

  var cardsHTML = SUPPLEMENTS.map(function(sup) {
    var state = game.supplements[sup.id] || {};
    var locked = game.level < sup.reqLevel;
    var isActive = !!(state.activeUntil && now < state.activeUntil);
    var tLevel = Math.min(3, state.toleranceLevel || 0);
    var tInfo = TOLERANCE_LABELS[tLevel];

    var cost = getSupplementCost(sup);
    var canAfford = game.money >= cost;

    // Combo badge
    var comboPartner = sup.combo ? SUPPLEMENTS.find(function(s) { return s.id === sup.combo; }) : null;
    var comboActive = comboPartner && activeIds.includes(comboPartner.id);
    var comboBadge = comboPartner
      ? '<span class="combo-badge ' + (comboActive ? 'combo-on' : '') + '">⚡ COMBO with ' + comboPartner.name + (comboActive ? ' ✓' : '') + '</span>'
      : '';

    // Tolerance meter (only show if tolerance > 0 or has been used)
    var toleranceHTML = '';
    if (!locked && (tLevel > 0 || state.lastUsedTick)) {
      var bars = [0, 1, 2].map(function(i) {
        return '<div class="tolerance-bar ' + (i < tLevel ? 'filled' : '') + '" style="' + (i < tLevel ? 'background:' + tInfo.color : '') + '"></div>';
      }).join('');
      toleranceHTML = '<div class="tolerance-meter">' +
        '<span class="tolerance-label" style="color:' + tInfo.color + ';">' + tInfo.label + ' — ' + tInfo.pct + '% effect</span>' +
        '<div class="tolerance-bars">' + bars + '</div>' +
        (tInfo.warn ? '<div class="tolerance-warning">⚠️ Reduced effect. Rest a day to recover.</div>' : '') +
      '</div>';
    }

    var timerHTML = '';
    var btnHTML = '';

    if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px;">🔒 Level ' + sup.reqLevel + ' required</div>';
    } else if (isActive) {
      var timeLeft = Math.ceil((state.activeUntil - now) / 1000);
      var progressPct = Math.min(100, Math.round(((sup.duration - timeLeft) / sup.duration) * 100));
      timerHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="supplement-badge running">ACTIVE — ' + fmtTime(timeLeft) + '</span>' +
        '<div class="supplement-progress-bar" style="margin-top:6px;"><div class="supplement-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
      btnHTML = '<button class="btn btn-green" disabled>✅ IN PROGRESS</button>';
    } else {
      btnHTML = '<button class="btn btn-buy" ' + (canAfford ? '' : 'disabled') + ' onclick="buySupplement(\'' + sup.id + '\')">🧃 TAKE — ' + fmtMoney(cost) + '</button>';
    }

    return (
      '<div class="supplement-card ' + (locked ? 'locked' : '') + ' ' + (isActive ? 'active' : '') + '">' +
        '<div class="supplement-header">' +
          '<span class="supplement-icon">' + sup.icon + '</span>' +
        '</div>' +
        '<div class="supplement-name">' + sup.name + (comboBadge ? '<br>' + comboBadge : '') + '</div>' +
        '<div class="supplement-desc">' + sup.desc + '</div>' +
        '<div class="supplement-stats">' +
          '<div class="supplement-stat">💪 <span class="val">' + getSupplementEffectText(sup, tLevel) + '</span></div>' +
          '<div class="supplement-stat">⏱️ <span class="val">' + fmtTime(sup.duration) + '</span></div>' +
          '<div class="supplement-stat">💰 <span class="val">' + fmtMoney(cost) + '</span></div>' +
        '</div>' +
        toleranceHTML +
        timerHTML +
        btnHTML +
      '</div>'
    );
  }).join('');

  grid.innerHTML = summaryHTML + cardsHTML;
}

// Returns effect text scaled by current tolerance
function getSupplementEffectText(sup, toleranceLevel) {
  var tLevel = Math.min(3, toleranceLevel || 0);
  var tMult = [1.0, 0.85, 0.65, 0.45][tLevel];
  var parts = [];
  var e = sup.effects;
  if (e.incomeMult) {
    var scaled = Math.round((e.incomeMult - 1) * 100 * tMult);
    parts.push('+' + scaled + '% income');
  }
  if (e.equipIncomeMult) {
    var scaled = Math.round((e.equipIncomeMult - 1) * 100 * tMult);
    parts.push('+' + scaled + '% equip income');
  }
  if (e.classIncomeMult) {
    var scaled = Math.round((e.classIncomeMult - 1) * 100 * tMult);
    parts.push('+' + scaled + '% class income');
  }
  if (e.marketingMult) {
    var scaled = Math.round((e.marketingMult - 1) * 100 * tMult);
    parts.push('+' + scaled + '% marketing');
  }
  if (e.capacityBonus) parts.push('+' + Math.round(e.capacityBonus * tMult) + ' capacity');
  if (e.repBonus) parts.push('+' + Math.round(e.repBonus * tMult) + ' reputation');
  if (e.repPerMin) parts.push('+' + (e.repPerMin * tMult).toFixed(1) + ' rep/min');
  return parts.join(', ');
}

// ===== RIVAL GYMS =====
function renderRivals() {
  var grid = document.getElementById('rivalsGrid');
  if (!grid) return;

  var totalSteal = getRivalMemberSteal();
  var rivalInfo = (typeof getRivalStealInfo === 'function') ? getRivalStealInfo() : { lost: 0, pct: 0, capped: false };
  var defeatedCount = RIVAL_GYMS.filter(function(r) {
    var state = game.rivals[r.id];
    return state && state.defeated;
  }).length;
  var unlockedCount = RIVAL_GYMS.filter(function(r) { return game.level >= r.reqLevel; }).length;

  // Summary
  var summaryHTML = '';
  if (unlockedCount > 0) {
    summaryHTML = '<div class="rival-summary">' +
      '<div class="rival-summary-title">🏪 Market Competition</div>' +
      '<div class="rival-summary-stats">' +
        '<div class="rival-summary-stat">' +
          '<span class="rival-summary-label">Active rivals</span>' +
          '<span class="rival-summary-value" style="color:var(--red);">' + (unlockedCount - defeatedCount) + '</span>' +
        '</div>' +
        '<div class="rival-summary-stat">' +
          '<span class="rival-summary-label">Rivals beaten</span>' +
          '<span class="rival-summary-value" style="color:var(--green);">' + defeatedCount + ' / ' + RIVAL_GYMS.length + '</span>' +
        '</div>' +
        '<div class="rival-summary-stat">' +
          '<span class="rival-summary-label">Members stolen</span>' +
          '<span class="rival-summary-value" style="color:' + (rivalInfo.lost > 0 ? 'var(--red)' : 'var(--green)') + ';">' + (rivalInfo.lost > 0 ? '-' + rivalInfo.lost + ' (' + (rivalInfo.pct * 100).toFixed(1) + '%)' : '0') + '</span>' +
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
      statusHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px;">🔒 Requires Level ' + r.reqLevel + '</div>';
    } else if (defeated) {
      var bonusParts = [];
      if (r.defeatBonus.income) bonusParts.push('+' + r.defeatBonus.income + ' income/s');
      if (r.defeatBonus.capacity) bonusParts.push('+' + r.defeatBonus.capacity + ' capacity');
      statusHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="rival-badge defeated">BEATEN</span>' +
      '</div>' +
      '<div style="text-align:center;font-size:12px;color:var(--green);margin-bottom:8px;">Bonus: ' + bonusParts.join(', ') + '</div>';
    } else if (promoActive) {
      var timeLeft = Math.ceil((state.promoUntil - Date.now()) / 1000);
      var totalDuration = r.promoDuration;
      var progressPct = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);
      statusHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="rival-badge promo">NEUTRALIZED — ' + fmtTime(timeLeft) + '</span>' +
        '<div class="rival-progress-bar" style="margin-top:6px;"><div class="rival-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '</div>';
      actionsHTML = '<button class="btn btn-red" ' + (game.money >= defeatCost ? '' : 'disabled') + ' onclick="defeatRival(\'' + r.id + '\')">🏆 BEAT — ' + fmtMoney(defeatCost) + '</button>';
    } else {
      var rPct = (typeof getRivalStealPct === 'function') ? getRivalStealPct(r) * 100 : 0;
      statusHTML = '<div style="text-align:center;margin-bottom:8px;">' +
        '<span class="rival-badge threat">THREAT — steals ' + rPct.toFixed(1) + '% of your members</span>' +
      '</div>';
      actionsHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button class="btn btn-cyan" style="flex:1;" ' + (game.money >= promoCost ? '' : 'disabled') + ' onclick="launchRivalPromo(\'' + r.id + '\')">📣 PROMO — ' + fmtMoney(promoCost) + '</button>' +
        '<button class="btn btn-red" style="flex:1;" ' + (game.money >= defeatCost ? '' : 'disabled') + ' onclick="defeatRival(\'' + r.id + '\')">🏆 BEAT — ' + fmtMoney(defeatCost) + '</button>' +
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
          '<div class="rival-stat">👥 <span class="val">steals ' + (getRivalStealPct(r) * 100).toFixed(1) + '% of members</span></div>' +
          '<div class="rival-stat">⏱️ <span class="val">Promo: ' + fmtTime(r.promoDuration) + '</span></div>' +
        '</div>' : '') +
        statusHTML +
        actionsHTML +
      '</div>'
    );
  }).join('');

  grid.innerHTML = summaryHTML + cardsHTML;
}

// ===== CITY MAP / FRANCHISE =====
function renderCityMap() {
  var statsEl = document.getElementById('empireStats');
  var gridEl = document.getElementById('cityGrid');
  if (!gridEl) return;

  var branchCount = Object.keys(game.branches).length;
  var totalGyms = 1 + branchCount;
  var starsText = '';
  for (var i = 0; i < Math.min(game.prestigeStars, 20); i++) starsText += '⭐';
  var franchiseMult = (1 + game.prestigeStars * 0.25).toFixed(2);
  var empireIncome = typeof getTotalEmpireIncomePerSecond === 'function' ? getTotalEmpireIncomePerSecond() : getIncomePerSecond();
  var passiveTotal = empireIncome - getIncomePerSecond();

  if (statsEl) {
    var passiveNote = branchCount > 0 ? ' <span style="color:var(--text-dim);font-size:12px;">(+' + fmtMoney(passiveTotal) + '/s passive from ' + branchCount + ' branch' + (branchCount > 1 ? 'es' : '') + ')</span>' : '';
    statsEl.innerHTML =
      '<div class="empire-stat-row">' +
        '<div class="empire-stat"><span class="empire-stat-icon">🏢</span> ' + totalGyms + ' gym' + (totalGyms > 1 ? 's' : '') + '</div>' +
        '<div class="empire-stat"><span class="empire-stat-icon">⭐</span> ' + (starsText || 'No stars') + ' (x' + franchiseMult + ' income)</div>' +
        '<div class="empire-stat"><span class="empire-stat-icon">💵</span> ' + fmtMoney(empireIncome) + '/s total' + passiveNote + '</div>' +
      '</div>';
  }

  // Map passive branches to their neighborhoods
  var branchByHood = {};
  Object.keys(game.branches).forEach(function(bId) {
    var b = game.branches[bId];
    if (b.neighborhoodId) branchByHood[b.neighborhoodId] = { branchId: bId, data: b };
  });
  var mainHoodId = game.mainNeighborhoodId || 'palermo';

  var html = '';
  NEIGHBORHOODS.forEach(function(hood) {
    var isMain = hood.id === mainHoodId;
    var branch = branchByHood[hood.id];
    var hasGym = isMain || !!branch;
    var canUnlock = !hasGym && game.level >= hood.reqLevel && game.money >= hood.unlockCost;
    var isLocked = !hasGym && (game.level < hood.reqLevel);

    var cellClass = 'city-cell';
    if (isMain) cellClass += ' active';
    if (isLocked) cellClass += ' locked';
    if (hasGym) cellClass += ' has-gym';

    html += '<div class="' + cellClass + '">';
    html += '<div class="city-cell-header">';
    html += '<span class="city-cell-icon">' + hood.icon + '</span>';
    html += '<span class="city-cell-name">' + hood.name + '</span>';
    if (isMain) html += '<span class="city-active-badge">MAIN</span>';
    html += '</div>';
    html += '<div class="city-cell-desc">' + hood.desc + '</div>';

    if (isMain) {
      html += '<div class="city-cell-gym">';
      html += '<div class="city-gym-name">' + game.gymName + '</div>';
      html += '<div class="city-gym-stats">';
      html += '<span title="Level">Lv.' + game.level + '</span>';
      html += '<span title="Members">👥 ' + Math.floor(game.members) + '</span>';
      html += '<span title="Active income" style="color:var(--green);">💵 ' + fmtMoney(getIncomePerSecond()) + '/s</span>';
      html += '</div>';
      html += '<div class="city-active-label">📍 Your gym — you manage it in the other tabs</div>';
      html += '</div>';
    } else if (branch) {
      var b = branch.data;
      var inc = getBranchPassiveIncome(branch.branchId);
      var upCost = getBranchUpgradeCost(branch.branchId);
      var canUp = game.money >= upCost;
      html += '<div class="city-cell-gym">';
      html += '<div class="city-gym-name">' + (b.name || 'Branch') + '</div>';
      html += '<div class="city-gym-stats">';
      html += '<span title="Investment level">Lv.' + (b.level || 1) + '</span>';
      html += '<span title="Passive income — lands in your wallet" style="color:var(--cyan);">💵 ' + fmtMoney(inc) + '/s → yours</span>';
      html += '</div>';
      html += '<button class="btn ' + (canUp ? 'btn-buy' : 'btn-disabled') + ' city-btn" ' + (canUp ? '' : 'disabled') + ' onclick="upgradeBranch(\'' + branch.branchId + '\')">⬆️ Expand — ' + fmtMoney(upCost) + '</button>';
      html += '</div>';
    } else if (isLocked) {
      html += '<div class="city-cell-locked">';
      html += '<span>🔒 Level ' + hood.reqLevel + ' required</span>';
      html += '<span style="color:var(--text-muted);font-size:11px;display:block;margin-top:4px;">Your level: ' + game.level + '</span>';
      html += '</div>';
    } else {
      var projected = branchIncomeBasis(hood) / BRANCH_INCOME_PAYBACK;
      var affordMsg = canUnlock ? '' : ' <span style="color:var(--red);font-size:11px;">(you need ' + fmtMoney(hood.unlockCost - game.money) + ' more)</span>';
      html += '<div class="city-cell-unlock">';
      html += '<div style="font-size:12px;color:var(--cyan);margin-bottom:8px;">💵 Generates ~' + fmtMoney(projected) + '/s passive · expandable</div>';
      html += '<button class="btn ' + (canUnlock ? 'btn-buy' : 'btn-disabled') + ' city-btn" ' +
        (canUnlock ? 'onclick="openNewBranchModal(\'' + hood.id + '\')"' : 'disabled') + '>' +
        'Open branch — ' + fmtMoney(hood.unlockCost) + '</button>' + affordMsg;
      html += '</div>';
    }

    html += '</div>';
  });

  gridEl.innerHTML = html;

  renderOpportunities();
}

// ===== OPPORTUNITIES / RISKY BUSINESS =====
function renderOpportunities() {
  var container = document.getElementById('opportunitiesContainer');
  if (!container) return;
  var now = Date.now();

  var html = '';
  html += '<div class="section-title" style="margin-top:24px;">💼 Risky Business <span style="font-size:13px;color:var(--cyan);font-weight:400;">— big scores, no champion needed</span></div>';
  html += '<p class="section-subtitle" style="margin-bottom:12px;">Sky-high reward opportunities with real risk. Set the stage before you go in: if it goes wrong, your gym takes a temporary setback.</p>';

  // Active setback banner
  if (isGymSetbackActive()) {
    var sbLeft = getGymSetbackSecondsLeft();
    var penaltyPct = Math.round((1 - (game.gymSetback.incomeMult || 1)) * 100);
    html += '<div class="opp-setback-banner">' +
      '<span style="font-size:22px;">' + (game.gymSetback.icon || '🚨') + '</span>' +
      '<div><div style="font-weight:700;color:var(--red);">' + (game.gymSetback.name || 'Setback') + '</div>' +
      '<div style="font-size:12px;color:var(--text-dim);">Income -' + penaltyPct + '% and reputation stalled · recovers in ~' + fmtTime(sbLeft) + ' (time only).</div></div>' +
    '</div>';
  }

  html += '<div class="grand-list">';

  OPPORTUNITIES.forEach(function(o) {
    var state = getOppState(o.id);
    var lockReason = getOppLockReason(o);
    var locked = !!lockReason;
    var onCooldown = now < state.cooldownUntil;
    var prep = getOppPrep(o.id);
    var readiness = getOppReadiness(o);
    var hasPermisos = !!prep.permisos;
    var successChance = getOppSuccessChance(o);
    var backfireChance = getOppBackfireChance(o);
    var rewardMoney = Math.max(Math.ceil(o.reward.money), Math.ceil(getIncomePerSecond() * o.floorSecs));

    var winColor = successChance >= 0.7 ? 'var(--green)' : successChance >= 0.45 ? 'var(--accent)' : 'var(--red)';
    var bfColor = backfireChance <= 0.08 ? 'var(--green)' : backfireChance <= 0.2 ? 'var(--accent)' : 'var(--red)';

    html += '<div class="grand-card' + (locked ? ' locked' : '') + '">';

    html += '<div class="grand-head">';
    html += '<span class="grand-icon">' + o.icon + '</span>';
    html += '<div class="grand-head-info">';
    html += '<div class="grand-name">' + o.name + '</div>';
    html += '<div class="grand-desc">' + o.desc + '</div>';
    html += '<div class="grand-meta">⏱️ Cooldown ' + fmtTime(o.cooldown) + ' · 🎫 Entry ' + fmtMoney(o.entryFee) +
      (state.wins + state.losses > 0 ? ' · ✅ ' + state.wins + '·❌ ' + state.losses : '') + '</div>';
    html += '</div>';
    html += '</div>';

    if (locked) {
      html += '<div class="grand-locked-msg">🔒 Requirement: <strong>' + lockReason + '</strong></div>';
      html += '</div>';
      return;
    }

    html += '<div class="grand-stats-row">';
    html += '<div class="grand-stat"><span class="grand-stat-lbl">Reward (success)</span><span class="grand-stat-val" style="color:var(--accent);">' + fmtMoney(rewardMoney) + (o.reward.membersPct ? ' +members' : '') + '</span></div>';
    html += '<div class="grand-stat"><span class="grand-stat-lbl">Success chance</span><span class="grand-stat-val" style="color:' + winColor + ';">' + Math.round(successChance * 100) + '%</span></div>';
    html += '<div class="grand-stat"><span class="grand-stat-lbl">Risk (' + o.backfire.name + ')</span><span class="grand-stat-val" style="color:' + bfColor + ';">' + Math.round(backfireChance * 100) + '%</span></div>';
    html += '</div>';

    var readyColor = readiness >= 80 ? 'var(--green)' : readiness >= 40 ? 'var(--accent)' : 'var(--red)';
    html += '<div class="grand-ready-row">';
    html += '<span style="font-size:12px;color:var(--text-dim);">Readiness</span>';
    html += '<div class="grand-ready-bar"><div class="grand-ready-fill" style="width:' + readiness + '%;background:' + readyColor + ';"></div></div>';
    html += '<span style="font-size:12px;font-weight:700;color:' + readyColor + ';">' + readiness + '%</span>';
    html += '</div>';

    html += '<div class="grand-prep-grid">';
    OPP_PREP_ITEMS.forEach(function(it) {
      var done = isOppPrepItemDone(o, it.id);
      var cost = getOppPrepItemCost(o, it);
      var ddRunning = it.id === 'duediligence' && prep.duediligenceUntil > 0 && now < prep.duediligenceUntil;
      var canAfford = game.money >= cost;
      var statusHtml;
      if (done) {
        statusHtml = '<span class="grand-prep-done">✅ Done</span>';
      } else if (ddRunning) {
        var left = Math.ceil((prep.duediligenceUntil - now) / 1000);
        statusHtml = '<span class="grand-prep-running">⏳ ' + fmtTime(left) + '</span>';
      } else {
        statusHtml = '<button class="btn btn-small btn-buy grand-prep-btn" ' + (canAfford ? '' : 'disabled') +
          ' onclick="buyOppPrep(\'' + o.id + '\',\'' + it.id + '\')">' + fmtMoney(cost) + '</button>';
      }
      html += '<div class="grand-prep-item' + (done ? ' done' : '') + '">' +
        '<div class="grand-prep-top"><span>' + it.icon + ' <strong>' + it.name + '</strong>' + (it.required ? ' <span style="color:var(--red);font-size:10px;">*required</span>' : '') + '</span>' +
        '<span style="font-size:11px;color:var(--cyan);">+' + it.readiness + '%</span></div>' +
        '<div class="grand-prep-desc">' + it.desc + '</div>' +
        '<div class="grand-prep-action">' + statusHtml + '</div>' +
      '</div>';
    });
    html += '</div>';

    html += '<div class="grand-compete-row">';
    if (onCooldown) {
      var cd = Math.ceil((state.cooldownUntil - now) / 1000);
      html += '<div class="grand-cooldown">⏱️ Next attempt in <strong>' + fmtTime(cd) + '</strong></div>';
    } else {
      var canEnter = hasPermisos && game.money >= o.entryFee;
      var hint = !hasPermisos ? '📋 You need Paperwork and Permits' : game.money < o.entryFee ? '💸 Missing the entry fee (' + fmtMoney(o.entryFee) + ')' : '';
      html += '<button class="btn btn-buy grand-compete-btn" ' + (canEnter ? '' : 'disabled') +
        ' onclick="attemptOpportunity(\'' + o.id + '\')">🎲 TAKE THE RISK — ' + fmtMoney(o.entryFee) + '</button>';
      if (hint) html += '<span class="grand-hint">' + hint + '</span>';
    }
    html += '</div>';

    html += '</div>'; // grand-card
  });

  html += '</div>'; // grand-list
  container.innerHTML = html;
}

// Result modal for an opportunity (reuses the events overlay)
function showOpportunityResult(r) {
  var overlay = document.getElementById('eventOverlay');
  var card = document.getElementById('eventCard');
  if (!overlay || !card) return;
  var o = r.opportunity;

  var headIcon, headTitle, headColor;
  if (r.success && !r.backfired) { headIcon = '💰'; headTitle = 'SLAM DUNK DEAL!'; headColor = 'var(--green)'; }
  else if (r.success && r.backfired) { headIcon = '💰🚨'; headTitle = 'You came out ahead, but it bit back!'; headColor = 'var(--accent)'; }
  else if (!r.success && r.backfired) { headIcon = '🚨'; headTitle = 'It went wrong… and there was trouble on top'; headColor = 'var(--red)'; }
  else { headIcon = '😞'; headTitle = 'The deal fell through'; headColor = 'var(--accent)'; }

  var lines = [];
  if (r.money) lines.push('<div class="grand-result-line">💰 <strong style="color:var(--accent);">+' + fmtMoney(r.money) + '</strong></div>');
  if (r.members) lines.push('<div class="grand-result-line">👥 +' + r.members + ' members</div>');
  if (r.rep) lines.push('<div class="grand-result-line">⭐ +' + r.rep + ' reputation</div>');
  if (r.backfired) lines.push('<div class="grand-result-line" style="color:var(--red);">' + (r.setback.icon || '🚨') + ' ' + r.setback.name + ': income -' + Math.round(r.setback.incomePenalty * 100) + '% for ~' + fmtTime(r.setbackSecs) + '</div>');
  if (!lines.length) lines.push('<div class="grand-result-line" style="color:var(--text-dim);">You lost the entry fee. Better luck next time.</div>');

  card.innerHTML =
    '<div class="event-icon">' + headIcon + '</div>' +
    '<div class="event-title" style="color:' + headColor + ';">' + headTitle + '</div>' +
    '<div class="event-desc">' + o.icon + ' ' + o.name + '</div>' +
    '<div class="grand-result-lines">' + lines.join('') + '</div>' +
    '<div class="event-choices"><div class="event-choice" onclick="closeGrandResult()"><div class="event-choice-main"><span class="event-choice-text">Continue</span></div></div></div>';

  overlay.classList.remove('hidden');
  window._grandResultOpen = true;
}

function upgradeBranch(branchId) {
  var branch = game.branches[branchId];
  if (!branch) return;
  var cost = getBranchUpgradeCost(branchId);
  if (game.money < cost) {
    showToast('❌', 'You need ' + fmtMoney(cost - game.money) + ' more');
    return;
  }
  game.money -= cost;
  branch.level = (branch.level || 1) + 1;
  var inc = getBranchPassiveIncome(branchId);
  showToast('⬆️', (branch.name || 'Branch') + ' expanded to Lv.' + branch.level + ' · now +' + fmtMoney(inc) + '/s');
  addLog('⬆️ You expanded <span class="highlight">' + (branch.name || 'your branch') + '</span> to level ' + branch.level + ' (+' + fmtMoney(inc) + '/s).');
  renderCityMap();
  saveGame();
}

function openNewBranchModal(neighborhoodId) {
  var hood = NEIGHBORHOODS.find(function(n) { return n.id === neighborhoodId; });
  if (!hood) return;

  var projected = branchIncomeBasis(hood) / BRANCH_INCOME_PAYBACK;
  var modalHtml =
    '<div class="modal-overlay" id="newBranchModal" onclick="if(event.target===this)this.remove()">' +
    '<div class="modal-content" style="max-width:420px;">' +
    '<div class="section-title">' + hood.icon + ' New Branch in ' + hood.name + '</div>' +
    '<p style="color:var(--text-dim);margin-bottom:12px;">' + hood.desc + '</p>' +
    '<div style="background:var(--bg-card);border-radius:8px;padding:12px;margin-bottom:16px;">' +
      '<div style="color:var(--cyan);font-weight:700;font-size:16px;">💵 +' + fmtMoney(projected) + '/s passive</div>' +
      '<div style="color:var(--text-dim);font-size:12px;margin-top:4px;">Lands straight in your wallet, no management needed. Expand it whenever you want for more.</div>' +
    '</div>' +
    '<div style="margin-bottom:16px;">' +
      '<label style="color:var(--text-dim);font-size:13px;">New gym name:</label>' +
      '<input type="text" id="newBranchName" class="gym-name-input" placeholder="Gym ' + hood.name + '" style="width:100%;margin-top:4px;" maxlength="30">' +
    '</div>' +
    '<div style="color:var(--accent);font-weight:700;font-size:18px;margin-bottom:16px;">Cost: ' + fmtMoney(hood.unlockCost) + '</div>' +
    '<div style="display:flex;gap:8px;justify-content:center;">' +
      '<button class="btn btn-buy" onclick="confirmNewBranch(\'' + neighborhoodId + '\')">Open Branch</button>' +
      '<button class="btn" onclick="document.getElementById(\'newBranchModal\').remove()">Cancel</button>' +
    '</div>' +
    '</div></div>';

  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function confirmNewBranch(neighborhoodId) {
  var hood = NEIGHBORHOODS.find(function(n) { return n.id === neighborhoodId; });
  if (!hood) return;

  // Can't open where you already have a gym (main or a passive branch)
  var alreadyExists = game.mainNeighborhoodId === neighborhoodId ||
    Object.values(game.branches).some(function(b) { return b.neighborhoodId === neighborhoodId; });
  if (alreadyExists) {
    showToast('❌', 'You already have a gym in ' + hood.name);
    return;
  }

  if (game.level < hood.reqLevel) {
    showToast('❌', 'Requires level ' + hood.reqLevel);
    return;
  }

  if (game.money < hood.unlockCost) {
    showToast('❌', 'Not enough money');
    return;
  }

  // Deduct cost (from global wallet)
  game.money -= hood.unlockCost;

  // Get gym name
  var nameInput = document.getElementById('newBranchName');
  var gymName = (nameInput && nameInput.value.trim()) || ('Gym ' + hood.name);

  // Create a lightweight passive franchise node
  var newId = 'branch_' + (game.branchCount || 1);
  game.branchCount = (game.branchCount || 1) + 1;
  game.branches[newId] = { id: newId, neighborhoodId: neighborhoodId, name: gymName, level: 1, openedAt: game.tickCount };

  // Update franchise stars
  var newStars = getPrestigeStars();
  if (newStars > game.prestigeStars) game.prestigeStars = newStars;

  // Close modal
  var modal = document.getElementById('newBranchModal');
  if (modal) modal.remove();

  var inc = getBranchPassiveIncome(newId);
  addLog('🏙️ You opened <span class="highlight">' + gymName + '</span> in ' + hood.name + '! Generates +' + fmtMoney(inc) + '/s passive.', 'critical');
  showToast('🏙️', gymName + ' opened · +' + fmtMoney(inc) + '/s passive');

  renderCityMap();
  checkAchievements();
  saveGame();
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
      '<p style="color:var(--text-dim);">Sign in to see the global ranking and compete with other players.</p>' +
    '</div>';
    return;
  }

  if (leaderboardLoading) return;
  leaderboardLoading = true;

  container.innerHTML = '<div class="leaderboard-loading">Loading ranking...</div>';

  Promise.all([fetchLeaderboard(false), fetchMyRank()]).then(function(results) {
    var entries = results[0];
    var myRank = results[1];
    leaderboardLoading = false;

    if (!entries || entries.length === 0) {
      container.innerHTML = '<div class="leaderboard-empty">' +
        '<div style="font-size:40px;margin-bottom:12px;">🏆</div>' +
        '<p style="color:var(--text-dim);">No ranking data yet. Keep playing to be the first!</p>' +
      '</div>';
      return;
    }

    var rankIcons = ['🥇', '🥈', '🥉'];

    var myRankHTML = '';
    if (myRank) {
      myRankHTML = '<div class="leaderboard-myrank">' +
        '<span>Your position:</span> <span class="leaderboard-myrank-value">#' + myRank + '</span>' +
      '</div>';
    }

    var headerHTML = '<div class="leaderboard-row leaderboard-header">' +
      '<div class="lb-rank">#</div>' +
      '<div class="lb-name">Player</div>' +
      '<div class="lb-money">Total Earned</div>' +
      '<div class="lb-level">Level</div>' +
      '<div class="lb-stars">⭐</div>' +
    '</div>';

    var rowsHTML = entries.map(function(entry, i) {
      var isMe = currentUser && entry.uid === currentUser.uid;
      var rankDisplay = i < 3 ? rankIcons[i] : (i + 1);
      var starsDisplay = entry.prestigeStars > 0 ? ('⭐' + entry.prestigeStars) : '-';

      return '<div class="leaderboard-row ' + (isMe ? 'me' : '') + '">' +
        '<div class="lb-rank">' + rankDisplay + '</div>' +
        '<div class="lb-name">' +
          '<div class="lb-username">' + escapeHtml(entry.username || 'Anonymous') + '</div>' +
          '<div class="lb-gymname">' + escapeHtml(entry.gymName || 'Unnamed') + '</div>' +
        '</div>' +
        '<div class="lb-money">' + fmtMoney(entry.totalMoneyEarned || 0) + '</div>' +
        '<div class="lb-level">' + (entry.level || 1) + '</div>' +
        '<div class="lb-stars">' + starsDisplay + '</div>' +
      '</div>';
    }).join('');

    var refreshBtnHTML = '<div style="text-align:center;margin-top:12px;">' +
      '<button class="btn btn-small btn-cyan" onclick="refreshLeaderboard()">🔄 REFRESH</button>' +
    '</div>';

    container.innerHTML = myRankHTML + headerHTML + rowsHTML + refreshBtnHTML;
  }).catch(function() {
    leaderboardLoading = false;
    container.innerHTML = '<div class="leaderboard-empty">' +
      '<p style="color:var(--text-dim);">Error loading the ranking. Try again.</p>' +
      '<button class="btn btn-small btn-cyan" onclick="refreshLeaderboard()" style="margin-top:8px;">🔄 RETRY</button>' +
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
  var steps = TUTORIAL_STEPS;
  if (game.tutorialStep >= steps.length) {
    endTutorial();
    return;
  }

  // Reset previous step's target z-index
  _cleanupTutorialTarget();

  var step = steps[game.tutorialStep];

  // Switch tab if needed
  if (step.tab) {
    switchTab(step.tab);
  }

  // Small delay to let DOM update after tab switch
  setTimeout(function() {
    _positionTutorialStep(step);
  }, 100);
}

var _tutorialActiveTarget = null;
function _cleanupTutorialTarget() {
  if (_tutorialActiveTarget) {
    _tutorialActiveTarget.style.zIndex = '';
    _tutorialActiveTarget = null;
  }
  var overlay = document.getElementById('tutorialOverlay');
  if (overlay) overlay.style.pointerEvents = 'auto';
}

function _positionTutorialStep(step) {
  var target = document.querySelector(step.target);
  var overlay = document.getElementById('tutorialOverlay');
  var tooltip = document.getElementById('tutorialTooltip');
  var highlight = document.getElementById('tutorialHighlight');

  // Ensure sidebar category is expanded if target is a sidebar item
  if (target) {
    var category = target.closest('.sidebar-category');
    if (category) category.classList.remove('collapsed-cat');
  }

  overlay.classList.remove('hidden');
  tooltip.style.display = 'block';

  // Position highlight
  if (target) {
    var rect = target.getBoundingClientRect();
    var pad = 6;
    highlight.style.top = (rect.top - pad) + 'px';
    highlight.style.left = (rect.left - pad) + 'px';
    highlight.style.width = (rect.width + pad * 2) + 'px';
    highlight.style.height = (rect.height + pad * 2) + 'px';
    highlight.style.display = 'block';

    // Scroll target into view if needed
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Recalculate after scroll
      setTimeout(function() {
        var r2 = target.getBoundingClientRect();
        highlight.style.top = (r2.top - pad) + 'px';
        highlight.style.left = (r2.left - pad) + 'px';
        highlight.style.width = (r2.width + pad * 2) + 'px';
        highlight.style.height = (r2.height + pad * 2) + 'px';
        _positionTooltipSmart(tooltip, r2);
      }, 350);
    }

    _positionTooltipSmart(tooltip, rect);
  } else {
    // No target - center tooltip on screen
    highlight.style.display = 'none';
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
  }

  // Build tooltip content
  var isAction = step.action;
  var actionHint = isAction ? '<div class="tutorial-action-hint">👆 Click the highlighted area to continue</div>' : '';
  var nextBtn = isAction ? '' : '<button class="btn btn-small btn-buy" onclick="nextTutorialStep()">NEXT →</button>';

  tooltip.innerHTML =
    '<div class="tutorial-step-indicator">Step ' + (game.tutorialStep + 1) + ' of ' + TUTORIAL_STEPS.length + '</div>' +
    '<h4>' + step.title + '</h4>' +
    '<p>' + step.text + '</p>' +
    actionHint +
    '<div class="tutorial-buttons">' +
      '<button class="btn btn-small btn-red" onclick="endTutorial()">SKIP</button>' +
      nextBtn +
    '</div>';

  // If this step requires an action, let user interact with the highlighted area
  if (isAction && target) {
    if (step.actionCheck) {
      // Complex action (e.g. buy equipment): let user click through highlight
      highlight.style.pointerEvents = 'none';
      highlight.style.cursor = '';
      highlight.onclick = null;
      // Raise target above overlay so user can interact
      overlay.style.pointerEvents = 'none';
      target.style.position = target.style.position || 'relative';
      target.style.zIndex = '251';
      _tutorialActiveTarget = target;
      _waitForActionCheck(step.actionCheck);
    } else {
      // Simple action (e.g. click a tab): forward click to target
      highlight.style.cursor = 'pointer';
      highlight.style.pointerEvents = 'auto';
      highlight.onclick = function(e) {
        e.stopPropagation();
        highlight.onclick = null;
        highlight.style.cursor = '';
        target.click();
        setTimeout(function() { nextTutorialStep(); }, 300);
      };
    }
  } else {
    highlight.style.cursor = '';
    highlight.onclick = null;
    highlight.style.pointerEvents = 'none';
    overlay.style.pointerEvents = 'auto';
  }
}

function _waitForActionCheck(checkFn) {
  if (game.tutorialDone) return;
  if (checkFn()) {
    nextTutorialStep();
  } else {
    setTimeout(function() { _waitForActionCheck(checkFn); }, 500);
  }
}

function _positionTooltipSmart(tooltip, targetRect) {
  tooltip.style.transform = '';
  var tooltipW = 360;
  var tooltipH = tooltip.offsetHeight || 200;
  var margin = 16;
  var vw = window.innerWidth;
  var vh = window.innerHeight;

  // Try below target
  var top = targetRect.bottom + margin;
  var left = Math.max(margin, Math.min(targetRect.left, vw - tooltipW - margin));

  if (top + tooltipH > vh - margin) {
    // Try above target
    top = targetRect.top - tooltipH - margin;
    if (top < margin) {
      // Neither fits - position to the side
      top = Math.max(margin, Math.min(targetRect.top, vh - tooltipH - margin));
      if (targetRect.right + margin + tooltipW < vw) {
        left = targetRect.right + margin;
      } else if (targetRect.left - margin - tooltipW > 0) {
        left = targetRect.left - tooltipW - margin;
      } else {
        // Last resort: center on screen
        top = Math.max(margin, (vh - tooltipH) / 2);
        left = Math.max(margin, (vw - tooltipW) / 2);
      }
    }
  }

  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
}

function nextTutorialStep() {
  game.tutorialStep++;
  showTutorialStep();
}

function endTutorial() {
  // Clean up
  _cleanupTutorialTarget();
  var highlight = document.getElementById('tutorialHighlight');
  if (highlight) {
    highlight.onclick = null;
    highlight.style.cursor = '';
    highlight.style.pointerEvents = 'none';
  }

  game.tutorialDone = true;
  document.getElementById('tutorialOverlay').classList.add('hidden');
  document.getElementById('tutorialHighlight').style.display = 'none';
  document.getElementById('tutorialTooltip').style.display = 'none';

  // Return to gym tab
  switchTab('gym');

  showToast('🎓', 'Tutorial complete! Time to build your empire!');
  saveGame();
  setTimeout(showPrimerosPasosGuide, 700);
}

// ===== FIRST STEPS GUIDE =====
function showPrimerosPasosGuide() {
  if (game.primerosPasosSeen) return;
  game.primerosPasosSeen = true;
  var card = document.getElementById('primerosPasosCard');
  if (!card) return;
  card.innerHTML =
    '<div class="pp-title">🎯 FIRST STEPS</div>' +
    '<div class="pp-subtitle">You finished the tutorial. Here are your first 3 real goals:</div>' +
    '<div class="pp-goals">' +
      '<div class="pp-goal">' +
        '<div class="pp-goal-icon">🏋️</div>' +
        '<div class="pp-goal-text"><strong>Buy more equipment</strong><span>Every machine raises your capacity and income per second</span></div>' +
        '<button class="btn btn-buy pp-goal-btn" onclick="closePrimerosPasosGuide(\'equipment\')">Go →</button>' +
      '</div>' +
      '<div class="pp-goal">' +
        '<div class="pp-goal-icon">📢</div>' +
        '<div class="pp-goal-text"><strong>Turn on a Flyers campaign</strong><span>The cheapest one: adds members automatically every day</span></div>' +
        '<button class="btn btn-buy pp-goal-btn" onclick="closePrimerosPasosGuide(\'marketing\')">Go →</button>' +
      '</div>' +
      '<div class="pp-goal">' +
        '<div class="pp-goal-icon">👥</div>' +
        '<div class="pp-goal-text"><strong>Hire a trainer</strong><span>Staff raises your income and attracts more members</span></div>' +
        '<button class="btn btn-buy pp-goal-btn" onclick="closePrimerosPasosGuide(\'staff\')">Go →</button>' +
      '</div>' +
    '</div>' +
    '<button class="btn btn-small" style="width:100%;" onclick="closePrimerosPasosGuide(null)">Got it, let\'s go!</button>';
  document.getElementById('primerosPasosOverlay').classList.remove('hidden');
}

function closePrimerosPasosGuide(tab) {
  document.getElementById('primerosPasosOverlay').classList.add('hidden');
  if (tab) switchTab(tab);
  saveGame();
}

// ===== TAB WALKTHROUGHS =====
var _walkthroughTabId = null;

function showTabWalkthrough(tabId) {
  var wt = TAB_WALKTHROUGHS[tabId];
  if (!wt) return;
  // Don't stack: if a walkthrough is already open, don't replace it (this tab stays unseen and reappears on the next visit)
  var existingOv = document.getElementById('tabWalkthroughOverlay');
  if (existingOv && !existingOv.classList.contains('hidden')) return;
  _walkthroughTabId = tabId;

  var tipsHTML = wt.tips.map(function(t) {
    return '<li class="walkthrough-tip">' + t + '</li>';
  }).join('');

  document.getElementById('tabWalkthroughCard').innerHTML =
    '<div class="walkthrough-icon">' + wt.icon + '</div>' +
    '<div class="walkthrough-title">' + wt.title + '</div>' +
    '<div class="walkthrough-intro">' + wt.intro + '</div>' +
    '<ul class="walkthrough-tips">' + tipsHTML + '</ul>' +
    '<div class="walkthrough-actions">' +
      '<button class="btn btn-small walkthrough-wiki-btn" onclick="openWikiFromWalkthrough(\'' + (wt.wiki || tabId) + '\')">📖 View Wiki</button>' +
      '<button class="btn btn-buy walkthrough-ok-btn" onclick="dismissTabWalkthrough(\'' + tabId + '\')">✅ Got it</button>' +
    '</div>';

  document.getElementById('tabWalkthroughOverlay').classList.remove('hidden');
}

function dismissTabWalkthrough(tabId) {
  if (!game.tabsSeen) game.tabsSeen = {};
  game.tabsSeen[tabId || _walkthroughTabId] = true;
  document.getElementById('tabWalkthroughOverlay').classList.add('hidden');
  _walkthroughTabId = null;
  saveGame();
}

function openWikiFromWalkthrough(sectionId) {
  dismissTabWalkthrough(_walkthroughTabId);
  openWiki(sectionId);
}

function openWiki(sectionId) {
  switchTab('wiki');
  if (sectionId) {
    setTimeout(function() {
      var el = document.getElementById('wiki-' + sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('wiki-section-highlight');
        setTimeout(function() { el.classList.remove('wiki-section-highlight'); }, 2000);
      }
    }, 200);
  }
}

// ===== WIKI =====
function renderWiki() {
  var container = document.getElementById('wikiContainer');
  if (!container) return;

  var html = '';
  WIKI_CONTENT.forEach(function(section) {
    var safeContent = section.content.replace(/"/g, '&quot;').toLowerCase();
    html +=
      '<div class="wiki-section" id="wiki-' + section.id + '" data-title="' + section.title.toLowerCase() + '" data-content="' + safeContent + '">' +
        '<div class="wiki-section-header" onclick="toggleWikiSection(\'' + section.id + '\')">' +
          '<span class="wiki-section-icon">' + section.icon + '</span>' +
          '<span class="wiki-section-title">' + section.title + '</span>' +
          '<span class="wiki-section-chevron" id="wiki-chevron-' + section.id + '">▼</span>' +
        '</div>' +
        '<div class="wiki-section-body hidden" id="wiki-body-' + section.id + '">' +
          '<div class="wiki-content">' + section.content + '</div>' +
        '</div>' +
      '</div>';
  });

  container.innerHTML = html;
}

function toggleWikiSection(sectionId) {
  var body = document.getElementById('wiki-body-' + sectionId);
  var chevron = document.getElementById('wiki-chevron-' + sectionId);
  if (!body) return;
  var isHidden = body.classList.contains('hidden');
  body.classList.toggle('hidden');
  if (chevron) chevron.textContent = isHidden ? '▲' : '▼';
}

function searchWiki(query) {
  var q = (query || '').toLowerCase().trim();
  var sections = document.querySelectorAll('.wiki-section');
  sections.forEach(function(sec) {
    if (!q) {
      sec.classList.remove('hidden');
      return;
    }
    var title = sec.getAttribute('data-title') || '';
    var content = sec.getAttribute('data-content') || '';
    var match = title.indexOf(q) !== -1 || content.indexOf(q) !== -1;
    sec.classList.toggle('hidden', !match);
    if (match) {
      var body = sec.querySelector('.wiki-section-body');
      var chevron = sec.querySelector('.wiki-section-chevron');
      if (body) body.classList.remove('hidden');
      if (chevron) chevron.textContent = '▲';
    }
  });
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

  // Can't research if already researching something
  if (game.skillResearching && Date.now() < game.skillResearching.until) {
    showToast('❌', 'You already have research in progress!');
    return;
  }

  game.money -= skill.cost;

  // Start research timer
  var researchSeconds = getSkillResearchTime(skill.cost);
  game.skillResearching = {
    skillId: skillId,
    until: Date.now() + researchSeconds * 1000
  };

  addLog('🔬 Researching <span class="highlight">' + skill.name + '</span>... (' + fmtTime(researchSeconds) + ')');
  showToast(skill.icon, 'Researching: ' + skill.name + ' (' + fmtTime(researchSeconds) + ')');

  renderSkillTree();
  saveGame();
}

function renderSkillTree() {
  const container = document.getElementById('skillTreeContainer');
  if (!container) return;

  var isResearching = game.skillResearching && Date.now() < game.skillResearching.until;
  var researchingId = isResearching ? game.skillResearching.skillId : null;

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
      const thisResearching = researchingId === skill.id;

      let cls = 'skill-node';
      if (owned) cls += ' owned';
      else if (thisResearching) cls += ' researching';
      else if (!reqMet || !depMet) cls += ' locked';

      html += '<div class="' + cls + '" style="border-color:' + (owned ? branch.color : thisResearching ? 'var(--cyan)' : 'var(--border)') + ';">';
      html += '<div class="skill-node-icon">' + skill.icon + '</div>';
      html += '<div class="skill-node-name">' + skill.name + '</div>';
      html += '<div class="skill-node-desc">' + skill.desc + '</div>';

      if (owned) {
        html += '<div class="skill-node-status" style="color:var(--green);">✅ Researched</div>';
      } else if (thisResearching) {
        var remaining = Math.max(0, Math.ceil((game.skillResearching.until - Date.now()) / 1000));
        html += '<div class="skill-node-status" style="color:var(--cyan);">🔬 Researching... ' + fmtTime(remaining) + '</div>';
        var totalTime = getSkillResearchTime(skill.cost);
        var elapsed = totalTime - remaining;
        var pct = Math.min(100, Math.round((elapsed / totalTime) * 100));
        html += '<div class="skill-progress-bar"><div class="skill-progress-fill" style="width:' + pct + '%;"></div></div>';
      } else if (!reqMet) {
        html += '<div class="skill-node-status">🔒 Level ' + skill.reqLevel + '</div>';
      } else if (!depMet) {
        html += '<div class="skill-node-status">🔒 Requires: ' + branch.skills.find(s => s.id === skill.requires).name + '</div>';
      } else if (isResearching) {
        html += '<div class="skill-node-status" style="color:var(--text-muted);">⏳ Other research in progress</div>';
        html += '<div style="font-size:12px;color:var(--text-dim);margin-top:4px;">' + fmtMoney(skill.cost) + ' · ' + fmtTime(getSkillResearchTime(skill.cost)) + '</div>';
      } else {
        var researchTime = getSkillResearchTime(skill.cost);
        html += '<button class="btn btn-buy btn-small" ' + (canAfford ? '' : 'disabled') + ' onclick="researchSkill(\'' + skill.id + '\')">🔬 RESEARCH — ' + fmtMoney(skill.cost) + ' (' + fmtTime(researchTime) + ')</button>';
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
    showToast('❌', 'There are already ' + activeBuilds + ' construction(s) in progress!');
    return;
  }

  game.money -= zoneCost;

  const xpGain = 100;
  addXp(xpGain);
  game.dailyTracking.xpEarned += xpGain;

  if (zone.buildTime > 0) {
    // Start construction timer (speed mult < 1 = faster)
    if (!game.zoneBuilding) game.zoneBuilding = {};
    var buildDuration = Math.ceil(zone.buildTime * getSkillEffect('zoneBuildSpeedMult'));
    game.zoneBuilding[zoneId] = Date.now() + buildDuration * 1000;
    addLog('🏗️ Building <span class="highlight">' + zone.name + '</span> ' + zone.icon + ' (' + fmtTime(buildDuration) + ')');
    showToast('🏗️', 'Building ' + zone.name + '... ' + fmtTime(buildDuration));
  } else {
    // Instant (ground floor)
    game.zones[zoneId] = true;
    game.stats.zonesUnlocked++;
    addLog('🏗️ New zone: <span class="highlight">' + zone.name + '</span> ' + zone.icon);
    showToast(zone.icon, 'Zone unlocked: ' + zone.name + '!');
    floatNumber('+' + zone.capacityBonus + ' capacity', 'var(--accent)');
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
      btnHTML = '<button class="btn btn-green" disabled>✅ UNLOCKED</button>';
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
      btnHTML = '<div class="zone-build-badge">🏗️ UNDER CONSTRUCTION</div>';
      btnHTML += '<div class="equip-repair-bar"><div class="equip-upgrade-fill" style="width:' + bldPct + '%"></div></div>';
      btnHTML += '<div class="equip-upgrade-time">Ready in ' + bldTimeStr + '</div>';
      cardExtra = ' building';
    } else if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;">🔒 Requires Level ' + z.reqLevel + '</div>';
    } else {
      var adjustedBuildTime = Math.ceil(z.buildTime * getSkillEffect('zoneBuildSpeedMult'));
      var timeStr = adjustedBuildTime >= 3600 ? Math.floor(adjustedBuildTime / 3600) + 'h' : Math.floor(adjustedBuildTime / 60) + 'min';
      btnHTML = '<button class="btn btn-buy" ' + (canAfford ? '' : 'disabled') + ' onclick="buyZone(\'' + z.id + '\')">🏗️ BUILD — ' + fmtMoney(adjustedCost) + (z.buildTime > 0 ? ' (' + timeStr + ')' : '') + '</button>';
    }

    cardsHTML += '<div class="expansion-card ' + (owned ? 'owned' : '') + (locked && !owned && !building ? ' locked' : '') + cardExtra + '">';
    cardsHTML += '<div class="expansion-card-icon">' + z.icon + '</div>';
    cardsHTML += '<div class="expansion-card-name">' + z.name + '</div>';
    cardsHTML += '<div class="expansion-card-desc">' + z.desc + '</div>';
    cardsHTML += '<div class="expansion-card-stats">';
    cardsHTML += '<span>📦 +' + z.capacityBonus + ' capacity</span>';
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
  propertyHTML += '<div class="section-title" style="font-size:16px;margin-top:16px;">🏠 Property Ownership</div>';
  if (game.ownProperty) {
    propertyHTML += '<p style="color:var(--green);text-align:center;">✅ You own the property. No rent to pay.</p>';
  } else if (propLocked) {
    propertyHTML += '<p style="color:var(--text-muted);text-align:center;">🔒 Requires Level ' + OPERATING_COSTS.propertyReqLevel + ' to buy the property.</p>';
    propertyHTML += '<p style="color:var(--red);text-align:center;font-size:13px;">Current rent: ' + fmtMoney(rentDaily) + '/day</p>';
  } else {
    propertyHTML += '<p style="color:var(--text-dim);text-align:center;font-size:13px;">Buy the property and stop paying rent (' + fmtMoney(rentDaily) + '/day).</p>';
    var canAffordProp = game.money >= OPERATING_COSTS.propertyPrice;
    propertyHTML += '<div style="text-align:center;"><button class="btn btn-buy" ' + (canAffordProp ? '' : 'disabled') + ' onclick="buyProperty()">🏠 BUY PROPERTY — ' + fmtMoney(OPERATING_COSTS.propertyPrice) + '</button></div>';
  }
  propertyHTML += '<p style="color:var(--text-dim);text-align:center;font-size:12px;margin-top:8px;">Total operating costs: ' + fmtMoney(opDaily) + '/day (rent + utilities)</p>';
  propertyHTML += '</div>';

  container.innerHTML = mapHTML + cardsHTML + propertyHTML;
}

// ===== VIP MEMBERS =====
function checkVipSpawn() {
  game.lastVipTime++;
  if (game.lastVipTime < game.nextVipIn) return;
  if (game.vipMembers.length >= 3) return; // Max 3 VIPs at a time

  game.lastVipTime = 0;
  var baseVipTimer = 250 + Math.floor(Math.random() * 200); // 4-7.5 minutes
  // Neighborhood VIP chance multiplier (higher mult = shorter wait)
  var hood = typeof getActiveNeighborhood === 'function' ? getActiveNeighborhood() : null;
  if (hood && hood.vipChanceMult > 0) baseVipTimer = Math.floor(baseVipTimer / hood.vipChanceMult);
  // Fame: "Celebrity Magnet" perk speeds up VIP appearances (+15%/level)
  baseVipTimer = Math.floor(baseVipTimer / (1 + getFamePerkEffect('vipspeed')));
  game.nextVipIn = Math.max(60, baseVipTimer); // minimum 1 min

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

  addLog('⭐ VIP: <span class="highlight">' + vip.name + '</span> wants to join! "' + vip.request + '"');
  showToast(vip.icon, 'VIP: ' + vip.name + ' wants to join!');

  renderVipMembers();
  updateTabNotifications();
}

function checkVipExpiry() {
  const now = Date.now();
  const expired = game.vipMembers.filter(v => now >= v.expiresAt && !v.accepted);
  expired.forEach(v => {
    const vipDef = VIP_MEMBERS.find(vd => vd.id === v.id);
    if (vipDef) {
      addLog('😔 VIP <span class="highlight">' + vipDef.name + '</span> left... you didn\'t meet their requirements.', 'critical');
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
    showToast('❌', 'You don\'t meet the VIP\'s requirements!');
    return;
  }

  vipState.accepted = true;

  const prestigeMult = 1 + (game.prestigeStars * 0.25);
  // Fame: unlock "Exclusive VIP Lounge" → +50% to everything the VIP yields
  const salonMult = (game.fameUnlocks && game.fameUnlocks.unlock_vipsalon) ? 1.5 : 1;
  const vipMult = getSkillEffect('vipRewardMult') * salonMult;
  const moneyReward = Math.ceil(vipDef.reward.money * prestigeMult * vipMult);

  game.money += moneyReward;
  game.totalMoneyEarned += moneyReward;
  game.reputation += Math.ceil(vipDef.reward.rep * vipMult);
  addXp(Math.ceil(vipDef.reward.xp * vipMult));
  game.stats.vipsServed++;
  game.dailyTracking.moneyEarned += moneyReward;
  game.dailyTracking.reputationGained += vipDef.reward.rep;
  game.dailyTracking.xpEarned += vipDef.reward.xp;

  addLog('⭐ VIP <span class="highlight">' + vipDef.name + '</span> accepted! +<span class="money-log">' + fmtMoney(moneyReward) + '</span> +' + vipDef.reward.rep + '⭐', 'important');
  showToast(vipDef.icon, 'VIP ' + vipDef.name + ' joined!');
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
    container.innerHTML = '<div class="vip-empty"><div style="font-size:40px;margin-bottom:12px;">👀</div><p style="color:var(--text-dim);">No VIP members waiting. They show up every 4-7 minutes.<br>The more equipment and zones you have, the more VIPs you can satisfy.</p></div>';
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
    html += '<div class="vip-timer">' + (v.accepted ? '✅ Active member' : '⏱️ Leaves in: ' + fmtTime(timeLeft)) + '</div>';
    html += '</div>';

    if (!v.accepted) {
      html += '<button class="btn ' + (allMet ? 'btn-buy' : 'btn-red') + ' btn-small" onclick="acceptVip(\'' + v.id + '\')">';
      html += allMet ? '✅ ACCEPT' : '❌ NOT MET';
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
      return MARKETING_CAMPAIGNS.some(function(m) {
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
      return game.champion.fatigue < CHAMPION_FATIGUE_THRESHOLD && (!game.champion.trainingUntil || Date.now() >= game.champion.trainingUntil);
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

    // Don't show reminder if notification dot is already visible (avoids double indicator)
    var notifDot = document.getElementById('dot-' + tabId);
    if (notifDot && !notifDot.classList.contains('hidden')) {
      reminderEl.classList.add('hidden');
      continue;
    }

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

  // Skip re-render while rename form is open (avoids destroying the input)
  var renameForm = document.getElementById('champRenameForm');
  if (renameForm && !renameForm.classList.contains('hidden')) return;

  // Not unlocked yet
  if (game.level < CHAMPION_UNLOCK_LEVEL) {
    var pct = Math.round((game.level / CHAMPION_UNLOCK_LEVEL) * 100);
    container.innerHTML =
      '<div class="champion-locked-panel">' +
        '<div style="font-size:64px;margin-bottom:16px;">🏅</div>' +
        '<h3 style="margin:0 0 8px;">Champion System</h3>' +
        '<p style="color:var(--text-dim);margin:0 0 12px;">Unlocks at <strong>Level ' + CHAMPION_UNLOCK_LEVEL + '</strong>. You\'re at Level ' + game.level + '.</p>' +
        '<div class="champ-progress-bar"><div class="champ-progress-fill" style="width:' + pct + '%"></div></div>' +
        '<p style="color:var(--text-muted);font-size:12px;margin-top:8px;">Level ' + game.level + ' / ' + CHAMPION_UNLOCK_LEVEL + '</p>' +
      '</div>' +
      renderNormalCompetitions();
    return;
  }

  // Not recruited yet
  if (!game.champion.recruited) {
    var canAfford = game.money >= CHAMPION_RECRUIT_COST;
    container.innerHTML =
      '<div class="champion-locked-panel">' +
        '<div style="font-size:64px;margin-bottom:16px;">🥊</div>' +
        '<h3 style="margin:0 0 8px;">Recruit Your Champion</h3>' +
        '<p style="color:var(--text-dim);margin:0 0 8px;">An elite fighter is looking for a coach. Manage them, train them, and lead them to glory.</p>' +
        '<p style="color:var(--text-muted);font-size:13px;margin:0 0 16px;">With a champion you earn double in every competition.</p>' +
        '<button class="btn btn-buy" style="font-size:16px;padding:14px 28px;" ' + (canAfford ? '' : 'disabled') + ' onclick="recruitChampion()">🏅 RECRUIT — ' + fmtMoney(CHAMPION_RECRUIT_COST) + '</button>' +
      '</div>' +
      renderNormalCompetitions();
    return;
  }

  var now = Date.now();
  var isTraining = !!(game.champion.trainingUntil && now < game.champion.trainingUntil);
  var injured = isChampionInjured();
  var inCamp = isChampionInCamp();
  var champBusy = isTraining || injured || inCamp;
  var fatigue = game.champion.fatigue || 0;
  var isExhausted = fatigue >= CHAMPION_FATIGUE_THRESHOLD;
  var fatigePct = Math.round((fatigue / CHAMPION_MAX_FATIGUE) * 100);
  var fatigueColor = fatigePct < 40 ? 'var(--green)' : fatigePct < 70 ? 'var(--accent)' : 'var(--red)';
  var recoveryTimeSec = getChampionRecoveryTimeSeconds();

  var xpNeeded = getChampionXpToNext();
  var xpPct = Math.min(100, Math.floor((game.champion.xp / xpNeeded) * 100));
  var totalStats = getChampionTotalStats();

  var html = '';

  // ===== CHAMPION SHEET =====
  html += '<div class="champ-sheet">';

  // Header: name + level + record
  html += '<div class="champ-header">';
  html += '<div class="champ-name-row">';
  html += '<span class="champ-name-display" id="champNameDisplay">' + (game.champion.name || 'Champion') + '</span>';
  html += '<button class="btn-icon" onclick="showChampionRename()" title="Change name">✏️</button>';
  html += '</div>';
  html += '<div class="champ-meta">';
  html += '<span class="champ-level-badge">🏅 LV. ' + game.champion.level + '</span>';
  html += '<span class="champ-record">🏆 ' + game.champion.wins + 'W · ' + game.champion.losses + 'L</span>';
  html += '<span class="champ-total-stat">📊 Total: ' + totalStats + '</span>';
  html += '</div>';
  html += '<div class="champ-xp-row">';
  html += '<div class="champ-xp-bar"><div class="champ-xp-fill" style="width:' + xpPct + '%"></div></div>';
  html += '<span class="champ-xp-text">' + game.champion.xp + ' / ' + xpNeeded + ' XP</span>';
  html += '</div>';
  html += '</div>'; // champ-header

  // Inline rename form (hidden by default)
  html += '<div class="champ-rename-form hidden" id="champRenameForm">' +
    '<input class="champ-rename-input" id="champRenameInput" type="text" maxlength="20" placeholder="Champion name" value="' + (game.champion.name || 'Champion') + '">' +
    '<button class="btn btn-small btn-cyan" onclick="saveChampionRename()">✅ Save</button>' +
    '<button class="btn btn-small" onclick="cancelChampionRename()">✖</button>' +
  '</div>';

  // ===== STATS =====
  html += '<div class="champ-section-title">📊 Stats</div>';
  html += '<div class="champ-stats-list">';
  CHAMPION_STATS.forEach(function(stat) {
    var base = game.champion.stats[stat] || 1;
    var effective = getChampionEffectiveStat(stat);
    var bonus = effective - base;
    var cost = getChampionTrainingCost(stat);
    var duration = getChampionTrainingDuration(stat);
    var canAffordTrain = game.money >= cost;
    var canTrain = !champBusy && canAffordTrain && (game.champion.fatigue || 0) < CHAMPION_FATIGUE_THRESHOLD;
    var maxStatBar = Math.max(30, effective + 5);
    var barPct = Math.min(100, Math.round((effective / maxStatBar) * 100));

    html += '<div class="champ-stat-row">';
    // Icon + name + description
    html += '<div class="champ-stat-left">';
    html += '<div class="champ-stat-label">' + CHAMPION_STAT_ICONS[stat] + ' <strong>' + CHAMPION_STAT_NAMES[stat] + '</strong>';
    if (bonus > 0) html += ' <span class="champ-stat-bonus">+' + bonus + ' (gear)</span>';
    html += '</div>';
    html += '<div class="champ-stat-desc">' + CHAMPION_STAT_DESC[stat] + '</div>';
    html += '<div class="champ-stat-bar-row">';
    html += '<div class="champ-stat-bar"><div class="champ-stat-fill" style="width:' + barPct + '%"></div></div>';
    html += '<span class="champ-stat-val">' + effective + '</span>';
    html += '</div>';
    html += '</div>'; // champ-stat-left
    // Train button / progress
    html += '<div class="champ-stat-right">';
    if (isTraining && game.champion.trainingStat === stat) {
      var dur = getChampionTrainingDuration(stat) * 1000;
      var startTime = game.champion.trainingUntil - dur;
      var elapsed = now - startTime;
      var pct = Math.min(100, Math.round((elapsed / dur) * 100));
      var remaining = Math.max(0, Math.ceil((game.champion.trainingUntil - now) / 1000));
      html += '<div class="champ-training-active">';
      html += '<div class="champ-train-bar"><div class="champ-train-fill" style="width:' + pct + '%"></div></div>';
      html += '<div class="champ-train-time">Training... ' + fmtTime(remaining) + '</div>';
      html += '</div>';
    } else {
      html += '<button class="btn btn-buy btn-small champ-train-btn" ' + (canTrain ? '' : 'disabled') +
        ' onclick="trainChampion(\'' + stat + '\')">' +
        '📚 TRAIN<br><span style="font-size:11px;">' + fmtMoney(cost) + ' · ' + fmtTime(duration) + '</span>' +
        '</button>';
    }
    html += '</div>';
    html += '</div>'; // champ-stat-row
  });
  html += '</div>'; // champ-stats-list

  // ===== PHYSICAL STATE (FATIGUE) =====
  html += '<div class="champ-section-title">⚡ Physical State</div>';
  // Injury banner (recovering after a Grand Tournament) or training camp
  if (injured) {
    var injSecs = getChampionInjurySecondsLeft();
    html += '<div class="champ-injury-banner">' +
      '<span style="font-size:22px;">🤕</span>' +
      '<div><div style="font-weight:700;color:var(--red);">INJURED</div>' +
      '<div style="font-size:12px;color:var(--text-dim);">Recovering ~' + fmtTime(injSecs) + '. Can\'t train or compete. Improve Endurance and bring the Medical Kit to lower the risk.</div></div>' +
    '</div>';
  } else if (inCamp) {
    var camp = getChampionBusyState();
    html += '<div class="champ-camp-banner">' +
      '<span style="font-size:22px;">🏕️</span>' +
      '<div><div style="font-weight:700;color:var(--cyan);">IN TRAINING CAMP</div>' +
      '<div style="font-size:12px;color:var(--text-dim);">Preseason in progress ~' + fmtTime(camp.secs) + '. When it ends it adds Readiness for the Grand Tournament.</div></div>' +
    '</div>';
  }
  html += '<div class="champ-fatigue-panel">';
  var stateLabel, stateColor;
  if (isExhausted) { stateLabel = '⚠️ EXHAUSTED'; stateColor = 'var(--red)'; }
  else if (fatigePct >= 50) { stateLabel = '😓 TIRED'; stateColor = 'var(--accent)'; }
  else if (fatigePct >= 20) { stateLabel = '💪 ACTIVE'; stateColor = 'var(--cyan)'; }
  else { stateLabel = '✅ RESTED'; stateColor = 'var(--green)'; }

  html += '<div class="champ-fatigue-header">';
  html += '<span style="color:' + stateColor + ';font-weight:700;">' + stateLabel + '</span>';
  html += '<span class="champ-fatigue-num" style="color:' + fatigueColor + ';">Fatigue: ' + fatigue + '/' + CHAMPION_MAX_FATIGUE + '</span>';
  html += '</div>';
  html += '<div class="champ-fatigue-bar"><div class="champ-fatigue-fill" style="width:' + fatigePct + '%;background:' + fatigueColor + ';"></div></div>';
  if (fatigue > 0) {
    html += '<div class="champ-fatigue-recovery">⏱️ Recovery: ~' + fmtTime(recoveryTimeSec) + ' left · improve Stamina to speed it up</div>';
  } else {
    html += '<div class="champ-fatigue-recovery" style="color:var(--green);">Ready to train and compete</div>';
  }
  if (isExhausted) {
    var fp = typeof getChampionFatiguePenalty === 'function' ? getChampionFatiguePenalty() : { label: null };
    html += '<div class="champ-exhausted-msg">⚠️ ' + (fp.label || 'Very tired') + ' — training and competing comes with a penalty. Rest to recover effectiveness.</div>';
  }
  html += '</div>'; // champ-fatigue-panel

  // ===== GEAR =====
  html += '<div class="champ-section-title">🛡️ Gear</div>';
  html += '<div class="champion-equip-grid">';
  var slots = ['head', 'hands', 'waist', 'feet'];
  var slotNames = { head: 'Head', hands: 'Hands', waist: 'Waist', feet: 'Feet' };
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
      html += '<div class="champion-empty-slot">— Empty —</div>';
    }
    var available = CHAMPION_EQUIPMENT.filter(function(e) {
      return e.slot === slot && e.id !== equippedId && game.champion.level >= e.reqChampLevel;
    });
    available.forEach(function(eq) {
      var canBuy = game.money >= eq.cost;
      var statText = Object.keys(eq.stats).map(function(k) {
        return CHAMPION_STAT_ICONS[k] + '+' + eq.stats[k];
      }).join(' ');
      html += '<button class="btn btn-small btn-buy" style="width:100%;margin-top:6px;font-size:12px;" ' + (canBuy ? '' : 'disabled') +
        ' onclick="equipChampion(\'' + eq.id + '\')">' + eq.icon + ' ' + eq.name + ' — ' + fmtMoney(eq.cost) + ' <span style="opacity:0.7;">(' + statText + ')</span></button>';
    });
    var lockedItems = CHAMPION_EQUIPMENT.filter(function(e) {
      return e.slot === slot && e.id !== equippedId && game.champion.level < e.reqChampLevel;
    });
    if (lockedItems.length > 0) {
      html += '<div style="color:var(--text-muted);font-size:11px;margin-top:4px;">🔒 More items at level ' + lockedItems[0].reqChampLevel + '</div>';
    }
    html += '</div>';
  });
  html += '</div>'; // champion-equip-grid

  // ===== COMPETITIONS =====
  html += '<div class="champ-section-title">⚔️ Competitions <span style="font-size:13px;color:var(--cyan);font-weight:400;">— your champion earns double</span></div>';
  html += '<div class="champion-comp-list">';

  COMPETITIONS.forEach(function(c) {
    var state = game.competitions[c.id] || { wins: 0, losses: 0, cooldownUntil: 0 };
    var locked = game.reputation < c.minRep;
    var onCooldown = !locked && now < state.cooldownUntil;
    var fuerza = getChampionEffectiveStat('fuerza');
    var velocidad = getChampionEffectiveStat('velocidad');
    var mentalidad = getChampionEffectiveStat('mentalidad');
    var tecnica = getChampionEffectiveStat('tecnica');
    var resistencia = getChampionEffectiveStat('resistencia');
    var statBonus = (fuerza * 0.008) + (velocidad * 0.012) + (mentalidad * 0.01 * (1.5 - c.winChance));
    var fp = typeof getChampionFatiguePenalty === 'function' ? getChampionFatiguePenalty() : { mult: 1.0, chancePenalty: 0, label: null };
    var chance = Math.max(0.05, Math.min(0.95, c.winChance + statBonus + getSkillEffect('compWinChanceBonus', 0)) - fp.chancePenalty);
    var rewardMult = CHAMPION_REWARD_MULT * getSkillEffect('compRewardMult') * (1 + tecnica * 0.02) * (1 + fuerza * 0.01);
    var fatigueCost = Math.max(15, CHAMPION_FATIGUE_PER_COMPETE - Math.floor(resistencia * 0.5));
    var canCompete = !locked && !onCooldown && !champBusy && (game.champion.fatigue || 0) < CHAMPION_FATIGUE_THRESHOLD;

    var chancePct = Math.round(chance * 100);
    var chanceColor = chancePct >= 70 ? 'var(--green)' : chancePct >= 40 ? 'var(--accent)' : 'var(--red)';

    var actionHTML = '';
    if (locked) {
      actionHTML = '<span style="color:var(--text-muted);font-size:12px;">🔒 ' + c.minRep + ' rep</span>';
    } else if (onCooldown) {
      var timeLeft = Math.ceil((state.cooldownUntil - now) / 1000);
      actionHTML = '<span style="color:var(--text-dim);font-size:12px;">⏱️ ' + fmtTime(timeLeft) + '</span>';
    } else {
      var penaltyLine = fp.label ? '<br><span style="font-size:10px;color:var(--accent);">' + fp.label + '</span>' : '';
      actionHTML = '<button class="btn btn-buy btn-small" ' + (canCompete ? '' : 'disabled') +
        ' onclick="championCompete(\'' + c.id + '\')">🏅 COMPETE<br><span style="font-size:10px;opacity:0.8;">-' + fatigueCost + ' fatigue</span>' + penaltyLine + '</button>';
    }

    html += '<div class="champion-comp-row' + (locked ? ' locked' : '') + '">' +
      '<div class="champion-comp-info">' +
        '<span class="champion-comp-icon">' + c.icon + '</span>' +
        '<div>' +
          '<div class="champion-comp-name">' + c.name + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);">' + c.desc + '</div>' +
          (state.wins + state.losses > 0 ? '<div style="font-size:11px;color:var(--text-dim);margin-top:2px;">Record: ' + state.wins + 'W · ' + state.losses + 'L</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="champion-comp-details">' +
        '<div style="text-align:right;">' +
          '<div style="color:var(--accent);font-weight:700;">' + fmtMoney(Math.ceil(c.reward * rewardMult)) + '</div>' +
          '<div style="font-size:11px;color:var(--text-dim);">+' + Math.ceil(c.repReward * getSkillEffect('compRepMult')) + '⭐</div>' +
        '</div>' +
        '<div class="champ-chance-badge" style="background:' + chanceColor + '20;color:' + chanceColor + ';border:1px solid ' + chanceColor + ';">' + chancePct + '%</div>' +
      '</div>' +
      '<div class="champion-comp-action">' + actionHTML + '</div>' +
    '</div>';
  });
  html += '</div>'; // champion-comp-list

  // ===== GRAND TOURNAMENTS (high-risk circuit) =====
  html += renderGrandTournaments(champBusy, injured, inCamp, now);

  html += '</div>'; // champ-sheet

  container.innerHTML = html;
}

// Grand Tournaments circuit section: prep (Readiness%) → compete → multi-day cooldown → injury
function renderGrandTournaments(champBusy, injured, inCamp, now) {
  var html = '';
  html += '<div class="champ-section-title">🌟 Grand Tournaments <span style="font-size:13px;color:var(--cyan);font-weight:400;">— big scores: prepare, risk it, wait days</span></div>';
  html += '<p style="font-size:12px;color:var(--text-muted);margin:0 0 12px;">Rare, sky-high reward events. Stack up your readiness before going in: more Readiness = higher win chance and lower injury risk.</p>';
  html += '<div class="grand-list">';

  GRAND_TOURNAMENTS.forEach(function(t) {
    var state = getGrandState(t.id);
    var lockReason = getGrandLockReason(t);
    var locked = !!lockReason;
    var onCooldown = now < state.cooldownUntil;
    var prep = getGrandPrep(t.id);
    var readiness = getGrandReadiness(t);
    var hasPasajes = !!prep.pasajes;
    var winChance = getGrandWinChance(t);
    var injuryChance = getGrandInjuryChance(t);
    var rewardMoney = Math.max(Math.ceil(t.reward.money), Math.ceil(getIncomePerSecond() * t.floorSecs));

    var winColor = winChance >= 0.7 ? 'var(--green)' : winChance >= 0.45 ? 'var(--accent)' : 'var(--red)';
    var injColor = injuryChance <= 0.08 ? 'var(--green)' : injuryChance <= 0.2 ? 'var(--accent)' : 'var(--red)';

    html += '<div class="grand-card' + (locked ? ' locked' : '') + '">';

    // Header
    html += '<div class="grand-head">';
    html += '<span class="grand-icon">' + t.icon + '</span>';
    html += '<div class="grand-head-info">';
    html += '<div class="grand-name">' + t.name + '</div>';
    html += '<div class="grand-desc">' + t.desc + '</div>';
    html += '<div class="grand-meta">⏱️ Cooldown ' + fmtTime(t.cooldown) + ' · 🎫 Entry ' + fmtMoney(t.entryFee) +
      (state.wins + state.losses > 0 ? ' · 🏆 ' + state.wins + 'W·' + state.losses + 'L' : '') + '</div>';
    html += '</div>';
    html += '</div>';

    if (locked) {
      html += '<div class="grand-locked-msg">🔒 Requirement: <strong>' + lockReason + '</strong></div>';
      html += '</div>'; // grand-card
      return;
    }

    // Reward + odds row
    html += '<div class="grand-stats-row">';
    html += '<div class="grand-stat"><span class="grand-stat-lbl">Reward (win)</span><span class="grand-stat-val" style="color:var(--accent);">' + fmtMoney(rewardMoney) + ' · +' + Math.ceil(t.reward.rep) + '⭐</span></div>';
    html += '<div class="grand-stat"><span class="grand-stat-lbl">Win chance</span><span class="grand-stat-val" style="color:' + winColor + ';">' + Math.round(winChance * 100) + '%</span></div>';
    html += '<div class="grand-stat"><span class="grand-stat-lbl">Injury risk</span><span class="grand-stat-val" style="color:' + injColor + ';">' + Math.round(injuryChance * 100) + '%</span></div>';
    html += '</div>';

    // Readiness bar
    var readyColor = readiness >= 80 ? 'var(--green)' : readiness >= 40 ? 'var(--accent)' : 'var(--red)';
    html += '<div class="grand-ready-row">';
    html += '<span style="font-size:12px;color:var(--text-dim);">Readiness</span>';
    html += '<div class="grand-ready-bar"><div class="grand-ready-fill" style="width:' + readiness + '%;background:' + readyColor + ';"></div></div>';
    html += '<span style="font-size:12px;font-weight:700;color:' + readyColor + ';">' + readiness + '%</span>';
    html += '</div>';

    // Prep items
    html += '<div class="grand-prep-grid">';
    GRAND_PREP_ITEMS.forEach(function(it) {
      var done = isGrandPrepItemDone(t, it.id);
      var cost = getGrandPrepItemCost(t, it);
      var isCampRunning = it.id === 'concentracion' && prep.concentracionUntil > 0 && now < prep.concentracionUntil;
      var canAfford = game.money >= cost;
      var statusHtml;
      if (done) {
        statusHtml = '<span class="grand-prep-done">✅ Done</span>';
      } else if (isCampRunning) {
        var left = Math.ceil((prep.concentracionUntil - now) / 1000);
        statusHtml = '<span class="grand-prep-running">⏳ ' + fmtTime(left) + '</span>';
      } else {
        var disabled = (!canAfford || injured || (it.id === 'concentracion' && champBusy)) ? 'disabled' : '';
        statusHtml = '<button class="btn btn-small btn-buy grand-prep-btn" ' + disabled +
          ' onclick="buyGrandPrep(\'' + t.id + '\',\'' + it.id + '\')">' + fmtMoney(cost) + '</button>';
      }
      html += '<div class="grand-prep-item' + (done ? ' done' : '') + '">' +
        '<div class="grand-prep-top"><span>' + it.icon + ' <strong>' + it.name + '</strong>' + (it.required ? ' <span style="color:var(--red);font-size:10px;">*required</span>' : '') + '</span>' +
        '<span style="font-size:11px;color:var(--cyan);">+' + it.readiness + '%</span></div>' +
        '<div class="grand-prep-desc">' + it.desc + '</div>' +
        '<div class="grand-prep-action">' + statusHtml + '</div>' +
      '</div>';
    });
    html += '</div>'; // grand-prep-grid

    // Compete button / status
    html += '<div class="grand-compete-row">';
    if (onCooldown) {
      var cd = Math.ceil((state.cooldownUntil - now) / 1000);
      html += '<div class="grand-cooldown">⏱️ Next attempt in <strong>' + fmtTime(cd) + '</strong></div>';
    } else if (injured) {
      html += '<div class="grand-cooldown" style="color:var(--red);">🤕 Your champion is injured</div>';
    } else if (inCamp) {
      html += '<div class="grand-cooldown" style="color:var(--cyan);">🏕️ Wait for the training camp to finish</div>';
    } else {
      var canEnter = hasPasajes && game.money >= t.entryFee && !champBusy && (game.champion.fatigue || 0) < CHAMPION_FATIGUE_THRESHOLD;
      var hint = !hasPasajes ? '✈️ You need Flights and Visa' : game.money < t.entryFee ? '💸 Missing entry fee (' + fmtMoney(t.entryFee) + ')' : (game.champion.fatigue || 0) >= CHAMPION_FATIGUE_THRESHOLD ? '😴 Champion exhausted' : '';
      html += '<button class="btn btn-buy grand-compete-btn" ' + (canEnter ? '' : 'disabled') +
        ' onclick="attemptGrandTournament(\'' + t.id + '\')">🥊 COMPETE — ' + fmtMoney(t.entryFee) + '</button>';
      if (hint) html += '<span class="grand-hint">' + hint + '</span>';
    }
    html += '</div>';

    html += '</div>'; // grand-card
  });

  html += '</div>'; // grand-list
  return html;
}

// Grand Tournament result modal (reuses the events overlay)
function showGrandResult(r) {
  var overlay = document.getElementById('eventOverlay');
  var card = document.getElementById('eventCard');
  if (!overlay || !card) return;
  var t = r.tournament;

  var headIcon, headTitle, headColor;
  if (r.won && !r.injured) { headIcon = '🏆'; headTitle = 'GLORIOUS VICTORY!'; headColor = 'var(--green)'; }
  else if (r.won && r.injured) { headIcon = '🏆🤕'; headTitle = 'You won, but got injured!'; headColor = 'var(--accent)'; }
  else if (!r.won && r.injured) { headIcon = '🤕'; headTitle = 'Loss with injury'; headColor = 'var(--red)'; }
  else { headIcon = '😤'; headTitle = 'Honorable defeat'; headColor = 'var(--accent)'; }

  var lines = [];
  if (r.money) lines.push('<div class="grand-result-line">💰 <strong style="color:var(--accent);">+' + fmtMoney(r.money) + '</strong></div>');
  if (r.rep) lines.push('<div class="grand-result-line">⭐ +' + r.rep + ' reputation</div>');
  if (r.xp) lines.push('<div class="grand-result-line">✨ +' + r.xp + ' XP</div>');
  if (r.champXp) lines.push('<div class="grand-result-line">🏅 +' + r.champXp + ' champion XP</div>');
  if (r.injured) lines.push('<div class="grand-result-line" style="color:var(--red);">🤕 Injured: out of action ~' + fmtTime(r.injurySecs) + '</div>');
  if (r.newTitle) lines.push('<div class="grand-result-line" style="color:var(--cyan);">👑 Title unlocked: <strong>' + r.newTitle + '</strong>!</div>');
  if (!lines.length) lines.push('<div class="grand-result-line" style="color:var(--text-dim);">No rewards this time.</div>');

  card.innerHTML =
    '<div class="event-icon">' + headIcon + '</div>' +
    '<div class="event-title" style="color:' + headColor + ';">' + headTitle + '</div>' +
    '<div class="event-desc">' + t.icon + ' ' + t.name + '</div>' +
    '<div class="grand-result-lines">' + lines.join('') + '</div>' +
    '<div class="event-choices"><div class="event-choice" onclick="closeGrandResult()"><div class="event-choice-main"><span class="event-choice-text">Continue</span></div></div></div>';

  overlay.classList.remove('hidden');
  window._grandResultOpen = true;
}

function closeGrandResult() {
  var overlay = document.getElementById('eventOverlay');
  if (overlay) overlay.classList.add('hidden');
  window._grandResultOpen = false;
}

// Show/hide rename form
function showChampionRename() {
  var form = document.getElementById('champRenameForm');
  var input = document.getElementById('champRenameInput');
  if (form) {
    form.classList.toggle('hidden');
    if (input && !form.classList.contains('hidden')) {
      input.value = game.champion.name || 'Champion';
      input.focus();
    }
  }
}

function saveChampionRename() {
  var input = document.getElementById('champRenameInput');
  if (input) renameChampion(input.value);
  var form = document.getElementById('champRenameForm');
  if (form) form.classList.add('hidden');
}

function cancelChampionRename() {
  var form = document.getElementById('champRenameForm');
  if (form) form.classList.add('hidden');
}

// SVG generation removed — stub kept to avoid errors in old saves
function generateChampionSVG(appearance, stage, equipment) {
  return '';
}

// Normal competitions (without champion) — shown in champion tab before recruiting
function renderNormalCompetitions() {
  var html = '<div class="section-title" style="margin-top:20px;">🏆 Competitions</div>';
  html += '<p class="section-subtitle" style="margin-bottom:12px;">Send your members to compete for prizes and reputation.</p>';
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
      actionHTML = '<button class="btn btn-buy btn-small" onclick="enterCompetition(\'' + c.id + '\')">⚔️ COMPETE</button>';
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
  html += '<div class="profile-gym-name">' + (game.gymName || 'My Gym') + '</div>';
  html += '<div class="profile-title-badge">' + title.icon + ' ' + title.name + '</div>';
  html += '<div class="profile-tier">' + tier + '</div>';
  html += '</div>';
  html += '</div>';

  // Level + XP bar
  html += '<div class="profile-level-row">';
  html += '<span class="profile-level">Level ' + game.level + '</span>';
  html += '<div class="profile-xp-bar"><div class="profile-xp-fill" style="width:' + xpPct + '%"></div></div>';
  html += '<span class="profile-xp-text">' + game.xp + '/' + game.xpToNext + ' XP</span>';
  html += '</div>';

  // Prestige stars
  if (game.prestigeStars > 0) {
    var starsText = '';
    for (var s = 0; s < game.prestigeStars; s++) starsText += '⭐';
    html += '<div class="profile-stars">' + starsText + ' x' + (1 + game.prestigeStars * 0.25).toFixed(2) + ' income</div>';
  }

  // Current theme
  var theme = GYM_THEMES.find(function(t) { return t.id === game.decoration.theme; }) || GYM_THEMES[0];
  html += '<div class="profile-theme">' + theme.icon + ' Theme: ' + theme.name + '</div>';
  html += '</div>';

  // --- Titles Section ---
  html += '<div class="section-title" style="margin-top:16px;">🏅 Titles</div>';
  html += '<p class="section-subtitle">Choose your active title. It shows on your profile.</p>';
  html += '<div class="profile-titles-grid">';
  PLAYER_TITLES.forEach(function(t) {
    var unlocked = t.check();
    var isActive = game.profile.activeTitle === t.id;
    html += '<div class="profile-title-card' + (unlocked ? '' : ' locked') + (isActive ? ' active' : '') + '"' +
      (unlocked ? ' onclick="setActiveTitle(\'' + t.id + '\')"' : '') + '>';
    html += '<div class="profile-title-icon">' + t.icon + '</div>';
    html += '<div class="profile-title-name">' + t.name + '</div>';
    html += '<div class="profile-title-desc">' + (unlocked ? t.desc : '🔒 ' + t.desc) + '</div>';
    if (isActive) html += '<div class="profile-title-active">ACTIVE</div>';
    html += '</div>';
  });
  html += '</div>';

  // --- Stats Section ---
  html += '<div class="section-title" style="margin-top:16px;">📊 Stats</div>';
  html += '<div class="profile-stats-grid">';

  var stats = [
    { icon: '💰', label: 'Total earned', value: fmtMoney(game.totalMoneyEarned) },
    { icon: '🕐', label: 'Time played', value: formatPlayTime(game.stats.totalPlayTime || 0) },
    { icon: '📅', label: 'Days played', value: game.stats.daysPlayed || 0 },
    { icon: '👥', label: 'Max members', value: game.stats.maxMembers || 0 },
    { icon: '🏆', label: 'Competitions won', value: game.stats.competitionsWon || 0 },
    { icon: '🏅', label: 'Champion wins', value: game.stats.championWins || 0 },
    { icon: '🧘', label: 'Classes completed', value: game.stats.classesCompleted || 0 },
    { icon: '👨‍🏫', label: 'Instructors hired', value: game.stats.instructorsHired || 0 },
    { icon: '📢', label: 'Campaigns launched', value: game.stats.campaignsLaunched || 0 },
    { icon: '🧃', label: 'Supplements used', value: game.stats.supplementsBought || 0 },
    { icon: '🏪', label: 'Rivals beaten', value: game.stats.rivalsDefeated || 0 },
    { icon: '📋', label: 'Missions completed', value: game.stats.missionsCompleted || 0 },
    { icon: '⚡', label: 'Events resolved', value: game.stats.eventsHandled || 0 },
    { icon: '🔬', label: 'Upgrades researched', value: game.stats.skillsResearched || 0 },
    { icon: '🏗️', label: 'Zones unlocked', value: game.stats.zonesUnlocked || 0 },
    { icon: '⭐', label: 'VIPs served', value: game.stats.vipsServed || 0 },
    { icon: '🔥', label: 'Max streak', value: game.stats.maxStreak || 0 },
    { icon: '🏙️', label: 'Branches', value: Object.keys(game.branches).length },
    { icon: '🌟', label: 'Franchise stars', value: game.prestigeStars || 0 },
    { icon: '🎖️', label: 'Achievements', value: unlockedAchievements + '/' + ACHIEVEMENTS.length },
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
  html += '<div class="section-title" style="margin-top:16px;">🎖️ Recent Achievements</div>';
  html += '<div class="profile-achievements-showcase">';
  var unlocked = ACHIEVEMENTS.filter(function(a) { return game.achievements[a.id]; });
  var recent = unlocked.slice(-8).reverse();
  if (recent.length === 0) {
    html += '<p style="color:var(--text-muted);text-align:center;padding:16px;">You haven\'t unlocked any achievements yet.</p>';
  } else {
    recent.forEach(function(a) {
      html += '<div class="profile-achievement-badge" title="' + a.name + ': ' + a.desc + '">';
      html += '<span class="profile-badge-icon">' + a.icon + '</span>';
      html += '<span class="profile-badge-name">' + a.name + '</span>';
      html += '</div>';
    });
  }
  html += '</div>';
  html += '<button class="btn btn-small" onclick="document.querySelector(\'[data-tab=achievements]\').click()" style="margin-top:8px;">View all achievements →</button>';

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
  html += '<div class="section-title">🎨 Visual Themes</div>';
  html += '<p class="section-subtitle">Change the visual style of your whole gym. Themes persist through prestige.</p>';
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
      html += '<div class="deco-theme-status" style="color:var(--green);">✓ Active</div>';
    } else if (owned) {
      html += '<button class="btn btn-small btn-cyan" onclick="setTheme(\'' + theme.id + '\')">Use</button>';
    } else if (locked) {
      html += '<div class="deco-theme-status" style="color:var(--text-muted);">🔒 Level ' + theme.reqLevel + '</div>';
    } else {
      html += '<button class="btn btn-small btn-buy" ' + (canBuy ? '' : 'disabled') + ' onclick="buyTheme(\'' + theme.id + '\')">' + fmtMoney(theme.cost) + '</button>';
    }
    html += '</div>';
  });
  html += '</div>';

  // --- Decorations ---
  html += '<div class="section-title" style="margin-top:16px;">🏠 Decorative Items</div>';
  html += '<p class="section-subtitle">Buy decorations for your gym. They give passive bonuses. They reset with prestige.</p>';
  html += '<div class="deco-items-grid">';
  GYM_DECORATIONS.forEach(function(item) {
    var owned = game.decoration.items[item.id];
    var locked = game.level < item.reqLevel;
    var canBuy = !owned && !locked && game.money >= item.cost;

    var bonusText = Object.keys(item.bonuses).map(function(k) {
      var v = item.bonuses[k];
      if (k === 'capacity') return '+' + v + ' cap';
      var labels = { income: 'income', reputation: 'rep', classQuality: 'class quality', compReward: 'comp rewards' };
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

// ===== BALANCE PANEL (SimCity-style financial overview) =====
function openBalancePanel() {
  var modal = document.getElementById('balanceModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'balanceModal';
    modal.className = 'balance-overlay';
    document.body.appendChild(modal);
  }
  renderBalancePanel();
  modal.style.display = 'flex';
}

function closeBalancePanel() {
  var modal = document.getElementById('balanceModal');
  if (modal) modal.style.display = 'none';
}

function renderBalancePanel() {
  var modal = document.getElementById('balanceModal');
  if (!modal) return;

  // All values in PER GAME DAY (600 ticks = 10 min real)
  var D = 600; // ticks per game day

  // ===== INCOME BREAKDOWN =====
  var incomeItems = [];
  var totalBaseIncome = 0;

  // Equipment income
  EQUIPMENT.forEach(function(eq) {
    var lvl = game.equipment[eq.id] ? game.equipment[eq.id].level : 0;
    if (lvl <= 0) return;
    if (isEquipmentBroken(eq.id)) {
      incomeItems.push({ name: eq.icon + ' ' + eq.name + ' (LVL ' + lvl + ')', value: 0, note: '⚠️ Roto' });
      return;
    }
    var daily = eq.incomePerLevel * lvl * D;
    incomeItems.push({ name: eq.icon + ' ' + eq.name + ' (LVL ' + lvl + ')', value: daily });
    totalBaseIncome += daily;
  });

  // Zone income
  GYM_ZONES.forEach(function(z) {
    if (game.zones[z.id] && z.incomeBonus > 0) {
      var daily = z.incomeBonus * D;
      incomeItems.push({ name: z.icon + ' ' + z.name, value: daily });
      totalBaseIncome += daily;
    }
  });

  // Rival defeat bonuses
  var rivalIncome = getRivalIncomeBonus();
  if (rivalIncome > 0) {
    var daily = rivalIncome * D;
    incomeItems.push({ name: '🏪 Rivals defeated', value: daily });
    totalBaseIncome += daily;
  }

  // ===== MULTIPLIERS =====
  var multipliers = [];

  var eqSkillMult = getSkillEffect('equipIncomeMult');
  if (eqSkillMult > 1) multipliers.push({ name: '🔬 Equipment upgrade', value: eqSkillMult });

  STAFF.forEach(function(s) {
    if (game.staff[s.id] && game.staff[s.id].hired && s.incomeMult) {
      var eff = getStaffTotalEffect(s, 'incomeMult') * getSkillEffect('staffEffectMult');
      multipliers.push({ name: s.icon + ' ' + s.name, value: 1 + eff });
    }
  });

  if (hasSkill('st_synergy')) {
    var hiredCount = 0;
    STAFF.forEach(function(s) {
      if (game.staff[s.id] && game.staff[s.id].hired) {
        hiredCount++;
        if (game.staff[s.id].extras) hiredCount += game.staff[s.id].extras.length;
      }
    });
    var synergyBonus = hiredCount * SKILL_TREE.staff.skills.find(function(sk) { return sk.id === 'st_synergy'; }).effect.staffSynergyBonus;
    if (synergyBonus > 0) multipliers.push({ name: '🤝 Staff synergy (x' + hiredCount + ')', value: 1 + synergyBonus });
  }

  var memberIncomeMult = getSkillEffect('memberIncomeMult');
  var memberBonus = Math.min(3.0, 1 + game.members * 0.002) * memberIncomeMult;
  if (memberBonus > 1) multipliers.push({ name: '👥 Member bonus (' + game.members + ')', value: memberBonus });

  var prestigeMult = 1 + (game.prestigeStars * 0.25);
  if (prestigeMult > 1) multipliers.push({ name: '🌟 Franchise (x' + game.prestigeStars + ')', value: prestigeMult });

  var suppEffects = getActiveSupplementEffects();
  if (suppEffects.incomeMult > 1) multipliers.push({ name: '🧃 Supplements (income)', value: suppEffects.incomeMult });
  if (suppEffects.equipIncomeMult > 1) multipliers.push({ name: '🧃 Supplements (equipment)', value: suppEffects.equipIncomeMult });

  var decoIncome = getDecorationBonus('income');
  if (decoIncome > 0) multipliers.push({ name: '🎨 Decoration', value: 1 + decoIncome });

  var finalIncomeDaily = getIncomePerSecond() * D;

  // ===== EXPENSE BREAKDOWN =====
  var expenseItems = [];
  var totalExpenses = 0;

  // Staff salaries (already per day)
  STAFF.forEach(function(s) {
    var state = game.staff[s.id];
    if (!state || !state.hired) return;
    var sal = getStaffSalaryAtLevel(s.salary, state.level || 1);
    expenseItems.push({ name: s.icon + ' ' + s.name + ' (LVL ' + (state.level || 1) + ')', value: sal });
    totalExpenses += sal;
    if (state.extras) {
      state.extras.forEach(function(ex, i) {
        var exSal = getStaffSalaryAtLevel(s.salary, ex.level || 1);
        expenseItems.push({ name: s.icon + ' ' + s.name + ' #' + (i + 2) + ' (LVL ' + (ex.level || 1) + ')', value: exSal });
        totalExpenses += exSal;
      });
    }
  });

  // Operating costs (already per day)
  if (!game.ownProperty) {
    expenseItems.push({ name: '🏠 Base rent', value: OPERATING_COSTS.baseRent });
    totalExpenses += OPERATING_COSTS.baseRent;
    var extraZones = 0;
    GYM_ZONES.forEach(function(z) {
      if (z.id !== 'ground_floor' && game.zones[z.id]) extraZones++;
    });
    if (extraZones > 0) {
      var zoneRent = extraZones * OPERATING_COSTS.rentPerExtraZone;
      expenseItems.push({ name: '🏗️ Zone rent (x' + extraZones + ')', value: zoneRent });
      totalExpenses += zoneRent;
    }
  } else {
    expenseItems.push({ name: '🏠 Property owned', value: 0, note: '✅ No rent' });
  }

  var totalEquipLevels = 0;
  EQUIPMENT.forEach(function(eq) { totalEquipLevels += (game.equipment[eq.id] ? game.equipment[eq.id].level : 0); });
  if (totalEquipLevels > 0) {
    var utilities = totalEquipLevels * OPERATING_COSTS.utilitiesPerEquipLevel;
    expenseItems.push({ name: '⚡ Utilities (' + totalEquipLevels + ' equip lvls)', value: utilities });
    totalExpenses += utilities;
  }

  // Marketing campaign costs (convert to per day)
  if (typeof MARKETING_CAMPAIGNS !== 'undefined') {
    MARKETING_CAMPAIGNS.forEach(function(mc) {
      if (mc.type !== 'always_on') return;
      var state = game.marketing[mc.id];
      if (!state || !state.active) return;
      var costDaily = mc.costPerDay;
      if (game.staff.manager && game.staff.manager.hired && !isStaffSick('manager', 0)) costDaily *= 0.8;
      costDaily *= getSkillEffect('campaignCostMult');
      expenseItems.push({ name: mc.icon + ' ' + mc.name, value: costDaily });
      totalExpenses += costDaily;
    });
  }

  // Utilities and taxes (% of gross income) — scales with income
  var overheadDaily = (typeof getIncomeOverheadPerSecond === 'function') ? getIncomeOverheadPerSecond() * D : 0;
  if (overheadDaily > 0) {
    expenseItems.push({ name: '🧾 Utilities and taxes (' + Math.round((OPERATING_COSTS.overheadRate || 0) * 100) + '% income)', value: overheadDaily });
    totalExpenses += overheadDaily;
  }

  // ===== NET =====
  var netDaily = finalIncomeDaily - totalExpenses;
  var netPerSec = netDaily / D;

  // ===== BUILD HTML =====
  var html = '<div class="balance-card">';
  html += '<div class="balance-header">';
  html += '<h3>📊 Financial Balance</h3>';
  html += '<div class="balance-header-right">';
  html += '<span class="balance-period">per game day (10 min)</span>';
  html += '<button class="btn btn-small btn-red" onclick="closeBalancePanel()">✕</button>';
  html += '</div>';
  html += '</div>';

  // Income section
  html += '<div class="balance-section">';
  html += '<div class="balance-section-title income">💰 BASE INCOME</div>';
  if (incomeItems.length === 0) {
    html += '<div class="balance-row"><span class="balance-label muted">No equipment</span></div>';
  }
  incomeItems.forEach(function(item) {
    html += '<div class="balance-row">';
    html += '<span class="balance-label">' + item.name + '</span>';
    if (item.note) {
      html += '<span class="balance-value muted">' + item.note + '</span>';
    } else {
      html += '<span class="balance-value income">+' + fmtMoney(item.value) + '</span>';
    }
    html += '</div>';
  });
  html += '<div class="balance-subtotal income">Subtotal: +' + fmtMoney(totalBaseIncome) + '/day</div>';
  html += '</div>';

  // Multipliers section
  if (multipliers.length > 0) {
    html += '<div class="balance-section">';
    html += '<div class="balance-section-title mult">✨ MULTIPLIERS</div>';
    multipliers.forEach(function(m) {
      html += '<div class="balance-row">';
      html += '<span class="balance-label">' + m.name + '</span>';
      html += '<span class="balance-value mult">×' + m.value.toFixed(2) + '</span>';
      html += '</div>';
    });
    html += '<div class="balance-subtotal income">Final income: +' + fmtMoney(finalIncomeDaily) + '/day</div>';
    html += '</div>';
  }

  // Expenses section
  html += '<div class="balance-section">';
  html += '<div class="balance-section-title expense">📉 EXPENSES</div>';
  if (expenseItems.length === 0) {
    html += '<div class="balance-row"><span class="balance-label muted">No expenses</span></div>';
  }
  expenseItems.forEach(function(item) {
    html += '<div class="balance-row">';
    html += '<span class="balance-label">' + item.name + '</span>';
    if (item.note) {
      html += '<span class="balance-value muted">' + item.note + '</span>';
    } else {
      html += '<span class="balance-value expense">-' + fmtMoney(item.value) + '</span>';
    }
    html += '</div>';
  });
  html += '<div class="balance-subtotal expense">Total expenses: -' + fmtMoney(totalExpenses) + '/day</div>';
  html += '</div>';

  // Net total
  html += '<div class="balance-net ' + (netDaily >= 0 ? 'positive' : 'negative') + '">';
  html += '<span>NET BALANCE /DAY</span>';
  html += '<span>' + (netDaily >= 0 ? '+' : '') + fmtMoney(netDaily) + '</span>';
  html += '</div>';

  // Per second
  html += '<div class="balance-projection">';
  html += '<span>Equivalent per second:</span>';
  html += '<span class="' + (netPerSec >= 0 ? 'income' : 'expense') + '">' + (netPerSec >= 0 ? '+' : '') + fmtMoney(netPerSec) + '/s</span>';
  html += '</div>';

  // Franchise section (passive branches)
  if (game.branches && Object.keys(game.branches).length > 0) {
    html += '<div class="balance-section" style="margin-top:12px;">';
    html += '<div class="balance-section-title income">🏙️ FRANCHISE (Passive Branches)</div>';
    var passiveTotal = 0;
    Object.keys(game.branches).forEach(function(id) {
      var b = game.branches[id];
      var bHood = NEIGHBORHOODS.find(function(n) { return n.id === b.neighborhoodId; }) || NEIGHBORHOODS[0];
      var passive = getBranchPassiveIncome(id);
      passiveTotal += passive;
      html += '<div class="balance-row"><span class="balance-label">' + bHood.icon + ' ' + (b.name || 'Branch') + ' (Lv.' + (b.level || 1) + ')</span><span class="balance-value income">+' + fmtMoney(passive * D) + '/day</span></div>';
    });
    html += '<div class="balance-subtotal income">Total passive income: +' + fmtMoney(passiveTotal * D) + '/day</div>';
    html += '</div>';

    html += '<div class="balance-net positive">';
    html += '<span>TOTAL EMPIRE /SEC</span>';
    html += '<span>+' + fmtMoney(getTotalEmpireIncomePerSecond()) + '/s</span>';
    html += '</div>';
  }

  html += '</div>';
  modal.innerHTML = html;
}
