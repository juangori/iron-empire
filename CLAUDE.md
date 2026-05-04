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
js/data.js          - Game data: equipment, staff, competitions, achievements, classes, class instructors,
                      marketing, events, missions, tutorial, daily bonus, skill tree, zones, neighborhoods,
                      VIP members, supplements, rivals, champion, TAB_WALKTHROUGHS, WIKI_CONTENT, player titles, gym decoration
js/game.js          - Core engine: game state, save/load, tick loop, game actions, utility functions,
                      skill/zone calculations, chaos mechanics, construction timers, champion logic,
                      branch system (BRANCH_PROPERTIES, extract/apply/switch), franchise stars,
                      offline progression (calculateOfflineProgress + showOfflineReport)
js/ui.js            - UI rendering: equipment, staff, competitions, achievements, log, updateUI
js/systems.js       - Engagement: daily bonus, daily missions, random events, tutorial, tab walkthroughs,
                      wiki, classes (+ instructor hire/upgrade), marketing, skill tree, expansion, VIP members,
                      supplements, rivals, champion, tab notifications, reminders, player profile, balance panel,
                      city map (renderCityMap, openNewBranchModal, confirmNewBranch)
js/auth.js          - Firebase auth: login/register (Google, Facebook, email/password), account settings,
                      cloud save, auth state management
CNAME               - Custom domain config
```

## Architecture Notes
- Game state is a single global `game` object (defined in game.js)
- Data definitions are global constants (EQUIPMENT, STAFF, CLASS_INSTRUCTORS, SKILL_TREE, GYM_ZONES, NEIGHBORHOODS, VIP_MEMBERS, SUPPLEMENTS, RIVAL_GYMS, TAB_WALKTHROUGHS, WIKI_CONTENT, etc. in data.js)
- Game loop runs via `setInterval(gameTick, 1000)` - one tick per second
- Game tick is paused during tutorial (`if (!game.tutorialDone) { updateUI(); return; }`)
- All rendering functions follow pattern: `renderXxx()` reads from `game` state and writes innerHTML
- Save system: auto-save every 30 ticks to localStorage, cloud save every 60 ticks to Firestore
- Offline progression: `calculateOfflineProgress()` in game.js, capped at 8 hours. Calculates net income (income - salaries - op costs), completes all timers (equipment upgrades/repairs, zones, staff training, classes, champion training), processes marketing campaigns (always-on costs + members + rep, burst completion), passive rep from members, auto-members from staff, champion fatigue recovery. Shows `showOfflineReport()` modal with full breakdown on return.
- **Branch system**: Multi-gym franchise replaces old destructive prestige. Uses "Active Branch Swap" pattern: `game.equipment = game.branches[id].equipment` via JS object references. All existing functions work unchanged — they read from `game.*` which points to the active branch's data. `BRANCH_PROPERTIES` defines which fields are per-branch. `extractBranchData()` / `applyBranchToGame()` / `switchBranch()` manage state swaps. Old saves auto-migrate on load.
- Branch state: `game.branches = { branch_0: { ...branchProps, neighborhoodId } }`, `game.activeBranch = 'branch_0'`
- Skills, champion, achievements, stats persist globally (not per-branch)
- Equipment state: `{ level, brokenUntil, upgradingUntil }` — tracks breakdown and construction (per-branch)
- Staff state: `{ hired, level, trainingUntil, sickUntil, extras: [] }` — tracks training and illness (per-branch)
- Zone building state: `game.zoneBuilding = { zoneId: timestamp }` (per-branch)
- Champion state: `game.champion = { recruited, name, stats, level, xp, fatigue, equipment, trainingUntil, trainingStat, wins, losses }` — global, persists across branches. No SVG, no energy system. Uses fatigue (not energy).
- Instructor state: `game.instructors[classId] = { hired, level }` — one per class, per-branch
- Tab tracking: `game.tabLastVisited = { tabId: timestamp }` for reminders; `game.tabsSeen = { tabId: true }` for first-visit walkthroughs

## Auth Flow
1. Page loads → Auth screen (login/register/guest)
2. Login/Register → Firebase Auth → Check for cloud save
3. New user → Gym name modal → Tutorial (game tick paused, $100 starting money)
4. Returning user → Load cloud save → Offline progression → Summary modal → Game resumes
5. Guest mode → localStorage only, no cloud sync
6. Account settings accessible from Settings tab (change username, password)

## Firebase Config
- Firebase config is in js/auth.js (top of file)
- Replace placeholder values with actual Firebase project config
- Required Firebase services: Authentication, Firestore
- Firestore collections: `users` (profiles), `saves` (game data)

## Key Game Systems (25 total)
1. **Máquinas/Equipment** (12 items) - Buy/upgrade, each gives income/members/capacity. Level cap = player level. Can break down randomly.
2. **Staff** (8 types) - Hire + train levels. Passive bonuses. Can get sick randomly. Multiple copies via extras.
3. **Competitions** (6 tiers) - Unified in champion tab. Normal competitions before recruiting, 2x rewards with champion. Shared cooldowns.
4. **Achievements** (76) - Auto-checked conditions, grant XP. Covers all systems.
5. **City/Franchise** (6 neighborhoods) - Open new gym branches in Buenos Aires neighborhoods (Palermo, La Boca, Caballito, Belgrano, Recoleta, San Telmo). Each has unique multipliers (rent, members, VIP, member cap). Never lose progress — old gyms keep earning passively. Franchise stars based on empire total earnings.
6. **Daily Bonus** - 7-day streak cycle with escalating rewards
7. **Daily Missions** (3/day) - Random from pool of 8 types, bonus for all 3
8. **Random Events** (every 5-10 min) - 28 events with player choices, costs scale with income
9. **Gym Classes** (8 types) - Real-time duration + cooldown, costs money. Each class has a dedicated instructor that must be hired to unlock it. Instructor levels 1-5 boost income +20%/level. Instructors earn 15% commission on gross class income (no fixed salary). Quality bonus from equipment + instructor levels.
10. **Marketing Campaigns** (10 total: 4 always-on + 6 burst) - Always-on: toggle on/off, continuous cost+member generation (Flyers, WhatsApp, Instagram, Google Ads). Burst: one-time with cooldown (YouTube, Radio, TV, Celebrity, Patrocinio, Gala). ROI insights for active campaigns.
11. **Tutorial** - 16-step interactive walkthrough. Game tick paused during tutorial. Action steps force user to click (navigate tabs, buy first equipment). Smart tooltip positioning (below/above/side/center). Player starts with $100 for first purchase.
12. **Skill Tree** (6 branches x 5 skills = 30) - Permanent upgrades, persist through prestige. Costs $2.5K-$15M, levels 3-25.
13. **Instalaciones/Expansion** (6 zones) - Capacity + income per zone, construction timers (3min-2h), buy property option
14. **VIP Members** (16 types) - Spawn every 4-7 min, show detailed req status (met/unmet)
15. **Supplements** (12 types) - Temporary buffs with tolerance system: repeated use in same game day reduces effectiveness (4 levels: 100%→85%→65%→45%). Tolerance decays 1 level per game day of inactivity. No paying to skip — must wait.
16. **Rival Gyms** (6 NPCs) - Steal members passively, promo (temp) or defeat (permanent bonus), costs scale with level
17. **Leaderboard** - Firebase-synced global ranking by total money earned, in Prestige tab
18. **Staff Training** - Level up staff with money + time, each level boosts their effect
19. **Equipment Breakdown** - Random breakdowns, repair costs money + time, cleaner reduces chance
20. **Construction Timers** - Equipment upgrades (20s * level) and zone building take real time
21. **Champion** - Recruit a fighter (name only, no visual). RPG stat sheet with 6 trainable stats: Fuerza (prize boost), Resistencia (reduces fatigue from competing), Velocidad (win chance), Técnica (prize/rep mult), Stamina (fatigue recovery speed), Mentalidad (win bonus vs hard opponents). Fatigue system: train=+25, compete=+35. At fatigue≥75 (AGOTADO), can't act. No paying to rest — time is the only recovery. Equipment (8 items, 4 slots). Persists through prestige.
22. **Tab Walkthroughs** - First-visit blocking modal for 15 tabs. Explains system, shows 3-5 tips, links to wiki section. Tracked in `game.tabsSeen`. Only fires after tutorial is done.
23. **Wiki** - In-game knowledge base tab (📖). 17 collapsible sections covering all game systems. Full-text search. Accessible from walkthroughs or directly from sidebar. `renderWiki()` + `searchWiki()` + `toggleWikiSection()` in systems.js.
24. **Offline Progression** - `calculateOfflineProgress()` in game.js. Cap 8 hours. Processes: net income, all timer completions, marketing campaigns, passive rep, auto-members, champion fatigue recovery. Shows detailed modal (`showOfflineReport()`) with economy/construction/marketing/growth/champion sections.
25. **Balance Panel** - SimCity-style financial overview modal. `openBalancePanel()` / `renderBalancePanel()` in systems.js. Shows: income breakdown per equipment/zone/rival, all multipliers (skills, staff, members, prestige, supplements, decoration), expense breakdown per staff salary/rent/utilities/campaigns, net income /s, daily projection.

## Home Tab Stats
- Stats grid shows 6 boxes: Ingreso Neto /seg, Gastos Totales /seg, Miembros (actual/cap), Reputación, Total Ganado, Categoría
- All monetary stats unified to per-second display
- "📊 Balance Contable" button opens detailed financial breakdown modal
- `getCampaignCostsPerSecond()` helper includes always-on campaign costs in total expenses

## Balance & Economy
- XP curve: `100 * 1.55^(level-1)` — slower progression
- Operating costs: base rent ($250/day) + zone rent ($300/zone/day) + utilities ($20/equip level/day)
- Property purchase ($8M, lvl 18) eliminates rent
- Equipment level capped at player level
- Equipment baseCost scales exponentially by tier: $50 (dumbbells) → $200 → $600 → $1.5K → $4K → $10K → $25K → $75K → $180K → $450K → $1.2M → $3.5M (spa). costMult also increases for higher tiers (1.85→2.5).
- Event costs scale: `max(levelScale, income * 0.5)` — scales with actual income/s
- Supplement costs scale: +15% per level above requirement
- Rival costs scale: +20% per level above requirement
- Game day = 600 ticks = 10 min real time
- Timers auto-refresh every 2 seconds in game tick
- Zone costs: $50K (1st floor) to $15M (arena)
- Skill tree costs: $2.5K to $15M, levels 3-25
- Construction: equipment 20s*level, zones 3min-2h
- Chaos: 0.3% equipment breakdown/30s, 0.5% staff illness/60s
- Class costs scale +15%/level, rewards scale +20%/level with quality bonus
- Instructor hire costs: $300 (yoga) to $25K (swimming), upgrade cost = hireCost * level * 2.5
- Instructor commission: 15% of gross class income, deducted on completion
- Champion fatigue recovery: `2 + floor(stamina * 0.5)` points per 30 ticks
- Neighborhood unlock costs: $0 (Palermo) → $500K (La Boca) → $800K (Caballito) → $1.5M (Belgrano) → $3M (Recoleta) → $5M (San Telmo)
- Neighborhood rent multipliers: 0.6 (La Boca) to 1.8 (Recoleta)
- Inactive branch income: 50% of active rate, no chaos events
- Franchise stars: `floor(sqrt(empireTotalEarned / 2000000))`, each star = +25% income mult

## Skill Tree Branches (6)
1. **Equipment** (🔧) - Cost reduction, income boost, capacity, mastery, breakdown resistance
2. **Marketing** (📢) - Campaign members, duration, rep, cost reduction, rival steal reduction
3. **Staff** (👥) - Effect boost, rep generation, synergy, cost/auto-members, illness resistance
4. **Members** (💰) - Member rep, retention, VIP rewards, income mastery, member attraction
5. **Infrastructure** (🏗️) - Zone cost, build speed, repair speed, equip upgrade speed, concurrent upgrades
6. **Competitions** (🏆) - Win chance, cooldown, rewards, rep from comps, XP from comps

## Sidebar Tabs (17)
| Category | Tab ID | Label |
|----------|--------|-------|
| General | gym | 🏠 Gimnasio |
| General | missions | 📋 Misiones |
| General | achievements | 🎖️ Logros |
| General | profile | 👤 Perfil |
| Operaciones | equipment | 🏋️ Máquinas |
| Operaciones | staff | 👥 Staff |
| Operaciones | classes | 🧘 Clases |
| Operaciones | supplements | 🧃 Suplementos |
| Crecimiento | marketing | 📢 Marketing |
| Crecimiento | expansion | 🏗️ Instalaciones |
| Crecimiento | skills | 🔬 Mejoras |
| Competencia | champion | 🏆 Competencias |
| Competencia | rivals | 🏪 Rivales |
| Competencia | vip | ⭐ VIP |
| Sistema | prestige | 🏙️ Ciudad |
| Sistema | settings | ⚙️ Opciones |
| Sistema | wiki | 📖 Wiki |

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

## Cache Busting
- Script tags in index.html use `?v=XX` query string (e.g. `js/game.js?v=24`)
- Increment the version number on every deploy that changes JS/CSS so browsers don't serve stale files
- Current version: **v=33**
- Update all 5 script tags together (data, game, ui, systems, auth)

## Planned Improvements (by priority)
### Phase 4 - Social & Meta
- Training programs (assign routines to members)
- Seasonal competition leagues

### Phase 5 - Polish & Endgame
- Multiple simultaneous branches (evolved prestige)
- Sound effects & music
- Income/growth charts
