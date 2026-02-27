// ===== IRON EMPIRE - GAME DATA =====

const STAFF_MAX_LEVEL = 5;
const STAFF_EXTRA_UNLOCK = { 2: 12, 3: 20 }; // 2nd copy at player level 12, 3rd at 20

const EQUIPMENT = [
  { id: 'dumbbells', name: 'Mancuernas', icon: '🏋️', desc: 'El básico de todo gym. Atraen principiantes.', baseCost: 50, costMult: 1.6, incomePerLevel: 0.6, membersPerLevel: 2, capacityPerLevel: 0, reqLevel: 1 },
  { id: 'bench', name: 'Banco Plano', icon: '🪑', desc: 'Press de banca, el rey de los ejercicios.', baseCost: 150, costMult: 1.65, incomePerLevel: 1.5, membersPerLevel: 3, capacityPerLevel: 2, reqLevel: 1 },
  { id: 'squat_rack', name: 'Squat Rack', icon: '🔩', desc: 'Para los que no saltean leg day.', baseCost: 400, costMult: 1.7, incomePerLevel: 3, membersPerLevel: 4, capacityPerLevel: 3, reqLevel: 2 },
  { id: 'treadmill', name: 'Cinta de Correr', icon: '🏃', desc: 'Cardio warriors love this.', baseCost: 800, costMult: 1.7, incomePerLevel: 2.5, membersPerLevel: 5, capacityPerLevel: 3, reqLevel: 3 },
  { id: 'cables', name: 'Polea / Cables', icon: '⚙️', desc: 'Versatilidad total. Mil ejercicios.', baseCost: 1500, costMult: 1.75, incomePerLevel: 5, membersPerLevel: 5, capacityPerLevel: 4, reqLevel: 4 },
  { id: 'leg_press', name: 'Prensa de Piernas', icon: '🦵', desc: 'Para empujar peso de verdad.', baseCost: 3000, costMult: 1.8, incomePerLevel: 7, membersPerLevel: 6, capacityPerLevel: 4, reqLevel: 5 },
  { id: 'smith', name: 'Smith Machine', icon: '🔧', desc: 'Guiada y segura. Ideal para entrenar solo.', baseCost: 5000, costMult: 1.8, incomePerLevel: 11, membersPerLevel: 7, capacityPerLevel: 5, reqLevel: 7 },
  { id: 'pool', name: 'Pileta de Natación', icon: '🏊', desc: 'El upgrade premium. Cambia todo.', baseCost: 15000, costMult: 2.0, incomePerLevel: 25, membersPerLevel: 15, capacityPerLevel: 10, reqLevel: 9 },
  { id: 'sauna', name: 'Sauna', icon: '🧖', desc: 'Relax post-entreno. Atrae membresías premium.', baseCost: 25000, costMult: 2.0, incomePerLevel: 35, membersPerLevel: 12, capacityPerLevel: 5, reqLevel: 11 },
  { id: 'crossfit', name: 'Zona CrossFit', icon: '🤸', desc: 'Box jumps, rope climbs, WODs. La fiebre CrossFit.', baseCost: 50000, costMult: 2.1, incomePerLevel: 50, membersPerLevel: 20, capacityPerLevel: 15, reqLevel: 13 },
  { id: 'boxing', name: 'Ring de Boxeo', icon: '🥊', desc: 'Entrenamiento de combate. Atrae fighters.', baseCost: 100000, costMult: 2.1, incomePerLevel: 75, membersPerLevel: 25, capacityPerLevel: 10, reqLevel: 15 },
  { id: 'spa', name: 'Spa Completo', icon: '💆', desc: 'Masajes, crioterapia, el paquete full.', baseCost: 250000, costMult: 2.2, incomePerLevel: 125, membersPerLevel: 30, capacityPerLevel: 8, reqLevel: 18 },
];

const STAFF = [
  { id: 'trainer', name: 'Entrenador', icon: '💪', role: 'Personal Trainer', effect: '+50% ingresos de equipamiento', costBase: 500, costMult: 2.5, salary: 25, incomeMult: 0.5, reqLevel: 2 },
  { id: 'receptionist', name: 'Recepcionista', icon: '👩‍💼', role: 'Atención al Cliente', effect: '+1 miembro cada 10s automático', costBase: 1000, costMult: 2.5, salary: 35, autoMembers: 1, reqLevel: 3 },
  { id: 'cleaner', name: 'Personal de Limpieza', icon: '🧹', role: 'Mantenimiento', effect: '+20% reputación por tick', costBase: 800, costMult: 2.0, salary: 20, repMult: 0.2, reqLevel: 4 },
  { id: 'nutritionist', name: 'Nutricionista', icon: '🥗', role: 'Asesor Nutricional', effect: '+30% ingresos, +5 capacidad', costBase: 3000, costMult: 2.5, salary: 60, incomeMult: 0.3, capacityBonus: 5, reqLevel: 6 },
  { id: 'physio', name: 'Kinesiólogo', icon: '🩺', role: 'Rehabilitación', effect: '+40% reputación, reduce lesiones', costBase: 5000, costMult: 2.5, salary: 80, repMult: 0.4, reqLevel: 8 },
  { id: 'influencer', name: 'Influencer Fitness', icon: '📱', role: 'Marketing', effect: '+2 miembros cada 10s, +reputación', costBase: 8000, costMult: 3.0, salary: 120, autoMembers: 2, repMult: 0.3, reqLevel: 10 },
  { id: 'manager', name: 'Gerente', icon: '👔', role: 'Administración', effect: '-20% costos de todo', costBase: 15000, costMult: 3.0, salary: 200, costReduction: 0.2, reqLevel: 12 },
  { id: 'champion', name: 'Campeón Retirado', icon: '🏅', role: 'Embajador', effect: 'x2 premios de competencias', costBase: 50000, costMult: 3.5, salary: 350, compMult: 2, reqLevel: 15 },
];

const COMPETITIONS = [
  { id: 'local', name: 'Torneo de Barrio', icon: '🏠', desc: 'Competencia local de pesas. Bajo riesgo.', reward: 500, repReward: 10, xpReward: 30, cooldown: 300, minRep: 0, winChance: 0.8 },
  { id: 'city', name: 'Campeonato Municipal', icon: '🏙️', desc: 'Los mejores del municipio. Nivel intermedio.', reward: 2000, repReward: 30, xpReward: 80, cooldown: 600, minRep: 50, winChance: 0.6 },
  { id: 'regional', name: 'Regional de Powerlifting', icon: '🗺️', desc: 'Deadlift, squat, bench. Los tres grandes.', reward: 8000, repReward: 80, xpReward: 200, cooldown: 1800, minRep: 200, winChance: 0.45 },
  { id: 'national', name: 'Nacional de Fuerza', icon: '🇦🇷', desc: 'Lo mejor del país compite acá.', reward: 30000, repReward: 200, xpReward: 500, cooldown: 3600, minRep: 500, winChance: 0.3 },
  { id: 'continental', name: 'Sudamericano', icon: '🌎', desc: 'Argentina vs. Brasil vs. todos. Épico.', reward: 100000, repReward: 500, xpReward: 1200, cooldown: 7200, minRep: 1500, winChance: 0.2 },
  { id: 'world', name: 'Mundial de Pesas', icon: '🌍', desc: 'El pináculo. Solo los mejores del mundo.', reward: 500000, repReward: 2000, xpReward: 5000, cooldown: 14400, minRep: 5000, winChance: 0.1 },
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
  { id: 'spinning', name: 'Spinning', icon: '🚴', desc: 'Cardio intenso sobre ruedas. Requiere Cinta de Correr.', duration: 90, income: 300, xp: 50, rep: 8, reqLevel: 3, cooldown: 240, reqEquipment: 'treadmill' },
  { id: 'hiit', name: 'HIIT', icon: '💥', desc: 'Intervalos de alta intensidad. Quemá todo.', duration: 60, income: 400, xp: 60, rep: 10, reqLevel: 5, cooldown: 180 },
  { id: 'pilates', name: 'Pilates', icon: '🤸', desc: 'Core y control corporal.', duration: 120, income: 350, xp: 45, rep: 7, reqLevel: 4, cooldown: 300 },
  { id: 'boxing_class', name: 'Boxeo Fitness', icon: '🥊', desc: 'Golpeá la bolsa, liberá stress. Requiere Ring de Boxeo.', duration: 75, income: 500, xp: 70, rep: 12, reqLevel: 7, cooldown: 250, reqEquipment: 'boxing' },
  { id: 'zumba', name: 'Zumba', icon: '💃', desc: 'Bailá y entrenate al mismo tiempo.', duration: 90, income: 350, xp: 45, rep: 10, reqLevel: 4, cooldown: 270 },
  { id: 'crossfit_class', name: 'WOD CrossFit', icon: '🏋️', desc: 'Workout Of the Day. Intenso. Requiere Zona CrossFit.', duration: 60, income: 600, xp: 80, rep: 15, reqLevel: 9, cooldown: 200, reqEquipment: 'crossfit' },
  { id: 'swimming', name: 'Natación Guiada', icon: '🏊', desc: 'Técnica y resistencia en el agua. Requiere Pileta.', duration: 90, income: 700, xp: 90, rep: 18, reqLevel: 11, cooldown: 300, reqEquipment: 'pool' },
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
    desc: 'Un inspector del municipio vino a revisar las instalaciones. Tus decisiones afectan tu reputación directamente.',
    choices: [
      { text: 'Mejorar instalaciones', cost: '-$500', hint: 'Inversión segura. Mejora tu imagen y da experiencia.', result: '+15 reputación y +30 XP', effect: (g) => { g.money -= 500; g.reputation += 15; g.xp += 30; } },
      { text: 'Pagar la multa', cost: '-$200', hint: 'Solución rápida, sin beneficio extra.', result: 'Te sacás el problema de encima', effect: (g) => { g.money -= 200; } },
      { text: 'Ignorar al inspector', cost: 'Gratis', hint: '⚠️ Riesgoso. Puede dañar tu reputación.', result: '-10 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 10); } },
    ],
    minLevel: 1
  },
  {
    id: 'celebrity_visit',
    icon: '🌟',
    title: 'Visita de un Famoso',
    desc: 'Un influencer fitness quiere entrenar en tu gym hoy. ¿Cómo lo manejás?',
    choices: [
      { text: 'Dejarlo entrenar gratis', cost: 'Gratis', hint: 'Gran boost de reputación. Su audiencia va a conocer tu gym.', result: '+30 reputación y +50 XP', effect: (g) => { g.reputation += 30; g.xp += 50; } },
      { text: 'Cobrarle membresía VIP', cost: 'Gratis', hint: 'Ganancia inmediata, pero pierde impacto en redes.', result: '+$2,000 y +5 rep', effect: (g) => { g.money += 2000; g.totalMoneyEarned += 2000; g.reputation += 5; } },
    ],
    minLevel: 3
  },
  {
    id: 'broken_equipment',
    icon: '🔧',
    title: 'Equipo Roto',
    desc: 'Se rompió una máquina y los miembros están molestos. Cada minuto sin resolver baja la moral.',
    choices: [
      { text: 'Reparar inmediatamente', cost: '-$800', hint: 'Solución práctica. Demuestra que te importa.', result: '+10 reputación', effect: (g) => { g.money -= 800; g.reputation += 10; } },
      { text: 'Poner cartel "fuera de servicio"', cost: 'Gratis', hint: '⚠️ Barato pero los miembros lo notan.', result: '-5 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 5); } },
      { text: 'Upgrade a equipo nuevo', cost: '-$2,000', hint: 'Inversión fuerte. Gran impacto positivo.', result: '+25 reputación y +50 XP', effect: (g) => { g.money -= 2000; g.reputation += 25; g.xp += 50; } },
    ],
    minLevel: 2
  },
  {
    id: 'sponsor_offer',
    icon: '💼',
    title: 'Oferta de Sponsor',
    desc: 'Una marca de suplementos quiere patrocinar tu gym. Te ofrecen plata a cambio de exclusividad.',
    choices: [
      { text: 'Aceptar el sponsoreo', cost: 'Gratis', hint: 'Ganancia segura. Plata + experiencia garantizada.', result: '+$3,000 y +20 XP', effect: (g) => { g.money += 3000; g.totalMoneyEarned += 3000; g.xp += 20; } },
      { text: 'Negociar mejor deal', cost: 'Gratis', hint: '🎲 Riesgo/recompensa. 50% de chance de duplicar la oferta, pero podés irte con las manos vacías.', result: '50% chance: +$6,000 o nada', effect: (g) => { if (Math.random() > 0.5) { g.money += 6000; g.totalMoneyEarned += 6000; } } },
      { text: 'Rechazar (mantener libertad)', cost: 'Gratis', hint: 'Sin plata pero tu gym mantiene su identidad. Bonus de reputación.', result: '+15 reputación', effect: (g) => { g.reputation += 15; } },
    ],
    minLevel: 4
  },
  {
    id: 'group_discount',
    icon: '👥',
    title: 'Grupo Corporativo',
    desc: 'Una empresa quiere membresías grupales con descuento para 8 empleados.',
    choices: [
      { text: 'Aceptar con descuento', cost: 'Gratis', hint: 'Seguro. Muchos miembros nuevos de golpe + algo de plata.', result: '+8 miembros y +$1,500', effect: (g) => { g.members = Math.min(g.members + 8, g.maxMembers); g.money += 1500; g.totalMoneyEarned += 1500; } },
      { text: 'Precio completo o nada', cost: 'Gratis', hint: '🎲 Solo 30% de chance de que acepten, pero pagás más por miembro.', result: '30% chance: +4 miembros y +$2,000', effect: (g) => { if (Math.random() < 0.3) { g.members = Math.min(g.members + 4, g.maxMembers); g.money += 2000; g.totalMoneyEarned += 2000; } } },
    ],
    minLevel: 3
  },
  {
    id: 'competition_invite',
    icon: '🏆',
    title: 'Invitación a Exhibición',
    desc: 'Te invitan a una exhibición de fuerza en un evento local. Gran oportunidad de marketing.',
    choices: [
      { text: 'Participar personalmente', cost: 'Gratis', hint: 'Máximo impacto. Tu cara representa el gym.', result: '+40 reputación y +80 XP', effect: (g) => { g.reputation += 40; g.xp += 80; } },
      { text: 'Enviar al mejor miembro', cost: 'Gratis', hint: 'Buen resultado pero con menor impacto personal.', result: '+20 reputación y +40 XP', effect: (g) => { g.reputation += 20; g.xp += 40; } },
    ],
    minLevel: 5
  },
  {
    id: 'water_leak',
    icon: '💧',
    title: 'Filtración de Agua',
    desc: 'Hay una filtración en el techo. El agua gotea sobre las máquinas.',
    choices: [
      { text: 'Arreglar ya', cost: '-$500', hint: 'Resolvelo antes de que empeore. Pequeño bonus de rep.', result: 'Problema resuelto, +5 rep', effect: (g) => { g.money -= 500; g.reputation += 5; } },
      { text: 'Dejarlo para después', cost: 'Gratis', hint: '⚠️ Muy riesgoso. Los miembros van a hablar mal del gym.', result: '-15 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 15); } },
    ],
    minLevel: 1
  },
  {
    id: 'fitness_challenge',
    icon: '🎯',
    title: 'Desafío Fitness Viral',
    desc: 'Un desafío de fitness se hizo viral en TikTok. Tu gym podría sumarse.',
    choices: [
      { text: 'Organizar el desafío en el gym', cost: '-$300', hint: 'Mejor opción. Atrae miembros nuevos y sube reputación.', result: '+5 miembros, +25 rep, +60 XP', effect: (g) => { g.members = Math.min(g.members + 5, g.maxMembers); g.reputation += 25; g.xp += 60; g.money -= 300; } },
      { text: 'Filmar y subir a redes', cost: 'Gratis', hint: 'Sin costo. Buen marketing gratis.', result: '+15 reputación y +30 XP', effect: (g) => { g.reputation += 15; g.xp += 30; } },
      { text: 'Ignorarlo', cost: 'Gratis', hint: 'Oportunidad perdida, pero no te afecta negativamente.', result: 'Nada pasa', effect: () => {} },
    ],
    minLevel: 2
  },
  {
    id: 'power_outage',
    icon: '⚡',
    title: 'Corte de Luz',
    desc: 'Se cortó la luz en todo el barrio. Tu gym está a oscuras y los miembros no pueden entrenar bien.',
    choices: [
      { text: 'Comprar generador', cost: '-$3,000', hint: 'Inversión grande pero a largo plazo te protege de futuros cortes. Gran reputación.', result: '+30 rep y +40 XP', effect: (g) => { g.money -= 3000; g.reputation += 30; g.xp += 40; } },
      { text: 'Entrenar a la luz de velas', cost: 'Gratis', hint: '🎲 Creativo. Puede salir bien o mal. Los miembros podrían encontrarlo divertido... o peligroso.', result: '70% chance: +10 rep. 30% chance: -5 rep y -1 miembro', effect: (g) => { if (Math.random() < 0.7) { g.reputation += 10; g.xp += 20; } else { g.reputation = Math.max(0, g.reputation - 5); g.members = Math.max(0, g.members - 1); } } },
      { text: 'Cerrar por hoy', cost: 'Gratis', hint: '⚠️ Fácil, pero los miembros se van a otro gym.', result: '-20 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 20); } },
    ],
    minLevel: 3
  },
  {
    id: 'member_complaint',
    icon: '😤',
    title: 'Queja de Miembro VIP',
    desc: 'Un miembro con mucha antigüedad amenaza con irse. Dice que la competencia tiene mejores instalaciones.',
    choices: [
      { text: 'Ofrecerle un mes gratis', cost: '-$500', hint: 'Gasto moderado. Lo retiene y mejora la percepción.', result: 'Se queda, +10 rep', effect: (g) => { g.money -= 500; g.reputation += 10; } },
      { text: 'Escuchar y prometer mejoras', cost: 'Gratis', hint: 'Sin costo. Lo calma por ahora pero el efecto es menor.', result: '+5 rep, se queda por ahora', effect: (g) => { g.reputation += 5; } },
      { text: 'Dejarlo ir', cost: 'Gratis', hint: '⚠️ Peligroso. Puede llevar a otros miembros con él.', result: '-2 miembros, -10 rep', effect: (g) => { g.members = Math.max(0, g.members - 2); g.reputation = Math.max(0, g.reputation - 10); } },
    ],
    minLevel: 2
  },
  {
    id: 'equipment_theft',
    icon: '🦹',
    title: 'Robo en el Gym',
    desc: 'Entraron a robar de noche. Faltan pesas y accesorios. Los miembros están preocupados.',
    choices: [
      { text: 'Instalar cámaras de seguridad', cost: '-$1,500', hint: 'Previene futuros robos y da tranquilidad a los miembros.', result: '+20 rep y +40 XP', effect: (g) => { g.money -= 1500; g.reputation += 20; g.xp += 40; } },
      { text: 'Hacer la denuncia policial', cost: '-$200', hint: 'Trámite burocrático. No soluciona la inseguridad.', result: 'Trámite hecho', effect: (g) => { g.money -= 200; } },
      { text: 'No hacer nada', cost: 'Gratis', hint: '⚠️ Los miembros se sienten inseguros y se van.', result: '-20 rep, -3 miembros', effect: (g) => { g.reputation = Math.max(0, g.reputation - 20); g.members = Math.max(0, g.members - 3); } },
    ],
    minLevel: 3
  },
  {
    id: 'flu_outbreak',
    icon: '🤒',
    title: 'Brote de Gripe',
    desc: 'Varios miembros se enfermaron. El gym está medio vacío y hay riesgo de contagio.',
    choices: [
      { text: 'Desinfección profesional', cost: '-$1,000', hint: 'Limpieza profunda. Los miembros lo agradecen mucho.', result: '+15 rep y +30 XP', effect: (g) => { g.money -= 1000; g.reputation += 15; g.xp += 30; } },
      { text: 'Poner alcohol en gel', cost: '-$200', hint: 'Mínimo esfuerzo. Algo es algo.', result: '+5 rep', effect: (g) => { g.money -= 200; g.reputation += 5; } },
      { text: 'Esperar que pase', cost: 'Gratis', hint: '⚠️ Los sanos empiezan a irse también.', result: '-3 miembros, -10 rep', effect: (g) => { g.members = Math.max(0, g.members - 3); g.reputation = Math.max(0, g.reputation - 10); } },
    ],
    minLevel: 2
  },
  {
    id: 'negative_review',
    icon: '📱',
    title: 'Reseña Negativa Viral',
    desc: 'Un ex-miembro publicó una reseña de 1 estrella en Google que se hizo viral.',
    choices: [
      { text: 'Responder profesionalmente', cost: 'Gratis', hint: 'La mejor estrategia. Mostrás madurez y profesionalismo.', result: '+10 rep y +20 XP', effect: (g) => { g.reputation += 10; g.xp += 20; } },
      { text: 'Campaña de reseñas positivas', cost: '-$800', hint: 'Pedile a miembros actuales que dejen buenas reseñas.', result: '+25 rep y +40 XP', effect: (g) => { g.money -= 800; g.reputation += 25; g.xp += 40; } },
      { text: 'Ignorarlo', cost: 'Gratis', hint: '⚠️ El algoritmo prioriza la reseña negativa.', result: '-15 reputación', effect: (g) => { g.reputation = Math.max(0, g.reputation - 15); } },
    ],
    minLevel: 4
  },
  {
    id: 'gym_tournament',
    icon: '🏋️',
    title: 'Torneo en Tu Gym',
    desc: 'Una federación quiere organizar un torneo amateur de levantamiento en tus instalaciones.',
    choices: [
      { text: 'Organizar el torneo', cost: '-$2,000', hint: 'Gran inversión pero enorme visibilidad. El gym se llena.', result: '+$5,000, +50 rep, +100 XP', effect: (g) => { g.money += 3000; g.totalMoneyEarned += 5000; g.reputation += 50; g.xp += 100; } },
      { text: 'Cobrar entrada y comisión', cost: 'Gratis', hint: 'Menos trabajo. Ganancia segura con menor impacto.', result: '+$2,000, +15 rep', effect: (g) => { g.money += 2000; g.totalMoneyEarned += 2000; g.reputation += 15; } },
    ],
    minLevel: 6
  },
  {
    id: 'supplier_deal',
    icon: '📦',
    title: 'Oferta de Proveedor',
    desc: 'Un proveedor de equipamiento te ofrece un lote con descuento por renovación de stock.',
    choices: [
      { text: 'Comprar el lote', cost: '-$3,000', hint: 'Mejora la calidad general del gym. Inversión que vale.', result: '+30 rep, +80 XP', effect: (g) => { g.money -= 3000; g.reputation += 30; g.xp += 80; } },
      { text: 'Negociar financiación', cost: '-$1,500', hint: 'Pagás la mitad ahora. Menor impacto pero más accesible.', result: '+15 rep, +40 XP', effect: (g) => { g.money -= 1500; g.reputation += 15; g.xp += 40; } },
      { text: 'No me interesa', cost: 'Gratis', hint: 'Sin costo, sin beneficio. Oportunidad perdida.', result: 'Nada', effect: () => {} },
    ],
    minLevel: 5
  },
  {
    id: 'journalist_visit',
    icon: '📰',
    title: 'Nota Periodística',
    desc: 'Un periodista local quiere hacer una nota sobre tu gym para el diario del barrio.',
    choices: [
      { text: 'Dar la entrevista', cost: 'Gratis', hint: 'Publicidad gratuita. Gran exposición local.', result: '+40 rep, +5 miembros, +60 XP', effect: (g) => { g.reputation += 40; g.members = Math.min(g.members + 5, g.maxMembers); g.xp += 60; } },
      { text: 'Pagar por publicidad extra', cost: '-$1,500', hint: 'Nota + media página de publicidad en el diario. Máximo impacto.', result: '+80 rep, +10 miembros, +100 XP', effect: (g) => { g.money -= 1500; g.reputation += 80; g.members = Math.min(g.members + 10, g.maxMembers); g.xp += 100; } },
    ],
    minLevel: 5
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
      { id: 'eq_durability', name: 'Durabilidad', icon: '🛡️', desc: '-15% costo de mejora de equipos.', cost: 3000, reqLevel: 3, effect: { equipCostMult: 0.85 } },
      { id: 'eq_efficiency', name: 'Eficiencia', icon: '⚡', desc: '+25% ingresos de todo el equipamiento.', cost: 25000, reqLevel: 7, requires: 'eq_durability', effect: { equipIncomeMult: 1.25 } },
      { id: 'eq_premium', name: 'Línea Premium', icon: '💎', desc: '+50% capacidad de equipamiento.', cost: 150000, reqLevel: 12, requires: 'eq_efficiency', effect: { equipCapacityMult: 1.5 } },
      { id: 'eq_mastery', name: 'Maestría Total', icon: '👑', desc: '+100% ingresos de equipo y -25% costos.', cost: 1000000, reqLevel: 17, requires: 'eq_premium', effect: { equipIncomeMult: 2.0, equipCostMult: 0.75 } },
      { id: 'eq_reinforced', name: 'Blindaje Industrial', icon: '🔰', desc: '-50% chance de rotura de equipos.', cost: 8000000, reqLevel: 22, requires: 'eq_mastery', effect: { breakdownChanceMult: 0.5 } },
    ]
  },
  marketing: {
    name: 'Marketing',
    icon: '📢',
    color: 'var(--cyan)',
    skills: [
      { id: 'mk_reach', name: 'Mayor Alcance', icon: '📡', desc: '+30% miembros de campañas.', cost: 5000, reqLevel: 4, effect: { campaignMembersMult: 1.3 } },
      { id: 'mk_viral', name: 'Viralización', icon: '🔥', desc: 'Campañas duran 50% más.', cost: 30000, reqLevel: 8, requires: 'mk_reach', effect: { campaignDurationMult: 1.5 } },
      { id: 'mk_brand', name: 'Marca Fuerte', icon: '🏷️', desc: '+50% reputación de campañas.', cost: 200000, reqLevel: 13, requires: 'mk_viral', effect: { campaignRepMult: 1.5 } },
      { id: 'mk_empire', name: 'Imperio Mediático', icon: '📺', desc: '-40% costo de campañas, +100% miembros.', cost: 1500000, reqLevel: 18, requires: 'mk_brand', effect: { campaignCostMult: 0.6, campaignMembersMult: 2.0 } },
      { id: 'mk_monopoly', name: 'Monopolio', icon: '🦈', desc: 'Rivales roban 50% menos miembros.', cost: 10000000, reqLevel: 23, requires: 'mk_empire', effect: { rivalStealMult: 0.5 } },
    ]
  },
  staff: {
    name: 'Personal',
    icon: '👥',
    color: 'var(--purple)',
    skills: [
      { id: 'st_training', name: 'Capacitación', icon: '📚', desc: '+30% efecto de todo el staff.', cost: 4000, reqLevel: 4, effect: { staffEffectMult: 1.3 } },
      { id: 'st_motivation', name: 'Motivación', icon: '💪', desc: 'Staff genera +50% reputación.', cost: 40000, reqLevel: 9, requires: 'st_training', effect: { staffRepMult: 1.5 } },
      { id: 'st_synergy', name: 'Sinergia', icon: '🤝', desc: 'Cada staff contratado da +5% ingreso extra.', cost: 250000, reqLevel: 14, requires: 'st_motivation', effect: { staffSynergyBonus: 0.05 } },
      { id: 'st_legends', name: 'Staff Legendario', icon: '🌟', desc: '-30% costo staff, 2x auto-miembros.', cost: 2000000, reqLevel: 19, requires: 'st_synergy', effect: { staffCostMult: 0.7, autoMembersMult: 2.0 } },
      { id: 'st_resilience', name: 'Resiliencia', icon: '💊', desc: '-50% enfermedad, training 30% más rápido.', cost: 12000000, reqLevel: 24, requires: 'st_legends', effect: { sickChanceMult: 0.5, trainingSpeedMult: 0.7 } },
    ]
  },
  members: {
    name: 'Miembros',
    icon: '🏃',
    color: 'var(--green)',
    skills: [
      { id: 'mb_welcome', name: 'Bienvenida', icon: '🤗', desc: '+20% miembros atraídos por equipo.', cost: 2500, reqLevel: 3, effect: { memberAttractionMult: 1.2 } },
      { id: 'mb_retention', name: 'Retención', icon: '🔒', desc: '+40% capacidad máxima.', cost: 35000, reqLevel: 8, requires: 'mb_welcome', effect: { capacityMult: 1.4 } },
      { id: 'mb_premium_tier', name: 'Membresía Premium', icon: '💳', desc: 'Cada miembro genera +100% ingreso.', cost: 180000, reqLevel: 13, requires: 'mb_retention', effect: { memberIncomeMult: 2.0 } },
      { id: 'mb_loyalty', name: 'Lealtad Total', icon: '❤️', desc: '+200% rep por miembro, +50% capacidad.', cost: 1200000, reqLevel: 18, requires: 'mb_premium_tier', effect: { memberRepMult: 3.0, capacityMult: 1.5 } },
      { id: 'mb_community', name: 'Comunidad', icon: '🏘️', desc: 'Clases 2x ingresos, VIPs +50% recompensa.', cost: 9000000, reqLevel: 23, requires: 'mb_loyalty', effect: { classIncomeMult: 2.0, vipRewardMult: 1.5 } },
    ]
  },
  infrastructure: {
    name: 'Infraestructura',
    icon: '🏗️',
    color: '#f59e0b',
    skills: [
      { id: 'inf_planning', name: 'Planificación', icon: '📐', desc: 'Construcción de zonas 25% más rápida.', cost: 6000, reqLevel: 5, effect: { zoneBuildSpeedMult: 0.75 } },
      { id: 'inf_contractors', name: 'Contratistas', icon: '👷', desc: 'Mejoras de equipo 30% más rápidas.', cost: 50000, reqLevel: 10, requires: 'inf_planning', effect: { equipUpgradeSpeedMult: 0.7 } },
      { id: 'inf_logistics', name: 'Logística', icon: '📦', desc: '+1 mejora de equipo simultánea.', cost: 350000, reqLevel: 15, requires: 'inf_contractors', effect: { extraConcurrentUpgrades: 1 } },
      { id: 'inf_engineering', name: 'Ingeniería', icon: '⚙️', desc: 'Construcciones 50% más rápidas, -20% costo zonas.', cost: 3000000, reqLevel: 20, requires: 'inf_logistics', effect: { zoneBuildSpeedMult: 0.5, zoneCostMult: 0.8 } },
      { id: 'inf_megaproject', name: 'Megaproyectos', icon: '🏛️', desc: 'Reparaciones 50% más rápidas.', cost: 15000000, reqLevel: 25, requires: 'inf_engineering', effect: { repairSpeedMult: 0.5 } },
    ]
  },
  competitions: {
    name: 'Competencias',
    icon: '🏆',
    color: '#ef4444',
    skills: [
      { id: 'comp_prep', name: 'Preparación', icon: '🎯', desc: '+15% chance de ganar competencias.', cost: 5000, reqLevel: 5, effect: { compWinChanceBonus: 0.15 } },
      { id: 'comp_strategy', name: 'Estrategia', icon: '🧠', desc: '-25% cooldown de competencias.', cost: 45000, reqLevel: 10, requires: 'comp_prep', effect: { compCooldownMult: 0.75 } },
      { id: 'comp_prize', name: 'Premios Mayores', icon: '💰', desc: '+50% premios de competencias.', cost: 300000, reqLevel: 15, requires: 'comp_strategy', effect: { compRewardMult: 1.5 } },
      { id: 'comp_reputation', name: 'Prestigio', icon: '🎖️', desc: '+100% rep de competencias.', cost: 2500000, reqLevel: 20, requires: 'comp_prize', effect: { compRepMult: 2.0 } },
      { id: 'comp_dynasty', name: 'Dinastía', icon: '🏰', desc: '-40% cooldown extra, competencias dan XP doble.', cost: 12000000, reqLevel: 25, requires: 'comp_reputation', effect: { compCooldownMult: 0.6, compXpMult: 2.0 } },
    ]
  }
};

// ===== GYM ZONES / EXPANSION =====
const GYM_ZONES = [
  { id: 'ground_floor', name: 'Planta Baja', icon: '🏠', desc: 'El corazón del gym. Tu base de operaciones.', cost: 0, capacityBonus: 10, incomeBonus: 0, reqLevel: 1, unlocked: true, buildTime: 0 },
  { id: 'first_floor', name: 'Primer Piso', icon: '🏢', desc: 'Más espacio, más máquinas, más miembros.', cost: 50000, capacityBonus: 30, incomeBonus: 10, reqLevel: 6, buildTime: 180 },
  { id: 'basement', name: 'Sótano', icon: '🔨', desc: 'Zona hardcore. Pesas pesadas, chalk, gritos.', cost: 300000, capacityBonus: 25, incomeBonus: 20, reqLevel: 10, buildTime: 600 },
  { id: 'rooftop', name: 'Terraza', icon: '☀️', desc: 'Entrenamiento al aire libre con vista.', cost: 1000000, capacityBonus: 20, incomeBonus: 30, reqLevel: 13, buildTime: 1800 },
  { id: 'annex', name: 'Edificio Anexo', icon: '🏗️', desc: 'Un edificio completo al lado. Duplicás tu gym.', cost: 5000000, capacityBonus: 60, incomeBonus: 50, reqLevel: 16, buildTime: 3600 },
  { id: 'arena', name: 'Arena de Competición', icon: '🏟️', desc: 'Arena propia para competencias y eventos. +rep masivo.', cost: 15000000, capacityBonus: 40, incomeBonus: 80, reqLevel: 19, buildTime: 7200 },
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
  { target: '.gym-scene-container', title: '¡Bienvenido a tu Gimnasio!', text: 'Este es tu gym. Acá ves el nombre, la categoría y el equipamiento instalado. Ahora está vacío... ¡vamos a cambiarlo!', tab: 'gym' },
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
  { target: '.gym-scene-container', title: '¡A Jugar!', text: 'Consejo: el juego genera plata aunque cierres el navegador (hasta 2 horas). Entrá todos los días por el bonus, hacé misiones, dictá clases y competí. ¡Construí tu Iron Empire!', tab: 'gym' },
];

// ===== OPERATING COSTS =====
const OPERATING_COSTS = {
  baseRent: 120,             // per game day (600 ticks = 10 min real)
  rentPerExtraZone: 60,      // additional rent per zone beyond ground floor
  utilitiesPerEquipLevel: 5, // utilities cost per total equipment level per game day
  propertyPrice: 2000000,    // one-time purchase to eliminate rent
  propertyReqLevel: 18,
};

// ===== SUPPLEMENTS =====
const SUPPLEMENTS = [
  { id: 'protein', name: 'Proteína en Polvo', icon: '🥤', desc: 'El clásico batido post-entreno. Más ingresos para tu gym.', cost: 300, duration: 180, effects: { incomeMult: 1.2 }, reqLevel: 2 },
  { id: 'creatine', name: 'Creatina', icon: '💊', desc: 'Más fuerza, más resistencia. Tu gym atrae más gente.', cost: 600, duration: 180, effects: { capacityBonus: 10 }, reqLevel: 4 },
  { id: 'preworkout', name: 'Pre-Workout', icon: '⚡', desc: 'Energía explosiva. Las clases rinden mucho más.', cost: 1000, duration: 240, effects: { classIncomeMult: 1.3 }, reqLevel: 6 },
  { id: 'bcaa', name: 'BCAA', icon: '🧪', desc: 'Aminoácidos de cadena ramificada. Mejoran tu reputación.', cost: 2000, duration: 240, effects: { repBonus: 15, repPerMin: 5 }, reqLevel: 8 },
  { id: 'fatburner', name: 'Quemador de Grasa', icon: '🔥', desc: 'Termogénico potente. Potencia tus campañas de marketing.', cost: 4000, duration: 300, effects: { marketingMult: 1.3 }, reqLevel: 10 },
  { id: 'glutamine', name: 'Glutamina', icon: '💚', desc: 'Recuperación muscular. Más capacidad para tu gym.', cost: 8000, duration: 300, effects: { capacityBonus: 15 }, reqLevel: 13 },
  { id: 'massgainer', name: 'Mass Gainer', icon: '🏋️', desc: 'Calorías y proteína masiva. El equipamiento rinde más.', cost: 15000, duration: 300, effects: { equipIncomeMult: 1.4 }, reqLevel: 16 },
  { id: 'multivitamin', name: 'Multivitamínico Premium', icon: '🌟', desc: 'El suplemento definitivo. Mejora todo.', cost: 30000, duration: 360, effects: { incomeMult: 1.25, repPerMin: 5 }, reqLevel: 20 },
];

// ===== RIVAL GYMS =====
const RIVAL_GYMS = [
  { id: 'barrio', name: 'Garage Gym del Barrio', icon: '🏚️', desc: 'El vecino armó un gym en su garage. Básico pero barato, te roba principiantes.', memberSteal: 2, promoCost: 500, promoDuration: 300, defeatCost: 5000, defeatBonus: { income: 5, capacity: 0 }, reqLevel: 3 },
  { id: 'fitzone', name: 'FitZone Express', icon: '🏃', desc: 'Cadena low-cost con máquinas nuevas. Atrae a los que buscan precio.', memberSteal: 4, promoCost: 1500, promoDuration: 300, defeatCost: 15000, defeatBonus: { income: 0, capacity: 10 }, reqLevel: 5 },
  { id: 'powerhouse', name: 'PowerHouse Gym', icon: '💪', desc: 'Gym hardcore para levantadores serios. Competencia directa.', memberSteal: 7, promoCost: 4000, promoDuration: 300, defeatCost: 40000, defeatBonus: { income: 10, capacity: 0 }, reqLevel: 8 },
  { id: 'crossfit_box', name: 'CrossFit Box del Centro', icon: '🤸', desc: 'La moda del CrossFit. Comunidad fanática que arrastra miembros.', memberSteal: 12, promoCost: 10000, promoDuration: 300, defeatCost: 100000, defeatBonus: { income: 0, capacity: 20 }, reqLevel: 11 },
  { id: 'megafit', name: 'MegaFit Premium', icon: '💎', desc: 'Gym premium con spa, pileta y todo. Difícil de competir.', memberSteal: 18, promoCost: 25000, promoDuration: 300, defeatCost: 250000, defeatBonus: { income: 25, capacity: 0 }, reqLevel: 15 },
  { id: 'empire', name: 'Empire Fitness', icon: '🏛️', desc: 'Tu mayor rival. Una cadena enorme con recursos ilimitados. El jefe final.', memberSteal: 30, promoCost: 60000, promoDuration: 300, defeatCost: 600000, defeatBonus: { income: 50, capacity: 20 }, reqLevel: 18 },
];
