// ===== IRON EMPIRE - GAME DATA =====

const STAFF_MAX_LEVEL = 5;
const STAFF_EXTRA_UNLOCK = { 2: 12, 3: 20 }; // 2nd copy at player level 12, 3rd at 20

const EQUIPMENT = [
  { id: 'dumbbells', name: 'Mancuernas', icon: '🏋️', desc: 'El básico de todo gym. Atraen principiantes.', baseCost: 50, costMult: 1.85, incomePerLevel: 0.4, membersPerLevel: 2, capacityPerLevel: 0, reqLevel: 1 },
  { id: 'bench', name: 'Banco Plano', icon: '🏋️‍♀️', desc: 'Press de banca, el rey de los ejercicios.', baseCost: 200, costMult: 1.9, incomePerLevel: 1.0, membersPerLevel: 3, capacityPerLevel: 2, reqLevel: 1 },
  { id: 'squat_rack', name: 'Squat Rack', icon: '🔱', desc: 'Para los que no saltean leg day.', baseCost: 600, costMult: 1.95, incomePerLevel: 2.0, membersPerLevel: 4, capacityPerLevel: 3, reqLevel: 2 },
  { id: 'treadmill', name: 'Cinta de Correr', icon: '🏃‍♂️', desc: 'Cardio warriors love this.', baseCost: 1500, costMult: 1.95, incomePerLevel: 1.6, membersPerLevel: 5, capacityPerLevel: 3, reqLevel: 3 },
  { id: 'cables', name: 'Polea / Cables', icon: '🔗', desc: 'Versatilidad total. Mil ejercicios.', baseCost: 4000, costMult: 2.0, incomePerLevel: 3.2, membersPerLevel: 5, capacityPerLevel: 4, reqLevel: 4 },
  { id: 'leg_press', name: 'Prensa de Piernas', icon: '💺', desc: 'Para empujar peso de verdad.', baseCost: 10000, costMult: 2.05, incomePerLevel: 4.5, membersPerLevel: 6, capacityPerLevel: 4, reqLevel: 5 },
  { id: 'smith', name: 'Smith Machine', icon: '⚒️', desc: 'Guiada y segura. Ideal para entrenar solo.', baseCost: 25000, costMult: 2.1, incomePerLevel: 7.0, membersPerLevel: 7, capacityPerLevel: 5, reqLevel: 7 },
  { id: 'pool', name: 'Pileta de Natación', icon: '🏊', desc: 'El upgrade premium. Cambia todo.', baseCost: 75000, costMult: 2.25, incomePerLevel: 16, membersPerLevel: 15, capacityPerLevel: 10, reqLevel: 9 },
  { id: 'sauna', name: 'Sauna', icon: '🧖', desc: 'Relax post-entreno. Atrae membresías premium.', baseCost: 180000, costMult: 2.3, incomePerLevel: 22, membersPerLevel: 12, capacityPerLevel: 5, reqLevel: 11 },
  { id: 'crossfit', name: 'Zona CrossFit', icon: '🤸', desc: 'Box jumps, rope climbs, WODs. La fiebre CrossFit.', baseCost: 450000, costMult: 2.35, incomePerLevel: 32, membersPerLevel: 20, capacityPerLevel: 15, reqLevel: 13 },
  { id: 'boxing', name: 'Ring de Boxeo', icon: '🥊', desc: 'Entrenamiento de combate. Atrae fighters.', baseCost: 1200000, costMult: 2.4, incomePerLevel: 48, membersPerLevel: 25, capacityPerLevel: 10, reqLevel: 15 },
  { id: 'spa', name: 'Spa Completo', icon: '💆', desc: 'Masajes, crioterapia, el paquete full.', baseCost: 3500000, costMult: 2.5, incomePerLevel: 80, membersPerLevel: 30, capacityPerLevel: 8, reqLevel: 18 },
];

const STAFF = [
  { id: 'trainer', name: 'Entrenador', icon: '💪', role: 'Personal Trainer', effect: '+50% ingresos de equipamiento', costBase: 500, costMult: 2.5, salary: 63, incomeMult: 0.5, reqLevel: 2 },
  { id: 'receptionist', name: 'Recepcionista', icon: '👩‍💼', role: 'Atención al Cliente', effect: '+1 miembro cada 25s automático', costBase: 1000, costMult: 2.5, salary: 88, autoMembers: 1, reqLevel: 3 },
  { id: 'cleaner', name: 'Personal de Limpieza', icon: '🧹', role: 'Mantenimiento', effect: '+20% reputación por tick', costBase: 800, costMult: 2.0, salary: 50, repMult: 0.2, reqLevel: 4 },
  { id: 'nutritionist', name: 'Nutricionista', icon: '🥗', role: 'Asesor Nutricional', effect: '+30% ingresos, +5 capacidad', costBase: 3000, costMult: 2.5, salary: 150, incomeMult: 0.3, capacityBonus: 5, reqLevel: 6 },
  { id: 'physio', name: 'Kinesiólogo', icon: '🩺', role: 'Rehabilitación', effect: '+40% reputación, reduce lesiones', costBase: 5000, costMult: 2.5, salary: 200, repMult: 0.4, reqLevel: 8 },
  { id: 'influencer', name: 'Influencer Fitness', icon: '📱', role: 'Marketing', effect: '+1 miembro cada 20s, +reputación', costBase: 8000, costMult: 3.0, salary: 300, autoMembers: 1, repMult: 0.3, reqLevel: 10 },
  { id: 'manager', name: 'Gerente', icon: '👔', role: 'Administración', effect: '-20% costos de todo', costBase: 15000, costMult: 3.0, salary: 500, costReduction: 0.2, reqLevel: 12 },
  { id: 'champion', name: 'Campeón Retirado', icon: '🏅', role: 'Embajador', effect: 'x2 premios de competencias', costBase: 50000, costMult: 3.5, salary: 875, compMult: 2, reqLevel: 15 },
];

const COMPETITIONS = [
  { id: 'local', name: 'Torneo de Barrio', icon: '🏠', desc: 'Competencia local de pesas. Bajo riesgo.', reward: 500, repReward: 10, xpReward: 30, cooldown: 900, minRep: 0, winChance: 0.8 },
  { id: 'city', name: 'Campeonato Municipal', icon: '🏙️', desc: 'Los mejores del municipio. Nivel intermedio.', reward: 2000, repReward: 30, xpReward: 80, cooldown: 1800, minRep: 50, winChance: 0.6 },
  { id: 'regional', name: 'Regional de Powerlifting', icon: '🗺️', desc: 'Deadlift, squat, bench. Los tres grandes.', reward: 8000, repReward: 80, xpReward: 200, cooldown: 5400, minRep: 200, winChance: 0.45 },
  { id: 'national', name: 'Nacional de Fuerza', icon: '🇦🇷', desc: 'Lo mejor del país compite acá.', reward: 30000, repReward: 200, xpReward: 500, cooldown: 10800, minRep: 500, winChance: 0.3 },
  { id: 'continental', name: 'Sudamericano', icon: '🌎', desc: 'Argentina vs. Brasil vs. todos. Épico.', reward: 100000, repReward: 500, xpReward: 1200, cooldown: 21600, minRep: 1500, winChance: 0.2 },
  { id: 'world', name: 'Mundial de Pesas', icon: '🌍', desc: 'El pináculo. Solo los mejores del mundo.', reward: 500000, repReward: 2000, xpReward: 5000, cooldown: 43200, minRep: 5000, winChance: 0.1 },
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
  { id: 'first_prestige', name: 'Primera Sucursal', icon: '🏙️', desc: 'Abrí tu segunda sucursal', check: () => Object.keys(game.branches).length >= 2 },
  { id: 'three_branches', name: 'Cadena', icon: '🏢', desc: 'Tené 3 sucursales activas', check: () => Object.keys(game.branches).length >= 3 },
  { id: 'all_neighborhoods', name: 'Rey de Buenos Aires', icon: '👑', desc: 'Tené un gym en cada barrio', check: () => Object.keys(game.branches).length >= 6 },
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
  // Chaos mechanics
  { id: 'first_repair', name: 'Técnico', icon: '🔧', desc: 'Repará tu primer equipo roto', check: () => game.stats.equipRepaired >= 1 },
  { id: 'repair_master', name: 'Maestro Mecánico', icon: '⚙️', desc: 'Repará 10 equipos', check: () => game.stats.equipRepaired >= 10 },
  { id: 'first_heal', name: 'Doctor del Gym', icon: '💊', desc: 'Curá a un empleado enfermo', check: () => game.stats.staffHealed >= 1 },
  { id: 'survivor', name: 'Sobreviviente', icon: '🛡️', desc: 'Soportá 20 roturas de equipo', check: () => game.stats.equipBreakdowns >= 20 },
  // Construction & upgrades
  { id: 'property_owner', name: 'Propietario', icon: '🏠', desc: 'Comprá el local', check: () => game.ownProperty },
  { id: 'level_15', name: 'Nivel 15', icon: '⚡', desc: 'Llegá al nivel 15', check: () => game.level >= 15 },
  { id: 'level_25', name: 'Nivel 25', icon: '🔱', desc: 'Llegá al nivel 25', check: () => game.level >= 25 },
  // Staff training
  { id: 'train_staff', name: 'Entrenador de Entrenadores', icon: '📚', desc: 'Entrenrá un staff a nivel 3', check: () => Object.values(game.staff).some(s => s.hired && s.level >= 3) },
  { id: 'max_staff_level', name: 'Staff Élite', icon: '🎓', desc: 'Llevar un staff a nivel 5', check: () => Object.values(game.staff).some(s => s.hired && s.level >= 5) },
  { id: 'hire_extra', name: 'Duplicador', icon: '👯', desc: 'Contratá un segundo empleado del mismo tipo', check: () => Object.values(game.staff).some(s => s.extras && s.extras.length >= 1) },
  // Skills
  { id: 'five_skills', name: 'Investigador Avanzado', icon: '🔬', desc: 'Investigá 5 mejoras', check: () => game.stats.skillsResearched >= 5 },
  { id: 'fifteen_skills', name: 'Científico Loco', icon: '🧪', desc: 'Investigá 15 mejoras', check: () => game.stats.skillsResearched >= 15 },
  { id: 'all_skills', name: 'Omnisciente', icon: '🧠', desc: 'Investigá las 30 mejoras', check: () => game.stats.skillsResearched >= 30 },
  // Competition mastery
  { id: 'ten_comp_wins', name: 'Veterano', icon: '🎖️', desc: 'Ganá 10 competencias', check: () => game.stats.competitionsWon >= 10 },
  { id: 'fifty_comp_wins', name: 'Leyenda', icon: '🏅', desc: 'Ganá 50 competencias', check: () => game.stats.competitionsWon >= 50 },
  { id: 'world_champ', name: 'Campeón Mundial', icon: '🌍', desc: 'Ganá el Mundial de Pesas', check: () => (game.competitions.world?.wins || 0) >= 1 },
  // Rivals
  { id: 'first_rival', name: 'Rival Derrotado', icon: '💀', desc: 'Derrotá a tu primer rival', check: () => game.stats.rivalsDefeated >= 1 },
  { id: 'all_rivals', name: 'Monopolio Local', icon: '🦈', desc: 'Derrotá a todos los rivales', check: () => game.stats.rivalsDefeated >= 6 },
  // Money milestones
  { id: 'hundred_million', name: 'Cien Millones', icon: '💸', desc: 'Ganá $100,000,000 en total', check: () => game.totalMoneyEarned >= 100000000 },
  { id: 'billion', name: 'Billonario', icon: '🏦', desc: 'Ganá $1,000,000,000 en total', check: () => game.totalMoneyEarned >= 1000000000 },
  // Supplements
  { id: 'supp_addict', name: 'Suplementado', icon: '💉', desc: 'Comprá 20 suplementos', check: () => game.stats.supplementsBought >= 20 },
  // Rep
  { id: 'rep_5000', name: 'Ícono', icon: '🌟', desc: 'Llegá a 5000 de reputación', check: () => game.reputation >= 5000 },
  { id: 'rep_10000', name: 'Leyenda del Fitness', icon: '👑', desc: 'Llegá a 10000 de reputación', check: () => game.reputation >= 10000 },
  // Playtime
  { id: 'play_1h', name: 'Enganchado', icon: '⏰', desc: 'Jugá 1 hora en total', check: () => game.stats.totalPlayTime >= 3600 },
  { id: 'play_10h', name: 'Adicto al Gym', icon: '🕐', desc: 'Jugá 10 horas en total', check: () => game.stats.totalPlayTime >= 36000 },
  // Classes
  { id: 'fifty_classes', name: 'Profesor Titular', icon: '🎓', desc: 'Completá 50 clases', check: () => game.stats.classesCompleted >= 50 },
  // Members
  { id: 'thousand_members', name: 'Mil Miembros', icon: '🏟️', desc: 'Llegá a 1000 miembros', check: () => game.members >= 1000 },
  // Champion
  { id: 'champion_recruit', name: 'El Elegido', icon: '🏅', desc: 'Reclutá a tu primer campeón', check: () => game.champion && game.champion.recruited },
  { id: 'champion_lvl5', name: 'Contendiente', icon: '🥊', desc: 'Subí tu campeón a nivel 5', check: () => game.champion && game.champion.level >= 5 },
  { id: 'champion_lvl10', name: 'Profesional', icon: '🏆', desc: 'Subí tu campeón a nivel 10', check: () => game.champion && game.champion.level >= 10 },
  { id: 'champion_bestia', name: 'La Bestia', icon: '💪', desc: 'Tu campeón llegó a etapa Bestia', check: () => game.champion && game.champion.recruited && (game.champion.stats.fuerza + game.champion.stats.resistencia + game.champion.stats.velocidad + game.champion.stats.tecnica) >= 200 },
  { id: 'champion_wins3', name: 'Racha Ganadora', icon: '🔥', desc: 'Ganá 3 competencias con tu campeón', check: () => game.stats.championWins >= 3 },
  { id: 'champion_equipped', name: 'Full Equipo', icon: '⚔️', desc: 'Equipá las 4 ranuras del campeón', check: () => game.champion && game.champion.equipment && game.champion.equipment.hands && game.champion.equipment.waist && game.champion.equipment.feet && game.champion.equipment.head },
  // Decoration & Profile
  { id: 'first_decoration', name: 'Decorador', icon: '🎨', desc: 'Comprá tu primera decoración', check: () => game.decoration && Object.keys(game.decoration.items || {}).length >= 1 },
  { id: 'five_decorations', name: 'Diseñador de Interiores', icon: '🏠', desc: 'Comprá 5 decoraciones', check: () => game.decoration && Object.keys(game.decoration.items || {}).length >= 5 },
  { id: 'all_decorations', name: 'Gym Completo', icon: '🖼️', desc: 'Comprá las 10 decoraciones', check: () => game.decoration && Object.keys(game.decoration.items || {}).length >= 10 },
  { id: 'three_themes', name: 'Fashionista', icon: '🌈', desc: 'Desbloqueá 3 temas visuales', check: () => game.decoration && (game.decoration.unlockedThemes || []).length >= 3 },
  { id: 'set_title', name: 'Identificado', icon: '👤', desc: 'Elegí un título activo para tu perfil', check: () => game.profile && game.profile.activeTitle && game.profile.activeTitle !== 'principiante' },
  { id: 'iron_legend', name: 'Iron Legend', icon: '🔥', desc: 'Obtené el título Iron Legend', check: () => game.level >= 25 && game.totalMoneyEarned >= 10000000 && game.stats.championWins >= 50 },
  // Instructors
  { id: 'first_instructor', name: 'Primer Profe', icon: '👨‍🏫', desc: 'Contratá tu primer instructor de clase', check: () => Object.values(game.instructors).some(i => i.hired) },
  { id: 'all_instructors', name: 'Plantel Completo', icon: '👨‍🏫', desc: 'Contratá los 8 instructores', check: () => typeof CLASS_INSTRUCTORS !== 'undefined' && CLASS_INSTRUCTORS.every(i => game.instructors[i.id]?.hired) },
  { id: 'max_instructor', name: 'Profe Nivel 5', icon: '⭐', desc: 'Llevá a un instructor al nivel máximo', check: () => Object.values(game.instructors).some(i => i.hired && i.level >= 5) },
];

const GYM_CLASSES = [
  { id: 'yoga', name: 'Yoga', icon: '🧘', desc: 'Flexibilidad y paz mental.', duration: 120, income: 200, cost: 80, xp: 40, rep: 5, reqLevel: 2, cooldown: 600 },
  { id: 'spinning', name: 'Spinning', icon: '🚴', desc: 'Cardio intenso sobre ruedas.', duration: 90, income: 300, cost: 130, xp: 50, rep: 8, reqLevel: 3, cooldown: 480, reqEquipment: 'treadmill' },
  { id: 'pilates', name: 'Pilates', icon: '🤸', desc: 'Core y control corporal.', duration: 120, income: 350, cost: 150, xp: 45, rep: 7, reqLevel: 4, cooldown: 600 },
  { id: 'zumba', name: 'Zumba', icon: '💃', desc: 'Bailá y entrenate al mismo tiempo.', duration: 90, income: 350, cost: 140, xp: 45, rep: 10, reqLevel: 4, cooldown: 540 },
  { id: 'hiit', name: 'HIIT', icon: '💥', desc: 'Intervalos de alta intensidad. Quemá todo.', duration: 60, income: 400, cost: 200, xp: 60, rep: 10, reqLevel: 5, cooldown: 360 },
  { id: 'boxing_class', name: 'Boxeo Fitness', icon: '🥊', desc: 'Golpeá la bolsa, liberá stress.', duration: 75, income: 500, cost: 280, xp: 70, rep: 12, reqLevel: 7, cooldown: 500, reqEquipment: 'boxing' },
  { id: 'crossfit_class', name: 'WOD CrossFit', icon: '🏋️', desc: 'Workout Of the Day. Intenso.', duration: 60, income: 600, cost: 350, xp: 80, rep: 15, reqLevel: 9, cooldown: 400, reqEquipment: 'crossfit' },
  { id: 'swimming', name: 'Natación Guiada', icon: '🏊', desc: 'Técnica y resistencia en el agua.', duration: 90, income: 700, cost: 400, xp: 90, rep: 18, reqLevel: 11, cooldown: 600, reqEquipment: 'pool' },
];

const CLASS_INSTRUCTORS = [
  { id: 'yoga',           name: 'Profe de Yoga',      icon: '🧘', hireCost: 300,   upgradeMult: 2.5, commission: 0.15, reqLevel: 2 },
  { id: 'spinning',       name: 'Profe de Spinning',  icon: '🚴', hireCost: 600,   upgradeMult: 2.5, commission: 0.15, reqLevel: 3 },
  { id: 'pilates',        name: 'Profe de Pilates',   icon: '🤸', hireCost: 1000,  upgradeMult: 2.5, commission: 0.15, reqLevel: 4 },
  { id: 'zumba',          name: 'Profe de Zumba',     icon: '💃', hireCost: 1000,  upgradeMult: 2.5, commission: 0.15, reqLevel: 4 },
  { id: 'hiit',           name: 'Profe de HIIT',      icon: '💥', hireCost: 2000,  upgradeMult: 2.5, commission: 0.15, reqLevel: 5 },
  { id: 'boxing_class',   name: 'Profe de Boxeo',     icon: '🥊', hireCost: 5000,  upgradeMult: 2.5, commission: 0.15, reqLevel: 7 },
  { id: 'crossfit_class', name: 'Profe de CrossFit',  icon: '🏋️', hireCost: 12000, upgradeMult: 2.5, commission: 0.15, reqLevel: 9 },
  { id: 'swimming',       name: 'Profe de Natación',  icon: '🏊', hireCost: 25000, upgradeMult: 2.5, commission: 0.15, reqLevel: 11 },
];

const MARKETING_CAMPAIGNS = [
  // ===== SIEMPRE ACTIVAS (toggle ON/OFF — costo diario, generación continua) =====
  { id: 'flyers', name: 'Flyers', icon: '📄', type: 'always_on',
    desc: 'Repartir volantes por el barrio. Bajo costo, flujo constante de nuevos socios.',
    costPerDay: 120, membersPerDay: 3, repPerDay: 2, reqLevel: 1 },
  { id: 'whatsapp', name: 'Difusión WhatsApp', icon: '💬', type: 'always_on',
    desc: 'Grupo de difusión activo. El boca a boca digital que nunca para.',
    costPerDay: 300, membersPerDay: 6, repPerDay: 4, reqLevel: 2 },
  { id: 'instagram', name: 'Instagram Ads', icon: '📸', type: 'always_on',
    desc: 'Posteos y stories patrocinadas. Alcance constante en redes sociales.',
    costPerDay: 500, membersPerDay: 10, repPerDay: 7, reqLevel: 3 },
  { id: 'google_ads', name: 'Google Ads', icon: '🔍', type: 'always_on',
    desc: 'Aparecer primero en búsquedas. Alto intent de compra, flujo diario garantizado.',
    costPerDay: 1200, membersPerDay: 18, repPerDay: 12, reqLevel: 5 },
  // ===== DE IMPACTO (evento puntual con cooldown) =====
  { id: 'youtube', name: 'Video YouTube', icon: '🎥', type: 'burst',
    desc: 'Tour del gym que se hace viral. Genera un pico masivo de nuevos socios.',
    cost: 5000, membersBoost: 40, duration: 300, repBoost: 35, cooldown: 300, reqLevel: 7 },
  { id: 'radio', name: 'Publicidad en Radio', icon: '📻', type: 'burst',
    desc: 'Spot radial en hora pico. Llega a toda la ciudad en pocos días.',
    cost: 10000, membersBoost: 60, duration: 300, repBoost: 50, cooldown: 360, reqLevel: 9 },
  { id: 'tv', name: 'Spot de TV', icon: '📺', type: 'burst',
    desc: 'Publicidad televisiva. El big game del marketing local.',
    cost: 30000, membersBoost: 110, duration: 600, repBoost: 90, cooldown: 600, reqLevel: 12 },
  { id: 'celebrity', name: 'Sponsor Celebridad', icon: '🌟', type: 'burst',
    desc: 'Un famoso entrena en tu gym. Todo el mundo habla durante días.',
    cost: 80000, membersBoost: 220, duration: 900, repBoost: 220, cooldown: 900, reqLevel: 15 },
  { id: 'patrocinio', name: 'Patrocinio Corporativo', icon: '🏢', type: 'burst',
    desc: 'Una empresa grande usa tu gym para sus empleados. Contrato de imagen masivo.',
    cost: 200000, membersBoost: 400, duration: 1200, repBoost: 400, cooldown: 1800, reqLevel: 19 },
  { id: 'gala', name: 'Gala de Apertura', icon: '🎪', type: 'burst',
    desc: 'Evento masivo con prensa, influencers y streamers. El gym explota de gente.',
    cost: 500000, membersBoost: 800, duration: 2400, repBoost: 800, cooldown: 3600, reqLevel: 23 },
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
  {
    id: 'staff_burnout',
    icon: '😩',
    title: 'Burnout del Staff',
    desc: 'Tu equipo está agotado. Varios empleados se quejan de las horas y el ritmo. Podés invertir en bienestar o ignorarlo.',
    choices: [
      { text: 'Día de spa para el staff', cost: '-$2,000', hint: 'Inversión en tu equipo. Mejora el ánimo y previene enfermedades.', result: 'Staff curado + 20 rep + 50 XP', effect: (g) => { STAFF.forEach(s => { var st = g.staff[s.id]; if (st && st.hired) { st.sickUntil = 0; if (st.extras) st.extras.forEach(e => { e.sickUntil = 0; }); } }); g.reputation += 20; g.xp += 50; } },
      { text: 'Pizza party', cost: '-$300', hint: 'Barato pero apreciado. Algo es algo.', result: '+10 rep', effect: (g) => { g.money -= 300; g.reputation += 10; } },
      { text: 'Les decís que aguanten', cost: 'Gratis', hint: '⚠️ Riesgo de que se enfermen más seguido.', result: '-10 rep', effect: (g) => { g.reputation = Math.max(0, g.reputation - 10); } },
    ],
    minLevel: 5
  },
  {
    id: 'supplement_deal',
    icon: '🧪',
    title: 'Mayorista de Suplementos',
    desc: 'Un distribuidor te ofrece suplementos a precio de costo. Podés stockearte o revender.',
    choices: [
      { text: 'Comprar stock completo', cost: '-$5,000', hint: 'Inversión grande. Activa un suplemento gratis al azar.', result: 'Suplemento random activado + 30 XP', effect: (g) => { g.money -= 5000; var available = SUPPLEMENTS.filter(s => g.level >= s.reqLevel && !(g.supplements[s.id] && g.supplements[s.id].activeUntil && Date.now() < g.supplements[s.id].activeUntil)); if (available.length > 0) { var pick = available[Math.floor(Math.random() * available.length)]; g.supplements[pick.id] = { activeUntil: Date.now() + pick.duration * 1000 }; } g.xp += 30; } },
      { text: 'Revender con ganancia', cost: 'Gratis', hint: 'Negocio rápido. Plata segura.', result: '+$3,000', effect: (g) => { g.money += 3000; g.totalMoneyEarned += 3000; } },
    ],
    minLevel: 6
  },
  {
    id: 'construction_delay',
    icon: '🚧',
    title: 'Problemas con la Obra',
    desc: 'El proveedor de materiales se atrasó. Las construcciones en curso van más lento.',
    choices: [
      { text: 'Buscar otro proveedor', cost: '-$3,000', hint: 'Más caro pero no perdés tiempo. Las obras siguen normales.', result: '+20 rep, +40 XP', effect: (g) => { g.money -= 3000; g.reputation += 20; g.xp += 40; } },
      { text: 'Esperar pacientemente', cost: 'Gratis', hint: '⚠️ Sin costo pero las mejoras en curso tardan más.', result: '-10 rep', effect: (g) => { g.reputation = Math.max(0, g.reputation - 10); } },
    ],
    minLevel: 4
  },
  {
    id: 'rival_sabotage',
    icon: '🕵️',
    title: 'Sabotaje del Rival',
    desc: 'Un rival dejó reseñas falsas y volantes difamando tu gym por el barrio.',
    choices: [
      { text: 'Campaña de contraataque', cost: '-$4,000', hint: 'Marketing agresivo. Neutraliza al rival y gana miembros.', result: '+30 rep, +8 miembros, +60 XP', effect: (g) => { g.money -= 4000; g.reputation += 30; g.members = Math.min(g.members + 8, g.maxMembers); g.xp += 60; } },
      { text: 'Demandar por difamación', cost: '-$1,500', hint: 'Proceso largo pero sentás precedente. Bonus de XP.', result: '+15 rep, +80 XP', effect: (g) => { g.money -= 1500; g.reputation += 15; g.xp += 80; } },
      { text: 'Ignorar y seguir laburando', cost: 'Gratis', hint: '⚠️ Sin costo pero perdés miembros.', result: '-5 miembros, -15 rep', effect: (g) => { g.members = Math.max(0, g.members - 5); g.reputation = Math.max(0, g.reputation - 15); } },
    ],
    minLevel: 7
  },
  {
    id: 'training_seminar',
    icon: '🎓',
    title: 'Seminario de Capacitación',
    desc: 'Una academia fitness ofrece un seminario intensivo para tu staff. Podría mejorar sus habilidades.',
    choices: [
      { text: 'Mandar a todo el staff', cost: '-$5,000', hint: 'Inversión importante. Acelera el entrenamiento de tu equipo.', result: '+50 XP, +25 rep', effect: (g) => { g.money -= 5000; g.xp += 50; g.reputation += 25; } },
      { text: 'Mandar solo al entrenador', cost: '-$1,500', hint: 'Más económico. Menor impacto pero razonable.', result: '+25 XP, +10 rep', effect: (g) => { g.money -= 1500; g.xp += 25; g.reputation += 10; } },
      { text: 'No vale la pena', cost: 'Gratis', hint: 'Ahorrás plata, perdés la oportunidad.', result: 'Nada pasa', effect: () => {} },
    ],
    minLevel: 6
  },
  {
    id: 'equipment_recall',
    icon: '⚠️',
    title: 'Recall de Equipamiento',
    desc: 'El fabricante detectó un defecto en ciertos equipos. Ofrecen reemplazo gratis o compensación.',
    choices: [
      { text: 'Pedir reemplazo mejorado', cost: 'Gratis', hint: 'Equipos nuevos y mejores. Gran reputación.', result: '+25 rep, +40 XP', effect: (g) => { g.reputation += 25; g.xp += 40; } },
      { text: 'Aceptar compensación económica', cost: 'Gratis', hint: 'Plata en mano. Menos impacto en el gym.', result: '+$4,000', effect: (g) => { g.money += 4000; g.totalMoneyEarned += 4000; } },
    ],
    minLevel: 8
  },
  {
    id: 'social_media_collab',
    icon: '📸',
    title: 'Collab con Instagrammer',
    desc: 'Un influencer fitness con 500K seguidores quiere hacer una collab en tu gym.',
    choices: [
      { text: 'Collab full (le prestás el gym)', cost: '-$2,000', hint: 'Mucha exposición. Boom de miembros y reputación.', result: '+12 miembros, +50 rep, +80 XP', effect: (g) => { g.money -= 2000; g.members = Math.min(g.members + 12, g.maxMembers); g.reputation += 50; g.xp += 80; } },
      { text: 'Que pague por usar el gym', cost: 'Gratis', hint: 'Plata segura pero menor impacto mediático.', result: '+$3,000, +10 rep', effect: (g) => { g.money += 3000; g.totalMoneyEarned += 3000; g.reputation += 10; } },
      { text: 'No me interesa', cost: 'Gratis', hint: 'Sin impacto.', result: 'Nada pasa', effect: () => {} },
    ],
    minLevel: 8
  },
  {
    id: 'health_inspection',
    icon: '🩺',
    title: 'Inspección Sanitaria',
    desc: 'Bromatología vino a inspeccionar los vestuarios y la zona de jugos. Todo tiene que estar en orden.',
    choices: [
      { text: 'Limpieza profunda express', cost: '-$1,500', hint: 'Pasás la inspección con nota 10. Los miembros notan la diferencia.', result: '+20 rep, +30 XP', effect: (g) => { g.money -= 1500; g.reputation += 20; g.xp += 30; } },
      { text: 'Confiar en tu limpieza habitual', cost: 'Gratis', hint: '🎲 50/50. Si tenés personal de limpieza, mejor chance.', result: '50% OK (+10 rep), 50% multa (-$500, -10 rep)', effect: (g) => { var hasClean = g.staff.cleaner && g.staff.cleaner.hired; var chance = hasClean ? 0.8 : 0.5; if (Math.random() < chance) { g.reputation += 10; } else { g.money -= 500; g.reputation = Math.max(0, g.reputation - 10); } } },
    ],
    minLevel: 3
  },
  {
    id: 'lucky_day',
    icon: '🍀',
    title: 'Día de Suerte',
    desc: '¡Todo sale bien hoy! Un ex-miembro volvió con amigos y un sponsor dejó productos gratis.',
    choices: [
      { text: '¡A disfrutar!', cost: 'Gratis', hint: 'Sin trampas, solo buenas noticias.', result: '+$2,000, +5 miembros, +20 rep', effect: (g) => { g.money += 2000; g.totalMoneyEarned += 2000; g.members = Math.min(g.members + 5, g.maxMembers); g.reputation += 20; } },
    ],
    minLevel: 1
  },
  {
    id: 'neighborhood_event',
    icon: '🎪',
    title: 'Feria del Barrio',
    desc: 'Hay una feria vecinal este fin de semana. Podés poner un stand para promocionar tu gym.',
    choices: [
      { text: 'Stand con demos gratis', cost: '-$2,500', hint: 'Muestra de clases + sorteo. Atrae muchos curiosos.', result: '+10 miembros, +30 rep, +60 XP', effect: (g) => { g.money -= 2500; g.members = Math.min(g.members + 10, g.maxMembers); g.reputation += 30; g.xp += 60; } },
      { text: 'Repartir volantes', cost: '-$300', hint: 'Bajo costo, bajo impacto. Algo es algo.', result: '+3 miembros, +10 rep', effect: (g) => { g.money -= 300; g.members = Math.min(g.members + 3, g.maxMembers); g.reputation += 10; } },
      { text: 'Pasar de largo', cost: 'Gratis', hint: 'Sin interés. Oportunidad perdida.', result: 'Nada pasa', effect: () => {} },
    ],
    minLevel: 2
  },
  {
    id: 'tax_audit',
    icon: '🧾',
    title: 'Auditoría de AFIP',
    desc: 'AFIP quiere revisar tus números. Mejor tener todo en regla...',
    choices: [
      { text: 'Contratar contador express', cost: '-$3,000', hint: 'Profesional que ordena todo rápido. Tranquilidad total.', result: 'Sin problemas, +15 rep', effect: (g) => { g.money -= 3000; g.reputation += 15; } },
      { text: 'Presentar los libros como están', cost: 'Gratis', hint: '🎲 Depende de cómo vengas. 60% bien, 40% multa.', result: '60%: OK (+10 rep), 40%: multa -$5,000', effect: (g) => { if (Math.random() < 0.6) { g.reputation += 10; } else { g.money -= 5000; } } },
    ],
    minLevel: 10
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
      { id: 'eq_durability', name: 'Durabilidad', icon: '🛡️', desc: '-15% costo de mejora de equipos.', cost: 15000, reqLevel: 3, effect: { equipCostMult: 0.85 } },
      { id: 'eq_efficiency', name: 'Eficiencia', icon: '⚡', desc: '+25% ingresos de todo el equipamiento.', cost: 125000, reqLevel: 7, requires: 'eq_durability', effect: { equipIncomeMult: 1.25 } },
      { id: 'eq_premium', name: 'Línea Premium', icon: '💎', desc: '+50% capacidad de equipamiento.', cost: 750000, reqLevel: 12, requires: 'eq_efficiency', effect: { equipCapacityMult: 1.5 } },
      { id: 'eq_mastery', name: 'Maestría Total', icon: '👑', desc: '+100% ingresos de equipo y -25% costos.', cost: 5000000, reqLevel: 17, requires: 'eq_premium', effect: { equipIncomeMult: 2.0, equipCostMult: 0.75 } },
      { id: 'eq_reinforced', name: 'Blindaje Industrial', icon: '🔰', desc: '-50% chance de rotura de equipos.', cost: 40000000, reqLevel: 22, requires: 'eq_mastery', effect: { breakdownChanceMult: 0.5 } },
    ]
  },
  marketing: {
    name: 'Marketing',
    icon: '📢',
    color: 'var(--cyan)',
    skills: [
      { id: 'mk_reach', name: 'Mayor Alcance', icon: '📡', desc: '+30% miembros de campañas.', cost: 25000, reqLevel: 4, effect: { campaignMembersMult: 1.3 } },
      { id: 'mk_viral', name: 'Viralización', icon: '🔥', desc: 'Campañas duran 50% más.', cost: 150000, reqLevel: 8, requires: 'mk_reach', effect: { campaignDurationMult: 1.5 } },
      { id: 'mk_brand', name: 'Marca Fuerte', icon: '🏷️', desc: '+50% reputación de campañas.', cost: 1000000, reqLevel: 13, requires: 'mk_viral', effect: { campaignRepMult: 1.5 } },
      { id: 'mk_empire', name: 'Imperio Mediático', icon: '📺', desc: '-40% costo de campañas, +100% miembros.', cost: 7500000, reqLevel: 18, requires: 'mk_brand', effect: { campaignCostMult: 0.6, campaignMembersMult: 2.0 } },
      { id: 'mk_monopoly', name: 'Monopolio', icon: '🦈', desc: 'Rivales roban 50% menos miembros.', cost: 50000000, reqLevel: 23, requires: 'mk_empire', effect: { rivalStealMult: 0.5 } },
    ]
  },
  staff: {
    name: 'Personal',
    icon: '👥',
    color: 'var(--purple)',
    skills: [
      { id: 'st_training', name: 'Capacitación', icon: '📚', desc: '+30% efecto de todo el staff.', cost: 20000, reqLevel: 4, effect: { staffEffectMult: 1.3 } },
      { id: 'st_motivation', name: 'Motivación', icon: '💪', desc: 'Staff genera +50% reputación.', cost: 200000, reqLevel: 9, requires: 'st_training', effect: { staffRepMult: 1.5 } },
      { id: 'st_synergy', name: 'Sinergia', icon: '🤝', desc: 'Cada staff contratado da +5% ingreso extra.', cost: 1250000, reqLevel: 14, requires: 'st_motivation', effect: { staffSynergyBonus: 0.05 } },
      { id: 'st_legends', name: 'Staff Legendario', icon: '🌟', desc: '-30% costo staff, 2x auto-miembros.', cost: 10000000, reqLevel: 19, requires: 'st_synergy', effect: { staffCostMult: 0.7, autoMembersMult: 2.0 } },
      { id: 'st_resilience', name: 'Resiliencia', icon: '💊', desc: '-50% enfermedad, training 30% más rápido.', cost: 60000000, reqLevel: 24, requires: 'st_legends', effect: { sickChanceMult: 0.5, trainingSpeedMult: 0.7 } },
    ]
  },
  members: {
    name: 'Miembros',
    icon: '🏃',
    color: 'var(--green)',
    skills: [
      { id: 'mb_welcome', name: 'Bienvenida', icon: '🤗', desc: '+20% miembros atraídos por equipo.', cost: 12500, reqLevel: 3, effect: { memberAttractionMult: 1.2 } },
      { id: 'mb_retention', name: 'Retención', icon: '🔒', desc: '+40% capacidad máxima.', cost: 175000, reqLevel: 8, requires: 'mb_welcome', effect: { capacityMult: 1.4 } },
      { id: 'mb_premium_tier', name: 'Membresía Premium', icon: '💳', desc: 'Cada miembro genera +100% ingreso.', cost: 900000, reqLevel: 13, requires: 'mb_retention', effect: { memberIncomeMult: 2.0 } },
      { id: 'mb_loyalty', name: 'Lealtad Total', icon: '❤️', desc: '+200% rep por miembro, +50% capacidad.', cost: 6000000, reqLevel: 18, requires: 'mb_premium_tier', effect: { memberRepMult: 3.0, capacityMult: 1.5 } },
      { id: 'mb_community', name: 'Comunidad', icon: '🏘️', desc: 'Clases 2x ingresos, VIPs +50% recompensa.', cost: 45000000, reqLevel: 23, requires: 'mb_loyalty', effect: { classIncomeMult: 2.0, vipRewardMult: 1.5 } },
    ]
  },
  infrastructure: {
    name: 'Infraestructura',
    icon: '🏗️',
    color: '#f59e0b',
    skills: [
      { id: 'inf_planning', name: 'Planificación', icon: '📐', desc: 'Construcción de zonas 25% más rápida.', cost: 30000, reqLevel: 5, effect: { zoneBuildSpeedMult: 0.75 } },
      { id: 'inf_contractors', name: 'Contratistas', icon: '👷', desc: 'Mejoras de equipo 30% más rápidas.', cost: 250000, reqLevel: 10, requires: 'inf_planning', effect: { equipUpgradeSpeedMult: 0.7 } },
      { id: 'inf_logistics', name: 'Logística', icon: '📦', desc: '+1 mejora de equipo simultánea.', cost: 1750000, reqLevel: 15, requires: 'inf_contractors', effect: { extraConcurrentUpgrades: 1 } },
      { id: 'inf_engineering', name: 'Ingeniería', icon: '⚙️', desc: 'Construcciones 50% más rápidas, -20% costo zonas.', cost: 15000000, reqLevel: 20, requires: 'inf_logistics', effect: { zoneBuildSpeedMult: 0.5, zoneCostMult: 0.8 } },
      { id: 'inf_megaproject', name: 'Megaproyectos', icon: '🏛️', desc: 'Reparaciones 50% más rápidas.', cost: 75000000, reqLevel: 25, requires: 'inf_engineering', effect: { repairSpeedMult: 0.5 } },
    ]
  },
  competitions: {
    name: 'Competencias',
    icon: '🏆',
    color: '#ef4444',
    skills: [
      { id: 'comp_prep', name: 'Preparación', icon: '🎯', desc: '+15% chance de ganar competencias.', cost: 25000, reqLevel: 5, effect: { compWinChanceBonus: 0.15 } },
      { id: 'comp_strategy', name: 'Estrategia', icon: '🧠', desc: '-25% cooldown de competencias.', cost: 225000, reqLevel: 10, requires: 'comp_prep', effect: { compCooldownMult: 0.75 } },
      { id: 'comp_prize', name: 'Premios Mayores', icon: '💰', desc: '+50% premios de competencias.', cost: 1500000, reqLevel: 15, requires: 'comp_strategy', effect: { compRewardMult: 1.5 } },
      { id: 'comp_reputation', name: 'Prestigio', icon: '🎖️', desc: '+100% rep de competencias.', cost: 12500000, reqLevel: 20, requires: 'comp_prize', effect: { compRepMult: 2.0 } },
      { id: 'comp_dynasty', name: 'Dinastía', icon: '🏰', desc: '-40% cooldown extra, competencias dan XP doble.', cost: 60000000, reqLevel: 25, requires: 'comp_reputation', effect: { compCooldownMult: 0.6, compXpMult: 2.0 } },
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

// ===== NEIGHBORHOODS (City Map) =====
const NEIGHBORHOODS = [
  { id: 'palermo',    name: 'Palermo',    icon: '🌳', desc: 'Zona trendy con alta demanda fitness',          unlockCost: 0,       reqLevel: 1,  rentMult: 1.0, memberMult: 1.0, vipChanceMult: 1.0, maxMembersCap: 500 },
  { id: 'la_boca',    name: 'La Boca',    icon: '⚽', desc: 'Zona popular, todo cuesta menos pero gana menos', unlockCost: 500000,  reqLevel: 3,  rentMult: 0.6, memberMult: 1.3, vipChanceMult: 0.5, maxMembersCap: 700 },
  { id: 'caballito',  name: 'Caballito',  icon: '🏙️', desc: 'Centro geográfico, alquiler accesible',          unlockCost: 800000,  reqLevel: 5,  rentMult: 0.8, memberMult: 1.1, vipChanceMult: 0.8, maxMembersCap: 550 },
  { id: 'belgrano',   name: 'Belgrano',   icon: '🏘️', desc: 'Zona familiar, crecimiento estable',             unlockCost: 1500000, reqLevel: 8,  rentMult: 1.3, memberMult: 1.2, vipChanceMult: 1.0, maxMembersCap: 600 },
  { id: 'recoleta',   name: 'Recoleta',   icon: '🏛️', desc: 'Barrio premium, miembros VIP frecuentes',        unlockCost: 3000000, reqLevel: 12, rentMult: 1.8, memberMult: 0.8, vipChanceMult: 2.0, maxMembersCap: 400 },
  { id: 'san_telmo',  name: 'San Telmo',  icon: '🎭', desc: 'Barrio bohemio, reputación se gana rápido',     unlockCost: 5000000, reqLevel: 15, rentMult: 1.5, memberMult: 0.9, vipChanceMult: 1.5, maxMembersCap: 450 },
];

// ===== VIP MEMBERS =====
const VIP_MEMBERS = [
  { id: 'bodybuilder', name: 'Fisicoculturista Pro', icon: '💪', request: 'Necesito Squat Rack y Prensa de Piernas', requires: ['squat_rack', 'leg_press'], reward: { money: 1500, rep: 30, xp: 80 }, stayDuration: 600 },
  { id: 'yoga_guru', name: 'Gurú del Yoga', icon: '🧘', request: 'Quiero un espacio tranquilo para dar clases', requires: ['yoga_class'], reward: { money: 1000, rep: 40, xp: 60 }, stayDuration: 500 },
  { id: 'boxer', name: 'Boxeador Amateur', icon: '🥊', request: 'Necesito Ring de Boxeo para entrenar', requires: ['boxing'], reward: { money: 2500, rep: 50, xp: 100 }, stayDuration: 700 },
  { id: 'swimmer', name: 'Nadadora Olímpica', icon: '🏊‍♀️', request: 'Solo entreno en gyms con pileta', requires: ['pool'], reward: { money: 4000, rep: 80, xp: 150 }, stayDuration: 800 },
  { id: 'crossfitter', name: 'Crossfitter Fanático', icon: '🤸', request: 'Dame WODs o dame muerte', requires: ['crossfit'], reward: { money: 3000, rep: 60, xp: 120 }, stayDuration: 600 },
  { id: 'ceo', name: 'CEO Fitness', icon: '👔', request: 'Quiero Spa y Sauna. Necesito relajarme.', requires: ['spa', 'sauna'], reward: { money: 7500, rep: 100, xp: 200 }, stayDuration: 900 },
  { id: 'influencer_vip', name: 'Influencer (1M seguidores)', icon: '📱', request: 'Tu gym tiene que ser Instagrameable', requires: ['first_floor'], reward: { money: 5000, rep: 150, xp: 180 }, stayDuration: 700 },
  { id: 'retired_athlete', name: 'Atleta Retirado', icon: '🏅', request: 'Necesito un gym completo y staff de calidad', requires: ['trainer', 'physio'], reward: { money: 6000, rep: 120, xp: 250 }, stayDuration: 1000 },
  { id: 'family', name: 'Familia Fitness', icon: '👨‍👩‍👧‍👦', request: 'Queremos pileta y clases para todos', requires: ['pool', 'spinning_class'], reward: { money: 3500, rep: 70, xp: 130 }, stayDuration: 800 },
  { id: 'strongman', name: 'Strongman', icon: '🦍', request: 'Solo entreno en sótanos con pesas reales', requires: ['basement'], reward: { money: 10000, rep: 200, xp: 300 }, stayDuration: 1200 },
  { id: 'politician', name: 'Político Local', icon: '🏛️', request: 'Necesito privacidad. ¿Tienen Spa?', requires: ['spa'], reward: { money: 12500, rep: 250, xp: 350 }, stayDuration: 800 },
  { id: 'doctor', name: 'Médico Deportivo', icon: '🩺', request: 'Me interesa un gym con Kinesiólogo y Sauna', requires: ['physio', 'sauna'], reward: { money: 9000, rep: 180, xp: 280 }, stayDuration: 900 },
  { id: 'model', name: 'Modelo Internacional', icon: '👗', request: 'Pilates y Yoga son mi vida. ¿Tienen?', requires: ['pilates_class', 'yoga_class'], reward: { money: 6000, rep: 300, xp: 200 }, stayDuration: 700 },
  { id: 'footballer', name: 'Futbolista Profesional', icon: '⚽', request: 'Necesito CrossFit y Ring para complementar', requires: ['crossfit', 'boxing'], reward: { money: 15000, rep: 350, xp: 400 }, stayDuration: 1000 },
  { id: 'grandma', name: 'Abuela Fitness', icon: '👵', request: 'A mis 75 quiero empezar. ¿Tienen Cinta y clases de Zumba?', requires: ['treadmill', 'zumba_class'], reward: { money: 2500, rep: 500, xp: 150 }, stayDuration: 600 },
  { id: 'esports', name: 'Gamer Pro', icon: '🎮', request: 'Necesito desengancharme de la silla. HIIT y Spinning.', requires: ['hiit_class', 'spinning_class'], reward: { money: 4000, rep: 100, xp: 250 }, stayDuration: 500 },
];

const TUTORIAL_STEPS = [
  // Intro - observar
  { target: '.gym-scene-container', title: '¡Bienvenido a tu Gimnasio!', text: 'Este es tu gym. Acá ves el nombre, la categoría y el equipamiento instalado. Ahora está vacío... ¡vamos a cambiarlo!', tab: 'gym' },
  { target: '.stats-grid', title: 'Tus Estadísticas', text: 'Estos números son clave: ingresos por segundo (tu ganancia), miembros activos, capacidad máxima y reputación. El objetivo es hacer crecer todo.' },
  { target: '.stats-bar', title: 'Barra de Recursos', text: 'Arriba siempre ves tu plata 💰, miembros 👥, reputación ⭐, ingresos 💵 y nivel.' },

  // Acción: ir a máquinas
  { target: '[data-tab="equipment"]', title: '¡Comprá tu Primera Máquina!', text: 'Lo primero que necesitás son máquinas. Hacé clic en la pestaña Máquinas.', action: true },
  // Acción: comprar mancuernas
  { target: '.equipment-grid', title: 'Comprá Mancuernas', text: 'Hacé clic en COMPRAR en las Mancuernas. Son baratas y te generan ingresos desde el primer segundo.', tab: 'equipment', action: true, actionCheck: function() { return game.equipment.dumbbells && game.equipment.dumbbells.level >= 1; } },

  // Explicar ingresos
  { target: '#incomeBig', title: '¡Listo para Generar Plata!', text: '¡Genial! Cuando termine el tutorial, tu gym va a generar ingresos automáticos cada segundo. Cuanto más equipamiento y miembros, más ganás.', tab: 'gym' },

  // Acción: ir a staff
  { target: '[data-tab="staff"]', title: 'Contratá Personal', text: 'Tu gym necesita empleados. Hacé clic en la pestaña Staff.', action: true },
  { target: '#tab-staff', title: 'Tu Equipo de Trabajo', text: 'Un Entrenador sube tus ingresos 50%, una Recepcionista atrae miembros sola. Cada empleado tiene un efecto único. Contraté cuando juntes plata.', tab: 'staff' },

  // Acción: ir a marketing
  { target: '[data-tab="marketing"]', title: 'Hacé Publicidad', text: 'Las campañas atraen miembros rápido. Hacé clic en Marketing.', action: true },
  { target: '#tab-marketing', title: 'Campañas de Marketing', text: 'Las campañas atraen miembros y suben tu reputación. Empezá con Flyers cuando puedas.', tab: 'marketing' },

  // Acción: ir a misiones
  { target: '[data-tab="missions"]', title: 'Misiones Diarias', text: 'Tenés objetivos diarios con recompensas. Hacé clic en Misiones.', action: true },
  { target: '#tab-missions', title: 'Tus Misiones', text: 'Cada día tenés 3 misiones. Completar las 3 te da un bonus extra. ¡Revisalas todos los días!', tab: 'missions' },

  // Daily bonus
  { target: '.daily-bonus-banner', title: 'Bonus Diario', text: '¡Importante! Entrá todos los días para reclamar tu bonus. 7 días seguidos = mega premio.', tab: 'gym' },

  // Acción: ir a competencias
  { target: '[data-tab="champion"]', title: 'Competencias', text: 'Competí por premios y reputación. Hacé clic en Competencias.', action: true },
  { target: '#tab-champion', title: 'Torneos y Campeón', text: 'Empezá por el Torneo de Barrio (80% de ganar). Más adelante, reclutá un campeón para ganar el doble.', tab: 'champion' },

  // Consejos finales
  { target: '.gym-scene-container', title: '¡A Jugar!', text: 'El juego sigue funcionando aunque cierres el navegador (hasta 8 horas). Entrá todos los días, hacé misiones, dictá clases y competí. ¡Construí tu Iron Empire!', tab: 'gym' },
];

// ===== OPERATING COSTS =====
const OPERATING_COSTS = {
  baseRent: 8000,              // per game day (600 ticks = 10 min real)
  rentPerLevel: 2500,          // additional rent per player level per game day
  rentPerExtraZone: 12000,     // additional rent per zone beyond ground floor
  rentZoneMultPerLevel: 800,   // extra zone rent scales: zone_rent + (playerLevel * this)
  utilitiesPerEquipLevel: 150, // utilities cost per total equipment level per game day
  propertyPrice: 8000000,      // one-time purchase to eliminate rent
  propertyReqLevel: 18,
};

// ===== SUPPLEMENTS =====
const SUPPLEMENTS = [
  { id: 'protein', name: 'Proteína en Polvo', icon: '🥤', desc: 'El clásico batido post-entreno. Boost de ingresos general.', cost: 300, duration: 180, effects: { incomeMult: 1.2 }, reqLevel: 2, combo: 'creatine' },
  { id: 'creatine', name: 'Creatina', icon: '💊', desc: 'Más fuerza, más resistencia. El gym tiene más capacidad.', cost: 600, duration: 180, effects: { capacityBonus: 10 }, reqLevel: 4, combo: 'protein' },
  { id: 'preworkout', name: 'Pre-Workout', icon: '⚡', desc: 'Energía explosiva antes de entrenar. Las clases rinden mucho más.', cost: 1000, duration: 240, effects: { classIncomeMult: 1.3 }, reqLevel: 6 },
  { id: 'bcaa', name: 'BCAA', icon: '🧪', desc: 'Aminoácidos de cadena ramificada. Mejoran la reputación del gym.', cost: 2000, duration: 240, effects: { repBonus: 15, repPerMin: 5 }, reqLevel: 8 },
  { id: 'omega3', name: 'Omega 3', icon: '🐟', desc: 'Ácidos grasos esenciales. Reduce inflamación y mejora el ambiente general.', cost: 3000, duration: 270, effects: { incomeMult: 1.15, repPerMin: 6 }, reqLevel: 9 },
  { id: 'fatburner', name: 'Quemador de Grasa', icon: '🔥', desc: 'Termogénico potente. Tus campañas de marketing pegan más fuerte.', cost: 4000, duration: 300, effects: { marketingMult: 1.3 }, reqLevel: 10 },
  { id: 'vitamina_d', name: 'Vitamina D3', icon: '☀️', desc: 'La vitamina del sol. Los equipos rinden mejor y el gym tiene más espacio.', cost: 6000, duration: 300, effects: { equipIncomeMult: 1.25, capacityBonus: 15 }, reqLevel: 12 },
  { id: 'glutamine', name: 'Glutamina', icon: '💚', desc: 'Recuperación muscular acelerada. Más capacidad y ambiente de élite.', cost: 8000, duration: 300, effects: { capacityBonus: 20, repPerMin: 4 }, reqLevel: 13 },
  { id: 'zma', name: 'ZMA', icon: '🌙', desc: 'Zinc, Magnesio y B6. Las clases y la reputación van a otro nivel.', cost: 12000, duration: 360, effects: { classIncomeMult: 1.35, repPerMin: 8 }, reqLevel: 15 },
  { id: 'massgainer', name: 'Mass Gainer', icon: '🏋️', desc: 'Calorías y proteína masiva. El equipamiento trabaja al máximo.', cost: 15000, duration: 300, effects: { equipIncomeMult: 1.4 }, reqLevel: 16 },
  { id: 'collagen', name: 'Colágeno Marino', icon: '🦴', desc: 'Piel, articulaciones y tejidos top. El gym luce impecable y las campañas pegan más.', cost: 22000, duration: 420, effects: { incomeMult: 1.3, marketingMult: 1.2 }, reqLevel: 18 },
  { id: 'multivitamin', name: 'Multivitamínico Premium', icon: '🌟', desc: 'El suplemento definitivo. Mejora ingresos y reputación constantemente.', cost: 30000, duration: 360, effects: { incomeMult: 1.25, repPerMin: 5 }, reqLevel: 20 },
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

// ===== CHAMPION SYSTEM =====
const CHAMPION_STATS = ['fuerza', 'resistencia', 'velocidad', 'tecnica', 'stamina', 'mentalidad'];
const CHAMPION_STAT_ICONS = {
  fuerza: '💪', resistencia: '🫀', velocidad: '⚡', tecnica: '🎯', stamina: '🔋', mentalidad: '🧠'
};
const CHAMPION_STAT_NAMES = {
  fuerza: 'Fuerza', resistencia: 'Resistencia', velocidad: 'Velocidad',
  tecnica: 'Técnica', stamina: 'Stamina', mentalidad: 'Mentalidad'
};
const CHAMPION_STAT_DESC = {
  fuerza: 'Fuerza bruta. Aumenta los premios de victoria.',
  resistencia: 'Aguante físico. Reduce la fatiga al competir.',
  velocidad: 'Reflejos y explosividad. Mejora la chance de ganar.',
  tecnica: 'Técnica de pelea. Multiplica premios y reputación ganada.',
  stamina: 'Resistencia aeróbica. Acelera la recuperación de fatiga.',
  mentalidad: 'Fortaleza mental. Boost extra en competencias duras.',
};

const CHAMPION_EQUIPMENT = [
  { id: 'gloves', name: 'Guantes de Box', icon: '🥊', slot: 'hands', stats: { fuerza: 3 }, cost: 5000, reqChampLevel: 1 },
  { id: 'headband', name: 'Vincha Pro', icon: '🎽', slot: 'head', stats: { velocidad: 2, mentalidad: 1 }, cost: 8000, reqChampLevel: 2 },
  { id: 'shoes', name: 'Zapatillas de Competición', icon: '👟', slot: 'feet', stats: { velocidad: 3, stamina: 1 }, cost: 12000, reqChampLevel: 3 },
  { id: 'belt', name: 'Cinturón de Fuerza', icon: '🥋', slot: 'waist', stats: { fuerza: 4, resistencia: 2 }, cost: 20000, reqChampLevel: 4 },
  { id: 'gloves_pro', name: 'Guantes Profesionales', icon: '🧤', slot: 'hands', stats: { fuerza: 6, tecnica: 2 }, cost: 40000, reqChampLevel: 6 },
  { id: 'shoes_elite', name: 'Zapatillas Elite', icon: '👠', slot: 'feet', stats: { velocidad: 6, stamina: 3 }, cost: 60000, reqChampLevel: 8 },
  { id: 'belt_titan', name: 'Cinturón Titán', icon: '⚔️', slot: 'waist', stats: { fuerza: 8, resistencia: 4 }, cost: 100000, reqChampLevel: 10 },
  { id: 'crown', name: 'Corona del Campeón', icon: '👑', slot: 'head', stats: { fuerza: 5, resistencia: 5, velocidad: 5, tecnica: 5, mentalidad: 5 }, cost: 250000, reqChampLevel: 15 },
];

const CHAMPION_RECRUIT_COST = 50000;
const CHAMPION_UNLOCK_LEVEL = 8;
const CHAMPION_MAX_FATIGUE = 100;
const CHAMPION_FATIGUE_PER_TRAIN = 25;   // 4 sessions before exhausted
const CHAMPION_FATIGUE_PER_COMPETE = 35; // competing is more demanding
const CHAMPION_FATIGUE_THRESHOLD = 75;   // 75+ = agotado, no entrena ni compite
const CHAMPION_XP_PER_LEVEL = 100;
const CHAMPION_REWARD_MULT = 2.0;

// ===== PLAYER TITLES =====
const PLAYER_TITLES = [
  { id: 'principiante', name: 'Principiante', icon: '🏋️', desc: 'Recién empezás', check: () => true },
  { id: 'entrenador', name: 'Entrenador', icon: '💪', desc: 'Nivel 10', check: () => game.level >= 10 },
  { id: 'empresario', name: 'Empresario', icon: '🏢', desc: 'Ganá $500K total', check: () => game.totalMoneyEarned >= 500000 },
  { id: 'magnate', name: 'Magnate', icon: '👑', desc: 'Ganá $5M total', check: () => game.totalMoneyEarned >= 5000000 },
  { id: 'franquiciado', name: 'Franquiciado', icon: '🏙️', desc: 'Abrí 2 sucursales', check: () => Object.keys(game.branches).length >= 2 },
  { id: 'franquicia_estrella', name: 'Magnate', icon: '👑', desc: 'Abrí 4 sucursales', check: () => Object.keys(game.branches).length >= 4 },
  { id: 'campeon_invicto', name: 'Campeón Invicto', icon: '🏆', desc: '20 champion wins', check: () => game.stats.championWins >= 20 },
  { id: 'completista', name: 'Completista', icon: '🎖️', desc: '40 achievements', check: () => Object.values(game.achievements).filter(Boolean).length >= 40 },
  { id: 'perfeccionista', name: 'Perfeccionista', icon: '💎', desc: 'Todos los achievements', check: () => Object.values(game.achievements).filter(Boolean).length >= ACHIEVEMENTS.length },
  { id: 'cientifico', name: 'Científico', icon: '🧬', desc: 'Todas las 30 skills', check: () => game.stats.skillsResearched >= 30 },
  { id: 'arquitecto', name: 'Arquitecto', icon: '🏗️', desc: 'Todas las 6 zonas', check: () => game.stats.zonesUnlocked >= 6 },
  { id: 'iron_legend', name: 'Iron Legend', icon: '🔥', desc: 'Nivel 25 + $10M + 50 champion wins', check: () => game.level >= 25 && game.totalMoneyEarned >= 10000000 && game.stats.championWins >= 50 },
];

// ===== GYM THEMES =====
const GYM_THEMES = [
  { id: 'classic', name: 'Clásico', icon: '🔶', cost: 0, reqLevel: 1, accent: '#f59e0b', accentGlow: '#f59e0b44', accentDark: '#b45309', bgDark: '#0a0a0f', bgCard: '#12121a' },
  { id: 'neon', name: 'Neon Azul', icon: '🔵', cost: 25000, reqLevel: 5, accent: '#3b82f6', accentGlow: '#3b82f644', accentDark: '#1d4ed8', bgDark: '#0a0a1a', bgCard: '#10102a' },
  { id: 'luxury', name: 'Luxury', icon: '💜', cost: 75000, reqLevel: 10, accent: '#a855f7', accentGlow: '#a855f744', accentDark: '#7c3aed', bgDark: '#0f0a1a', bgCard: '#18102a' },
  { id: 'power', name: 'Power Red', icon: '🔴', cost: 150000, reqLevel: 15, accent: '#ef4444', accentGlow: '#ef444444', accentDark: '#b91c1c', bgDark: '#1a0a0a', bgCard: '#2a1010' },
  { id: 'nature', name: 'Nature', icon: '💚', cost: 300000, reqLevel: 20, accent: '#22c55e', accentGlow: '#22c55e44', accentDark: '#15803d', bgDark: '#0a1a0f', bgCard: '#102a18' },
];

// ===== GYM DECORATIONS =====
const GYM_DECORATIONS = [
  { id: 'poster', name: 'Poster Motivacional', icon: '🖼️', cost: 2000, reqLevel: 2, position: { left: '5%', top: '15%' }, bonuses: { reputation: 0.02 } },
  { id: 'planta', name: 'Planta', icon: '🌿', cost: 3000, reqLevel: 3, position: { left: '3%', top: '65%' }, bonuses: { income: 0.01 } },
  { id: 'tv', name: 'TV Grande', icon: '📺', cost: 8000, reqLevel: 5, position: { left: '45%', top: '10%' }, bonuses: { capacity: 3 } },
  { id: 'espejo', name: 'Espejo de Pared', icon: '🪞', cost: 5000, reqLevel: 4, position: { left: '88%', top: '15%' }, bonuses: { classQuality: 0.05 } },
  { id: 'fuente', name: 'Fuente de Agua', icon: '🚰', cost: 10000, reqLevel: 6, position: { left: '92%', top: '65%' }, bonuses: { income: 0.02 } },
  { id: 'parlantes', name: 'Parlantes', icon: '🔊', cost: 15000, reqLevel: 8, position: { left: '25%', top: '10%' }, bonuses: { classQuality: 0.05 } },
  { id: 'bandera', name: 'Bandera del Gym', icon: '🚩', cost: 20000, reqLevel: 10, position: { left: '65%', top: '8%' }, bonuses: { reputation: 0.05 } },
  { id: 'trofeos', name: 'Trofeos Vitrina', icon: '🏆', cost: 50000, reqLevel: 12, position: { left: '75%', top: '15%' }, bonuses: { compReward: 0.10 } },
  { id: 'piso', name: 'Piso Premium', icon: '🟫', cost: 100000, reqLevel: 15, position: { left: '50%', top: '85%' }, bonuses: { income: 0.03 } },
  { id: 'led', name: 'Luces LED', icon: '💡', cost: 200000, reqLevel: 18, position: { left: '50%', top: '3%' }, bonuses: { income: 0.02, capacity: 5 } },
];

// ===== TAB WALKTHROUGHS =====
// First-visit modal content for each tab
const TAB_WALKTHROUGHS = {
  gym: {
    icon: '🏠', title: 'Tu Gimnasio', wiki: 'gym',
    intro: 'Esta es la pantalla principal de Iron Empire. Acá ves en tiempo real todo lo que pasa en tu gym: ingresos, socios activos, reputación y nivel.',
    tips: [
      '💰 El ingreso por segundo depende de tus máquinas, staff y socios activos.',
      '👥 Los socios llegan solos con el tiempo, pero el marketing y los eventos los aceleran.',
      '⭐ La reputación desbloquea competencias y mejora tus posibilidades de crecer.',
      '📈 Subí de nivel ganando XP: comprá equipos, completá logros y ganás experiencia.',
      '🏅 El bono diario y las misiones te dan recursos extra todos los días.',
    ],
  },
  equipment: {
    icon: '🏋️', title: 'Máquinas', wiki: 'equipment',
    intro: 'Las máquinas son la base de tu ingreso. Cada una genera plata por segundo y atrae socios a tu gym.',
    tips: [
      '🔧 Comprá y mejorá máquinas para aumentar ingresos y capacidad. El nivel máximo de cada máquina es tu nivel de jugador.',
      '⚠️ Las máquinas se rompen aleatoriamente — tenés que repararlas para que sigan funcionando.',
      '⏱️ Mejorar una máquina toma tiempo real (más nivel = más tiempo). Podés ver el progreso en la barra.',
      '🧹 Contratar un Limpiador reduce la chance de que se rompan las máquinas.',
      '🔬 El árbol de habilidades tiene upgrades para reducir costos, aumentar ingresos y acelerar reparaciones.',
    ],
  },
  staff: {
    icon: '👥', title: 'Staff', wiki: 'staff',
    intro: 'El staff trabaja para vos. Cada empleado tiene un rol distinto y bonos únicos que mejoran tu gym pasivamente.',
    tips: [
      '💼 Contratá staff para desbloquear sus efectos. Cada uno tiene un bonus diferente (más socios, más ingresos, clases, etc.).',
      '📚 Entrenás al staff para subir su nivel y potenciar sus efectos. El entrenamiento toma tiempo real.',
      '🤒 El staff puede enfermarse aleatoriamente y queda inactivo hasta recuperarse.',
      '➕ Podés contratar múltiples copias del mismo empleado para amplificar su efecto.',
      '💰 El Gerente reduce costos de todo y es clave en etapas avanzadas.',
    ],
  },
  classes: {
    icon: '🧘', title: 'Clases', wiki: 'classes',
    intro: 'Las clases son actividades que dictás en tu gym. Cada clase necesita un instructor propio que la desbloquea y mejora.',
    tips: [
      '👨‍🏫 Contratá un instructor para desbloquear su clase. Sin instructor, la clase está bloqueada.',
      '⬆️ Mejorá al instructor (nivel 1-5) para aumentar las ganancias de la clase (+20% por nivel).',
      '💸 El instructor cobra una comisión (15%) de lo que genera la clase — no tiene sueldo fijo.',
      '⏱️ Iniciá una clase → esperá a que termine → la recompensa es automática. Después entra en cooldown.',
      '⭐ La calidad sube con el nivel del instructor y del equipamiento requerido.',
    ],
  },
  supplements: {
    icon: '🧃', title: 'Suplementos', wiki: 'supplements',
    intro: 'Los suplementos dan boosts temporales a distintos aspectos de tu gym. Pero ojo: usarlos muy seguido reduce su efecto.',
    tips: [
      '⚡ Cada suplemento da un efecto distinto (más socios, más ingresos, más rep, etc.) por un tiempo limitado.',
      '⚠️ Tolerancia: usar el mismo suplemento muy seguido lo hace menos efectivo (4 niveles: 100% → 85% → 65% → 45%).',
      '📉 La tolerancia baja si dejás pasar tiempo sin usarlo — el cuerpo se recupera.',
      '🎯 Variá los suplementos para maximizar los beneficios y evitar caer en dependencia.',
      '💡 Revisá el medidor de tolerancia antes de comprar — si ya está alto, esperá o probá otro.',
    ],
  },
  marketing: {
    icon: '📢', title: 'Marketing', wiki: 'marketing',
    intro: 'El marketing atrae nuevos socios a tu gym. Hay dos tipos: campañas continuas (siempre activas) y campañas de impacto (explosión puntual).',
    tips: [
      '🔄 Campañas siempre activas (Flyers, WhatsApp, Instagram, Google Ads): las activás y te generan socios y reputación de forma constante mientras las pagás.',
      '⚡ Campañas de impacto (YouTube, Radio, TV, Celebrity…): un boost grande pero temporal, con cooldown entre usos.',
      '📊 Revisá el ROI de cada campaña activa — algunas generan más por peso invertido que otras.',
      '🔬 El árbol de habilidades puede reducir costos, extender duración y potenciar efectos de marketing.',
      '💡 Combiná campañas siempre activas (base sólida) con impactos puntuales para máximo crecimiento.',
    ],
  },
  expansion: {
    icon: '🏗️', title: 'Instalaciones', wiki: 'expansion',
    intro: 'Expandí tu gym construyendo nuevas zonas. Cada zona aumenta tu capacidad máxima de socios y genera ingresos extra.',
    tips: [
      '🏢 Hay 6 zonas disponibles: desde el Primer Piso hasta la Arena. Cada una tiene un costo y tiempo de construcción.',
      '⏱️ Construir una zona lleva tiempo real (de minutos a horas). No podés cancelar una vez iniciada.',
      '💰 Cada zona activa suma rent diario a tus costos operativos. Chequeá que tu ingreso lo soporte.',
      '🏠 A nivel 14 podés comprar la propiedad ($250K) y eliminar el alquiler para siempre.',
      '🔬 Las habilidades de Infraestructura reducen costos, aceleran construcción y permiten construir varias zonas a la vez.',
    ],
  },
  skills: {
    icon: '🔬', title: 'Árbol de Habilidades', wiki: 'skills',
    intro: 'El árbol de habilidades son mejoras permanentes para tu gym. Se organizan en 6 ramas y PERSISTEN al hacer prestige.',
    tips: [
      '🌿 6 ramas: Equipamiento, Marketing, Staff, Socios, Infraestructura y Competencias. Cada una tiene 5 habilidades.',
      '💎 Las habilidades persisten al hacer prestige — son tu inversión más duradera del juego.',
      '📈 Las primeras habilidades de cada rama son más baratas; las finales cuestan millones.',
      '🎯 Priorizá las ramas que más usás: si hacés muchas clases, el árbol de Staff es clave.',
      '🔓 Algunas habilidades requieren cierto nivel de jugador para desbloquearse.',
    ],
  },
  champion: {
    icon: '🏆', title: 'Campeón', wiki: 'champion',
    intro: 'Reclutá un peleador élite para dirigirlo al campeonato. El campeón tiene 6 stats entrenables y compite por premios dobles.',
    tips: [
      '💪 Hay 6 stats: Fuerza, Resistencia, Velocidad, Técnica, Stamina y Mentalidad. Cada uno cumple un rol distinto en combate.',
      '⚡ La Fatiga es el recurso clave: entrenar y competir la sube. Cuando está muy alta, no podés hacer nada.',
      '🕐 No se puede pagar para recuperarse — hay que esperar. La Stamina acelera la recuperación.',
      '🏅 Con campeón activo, ganás el doble en todas las competencias.',
      '🛡️ El equipamiento suma stats pasivos — compralo cuando puedas para potenciar al campeón.',
    ],
  },
  rivals: {
    icon: '🏪', title: 'Rivales', wiki: 'rivals',
    intro: 'Hay 6 gimnasios rivales que te roban socios pasivamente. Podés invertir para frenarlos o derrotarlos definitivamente.',
    tips: [
      '📉 Los rivales te roban socios cada cierto tiempo — cuanto más fuerte el rival, más socios perdés.',
      '📣 Promo (temporal): gastás plata para hacer una campaña que frena el robo por un tiempo.',
      '🥊 Derrota (permanente): invertís mucho más, pero el rival queda fuera de juego para siempre y te da un bonus.',
      '💡 Los primeros rivales son baratos de eliminar — priorizalos antes de que los más fuertes te saquen muchos socios.',
      '🔬 Habilidades de Marketing reducen la cantidad de socios que te roban los rivales.',
    ],
  },
  vip: {
    icon: '⭐', title: 'Miembros VIP', wiki: 'vip',
    intro: 'Cada ciertos minutos aparece un potencial socio VIP. Si cumplís sus requisitos, lo aceptás y te da un bonus especial.',
    tips: [
      '⏰ Los VIPs aparecen cada 4-7 minutos. Tenés una ventana de tiempo para aceptarlos antes de que se vayan.',
      '✅ Cada VIP tiene requisitos específicos (nivel mínimo, reputación, equipamiento, etc.). Podés ver cuáles cumplís.',
      '🎁 Aceptar un VIP da bonificaciones: más ingresos, más socios, efectos especiales según el tipo.',
      '🔔 El punto rojo en la sidebar te avisa cuando hay un VIP esperando.',
      '📈 Cuanto más alto tu nivel y más equipada esté tu gym, más VIPs de alto valor van a aparecer.',
    ],
  },
  missions: {
    icon: '📋', title: 'Misiones Diarias', wiki: 'missions',
    intro: 'Cada día tenés 3 misiones aleatorias para completar. Son objetivos cortos que te dan XP y plata extra.',
    tips: [
      '📅 Las misiones se renuevan todos los días. Si no las completás, se pierden.',
      '🎯 Cada misión tiene un objetivo claro: ganar X plata, conseguir Y socios, completar Z clases, etc.',
      '🏆 Si completás las 3 misiones del día, recibís un bonus adicional.',
      '⚡ Las misiones son un buen incentivo para probar sistemas que no usás seguido.',
      '🔔 El punto rojo en la sidebar te avisa cuando tenés misiones con recompensa lista.',
    ],
  },
  achievements: {
    icon: '🎖️', title: 'Logros', wiki: 'achievements',
    intro: 'Los logros son metas que el juego verifica automáticamente. Al cumplirlas, ganás XP y reconocimiento.',
    tips: [
      '🤖 No hay que reclamarlos manualmente — el juego los detecta solo cuando cumplís las condiciones.',
      '📈 Los logros son la principal fuente de XP además del gameplay normal.',
      '📋 Hay 61 logros que cubren todos los sistemas del juego: socios, plata, staff, competencias, etc.',
      '🔍 Revisá los logros para saber qué metas te faltan y planificar tu próximo objetivo.',
      '🏅 Completar logros desbloquea títulos para tu perfil.',
    ],
  },
  profile: {
    icon: '👤', title: 'Perfil', wiki: 'missions',
    intro: 'Tu perfil muestra toda tu historia en el juego: estadísticas de toda tu carrera, logros y el título que te representa.',
    tips: [
      '📊 Las estadísticas acumuladas (total de plata, socios atendidos, competencias ganadas, etc.) nunca se borran, ni con prestige.',
      '🏅 Los títulos se desbloquean completando logros. Elegí el que más te guste para mostrar.',
      '📈 Es un buen lugar para revisar qué tan activo fuiste en cada sistema del juego.',
    ],
  },
  prestige: {
    icon: '🏙️', title: 'Ciudad / Franquicia', wiki: 'prestige',
    intro: 'Desde acá podés abrir nuevas sucursales en distintos barrios de Buenos Aires. ¡Tu imperio crece sin perder nada!',
    tips: [
      '🏙️ Abrí nuevas sucursales en distintos barrios — cada uno tiene multiplicadores únicos de alquiler, miembros y VIPs.',
      '💰 Tus gyms viejos siguen generando ingresos pasivos (50% de la tasa activa) mientras gestionás otro.',
      '⭐ Las estrellas de franquicia se calculan por los ingresos TOTALES de todo tu imperio — nunca bajan.',
      '📍 Cambiá entre sucursales desde el mapa o tocando el indicador de barrio en el header.',
      '🏆 El leaderboard global muestra el ranking por ingresos totales del imperio.',
    ],
  },
};

// ===== WIKI CONTENT =====
const WIKI_CONTENT = [
  {
    id: 'start', icon: '🎮', title: 'Inicio rápido',
    content: '<p>Iron Empire es un juego idle/tycoon donde manejás un gimnasio desde cero. El objetivo es crecer, mejorar y eventualmente abrir franquicias.</p>' +
      '<p><strong>El ciclo básico:</strong></p>' +
      '<ul><li>Comprá y mejorá <strong>máquinas</strong> para aumentar ingresos por segundo.</li>' +
      '<li>Contratá <strong>staff</strong> para desbloquear funciones y bonos pasivos.</li>' +
      '<li>Usá <strong>marketing</strong> para atraer socios.</li>' +
      '<li>Completá <strong>misiones diarias</strong> y <strong>logros</strong> para ganar XP y subir de nivel.</li>' +
      '<li>Expandite con <strong>nuevas zonas</strong> e invertí en el <strong>árbol de habilidades</strong>.</li>' +
      '<li>Cuando tengas suficiente, abrí <strong>nuevas sucursales</strong> en otros barrios para expandir tu imperio.</li></ul>' +
      '<div class="wiki-tip-box">💡 <strong>Tip de inicio:</strong> Completá el tutorial, luego comprá la Cinta de Correr y contratá un Recepcionista. Eso te da la base para crecer.</div>',
  },
  {
    id: 'gym', icon: '🏠', title: 'Tu Gimnasio',
    content: '<p>La pantalla principal muestra el estado de tu gym en tiempo real.</p>' +
      '<p><strong>Métricas clave:</strong></p>' +
      '<ul><li><strong>💰 Ingresos/s:</strong> suma de todas las máquinas × bonos de staff y habilidades.</li>' +
      '<li><strong>👥 Socios:</strong> activos vs capacidad máxima. Si llegás al máximo, dejás de atraer nuevos.</li>' +
      '<li><strong>⭐ Reputación:</strong> desbloquea competencias, VIPs y hace al gym más atractivo.</li>' +
      '<li><strong>📈 Nivel y XP:</strong> la curva es <em>100 × 1.55^(nivel-1)</em>. Sube comprando equipos, completando logros y misiones.</li></ul>' +
      '<p><strong>Costos operativos diarios:</strong></p>' +
      '<ul><li>Alquiler base: $60/día</li>' +
      '<li>Alquiler por zona activa: $30/zona/día</li>' +
      '<li>Servicios: $2 × nivel total de equipamiento / día</li>' +
      '<li>Salarios de staff: ~$323/día (todos contratados)</li></ul>' +
      '<div class="wiki-tip-box">💡 Si tus costos superan tus ingresos, estás perdiendo plata. Comprá la propiedad a nivel 14 ($250K) para eliminar el alquiler para siempre.</div>',
  },
  {
    id: 'equipment', icon: '🏋️', title: 'Máquinas',
    content: '<p>Hay 12 máquinas disponibles. Cada una se compra, se mejora y genera ingresos y capacidad.</p>' +
      '<p><strong>Mecánicas clave:</strong></p>' +
      '<ul><li><strong>Nivel máximo:</strong> igual a tu nivel de jugador. No podés mejorar una máquina más allá de tu nivel.</li>' +
      '<li><strong>Tiempo de mejora:</strong> 20 segundos × nivel. Una mejora al nivel 10 tarda ~3 minutos.</li>' +
      '<li><strong>Breakdown:</strong> hay una chance de 0.3% cada 30 segundos de que una máquina se rompa. Reparala para que vuelva a funcionar.</li>' +
      '<li><strong>Costo de reparación:</strong> crece con el nivel de la máquina.</li></ul>' +
      '<p><strong>Habilidades relacionadas (rama Equipamiento):</strong></p>' +
      '<ul><li>Reducción de costos de compra/mejora</li>' +
      '<li>Boost de ingresos por máquina</li>' +
      '<li>Reducción de chance de breakdown</li>' +
      '<li>Aceleración de reparaciones y upgrades</li></ul>' +
      '<div class="wiki-tip-box">💡 Mejorá las máquinas más baratas de mantener primero. Un Limpiador contratado reduce significativamente los breakdowns.</div>',
  },
  {
    id: 'staff', icon: '👥', title: 'Staff',
    content: '<p>Hay 8 tipos de empleados. Cada uno tiene un rol único que mejora distintos aspectos del gym.</p>' +
      '<p><strong>Roles disponibles:</strong></p>' +
      '<ul><li>🧾 <strong>Recepcionista:</strong> atrae más socios pasivamente.</li>' +
      '<li>🧹 <strong>Limpiador:</strong> reduce breakdowns de máquinas.</li>' +
      '<li>🧑‍🏫 <strong>Instructor:</strong> permite dictar clases y mejora su calidad.</li>' +
      '<li>💊 <strong>Nutricionista:</strong> boost a ingresos por socio.</li>' +
      '<li>📣 <strong>Community Manager:</strong> genera reputación pasiva.</li>' +
      '<li>🏥 <strong>Médico:</strong> reduce duración de enfermedades del staff.</li>' +
      '<li>🔧 <strong>Técnico:</strong> reduce tiempo de reparación de máquinas.</li>' +
      '<li>💼 <strong>Gerente:</strong> boost general a todos los ingresos.</li></ul>' +
      '<p><strong>Mecánicas de staff:</strong></p>' +
      '<ul><li><strong>Entrenamiento:</strong> subí el nivel del empleado pagando plata + tiempo. Cada nivel amplifica su efecto.</li>' +
      '<li><strong>Enfermedad:</strong> 0.5% de chance cada 60 segundos de que se enferme. Queda inactivo hasta recuperarse.</li>' +
      '<li><strong>Extras:</strong> podés contratar múltiples copias del mismo empleado para multiplicar su efecto.</li></ul>',
  },
  {
    id: 'classes', icon: '🧘', title: 'Clases',
    content: '<p>Las clases son actividades grupales que generan ingresos y reputación. Hay 8 tipos, cada una con su propio instructor.</p>' +
      '<p><strong>Sistema de instructores:</strong></p>' +
      '<ul><li>Cada clase tiene un instructor dedicado que debés contratar para desbloquearla.</li>' +
      '<li>Los instructores tienen niveles del 1 al 5. Cada nivel aumenta las ganancias de la clase en +20%.</li>' +
      '<li>El instructor cobra una comisión del 15% sobre las ganancias brutas de la clase (no tiene sueldo fijo).</li>' +
      '<li>El costo de mejora del instructor sube con cada nivel.</li></ul>' +
      '<p><strong>Cómo funcionan las clases:</strong></p>' +
      '<ul><li>Iniciás una clase → esperás a que termine → recibís la recompensa automáticamente (menos la comisión).</li>' +
      '<li>Después entra en cooldown antes de poder dictarla de nuevo.</li>' +
      '<li>El costo de inicio escala +15% por nivel del jugador. La recompensa escala +20%.</li></ul>' +
      '<p><strong>Calidad de clase:</strong></p>' +
      '<ul><li>Sube con el nivel del instructor (+20%/niv) y del equipamiento requerido (+5%/niv).</li>' +
      '<li>Mayor calidad = más ingresos por clase.</li></ul>' +
      '<div class="wiki-tip-box">💡 Invertí en tus instructores — un instructor nivel 5 genera mucha más plata que uno nivel 1, y la comisión siempre es 15%.</div>',
  },
  {
    id: 'supplements', icon: '🧃', title: 'Suplementos',
    content: '<p>Los suplementos dan boosts temporales. Hay 8 tipos, cada uno con un efecto distinto. El truco está en la tolerancia.</p>' +
      '<p><strong>Sistema de tolerancia:</strong></p>' +
      '<ul><li>Cada vez que comprás el mismo suplemento, sube su nivel de tolerancia (0→1→2→3).</li>' +
      '<li>La efectividad baja con la tolerancia: 100% → 85% → 65% → 45%.</li>' +
      '<li>La tolerancia baja 1 nivel por cada día de juego sin usar ese suplemento.</li></ul>' +
      '<p><strong>Suplementos disponibles:</strong></p>' +
      '<ul><li>🔴 Proteína — más socios atraídos</li>' +
      '<li>⚡ Pre-workout — más ingresos por segundo</li>' +
      '<li>🟢 BCAA — recuperación más rápida del staff</li>' +
      '<li>🔵 Creatina — boost de reputación</li>' +
      '<li>🟡 Omega-3 — reduce costos operativos</li>' +
      '<li>🟠 Vitaminas — boost a XP ganado</li>' +
      '<li>🟣 L-Carnitina — boost a calidad de clases</li>' +
      '<li>⚪ Colágeno — boost a efectividad del marketing</li></ul>' +
      '<div class="wiki-tip-box">💡 Rotá entre suplementos en lugar de usar siempre el mismo. Así la tolerancia no sube y mantenés el 100% de efectividad.</div>',
  },
  {
    id: 'marketing', icon: '📢', title: 'Marketing',
    content: '<p>El marketing atrae socios y genera reputación. Hay dos tipos de campaña con lógicas muy distintas.</p>' +
      '<p><strong>Campañas siempre activas (toggle on/off):</strong></p>' +
      '<ul><li>Flyers, WhatsApp, Instagram Ads, Google Ads.</li>' +
      '<li>Las activás y generan socios + reputación de forma constante mientras pagás el costo diario.</li>' +
      '<li>Podés ver el ROI (socios por peso gastado) en tiempo real para cada campaña activa.</li></ul>' +
      '<p><strong>Campañas de impacto (cooldown):</strong></p>' +
      '<ul><li>YouTube, Radio, TV, Celebrity, Patrocinio, Gala.</li>' +
      '<li>Un boost grande y temporal de socios y reputación, luego entran en cooldown.</li>' +
      '<li>Ideal para momentos de expansión o cuando necesitás socios rápido.</li></ul>' +
      '<p><strong>Habilidades de Marketing mejoran:</strong></p>' +
      '<ul><li>Socios atraídos por campaña</li>' +
      '<li>Duración de campañas de impacto</li>' +
      '<li>Reducción de costos</li>' +
      '<li>Reducción de robo de socios por rivales</li></ul>',
  },
  {
    id: 'expansion', icon: '🏗️', title: 'Instalaciones',
    content: '<p>Hay 6 zonas para expandir tu gym. Cada zona suma capacidad máxima de socios e ingresos adicionales.</p>' +
      '<p><strong>Zonas disponibles:</strong></p>' +
      '<ul><li>🏢 Primer Piso — $50K, nivel 5, 3 min</li>' +
      '<li>🏊 Piscina — $200K, nivel 8, 15 min</li>' +
      '<li>🧖 Spa/Wellness — $500K, nivel 10, 30 min</li>' +
      '<li>🏃 Pista de Atletismo — $1.5M, nivel 13, 1 hora</li>' +
      '<li>🎭 Sala de Eventos — $5M, nivel 16, 90 min</li>' +
      '<li>🏟️ Arena — $15M, nivel 20, 2 horas</li></ul>' +
      '<p><strong>Mecánicas importantes:</strong></p>' +
      '<ul><li>Cada zona activa suma $30/día de alquiler a tus costos operativos.</li>' +
      '<li>Comprar la propiedad (nivel 14, $250K) elimina el alquiler base y por zonas.</li>' +
      '<li>La construcción no se puede cancelar una vez iniciada.</li></ul>' +
      '<div class="wiki-tip-box">💡 Las habilidades de Infraestructura pueden reducir costos, acelerar construcción y permitir construir múltiples zonas simultáneamente.</div>',
  },
  {
    id: 'skills', icon: '🔬', title: 'Árbol de Habilidades',
    content: '<p>30 habilidades permanentes organizadas en 6 ramas. Son la inversión más duradera del juego porque persisten al hacer prestige.</p>' +
      '<p><strong>Las 6 ramas:</strong></p>' +
      '<ul><li>🔧 <strong>Equipamiento:</strong> costos, ingresos, capacidad, breakdown, velocidad de mejora.</li>' +
      '<li>📢 <strong>Marketing:</strong> socios por campaña, duración, reputación, costos, protección vs rivales.</li>' +
      '<li>👥 <strong>Staff:</strong> efectividad, reputación pasiva, sinergia, costos, resistencia a enfermedades.</li>' +
      '<li>💰 <strong>Socios:</strong> rep por socio, retención, recompensas VIP, ingresos por socio, atracción.</li>' +
      '<li>🏗️ <strong>Infraestructura:</strong> costos de zonas, velocidad de construcción, reparación, upgrades simultáneos.</li>' +
      '<li>🏆 <strong>Competencias:</strong> chance de ganar, cooldown, premios, reputación y XP por competencia.</li></ul>' +
      '<p><strong>Costos:</strong> desde $2.5K (primeras habilidades) hasta $15M (últimas de cada rama). Requerimiento de nivel 3 a 25.</p>' +
      '<div class="wiki-tip-box">💡 Invertí en el árbol antes de hacer prestige. Al resetear, las habilidades permanecen y hacen el nuevo ciclo mucho más rápido.</div>',
  },
  {
    id: 'champion', icon: '🏆', title: 'Campeón',
    content: '<p>A nivel 8 podés reclutar un campeón y llevarlo a competencias por premios dobles.</p>' +
      '<p><strong>Los 6 stats:</strong></p>' +
      '<ul><li>💪 <strong>Fuerza:</strong> aumenta los premios de victoria.</li>' +
      '<li>🫀 <strong>Resistencia:</strong> reduce la fatiga al competir.</li>' +
      '<li>⚡ <strong>Velocidad:</strong> mejora la chance de ganar.</li>' +
      '<li>🎯 <strong>Técnica:</strong> multiplica premios y reputación ganada.</li>' +
      '<li>🔋 <strong>Stamina:</strong> acelera la recuperación de fatiga.</li>' +
      '<li>🧠 <strong>Mentalidad:</strong> boost extra en competencias difíciles.</li></ul>' +
      '<p><strong>Sistema de Fatiga:</strong></p>' +
      '<ul><li>Entrenar sube la fatiga +25. Competir la sube +35 (menos con Resistencia alta).</li>' +
      '<li>Con fatiga ≥ 75, el campeón está agotado y no puede hacer nada.</li>' +
      '<li><strong>No hay forma de pagar para recuperarse</strong> — hay que esperar. La Stamina acelera la recuperación.</li>' +
      '<li>Recuperación: 2 + (Stamina × 0.5) puntos de fatiga cada 30 segundos.</li></ul>' +
      '<div class="wiki-tip-box">💡 Priorizá Stamina si querés entrenar y competir más seguido. Con alta Stamina, la fatiga baja mucho más rápido.</div>',
  },
  {
    id: 'rivals', icon: '🏪', title: 'Rivales',
    content: '<p>Hay 6 gimnasios rivales en la zona. Todos te roban socios pasivamente. Hay dos formas de frenarlos.</p>' +
      '<p><strong>Rivales (de más débil a más fuerte):</strong></p>' +
      '<ul><li>FitFácil — nivel 2 requerido</li>' +
      '<li>GymPlus — nivel 5</li>' +
      '<li>PowerHouse — nivel 8</li>' +
      '<li>EliteGym — nivel 12</li>' +
      '<li>Olimpo — nivel 16</li>' +
      '<li>MaxFit Corp — nivel 20</li></ul>' +
      '<p><strong>Opciones:</strong></p>' +
      '<ul><li>📣 <strong>Promo (temporal):</strong> invertís plata en una campaña que frena el robo por un tiempo. Es más barato pero hay que renovarlo.</li>' +
      '<li>🥊 <strong>Derrota (permanente):</strong> inversión grande, el rival queda eliminado para siempre y te da un bonus de ingresos.</li></ul>' +
      '<p><strong>Costos:</strong> escalan +20% por nivel de jugador sobre el requerimiento del rival.</p>' +
      '<div class="wiki-tip-box">💡 Empezá por los rivales más débiles para eliminarlos permanentemente. El ahorro de socios a largo plazo justifica la inversión.</div>',
  },
  {
    id: 'vip', icon: '⭐', title: 'Miembros VIP',
    content: '<p>Hay 16 tipos de socios VIP que aparecen aleatoriamente cada 4-7 minutos. Cada uno tiene requisitos específicos para ser aceptado.</p>' +
      '<p><strong>Cómo funcionan:</strong></p>' +
      '<ul><li>Cuando aparece un VIP, ves en tiempo real qué requisitos cumplís (✅) y cuáles no (❌).</li>' +
      '<li>Si cumplís todo, podés aceptarlo y activar su bonus especial.</li>' +
      '<li>Si no cumplís los requisitos, el VIP se va después de un tiempo.</li></ul>' +
      '<p><strong>Tipos de bonus VIP:</strong></p>' +
      '<ul><li>Algunos dan más ingresos permanentes mientras están activos.</li>' +
      '<li>Otros atraen más socios, generan reputación, reducen costos, etc.</li>' +
      '<li>Los VIPs de alto nivel tienen requisitos exigentes pero dan bonos muy poderosos.</li></ul>' +
      '<p><strong>Habilidades de Socios</strong> mejoran las recompensas de los VIPs y aumentan las chances de que aparezcan mejores tipos.</p>',
  },
  {
    id: 'missions', icon: '📋', title: 'Misiones Diarias',
    content: '<p>Cada día del juego (10 minutos reales = 1 día) recibís 3 misiones aleatorias para completar.</p>' +
      '<p><strong>Tipos de misiones:</strong></p>' +
      '<ul><li>Ganar una cantidad de plata</li>' +
      '<li>Conseguir una cantidad de socios</li>' +
      '<li>Completar una cantidad de clases</li>' +
      '<li>Ganar competencias</li>' +
      '<li>Hacer campañas de marketing</li>' +
      '<li>Aceptar miembros VIP</li>' +
      '<li>Usar suplementos</li>' +
      '<li>Entrenar al campeón</li></ul>' +
      '<p><strong>Recompensas:</strong></p>' +
      '<ul><li>Cada misión da XP y plata al completarse.</li>' +
      '<li>Completar las 3 del día da un bonus adicional.</li></ul>' +
      '<div class="wiki-tip-box">💡 Revisá las misiones al inicio del día del juego para planificar tus acciones. Algunas misiones se completan solas con el gameplay normal.</div>',
  },
  {
    id: 'achievements', icon: '🎖️', title: 'Logros',
    content: '<p>Hay 61 logros que el juego verifica automáticamente. Al cumplir las condiciones, el logro se desbloquea y recibís XP.</p>' +
      '<p><strong>Categorías de logros:</strong></p>' +
      '<ul><li>💰 Economía — metas de dinero ganado y acumulado</li>' +
      '<li>👥 Socios — metas de socios activos y récords</li>' +
      '<li>🏋️ Equipamiento — compras, mejoras, reparaciones</li>' +
      '<li>👔 Staff — contrataciones y entrenamiento</li>' +
      '<li>🧘 Clases — clases completadas</li>' +
      '<li>📢 Marketing — campañas lanzadas</li>' +
      '<li>🏆 Competencias — victorias del campeón</li>' +
      '<li>🌟 Prestige — cantidad de veces que hiciste prestige</li>' +
      '<li>🎯 Variados — logros especiales de cada sistema</li></ul>' +
      '<p>Los logros son la <strong>principal fuente de XP</strong> del juego. Revisalos para planificar tu siguiente objetivo.</p>',
  },
  {
    id: 'events', icon: '⚡', title: 'Eventos Aleatorios',
    content: '<p>Cada 5-10 minutos aparece un evento aleatorio que requiere tu decisión. Son situaciones que afectan al gym.</p>' +
      '<p><strong>Hay 28 eventos distintos,</strong> que incluyen:</p>' +
      '<ul><li>Problemas con el equipamiento</li>' +
      '<li>Oportunidades de crecimiento</li>' +
      '<li>Situaciones con socios o vecinos</li>' +
      '<li>Inspecciones y auditorías</li>' +
      '<li>Ofertas especiales</li></ul>' +
      '<p><strong>Cada evento tiene 2-3 opciones</strong> con distintos costos y resultados. Los costos escalan con tu nivel e ingresos actuales.</p>' +
      '<p><strong>Fórmula de escalado:</strong> <em>max(escala_por_nivel, ingresos_por_segundo × 0.5)</em>. Si ganás mucho, los eventos cuestan más pero también los podés pagar más fácil.</p>' +
      '<div class="wiki-tip-box">💡 Los eventos no se pueden ignorar — el overlay bloquea el juego hasta que tomes una decisión. Leé las opciones con calma antes de elegir.</div>',
  },
  {
    id: 'prestige', icon: '🏙️', title: 'Ciudad / Franquicia',
    content: '<p>El sistema de franquicia te permite abrir múltiples sucursales en distintos barrios de Buenos Aires. ¡Nunca perdés nada!</p>' +
      '<p><strong>🏙️ Cómo funciona:</strong></p>' +
      '<ul><li>Desde la pestaña "Ciudad" ves el mapa con 6 barrios de Buenos Aires.</li>' +
      '<li>Cada barrio tiene multiplicadores únicos: alquiler, miembros, chance de VIP, y cap de miembros.</li>' +
      '<li>Abrí una sucursal nueva pagando el costo del barrio. Tu gym anterior sigue funcionando.</li>' +
      '<li>Cambiá entre sucursales desde el mapa para gestionarlas.</li></ul>' +
      '<p><strong>💰 Ingresos pasivos:</strong></p>' +
      '<ul><li>Las sucursales que no estás gestionando generan el 50% de sus ingresos automáticamente.</li>' +
      '<li>No hay eventos negativos (roturas, enfermedades) en gyms inactivos.</li></ul>' +
      '<p><strong>⭐ Estrellas de franquicia:</strong></p>' +
      '<ul><li>Se calculan por la plata total ganada en TODO el imperio.</li>' +
      '<li>Cada estrella da +25% de multiplicador de ingresos permanente.</li>' +
      '<li>Las estrellas nunca bajan — solo crecen.</li></ul>' +
      '<div class="wiki-tip-box">Elegí barrios estratégicamente. La Boca tiene alquiler bajo pero cap de VIPs limitado. Recoleta tiene alquiler caro pero muchos VIPs premium.</div>',
  },
  {
    id: 'economy', icon: '💰', title: 'Economía & Balance',
    content: '<p>Entender la economía te ayuda a tomar mejores decisiones de inversión.</p>' +
      '<p><strong>Curva de XP:</strong> <em>100 × 1.55^(nivel-1)</em>. La progresión se vuelve más lenta con cada nivel.</p>' +
      '<p><strong>Costos operativos diarios (1 día = 10 minutos reales = 600 ticks):</strong></p>' +
      '<ul><li>Alquiler base: $60/día (hasta nivel 14 o compra de propiedad)</li>' +
      '<li>Por zona activa: $30/zona/día</li>' +
      '<li>Servicios: $2 × suma de niveles de equipo / día</li>' +
      '<li>Salarios totales: ~$323/día con todo el staff contratado</li></ul>' +
      '<p><strong>Escalado de precios:</strong></p>' +
      '<ul><li>Clases: +15% por nivel del jugador sobre el requerido</li>' +
      '<li>Suplementos: +15% por nivel sobre el requerido</li>' +
      '<li>Rivales: +20% por nivel sobre el requerido</li>' +
      '<li>Eventos: <em>max(escala_nivel, ingresos/s × 0.5)</em></li></ul>' +
      '<p><strong>Mecánicas de tiempo:</strong></p>' +
      '<ul><li>1 tick = 1 segundo real</li>' +
      '<li>1 día de juego = 600 ticks = 10 minutos reales</li>' +
      '<li>Progreso offline: hasta 8 horas (ingresos, gastos, construcciones, campañas, reputación, entrenamiento)</li></ul>',
  },
];
