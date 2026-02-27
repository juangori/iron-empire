// ===== IRON EMPIRE - GAME DATA =====

const EQUIPMENT = [
  { id: 'dumbbells', name: 'Mancuernas', icon: '🏋️', desc: 'El básico de todo gym. Atraen principiantes.', baseCost: 50, costMult: 1.6, incomePerLevel: 1, membersPerLevel: 2, capacityPerLevel: 0, reqLevel: 1 },
  { id: 'bench', name: 'Banco Plano', icon: '🪑', desc: 'Press de banca, el rey de los ejercicios.', baseCost: 150, costMult: 1.65, incomePerLevel: 2.5, membersPerLevel: 3, capacityPerLevel: 2, reqLevel: 1 },
  { id: 'squat_rack', name: 'Squat Rack', icon: '🔩', desc: 'Para los que no saltean leg day.', baseCost: 400, costMult: 1.7, incomePerLevel: 5, membersPerLevel: 4, capacityPerLevel: 3, reqLevel: 2 },
  { id: 'treadmill', name: 'Cinta de Correr', icon: '🏃', desc: 'Cardio warriors love this.', baseCost: 800, costMult: 1.7, incomePerLevel: 4, membersPerLevel: 5, capacityPerLevel: 3, reqLevel: 3 },
  { id: 'cables', name: 'Polea / Cables', icon: '⚙️', desc: 'Versatilidad total. Mil ejercicios.', baseCost: 1500, costMult: 1.75, incomePerLevel: 8, membersPerLevel: 5, capacityPerLevel: 4, reqLevel: 4 },
  { id: 'leg_press', name: 'Prensa de Piernas', icon: '🦵', desc: 'Para empujar peso de verdad.', baseCost: 3000, costMult: 1.8, incomePerLevel: 12, membersPerLevel: 6, capacityPerLevel: 4, reqLevel: 5 },
  { id: 'smith', name: 'Smith Machine', icon: '🔧', desc: 'Guiada y segura. Ideal para entrenar solo.', baseCost: 5000, costMult: 1.8, incomePerLevel: 18, membersPerLevel: 7, capacityPerLevel: 5, reqLevel: 7 },
  { id: 'pool', name: 'Pileta de Natación', icon: '🏊', desc: 'El upgrade premium. Cambia todo.', baseCost: 15000, costMult: 2.0, incomePerLevel: 40, membersPerLevel: 15, capacityPerLevel: 10, reqLevel: 9 },
  { id: 'sauna', name: 'Sauna', icon: '🧖', desc: 'Relax post-entreno. Atrae membresías premium.', baseCost: 25000, costMult: 2.0, incomePerLevel: 55, membersPerLevel: 12, capacityPerLevel: 5, reqLevel: 11 },
  { id: 'crossfit', name: 'Zona CrossFit', icon: '🤸', desc: 'Box jumps, rope climbs, WODs. La fiebre CrossFit.', baseCost: 50000, costMult: 2.1, incomePerLevel: 80, membersPerLevel: 20, capacityPerLevel: 15, reqLevel: 13 },
  { id: 'boxing', name: 'Ring de Boxeo', icon: '🥊', desc: 'Entrenamiento de combate. Atrae fighters.', baseCost: 100000, costMult: 2.1, incomePerLevel: 120, membersPerLevel: 25, capacityPerLevel: 10, reqLevel: 15 },
  { id: 'spa', name: 'Spa Completo', icon: '💆', desc: 'Masajes, crioterapia, el paquete full.', baseCost: 250000, costMult: 2.2, incomePerLevel: 200, membersPerLevel: 30, capacityPerLevel: 8, reqLevel: 18 },
];

const STAFF = [
  { id: 'trainer', name: 'Entrenador', icon: '💪', role: 'Personal Trainer', effect: '+50% ingresos de equipamiento', costBase: 500, costMult: 2.5, incomeMult: 0.5, reqLevel: 2 },
  { id: 'receptionist', name: 'Recepcionista', icon: '👩‍💼', role: 'Atención al Cliente', effect: '+1 miembro cada 10s automático', costBase: 1000, costMult: 2.5, autoMembers: 1, reqLevel: 3 },
  { id: 'cleaner', name: 'Personal de Limpieza', icon: '🧹', role: 'Mantenimiento', effect: '+20% reputación por tick', costBase: 800, costMult: 2.0, repMult: 0.2, reqLevel: 4 },
  { id: 'nutritionist', name: 'Nutricionista', icon: '🥗', role: 'Asesor Nutricional', effect: '+30% ingresos, +5 capacidad', costBase: 3000, costMult: 2.5, incomeMult: 0.3, capacityBonus: 5, reqLevel: 6 },
  { id: 'physio', name: 'Kinesiólogo', icon: '🩺', role: 'Rehabilitación', effect: '+40% reputación, reduce lesiones', costBase: 5000, costMult: 2.5, repMult: 0.4, reqLevel: 8 },
  { id: 'influencer', name: 'Influencer Fitness', icon: '📱', role: 'Marketing', effect: '+2 miembros cada 10s, +reputación', costBase: 8000, costMult: 3.0, autoMembers: 2, repMult: 0.3, reqLevel: 10 },
  { id: 'manager', name: 'Gerente', icon: '👔', role: 'Administración', effect: '-20% costos de todo', costBase: 15000, costMult: 3.0, costReduction: 0.2, reqLevel: 12 },
  { id: 'champion', name: 'Campeón Retirado', icon: '🏅', role: 'Embajador', effect: 'x2 premios de competencias', costBase: 50000, costMult: 3.5, compMult: 2, reqLevel: 15 },
];

const COMPETITIONS = [
  { id: 'local', name: 'Torneo de Barrio', icon: '🏠', desc: 'Competencia local de pesas. Bajo riesgo.', reward: 500, repReward: 10, xpReward: 30, cooldown: 30, minRep: 0, winChance: 0.8 },
  { id: 'city', name: 'Campeonato Municipal', icon: '🏙️', desc: 'Los mejores del municipio. Nivel intermedio.', reward: 2000, repReward: 30, xpReward: 80, cooldown: 60, minRep: 50, winChance: 0.6 },
  { id: 'regional', name: 'Regional de Powerlifting', icon: '🗺️', desc: 'Deadlift, squat, bench. Los tres grandes.', reward: 8000, repReward: 80, xpReward: 200, cooldown: 120, minRep: 200, winChance: 0.45 },
  { id: 'national', name: 'Nacional de Fuerza', icon: '🇦🇷', desc: 'Lo mejor del país compite acá.', reward: 30000, repReward: 200, xpReward: 500, cooldown: 300, minRep: 500, winChance: 0.3 },
  { id: 'continental', name: 'Sudamericano', icon: '🌎', desc: 'Argentina vs. Brasil vs. todos. Épico.', reward: 100000, repReward: 500, xpReward: 1200, cooldown: 600, minRep: 1500, winChance: 0.2 },
  { id: 'world', name: 'Mundial de Pesas', icon: '🌍', desc: 'El pináculo. Solo los mejores del mundo.', reward: 500000, repReward: 2000, xpReward: 5000, cooldown: 1200, minRep: 5000, winChance: 0.1 },
];

const ACHIEVEMENTS = [
  { id: 'first_equip', name: 'Primer Paso', icon: '👟', desc: 'Comprá tu primer equipamiento', check: () => Object.values(game.equipment).some(e => e.level > 0) },
  { id: 'ten_members', name: 'Ya Somos 10', icon: '👥', desc: 'Llegá a 10 miembros', check: () => game.members >= 10 },
  { id: 'fifty_members', name: 'Medio Centenar', icon: '🎉', desc: 'Llegá a 50 miembros', check: () => game.members >= 50 },
  { id: 'hundred_members', name: 'Club de los 100', icon: '💯', desc: 'Llegá a 100 miembros', check: () => game.members >= 100 },
  { id: 'thousand_bucks', name: 'Primer Luca', icon: '💵', desc: 'Ganá $1,000 en total', check: () => game.totalMoneyEarned >= 1000 },
  { id: 'ten_k', name: 'Diez Lucas', icon: '💰', desc: 'Ganá $10,000 en total', check: () => game.totalMoneyEarned >= 10000 },
  { id: 'hundred_k', name: 'Seis Cifras', icon: '🤑', desc: 'Ganá $100,000 en total', check: () => game.totalMoneyEarned >= 100000 },
  { id: 'million', name: 'Millonario', icon: '👑', desc: 'Ganá $1,000,000 en total', check: () => game.totalMoneyEarned >= 1000000 },
  { id: 'first_comp', name: 'Competidor', icon: '🏆', desc: 'Ganá tu primera competencia', check: () => Object.values(game.competitions).some(c => c.wins > 0) },
  { id: 'five_comps', name: 'Racha Ganadora', icon: '🔥', desc: 'Ganá 5 competencias', check: () => Object.values(game.competitions).reduce((s, c) => s + (c.wins || 0), 0) >= 5 },
  { id: 'first_staff', name: 'Jefe', icon: '🤝', desc: 'Contratá tu primer empleado', check: () => Object.values(game.staff).some(s => s.hired) },
  { id: 'full_staff', name: 'Dream Team', icon: '⭐', desc: 'Contratá a todo el staff', check: () => STAFF.every(s => game.staff[s.id]?.hired) },
  { id: 'level_5', name: 'Nivel 5', icon: '📈', desc: 'Llegá al nivel 5', check: () => game.level >= 5 },
  { id: 'level_10', name: 'Nivel 10', icon: '🚀', desc: 'Llegá al nivel 10', check: () => game.level >= 10 },
  { id: 'level_20', name: 'Nivel 20', icon: '🏔️', desc: 'Llegá al nivel 20', check: () => game.level >= 20 },
  { id: 'first_prestige', name: 'Franquicia', icon: '🌟', desc: 'Hacé tu primer prestige', check: () => game.prestigeStars > 0 },
  { id: 'rep_100', name: 'Conocido', icon: '📣', desc: 'Llegá a 100 de reputación', check: () => game.reputation >= 100 },
  { id: 'rep_1000', name: 'Famoso', icon: '🌟', desc: 'Llegá a 1000 de reputación', check: () => game.reputation >= 1000 },
  { id: 'first_class', name: 'Profe', icon: '🧘', desc: 'Dictá tu primera clase', check: () => game.stats.classesCompleted >= 1 },
  { id: 'ten_classes', name: 'Instructor Pro', icon: '🏅', desc: 'Completá 10 clases', check: () => game.stats.classesCompleted >= 10 },
  { id: 'first_campaign', name: 'En los Medios', icon: '📢', desc: 'Lanzá tu primera campaña de marketing', check: () => game.stats.campaignsLaunched >= 1 },
  { id: 'streak_7', name: 'Semana Completa', icon: '🔥', desc: 'Mantené un streak de 7 días', check: () => game.dailyBonus.streak >= 7 },
  { id: 'mission_master', name: 'Misionero', icon: '📋', desc: 'Completá 10 misiones diarias', check: () => game.stats.missionsCompleted >= 10 },
  { id: 'event_handler', name: 'Solucionador', icon: '⚡', desc: 'Resolvé 10 eventos', check: () => game.stats.eventsHandled >= 10 },
  { id: 'first_skill', name: 'Investigador', icon: '🔬', desc: 'Investigá tu primera mejora', check: () => game.stats.skillsResearched >= 1 },
  { id: 'skill_master', name: 'Maestro Científico', icon: '🧬', desc: 'Investigá 8 mejoras', check: () => game.stats.skillsResearched >= 8 },
  { id: 'first_zone', name: 'Expansionista', icon: '🏗️', desc: 'Desbloqueá una nueva zona', check: () => game.stats.zonesUnlocked >= 2 },
  { id: 'all_zones', name: 'Magnate Inmobiliario', icon: '🏟️', desc: 'Desbloqueá todas las zonas', check: () => game.stats.zonesUnlocked >= GYM_ZONES.length },
  { id: 'first_vip', name: 'Trato VIP', icon: '⭐', desc: 'Atendé a tu primer miembro VIP', check: () => game.stats.vipsServed >= 1 },
  { id: 'vip_magnet', name: 'Imán de VIPs', icon: '🧲', desc: 'Atendé a 10 miembros VIP', check: () => game.stats.vipsServed >= 10 },
  { id: 'five_hundred_members', name: 'Medio Millar', icon: '🏟️', desc: 'Llegá a 500 miembros', check: () => game.members >= 500 },
  { id: 'ten_million', name: 'Diez Millones', icon: '💎', desc: 'Ganá $10,000,000 en total', check: () => game.totalMoneyEarned >= 10000000 },
];

const GYM_CLASSES = [
  { id: 'yoga', name: 'Yoga', icon: '🧘', desc: 'Flexibilidad y paz mental.', duration: 120, income: 200, xp: 40, rep: 5, reqLevel: 2, cooldown: 300 },
  { id: 'spinning', name: 'Spinning', icon: '🚴', desc: 'Cardio intenso sobre ruedas.', duration: 90, income: 300, xp: 50, rep: 8, reqLevel: 3, cooldown: 240 },
  { id: 'hiit', name: 'HIIT', icon: '💥', desc: 'Intervalos de alta intensidad. Quemá todo.', duration: 60, income: 400, xp: 60, rep: 10, reqLevel: 5, cooldown: 180 },
  { id: 'pilates', name: 'Pilates', icon: '🤸', desc: 'Core y control corporal.', duration: 120, income: 350, xp: 45, rep: 7, reqLevel: 4, cooldown: 300 },
  { id: 'boxing_class', name: 'Boxeo Fitness', icon: '🥊', desc: 'Golpeá la bolsa, liberá stress.', duration: 75, income: 500, xp: 70, rep: 12, reqLevel: 7, cooldown: 250 },
  { id: 'zumba', name: 'Zumba', icon: '💃', desc: 'Bailá y entrenate al mismo tiempo.', duration: 90, income: 350, xp: 45, rep: 10, reqLevel: 4, cooldown: 270 },
  { id: 'crossfit_class', name: 'WOD CrossFit', icon: '🏋️', desc: 'Workout Of the Day. Intenso.', duration: 60, income: 600, xp: 80, rep: 15, reqLevel: 9, cooldown: 200 },
  { id: 'swimming', name: 'Natación Guiada', icon: '🏊', desc: 'Técnica y resistencia en el agua.', duration: 90, income: 700, xp: 90, rep: 18, reqLevel: 11, cooldown: 300 },
];

const MARKETING_CAMPAIGNS = [
  { id: 'flyers', name: 'Flyers', icon: '📄', desc: 'Repartir volantes por el barrio.', cost: 200, membersBoost: 5, duration: 60, repBoost: 3, reqLevel: 1 },
  { id: 'instagram', name: 'Instagram Ads', icon: '📸', desc: 'Posteos y stories patrocinadas.', cost: 800, membersBoost: 12, duration: 120, repBoost: 8, reqLevel: 3 },
  { id: 'google_ads', name: 'Google Ads', icon: '🔍', desc: 'Aparecer primero en búsquedas locales.', cost: 2000, membersBoost: 20, duration: 180, repBoost: 15, reqLevel: 5 },
  { id: 'youtube', name: 'Video YouTube', icon: '🎥', desc: 'Tour del gym que se hace viral.', cost: 5000, membersBoost: 35, duration: 300, repBoost: 30, reqLevel: 7 },
  { id: 'radio', name: 'Publicidad en Radio', icon: '📻', desc: 'Spot radial en hora pico.', cost: 10000, membersBoost: 50, duration: 240, repBoost: 40, reqLevel: 9 },
  { id: 'tv', name: 'Spot de TV', icon: '📺', desc: 'Publicidad televisiva. El big game.', cost: 30000, membersBoost: 100, duration: 600, repBoost: 80, reqLevel: 12 },
  { id: 'celebrity', name: 'Sponsor Celebridad', icon: '🌟', desc: 'Un famoso entrena en tu gym. Todo el mundo habla.', cost: 80000, membersBoost: 200, duration: 900, repBoost: 200, reqLevel: 15 },
];

const RANDOM_EVENTS = [
  {
    id: 'inspection',
    icon: '🏛️',
    title: 'Inspección Municipal',
    desc: 'Un inspector del municipio vino a revisar las instalaciones. Podés sobornar, pagar la multa, o mejorar las instalaciones.',
    choices: [
      { text: 'Mejorar instalaciones', cost: 'money:500', result: '+15 reputación y +30 XP', effect: (g) => { g.reputation += 15; g.xp += 30; } },
      { text: 'Pagar la multa', cost: '-$200', result: 'Te sacás el problema de encima', effect: (g) => { g.money -= 200; } },
      { text: 'Ignorar al inspector', cost: 'Gratis', result: '-10 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 10); } },
    ],
    minLevel: 1
  },
  {
    id: 'celebrity_visit',
    icon: '🌟',
    title: 'Visita de un Famoso',
    desc: 'Un influencer fitness quiere entrenar en tu gym hoy. Si lo dejás gratis, sube tu reputación. Si le cobrás premium, ganás plata.',
    choices: [
      { text: 'Dejarlo entrenar gratis', cost: 'Gratis', result: '+30 reputación y +50 XP', effect: (g) => { g.reputation += 30; g.xp += 50; } },
      { text: 'Cobrarle membresía VIP', cost: 'Gratis', result: '+$2000 pero +5 rep', effect: (g) => { g.money += 2000; g.totalMoneyEarned += 2000; g.reputation += 5; } },
    ],
    minLevel: 3
  },
  {
    id: 'broken_equipment',
    icon: '🔧',
    title: 'Equipo Roto',
    desc: 'Se rompió una máquina y los miembros están molestos. ¿Qué hacés?',
    choices: [
      { text: 'Reparar inmediatamente', cost: '-$800', result: '+10 reputación por actuar rápido', effect: (g) => { g.money -= 800; g.reputation += 10; } },
      { text: 'Poner un cartel de "fuera de servicio"', cost: 'Gratis', result: '-5 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 5); } },
      { text: 'Upgrade a equipo nuevo', cost: '-$2000', result: '+25 reputación y +50 XP', effect: (g) => { g.money -= 2000; g.reputation += 25; g.xp += 50; } },
    ],
    minLevel: 2
  },
  {
    id: 'sponsor_offer',
    icon: '💼',
    title: 'Oferta de Sponsor',
    desc: 'Una marca de suplementos quiere patrocinar tu gym. Te ofrecen plata a cambio de exclusividad.',
    choices: [
      { text: 'Aceptar el sponsoreo', cost: 'Gratis', result: '+$3000 y +20 XP', effect: (g) => { g.money += 3000; g.totalMoneyEarned += 3000; g.xp += 20; } },
      { text: 'Negociar mejor deal', cost: 'Gratis', result: '50% chance de +$6000 o nada', effect: (g) => { if (Math.random() > 0.5) { g.money += 6000; g.totalMoneyEarned += 6000; } } },
      { text: 'Rechazar (mantener libertad)', cost: 'Gratis', result: '+15 reputación (independencia)', effect: (g) => { g.reputation += 15; } },
    ],
    minLevel: 4
  },
  {
    id: 'group_discount',
    icon: '👥',
    title: 'Grupo Corporativo',
    desc: 'Una empresa quiere membresías grupales con descuento para sus empleados.',
    choices: [
      { text: 'Aceptar con descuento', cost: 'Gratis', result: '+8 miembros y +$1500', effect: (g) => { g.members = Math.min(g.members + 8, g.maxMembers); g.money += 1500; g.totalMoneyEarned += 1500; } },
      { text: 'Precio completo o nada', cost: 'Gratis', result: '30% chance: +4 miembros a precio full', effect: (g) => { if (Math.random() < 0.3) { g.members = Math.min(g.members + 4, g.maxMembers); g.money += 2000; g.totalMoneyEarned += 2000; } } },
    ],
    minLevel: 3
  },
  {
    id: 'competition_invite',
    icon: '🏆',
    title: 'Invitación a Exhibición',
    desc: 'Te invitan a una exhibición de fuerza en un evento local. Podés participar o enviar a un miembro.',
    choices: [
      { text: 'Participar personalmente', cost: 'Gratis', result: '+40 reputación y +80 XP', effect: (g) => { g.reputation += 40; g.xp += 80; } },
      { text: 'Enviar al mejor miembro', cost: 'Gratis', result: '+20 reputación y +40 XP', effect: (g) => { g.reputation += 20; g.xp += 40; } },
    ],
    minLevel: 5
  },
  {
    id: 'water_leak',
    icon: '💧',
    title: 'Filtración de Agua',
    desc: 'Hay una filtración en el techo. Si no la arreglás se va a poner peor.',
    choices: [
      { text: 'Arreglar ya', cost: '-$500', result: 'Problema resuelto, +5 rep', effect: (g) => { g.money -= 500; g.reputation += 5; } },
      { text: 'Dejarlo para después', cost: 'Gratis', result: '-15 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 15); } },
    ],
    minLevel: 1
  },
  {
    id: 'fitness_challenge',
    icon: '🎯',
    title: 'Desafío Fitness Viral',
    desc: 'Un desafío se hizo viral en redes. ¿Querés sumarte con tu gym?',
    choices: [
      { text: 'Organizar el desafío en el gym', cost: '-$300', result: '+5 miembros, +25 rep, +60 XP', effect: (g) => { g.members = Math.min(g.members + 5, g.maxMembers); g.reputation += 25; g.xp += 60; g.money -= 300; } },
      { text: 'Filmar y subir a redes', cost: 'Gratis', result: '+15 reputación y +30 XP', effect: (g) => { g.reputation += 15; g.xp += 30; } },
      { text: 'Ignorarlo', cost: 'Gratis', result: 'Nada pasa', effect: () => {} },
    ],
    minLevel: 2
  },
  {
    id: 'power_outage',
    icon: '⚡',
    title: 'Corte de Luz',
    desc: 'Se cortó la luz en el barrio. Tu gym está a oscuras y los miembros se quejan.',
    choices: [
      { text: 'Comprar generador de emergencia', cost: '-$3000', result: '+30 rep, gym nunca más cierra por luz', effect: (g) => { g.money -= 3000; g.reputation += 30; g.xp += 40; } },
      { text: 'Entrenar a la luz de velas', cost: 'Gratis', result: '+10 rep (ambiente único)', effect: (g) => { g.reputation += 10; g.xp += 20; } },
      { text: 'Cerrar por hoy', cost: 'Gratis', result: '-20 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 20); } },
    ],
    minLevel: 3
  },
  {
    id: 'member_complaint',
    icon: '😤',
    title: 'Queja de Miembro VIP',
    desc: 'Un miembro importante está por irse. Dice que el gym necesita mejoras.',
    choices: [
      { text: 'Ofrecerle un mes gratis', cost: '-$500', result: 'Se queda, +10 rep', effect: (g) => { g.money -= 500; g.reputation += 10; } },
      { text: 'Escuchar y prometer mejoras', cost: 'Gratis', result: '+5 rep, se queda por ahora', effect: (g) => { g.reputation += 5; } },
      { text: 'Dejarlo ir', cost: 'Gratis', result: '-2 miembros, -10 rep', effect: (g) => { g.members = Math.max(0, g.members - 2); g.reputation = Math.max(0, g.reputation - 10); } },
    ],
    minLevel: 2
  },
];

const DAILY_MISSIONS_POOL = [
  { id: 'earn_money', type: 'money_earned', name: 'Generador de Cash', icon: '💰', desc: 'Ganá ${target} en ingresos', targets: [500, 1000, 2500, 5000, 10000], rewards: { money: 200, xp: 30 } },
  { id: 'buy_equipment', type: 'equipment_bought', name: 'Equipador', icon: '🛒', desc: 'Comprá o mejorá ${target} equipos', targets: [1, 2, 3, 5], rewards: { money: 300, xp: 40 } },
  { id: 'win_comp', type: 'competitions_won', name: 'Campeón del Día', icon: '🏆', desc: 'Ganá ${target} competencia(s)', targets: [1, 2, 3], rewards: { money: 500, xp: 60 } },
  { id: 'reach_rep', type: 'reputation_gained', name: 'Fama', icon: '⭐', desc: 'Ganá ${target} de reputación', targets: [10, 25, 50, 100], rewards: { money: 250, xp: 35 } },
  { id: 'run_class', type: 'classes_run', name: 'Profesor del Día', icon: '🧘', desc: 'Dictá ${target} clase(s)', targets: [1, 2, 3], rewards: { money: 400, xp: 50 } },
  { id: 'launch_campaign', type: 'campaigns_launched', name: 'Marketinero', icon: '📢', desc: 'Lanzá ${target} campaña(s) de marketing', targets: [1, 2], rewards: { money: 350, xp: 45 } },
  { id: 'earn_xp', type: 'xp_earned', name: 'Grinder', icon: '✨', desc: 'Ganá ${target} XP', targets: [50, 100, 200, 500], rewards: { money: 300, xp: 40 } },
  { id: 'handle_event', type: 'events_handled', name: 'Crisis Manager', icon: '⚡', desc: 'Resolvé ${target} evento(s) random', targets: [1, 2], rewards: { money: 400, xp: 50 } },
];

const DAILY_BONUS_REWARDS = [
  { day: 1, money: 500, xp: 50, label: '$500' },
  { day: 2, money: 800, xp: 75, label: '$800' },
  { day: 3, money: 1200, xp: 100, label: '$1.2K' },
  { day: 4, money: 1800, xp: 130, label: '$1.8K' },
  { day: 5, money: 2500, xp: 170, label: '$2.5K' },
  { day: 6, money: 3500, xp: 220, label: '$3.5K' },
  { day: 7, money: 5000, xp: 300, label: '$5K + 🎁' },
];

// ===== SKILL TREE =====
const SKILL_TREE = {
  equipment: {
    name: 'Equipamiento',
    icon: '🔧',
    color: 'var(--accent)',
    skills: [
      { id: 'eq_durability', name: 'Durabilidad', icon: '🛡️', desc: 'Equipos duran más. -15% costo de mejora.', cost: 1000, reqLevel: 3, effect: { equipCostMult: 0.85 } },
      { id: 'eq_efficiency', name: 'Eficiencia', icon: '⚡', desc: '+25% ingresos de todo el equipamiento.', cost: 3000, reqLevel: 5, requires: 'eq_durability', effect: { equipIncomeMult: 1.25 } },
      { id: 'eq_premium', name: 'Línea Premium', icon: '💎', desc: '+50% capacidad de equipamiento.', cost: 8000, reqLevel: 8, requires: 'eq_efficiency', effect: { equipCapacityMult: 1.5 } },
      { id: 'eq_mastery', name: 'Maestría Total', icon: '👑', desc: '+100% ingresos de equipamiento y -25% costos.', cost: 25000, reqLevel: 12, requires: 'eq_premium', effect: { equipIncomeMult: 2.0, equipCostMult: 0.75 } },
    ]
  },
  marketing: {
    name: 'Marketing',
    icon: '📢',
    color: 'var(--cyan)',
    skills: [
      { id: 'mk_reach', name: 'Mayor Alcance', icon: '📡', desc: '+30% miembros de campañas.', cost: 1500, reqLevel: 4, effect: { campaignMembersMult: 1.3 } },
      { id: 'mk_viral', name: 'Viralización', icon: '🔥', desc: 'Campañas duran 50% más.', cost: 4000, reqLevel: 6, requires: 'mk_reach', effect: { campaignDurationMult: 1.5 } },
      { id: 'mk_brand', name: 'Marca Fuerte', icon: '🏷️', desc: '+50% reputación de campañas.', cost: 10000, reqLevel: 9, requires: 'mk_viral', effect: { campaignRepMult: 1.5 } },
      { id: 'mk_empire', name: 'Imperio Mediático', icon: '📺', desc: '-40% costo de campañas, +100% miembros.', cost: 30000, reqLevel: 13, requires: 'mk_brand', effect: { campaignCostMult: 0.6, campaignMembersMult: 2.0 } },
    ]
  },
  staff: {
    name: 'Personal',
    icon: '👥',
    color: 'var(--purple)',
    skills: [
      { id: 'st_training', name: 'Capacitación', icon: '📚', desc: '+30% efecto de todo el staff.', cost: 2000, reqLevel: 4, effect: { staffEffectMult: 1.3 } },
      { id: 'st_motivation', name: 'Motivación', icon: '💪', desc: 'Staff genera +50% reputación.', cost: 5000, reqLevel: 7, requires: 'st_training', effect: { staffRepMult: 1.5 } },
      { id: 'st_synergy', name: 'Sinergia', icon: '🤝', desc: 'Cada staff contratado da +5% ingreso extra.', cost: 12000, reqLevel: 10, requires: 'st_motivation', effect: { staffSynergyBonus: 0.05 } },
      { id: 'st_legends', name: 'Staff Legendario', icon: '🌟', desc: '-30% costo staff, duplica auto-miembros.', cost: 35000, reqLevel: 14, requires: 'st_synergy', effect: { staffCostMult: 0.7, autoMembersMult: 2.0 } },
    ]
  },
  members: {
    name: 'Miembros',
    icon: '🏃',
    color: 'var(--green)',
    skills: [
      { id: 'mb_welcome', name: 'Bienvenida', icon: '🤗', desc: '+20% miembros atraídos por equipo.', cost: 1200, reqLevel: 3, effect: { memberAttractionMult: 1.2 } },
      { id: 'mb_retention', name: 'Retención', icon: '🔒', desc: '+40% capacidad máxima.', cost: 4000, reqLevel: 6, requires: 'mb_welcome', effect: { capacityMult: 1.4 } },
      { id: 'mb_premium_tier', name: 'Membresía Premium', icon: '💳', desc: 'Cada miembro genera +100% ingreso.', cost: 15000, reqLevel: 10, requires: 'mb_retention', effect: { memberIncomeMult: 2.0 } },
      { id: 'mb_loyalty', name: 'Lealtad Total', icon: '❤️', desc: '+200% rep por miembro, +50% capacidad.', cost: 40000, reqLevel: 15, requires: 'mb_premium_tier', effect: { memberRepMult: 3.0, capacityMult: 1.5 } },
    ]
  }
};

// ===== GYM ZONES / EXPANSION =====
const GYM_ZONES = [
  { id: 'ground_floor', name: 'Planta Baja', icon: '🏠', desc: 'El corazón del gym. Tu base de operaciones.', cost: 0, capacityBonus: 10, incomeBonus: 0, reqLevel: 1, unlocked: true },
  { id: 'first_floor', name: 'Primer Piso', icon: '🏢', desc: 'Más espacio, más máquinas, más miembros.', cost: 15000, capacityBonus: 30, incomeBonus: 10, reqLevel: 6 },
  { id: 'basement', name: 'Sótano', icon: '🔨', desc: 'Zona hardcore. Pesas pesadas, chalk, gritos.', cost: 40000, capacityBonus: 25, incomeBonus: 20, reqLevel: 10 },
  { id: 'rooftop', name: 'Terraza', icon: '☀️', desc: 'Entrenamiento al aire libre con vista.', cost: 80000, capacityBonus: 20, incomeBonus: 30, reqLevel: 13 },
  { id: 'annex', name: 'Edificio Anexo', icon: '🏗️', desc: 'Un edificio completo al lado. Duplicás tu gym.', cost: 200000, capacityBonus: 60, incomeBonus: 50, reqLevel: 16 },
  { id: 'arena', name: 'Arena de Competición', icon: '🏟️', desc: 'Arena propia para competencias y eventos. +rep masivo.', cost: 500000, capacityBonus: 40, incomeBonus: 80, reqLevel: 19 },
];

// ===== VIP MEMBERS =====
const VIP_MEMBERS = [
  { id: 'bodybuilder', name: 'Fisicoculturista Pro', icon: '💪', request: 'Necesito Squat Rack y Prensa de Piernas', requires: ['squat_rack', 'leg_press'], reward: { money: 3000, rep: 30, xp: 80 }, stayDuration: 600 },
  { id: 'yoga_guru', name: 'Gurú del Yoga', icon: '🧘', request: 'Quiero un espacio tranquilo para dar clases', requires: ['yoga_class'], reward: { money: 2000, rep: 40, xp: 60 }, stayDuration: 500 },
  { id: 'boxer', name: 'Boxeador Amateur', icon: '🥊', request: 'Necesito Ring de Boxeo para entrenar', requires: ['boxing'], reward: { money: 5000, rep: 50, xp: 100 }, stayDuration: 700 },
  { id: 'swimmer', name: 'Nadadora Olímpica', icon: '🏊‍♀️', request: 'Solo entreno en gyms con pileta', requires: ['pool'], reward: { money: 8000, rep: 80, xp: 150 }, stayDuration: 800 },
  { id: 'crossfitter', name: 'Crossfitter Fanático', icon: '🤸', request: 'Dame WODs o dame muerte', requires: ['crossfit'], reward: { money: 6000, rep: 60, xp: 120 }, stayDuration: 600 },
  { id: 'ceo', name: 'CEO Fitness', icon: '👔', request: 'Quiero Spa y Sauna. Necesito relajarme.', requires: ['spa', 'sauna'], reward: { money: 15000, rep: 100, xp: 200 }, stayDuration: 900 },
  { id: 'influencer_vip', name: 'Influencer (1M seguidores)', icon: '📱', request: 'Tu gym tiene que ser Instagrameable', requires: ['first_floor'], reward: { money: 10000, rep: 150, xp: 180 }, stayDuration: 700 },
  { id: 'retired_athlete', name: 'Atleta Retirado', icon: '🏅', request: 'Necesito un gym completo y staff de calidad', requires: ['trainer', 'physio'], reward: { money: 12000, rep: 120, xp: 250 }, stayDuration: 1000 },
  { id: 'family', name: 'Familia Fitness', icon: '👨‍👩‍👧‍👦', request: 'Queremos pileta y clases para todos', requires: ['pool', 'spinning_class'], reward: { money: 7000, rep: 70, xp: 130 }, stayDuration: 800 },
  { id: 'strongman', name: 'Strongman', icon: '🦍', request: 'Solo entreno en sótanos con pesas reales', requires: ['basement'], reward: { money: 20000, rep: 200, xp: 300 }, stayDuration: 1200 },
];

const TUTORIAL_STEPS = [
  // Intro
  { target: '.gym-visual', title: '¡Bienvenido a tu Gimnasio!', text: 'Este es tu gym. Acá ves el nombre, la categoría y el equipamiento instalado. Ahora está vacío... ¡vamos a cambiarlo!', tab: 'gym' },
  { target: '.stats-grid', title: 'Tus Estadísticas', text: 'Estos números son clave: ingresos por segundo (tu ganancia), miembros activos, capacidad máxima y reputación. El objetivo es hacer crecer todo.' },
  { target: '.stats-bar', title: 'Barra de Recursos', text: 'Arriba siempre ves tu plata 💰, miembros 👥, reputación ⭐, ingresos 💵 y nivel. Pasá el mouse por encima para ver qué es cada cosa.' },

  // Primera acción: comprar equipo
  { target: '[data-tab="equipment"]', title: '¡Comprá tu Primer Equipo!', text: 'Lo primero que necesitás es equipamiento. Andá a la pestaña Equipamiento y comprá unas Mancuernas. Con eso empezás a generar ingresos y atraer miembros.', tab: 'equipment' },
  { target: '.equipment-grid', title: 'Equipamiento Disponible', text: 'Cada equipo muestra cuánta plata genera por segundo 💰, cuántos miembros atrae 👥 y cuánta capacidad agrega 📦. Empezá por las Mancuernas, que son baratas.', tab: 'equipment' },

  // Explicar ingresos
  { target: '#incomeBig', title: 'Ingresos por Segundo', text: '¡Bien! Ahora tu gym genera plata automáticamente cada segundo. Cuanto más equipamiento y miembros, más ganás. La plata se acumula sola.', tab: 'gym' },

  // Staff
  { target: '[data-tab="staff"]', title: 'Contratá Personal', text: 'Cuando juntes más plata, contratá staff. Un Entrenador aumenta tus ingresos 50%, una Recepcionista atrae miembros sola. Cada empleado tiene un efecto único.', tab: 'staff' },

  // Marketing
  { target: '[data-tab="marketing"]', title: 'Hacé Publicidad', text: 'Las campañas de marketing atraen miembros rápido y suben tu reputación. Empezá con Flyers cuando puedas. Duran un tiempo limitado.', tab: 'marketing' },

  // Clases
  { target: '[data-tab="classes"]', title: 'Dictá Clases', text: 'Las clases son una forma de ganar plata extra, XP y reputación. Las iniciás y se completan solas después de un tiempo. Tienen cooldown entre usos.', tab: 'classes' },

  // Misiones
  { target: '[data-tab="missions"]', title: 'Misiones Diarias', text: 'Cada día tenés 3 misiones con objetivos como "Ganá $X" o "Comprá X equipos". Completar las 3 te da un bonus extra. ¡Revisalas todos los días!', tab: 'missions' },

  // Competencias
  { target: '[data-tab="competitions"]', title: 'Competencias', text: 'Mandá a tus miembros a competir por premios y reputación. Empezá por el Torneo de Barrio que tiene 80% de probabilidad de ganar.', tab: 'competitions' },

  // Daily bonus
  { target: '.daily-bonus-banner', title: 'Bonus Diario', text: '¡Importante! Entrá todos los días para reclamar tu bonus. Si mantenés el streak, los premios son cada vez mejores. 7 días seguidos = mega premio.' },

  // VIP
  { target: '[data-tab="vip"]', title: 'Miembros VIP', text: 'Cada unos minutos aparecen VIPs buscando un gym con lo que necesitan. Si cumplís sus requisitos, te dan grandes recompensas. ¡Revisá la pestaña VIP seguido!', tab: 'vip' },

  // Mejoras
  { target: '[data-tab="skills"]', title: 'Árbol de Mejoras', text: 'Investigá mejoras permanentes en 4 ramas. ¡Las mejoras se mantienen incluso si hacés prestige! Son la clave del progreso a largo plazo.', tab: 'skills' },

  // Expansión
  { target: '[data-tab="expansion"]', title: 'Expansión', text: 'A medida que subas de nivel, podés construir nuevas zonas: primer piso, sótano, terraza y más. Cada zona agrega capacidad e ingresos.', tab: 'expansion' },

  // Prestige
  { target: '[data-tab="prestige"]', title: 'Franquicia (Prestige)', text: 'Cuando acumules $100K en total, podés abrir una franquicia. Se reinicia tu gym pero ganás estrellas que multiplican TODOS tus ingresos para siempre.', tab: 'prestige' },

  // Consejos finales
  { target: '.gym-visual', title: '¡A Jugar!', text: 'Consejo: el juego genera plata aunque cierres el navegador (hasta 2 horas). Entrá todos los días por el bonus, hacé misiones, dictá clases y competí. ¡Construí tu Iron Empire!', tab: 'gym' },
];
