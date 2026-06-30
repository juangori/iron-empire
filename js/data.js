// ===== IRON EMPIRE - GAME DATA =====

const STAFF_MAX_LEVEL = 5;
const STAFF_EXTRA_UNLOCK = { 2: 12, 3: 20 }; // 2nd copy at player level 12, 3rd at 20

const EQUIPMENT = [
  { id: 'dumbbells', name: 'Dumbbells', icon: '🏋️', desc: 'Every gym\'s basics. They draw in beginners.', baseCost: 50, costMult: 1.85, incomePerLevel: 0.4, membersPerLevel: 2, capacityPerLevel: 2, reqLevel: 1 },
  { id: 'bench', name: 'Flat Bench', icon: '🏋️‍♀️', desc: 'Bench press, the king of exercises.', baseCost: 200, costMult: 1.9, incomePerLevel: 1.0, membersPerLevel: 3, capacityPerLevel: 2, reqLevel: 1 },
  { id: 'squat_rack', name: 'Squat Rack', icon: '🔱', desc: 'For those who never skip leg day.', baseCost: 600, costMult: 1.95, incomePerLevel: 2.0, membersPerLevel: 4, capacityPerLevel: 3, reqLevel: 2 },
  { id: 'treadmill', name: 'Treadmill', icon: '🏃‍♂️', desc: 'Cardio warriors love this.', baseCost: 1500, costMult: 1.95, incomePerLevel: 2.6, membersPerLevel: 5, capacityPerLevel: 3, reqLevel: 3 },
  { id: 'cables', name: 'Cable / Pulley', icon: '🔗', desc: 'Total versatility. A thousand exercises.', baseCost: 4000, costMult: 2.0, incomePerLevel: 3.2, membersPerLevel: 5, capacityPerLevel: 4, reqLevel: 4 },
  { id: 'leg_press', name: 'Leg Press', icon: '💺', desc: 'For pushing some real weight.', baseCost: 10000, costMult: 2.05, incomePerLevel: 4.5, membersPerLevel: 6, capacityPerLevel: 4, reqLevel: 5 },
  { id: 'smith', name: 'Smith Machine', icon: '⚒️', desc: 'Guided and safe. Perfect for training solo.', baseCost: 25000, costMult: 2.1, incomePerLevel: 7.0, membersPerLevel: 7, capacityPerLevel: 5, reqLevel: 7 },
  { id: 'pool', name: 'Swimming Pool', icon: '🏊', desc: 'The premium upgrade. Changes everything.', baseCost: 75000, costMult: 2.25, incomePerLevel: 16, membersPerLevel: 15, capacityPerLevel: 10, reqLevel: 9 },
  { id: 'sauna', name: 'Sauna', icon: '🧖', desc: 'Post-workout relaxation. Attracts premium memberships.', baseCost: 180000, costMult: 2.3, incomePerLevel: 22, membersPerLevel: 12, capacityPerLevel: 5, reqLevel: 11 },
  { id: 'crossfit', name: 'CrossFit Zone', icon: '🤸', desc: 'Box jumps, rope climbs, WODs. The CrossFit craze.', baseCost: 450000, costMult: 2.35, incomePerLevel: 32, membersPerLevel: 20, capacityPerLevel: 15, reqLevel: 13 },
  { id: 'boxing', name: 'Boxing Ring', icon: '🥊', desc: 'Combat training. Attracts fighters.', baseCost: 1200000, costMult: 2.4, incomePerLevel: 48, membersPerLevel: 25, capacityPerLevel: 10, reqLevel: 15 },
  { id: 'spa', name: 'Full Spa', icon: '💆', desc: 'Massages, cryotherapy, the full package.', baseCost: 3500000, costMult: 2.5, incomePerLevel: 80, membersPerLevel: 30, capacityPerLevel: 8, reqLevel: 18 },
];

const STAFF = [
  { id: 'trainer', name: 'Trainer', icon: '💪', role: 'Personal Trainer', effect: '+50% equipment income', costBase: 500, costMult: 2.5, salary: 63, incomeMult: 0.5, reqLevel: 2 },
  { id: 'receptionist', name: 'Receptionist', icon: '👩‍💼', role: 'Customer Service', effect: '+1 member every 25s automatically', costBase: 1000, costMult: 2.5, salary: 88, autoMembers: 1, reqLevel: 3 },
  { id: 'cleaner', name: 'Cleaning Staff', icon: '🧹', role: 'Maintenance', effect: '+20% reputation per tick', costBase: 800, costMult: 2.0, salary: 50, repMult: 0.2, reqLevel: 4 },
  { id: 'nutritionist', name: 'Nutritionist', icon: '🥗', role: 'Nutrition Advisor', effect: '+30% income, +5 capacity', costBase: 3000, costMult: 2.5, salary: 150, incomeMult: 0.3, capacityBonus: 5, reqLevel: 6 },
  { id: 'physio', name: 'Physical Therapist', icon: '🩺', role: 'Rehabilitation', effect: '+40% reputation, reduces injuries', costBase: 5000, costMult: 2.5, salary: 200, repMult: 0.4, reqLevel: 8 },
  { id: 'influencer', name: 'Fitness Influencer', icon: '📱', role: 'Marketing', effect: '+1 member every 20s, +reputation', costBase: 8000, costMult: 3.0, salary: 300, autoMembers: 1, repMult: 0.3, reqLevel: 10 },
  { id: 'manager', name: 'Manager', icon: '👔', role: 'Administration', effect: '-20% on all costs', costBase: 15000, costMult: 3.0, salary: 500, costReduction: 0.2, reqLevel: 12 },
  { id: 'champion', name: 'Retired Champion', icon: '🏅', role: 'Ambassador', effect: 'x2 competition prizes', costBase: 50000, costMult: 3.5, salary: 875, compMult: 2, reqLevel: 15 },
];

const COMPETITIONS = [
  { id: 'local', name: 'Local Tournament', icon: '🏠', desc: 'Local weightlifting competition. Low risk.', reward: 500, repReward: 10, xpReward: 30, cooldown: 600, minRep: 0, winChance: 0.8 },
  { id: 'city', name: 'City Championship', icon: '🏙️', desc: 'The best in the city. Intermediate level.', reward: 2000, repReward: 30, xpReward: 80, cooldown: 1200, minRep: 50, winChance: 0.6 },
  { id: 'regional', name: 'Regional Powerlifting', icon: '🗺️', desc: 'Deadlift, squat, bench. The big three.', reward: 8000, repReward: 80, xpReward: 200, cooldown: 2400, minRep: 200, winChance: 0.45 },
  { id: 'national', name: 'National Strength Championship', icon: '🏅', desc: 'The best in the country compete here.', reward: 30000, repReward: 200, xpReward: 500, cooldown: 5400, minRep: 500, winChance: 0.3 },
  { id: 'continental', name: 'Continental Championship', icon: '🌎', desc: 'The best of the continent go head to head. Epic.', reward: 100000, repReward: 500, xpReward: 1200, cooldown: 10800, minRep: 1500, winChance: 0.2 },
  { id: 'world', name: 'World Weightlifting Championship', icon: '🌍', desc: 'The pinnacle. Only the best in the world.', reward: 500000, repReward: 2000, xpReward: 5000, cooldown: 21600, minRep: 5000, winChance: 0.1 },
];

const ACHIEVEMENTS = [
  { id: 'first_equip', name: 'First Step', icon: '👟', desc: 'Buy your first equipment', check: () => Object.values(game.equipment).some(e => e.level > 0) },
  { id: 'ten_members', name: 'Now We\'re 10', icon: '👥', desc: 'Reach 10 members', check: () => game.members >= 10 },
  { id: 'fifty_members', name: 'Half a Hundred', icon: '🎉', desc: 'Reach 50 members', check: () => game.members >= 50 },
  { id: 'hundred_members', name: 'The 100 Club', icon: '💯', desc: 'Reach 100 members', check: () => game.members >= 100 },
  { id: 'thousand_bucks', name: 'First Grand', icon: '💵', desc: 'Earn $1,000 total', check: () => game.totalMoneyEarned >= 1000 },
  { id: 'ten_k', name: 'Ten Grand', icon: '💰', desc: 'Earn $10,000 total', check: () => game.totalMoneyEarned >= 10000 },
  { id: 'hundred_k', name: 'Six Figures', icon: '🤑', desc: 'Earn $100,000 total', check: () => game.totalMoneyEarned >= 100000 },
  { id: 'million', name: 'Millionaire', icon: '👑', desc: 'Earn $1,000,000 total', check: () => game.totalMoneyEarned >= 1000000 },
  { id: 'first_comp', name: 'Competitor', icon: '🏆', desc: 'Win your first competition', check: () => Object.values(game.competitions).some(c => c.wins > 0) },
  { id: 'five_comps', name: 'Winning Streak', icon: '🔥', desc: 'Win 5 competitions', check: () => Object.values(game.competitions).reduce((s, c) => s + (c.wins || 0), 0) >= 5 },
  { id: 'first_staff', name: 'Boss', icon: '🤝', desc: 'Hire your first employee', check: () => Object.values(game.staff).some(s => s.hired) },
  { id: 'full_staff', name: 'Dream Team', icon: '⭐', desc: 'Hire all the staff', check: () => STAFF.every(s => game.staff[s.id]?.hired) },
  { id: 'level_5', name: 'Level 5', icon: '📈', desc: 'Reach level 5', check: () => game.level >= 5 },
  { id: 'level_10', name: 'Level 10', icon: '🚀', desc: 'Reach level 10', check: () => game.level >= 10 },
  { id: 'level_20', name: 'Level 20', icon: '🏔️', desc: 'Reach level 20', check: () => game.level >= 20 },
  { id: 'first_prestige', name: 'First Branch', icon: '🏙️', desc: 'Open your second branch', check: () => getTotalGymCount() >= 2 },
  { id: 'three_branches', name: 'Chain', icon: '🏢', desc: 'Have 3 gyms in your empire', check: () => getTotalGymCount() >= 3 },
  { id: 'all_neighborhoods', name: 'King of LA', icon: '👑', desc: 'Have a gym in every neighborhood', check: () => getTotalGymCount() >= 6 },
  { id: 'rep_100', name: 'Known', icon: '📣', desc: 'Reach 100 reputation', check: () => game.reputation >= 100 },
  { id: 'rep_1000', name: 'Famous', icon: '🌟', desc: 'Reach 1000 reputation', check: () => game.reputation >= 1000 },
  { id: 'first_class', name: 'Instructor', icon: '🧘', desc: 'Run your first class', check: () => game.stats.classesCompleted >= 1 },
  { id: 'ten_classes', name: 'Pro Instructor', icon: '🏅', desc: 'Complete 10 classes', check: () => game.stats.classesCompleted >= 10 },
  { id: 'first_campaign', name: 'In the Media', icon: '📢', desc: 'Launch your first marketing campaign', check: () => game.stats.campaignsLaunched >= 1 },
  { id: 'streak_7', name: 'Full Week', icon: '🔥', desc: 'Keep a 7-day streak', check: () => game.dailyBonus.streak >= 7 },
  { id: 'mission_master', name: 'Mission Runner', icon: '📋', desc: 'Complete 10 daily missions', check: () => game.stats.missionsCompleted >= 10 },
  { id: 'event_handler', name: 'Problem Solver', icon: '⚡', desc: 'Resolve 10 events', check: () => game.stats.eventsHandled >= 10 },
  { id: 'first_skill', name: 'Researcher', icon: '🔬', desc: 'Research your first upgrade', check: () => game.stats.skillsResearched >= 1 },
  { id: 'skill_master', name: 'Science Master', icon: '🧬', desc: 'Research 8 upgrades', check: () => game.stats.skillsResearched >= 8 },
  { id: 'first_zone', name: 'Expansionist', icon: '🏗️', desc: 'Unlock a new zone', check: () => game.stats.zonesUnlocked >= 2 },
  { id: 'all_zones', name: 'Real Estate Mogul', icon: '🏟️', desc: 'Unlock all zones', check: () => game.stats.zonesUnlocked >= GYM_ZONES.length },
  { id: 'first_vip', name: 'VIP Treatment', icon: '⭐', desc: 'Serve your first VIP member', check: () => game.stats.vipsServed >= 1 },
  { id: 'vip_magnet', name: 'VIP Magnet', icon: '🧲', desc: 'Serve 10 VIP members', check: () => game.stats.vipsServed >= 10 },
  { id: 'five_hundred_members', name: 'Five Hundred Strong', icon: '🏟️', desc: 'Reach 500 members', check: () => game.members >= 500 },
  { id: 'ten_million', name: 'Ten Million', icon: '💎', desc: 'Earn $10,000,000 total', check: () => game.totalMoneyEarned >= 10000000 },
  // Chaos mechanics
  { id: 'first_repair', name: 'Technician', icon: '🔧', desc: 'Repair your first broken equipment', check: () => game.stats.equipRepaired >= 1 },
  { id: 'repair_master', name: 'Master Mechanic', icon: '⚙️', desc: 'Repair 10 pieces of equipment', check: () => game.stats.equipRepaired >= 10 },
  { id: 'first_heal', name: 'Gym Doctor', icon: '💊', desc: 'Heal a sick employee', check: () => game.stats.staffHealed >= 1 },
  { id: 'survivor', name: 'Survivor', icon: '🛡️', desc: 'Endure 20 equipment breakdowns', check: () => game.stats.equipBreakdowns >= 20 },
  // Construction & upgrades
  { id: 'property_owner', name: 'Property Owner', icon: '🏠', desc: 'Buy the property', check: () => game.ownProperty },
  { id: 'level_15', name: 'Level 15', icon: '⚡', desc: 'Reach level 15', check: () => game.level >= 15 },
  { id: 'level_25', name: 'Level 25', icon: '🔱', desc: 'Reach level 25', check: () => game.level >= 25 },
  // Staff training
  { id: 'train_staff', name: 'Trainer of Trainers', icon: '📚', desc: 'Train a staff member to level 3', check: () => Object.values(game.staff).some(s => s.hired && s.level >= 3) },
  { id: 'max_staff_level', name: 'Elite Staff', icon: '🎓', desc: 'Take a staff member to level 5', check: () => Object.values(game.staff).some(s => s.hired && s.level >= 5) },
  { id: 'hire_extra', name: 'Duplicator', icon: '👯', desc: 'Hire a second employee of the same type', check: () => Object.values(game.staff).some(s => s.extras && s.extras.length >= 1) },
  // Skills
  { id: 'five_skills', name: 'Advanced Researcher', icon: '🔬', desc: 'Research 5 upgrades', check: () => game.stats.skillsResearched >= 5 },
  { id: 'fifteen_skills', name: 'Mad Scientist', icon: '🧪', desc: 'Research 15 upgrades', check: () => game.stats.skillsResearched >= 15 },
  { id: 'all_skills', name: 'Omniscient', icon: '🧠', desc: 'Research all 30 upgrades', check: () => game.stats.skillsResearched >= 30 },
  // Competition mastery
  { id: 'ten_comp_wins', name: 'Veteran', icon: '🎖️', desc: 'Win 10 competitions', check: () => game.stats.competitionsWon >= 10 },
  { id: 'fifty_comp_wins', name: 'Legend', icon: '🏅', desc: 'Win 50 competitions', check: () => game.stats.competitionsWon >= 50 },
  { id: 'world_champ', name: 'World Champion', icon: '🌍', desc: 'Win the World Weightlifting Championship', check: () => (game.competitions.world?.wins || 0) >= 1 },
  // Rivals
  { id: 'first_rival', name: 'Rival Defeated', icon: '💀', desc: 'Defeat your first rival', check: () => game.stats.rivalsDefeated >= 1 },
  { id: 'all_rivals', name: 'Local Monopoly', icon: '🦈', desc: 'Defeat all rivals', check: () => game.stats.rivalsDefeated >= 6 },
  // Money milestones
  { id: 'hundred_million', name: 'Hundred Million', icon: '💸', desc: 'Earn $100,000,000 total', check: () => game.totalMoneyEarned >= 100000000 },
  { id: 'billion', name: 'Billionaire', icon: '🏦', desc: 'Earn $1,000,000,000 total', check: () => game.totalMoneyEarned >= 1000000000 },
  // Supplements
  { id: 'supp_addict', name: 'Supplemented', icon: '💉', desc: 'Buy 20 supplements', check: () => game.stats.supplementsBought >= 20 },
  // Rep
  { id: 'rep_5000', name: 'Icon', icon: '🌟', desc: 'Reach 5000 reputation', check: () => game.reputation >= 5000 },
  { id: 'rep_10000', name: 'Fitness Legend', icon: '👑', desc: 'Reach 10000 reputation', check: () => game.reputation >= 10000 },
  // Playtime
  { id: 'play_1h', name: 'Hooked', icon: '⏰', desc: 'Play 1 hour total', check: () => game.stats.totalPlayTime >= 3600 },
  { id: 'play_10h', name: 'Gym Addict', icon: '🕐', desc: 'Play 10 hours total', check: () => game.stats.totalPlayTime >= 36000 },
  // Classes
  { id: 'fifty_classes', name: 'Head Instructor', icon: '🎓', desc: 'Complete 50 classes', check: () => game.stats.classesCompleted >= 50 },
  // Members
  { id: 'thousand_members', name: 'A Thousand Members', icon: '🏟️', desc: 'Reach 1000 members', check: () => game.members >= 1000 },
  // Champion
  { id: 'champion_recruit', name: 'The Chosen One', icon: '🏅', desc: 'Recruit your first champion', check: () => game.champion && game.champion.recruited },
  { id: 'champion_lvl5', name: 'Contender', icon: '🥊', desc: 'Take your champion to level 5', check: () => game.champion && game.champion.level >= 5 },
  { id: 'champion_lvl10', name: 'Professional', icon: '🏆', desc: 'Take your champion to level 10', check: () => game.champion && game.champion.level >= 10 },
  { id: 'champion_bestia', name: 'The Beast', icon: '💪', desc: 'Your champion reached Beast stage', check: () => game.champion && game.champion.recruited && (game.champion.stats.fuerza + game.champion.stats.resistencia + game.champion.stats.velocidad + game.champion.stats.tecnica) >= 200 },
  { id: 'champion_wins3', name: 'Winning Streak', icon: '🔥', desc: 'Win 3 competitions with your champion', check: () => game.stats.championWins >= 3 },
  { id: 'champion_equipped', name: 'Fully Equipped', icon: '⚔️', desc: 'Fill all 4 of the champion\'s slots', check: () => game.champion && game.champion.equipment && game.champion.equipment.hands && game.champion.equipment.waist && game.champion.equipment.feet && game.champion.equipment.head },
  { id: 'grand_first_win', name: 'The Big Score', icon: '🌎', desc: 'Win your first Grand Tournament', check: () => (game.stats.grandWins || 0) >= 1 },
  { id: 'grand_mundial', name: 'Top of the World', icon: '🌍', desc: 'Win the Legends World Cup', check: () => game.grandTournaments && (game.grandTournaments.mundial_leyendas?.wins || 0) >= 1 },
  { id: 'opp_first_win', name: 'Dealmaker', icon: '💼', desc: 'Close your first risky venture', check: () => (game.stats.oppWins || 0) >= 1 },
  { id: 'opp_inmobiliaria', name: 'The Shark', icon: '🦈', desc: 'Win a Real Estate Investment', check: () => game.opportunities && (game.opportunities.inmobiliaria?.wins || 0) >= 1 },
  // Decoration & Profile
  { id: 'first_decoration', name: 'Decorator', icon: '🎨', desc: 'Buy your first decoration', check: () => game.decoration && Object.keys(game.decoration.items || {}).length >= 1 },
  { id: 'five_decorations', name: 'Interior Designer', icon: '🏠', desc: 'Buy 5 decorations', check: () => game.decoration && Object.keys(game.decoration.items || {}).length >= 5 },
  { id: 'all_decorations', name: 'Fully Decked Gym', icon: '🖼️', desc: 'Buy all 10 decorations', check: () => game.decoration && Object.keys(game.decoration.items || {}).length >= 10 },
  { id: 'three_themes', name: 'Fashionista', icon: '🌈', desc: 'Unlock 3 visual themes', check: () => game.decoration && (game.decoration.unlockedThemes || []).length >= 3 },
  { id: 'set_title', name: 'Identified', icon: '👤', desc: 'Pick an active title for your profile', check: () => game.profile && game.profile.activeTitle && game.profile.activeTitle !== 'principiante' },
  { id: 'iron_legend', name: 'Iron Legend', icon: '🔥', desc: 'Earn the Iron Legend title', check: () => game.level >= 25 && game.totalMoneyEarned >= 10000000 && game.stats.championWins >= 50 },
  // Instructors
  { id: 'first_instructor', name: 'First Coach', icon: '👨‍🏫', desc: 'Hire your first class instructor', check: () => Object.values(game.instructors).some(i => i.hired) },
  { id: 'all_instructors', name: 'Full Roster', icon: '👨‍🏫', desc: 'Hire all 8 instructors', check: () => typeof CLASS_INSTRUCTORS !== 'undefined' && CLASS_INSTRUCTORS.every(i => game.instructors[i.id]?.hired) },
  { id: 'max_instructor', name: 'Level 5 Coach', icon: '⭐', desc: 'Take an instructor to max level', check: () => Object.values(game.instructors).some(i => i.hired && i.level >= 5) },
];

const GYM_CLASSES = [
  { id: 'yoga', name: 'Yoga', icon: '🧘', desc: 'Flexibility and peace of mind.', duration: 120, income: 200, cost: 80, xp: 40, rep: 5, reqLevel: 2, cooldown: 600 },
  { id: 'spinning', name: 'Spinning', icon: '🚴', desc: 'Intense cardio on wheels.', duration: 90, income: 300, cost: 130, xp: 50, rep: 8, reqLevel: 3, cooldown: 480, reqEquipment: 'treadmill' },
  { id: 'pilates', name: 'Pilates', icon: '🤸', desc: 'Core and body control.', duration: 120, income: 350, cost: 150, xp: 45, rep: 7, reqLevel: 4, cooldown: 600 },
  { id: 'zumba', name: 'Zumba', icon: '💃', desc: 'Dance and work out at the same time.', duration: 90, income: 350, cost: 140, xp: 45, rep: 10, reqLevel: 4, cooldown: 540 },
  { id: 'hiit', name: 'HIIT', icon: '💥', desc: 'High-intensity intervals. Burn it all.', duration: 60, income: 400, cost: 200, xp: 60, rep: 10, reqLevel: 5, cooldown: 360 },
  { id: 'boxing_class', name: 'Fitness Boxing', icon: '🥊', desc: 'Hit the bag, blow off steam.', duration: 75, income: 500, cost: 280, xp: 70, rep: 12, reqLevel: 7, cooldown: 500, reqEquipment: 'boxing' },
  { id: 'crossfit_class', name: 'CrossFit WOD', icon: '🏋️', desc: 'Workout Of the Day. Intense.', duration: 60, income: 600, cost: 350, xp: 80, rep: 15, reqLevel: 9, cooldown: 400, reqEquipment: 'crossfit' },
  { id: 'swimming', name: 'Guided Swimming', icon: '🏊', desc: 'Technique and endurance in the water.', duration: 90, income: 700, cost: 400, xp: 90, rep: 18, reqLevel: 11, cooldown: 600, reqEquipment: 'pool' },
];

const CLASS_INSTRUCTORS = [
  { id: 'yoga',           name: 'Yoga Instructor',      icon: '🧘', hireCost: 300,   upgradeMult: 1.5, commission: 0.15, reqLevel: 2 },
  { id: 'spinning',       name: 'Spinning Instructor',  icon: '🚴', hireCost: 600,   upgradeMult: 1.5, commission: 0.15, reqLevel: 3 },
  { id: 'pilates',        name: 'Pilates Instructor',   icon: '🤸', hireCost: 1000,  upgradeMult: 1.5, commission: 0.15, reqLevel: 4 },
  { id: 'zumba',          name: 'Zumba Instructor',     icon: '💃', hireCost: 1000,  upgradeMult: 1.5, commission: 0.15, reqLevel: 4 },
  { id: 'hiit',           name: 'HIIT Instructor',      icon: '💥', hireCost: 2000,  upgradeMult: 1.5, commission: 0.15, reqLevel: 5 },
  { id: 'boxing_class',   name: 'Boxing Instructor',    icon: '🥊', hireCost: 5000,  upgradeMult: 1.5, commission: 0.15, reqLevel: 7 },
  { id: 'crossfit_class', name: 'CrossFit Instructor',  icon: '🏋️', hireCost: 12000, upgradeMult: 1.5, commission: 0.15, reqLevel: 9 },
  { id: 'swimming',       name: 'Swimming Instructor',  icon: '🏊', hireCost: 25000, upgradeMult: 1.5, commission: 0.15, reqLevel: 11 },
];

const MARKETING_CAMPAIGNS = [
  // ===== ALWAYS-ON (toggle ON/OFF — daily cost, continuous generation) =====
  { id: 'flyers', name: 'Flyers', icon: '📄', type: 'always_on',
    desc: 'Hand out flyers around the neighborhood. Low cost, steady flow of new members.',
    costPerDay: 120, membersPerDay: 3, repPerDay: 2, reqLevel: 1 },
  { id: 'whatsapp', name: 'WhatsApp Broadcast', icon: '💬', type: 'always_on',
    desc: 'An active broadcast group. The digital word of mouth that never stops.',
    costPerDay: 300, membersPerDay: 6, repPerDay: 4, reqLevel: 2 },
  { id: 'instagram', name: 'Instagram Ads', icon: '📸', type: 'always_on',
    desc: 'Sponsored posts and stories. Constant reach on social media.',
    costPerDay: 500, membersPerDay: 10, repPerDay: 7, reqLevel: 3 },
  { id: 'google_ads', name: 'Google Ads', icon: '🔍', type: 'always_on',
    desc: 'Show up first in searches. High purchase intent, guaranteed daily flow.',
    costPerDay: 1200, membersPerDay: 18, repPerDay: 12, reqLevel: 5 },
  // ===== BURST (one-time event with cooldown) =====
  { id: 'youtube', name: 'YouTube Video', icon: '🎥', type: 'burst',
    desc: 'A gym tour that goes viral. Drives a massive spike of new members.',
    cost: 5000, membersBoost: 40, duration: 300, repBoost: 35, cooldown: 300, reqLevel: 7 },
  { id: 'radio', name: 'Radio Ad', icon: '📻', type: 'burst',
    desc: 'A radio spot in prime time. Reaches the whole city in a few days.',
    cost: 10000, membersBoost: 60, duration: 300, repBoost: 50, cooldown: 360, reqLevel: 9 },
  { id: 'tv', name: 'TV Spot', icon: '📺', type: 'burst',
    desc: 'A television ad. The big game of local marketing.',
    cost: 30000, membersBoost: 110, duration: 600, repBoost: 90, cooldown: 600, reqLevel: 12 },
  { id: 'celebrity', name: 'Celebrity Sponsor', icon: '🌟', type: 'burst',
    desc: 'A celebrity trains at your gym. Everyone talks about it for days.',
    cost: 80000, membersBoost: 220, duration: 900, repBoost: 220, cooldown: 900, reqLevel: 15 },
  { id: 'patrocinio', name: 'Corporate Sponsorship', icon: '🏢', type: 'burst',
    desc: 'A big company uses your gym for its employees. A massive image deal.',
    cost: 200000, membersBoost: 400, duration: 1200, repBoost: 400, cooldown: 1800, reqLevel: 19 },
  { id: 'gala', name: 'Grand Opening Gala', icon: '🎪', type: 'burst',
    desc: 'A huge event with press, influencers and streamers. The gym is packed.',
    cost: 500000, membersBoost: 800, duration: 2400, repBoost: 800, cooldown: 3600, reqLevel: 23 },
];

const RANDOM_EVENTS = [
  { id:'inspection', icon:'🏛️', title:'City Inspection', minLevel:1,
    desc:'A city inspector came to check the facilities. Your decisions affect your reputation.',
    choices:[
      { text:'Upgrade the facilities', hint:'A safe investment that improves your image.', money:-1, rep:2, xp:1 },
      { text:'Pay the fine', hint:'Quick fix, gets the problem off your plate.', money:-1 },
      { text:'Ignore the inspector', hint:'⚠️ Risky. Damages your reputation.', rep:-1 },
    ]},
  { id:'celebrity_visit', icon:'🌟', title:'Celebrity Visit', minLevel:3,
    desc:'A fitness influencer wants to train at your gym today. How do you handle it?',
    choices:[
      { text:'Let them train for free', hint:'Their audience will hear about your gym. Reputation boom.', rep:3, xp:2 },
      { text:'Charge them a VIP membership', hint:'Immediate profit, less social media impact.', money:2, rep:1 },
    ]},
  { id:'broken_equipment', icon:'🔧', title:'Broken Equipment', minLevel:2,
    desc:'A machine broke down and the members are upset.',
    choices:[
      { text:'Repair immediately', hint:'Shows you care.', money:-1, rep:1 },
      { text:'Out-of-service sign', hint:'⚠️ Cheap, but the members notice.', rep:-1 },
      { text:'Upgrade to new equipment', hint:'Big investment, great positive impact.', money:-2, rep:3, xp:2 },
    ]},
  { id:'sponsor_offer', icon:'💼', title:'Sponsor Offer', minLevel:4,
    desc:'A supplement brand wants to sponsor your gym in exchange for exclusivity.',
    choices:[
      { text:'Accept the sponsorship', hint:'Safe profit + experience.', money:2, xp:1 },
      { text:'Negotiate a better deal', hint:'🎲 Risk/reward: you double it or walk away empty-handed.', gamble:{ p:0.5, win:{ money:3, xp:1 }, lose:{} } },
      { text:'Decline (keep your freedom)', hint:'Your gym keeps its identity. Reputation bonus.', rep:2 },
    ]},
  { id:'group_discount', icon:'👥', title:'Corporate Group', minLevel:3,
    desc:'A company wants discounted group memberships for its employees.',
    choices:[
      { text:'Accept with a discount', hint:'Lots of new members at once + some cash.', members:2, money:1 },
      { text:'Full price or nothing', hint:'🎲 Hard to get them to agree, but you earn more per member.', gamble:{ p:0.35, win:{ members:1, money:2 }, lose:{} } },
    ]},
  { id:'competition_invite', icon:'🏆', title:'Exhibition Invite', minLevel:5,
    desc:'You\'re invited to a strength exhibition at a local event. A great marketing opportunity.',
    choices:[
      { text:'Take part personally', hint:'Maximum impact. Your face represents the gym.', rep:3, xp:3 },
      { text:'Send your best member', hint:'Good result with less personal impact.', rep:2, xp:2 },
    ]},
  { id:'water_leak', icon:'💧', title:'Water Leak', minLevel:1,
    desc:'There\'s a leak in the roof. Water is dripping onto the machines.',
    choices:[
      { text:'Fix it now', hint:'Take care of it before it gets worse.', money:-1, rep:1 },
      { text:'Leave it for later', hint:'⚠️ Very risky. The members will talk.', rep:-2 },
    ]},
  { id:'fitness_challenge', icon:'🎯', title:'Viral Fitness Challenge', minLevel:2,
    desc:'A fitness challenge went viral on TikTok. Your gym could jump in.',
    choices:[
      { text:'Host the challenge at the gym', hint:'Attracts new members and raises reputation.', money:-1, members:2, rep:2, xp:2 },
      { text:'Film it and post online', hint:'No cost. Good free marketing.', rep:1, xp:1 },
      { text:'Ignore it', hint:'A missed opportunity, but no harm done.', },
    ]},
  { id:'power_outage', icon:'⚡', title:'Power Outage', minLevel:3,
    desc:'The power went out in the neighborhood. Your gym is in the dark.',
    choices:[
      { text:'Buy a generator', hint:'Big investment but great reputation.', money:-2, rep:3, xp:2 },
      { text:'Train by candlelight', hint:'🎲 Creative. Could be fun... or dangerous.', gamble:{ p:0.7, win:{ rep:1, xp:1 }, lose:{ rep:-1, members:-1 } } },
      { text:'Close for the day', hint:'⚠️ Easy, but the members go to another gym.', rep:-3 },
    ]},
  { id:'member_complaint', icon:'😤', title:'Longtime Member Complaint', minLevel:2,
    desc:'A longtime member is threatening to leave for the competition.',
    choices:[
      { text:'Offer them a free month', hint:'Retains them and improves perception.', money:-1, rep:2 },
      { text:'Listen and promise improvements', hint:'Calms them down for now.', rep:1 },
      { text:'Let them go', hint:'⚠️ They might take others with them.', members:-1, rep:-2 },
    ]},
  { id:'equipment_theft', icon:'🦹', title:'Gym Burglary', minLevel:3,
    desc:'Someone broke in overnight. Weights and accessories are missing.',
    choices:[
      { text:'Install security cameras', hint:'Prevents future thefts and gives peace of mind.', money:-2, rep:2, xp:2 },
      { text:'File a police report', hint:'Bureaucratic paperwork, doesn\'t fix the security issue.', money:-1 },
      { text:'Do nothing', hint:'⚠️ The members feel unsafe and leave.', rep:-3, members:-1 },
    ]},
  { id:'flu_outbreak', icon:'🤒', title:'Flu Outbreak', minLevel:2,
    desc:'Several members got sick. There\'s a risk of contagion.',
    choices:[
      { text:'Professional disinfection', hint:'The members really appreciate it.', money:-2, rep:2, xp:1 },
      { text:'Put out hand sanitizer', hint:'Minimal effort, but something is something.', money:-1, rep:1 },
      { text:'Wait it out', hint:'⚠️ The healthy ones start leaving too.', members:-1, rep:-2 },
    ]},
  { id:'negative_review', icon:'📱', title:'Viral Negative Review', minLevel:4,
    desc:'A former member posted a 1-star review that went viral.',
    choices:[
      { text:'Respond professionally', hint:'Shows maturity. The best strategy.', rep:1, xp:1 },
      { text:'Positive review campaign', hint:'Ask current members to leave good reviews.', money:-1, rep:3, xp:2 },
      { text:'Ignore it', hint:'⚠️ The algorithm prioritizes the negative review.', rep:-2 },
    ]},
  { id:'gym_tournament', icon:'🏋️', title:'Tournament at Your Gym', minLevel:6,
    desc:'A federation wants to host an amateur tournament at your facilities.',
    choices:[
      { text:'Host the tournament', hint:'An investment that pays for itself: the gym fills up.', money:2, rep:3, xp:3 },
      { text:'Charge entry and commission', hint:'Less work, safe profit.', money:2, rep:1 },
    ]},
  { id:'supplier_deal', icon:'📦', title:'Supplier Offer', minLevel:5,
    desc:'A supplier offers you a batch of equipment at a discount.',
    choices:[
      { text:'Buy the batch', hint:'Improves the gym\'s overall quality.', money:-2, rep:3, xp:2 },
      { text:'Negotiate financing', hint:'Pay less now, smaller impact.', money:-1, rep:2, xp:1 },
      { text:'Not interested', hint:'No cost, no benefit.', },
    ]},
  { id:'journalist_visit', icon:'📰', title:'Press Feature', minLevel:5,
    desc:'A local journalist wants to do a feature on your gym.',
    choices:[
      { text:'Do the interview', hint:'Free publicity, great exposure.', rep:3, members:1, xp:2 },
      { text:'Pay for extra advertising', hint:'Feature + half a page in the paper. Maximum impact.', money:-2, rep:3, members:2, xp:3 },
    ]},
  { id:'staff_burnout', icon:'😩', title:'Staff Burnout', minLevel:5,
    desc:'Your team is exhausted. Several employees are complaining about the pace.',
    choices:[
      { text:'Spa day for the staff', hint:'Lifts morale and heals the sick ones.', money:-2, rep:2, xp:2, special:'curestaff' },
      { text:'Pizza party', hint:'Cheap but appreciated.', money:-1, rep:1 },
      { text:'Tell them to tough it out', hint:'⚠️ Risk that they get sick more often.', rep:-2 },
    ]},
  { id:'supplement_deal', icon:'🧪', title:'Supplement Wholesaler', minLevel:6,
    desc:'A distributor offers you supplements at cost.',
    choices:[
      { text:'Buy the full stock', hint:'Activates a random free supplement.', money:-3, xp:1, special:'randomsupp' },
      { text:'Resell at a profit', hint:'Quick business, safe cash.', money:2 },
    ]},
  { id:'construction_delay', icon:'🚧', title:'Construction Problems', minLevel:4,
    desc:'The materials supplier fell behind and it\'s complicating everything.',
    choices:[
      { text:'Find another supplier', hint:'More expensive but you don\'t lose time.', money:-2, rep:2, xp:1 },
      { text:'Wait patiently', hint:'⚠️ The members get impatient.', rep:-1 },
    ]},
  { id:'rival_sabotage', icon:'🕵️', title:'Rival Sabotage', minLevel:7,
    desc:'A rival left fake reviews and flyers smearing your gym.',
    choices:[
      { text:'Counterattack campaign', hint:'Aggressive marketing. Neutralizes it and gains members.', money:-3, rep:3, members:2, xp:2 },
      { text:'Sue for defamation', hint:'A long process but you set a precedent.', money:-1, rep:2, xp:3 },
      { text:'Ignore it and keep working', hint:'⚠️ You lose members.', members:-2, rep:-2 },
    ]},
  { id:'training_seminar', icon:'🎓', title:'Training Seminar', minLevel:6,
    desc:'An academy offers an intensive seminar for your staff.',
    choices:[
      { text:'Send the whole staff', hint:'A big investment in your team.', money:-3, xp:2, rep:2 },
      { text:'Send only the trainer', hint:'More affordable, smaller impact.', money:-1, xp:1, rep:1 },
      { text:'Not worth it', hint:'You save cash, you lose the opportunity.', },
    ]},
  { id:'equipment_recall', icon:'⚠️', title:'Equipment Recall', minLevel:8,
    desc:'The manufacturer found a defect. They offer a replacement or compensation.',
    choices:[
      { text:'Ask for an upgraded replacement', hint:'New and better equipment.', rep:2, xp:2 },
      { text:'Accept cash compensation', hint:'Cash in hand, less impact.', money:3 },
    ]},
  { id:'social_media_collab', icon:'📸', title:'Collab with an Instagrammer', minLevel:8,
    desc:'An influencer with 500K followers wants to do a collab.',
    choices:[
      { text:'Full collab (lend them the gym)', hint:'Lots of exposure. Member boom.', money:-2, members:3, rep:3, xp:2 },
      { text:'Have them pay to use the gym', hint:'Safe cash, smaller media impact.', money:2, rep:1 },
      { text:'Not interested', hint:'No impact.', },
    ]},
  { id:'health_inspection', icon:'🩺', title:'Health Inspection', minLevel:3,
    desc:'The health department came to inspect the locker rooms and the juice bar.',
    choices:[
      { text:'Express deep clean', hint:'You pass with flying colors. The members notice.', money:-2, rep:2, xp:1 },
      { text:'Trust your usual cleaning', hint:'🎲 If everything\'s in order, you\'re fine.', gamble:{ p:0.55, win:{ rep:1 }, lose:{ money:-1, rep:-1 } } },
    ]},
  { id:'lucky_day', icon:'🍀', title:'Lucky Day', minLevel:1,
    desc:'Everything goes right today! A former member came back with friends and free products arrived.',
    choices:[
      { text:'Enjoy it!', hint:'No catch, just good news.', money:2, members:2, rep:2 },
    ]},
  { id:'neighborhood_event', icon:'🎪', title:'Neighborhood Fair', minLevel:2,
    desc:'There\'s a community fair this weekend. You can set up a booth.',
    choices:[
      { text:'Booth with free demos', hint:'Class samples + a raffle. Draws in the curious.', money:-2, members:3, rep:2, xp:2 },
      { text:'Hand out flyers', hint:'Low cost, low impact.', money:-1, members:1, rep:1 },
      { text:'Skip it', hint:'Missed opportunity.', },
    ]},
  { id:'tax_audit', icon:'🧾', title:'Tax Audit', minLevel:10,
    desc:'The IRS wants to review your numbers. Better have everything in order...',
    choices:[
      { text:'Hire an express accountant', hint:'Sorts everything out fast. Total peace of mind.', money:-2, rep:1 },
      { text:'File the books as they are', hint:'🎲 Depends how things look. If you\'re clean, fine; if not, big fine.', gamble:{ p:0.6, win:{ rep:1 }, lose:{ money:-3 } } },
    ]},
  { id:'heat_wave', icon:'🥵', title:'Heat Wave', minLevel:3,
    desc:'It\'s over 100 degrees and the AC can\'t keep up. The members are melting.',
    choices:[
      { text:'Buy more air conditioners', hint:'An investment that shows. Everyone appreciates it.', money:-2, rep:2 },
      { text:'Hand out fans and water', hint:'🎲 A band-aid fix: it might be enough, or not.', gamble:{ p:0.6, win:{ rep:1 }, lose:{ rep:-1, members:-1 } } },
      { text:'Let them tough it out', hint:'⚠️ Some won\'t come back in this heat.', rep:-2, members:-1 },
    ]},
  { id:'star_instructor', icon:'🧑‍🏫', title:'They Poach Your Coach', minLevel:7,
    desc:'A rival wants to lure away your star instructor with a better offer.',
    choices:[
      { text:'Raise their salary', hint:'You keep them. Your team sees you value talent.', money:-2, rep:1, xp:1 },
      { text:'Counteroffer + loyalty bonus', hint:'You lock them in and add new students.', money:-3, rep:2, members:1, xp:2 },
      { text:'Let them go', hint:'🎲 Maybe you find a better one... or lose their students.', gamble:{ p:0.45, win:{ xp:1, rep:1 }, lose:{ rep:-2, members:-1 } } },
    ]},
  { id:'gym_dog', icon:'🐶', title:'The Gym Mascot', minLevel:2,
    desc:'A stray dog showed up and the members already adore it.',
    choices:[
      { text:'Adopt it as the gym mascot', hint:'It becomes the star of social media.', rep:2, members:1, xp:1 },
      { text:'Find it a home', hint:'The right thing to do. People appreciate it.', rep:1 },
      { text:'Kick it out', hint:'⚠️ Bad vibes, the members are let down.', rep:-1 },
    ]},
  { id:'member_record', icon:'🏅', title:'A Member\'s Record', minLevel:5,
    desc:'A member broke a lifting record and the press wants to cover it.',
    choices:[
      { text:'Throw them a party', hint:'Photos everywhere. The gym\'s pride.', money:-1, rep:3, members:1, xp:2 },
      { text:'Just post it online', hint:'Free and effective.', rep:1, xp:1 },
    ]},
  { id:'junk_food_truck', icon:'🍔', title:'Junk Food Truck', minLevel:4,
    desc:'A food truck set up across the street, tempting your members with burgers.',
    choices:[
      { text:'Give a nutrition talk', hint:'You educate and position yourself as an authority.', money:-1, rep:2, xp:1 },
      { text:'Make a deal with them', hint:'🎲 Odd business: could pay off or backfire.', gamble:{ p:0.5, win:{ money:2 }, lose:{ rep:-1 } } },
      { text:'Ignore it', hint:'⚠️ Some members let their diet and pace slip.', members:-1 },
    ]},
  { id:'buyout_offer', icon:'🤝', title:'Buyout Offer', minLevel:12,
    desc:'A big chain wants to buy your gym and add it to their empire.',
    choices:[
      { text:'Refuse with pride', hint:'Your brand isn\'t for sale. The members love you for it.', rep:3, xp:2 },
      { text:'Negotiate an image deal', hint:'Big money without losing control.', money:3, rep:1 },
    ]},
  { id:'posnet_down', icon:'💳', title:'Card Reader Down', minLevel:4,
    desc:'You can\'t take card payments and the line is growing.',
    choices:[
      { text:'Call urgent support', hint:'You fix it fast, the members appreciate it.', money:-1, rep:1 },
      { text:'Cash only for today', hint:'🎲 Some pay up, others leave without paying.', gamble:{ p:0.6, win:{ rep:1 }, lose:{ money:-1, members:-1 } } },
    ]},
  { id:'charity_event', icon:'❤️', title:'Charity Event', minLevel:6,
    desc:'You\'re invited to sponsor a neighborhood charity marathon.',
    choices:[
      { text:'Sponsor big', hint:'Your gym comes off as a local hero.', money:-2, rep:3, xp:2 },
      { text:'Donate just enough', hint:'You pitch in without going overboard.', money:-1, rep:1 },
      { text:'Don\'t take part', hint:'Missed opportunity.', },
    ]},
  { id:'influencer_surprise', icon:'🎬', title:'Surprise Influencer', minLevel:8,
    desc:'A TikToker walks in with the camera rolling, no warning. Everything that happens is recorded.',
    choices:[
      { text:'Roll out the red carpet', hint:'🎲 If it goes well, a huge positive viral moment.', gamble:{ p:0.7, win:{ rep:3, members:2, xp:2 }, lose:{ rep:-1 } } },
      { text:'Politely ask them to leave', hint:'⚠️ They post it anyway, a bit annoyed.', rep:-1 },
    ]},
  { id:'pipe_burst', icon:'🚿', title:'Burst Pipe', minLevel:5,
    desc:'A pipe burst and flooded the locker room.',
    choices:[
      { text:'Emergency plumber', hint:'Expensive but you fix it right away.', money:-2, rep:1 },
      { text:'Mop up and stay open', hint:'🎲 It might hold... or be a disaster.', gamble:{ p:0.55, win:{ rep:1 }, lose:{ rep:-2, members:-1 } } },
    ]},
  { id:'outdoor_class', icon:'🌳', title:'Outdoor Class', minLevel:4,
    desc:'There\'s a proposal for a big open class in the park to promote the gym.',
    choices:[
      { text:'Go all out', hint:'A public demonstration. Sign-ups pour in.', money:-1, members:2, rep:2, xp:2 },
      { text:'Skip it this time', hint:'No risk, no reward.', },
    ]},
  { id:'proposal_at_gym', icon:'💍', title:'Marriage Proposal', minLevel:3,
    desc:'A member wants to propose to their partner right in the weight room.',
    choices:[
      { text:'Help set up the surprise', hint:'A big moment that spreads across social media.', rep:2, members:1, xp:1 },
      { text:'Charge a symbolic rental fee', hint:'You earn a bit and it turns out nice anyway.', money:1, rep:1 },
    ]},
];

const DAILY_MISSIONS_POOL = [
  { id: 'earn_money', type: 'money_earned', name: 'Cash Generator', icon: '💰', desc: 'Earn ${target} in income', targets: [500, 1000, 2500, 5000, 10000], rewards: { money: 200, xp: 30 } },
  { id: 'buy_equipment', type: 'equipment_bought', name: 'Equipper', icon: '🛒', desc: 'Buy or upgrade ${target} pieces of equipment', targets: [1, 2, 3, 5], rewards: { money: 300, xp: 40 } },
  { id: 'win_comp', type: 'competitions_won', name: 'Champion of the Day', icon: '🏆', desc: 'Win ${target} competition(s)', targets: [1, 2, 3], rewards: { money: 500, xp: 60 } },
  { id: 'reach_rep', type: 'reputation_gained', name: 'Fame', icon: '⭐', desc: 'Earn ${target} reputation', targets: [10, 25, 50, 100], rewards: { money: 250, xp: 35 } },
  { id: 'run_class', type: 'classes_run', name: 'Instructor of the Day', icon: '🧘', desc: 'Run ${target} class(es)', targets: [1, 2, 3], rewards: { money: 400, xp: 50 } },
  { id: 'launch_campaign', type: 'campaigns_launched', name: 'Marketer', icon: '📢', desc: 'Launch ${target} marketing campaign(s)', targets: [1, 2], rewards: { money: 350, xp: 45 } },
  { id: 'earn_xp', type: 'xp_earned', name: 'Grinder', icon: '✨', desc: 'Earn ${target} XP', targets: [50, 100, 200, 500], rewards: { money: 300, xp: 40 } },
  { id: 'handle_event', type: 'events_handled', name: 'Crisis Manager', icon: '⚡', desc: 'Resolve ${target} random event(s)', targets: [1, 2], rewards: { money: 400, xp: 50 } },
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
    name: 'Equipment',
    icon: '🔧',
    color: 'var(--accent)',
    skills: [
      { id: 'eq_durability', name: 'Durability', icon: '🛡️', desc: '-15% equipment upgrade cost.', cost: 15000, reqLevel: 3, effect: { equipCostMult: 0.85 } },
      { id: 'eq_efficiency', name: 'Efficiency', icon: '⚡', desc: '+25% income from all equipment.', cost: 125000, reqLevel: 7, requires: 'eq_durability', effect: { equipIncomeMult: 1.25 } },
      { id: 'eq_premium', name: 'Premium Line', icon: '💎', desc: '+50% equipment capacity.', cost: 750000, reqLevel: 12, requires: 'eq_efficiency', effect: { equipCapacityMult: 1.5 } },
      { id: 'eq_mastery', name: 'Total Mastery', icon: '👑', desc: '+100% equipment income and -25% costs.', cost: 5000000, reqLevel: 17, requires: 'eq_premium', effect: { equipIncomeMult: 2.0, equipCostMult: 0.75 } },
      { id: 'eq_reinforced', name: 'Industrial Reinforcement', icon: '🔰', desc: '-50% equipment breakdowns and +50% equipment income.', cost: 40000000, reqLevel: 22, requires: 'eq_mastery', effect: { breakdownChanceMult: 0.5, equipIncomeMult: 1.5 } },
    ]
  },
  marketing: {
    name: 'Marketing',
    icon: '📢',
    color: 'var(--cyan)',
    skills: [
      { id: 'mk_reach', name: 'Greater Reach', icon: '📡', desc: '+30% members from campaigns.', cost: 25000, reqLevel: 4, effect: { campaignMembersMult: 1.3 } },
      { id: 'mk_viral', name: 'Going Viral', icon: '🔥', desc: 'Campaigns last 50% longer.', cost: 150000, reqLevel: 8, requires: 'mk_reach', effect: { campaignDurationMult: 1.5 } },
      { id: 'mk_brand', name: 'Strong Brand', icon: '🏷️', desc: '+50% reputation and +30% members from campaigns.', cost: 1000000, reqLevel: 13, requires: 'mk_viral', effect: { campaignRepMult: 1.5, campaignMembersMult: 1.3 } },
      { id: 'mk_empire', name: 'Media Empire', icon: '📺', desc: '-40% campaign cost, +100% members.', cost: 7500000, reqLevel: 18, requires: 'mk_brand', effect: { campaignCostMult: 0.6, campaignMembersMult: 2.0 } },
      { id: 'mk_monopoly', name: 'Monopoly', icon: '🦈', desc: 'Rivals steal 50% fewer members.', cost: 50000000, reqLevel: 23, requires: 'mk_empire', effect: { rivalStealMult: 0.5 } },
    ]
  },
  staff: {
    name: 'Staff',
    icon: '👥',
    color: 'var(--purple)',
    skills: [
      { id: 'st_training', name: 'Training', icon: '📚', desc: '+30% effect from all staff.', cost: 20000, reqLevel: 4, effect: { staffEffectMult: 1.3 } },
      { id: 'st_motivation', name: 'Motivation', icon: '💪', desc: 'Staff generate +50% reputation and perform +15%.', cost: 200000, reqLevel: 9, requires: 'st_training', effect: { staffRepMult: 1.5, staffEffectMult: 1.15 } },
      { id: 'st_synergy', name: 'Synergy', icon: '🤝', desc: 'Each hired staff gives +5% extra income.', cost: 1250000, reqLevel: 14, requires: 'st_motivation', effect: { staffSynergyBonus: 0.05 } },
      { id: 'st_legends', name: 'Legendary Staff', icon: '🌟', desc: '-30% staff cost, 2x auto-members.', cost: 10000000, reqLevel: 19, requires: 'st_synergy', effect: { staffCostMult: 0.7, autoMembersMult: 2.0 } },
      { id: 'st_resilience', name: 'Resilience', icon: '💊', desc: '-50% illness, training 30% faster.', cost: 60000000, reqLevel: 24, requires: 'st_legends', effect: { sickChanceMult: 0.5, trainingSpeedMult: 0.7 } },
    ]
  },
  members: {
    name: 'Members',
    icon: '🏃',
    color: 'var(--green)',
    skills: [
      { id: 'mb_welcome', name: 'Welcome', icon: '🤗', desc: '+20% members attracted by equipment.', cost: 12500, reqLevel: 3, effect: { memberAttractionMult: 1.2 } },
      { id: 'mb_retention', name: 'Retention', icon: '🔒', desc: '+40% maximum capacity.', cost: 175000, reqLevel: 8, requires: 'mb_welcome', effect: { capacityMult: 1.4 } },
      { id: 'mb_premium_tier', name: 'Premium Membership', icon: '💳', desc: 'Each member generates +100% income.', cost: 900000, reqLevel: 13, requires: 'mb_retention', effect: { memberIncomeMult: 2.0 } },
      { id: 'mb_loyalty', name: 'Total Loyalty', icon: '❤️', desc: '+200% rep/member, +50% capacity and +50% income per member.', cost: 6000000, reqLevel: 18, requires: 'mb_premium_tier', effect: { memberRepMult: 3.0, capacityMult: 1.5, memberIncomeMult: 1.5 } },
      { id: 'mb_community', name: 'Community', icon: '🏘️', desc: 'Classes 2x income, VIPs +50%, +25% income per member.', cost: 15000000, reqLevel: 23, requires: 'mb_loyalty', effect: { classIncomeMult: 2.0, vipRewardMult: 1.5, memberIncomeMult: 1.25 } },
    ]
  },
  infrastructure: {
    name: 'Infrastructure',
    icon: '🏗️',
    color: '#f59e0b',
    skills: [
      { id: 'inf_planning', name: 'Planning', icon: '📐', desc: 'Zone construction 25% faster.', cost: 30000, reqLevel: 5, effect: { zoneBuildSpeedMult: 0.75 } },
      { id: 'inf_contractors', name: 'Contractors', icon: '👷', desc: 'Equipment upgrades 30% faster.', cost: 250000, reqLevel: 10, requires: 'inf_planning', effect: { equipUpgradeSpeedMult: 0.7 } },
      { id: 'inf_logistics', name: 'Logistics', icon: '📦', desc: '+1 simultaneous equipment upgrade.', cost: 1750000, reqLevel: 15, requires: 'inf_contractors', effect: { extraConcurrentUpgrades: 1 } },
      { id: 'inf_engineering', name: 'Engineering', icon: '⚙️', desc: 'Construction 50% faster, -20% zone cost.', cost: 15000000, reqLevel: 20, requires: 'inf_logistics', effect: { zoneBuildSpeedMult: 0.5, zoneCostMult: 0.8 } },
      { id: 'inf_megaproject', name: 'Megaprojects', icon: '🏛️', desc: 'Repairs and upgrades 40-50% faster, +1 simultaneous build.', cost: 75000000, reqLevel: 25, requires: 'inf_engineering', effect: { repairSpeedMult: 0.5, equipUpgradeSpeedMult: 0.6, extraConcurrentUpgrades: 1 } },
    ]
  },
  competitions: {
    name: 'Competitions',
    icon: '🏆',
    color: '#ef4444',
    skills: [
      { id: 'comp_prep', name: 'Preparation', icon: '🎯', desc: '+15% chance to win competitions.', cost: 25000, reqLevel: 5, effect: { compWinChanceBonus: 0.15 } },
      { id: 'comp_strategy', name: 'Strategy', icon: '🧠', desc: '-25% competition cooldown.', cost: 225000, reqLevel: 10, requires: 'comp_prep', effect: { compCooldownMult: 0.75 } },
      { id: 'comp_prize', name: 'Bigger Prizes', icon: '💰', desc: '+50% competition prizes.', cost: 1500000, reqLevel: 15, requires: 'comp_strategy', effect: { compRewardMult: 1.5 } },
      { id: 'comp_reputation', name: 'Prestige', icon: '🎖️', desc: '+100% rep and +50% competition prizes.', cost: 12500000, reqLevel: 20, requires: 'comp_prize', effect: { compRepMult: 2.0, compRewardMult: 1.5 } },
      { id: 'comp_dynasty', name: 'Dynasty', icon: '🏰', desc: '-40% extra cooldown, competitions give double XP.', cost: 60000000, reqLevel: 25, requires: 'comp_reputation', effect: { compCooldownMult: 0.6, compXpMult: 2.0 } },
    ]
  }
};

// ===== GYM ZONES / EXPANSION =====
const GYM_ZONES = [
  { id: 'ground_floor', name: 'Ground Floor', icon: '🏠', desc: 'The heart of the gym. Your base of operations.', cost: 0, capacityBonus: 10, incomeBonus: 0, reqLevel: 1, unlocked: true, buildTime: 0 },
  { id: 'first_floor', name: 'First Floor', icon: '🏢', desc: 'More space, more machines, more members.', cost: 50000, capacityBonus: 30, incomeBonus: 10, reqLevel: 6, buildTime: 180 },
  { id: 'basement', name: 'Basement', icon: '🔨', desc: 'Hardcore zone. Heavy weights, chalk, grunts.', cost: 300000, capacityBonus: 25, incomeBonus: 20, reqLevel: 10, buildTime: 600 },
  { id: 'rooftop', name: 'Rooftop', icon: '☀️', desc: 'Outdoor training with a view.', cost: 1000000, capacityBonus: 20, incomeBonus: 30, reqLevel: 13, buildTime: 1800 },
  { id: 'annex', name: 'Annex Building', icon: '🏗️', desc: 'A whole building next door. Doubles your gym.', cost: 5000000, capacityBonus: 60, incomeBonus: 50, reqLevel: 16, buildTime: 3600 },
  { id: 'arena', name: 'Competition Arena', icon: '🏟️', desc: 'Your own arena for competitions and events. Massive +rep.', cost: 15000000, capacityBonus: 40, incomeBonus: 80, reqLevel: 19, buildTime: 7200 },
];

// ===== NEIGHBORHOODS (City Map) =====
const NEIGHBORHOODS = [
  { id: 'palermo',    name: 'Venice Beach',  icon: '🌳', desc: 'Trendy beachfront with huge fitness demand',          unlockCost: 0,       reqLevel: 1,  rentMult: 1.0, memberMult: 1.0, vipChanceMult: 1.0, maxMembersCap: 2500 },
  { id: 'la_boca',    name: 'East LA',       icon: '⚽', desc: 'Working-class area: everything costs less but earns less', unlockCost: 500000,  reqLevel: 3,  rentMult: 0.6, memberMult: 1.3, vipChanceMult: 0.5, maxMembersCap: 700 },
  { id: 'caballito',  name: 'Koreatown',     icon: '🏙️', desc: 'Dense central district, affordable rent',          unlockCost: 800000,  reqLevel: 5,  rentMult: 0.8, memberMult: 1.1, vipChanceMult: 0.8, maxMembersCap: 550 },
  { id: 'belgrano',   name: 'Pasadena',      icon: '🏘️', desc: 'Family suburb, steady growth',             unlockCost: 1500000, reqLevel: 8,  rentMult: 1.3, memberMult: 1.2, vipChanceMult: 1.0, maxMembersCap: 600 },
  { id: 'recoleta',   name: 'Beverly Hills', icon: '🏛️', desc: 'Premium area, frequent VIP members',        unlockCost: 3000000, reqLevel: 12, rentMult: 1.8, memberMult: 0.8, vipChanceMult: 2.0, maxMembersCap: 400 },
  { id: 'san_telmo',  name: 'Silver Lake',   icon: '🎭', desc: 'Bohemian district, reputation builds fast',     unlockCost: 5000000, reqLevel: 15, rentMult: 1.5, memberMult: 0.9, vipChanceMult: 1.5, maxMembersCap: 450 },
];

// ===== VIP MEMBERS =====
const VIP_MEMBERS = [
  { id: 'bodybuilder', name: 'Pro Bodybuilder', icon: '💪', request: 'I need a Squat Rack and a Leg Press', requires: ['squat_rack', 'leg_press'], reward: { money: 1500, rep: 30, xp: 80 }, stayDuration: 600 },
  { id: 'yoga_guru', name: 'Yoga Guru', icon: '🧘', request: 'I want a quiet space to teach classes', requires: ['yoga_class'], reward: { money: 1000, rep: 40, xp: 60 }, stayDuration: 500 },
  { id: 'boxer', name: 'Amateur Boxer', icon: '🥊', request: 'I need a Boxing Ring to train', requires: ['boxing'], reward: { money: 2500, rep: 50, xp: 100 }, stayDuration: 700 },
  { id: 'swimmer', name: 'Olympic Swimmer', icon: '🏊‍♀️', request: 'I only train at gyms with a pool', requires: ['pool'], reward: { money: 4000, rep: 80, xp: 150 }, stayDuration: 800 },
  { id: 'crossfitter', name: 'Hardcore Crossfitter', icon: '🤸', request: 'Give me WODs or give me death', requires: ['crossfit'], reward: { money: 3000, rep: 60, xp: 120 }, stayDuration: 600 },
  { id: 'ceo', name: 'Fitness CEO', icon: '👔', request: 'I want a Spa and Sauna. I need to relax.', requires: ['spa', 'sauna'], reward: { money: 7500, rep: 100, xp: 200 }, stayDuration: 900 },
  { id: 'influencer_vip', name: 'Influencer (1M followers)', icon: '📱', request: 'Your gym has to be Instagrammable', requires: ['first_floor'], reward: { money: 5000, rep: 150, xp: 180 }, stayDuration: 700 },
  { id: 'retired_athlete', name: 'Retired Athlete', icon: '🏅', request: 'I need a complete gym and quality staff', requires: ['trainer', 'physio'], reward: { money: 6000, rep: 120, xp: 250 }, stayDuration: 1000 },
  { id: 'family', name: 'Fitness Family', icon: '👨‍👩‍👧‍👦', request: 'We want a pool and classes for everyone', requires: ['pool', 'spinning_class'], reward: { money: 3500, rep: 70, xp: 130 }, stayDuration: 800 },
  { id: 'strongman', name: 'Strongman', icon: '🦍', request: 'I only train in basements with real weights', requires: ['basement'], reward: { money: 10000, rep: 200, xp: 300 }, stayDuration: 1200 },
  { id: 'politician', name: 'Local Politician', icon: '🏛️', request: 'I need privacy. Do you have a Spa?', requires: ['spa'], reward: { money: 12500, rep: 250, xp: 350 }, stayDuration: 800 },
  { id: 'doctor', name: 'Sports Doctor', icon: '🩺', request: 'I\'m interested in a gym with a Physical Therapist and Sauna', requires: ['physio', 'sauna'], reward: { money: 9000, rep: 180, xp: 280 }, stayDuration: 900 },
  { id: 'model', name: 'International Model', icon: '👗', request: 'Pilates and Yoga are my life. Got them?', requires: ['pilates_class', 'yoga_class'], reward: { money: 6000, rep: 300, xp: 200 }, stayDuration: 700 },
  { id: 'footballer', name: 'Pro Football Player', icon: '⚽', request: 'I need CrossFit and a Ring to cross-train', requires: ['crossfit', 'boxing'], reward: { money: 15000, rep: 350, xp: 400 }, stayDuration: 1000 },
  { id: 'grandma', name: 'Fitness Grandma', icon: '👵', request: 'At 75 I want to start. Got a Treadmill and Zumba classes?', requires: ['treadmill', 'zumba_class'], reward: { money: 2500, rep: 500, xp: 150 }, stayDuration: 600 },
  { id: 'esports', name: 'Pro Gamer', icon: '🎮', request: 'I need to get off the chair. HIIT and Spinning.', requires: ['hiit_class', 'spinning_class'], reward: { money: 4000, rep: 100, xp: 250 }, stayDuration: 500 },
];

const TUTORIAL_STEPS = [
  // Intro - observe
  { target: '.gym-scene-container', title: 'Welcome to Your Gym!', text: 'This is your gym. Here you see its name, tier and installed equipment. Right now it\'s empty... let\'s change that!', tab: 'gym' },
  { target: '.stats-grid', title: 'Your Stats', text: 'These numbers are key: income per second (your earnings), active members, maximum capacity and reputation. The goal is to grow everything.' },
  { target: '.stats-bar', title: 'Resource Bar', text: 'Up top you always see your cash 💰, members 👥, reputation ⭐, income 💵 and level.' },

  // Action: go to equipment
  { target: '[data-tab="equipment"]', title: 'Buy Your First Machine!', text: 'The first thing you need is equipment. Click the Equipment tab.', action: true },
  // Action: buy dumbbells
  { target: '.equipment-grid', title: 'Buy Dumbbells', text: 'Click BUY on the Dumbbells. They\'re cheap and generate income from the very first second.', tab: 'equipment', action: true, actionCheck: function() { return game.equipment.dumbbells && game.equipment.dumbbells.level >= 1; } },

  // Explain income
  { target: '#incomeBig', title: 'Ready to Make Money!', text: 'Great! Once the tutorial ends, your gym will generate automatic income every second. The more equipment and members, the more you earn.', tab: 'gym' },

  // Action: go to staff
  { target: '[data-tab="staff"]', title: 'Hire Staff', text: 'Your gym needs employees. Click the Staff tab.', action: true },
  { target: '#tab-staff', title: 'Your Work Team', text: 'A Trainer raises your income 50%, a Receptionist attracts members on her own. Each employee has a unique effect. Hire them once you save up some cash.', tab: 'staff' },

  // Action: go to marketing
  { target: '[data-tab="marketing"]', title: 'Advertise', text: 'Campaigns attract members fast. Click Marketing.', action: true },
  { target: '#tab-marketing', title: 'Marketing Campaigns', text: 'Campaigns attract members and raise your reputation. Start with Flyers when you can.', tab: 'marketing' },

  // Action: go to missions
  { target: '[data-tab="missions"]', title: 'Daily Missions', text: 'You have daily objectives with rewards. Click Missions.', action: true },
  { target: '#tab-missions', title: 'Your Missions', text: 'Each day you get 3 missions. Completing all 3 gives an extra bonus. Check them every day!', tab: 'missions' },

  // Daily bonus
  { target: '.daily-bonus-banner', title: 'Daily Bonus', text: 'Important! Log in every day to claim your bonus. 7 days in a row = mega prize.', tab: 'gym' },

  // Action: go to competitions
  { target: '[data-tab="champion"]', title: 'Competitions', text: 'Compete for prizes and reputation. Click Competitions.', action: true },
  { target: '#tab-champion', title: 'Tournaments and Champion', text: 'Start with the Local Tournament (80% to win). Later on, recruit a champion to earn double.', tab: 'champion' },

  // Final tips
  { target: '.gym-scene-container', title: 'Let\'s Play!', text: 'The game keeps running even if you close the browser (up to 8 hours). Log in every day, do missions, run classes and compete. Build your Iron Empire!', tab: 'gym' },
];

// ===== OPERATING COSTS =====
const OPERATING_COSTS = {
  baseRent: 8000,              // legacy — rent is now a continuous ramp (see getOperatingCostsPerDay), no flat base
  rentPerLevel: 2000,          // rent added per player level above 5 (continuous, no cliff at L6)
  rentPerExtraZone: 12000,     // additional rent per zone beyond ground floor
  rentZoneMultPerLevel: 800,   // extra zone rent scales: zone_rent + (playerLevel * this)
  utilitiesPerEquipLevel: 60,  // utilities cost per total equipment level per game day
  overheadRate: 0.18,          // "services and taxes": % of gross income/s — keeps expenses relevant at every scale (reducible with the Manager)
  propertyPrice: 8000000,      // one-time purchase to eliminate rent
  propertyReqLevel: 18,
};

// ===== SUPPLEMENTS =====
const SUPPLEMENTS = [
  { id: 'protein', name: 'Protein Powder', icon: '🥤', desc: 'The classic post-workout shake. A general income boost.', cost: 300, duration: 180, effects: { incomeMult: 1.2 }, reqLevel: 2, combo: 'creatine' },
  { id: 'creatine', name: 'Creatine', icon: '💊', desc: 'More strength and endurance. More capacity and an income kick.', cost: 600, duration: 180, effects: { capacityBonus: 10, incomeMult: 1.08 }, reqLevel: 4, combo: 'protein' },
  { id: 'preworkout', name: 'Pre-Workout', icon: '⚡', desc: 'Explosive energy before training. Classes perform much better.', cost: 1000, duration: 240, effects: { classIncomeMult: 1.3 }, reqLevel: 6 },
  { id: 'bcaa', name: 'BCAA', icon: '🧪', desc: 'Amino acids that speed up recovery. More income and some reputation.', cost: 2000, duration: 240, effects: { incomeMult: 1.15, repPerMin: 5 }, reqLevel: 8 },
  { id: 'omega3', name: 'Omega 3', icon: '🐟', desc: 'Essential fatty acids. Reduces inflammation and improves the overall vibe.', cost: 3000, duration: 270, effects: { incomeMult: 1.15, repPerMin: 6 }, reqLevel: 9 },
  { id: 'fatburner', name: 'Fat Burner', icon: '🔥', desc: 'A potent thermogenic. Stronger marketing and an income bonus.', cost: 4000, duration: 300, effects: { marketingMult: 1.3, incomeMult: 1.1 }, reqLevel: 10 },
  { id: 'vitamina_d', name: 'Vitamin D3', icon: '☀️', desc: 'The sunshine vitamin. Equipment performs better and the gym has more room.', cost: 6000, duration: 300, effects: { equipIncomeMult: 1.25, capacityBonus: 15 }, reqLevel: 12 },
  { id: 'glutamine', name: 'Glutamine', icon: '💚', desc: 'Accelerated muscle recovery. More capacity and elite income.', cost: 8000, duration: 300, effects: { capacityBonus: 20, incomeMult: 1.12 }, reqLevel: 13 },
  { id: 'zma', name: 'ZMA', icon: '🌙', desc: 'Zinc, Magnesium and B6. Classes and reputation go to another level.', cost: 12000, duration: 360, effects: { classIncomeMult: 1.35, repPerMin: 8 }, reqLevel: 15 },
  { id: 'massgainer', name: 'Mass Gainer', icon: '🏋️', desc: 'Massive calories and protein. The equipment works at its peak.', cost: 15000, duration: 300, effects: { equipIncomeMult: 1.4 }, reqLevel: 16 },
  { id: 'collagen', name: 'Marine Collagen', icon: '🦴', desc: 'Top-notch skin, joints and tissue. The gym looks flawless and campaigns hit harder.', cost: 22000, duration: 420, effects: { incomeMult: 1.3, marketingMult: 1.2 }, reqLevel: 18 },
  { id: 'multivitamin', name: 'Premium Multivitamin', icon: '🌟', desc: 'The ultimate supplement. Constantly improves income and reputation.', cost: 30000, duration: 360, effects: { incomeMult: 1.25, repPerMin: 5 }, reqLevel: 20 },
];

// ===== FAME / PRESTIGE SHOP =====
// Reputation is SPENT here (it used to be a dead number that only gated competitions).
// Prices scale with the player's REAL rep generation (getReputationPerSecond),
// so they stay relevant at every level — same principle as overhead/events/classes.
//   - boosts: temporary, an active-play treat. cost = repRate × costSeconds.
//   - perks: permanent and leveled, the long-term sink. cost(L) = repRate × baseSeconds × growth^L.
//   - unlocks: one-shot milestones, qualitative leaps (the aspirational goals).
const FAME_SHOP = {
  boosts: [
    { id: 'boost_press',      name: 'Sports Press',     icon: '📰', desc: 'You\'re everywhere: x2 gym income.', duration: 1800, costSeconds: 2400, effect: { incomeMult: 2 } },
    { id: 'boost_viral',      name: 'Viral on Social',  icon: '📱', desc: 'Everyone\'s talking about you: x2 reputation generation.', duration: 1200, costSeconds: 600,  effect: { repMult: 2 } },
    { id: 'boost_masterclass',name: 'Masterclass',      icon: '🧘', desc: 'A star runs a one-of-a-kind class: x2 class income.', duration: 1800, costSeconds: 1000, effect: { classMult: 2 } },
    { id: 'boost_openday',    name: 'Open House',       icon: '🚪', desc: 'Doors open to the neighborhood: +50% member attraction.', duration: 1200, costSeconds: 900,  effect: { memberAttractMult: 1.5 } },
  ],
  perks: [
    { id: 'perk_brand',     name: 'Recognized Brand',   icon: '™️', desc: '+6% permanent income per level.',           maxLevel: 5, baseSeconds: 1800, growth: 1.8, effect: { key: 'income',    perLevel: 0.06 } },
    { id: 'perk_suppliers', name: 'Premium Suppliers',  icon: '🤝', desc: '-4% on all costs per level.',           maxLevel: 5, baseSeconds: 1500, growth: 1.8, effect: { key: 'cost',      perLevel: 0.04 } },
    { id: 'perk_loyalty',   name: 'Brand Loyalty',      icon: '❤️', desc: 'Your members are loyal: -12% rival steal per level.', maxLevel: 3, baseSeconds: 1500, growth: 1.9, effect: { key: 'retention', perLevel: 0.12 } },
    { id: 'perk_capacity',  name: 'Trendy Gym',         icon: '🔥', desc: 'Everyone wants in: +5% member capacity per level.', maxLevel: 5, baseSeconds: 1500, growth: 1.8, effect: { key: 'capacity',  perLevel: 0.05 } },
    { id: 'perk_magnet',    name: 'Celebrity Magnet',   icon: '😎', desc: 'VIPs show up 15% more often per level.',  maxLevel: 3, baseSeconds: 1200, growth: 1.8, effect: { key: 'vipspeed',  perLevel: 0.15 } },
  ],
  unlocks: [
    { id: 'unlock_sponsor',  name: 'National Sponsorship', icon: '🏅', desc: 'A major brand backs you: +15% permanent income.',                          costSeconds: 7200,  reqLifetime: 50000 },
    { id: 'unlock_vipsalon', name: 'Exclusive VIP Lounge', icon: '🥂', desc: 'Luxury service: VIP members pay out +50% (cash, rep and XP).',         costSeconds: 9000,  reqLifetime: 150000 },
    { id: 'unlock_legacy',   name: 'Fitness Legend',       icon: '👑', desc: 'Your fame is eternal: +10% income and the passive floor rises from +15% to +30%.',     costSeconds: 18000, reqLifetime: 500000 },
  ]
};

// ===== RIVAL GYMS =====
const RIVAL_GYMS = [
  { id: 'barrio', name: 'Neighborhood Garage Gym', icon: '🏚️', desc: 'The neighbor set up a gym in his garage. Basic but cheap, it steals your beginners.', memberSteal: 2, promoCost: 500, promoDuration: 900, defeatCost: 5000, defeatBonus: { income: 8, capacity: 5 }, reqLevel: 3 },
  { id: 'fitzone', name: 'FitZone Express', icon: '🏃', desc: 'A low-cost chain with new machines. Attracts the bargain hunters.', memberSteal: 4, promoCost: 1500, promoDuration: 900, defeatCost: 15000, defeatBonus: { income: 12, capacity: 15 }, reqLevel: 5 },
  { id: 'powerhouse', name: 'PowerHouse Gym', icon: '💪', desc: 'A hardcore gym for serious lifters. Direct competition.', memberSteal: 7, promoCost: 4000, promoDuration: 900, defeatCost: 40000, defeatBonus: { income: 20, capacity: 10 }, reqLevel: 8 },
  { id: 'crossfit_box', name: 'Downtown CrossFit Box', icon: '🤸', desc: 'The CrossFit craze. A fanatic community that drags members away.', memberSteal: 12, promoCost: 10000, promoDuration: 900, defeatCost: 100000, defeatBonus: { income: 35, capacity: 25 }, reqLevel: 11 },
  { id: 'megafit', name: 'MegaFit Premium', icon: '💎', desc: 'A premium gym with spa, pool and everything. Hard to compete with.', memberSteal: 18, promoCost: 25000, promoDuration: 900, defeatCost: 250000, defeatBonus: { income: 75, capacity: 15 }, reqLevel: 15 },
  { id: 'empire', name: 'Empire Fitness', icon: '🏛️', desc: 'Your biggest rival. A huge chain with unlimited resources. The final boss.', memberSteal: 30, promoCost: 60000, promoDuration: 900, defeatCost: 600000, defeatBonus: { income: 150, capacity: 30 }, reqLevel: 18 },
];

// ===== CHAMPION SYSTEM =====
const CHAMPION_STATS = ['fuerza', 'resistencia', 'velocidad', 'tecnica', 'stamina', 'mentalidad'];
const CHAMPION_STAT_ICONS = {
  fuerza: '💪', resistencia: '🫀', velocidad: '⚡', tecnica: '🎯', stamina: '🔋', mentalidad: '🧠'
};
const CHAMPION_STAT_NAMES = {
  fuerza: 'Strength', resistencia: 'Endurance', velocidad: 'Speed',
  tecnica: 'Technique', stamina: 'Stamina', mentalidad: 'Mindset'
};
const CHAMPION_STAT_DESC = {
  fuerza: 'Brute strength. Increases victory prizes.',
  resistencia: 'Physical stamina. Reduces fatigue when competing.',
  velocidad: 'Reflexes and explosiveness. Improves your chance to win.',
  tecnica: 'Fighting technique. Multiplies prizes and reputation earned.',
  stamina: 'Aerobic endurance. Speeds up fatigue recovery.',
  mentalidad: 'Mental toughness. Extra boost in tough competitions.',
};

const CHAMPION_EQUIPMENT = [
  { id: 'gloves', name: 'Boxing Gloves', icon: '🥊', slot: 'hands', stats: { fuerza: 3 }, cost: 5000, reqChampLevel: 1 },
  { id: 'headband', name: 'Pro Headband', icon: '🎽', slot: 'head', stats: { velocidad: 2, mentalidad: 1 }, cost: 8000, reqChampLevel: 2 },
  { id: 'shoes', name: 'Competition Shoes', icon: '👟', slot: 'feet', stats: { velocidad: 3, stamina: 1 }, cost: 12000, reqChampLevel: 3 },
  { id: 'belt', name: 'Strength Belt', icon: '🥋', slot: 'waist', stats: { fuerza: 4, resistencia: 2 }, cost: 20000, reqChampLevel: 4 },
  { id: 'gloves_pro', name: 'Professional Gloves', icon: '🧤', slot: 'hands', stats: { fuerza: 6, tecnica: 2 }, cost: 40000, reqChampLevel: 6 },
  { id: 'shoes_elite', name: 'Elite Shoes', icon: '👠', slot: 'feet', stats: { velocidad: 6, stamina: 3 }, cost: 60000, reqChampLevel: 8 },
  { id: 'belt_titan', name: 'Titan Belt', icon: '⚔️', slot: 'waist', stats: { fuerza: 8, resistencia: 4 }, cost: 100000, reqChampLevel: 10 },
  { id: 'crown', name: 'Champion\'s Crown', icon: '👑', slot: 'head', stats: { fuerza: 5, resistencia: 5, velocidad: 5, tecnica: 5, mentalidad: 5 }, cost: 250000, reqChampLevel: 15 },
];

const CHAMPION_RECRUIT_COST = 50000;
const CHAMPION_UNLOCK_LEVEL = 8;
const CHAMPION_MAX_FATIGUE = 100;
const CHAMPION_FATIGUE_PER_TRAIN = 25;   // 4 sessions before exhausted
const CHAMPION_FATIGUE_PER_COMPETE = 35; // competing is more demanding
const CHAMPION_FATIGUE_THRESHOLD = 75;   // 75+ = exhausted, can't train or compete
const CHAMPION_XP_PER_LEVEL = 100;
const CHAMPION_REWARD_MULT = 2.0;

// ===== GRAND TOURNAMENTS (High-risk circuit, "heist" style) =====
// Rare events for the champion: prepare (Readiness%) → compete → cooldown of DAYS → injury risk.
// The harsh punishment is losing the entry fee + the prep + the long cooldown; an injury leaves you to "recover"
// for a few hours (you can't compete or train). Well prepared, you rarely come out hurt — but you never "die".
const GRAND_FATIGUE_PER_ATTEMPT = 55;     // a Grand demands more than a normal competition
const GRAND_READINESS_WIN_WEIGHT = 0.35;  // 100% Readiness adds +35% to the chance to win

const GRAND_TOURNAMENTS = [
  {
    id: 'copa_elite', name: 'Elite Continental Cup', icon: '🌎',
    desc: 'The best from every country on the continent. A big score, once a day.',
    cooldown: 86400,            // 24 h
    entryFee: 250000,           // entry fee (paid when you compete)
    minRep: 1500,
    minStat: { resistencia: 12 },
    champLevelReq: 6,
    baseWinChance: 0.30,        // at 0% Readiness (stats and prep raise it)
    concentracionSecs: 1800,    // 30 min training camp
    injury: { baseChance: 0.25, minChance: 0.06, maxHours: 4 },
    reward: { money: 1200000, rep: 800, xp: 2500 },
    floorSecs: 600,             // prize floor = 10 min of income (scales with the economy)
    title: 'King of the Continent',
  },
  {
    id: 'mundial_leyendas', name: 'Legends World Cup', icon: '🌍',
    desc: 'The absolute pinnacle. Prepare or you don\'t come home in one piece.',
    cooldown: 259200,           // 3 days
    entryFee: 1500000,
    minRep: 5000,
    minStat: { resistencia: 25 },
    champLevelReq: 12,
    baseWinChance: 0.22,
    concentracionSecs: 3600,    // 1 h training camp
    injury: { baseChance: 0.40, minChance: 0.10, maxHours: 12 },
    reward: { money: 6000000, rep: 3000, xp: 9000 },
    floorSecs: 1800,            // floor = 30 min of income
    title: 'World Legend',
  },
];

// Prep items: bought BEFORE (heist style, "have your gear ready"). They raise Readiness%
// and/or lower the injury risk. Consumed when you compete (win or lose). Cost = entryFee × costMult.
const GRAND_PREP_ITEMS = [
  { id: 'pasajes',      name: 'Flights and Visa',  icon: '✈️', desc: 'Travel logistics. Without it you can\'t enter.',          costMult: 0.20, readiness: 20, required: true },
  { id: 'concentracion',name: 'Training Camp',     icon: '🏕️', desc: 'A dedicated training camp. The champion is tied up.',     costMult: 0.15, readiness: 40, timed: true },
  { id: 'nutricion',    name: 'Nutrition Plan',    icon: '🥗', desc: 'Elite nutritionist: weight and energy dialed in.',      costMult: 0.10, readiness: 20 },
  { id: 'medico',       name: 'Medical Kit',       icon: '🩺', desc: 'Medical team + insurance: reduces injury chance and severity.', costMult: 0.18, readiness: 20, halvesInjury: true },
];

// ===== OPPORTUNITIES / RISKY VENTURES (same loop as Grand Tournaments, but at the GYM level) =====
// They don't depend on the champion: the business is what's at risk. If it goes wrong, the "damage" is a temporary SETBACK
// (bad press / raid / scandal) that lowers your income for a few hours — you have to recover. Same
// philosophy: well prepared, it rarely goes wrong; the real punishment is the long cooldown + losing the entry fee.
const OPP_READINESS_WIN_WEIGHT = 0.35;  // 100% Readiness adds +35% to the chance of success

const OPP_PREP_ITEMS = [
  { id: 'permisos',     name: 'Paperwork and Permits', icon: '📋', desc: 'Permits in order. Without it you can\'t enter.',                costMult: 0.20, readiness: 20, required: true },
  { id: 'duediligence', name: 'Due Diligence',         icon: '🔍', desc: 'Up-front research with a timer. Cuts the risk a lot.',         costMult: 0.15, readiness: 40, timed: true },
  { id: 'contactos',    name: 'Connections',           icon: '🤝', desc: 'Leverage and connections that tip the scales in your favor.',     costMult: 0.10, readiness: 20 },
  { id: 'seguro',       name: 'Insurance',             icon: '🛡️', desc: 'Coverage against setbacks: reduces the setback\'s chance and severity.', costMult: 0.18, readiness: 20, halvesBackfire: true },
];

const OPPORTUNITIES = [
  {
    id: 'torneo_clandestino', name: 'Underground Tournament', icon: '🥊',
    desc: 'High stakes in a no-rules tournament. Quick cash… if the cops don\'t show up.',
    reqLevel: 10, reqRepLifetime: 500,
    cooldown: 43200, entryFee: 100000,         // 12 h
    baseSuccessChance: 0.42, dueDiligenceSecs: 1200,
    reward: { money: 500000, rep: 250, membersPct: 0 }, floorSecs: 400,
    backfire: { name: 'Police Raid', icon: '🚔', baseChance: 0.30, minChance: 0.08, maxHours: 3, incomePenalty: 0.30 },
  },
  {
    id: 'patrocinio', name: 'Million-Dollar Sponsorship', icon: '💼',
    desc: 'A brand wants to partner with your gym. If it works out, cash and members rain down. If it goes wrong, a scandal.',
    reqLevel: 16, reqRepLifetime: 3000,
    cooldown: 172800, entryFee: 600000,        // 2 days
    baseSuccessChance: 0.38, dueDiligenceSecs: 1800,
    reward: { money: 4000000, rep: 1200, membersPct: 0.10 }, floorSecs: 1200,
    backfire: { name: 'Brand Scandal', icon: '📉', baseChance: 0.38, minChance: 0.10, maxHours: 8, incomePenalty: 0.30 },
  },
  {
    id: 'inmobiliaria', name: 'Real Estate Investment', icon: '🏗️',
    desc: 'You buy a pre-construction complex to flip it. The biggest play on the board.',
    reqLevel: 22, reqRepLifetime: 8000,
    cooldown: 259200, entryFee: 2000000,       // 3 days
    baseSuccessChance: 0.35, dueDiligenceSecs: 2400,
    reward: { money: 12000000, rep: 2000, membersPct: 0.15 }, floorSecs: 1800,
    backfire: { name: 'Financial Crisis', icon: '💸', baseChance: 0.42, minChance: 0.12, maxHours: 12, incomePenalty: 0.35 },
  },
];

// ===== PLAYER TITLES =====
const PLAYER_TITLES = [
  { id: 'principiante', name: 'Beginner', icon: '🏋️', desc: 'Just getting started', check: () => true },
  { id: 'entrenador', name: 'Trainer', icon: '💪', desc: 'Level 10', check: () => game.level >= 10 },
  { id: 'empresario', name: 'Entrepreneur', icon: '🏢', desc: 'Earn $500K total', check: () => game.totalMoneyEarned >= 500000 },
  { id: 'magnate', name: 'Mogul', icon: '👑', desc: 'Earn $5M total', check: () => game.totalMoneyEarned >= 5000000 },
  { id: 'franquiciado', name: 'Franchisee', icon: '🏙️', desc: 'Have 2 gyms in your empire', check: () => getTotalGymCount() >= 2 },
  { id: 'franquicia_estrella', name: 'Mogul', icon: '👑', desc: 'Have 4 gyms in your empire', check: () => getTotalGymCount() >= 4 },
  { id: 'campeon_invicto', name: 'Undefeated Champion', icon: '🏆', desc: '20 champion wins', check: () => game.stats.championWins >= 20 },
  { id: 'rey_sudamerica', name: 'King of the Continent', icon: '🌎', desc: 'Win the Elite Continental Cup', check: () => game.grandTournaments && (game.grandTournaments.copa_elite?.wins || 0) >= 1 },
  { id: 'leyenda_mundial', name: 'World Legend', icon: '🌍', desc: 'Win the Legends World Cup', check: () => game.grandTournaments && (game.grandTournaments.mundial_leyendas?.wins || 0) >= 1 },
  { id: 'completista', name: 'Completionist', icon: '🎖️', desc: '40 achievements', check: () => Object.values(game.achievements).filter(Boolean).length >= 40 },
  { id: 'perfeccionista', name: 'Perfectionist', icon: '💎', desc: 'All achievements', check: () => Object.values(game.achievements).filter(Boolean).length >= ACHIEVEMENTS.length },
  { id: 'cientifico', name: 'Scientist', icon: '🧬', desc: 'All 30 skills', check: () => game.stats.skillsResearched >= 30 },
  { id: 'arquitecto', name: 'Architect', icon: '🏗️', desc: 'All 6 zones', check: () => game.stats.zonesUnlocked >= 6 },
  { id: 'iron_legend', name: 'Iron Legend', icon: '🔥', desc: 'Level 25 + $10M + 50 champion wins', check: () => game.level >= 25 && game.totalMoneyEarned >= 10000000 && game.stats.championWins >= 50 },
];

// ===== GYM THEMES =====
const GYM_THEMES = [
  { id: 'classic', name: 'Classic', icon: '🔶', cost: 0, reqLevel: 1, accent: '#f59e0b', accentGlow: '#f59e0b44', accentDark: '#b45309', bgDark: '#0a0a0f', bgCard: '#12121a' },
  { id: 'neon', name: 'Blue Neon', icon: '🔵', cost: 25000, reqLevel: 5, accent: '#3b82f6', accentGlow: '#3b82f644', accentDark: '#1d4ed8', bgDark: '#0a0a1a', bgCard: '#10102a' },
  { id: 'luxury', name: 'Luxury', icon: '💜', cost: 75000, reqLevel: 10, accent: '#a855f7', accentGlow: '#a855f744', accentDark: '#7c3aed', bgDark: '#0f0a1a', bgCard: '#18102a' },
  { id: 'power', name: 'Power Red', icon: '🔴', cost: 150000, reqLevel: 15, accent: '#ef4444', accentGlow: '#ef444444', accentDark: '#b91c1c', bgDark: '#1a0a0a', bgCard: '#2a1010' },
  { id: 'nature', name: 'Nature', icon: '💚', cost: 300000, reqLevel: 20, accent: '#22c55e', accentGlow: '#22c55e44', accentDark: '#15803d', bgDark: '#0a1a0f', bgCard: '#102a18' },
];

// ===== GYM DECORATIONS =====
const GYM_DECORATIONS = [
  { id: 'poster', name: 'Motivational Poster', icon: '🖼️', cost: 2000, reqLevel: 2, position: { left: '5%', top: '15%' }, bonuses: { reputation: 0.02 } },
  { id: 'planta', name: 'Plant', icon: '🌿', cost: 3000, reqLevel: 3, position: { left: '3%', top: '65%' }, bonuses: { income: 0.01 } },
  { id: 'tv', name: 'Big TV', icon: '📺', cost: 8000, reqLevel: 5, position: { left: '45%', top: '10%' }, bonuses: { capacity: 3 } },
  { id: 'espejo', name: 'Wall Mirror', icon: '🪞', cost: 5000, reqLevel: 4, position: { left: '88%', top: '15%' }, bonuses: { classQuality: 0.05 } },
  { id: 'fuente', name: 'Water Fountain', icon: '🚰', cost: 10000, reqLevel: 6, position: { left: '92%', top: '65%' }, bonuses: { income: 0.02 } },
  { id: 'parlantes', name: 'Speakers', icon: '🔊', cost: 15000, reqLevel: 8, position: { left: '25%', top: '10%' }, bonuses: { classQuality: 0.05 } },
  { id: 'bandera', name: 'Gym Flag', icon: '🚩', cost: 20000, reqLevel: 10, position: { left: '65%', top: '8%' }, bonuses: { reputation: 0.05 } },
  { id: 'trofeos', name: 'Trophy Case', icon: '🏆', cost: 50000, reqLevel: 12, position: { left: '75%', top: '15%' }, bonuses: { compReward: 0.10 } },
  { id: 'piso', name: 'Premium Flooring', icon: '🟫', cost: 100000, reqLevel: 15, position: { left: '50%', top: '85%' }, bonuses: { income: 0.03 } },
  { id: 'led', name: 'LED Lights', icon: '💡', cost: 200000, reqLevel: 18, position: { left: '50%', top: '3%' }, bonuses: { income: 0.02, capacity: 5 } },
];

// ===== TAB WALKTHROUGHS =====
// First-visit modal content for each tab
const TAB_WALKTHROUGHS = {
  gym: {
    icon: '🏠', title: 'Your Gym', wiki: 'gym',
    intro: 'This is the main screen of Iron Empire. Here you see in real time everything happening at your gym: income, active members, reputation and level.',
    tips: [
      '💰 Income per second depends on your equipment, staff and active members.',
      '👥 Members come on their own over time, but marketing and events speed it up.',
      '⭐ Reputation unlocks competitions and improves your chances to grow.',
      '📈 Level up by earning XP: buy equipment, complete achievements and gain experience.',
      '🏅 The daily bonus and missions give you extra resources every day.',
    ],
  },
  equipment: {
    icon: '🏋️', title: 'Equipment', wiki: 'equipment',
    intro: 'Equipment is the foundation of your income. Each piece generates cash per second and attracts members to your gym.',
    tips: [
      '🔧 Buy and upgrade equipment to increase income and capacity. The max level of each machine is your player level.',
      '⚠️ Machines break down randomly — you have to repair them to keep them running.',
      '⏱️ Upgrading a machine takes real time (higher level = more time). You can see the progress in the bar.',
      '🧹 Hiring a Cleaner reduces the chance that machines break down.',
      '🔬 The skill tree has upgrades to reduce costs, increase income and speed up repairs.',
    ],
  },
  staff: {
    icon: '👥', title: 'Staff', wiki: 'staff',
    intro: 'The staff works for you. Each employee has a different role and unique bonuses that improve your gym passively.',
    tips: [
      '💼 Hire staff to unlock their effects. Each one has a different bonus (more members, more income, classes, etc.).',
      '📚 Train staff to raise their level and boost their effects. Training takes real time.',
      '🤒 Staff can get sick randomly and stay inactive until they recover.',
      '➕ You can hire multiple copies of the same employee to amplify their effect.',
      '💰 The Manager reduces all costs and is key in the late game.',
    ],
  },
  classes: {
    icon: '🧘', title: 'Classes', wiki: 'classes',
    intro: 'Classes are activities you run at your gym. Each class needs its own instructor who unlocks and improves it.',
    tips: [
      '👨‍🏫 Hire an instructor to unlock their class. Without an instructor, the class is locked.',
      '⬆️ Upgrade the instructor (level 1-5) to increase the class earnings (+20% per level).',
      '💸 The instructor takes a commission (15%) of what the class generates — they have no fixed salary.',
      '⏱️ Start a class → wait for it to finish → the reward is automatic. Then it goes on cooldown.',
      '⭐ Quality goes up with the instructor\'s level and the required equipment.',
    ],
  },
  supplements: {
    icon: '🧃', title: 'Supplements', wiki: 'supplements',
    intro: 'Supplements give temporary boosts to different aspects of your gym. But watch out: using them too often reduces their effect.',
    tips: [
      '⚡ Each supplement gives a different effect (more members, more income, more rep, etc.) for a limited time.',
      '⚠️ Tolerance: using the same supplement too often makes it less effective (4 levels: 100% → 85% → 65% → 45%).',
      '📉 Tolerance drops if you let time pass without using it — the body recovers.',
      '🎯 Vary your supplements to maximize the benefits and avoid building dependency.',
      '💡 Check the tolerance meter before buying — if it\'s already high, wait or try another one.',
    ],
  },
  marketing: {
    icon: '📢', title: 'Marketing', wiki: 'marketing',
    intro: 'Marketing attracts new members to your gym. There are two types: always-on campaigns (continuous) and burst campaigns (one-time spikes).',
    tips: [
      '🔄 Always-on campaigns (Flyers, WhatsApp, Instagram, Google Ads): turn them on and they generate members and reputation steadily while you pay for them.',
      '⚡ Burst campaigns (YouTube, Radio, TV, Celebrity…): a big but temporary boost, with a cooldown between uses.',
      '📊 Check the ROI of each active campaign — some generate more per dollar invested than others.',
      '🔬 The skill tree can reduce costs, extend duration and boost marketing effects.',
      '💡 Combine always-on campaigns (a solid base) with one-time bursts for maximum growth.',
    ],
  },
  expansion: {
    icon: '🏗️', title: 'Facilities', wiki: 'expansion',
    intro: 'Expand your gym by building new zones. Each zone increases your maximum member capacity and generates extra income.',
    tips: [
      '🏢 There are 6 zones available: from the First Floor to the Arena. Each has a cost and a build time.',
      '⏱️ Building a zone takes real time (minutes to hours). You can\'t cancel once it\'s started.',
      '💰 Each active zone adds daily rent to your operating costs. Make sure your income can support it.',
      '🏠 At level 14 you can buy the property ($250K) and eliminate rent forever.',
      '🔬 Infrastructure skills reduce costs, speed up construction and let you build several zones at once.',
    ],
  },
  skills: {
    icon: '🔬', title: 'Skill Tree', wiki: 'skills',
    intro: 'The skill tree is permanent upgrades for your gym. They\'re organized into 6 branches and PERSIST through prestige.',
    tips: [
      '🌿 6 branches: Equipment, Marketing, Staff, Members, Infrastructure and Competitions. Each has 5 skills.',
      '💎 Skills persist through prestige — they\'re your most lasting investment in the game.',
      '📈 The first skills of each branch are cheaper; the final ones cost millions.',
      '🎯 Prioritize the branches you use most: if you run a lot of classes, the Staff tree is key.',
      '🔓 Some skills require a certain player level to unlock.',
    ],
  },
  champion: {
    icon: '🏆', title: 'Champion', wiki: 'champion',
    intro: 'Recruit an elite fighter to lead to the championship. The champion has 6 trainable stats and competes for double prizes.',
    tips: [
      '💪 There are 6 stats: Strength, Endurance, Speed, Technique, Stamina and Mindset. Each plays a different role in combat.',
      '⚡ Fatigue is the key resource: training and competing raise it. When it\'s too high, you can\'t do anything.',
      '🕐 You can\'t pay to recover — you have to wait. Stamina speeds up recovery.',
      '🏅 With an active champion, you earn double in all competitions.',
      '🛡️ Equipment adds passive stats — buy it when you can to boost the champion.',
      '🌟 Later on the Grand Tournaments open up: rare events with huge prizes. Prepare the champion first (flights, training camp, medical kit) or risk an injury.',
    ],
  },
  rivals: {
    icon: '🏪', title: 'Rivals', wiki: 'rivals',
    intro: 'There are 6 rival gyms that steal your members passively. You can invest to slow them down or defeat them for good.',
    tips: [
      '📉 Rivals steal your members every so often — the stronger the rival, the more members you lose.',
      '📣 Promo (temporary): spend cash to run a campaign that stops the stealing for a while.',
      '🥊 Defeat (permanent): invest a lot more, but the rival is out of the game forever and gives you a bonus.',
      '💡 The first rivals are cheap to eliminate — prioritize them before the stronger ones take a lot of your members.',
      '🔬 Marketing skills reduce the number of members rivals steal from you.',
    ],
  },
  vip: {
    icon: '⭐', title: 'VIP Members', wiki: 'vip',
    intro: 'Every few minutes a potential VIP member appears. If you meet their requirements, you accept them and get a special bonus.',
    tips: [
      '⏰ VIPs appear every 4-7 minutes. You have a window of time to accept them before they leave.',
      '✅ Each VIP has specific requirements (minimum level, reputation, equipment, etc.). You can see which ones you meet.',
      '🎁 Accepting a VIP gives bonuses: more income, more members, special effects depending on the type.',
      '🔔 The red dot in the sidebar tells you when a VIP is waiting.',
      '📈 The higher your level and the better equipped your gym, the more high-value VIPs will appear.',
    ],
  },
  missions: {
    icon: '📋', title: 'Daily Missions', wiki: 'missions',
    intro: 'Each day you get 3 random missions to complete. They\'re short objectives that give you XP and extra cash.',
    tips: [
      '📅 Missions refresh every day. If you don\'t complete them, they\'re lost.',
      '🎯 Each mission has a clear objective: earn X cash, get Y members, complete Z classes, etc.',
      '🏆 If you complete all 3 missions of the day, you get an extra bonus.',
      '⚡ Missions are a good incentive to try systems you don\'t use often.',
      '🔔 The red dot in the sidebar tells you when you have missions with a reward ready.',
    ],
  },
  achievements: {
    icon: '🎖️', title: 'Achievements', wiki: 'achievements',
    intro: 'Achievements are goals the game checks automatically. When you meet them, you earn XP and recognition.',
    tips: [
      '🤖 You don\'t have to claim them manually — the game detects them on its own when you meet the conditions.',
      '📈 Achievements are the main source of XP besides normal gameplay.',
      '📋 There are 61 achievements covering every system in the game: members, cash, staff, competitions, etc.',
      '🔍 Check the achievements to see which goals you\'re missing and plan your next objective.',
      '🏅 Completing achievements unlocks titles for your profile.',
    ],
  },
  profile: {
    icon: '👤', title: 'Profile', wiki: 'missions',
    intro: 'Your profile shows your whole history in the game: career-wide stats, achievements and the title that represents you.',
    tips: [
      '📊 Cumulative stats (total cash, members served, competitions won, etc.) are never erased, not even by prestige.',
      '🏅 Titles are unlocked by completing achievements. Pick the one you like best to display.',
      '📈 It\'s a good place to review how active you were in each system of the game.',
    ],
  },
  prestige: {
    icon: '🏙️', title: 'City / Franchise', wiki: 'prestige',
    intro: 'Here you expand your empire by opening branches in other LA neighborhoods. Each one generates cash on its own, without you managing it.',
    tips: [
      '🏙️ Your main gym is the one you manage in the other tabs. Branches are 100% passive income.',
      '💵 Each branch drops straight into your wallet, at all times (online and offline). It has no breakdowns or costs.',
      '⬆️ Expand a branch to make it earn more. The pricier the neighborhood, the more it generates.',
      '⭐ Franchise stars rise with the TOTAL cash earned by your empire — they never drop, and each gives +25% income.',
      '🏆 The global leaderboard ranks by total cash earned.',
    ],
  },
};

// ===== WIKI CONTENT =====
const WIKI_CONTENT = [
  {
    id: 'start', icon: '🎮', title: 'Quick Start',
    content: '<p>Iron Empire is an idle/tycoon game where you run a gym from scratch. The goal is to grow, improve and eventually open franchises.</p>' +
      '<p><strong>The basic loop:</strong></p>' +
      '<ul><li>Buy and upgrade <strong>equipment</strong> to increase income per second.</li>' +
      '<li>Hire <strong>staff</strong> to unlock features and passive bonuses.</li>' +
      '<li>Use <strong>marketing</strong> to attract members.</li>' +
      '<li>Complete <strong>daily missions</strong> and <strong>achievements</strong> to earn XP and level up.</li>' +
      '<li>Expand with <strong>new zones</strong> and invest in the <strong>skill tree</strong>.</li>' +
      '<li>When you have enough, open <strong>new branches</strong> in other neighborhoods to expand your empire.</li></ul>' +
      '<div class="wiki-tip-box">💡 <strong>Starter tip:</strong> Complete the tutorial, then buy the Treadmill and hire a Receptionist. That gives you the base to grow.</div>',
  },
  {
    id: 'gym', icon: '🏠', title: 'Your Gym',
    content: '<p>The main screen shows your gym\'s status in real time.</p>' +
      '<p><strong>Key metrics:</strong></p>' +
      '<ul><li><strong>💰 Income/s:</strong> the sum of all equipment × staff and skill bonuses.</li>' +
      '<li><strong>👥 Members:</strong> active vs maximum capacity. If you hit the max, you stop attracting new ones.</li>' +
      '<li><strong>⭐ Reputation:</strong> unlocks competitions, VIPs and makes the gym more attractive.</li>' +
      '<li><strong>📈 Level and XP:</strong> the curve is <em>100 × 1.40^(level-1)</em>. It rises by buying equipment, running classes, winning competitions and completing achievements and missions.</li></ul>' +
      '<p><strong>Daily operating costs:</strong></p>' +
      '<ul><li>Base rent: $60/day</li>' +
      '<li>Rent per active zone: $30/zone/day</li>' +
      '<li>Utilities: $2 × total equipment level / day</li>' +
      '<li>Staff salaries: ~$323/day (all hired)</li></ul>' +
      '<div class="wiki-tip-box">💡 If your costs exceed your income, you\'re losing money. Buy the property at level 14 ($250K) to eliminate rent forever.</div>',
  },
  {
    id: 'equipment', icon: '🏋️', title: 'Equipment',
    content: '<p>There are 12 machines available. Each one is bought, upgraded and generates income and capacity.</p>' +
      '<p><strong>Key mechanics:</strong></p>' +
      '<ul><li><strong>Max level:</strong> equal to your player level. You can\'t upgrade a machine beyond your level.</li>' +
      '<li><strong>Upgrade time:</strong> 20 seconds × level. An upgrade at level 10 takes ~3 minutes.</li>' +
      '<li><strong>Breakdown:</strong> there\'s a 0.3% chance every 30 seconds that a machine breaks. Repair it to get it running again.</li>' +
      '<li><strong>Repair cost:</strong> grows with the machine\'s level.</li></ul>' +
      '<p><strong>Related skills (Equipment branch):</strong></p>' +
      '<ul><li>Reduced purchase/upgrade costs</li>' +
      '<li>Income boost per machine</li>' +
      '<li>Reduced breakdown chance</li>' +
      '<li>Faster repairs and upgrades</li></ul>' +
      '<div class="wiki-tip-box">💡 Upgrade the cheapest-to-maintain machines first. Hiring a Cleaner significantly reduces breakdowns.</div>',
  },
  {
    id: 'staff', icon: '👥', title: 'Staff',
    content: '<p>There are 8 types of employees. Each one has a unique role that improves different aspects of the gym.</p>' +
      '<p><strong>Available roles:</strong></p>' +
      '<ul><li>🧾 <strong>Receptionist:</strong> attracts more members passively.</li>' +
      '<li>🧹 <strong>Cleaner:</strong> reduces machine breakdowns.</li>' +
      '<li>🧑‍🏫 <strong>Instructor:</strong> lets you run classes and improves their quality.</li>' +
      '<li>💊 <strong>Nutritionist:</strong> boosts income per member.</li>' +
      '<li>📣 <strong>Community Manager:</strong> generates passive reputation.</li>' +
      '<li>🏥 <strong>Doctor:</strong> reduces the duration of staff illnesses.</li>' +
      '<li>🔧 <strong>Technician:</strong> reduces machine repair time.</li>' +
      '<li>💼 <strong>Manager:</strong> a general boost to all income.</li></ul>' +
      '<p><strong>Staff mechanics:</strong></p>' +
      '<ul><li><strong>Training:</strong> raise the employee\'s level by paying cash + time. Each level amplifies their effect.</li>' +
      '<li><strong>Illness:</strong> 0.5% chance every 60 seconds of getting sick. They stay inactive until they recover.</li>' +
      '<li><strong>Extras:</strong> you can hire multiple copies of the same employee to multiply their effect.</li></ul>',
  },
  {
    id: 'classes', icon: '🧘', title: 'Classes',
    content: '<p>Classes are group activities that generate income and reputation. There are 8 types, each with its own instructor.</p>' +
      '<p><strong>Instructor system:</strong></p>' +
      '<ul><li>Each class has a dedicated instructor you must hire to unlock it.</li>' +
      '<li>Instructors have levels 1 through 5. Each level increases the class earnings by +20%.</li>' +
      '<li>The instructor takes a 15% commission on the class\'s gross earnings (no fixed salary).</li>' +
      '<li>The instructor\'s upgrade cost rises with each level.</li></ul>' +
      '<p><strong>How classes work:</strong></p>' +
      '<ul><li>You start a class → wait for it to finish → receive the reward automatically (minus the commission).</li>' +
      '<li>Then it goes on cooldown before you can run it again.</li>' +
      '<li>The start cost scales +15% per player level. The reward scales +20%.</li></ul>' +
      '<p><strong>Class quality:</strong></p>' +
      '<ul><li>Rises with the instructor\'s level (+20%/lvl) and the required equipment (+5%/lvl).</li>' +
      '<li>Higher quality = more income per class.</li></ul>' +
      '<div class="wiki-tip-box">💡 Invest in your instructors — a level 5 instructor generates much more cash than a level 1, and the commission is always 15%.</div>',
  },
  {
    id: 'supplements', icon: '🧃', title: 'Supplements',
    content: '<p>Supplements give temporary boosts. There are 8 types, each with a different effect. The trick is tolerance.</p>' +
      '<p><strong>Tolerance system:</strong></p>' +
      '<ul><li>Every time you buy the same supplement, its tolerance level rises (0→1→2→3).</li>' +
      '<li>Effectiveness drops with tolerance: 100% → 85% → 65% → 45%.</li>' +
      '<li>Tolerance drops 1 level per game day without using that supplement.</li></ul>' +
      '<p><strong>Available supplements:</strong></p>' +
      '<ul><li>🔴 Protein — more members attracted</li>' +
      '<li>⚡ Pre-workout — more income per second</li>' +
      '<li>🟢 BCAA — faster staff recovery</li>' +
      '<li>🔵 Creatine — reputation boost</li>' +
      '<li>🟡 Omega-3 — reduces operating costs</li>' +
      '<li>🟠 Vitamins — boost to XP earned</li>' +
      '<li>🟣 L-Carnitine — boost to class quality</li>' +
      '<li>⚪ Collagen — boost to marketing effectiveness</li></ul>' +
      '<div class="wiki-tip-box">💡 Rotate between supplements instead of always using the same one. That way tolerance doesn\'t rise and you keep 100% effectiveness.</div>',
  },
  {
    id: 'marketing', icon: '📢', title: 'Marketing',
    content: '<p>Marketing attracts members and generates reputation. There are two campaign types with very different logic.</p>' +
      '<p><strong>Always-on campaigns (toggle on/off):</strong></p>' +
      '<ul><li>Flyers, WhatsApp, Instagram Ads, Google Ads.</li>' +
      '<li>You turn them on and they generate members + reputation steadily while you pay the daily cost.</li>' +
      '<li>You can see the ROI (members per dollar spent) in real time for each active campaign.</li></ul>' +
      '<p><strong>Burst campaigns (cooldown):</strong></p>' +
      '<ul><li>YouTube, Radio, TV, Celebrity, Sponsorship, Gala.</li>' +
      '<li>A big, temporary boost of members and reputation, then they go on cooldown.</li>' +
      '<li>Ideal for moments of expansion or when you need members fast.</li></ul>' +
      '<p><strong>Marketing skills improve:</strong></p>' +
      '<ul><li>Members attracted per campaign</li>' +
      '<li>Duration of burst campaigns</li>' +
      '<li>Cost reduction</li>' +
      '<li>Reduced member theft by rivals</li></ul>',
  },
  {
    id: 'expansion', icon: '🏗️', title: 'Facilities',
    content: '<p>There are 6 zones to expand your gym. Each zone adds maximum member capacity and extra income.</p>' +
      '<p><strong>Available zones:</strong></p>' +
      '<ul><li>🏢 First Floor — $50K, level 5, 3 min</li>' +
      '<li>🏊 Pool — $200K, level 8, 15 min</li>' +
      '<li>🧖 Spa/Wellness — $500K, level 10, 30 min</li>' +
      '<li>🏃 Running Track — $1.5M, level 13, 1 hour</li>' +
      '<li>🎭 Event Room — $5M, level 16, 90 min</li>' +
      '<li>🏟️ Arena — $15M, level 20, 2 hours</li></ul>' +
      '<p><strong>Important mechanics:</strong></p>' +
      '<ul><li>Each active zone adds $30/day of rent to your operating costs.</li>' +
      '<li>Buying the property (level 14, $250K) eliminates base rent and zone rent.</li>' +
      '<li>Construction can\'t be canceled once started.</li></ul>' +
      '<div class="wiki-tip-box">💡 Infrastructure skills can reduce costs, speed up construction and let you build multiple zones simultaneously.</div>',
  },
  {
    id: 'skills', icon: '🔬', title: 'Skill Tree',
    content: '<p>30 permanent skills organized into 6 branches. They\'re the most lasting investment in the game because they persist through prestige.</p>' +
      '<p><strong>The 6 branches:</strong></p>' +
      '<ul><li>🔧 <strong>Equipment:</strong> costs, income, capacity, breakdown, upgrade speed.</li>' +
      '<li>📢 <strong>Marketing:</strong> members per campaign, duration, reputation, costs, protection vs rivals.</li>' +
      '<li>👥 <strong>Staff:</strong> effectiveness, passive reputation, synergy, costs, illness resistance.</li>' +
      '<li>💰 <strong>Members:</strong> rep per member, retention, VIP rewards, income per member, attraction.</li>' +
      '<li>🏗️ <strong>Infrastructure:</strong> zone costs, build speed, repair, simultaneous upgrades.</li>' +
      '<li>🏆 <strong>Competitions:</strong> win chance, cooldown, prizes, reputation and XP per competition.</li></ul>' +
      '<p><strong>Costs:</strong> from $2.5K (first skills) to $15M (last of each branch). Level requirement from 3 to 25.</p>' +
      '<div class="wiki-tip-box">💡 Invest in the tree before doing prestige. On reset, the skills remain and make the new cycle much faster.</div>',
  },
  {
    id: 'champion', icon: '🏆', title: 'Champion',
    content: '<p>At level 8 you can recruit a champion and take them to competitions for double prizes.</p>' +
      '<p><strong>The 6 stats:</strong></p>' +
      '<ul><li>💪 <strong>Strength:</strong> increases victory prizes.</li>' +
      '<li>🫀 <strong>Endurance:</strong> reduces fatigue when competing.</li>' +
      '<li>⚡ <strong>Speed:</strong> improves the chance to win.</li>' +
      '<li>🎯 <strong>Technique:</strong> multiplies prizes and reputation earned.</li>' +
      '<li>🔋 <strong>Stamina:</strong> speeds up fatigue recovery.</li>' +
      '<li>🧠 <strong>Mindset:</strong> extra boost in tough competitions.</li></ul>' +
      '<p><strong>Fatigue system:</strong></p>' +
      '<ul><li>Training raises fatigue +25. Competing raises it +35 (less with high Endurance).</li>' +
      '<li>At fatigue ≥ 75, the champion is exhausted and can\'t do anything.</li>' +
      '<li><strong>There\'s no way to pay to recover</strong> — you have to wait. Stamina speeds up recovery.</li>' +
      '<li>Recovery: 2 + (Stamina × 0.5) fatigue points every 30 seconds.</li></ul>' +
      '<div class="wiki-tip-box">💡 Prioritize Stamina if you want to train and compete more often. With high Stamina, fatigue drops much faster.</div>',
  },
  {
    id: 'grand_tournaments', icon: '🌟', title: 'Grand Tournaments',
    content: '<p><strong>Grand Tournaments</strong> are rare, very high-reward events for your champion. Unlike normal competitions, you have to <strong>prepare beforehand</strong>, the risk is real (injury) and the cooldown lasts <strong>days</strong>.</p>' +
      '<p><strong>The circuit:</strong></p>' +
      '<ul><li>🌎 <strong>Elite Continental Cup</strong> — cooldown 24 h. Champion level 6, 1500 rep, Endurance 12+.</li>' +
      '<li>🌍 <strong>Legends World Cup</strong> — cooldown 3 days. Champion level 12, 5000 rep, Endurance 25+.</li></ul>' +
      '<p><strong>Preparation ("have everything ready beforehand" style):</strong></p>' +
      '<ul><li>✈️ <strong>Flights and Visa</strong> — required to enter.</li>' +
      '<li>🏕️ <strong>Training Camp</strong> — a camp with a real timer; the champion is tied up while it lasts.</li>' +
      '<li>🥗 <strong>Nutrition Plan</strong> — adds readiness.</li>' +
      '<li>🩺 <strong>Medical Kit</strong> — adds readiness and <strong>halves</strong> the chance and severity of injury.</li></ul>' +
      '<p>Each item raises your <strong>Readiness%</strong>. More Readiness = more chance to win (+35% at 100%) and less injury risk. You can enter half-prepared (gambling) or wait and enter at 100%.</p>' +
      '<p><strong>The attempt:</strong> you pay the entry fee and the cooldown starts (win or lose). The readiness is consumed. If you win, a huge prize + reputation + permanent title. If you get injured, the champion is out of action for a few hours (no training or competing) — only time heals it.</p>' +
      '<div class="wiki-tip-box">💡 High Endurance and the Medical Kit make it so you almost never come out hurt. Well prepared, a Grand Tournament is nearly guaranteed cash; poorly prepared, it\'s a gamble.</div>',
  },
  {
    id: 'opportunities', icon: '💼', title: 'Risky Ventures',
    content: '<p><strong>Risky Ventures</strong> (City tab) are the same loop as Grand Tournaments, but at the <strong>gym</strong> level: you don\'t need a champion. Lay the groundwork, take the risk, and if it goes wrong your gym takes a <strong>temporary setback</strong>.</p>' +
      '<p><strong>The opportunities:</strong></p>' +
      '<ul><li>🥊 <strong>Underground Tournament</strong> — level 10, cooldown 12 h. The most accessible.</li>' +
      '<li>💼 <strong>Million-Dollar Sponsorship</strong> — level 16, cooldown 2 days. Gives cash and members.</li>' +
      '<li>🏗️ <strong>Real Estate Investment</strong> — level 22, cooldown 3 days. The biggest play.</li></ul>' +
      '<p><strong>Preparation:</strong> 📋 Paperwork and Permits (required), 🔍 Due Diligence (timer, cuts the risk a lot), 🤝 Connections, 🛡️ Insurance (halves the setback\'s chance and severity). Each item raises your <strong>Readiness%</strong> = more chance of success (+35% at 100%) and less risk.</p>' +
      '<p>Your <strong>accumulated fame</strong> (lifetime reputation) also improves the odds: more standing in the city, better deals.</p>' +
      '<p><strong>The setback (if it goes wrong):</strong> bad press / a raid / a scandal lowers your <strong>income by a % for a few hours</strong> and slows your reputation. Only time heals it. It only affects your main gym, not the passive branches.</p>' +
      '<div class="wiki-tip-box">💡 Insurance is key: it lowers the setback\'s chance AND shortens its duration. For Real Estate, go full readiness: the hit from a financial crisis hurts.</div>',
  },
  {
    id: 'rivals', icon: '🏪', title: 'Rivals',
    content: '<p>There are 6 rival gyms in the area. They all steal your members passively. There are two ways to stop them.</p>' +
      '<p><strong>Rivals (from weakest to strongest):</strong></p>' +
      '<ul><li>FitEasy — level 2 required</li>' +
      '<li>GymPlus — level 5</li>' +
      '<li>PowerHouse — level 8</li>' +
      '<li>EliteGym — level 12</li>' +
      '<li>Olympus — level 16</li>' +
      '<li>MaxFit Corp — level 20</li></ul>' +
      '<p><strong>Options:</strong></p>' +
      '<ul><li>📣 <strong>Promo (temporary):</strong> spend cash on a campaign that stops the stealing for a while. It\'s cheaper but you have to renew it.</li>' +
      '<li>🥊 <strong>Defeat (permanent):</strong> a big investment, the rival is eliminated for good and gives you an income bonus.</li></ul>' +
      '<p><strong>Costs:</strong> scale +20% per player level above the rival\'s requirement.</p>' +
      '<div class="wiki-tip-box">💡 Start with the weakest rivals to eliminate them permanently. The long-term member savings justify the investment.</div>',
  },
  {
    id: 'vip', icon: '⭐', title: 'VIP Members',
    content: '<p>There are 16 types of VIP members that appear randomly every 4-7 minutes. Each one has specific requirements to be accepted.</p>' +
      '<p><strong>How they work:</strong></p>' +
      '<ul><li>When a VIP appears, you see in real time which requirements you meet (✅) and which you don\'t (❌).</li>' +
      '<li>If you meet them all, you can accept them and activate their special bonus.</li>' +
      '<li>If you don\'t meet the requirements, the VIP leaves after a while.</li></ul>' +
      '<p><strong>Types of VIP bonus:</strong></p>' +
      '<ul><li>Some give more permanent income while they\'re active.</li>' +
      '<li>Others attract more members, generate reputation, reduce costs, etc.</li>' +
      '<li>High-level VIPs have demanding requirements but give very powerful bonuses.</li></ul>' +
      '<p><strong>Member skills</strong> improve VIP rewards and increase the chances of better types appearing.</p>',
  },
  {
    id: 'missions', icon: '📋', title: 'Daily Missions',
    content: '<p>Each game day (10 real minutes = 1 day) you get 3 random missions to complete.</p>' +
      '<p><strong>Mission types:</strong></p>' +
      '<ul><li>Earn an amount of cash</li>' +
      '<li>Get an amount of members</li>' +
      '<li>Complete an amount of classes</li>' +
      '<li>Win competitions</li>' +
      '<li>Run marketing campaigns</li>' +
      '<li>Accept VIP members</li>' +
      '<li>Use supplements</li>' +
      '<li>Train the champion</li></ul>' +
      '<p><strong>Rewards:</strong></p>' +
      '<ul><li>Each mission gives XP and cash on completion.</li>' +
      '<li>Completing all 3 of the day gives an extra bonus.</li></ul>' +
      '<div class="wiki-tip-box">💡 Check the missions at the start of the game day to plan your actions. Some missions complete on their own through normal gameplay.</div>',
  },
  {
    id: 'achievements', icon: '🎖️', title: 'Achievements',
    content: '<p>There are 61 achievements the game checks automatically. When you meet the conditions, the achievement unlocks and you receive XP.</p>' +
      '<p><strong>Achievement categories:</strong></p>' +
      '<ul><li>💰 Economy — goals for money earned and accumulated</li>' +
      '<li>👥 Members — goals for active members and records</li>' +
      '<li>🏋️ Equipment — purchases, upgrades, repairs</li>' +
      '<li>👔 Staff — hires and training</li>' +
      '<li>🧘 Classes — classes completed</li>' +
      '<li>📢 Marketing — campaigns launched</li>' +
      '<li>🏆 Competitions — champion victories</li>' +
      '<li>🌟 Prestige — number of times you\'ve done prestige</li>' +
      '<li>🎯 Misc — special achievements from each system</li></ul>' +
      '<p>Achievements are the <strong>main source of XP</strong> in the game. Check them to plan your next objective.</p>',
  },
  {
    id: 'events', icon: '⚡', title: 'Random Events',
    content: '<p>Every 5-10 minutes a random event appears that requires your decision. They\'re situations that affect the gym.</p>' +
      '<p><strong>There are 28 different events,</strong> which include:</p>' +
      '<ul><li>Equipment problems</li>' +
      '<li>Growth opportunities</li>' +
      '<li>Situations with members or neighbors</li>' +
      '<li>Inspections and audits</li>' +
      '<li>Special offers</li></ul>' +
      '<p><strong>Each event has 2-3 options</strong> with different costs and outcomes. The costs scale with your current level and income.</p>' +
      '<p><strong>Scaling formula:</strong> <em>max(level_scale, income_per_second × 0.5)</em>. If you earn a lot, events cost more but you can also pay for them more easily.</p>' +
      '<div class="wiki-tip-box">💡 Events can\'t be ignored — the overlay blocks the game until you make a decision. Read the options carefully before choosing.</div>',
  },
  {
    id: 'prestige', icon: '🏙️', title: 'City / Franchise',
    content: '<p>The franchise lets you expand your empire by opening branches in other LA neighborhoods. You manage ONE gym; the branches are 100% passive income.</p>' +
      '<p><strong>🏙️ How it works:</strong></p>' +
      '<ul><li>Your <strong>main gym</strong> is the one you run in all the other tabs (equipment, staff, classes, etc.).</li>' +
      '<li>From "City" you open <strong>branches</strong> by paying the neighborhood\'s cost. They\'re not managed: they generate cash on their own.</li>' +
      '<li>Pricier, higher-level neighborhoods yield more passive income.</li></ul>' +
      '<p><strong>💵 Passive income:</strong></p>' +
      '<ul><li>Each branch pours its income straight into your wallet, online and offline.</li>' +
      '<li>They have no breakdowns, illnesses or costs — they\'re clean profit.</li>' +
      '<li>Tap <strong>Expand</strong> on a branch to invest and raise its income (+25% per level).</li></ul>' +
      '<p><strong>⭐ Franchise stars:</strong></p>' +
      '<ul><li>They\'re calculated from the total cash earned across your WHOLE empire (includes passive).</li>' +
      '<li>Each star gives a +25% permanent income multiplier — it affects all your gyms.</li>' +
      '<li>Stars never drop — they only grow.</li></ul>' +
      '<div class="wiki-tip-box">No need to rush: a pricey branch yields a lot, but first grow your main gym, which is the one that multiplies everything with the stars.</div>',
  },
  {
    id: 'economy', icon: '💰', title: 'Economy & Balance',
    content: '<p>Understanding the economy helps you make better investment decisions.</p>' +
      '<p><strong>XP curve:</strong> <em>100 × 1.40^(level-1)</em>. Class and competition XP scales with your level, so progression stays smooth.</p>' +
      '<p><strong>Daily operating costs (1 day = 10 real minutes = 600 ticks):</strong></p>' +
      '<ul><li>Base rent: $60/day (until level 14 or property purchase)</li>' +
      '<li>Per active zone: $30/zone/day</li>' +
      '<li>Utilities: $2 × sum of equipment levels / day</li>' +
      '<li>Total salaries: ~$323/day with all staff hired</li></ul>' +
      '<p><strong>Price scaling:</strong></p>' +
      '<ul><li>Classes: +15% per player level above the required one</li>' +
      '<li>Supplements: +15% per level above the required one</li>' +
      '<li>Rivals: +20% per level above the required one</li>' +
      '<li>Events: <em>max(level_scale, income/s × 0.5)</em></li></ul>' +
      '<p><strong>Time mechanics:</strong></p>' +
      '<ul><li>1 tick = 1 real second</li>' +
      '<li>1 game day = 600 ticks = 10 real minutes</li>' +
      '<li>Offline progress: up to 8 hours (income, expenses, construction, campaigns, reputation, training)</li></ul>',
  },
];
