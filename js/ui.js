// ===== IRON EMPIRE - UI RENDERING =====

// ===== RENDER LOG =====
var _logFilter = 'all';

function setLogFilter(f) {
  _logFilter = f;
  // Update active button
  document.querySelectorAll('.log-filter-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.filter === f);
  });
  renderLog();
}

function renderLog() {
  const container = document.getElementById('logContainer');
  if (!container) return;

  var entries = game.log;
  if (_logFilter === 'important') {
    entries = entries.filter(function(l) { return l.level === 'important' || l.level === 'critical'; });
  } else if (_logFilter === 'critical') {
    entries = entries.filter(function(l) { return l.level === 'critical'; });
  }

  if (entries.length === 0) {
    container.innerHTML = '<div class="log-empty">No hay eventos de este tipo aún.</div>';
    return;
  }

  container.innerHTML = entries.map(function(l) {
    var lvlClass = l.level === 'critical' ? ' log-critical' : l.level === 'important' ? ' log-important' : '';
    return '<div class="log-entry' + lvlClass + '"><span class="time">' + l.time + '</span>' + l.msg + '</div>';
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
      var repairTitle = canAffordRepair ? '' : ' title="Necesitás ' + fmtMoney(repairCost - game.money) + ' más para reparar"';
      breakdownHTML = '<div class="equip-broken-badge">⚠️ FUERA DE SERVICIO</div>';
      btnHTML = '<button class="btn btn-red" ' + (canAffordRepair ? '' : 'disabled') + repairTitle +
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
      var buyTitle = canAfford ? '' : ' title="Necesitás ' + fmtMoney(cost - game.money) + ' más"';
      btnHTML = '<button class="btn ' + (isNew ? 'btn-buy' : 'btn-upgrade') + '" ' +
        (canAfford ? '' : 'disabled') + buyTitle +
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
      var hireTitle = canAfford ? '' : ' title="Necesitás ' + fmtMoney(cost - game.money) + ' más"';
      btnHTML = '<button class="btn btn-purple" ' + (canAfford ? '' : 'disabled') + hireTitle + ' onclick="hireStaff(\'' + s.id + '\')">CONTRATAR — ' + fmtMoney(cost) + '</button>';
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
          var extraTitle = canAffordExtra ? '' : ' title="Necesitás ' + fmtMoney(extraCost - game.money) + ' más"';
          copiesHTML += '<button class="btn btn-cyan btn-small" style="margin-top:6px;width:100%;" ' + (canAffordExtra ? '' : 'disabled') + extraTitle +
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
      addLog('🎖️ Logro desbloqueado: <span class="highlight">' + a.name + '</span>', 'important');
      addXp(50);
      game.dailyTracking.xpEarned += 50;
    }
  });
  renderAchievements();
}

// ===== UPDATE UI =====
var _prevStats = {};
var _prevNetIncome = null;
var _prevTier = null;

function _pulseStatBox(id) {
  var box = document.getElementById(id);
  if (!box) return;
  var parent = box.closest('.stat-box');
  if (!parent) return;
  parent.classList.remove('stat-pulse');
  void parent.offsetWidth; // reflow to restart animation
  parent.classList.add('stat-pulse');
}

// ===== NEXT GOAL BANNER =====
function renderNextGoal() {
  var el = document.getElementById('nextGoalBanner');
  if (!el) return;
  if (!game.started || !game.tutorialDone) { el.innerHTML = ''; return; }

  var goal = _getNextGoal();
  if (!goal) { el.innerHTML = ''; return; }

  el.innerHTML =
    '<span class="next-goal-pin">📌</span>' +
    '<span class="next-goal-text">' + goal.text + '</span>' +
    (goal.tab ? '<button class="btn btn-small btn-cyan next-goal-btn" onclick="switchTab(\'' + goal.tab + '\')">Ver →</button>' : '');
}

function _getNextGoal() {
  // 1. Unowned equipment within reach
  var unowned = EQUIPMENT.filter(function(e) {
    return game.level >= e.reqLevel && !(game.equipment[e.id] && game.equipment[e.id].level > 0);
  });
  if (unowned.length > 0) {
    var eq = unowned[0];
    if (game.money >= eq.baseCost) {
      return { text: 'Comprá <strong>' + eq.name + '</strong> ' + eq.icon + ' para +' + fmtMoney(eq.incomePerLevel) + '/s', tab: 'equipment' };
    }
    if (game.money >= eq.baseCost * 0.5) {
      return { text: 'Ahorrando para <strong>' + eq.name + '</strong> — faltan ' + fmtMoney(eq.baseCost - game.money), tab: 'equipment' };
    }
  }

  // 2. No staff at all
  if (!STAFF.some(function(s) { return game.staff[s.id] && game.staff[s.id].hired; })) {
    var s = STAFF.find(function(st) { return game.level >= st.reqLevel; });
    if (s) return { text: 'Contratá <strong>' + s.name + '</strong> para potenciar tus máquinas', tab: 'staff' };
  }

  // 3. No always-on marketing active
  if (game.level >= 2) {
    var hasMarketing = typeof MARKETING_CAMPAIGNS !== 'undefined' && MARKETING_CAMPAIGNS.some(function(mc) {
      if (mc.type !== 'always-on') return false;
      var st = game.marketing[mc.id];
      return st && st.activeUntil && Date.now() < st.activeUntil;
    });
    if (!hasMarketing) return { text: 'Activá una campaña de marketing para atraer más miembros', tab: 'marketing' };
  }

  // 4. Affordable equipment upgrade
  var upgradeTarget = null;
  EQUIPMENT.forEach(function(e) {
    if (upgradeTarget) return;
    var st = game.equipment[e.id];
    if (!st || !st.level || st.level >= game.level) return;
    if (st.upgradingUntil > 0 || st.brokenUntil === -1) return;
    var cost = getEquipCost(e, st.level);
    if (game.money >= cost) upgradeTarget = { name: e.name, nextLevel: st.level + 1 };
  });
  if (upgradeTarget) return { text: 'Mejorá <strong>' + upgradeTarget.name + '</strong> a Nivel ' + upgradeTarget.nextLevel, tab: 'equipment' };

  // 5. XP close to level-up
  var xpPct = Math.round((game.xp / game.xpToNext) * 100);
  if (xpPct >= 65) {
    var nextLvl = game.level + 1;
    var unlockTab = typeof TAB_UNLOCK_LEVELS !== 'undefined' ?
      Object.keys(TAB_UNLOCK_LEVELS).find(function(t) { return TAB_UNLOCK_LEVELS[t] === nextLvl; }) : null;
    var hint = unlockTab ? ' · desbloquea <strong>' + unlockTab + '</strong>' : '';
    return { text: '¡Casi Nivel ' + nextLvl + '! (' + xpPct + '% XP)' + hint };
  }

  // 6. Zone buildable
  if (game.level >= 5 && typeof GYM_ZONES !== 'undefined') {
    var nextZone = GYM_ZONES.find(function(z) {
      return z.id !== 'ground_floor' && !game.zones[z.id] && !game.zoneBuilding[z.id] && game.level >= (z.reqLevel || 1);
    });
    if (nextZone) {
      if (game.money >= nextZone.cost) return { text: 'Construí <strong>' + nextZone.name + '</strong> para expandir capacidad', tab: 'expansion' };
      if (game.money >= nextZone.cost * 0.4) return { text: 'Ahorrando para <strong>' + nextZone.name + '</strong> — faltan ' + fmtMoney(nextZone.cost - game.money), tab: 'expansion' };
    }
  }

  return null;
}

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

  // Income trend indicator
  var trendHTML = '';
  if (_prevNetIncome !== null) {
    var diff = netIncome - _prevNetIncome;
    if (Math.abs(diff) > 0.05) {
      trendHTML = diff > 0
        ? ' <span class="income-trend up">▲</span>'
        : ' <span class="income-trend down">▼</span>';
    }
  }
  _prevNetIncome = netIncome;

  // Stat boxes
  var el;
  el = document.getElementById('incomeBig');
  if (el) {
    var newIncomeText = (netIncome >= 0 ? '+' : '') + fmtMoney(netIncome) + '/s';
    if (_prevStats.income !== newIncomeText) {
      el.innerHTML = newIncomeText + trendHTML;
      el.style.color = netIncome >= 0 ? 'var(--green)' : 'var(--red)';
      if (_prevStats.income !== undefined) _pulseStatBox('incomeBig');
      _prevStats.income = newIncomeText;
    }
  }
  el = document.getElementById('expensesBig');
  if (el) {
    var totalExpenses = salaries + opCosts + getCampaignCostsPerSecond();
    var newExpText = '-' + fmtMoney(totalExpenses) + '/s';
    if (_prevStats.expenses !== newExpText) {
      el.textContent = newExpText;
      if (_prevStats.expenses !== undefined) _pulseStatBox('expensesBig');
      _prevStats.expenses = newExpText;
    }
  }
  el = document.getElementById('membersBig');
  if (el) {
    var newMembText = Math.floor(game.members) + ' / ' + Math.floor(game.maxMembers);
    if (_prevStats.members !== newMembText) {
      el.textContent = newMembText;
      if (_prevStats.members !== undefined) _pulseStatBox('membersBig');
      _prevStats.members = newMembText;
    }
  }
  var rivalStealEl = document.getElementById('rivalStealSub');
  if (rivalStealEl) {
    var steal = typeof getRivalMemberSteal === 'function' ? getRivalMemberSteal() : 0;
    rivalStealEl.textContent = steal > 0 ? '-' + steal + ' cap por rivales' : '';
  }
  el = document.getElementById('repBig');
  if (el) {
    var newRepText = fmt(Math.floor(game.reputation));
    if (_prevStats.rep !== newRepText) {
      el.textContent = newRepText;
      if (_prevStats.rep !== undefined) _pulseStatBox('repBig');
      _prevStats.rep = newRepText;
    }
  }
  el = document.getElementById('totalEarnedBig');
  if (el) el.textContent = fmtMoney(game.totalMoneyEarned);
  var empireStarEl = document.getElementById('empireStarSub');
  if (empireStarEl) {
    var stars = typeof getFranchiseStars === 'function' ? getFranchiseStars() : 0;
    var nextStarAt = (stars + 1) * (stars + 1) * 2000000;
    var remaining = nextStarAt - game.totalMoneyEarned;
    if (stars === 0) {
      empireStarEl.textContent = '⭐ Primera franquicia: te faltan ' + fmtMoney(Math.max(0, remaining));
    } else {
      var starStr = '';
      for (var s = 0; s < stars; s++) starStr += '⭐';
      empireStarEl.textContent = starStr + ' · Próxima: ' + fmtMoney(Math.max(0, remaining));
    }
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
  var currentTier = getGymTier();
  el = document.getElementById('gymTier');
  if (el) el.textContent = currentTier;
  // Detect tier-up
  if (_prevTier && _prevTier !== currentTier) {
    showToast('🏆', '¡Nuevo nivel de gym: ' + currentTier + '!');
    addLog('🏆 ¡Tu gym ascendió a <span class="highlight">' + currentTier + '</span>!', 'critical');
  }
  _prevTier = currentTier;

  // Update gym scene people count (lightweight, full render on renderAll)
  var memberCountEl = document.querySelector('.gym-member-count span');
  if (memberCountEl) memberCountEl.textContent = game.members;

  // Prestige stars (recalculate)
  var newStars = getPrestigeStars();
  if (newStars > game.prestigeStars) game.prestigeStars = newStars;

  // Branch indicator in header
  el = document.getElementById('branchIndicator');
  if (el) {
    var hood = typeof getActiveNeighborhood === 'function' ? getActiveNeighborhood() : null;
    if (hood) {
      el.textContent = '📍 ' + hood.name;
    }
  }

  // Tab notifications
  updateTabNotifications();

  // Next goal banner (every 5 seconds to avoid recalc every tick)
  if (game.tickCount % 5 === 0) renderNextGoal();

  // Missions reset countdown (Fix 15 - live update every tick)
  var mtimerEl = document.getElementById('missionsResetTimer');
  if (mtimerEl) {
    var mnow = new Date();
    var mtomorrow = new Date(mnow);
    mtomorrow.setHours(24, 0, 0, 0);
    var msecsLeft = Math.floor((mtomorrow - mnow) / 1000);
    mtimerEl.textContent = '⏰ Nuevas misiones en: ' + fmtTime(msecsLeft);
  }
}

// Fix 16: Save flash indicator
var _saveIndicatorTimeout = null;
function flashSaveIndicator() {
  var el = document.getElementById('saveIndicator');
  if (!el) return;
  el.classList.remove('hidden');
  if (_saveIndicatorTimeout) clearTimeout(_saveIndicatorTimeout);
  _saveIndicatorTimeout = setTimeout(function() {
    el.classList.add('hidden');
  }, 2000);
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
  if      (tier.indexOf('Garage') >= 0)                                               container.classList.add('tier-garage');
  else if (tier.indexOf('Principiante') >= 0 || tier.indexOf('Crecimiento') >= 0)    container.classList.add('tier-barrio');
  else if (tier.indexOf('Establecido') >= 0  || tier.indexOf('Profesional') >= 0)    container.classList.add('tier-comercial');
  else if (tier.indexOf('VIP') >= 0          || tier.indexOf('Premium') >= 0)        container.classList.add('tier-premium');
  else if (tier.indexOf('Elite') >= 0)                                                container.classList.add('tier-elite');
  else                                                                                container.classList.add('tier-imperio');

  // --- Equipment layer ---
  var equipLayer = document.getElementById('gymEquipLayer');
  if (equipLayer) {
    var ownedEquip = EQUIPMENT.filter(function(eq) {
      return (game.equipment[eq.id]?.level || 0) > 0;
    });

    // Empty state
    if (ownedEquip.length === 0) {
      equipLayer.innerHTML = '<div class="gym-empty-state">Comprá tu primera máquina<br>para ver el gym cobrar vida 🏋️</div>';
    } else {
      // Pre-defined positions for equipment (spread across the scene)
      var positions = [
        { left: '6%',  top: '44%' },   // dumbbells
        { left: '19%', top: '40%' },   // bench
        { left: '34%', top: '46%' },   // squat rack
        { left: '52%', top: '42%' },   // treadmill
        { left: '68%', top: '44%' },   // cables
        { left: '83%', top: '40%' },   // leg press
        { left: '12%', top: '60%' },   // smith
        { left: '30%', top: '63%' },   // pool
        { left: '50%', top: '60%' },   // sauna
        { left: '67%', top: '63%' },   // crossfit
        { left: '84%', top: '60%' },   // boxing
        { left: '50%', top: '18%' },   // spa (on wall)
      ];

      equipLayer.innerHTML = ownedEquip.map(function(eq) {
        var idx = EQUIPMENT.indexOf(eq);
        var pos = positions[idx] || { left: (5 + idx * 8) + '%', top: '50%' };
        var lvl = game.equipment[eq.id].level;
        var state = game.equipment[eq.id];

        // Size class based on level
        var sizeClass = lvl >= 10 ? ' xl' : lvl >= 5 ? ' lg' : '';

        // State class
        var stateClass = '';
        if (state.brokenUntil && Date.now() < state.brokenUntil) {
          stateClass = ' is-broken';
        } else if (state.upgradingUntil && Date.now() < state.upgradingUntil) {
          stateClass = ' is-upgrading';
        }

        return '<div class="gym-equip-item' + sizeClass + stateClass + '" style="left:' + pos.left + ';top:' + pos.top + ';" title="' + eq.name + ' Nv.' + lvl + (stateClass === ' is-broken' ? ' — ROTO' : stateClass === ' is-upgrading' ? ' — MEJORANDO' : '') + '">' +
          eq.icon + '<span class="equip-lvl">' + lvl + '</span></div>';
      }).join('');
    }
  }

  // --- People layer ---
  var peopleLayer = document.getElementById('gymPeopleLayer');
  if (peopleLayer) {
    // Show people proportional to members (max 10 visible, cap walking at 5)
    var visiblePeople = game.members <= 0 ? 0 : Math.min(Math.floor(game.members / 5) + 2, 10);

    // Regenerate seeds only when count changes
    if (_gymScenePeopleSeeds.length !== visiblePeople) {
      _gymScenePeopleSeeds = [];
      for (var i = 0; i < visiblePeople; i++) {
        _gymScenePeopleSeeds.push({
          type: Math.random(),      // walking vs working out
          topPct: 48 + Math.random() * 40,
          duration: 10 + Math.random() * 12,
          delay: Math.random() * -20,
          emoji: _randomPersonEmoji()
        });
      }
    }

    var walkCount = 0;
    var peopleHTML = _gymScenePeopleSeeds.map(function(seed, i) {
      var wantsWalking = seed.type > 0.4;
      var isWalking = wantsWalking && walkCount < 5;
      if (isWalking) {
        walkCount++;
        var dir = i % 2 === 0 ? 'walking-right' : 'walking-left';
        return '<div class="gym-person ' + dir + '" style="top:' + seed.topPct + '%;animation-duration:' + seed.duration + 's;animation-delay:' + seed.delay + 's;">' + seed.emoji + '</div>';
      } else {
        // Working out near equipment (lightweight scale animation)
        var leftPct = 10 + (i * 9) % 80;
        return '<div class="gym-person working-out" style="top:' + seed.topPct + '%;left:' + leftPct + '%;animation-delay:' + (i * 0.35) + 's;">' + seed.emoji + '</div>';
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

// ===== FLOATING INCOME =====
var _lastFloatTab = null;
function showFloatingIncome(amount) {
  // Only show when gym tab is visible
  var gymTab = document.getElementById('tab-gym');
  if (!gymTab || !gymTab.classList.contains('active')) return;

  // Anchor to the income stat box
  var anchor = document.getElementById('incomeBig');
  if (!anchor) return;

  var el = document.createElement('div');
  el.className = 'float-income' + (amount < 0 ? ' negative' : '');
  el.textContent = (amount >= 0 ? '+' : '') + fmtMoney(amount);

  // Position near the income box with slight random spread
  var rect = anchor.getBoundingClientRect();
  el.style.left = (rect.left + rect.width / 2 - 30 + (Math.random() * 40 - 20)) + 'px';
  el.style.top = (rect.top + window.scrollY - 10) + 'px';

  document.body.appendChild(el);
  // Remove after animation ends
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 1400);
}
