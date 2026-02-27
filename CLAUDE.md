# Iron Empire - Gym Tycoon Browser Game

## Project Overview
Browser-based idle/tycoon gym game. Free, no pay-to-win. All text in Argentine Spanish.
Deployed on GitHub Pages with Firebase backend for auth + cloud saves.
Repo: https://github.com/juangori/iron-empire
Live: https://ironempiregame.com (custom domain)

## Tech Stack
- Pure HTML/CSS/JS (no frameworks, no build step)
- Firebase Auth (Google, Facebook, Email/Password)
- Firebase Firestore (cloud saves, user data)
- localStorage as local backup
- GitHub Pages for hosting

## File Structure
```
index.html          - Main HTML structure, auth screen, account modal, loads all scripts + Firebase SDKs
css/styles.css      - All styles (CSS variables, responsive, auth styles)
js/data.js          - Game data: equipment, staff, competitions, achievements, classes, marketing, events, missions, tutorial, daily bonus, skill tree, zones, VIP members, supplements, rivals
js/game.js          - Core engine: game state, save/load, tick loop, game actions, utility functions, skill/zone calculations, chaos mechanics, construction timers
js/ui.js            - UI rendering: equipment, staff, competitions, achievements, log, updateUI
js/systems.js       - Engagement: daily bonus, daily missions, random events, tutorial, classes, marketing, skill tree, expansion, VIP members, supplements, rivals, tab notifications
js/auth.js          - Firebase auth: login/register (Google, Facebook, email/password), account settings, cloud save, auth state management
CNAME               - Custom domain config
```

## Architecture Notes
- Game state is a single global `game` object (defined in game.js)
- Data definitions are global constants (EQUIPMENT, STAFF, SKILL_TREE, GYM_ZONES, VIP_MEMBERS, SUPPLEMENTS, RIVAL_GYMS, etc. in data.js)
- Game loop runs via `setInterval(gameTick, 1000)` - one tick per second
- All rendering functions follow pattern: `renderXxx()` reads from `game` state and writes innerHTML
- Save system: auto-save every 30 ticks to localStorage, cloud save every 60 ticks to Firestore
- Offline earnings calculated on load (capped at 2 hours)
- Skills persist through prestige, zones do not
- Equipment state: `{ level, brokenUntil, upgradingUntil }` — tracks breakdown and construction
- Staff state: `{ hired, level, trainingUntil, sickUntil, extras: [] }` — tracks training and illness
- Zone building state: `game.zoneBuilding = { zoneId: timestamp }`

## Auth Flow
1. Page loads → Auth screen (login/register/guest)
2. Login/Register → Firebase Auth → Check for cloud save
3. New user → Gym name modal → Tutorial
4. Returning user → Load cloud save → Game resumes
5. Guest mode → localStorage only, no cloud sync
6. Account settings accessible from Settings tab (change username, password)

## Firebase Config
- Firebase config is in js/auth.js (top of file)
- Replace placeholder values with actual Firebase project config
- Required Firebase services: Authentication, Firestore
- Firestore collections: `users` (profiles), `saves` (game data)

## Key Game Systems (20 total)
1. **Equipment** (12 items) - Buy/upgrade, each gives income/members/capacity. Level cap = player level. Can break down randomly.
2. **Staff** (8 types) - Hire + train levels. Passive bonuses. Can get sick randomly. Multiple copies via extras.
3. **Competitions** (6 tiers) - Win chance + cooldown, rewards money/rep/XP. Skill-enhanced.
4. **Achievements** (55) - Auto-checked conditions, grant XP. Covers all systems.
5. **Prestige/Franchise** - Reset for permanent income multiplier stars
6. **Daily Bonus** - 7-day streak cycle with escalating rewards
7. **Daily Missions** (3/day) - Random from pool of 8 types, bonus for all 3
8. **Random Events** (every 5-10 min) - 28 events with player choices, costs scale with income
9. **Gym Classes** (8 types) - Real-time duration + cooldown, costs money, requires staff, quality bonus from equip/staff levels
10. **Marketing Campaigns** (7 tiers) - Temporary member/rep boost, skill-enhanced costs/duration/effects
11. **Tutorial** - 12-step interactive walkthrough
12. **Skill Tree** (6 branches x 5 skills = 30) - Permanent upgrades, persist through prestige. Costs $2.5K-$15M, levels 3-25.
13. **Gym Expansion** (6 zones) - Capacity + income per zone, construction timers (3min-2h), buy property option
14. **VIP Members** (16 types) - Spawn every 4-7 min, show detailed req status (met/unmet)
15. **Supplements** (8 types) - Temporary buffs, costs scale with player level (+15%/level above req)
16. **Rival Gyms** (6 NPCs) - Steal members passively, promo (temp) or defeat (permanent bonus), costs scale with level
17. **Leaderboard** - Firebase-synced global ranking by total money earned, in Prestige tab
18. **Staff Training** - Level up staff with money + time, each level boosts their effect
19. **Equipment Breakdown** - Random breakdowns, repair costs money + time, cleaner reduces chance
20. **Construction Timers** - Equipment upgrades (20s * level) and zone building take real time

## Balance & Economy
- XP curve: `100 * 1.55^(level-1)` — slower progression
- Operating costs: base rent ($60/day) + zone rent ($30/zone/day) + utilities ($2/equip level/day)
- Property purchase ($250K, lvl 14) eliminates rent
- Equipment level capped at player level
- Event costs scale: `max(levelScale, income * 0.5)` — scales with actual income/s
- Supplement costs scale: +15% per level above requirement
- Rival costs scale: +20% per level above requirement
- Staff salaries: $323/day total (all 8 hired)
- Game day = 600 ticks = 10 min real time
- Timers auto-refresh every 2 seconds in game tick
- Zone costs: $50K (1st floor) to $15M (arena)
- Skill tree costs: $2.5K to $15M, levels 3-25
- Construction: equipment 20s*level, zones 3min-2h
- Chaos: 0.3% equipment breakdown/30s, 0.5% staff illness/60s
- Class costs scale +15%/level, rewards scale +20%/level with quality bonus

## Skill Tree Branches (6)
1. **Equipment** (🔧) - Cost reduction, income boost, capacity, mastery, breakdown resistance
2. **Marketing** (📢) - Campaign members, duration, rep, cost reduction, rival steal reduction
3. **Staff** (👥) - Effect boost, rep generation, synergy, cost/auto-members, illness resistance
4. **Members** (💰) - Member rep, retention, VIP rewards, income mastery, member attraction
5. **Infrastructure** (🏗️) - Zone cost, build speed, repair speed, equip upgrade speed, concurrent upgrades
6. **Competitions** (🏆) - Win chance, cooldown, rewards, rep from comps, XP from comps

## Development Conventions
- Language: All UI text in Argentine Spanish (vos form: "comprá", "mejorá", "elegí")
- Functions use camelCase
- CSS uses BEM-ish naming with kebab-case
- No external dependencies besides Firebase SDKs (loaded via CDN)
- Game must work as static files (GitHub Pages compatible)
- No pay-to-win mechanics ever

## Git Workflow
- Single branch: main
- Push to main auto-deploys to GitHub Pages
- Use gh CLI for GitHub operations (installed at "C:\Program Files\GitHub CLI\gh.exe")
- PATH needs: `export PATH="$PATH:/c/Program Files/GitHub CLI"`

## Planned Improvements (by priority)
### Balance & Depth (Bloques pendientes)
- Equipment/Zones separation: split into "Máquinas" and "Instalaciones"
- Champion system: hire/train champion, daily tokens, competition rework

### Phase 4 - Social & Meta
- Training programs (assign routines to members)
- Seasonal competition leagues
- Player profiles with stats/badges
- Gym decoration/customization

### Phase 5 - Polish & Endgame
- Multiple simultaneous branches (evolved prestige)
- Sound effects & music
- Income/growth charts
