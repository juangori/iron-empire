// ===== IRON EMPIRE - UI RENDERING =====

// ===== RENDER LOG =====
function renderLog() {
  const container = document.getElementById('logContainer');
  if (!container) return;
  container.innerHTML = game.log.map(function(l) {
    return '<div class="log-entry"><span class="time">' + l.time + '</span>' + l.msg + '</div>';
  }).join('');
}

// ===== RENDER EQUIPMENT =====
function renderEquipment() {
  const grid = document.getElementById('equipmentGrid');
  if (!grid) return;

  grid.innerHTML = EQUIPMENT.map(function(eq) {
    var state = game.equipment[eq.id] || { level: 0 };
    var cost = getEquipCost(eq, state.level);
    var canAfford = game.money >= cost;
    var locked = game.level < eq.reqLevel;
    var isNew = state.level === 0;
    var atLevelCap = state.level >= game.level;
    var broken = state.brokenUntil === -1;
    var repairing = isEquipmentRepairing(eq.id);
    var upgrading = isEquipmentUpgrading(eq.id);

    var btnHTML = '';
    var breakdownHTML = '';

    if (broken) {
      // Broken - show repair button
      var repairCost = getRepairCost(eq, state.level);
      var canAffordRepair = game.money >= repairCost;
      breakdownHTML = '<div class="equip-broken-badge">⚠️ FUERA DE SERVICIO</div>';
      btnHTML = '<button class="btn btn-red" ' + (canAffordRepair ? '' : 'disabled') +
        ' onclick="repairEquipment(\'' + eq.id + '\')">🔧 REPARAR — ' + fmtMoney(repairCost) + '</button>';
    } else if (repairing) {
      // Repairing - show progress bar
      var duration = getRepairDuration(state.level) * 1000;
      var startTime = state.brokenUntil - duration;
      var elapsed = Date.now() - startTime;
      var pct = Math.min(100, (elapsed / duration) * 100);
      var remaining = Math.max(0, Math.ceil((state.brokenUntil - Date.now()) / 1000));
      var mins = Math.floor(remaining / 60);
      var secs = remaining % 60;
      breakdownHTML = '<div class="equip-broken-badge repairing">🔧 REPARANDO</div>';
      btnHTML = '<div class="equip-repair-bar"><div class="equip-repair-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="equip-repair-time">Listo en ' + mins + ':' + (secs < 10 ? '0' : '') + secs + '</div>';
    } else if (upgrading) {
      // Upgrading - show construction progress bar
      var upgDuration = getEquipUpgradeDuration(state.level) * 1000;
      var upgStart = state.upgradingUntil - upgDuration;
      var upgElapsed = Date.now() - upgStart;
      var upgPct = Math.min(100, (upgElapsed / upgDuration) * 100);
      var upgRemaining = Math.max(0, Math.ceil((state.upgradingUntil - Date.now()) / 1000));
      var upgMins = Math.floor(upgRemaining / 60);
      var upgSecs = upgRemaining % 60;
      breakdownHTML = '<div class="equip-upgrade-badge">🏗️ MEJORANDO A LVL ' + (state.level + 1) + '</div>';
      btnHTML = '<div class="equip-repair-bar"><div class="equip-upgrade-fill" style="width:' + upgPct + '%"></div></div>' +
        '<div class="equip-upgrade-time">Listo en ' + upgMins + ':' + (upgSecs < 10 ? '0' : '') + upgSecs + '</div>';
    } else if (locked) {
      btnHTML = '<div style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:8px;">🔒 Requiere Nivel ' + eq.reqLevel + '</div>';
    } else if (atLevelCap && state.level > 0) {
      btnHTML = '<div style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:8px;">⚠️ Máx. nivel del equipo = tu nivel (' + game.level + ')</div>';
    } else {
      btnHTML = '<button class="btn ' + (isNew ? 'btn-buy' : 'btn-upgrade') + '" ' +
        (canAfford ? '' : 'disabled') +
        ' onclick="buyEquipment(\'' + eq.id + '\')">' +
        (isNew ? '🛒 COMPRAR' : '⬆️ MEJORAR') + ' — ' + fmtMoney(cost) +
      '</button>';
    }

    var cardClass = 'equip-card';
    if (locked) cardClass += ' locked';
    if (broken) cardClass += ' broken';
    if (repairing) cardClass += ' repairing';
    if (upgrading) cardClass += ' upgrading';

    return (
      '<div class="' + cardClass + '">' +
        '<div class="equip-header">' +
          '<span class="equip-icon">' + eq.icon + '</span>' +
          (state.level > 0 ? '<span class="equip-level">LVL ' + state.level + (atLevelCap && !broken && !repairing ? ' (MAX)' : '') + '</span>' : '') +
        '</div>' +
        '<div class="equip-name">' + eq.name + '</div>' +
        breakdownHTML +
        '<div class="equip-desc">' + eq.desc + '</div>' +
        '<div class="equip-stats">' +
          '<div class="equip-stat">💰 <span class="val">+' + fmt(eq.incomePerLevel) + '/s</span></div>' +
          '<div class="equip-stat">👥 <span class="val">+' + eq.membersPerLevel + '</span></div>' +
          (eq.capacityPerLevel ? '<div class="equip-stat">📦 <span class="val">+' + eq.capacityPerLevel + '</span></div>' : '') +
        '</div>' +
        btnHTML +
      '</div>'
    );
  }).join('');
}

// ===== RENDER STAFF =====
function renderStaff() {
  const grid = document.getElementById('staffGrid');
  if (!grid) return;

  // Count total staff including extras
  var totalHired = 0;
  var totalSlots = STAFF.length;
  STAFF.forEach(function(s) {
    if (game.staff[s.id]?.hired) {
      totalHired++;
      if (game.staff[s.id].extras) totalHired += game.staff[s.id].extras.length;
    }
  });

  var totalSalary = getTotalStaffSalaryPerDay();
  var summaryHTML = '<div class="staff-summary">' +
    '<div class="staff-summary-stat"><span class="staff-summary-label">Personal activo</span><span class="staff-summary-value">' + totalHired + '</span></div>' +
    '<div class="staff-summary-stat"><span class="staff-summary-label">Sueldos (por día)</span><span class="staff-summary-value" style="color:var(--red);">-' + fmtMoney(totalSalary) + '</span></div>' +
    '<div class="staff-summary-stat"><span class="staff-summary-label">Sueldos (por seg)</span><span class="staff-summary-value" style="color:var(--red);">-' + fmtMoney(totalSalary / 600) + '/s</span></div>' +
  '</div>';

  var cardsHTML = STAFF.map(function(s) {
    var state = game.staff[s.id] || { hired: false };
    var cost = getStaffCost(s, 0);
    var canAfford = game.money >= cost;
    var locked = game.level < s.reqLevel;

    // Build hire or status section
    var btnHTML = '';
    if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px;">🔒 Requiere Nivel ' + s.reqLevel + '</div>';
    } else if (!state.hired) {
      btnHTML = '<button class="btn btn-purple" ' + (canAfford ? '' : 'disabled') + ' onclick="hireStaff(\'' + s.id + '\')">CONTRATAR — ' + fmtMoney(cost) + '</button>';
    }

    // If hired, show main copy + extras
    var copiesHTML = '';
    if (state.hired) {
      copiesHTML = _renderStaffCopy(s, state, 0);
      // Extra copies
      if (state.extras) {
        state.extras.forEach(function(ex, i) {
          copiesHTML += _renderStaffCopy(s, ex, i + 1);
        });
      }
      // Hire extra button
      var extraCount = (state.extras ? state.extras.length : 0) + 1;
      var nextCopyNum = extraCount + 1;
      var reqLvl = STAFF_EXTRA_UNLOCK[nextCopyNum];
      if (reqLvl) {
        if (game.level >= reqLvl) {
          var extraCost = getStaffCost(s, extraCount);
          var canAffordExtra = game.money >= extraCost;
          copiesHTML += '<button class="btn btn-cyan btn-small" style="margin-top:6px;width:100%;" ' + (canAffordExtra ? '' : 'disabled') +
            ' onclick="hireExtraStaff(\'' + s.id + '\')">➕ CONTRATAR #' + nextCopyNum + ' — ' + fmtMoney(extraCost) + '</button>';
        } else {
          copiesHTML += '<div style="color:var(--text-muted);font-size:11px;margin-top:6px;text-align:center;">🔒 #' + nextCopyNum + ' en Nivel ' + reqLvl + '</div>';
        }
      }
    }

    var salaryText = '';
    if (state.hired && s.salary) {
      var lvl = state.level || 1;
      salaryText = fmtMoney(getStaffSalaryAtLevel(s.salary, lvl)) + '/día';
    } else if (s.salary) {
      salaryText = fmtMoney(s.salary) + '/día';
    }

    return (
      '<div class="staff-card ' + (locked ? 'locked' : '') + ' ' + (state.hired ? 'hired' : '') + '">' +
        '<div class="staff-avatar">' + s.icon + '</div>' +
        '<div class="staff-name">' + s.name + '</div>' +
        '<div class="staff-role">' + s.role + '</div>' +
        '<div class="staff-effect">' + s.effect + '</div>' +
        (salaryText ? '<div class="staff-salary">💵 ' + salaryText + '</div>' : '') +
        btnHTML +
        copiesHTML +
      '</div>'
    );
  }).join('');

  grid.innerHTML = summaryHTML + cardsHTML;
}

function _renderStaffCopy(staffDef, copyState, copyIdx) {
  var level = copyState.level || 1;
  var isTraining = copyState.trainingUntil && Date.now() < copyState.trainingUntil;
  var isSick = copyState.sickUntil && Date.now() < copyState.sickUntil;

  var stateClass = isTraining ? ' training' : (isSick ? ' sick' : '');
  var html = '<div class="staff-copy' + stateClass + '">';

  // Level badge + status
  html += '<div class="staff-copy-header">';
  html += '<span class="staff-level-badge">LVL ' + level + '</span>';

  if (isSick) {
    html += '<span class="staff-copy-label" style="color:var(--orange);">🤒 Enfermo</span>';
  } else if (isTraining) {
    html += '<span class="staff-copy-label" style="color:var(--cyan);">⏳ Entrenando</span>';
  } else {
    html += '<span class="staff-copy-label">' + (copyIdx === 0 ? '✅ Activo' : '✅ #' + (copyIdx + 1)) + '</span>';
  }

  if (!isTraining && !isSick) {
    html += '<span class="staff-copy-salary">💵 ' + fmtMoney(getStaffSalaryAtLevel(staffDef.salary, level)) + '/día</span>';
  }
  html += '</div>';

  // Sick countdown + heal button
  if (isSick) {
    var remaining = Math.max(0, Math.ceil((copyState.sickUntil - Date.now()) / 1000));
    var mins = Math.floor(remaining / 60);
    var secs = remaining % 60;
    html += '<div class="staff-sick-time">Se recupera en ' + mins + ':' + (secs < 10 ? '0' : '') + secs + '</div>';
    var healCost = getHealCost(staffDef, level);
    var canAffordHeal = game.money >= healCost;
    html += '<button class="btn btn-red btn-small staff-train-btn" ' + (canAffordHeal ? '' : 'disabled') +
      ' onclick="healStaff(\'' + staffDef.id + '\',' + copyIdx + ')">💊 CURAR — ' + fmtMoney(healCost) + '</button>';
  }

  // Training progress bar
  if (isTraining) {
    var duration = getTrainingDuration(level + 1) * 1000;
    var startTime = copyState.trainingUntil - duration;
    var elapsed = Date.now() - startTime;
    var pct = Math.min(100, (elapsed / duration) * 100);
    var remaining = Math.max(0, Math.ceil((copyState.trainingUntil - Date.now()) / 1000));
    var mins = Math.floor(remaining / 60);
    var secs = remaining % 60;
    html += '<div class="staff-training-bar"><div class="staff-training-fill" style="width:' + pct + '%"></div></div>';
    html += '<div class="staff-training-time">→ LVL ' + (level + 1) + ' en ' + mins + ':' + (secs < 10 ? '0' : '') + secs + '</div>';
  }

  // Train button (if not training, not sick, and not max level)
  if (!isTraining && !isSick && level < STAFF_MAX_LEVEL) {
    var trainCost = getTrainingCost(staffDef, level);
    var canAfford = game.money >= trainCost;
    html += '<button class="btn btn-buy btn-small staff-train-btn" ' + (canAfford ? '' : 'disabled') +
      ' onclick="trainStaff(\'' + staffDef.id + '\',' + copyIdx + ')">📚 ENTRENAR → LVL ' + (level + 1) + ' — ' + fmtMoney(trainCost) + '</button>';
  } else if (!isTraining && !isSick && level >= STAFF_MAX_LEVEL) {
    html += '<div class="staff-max-level">⭐ NIVEL MÁXIMO</div>';
  }

  html += '</div>';
  return html;
}

// Competitions are now rendered in the champion tab (see systems.js renderChampion/renderNormalCompetitions)

// ===== RENDER ACHIEVEMENTS =====
function renderAchievements() {
  const grid = document.getElementById('achievementGrid');
  if (!grid) return;

  grid.innerHTML = ACHIEVEMENTS.map(function(a) {
    var unlocked = game.achievements[a.id];
    return (
      '<div class="achievement-card ' + (unlocked ? 'unlocked' : '') + '">' +
        '<div class="ach-icon">' + a.icon + '</div>' +
        '<div class="ach-name">' + a.name + '</div>' +
        '<div class="ach-desc">' + a.desc + '</div>' +
      '</div>'
    );
  }).join('');
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(function(a) {
    if (!game.achievements[a.id] && a.check()) {
      game.achievements[a.id] = true;
      showToast(a.icon, '¡Logro: ' + a.name + '!');
      addLog('🎖️ Logro desbloqueado: <span class="highlight">' + a.name + '</span>');
      game.xp += 50;
      game.dailyTracking.xpEarned += 50;
    }
  });
  renderAchievements();
}

// ===== UPDATE UI =====
function updateUI() {
  const income = getIncomePerSecond();
  const salaries = getStaffSalaryPerSecond();
  const opCosts = getOperatingCostsPerSecond();
  const netIncome = income - salaries - opCosts;

  // Header stats
  document.getElementById('moneyDisplay').textContent = fmtMoney(game.money);
  document.getElementById('membersDisplay').textContent = fmt(game.members);
  document.getElementById('repDisplay').textContent = fmt(game.reputation);
  document.getElementById('incomeDisplay').textContent = fmtMoney(netIncome) + '/s';

  // Stat boxes
  var el;
  el = document.getElementById('incomeBig');
  if (el) el.textContent = fmtMoney(netIncome);
  el = document.getElementById('membersBig');
  if (el) el.textContent = fmt(game.members);
  el = document.getElementById('capacityBig');
  if (el) el.textContent = game.members + ' / ' + game.maxMembers;
  el = document.getElementById('repBig');
  if (el) el.textContent = fmt(game.reputation);

  // Extra stat boxes
  el = document.getElementById('salaryBig');
  if (el) el.textContent = '-' + fmtMoney(getTotalStaffSalaryPerDay()) + '/día';
  el = document.getElementById('opCostsBig');
  if (el) {
    var opDaily = getOperatingCostsPerDay();
    el.textContent = '-' + fmtMoney(opDaily) + '/día';
  }
  el = document.getElementById('grossIncomeBig');
  if (el) el.textContent = fmtMoney(income);
  el = document.getElementById('totalEarnedBig');
  if (el) el.textContent = fmtMoney(game.totalMoneyEarned);
  el = document.getElementById('staffCountBig');
  if (el) {
    var totalStaff = 0;
    STAFF.forEach(function(s) {
      if (game.staff[s.id]?.hired) {
        totalStaff++;
        if (game.staff[s.id].extras) totalStaff += game.staff[s.id].extras.length;
      }
    });
    el.textContent = totalStaff;
  }
  el = document.getElementById('equipCountBig');
  if (el) {
    var totalEqLvl = 0;
    EQUIPMENT.forEach(function(eq) { totalEqLvl += (game.equipment[eq.id]?.level || 0); });
    el.textContent = totalEqLvl + ' niveles';
  }
  el = document.getElementById('tierBig');
  if (el) el.textContent = getGymTier();

  // Level
  document.getElementById('levelBadge').textContent = 'NIVEL ' + game.level;
  var xpPct = Math.floor((game.xp / game.xpToNext) * 100);
  document.getElementById('xpBar').style.width = xpPct + '%';
  var xpText = document.getElementById('xpBarText');
  if (xpText) xpText.textContent = xpPct + '%';

  // Gym visual
  el = document.getElementById('gymNameBanner');
  if (el) el.textContent = game.gymName.toUpperCase();
  el = document.getElementById('gymTier');
  if (el) el.textContent = getGymTier();

  // Update gym scene people count (lightweight, full render on renderAll)
  var memberCountEl = document.querySelector('.gym-member-count span');
  if (memberCountEl) memberCountEl.textContent = game.members;

  // Prestige
  el = document.getElementById('currentStars');
  if (el) {
    var starsText = '';
    for (var i = 0; i < Math.min(game.prestigeStars, 20); i++) starsText += '⭐';
    el.textContent = 'Estrellas actuales: ' + starsText + ' ' + game.prestigeStars;
  }
  el = document.getElementById('prestigeBonus');
  if (el) el.textContent = 'Multiplicador actual: x' + (1 + game.prestigeStars * 0.25).toFixed(2);
  el = document.getElementById('starsToGain');
  if (el) el.textContent = getPrestigeStars();

  // Tab notifications
  updateTabNotifications();
}

// ===== RENDER GYM SCENE (Animated) =====
var _gymScenePeopleSeeds = []; // persistent random seeds for people

function renderGymScene() {
  var scene = document.getElementById('gymScene');
  var container = document.querySelector('.gym-scene-container');
  if (!scene || !container) return;

  // --- Tier class ---
  var tier = getGymTier();
  container.className = 'gym-scene-container';
  if (tier.indexOf('Garage') >= 0) container.classList.add('tier-garage');
  else if (tier.indexOf('Barrio') >= 0) container.classList.add('tier-barrio');
  else if (tier.indexOf('Comercial') >= 0) container.classList.add('tier-comercial');
  else if (tier.indexOf('Premium') >= 0) container.classList.add('tier-premium');
  else if (tier.indexOf('Elite') >= 0) container.classList.add('tier-elite');
  else container.classList.add('tier-imperio');

  // --- Equipment layer ---
  var equipLayer = document.getElementById('gymEquipLayer');
  if (equipLayer) {
    var ownedEquip = EQUIPMENT.filter(function(eq) {
      return (game.equipment[eq.id]?.level || 0) > 0;
    });

    // Pre-defined positions for equipment (spread across the scene)
    var positions = [
      { left: '8%',  top: '42%' },   // dumbbells
      { left: '22%', top: '38%' },   // bench
      { left: '38%', top: '44%' },   // squat rack
      { left: '54%', top: '40%' },   // treadmill
      { left: '70%', top: '42%' },   // cables
      { left: '84%', top: '38%' },   // leg press
      { left: '14%', top: '60%' },   // smith
      { left: '32%', top: '62%' },   // pool
      { left: '50%', top: '58%' },   // sauna
      { left: '68%', top: '62%' },   // crossfit
      { left: '82%', top: '60%' },   // boxing
      { left: '50%', top: '22%' },   // spa (on wall)
    ];

    equipLayer.innerHTML = ownedEquip.map(function(eq) {
      var idx = EQUIPMENT.indexOf(eq);
      var pos = positions[idx] || { left: '50%', top: '50%' };
      var lvl = game.equipment[eq.id].level;
      return '<div class="gym-equip-item" style="left:' + pos.left + ';top:' + pos.top + ';" title="' + eq.name + ' LVL ' + lvl + '">' +
        eq.icon + '<span class="equip-lvl">' + lvl + '</span></div>';
    }).join('');
  }

  // --- People layer ---
  var peopleLayer = document.getElementById('gymPeopleLayer');
  if (peopleLayer) {
    // Show people proportional to members (max ~15 visible)
    var visiblePeople = Math.min(Math.floor(game.members / 5) + 1, 15);
    if (game.members <= 0) visiblePeople = 0;

    // Regenerate seeds only when count changes
    if (_gymScenePeopleSeeds.length !== visiblePeople) {
      _gymScenePeopleSeeds = [];
      for (var i = 0; i < visiblePeople; i++) {
        _gymScenePeopleSeeds.push({
          type: Math.random(),      // walking vs working out
          topPct: 48 + Math.random() * 40,
          duration: 8 + Math.random() * 14,
          delay: Math.random() * -20,
          emoji: _randomPersonEmoji()
        });
      }
    }

    var peopleHTML = _gymScenePeopleSeeds.map(function(seed, i) {
      var isWalking = seed.type > 0.4;
      if (isWalking) {
        var dir = i % 2 === 0 ? 'walking-right' : 'walking-left';
        return '<div class="gym-person ' + dir + '" style="top:' + seed.topPct + '%;animation-duration:' + seed.duration + 's;animation-delay:' + seed.delay + 's;">' + seed.emoji + '</div>';
      } else {
        // Working out near equipment
        var leftPct = 10 + (i * 7) % 80;
        return '<div class="gym-person working-out" style="top:' + seed.topPct + '%;left:' + leftPct + '%;animation-delay:' + (seed.delay * 0.3) + 's;">' + seed.emoji + '</div>';
      }
    }).join('');

    // Member count badge
    peopleHTML += '<div class="gym-member-count">👥 <span>' + game.members + '</span> miembros</div>';
    peopleLayer.innerHTML = peopleHTML;
  }

  // --- Staff layer ---
  var staffLayer = document.getElementById('gymStaffLayer');
  if (staffLayer) {
    var hiredStaff = STAFF.filter(function(s) { return game.staff[s.id]?.hired; });

    // Staff positions along the bottom-left area
    var staffPositions = [
      { left: '5%',  top: '55%' },
      { left: '92%', top: '50%' },
      { left: '16%', top: '70%' },
      { left: '88%', top: '68%' },
      { left: '45%', top: '72%' },
      { left: '60%', top: '50%' },
      { left: '30%', top: '52%' },
      { left: '75%', top: '70%' },
    ];

    staffLayer.innerHTML = hiredStaff.map(function(s, i) {
      var pos = staffPositions[i] || { left: (10 + i * 12) + '%', top: '65%' };
      return '<div class="gym-staff-member" style="left:' + pos.left + ';top:' + pos.top + ';animation-delay:' + (i * 0.4) + 's;" title="' + s.name + ' - ' + s.role + '">' +
        s.icon + '<span class="staff-tag">' + s.role.split(' ')[0] + '</span></div>';
    }).join('');
  }

  // --- Decoration layer ---
  var decoLayer = document.getElementById('gymDecoLayer');
  if (decoLayer && game.decoration) {
    var decoHTML = '';
    GYM_DECORATIONS.forEach(function(item) {
      if (game.decoration.items[item.id]) {
        var extraClass = '';
        if (item.id === 'led') extraClass = ' gym-deco-glow';
        if (item.id === 'piso') extraClass = ' gym-deco-floor';
        decoHTML += '<div class="gym-deco-item' + extraClass + '" style="left:' + item.position.left + ';top:' + item.position.top + ';" title="' + item.name + '">' + item.icon + '</div>';
      }
    });
    decoLayer.innerHTML = decoHTML;
  }
}

function _randomPersonEmoji() {
  var people = ['🧑','👨','👩','🧔','👱','🏃','🚶','💪','🧘','🤸'];
  return people[Math.floor(Math.random() * people.length)];
}
