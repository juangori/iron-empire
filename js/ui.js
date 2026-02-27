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

    return (
      '<div class="equip-card ' + (locked ? 'locked' : '') + '">' +
        '<div class="equip-header">' +
          '<span class="equip-icon">' + eq.icon + '</span>' +
          (state.level > 0 ? '<span class="equip-level">LVL ' + state.level + '</span>' : '') +
        '</div>' +
        '<div class="equip-name">' + eq.name + '</div>' +
        '<div class="equip-desc">' + eq.desc + '</div>' +
        '<div class="equip-stats">' +
          '<div class="equip-stat">💰 <span class="val">+' + fmt(eq.incomePerLevel) + '/s</span></div>' +
          '<div class="equip-stat">👥 <span class="val">+' + eq.membersPerLevel + '</span></div>' +
          (eq.capacityPerLevel ? '<div class="equip-stat">📦 <span class="val">+' + eq.capacityPerLevel + '</span></div>' : '') +
        '</div>' +
        (locked ? '<div style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:8px;">Requiere Nivel ' + eq.reqLevel + '</div>' :
          '<button class="btn ' + (isNew ? 'btn-buy' : 'btn-upgrade') + '" ' +
            (canAfford ? '' : 'disabled') +
            ' onclick="buyEquipment(\'' + eq.id + '\')">' +
            (isNew ? '🛒 COMPRAR' : '⬆️ MEJORAR') + ' — ' + fmtMoney(cost) +
          '</button>'
        ) +
      '</div>'
    );
  }).join('');
}

// ===== RENDER STAFF =====
function renderStaff() {
  const grid = document.getElementById('staffGrid');
  if (!grid) return;

  // Staff summary at top
  var hiredCount = STAFF.filter(function(s) { return game.staff[s.id]?.hired; }).length;
  var totalSalary = getTotalStaffSalaryPerDay();
  var summaryHTML = '<div class="staff-summary">' +
    '<div class="staff-summary-stat"><span class="staff-summary-label">Personal contratado</span><span class="staff-summary-value">' + hiredCount + ' / ' + STAFF.length + '</span></div>' +
    '<div class="staff-summary-stat"><span class="staff-summary-label">Sueldos (por día)</span><span class="staff-summary-value" style="color:var(--red);">-' + fmtMoney(totalSalary) + '</span></div>' +
    '<div class="staff-summary-stat"><span class="staff-summary-label">Sueldos (por seg)</span><span class="staff-summary-value" style="color:var(--red);">-' + fmtMoney(totalSalary / 600) + '/s</span></div>' +
  '</div>';

  var cardsHTML = STAFF.map(function(s) {
    var state = game.staff[s.id] || { hired: false };
    var cost = getStaffCost(s);
    var canAfford = game.money >= cost;
    var locked = game.level < s.reqLevel;

    var btnHTML = '';
    if (locked) {
      btnHTML = '<div style="color:var(--text-muted);font-size:12px;text-align:center;margin-top:8px;">🔒 Requiere Nivel ' + s.reqLevel + '</div>';
    } else if (state.hired) {
      btnHTML = '<button class="btn btn-green" disabled>✅ CONTRATADO</button>';
    } else {
      btnHTML = '<button class="btn btn-purple" ' + (canAfford ? '' : 'disabled') + ' onclick="hireStaff(\'' + s.id + '\')">CONTRATAR — ' + fmtMoney(cost) + '</button>';
    }

    var salaryHTML = s.salary ? '<div class="staff-salary">💵 Sueldo: ' + fmtMoney(s.salary) + '/día</div>' : '';

    return (
      '<div class="staff-card ' + (locked ? 'locked' : '') + ' ' + (state.hired ? 'hired' : '') + '">' +
        '<div class="staff-avatar">' + s.icon + '</div>' +
        '<div class="staff-name">' + s.name + '</div>' +
        '<div class="staff-role">' + s.role + '</div>' +
        '<div class="staff-effect">' + s.effect + '</div>' +
        salaryHTML +
        (state.hired ? '<div class="staff-status">✅ Activo</div>' : '') +
        btnHTML +
      '</div>'
    );
  }).join('');

  grid.innerHTML = summaryHTML + cardsHTML;
}

// ===== RENDER COMPETITIONS =====
function renderCompetitions() {
  const list = document.getElementById('compList');
  if (!list) return;

  list.innerHTML = COMPETITIONS.map(function(c) {
    var state = game.competitions[c.id] || { wins: 0, losses: 0, cooldownUntil: 0 };
    var locked = game.reputation < c.minRep;
    var onCooldown = Date.now() < state.cooldownUntil;
    var timeLeft = onCooldown ? Math.ceil((state.cooldownUntil - Date.now()) / 1000) : 0;

    var rewardMult = 1;
    if (game.staff.champion?.hired) rewardMult = STAFF.find(function(s) { return s.id === 'champion'; }).compMult;

    var actionHTML = '';
    if (locked) {
      actionHTML = '<span style="color:var(--text-muted);font-size:12px;">Req. ' + c.minRep + ' rep</span>';
    } else if (onCooldown) {
      actionHTML = '<div class="comp-cooldown">⏱️ ' + fmtTime(timeLeft) + '</div>';
    } else {
      actionHTML = '<button class="btn btn-buy btn-small" onclick="enterCompetition(\'' + c.id + '\')">⚔️ COMPETIR</button>';
    }

    return (
      '<div class="comp-card" style="' + (locked ? 'opacity:0.4;pointer-events:none;' : '') + '">' +
        '<div class="comp-icon">' + c.icon + '</div>' +
        '<div class="comp-info">' +
          '<div class="comp-name">' + c.name + '</div>' +
          '<div class="comp-desc">' + c.desc + '</div>' +
          '<div class="comp-reward">' +
            '🏆 ' + fmtMoney(c.reward * rewardMult) + ' · ⭐ ' + c.repReward + ' rep · ✨ ' + c.xpReward + ' XP' +
          '</div>' +
          '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' +
            'Record: ' + (state.wins || 0) + 'W - ' + (state.losses || 0) + 'L · Prob: ' + Math.round(c.winChance * 100) + '%' +
          '</div>' +
        '</div>' +
        '<div class="comp-actions">' + actionHTML + '</div>' +
      '</div>'
    );
  }).join('');
}

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
  const netIncome = income - salaries;

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
  el = document.getElementById('grossIncomeBig');
  if (el) el.textContent = fmtMoney(income);
  el = document.getElementById('totalEarnedBig');
  if (el) el.textContent = fmtMoney(game.totalMoneyEarned);
  el = document.getElementById('staffCountBig');
  if (el) el.textContent = STAFF.filter(function(s) { return game.staff[s.id]?.hired; }).length + ' / ' + STAFF.length;
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

  // Equipment icons in gym
  var icons = EQUIPMENT.filter(function(eq) {
    return (game.equipment[eq.id]?.level || 0) > 0;
  }).map(function(eq) { return eq.icon; });
  el = document.getElementById('gymEquipIcons');
  if (el) el.innerHTML = icons.map(function(i) { return '<span>' + i + '</span>'; }).join('');

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
