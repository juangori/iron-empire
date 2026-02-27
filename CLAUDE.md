# Iron Empire - Gym Tycoon Browser Game

## Project Overview
Browser-based idle/tycoon gym game. Free, no pay-to-win. All text in Argentine Spanish.
Deployed on GitHub Pages (static files only, no backend).
Repo: https://github.com/juangori/iron-empire
Live: https://juangori.github.io/iron-empire/

## Tech Stack
- Pure HTML/CSS/JS (no frameworks, no build step)
- localStorage for saves
- GitHub Pages for hosting

## File Structure
```
index.html          - Main HTML structure, loads all scripts
css/styles.css      - All styles (CSS variables, responsive)
js/data.js          - Game data definitions (equipment, staff, competitions, achievements, classes, marketing campaigns, random events, daily missions, tutorial steps, daily bonus rewards)
js/game.js          - Core engine: game state, save/load, tick loop, game actions (buy equipment, hire staff, enter competition, prestige), utility functions
js/ui.js            - All UI rendering functions (equipment grid, staff grid, competitions, achievements, log, updateUI)
js/systems.js       - Engagement systems: daily bonus with streak, daily missions (3/day), random events with choices, tutorial walkthrough, gym classes, marketing campaigns, tab notifications
```

## Architecture Notes
- Game state is a single global `game` object (defined in game.js)
- Data definitions are global constants (EQUIPMENT, STAFF, COMPETITIONS, etc. in data.js)
- Game loop runs via `setInterval(gameTick, 1000)` - one tick per second
- All rendering functions follow pattern: `renderXxx()` reads from `game` state and writes innerHTML
- Save system: auto-save every 30 ticks to localStorage, deep merge on load to preserve new defaults
- Offline earnings calculated on load (capped at 2 hours)

## Key Game Systems
1. **Equipment** (12 items) - Buy/upgrade, each gives income/members/capacity
2. **Staff** (8 types) - One-time hire, passive bonuses (income mult, auto-members, rep, cost reduction)
3. **Competitions** (6 tiers) - Win chance + cooldown, rewards money/rep/XP
4. **Achievements** (24) - Auto-checked conditions, grant XP
5. **Prestige/Franchise** - Reset for permanent income multiplier stars
6. **Daily Bonus** - 7-day streak cycle with escalating rewards
7. **Daily Missions** (3/day) - Random from pool of 8 types, progress tracking, bonus for completing all 3
8. **Random Events** (every 3-6 min) - 10 events with player choices and consequences
9. **Gym Classes** (8 types) - Real-time duration + cooldown, reward on completion
10. **Marketing Campaigns** (7 tiers) - Spend money for temporary member/rep boost
11. **Tutorial** - 10-step interactive walkthrough for new players

## Development Conventions
- Language: All UI text in Argentine Spanish (vos form: "comprá", "mejorá", "elegí")
- No emojis in code comments, only in game UI
- Functions use camelCase
- CSS uses BEM-ish naming with kebab-case
- No external dependencies - everything is vanilla JS
- Game must work as static files (GitHub Pages compatible)
- No pay-to-win mechanics ever

## Git Workflow
- Single branch: main
- Push to main auto-deploys to GitHub Pages
- Use gh CLI for GitHub operations (installed at "C:\Program Files\GitHub CLI\gh.exe")
- PATH needs: `export PATH="$PATH:/c/Program Files/GitHub CLI"`

## Planned Future Features (by priority)
### Phase 3 - Content Depth
- Member VIP system (special members with requests)
- Rival NPC gyms competing for members
- Building expansion (floors/zones)
- Training programs
- Seasonal competition leagues

### Phase 4 - Social & Meta
- Leaderboard (needs backend - Firebase or similar)
- Player profiles with stats/badges
- Gym decoration/customization
- Supplement shop
- Skill/research tree

### Phase 5 - Polish & Endgame
- Multiple simultaneous branches (evolved prestige)
- Sound effects & music
- Animated gym visual with members
- Income/growth charts
- Dark/light mode toggle
