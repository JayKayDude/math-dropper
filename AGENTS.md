# Math Dropper

**Description:** 3D falling dropper game where barriers are defined by math inequalities (Three.js + Vite)
**Framework:** AI Coding Methods v2.28.0
**Mode:** Standard

## Session Start

1. Read `SESSION-STATE.md` — current position, quick reference, next actions
2. Read `PROJECT-MEMORY.md` — decisions, constraints, gotchas
3. Read `LEARNING-LOG.md` — active lessons
4. Run dev server to verify baseline: `npm run dev`

## Key Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Project Structure

```
Math Dropper/
├── index.html                  # Entry point, HUD elements, spin icon CSS
├── package.json
├── public/
│   └── audio/
│       ├── Glass Pulse.mp3     # Background track 1
│       └── Glass Pulse 2.mp3  # Background track 2
├── src/
│   ├── main.js                 # Game loop, state machine, collision handling
│   ├── scene.js                # Three.js scene, camera, post-processing
│   ├── shaft.js                # Tunnel rings, corner lines, wall planes
│   ├── player.js               # Player sphere factory (supports 1P and 2P)
│   ├── barrier.js              # Barrier mesh, shader, collision, spin
│   ├── barrierManager.js       # Pool management, spawn, floor tracking
│   ├── mathFunctions.js        # isSolid(), GLSL snippets, equationString()
│   ├── difficulty.js           # getDifficulty(), unlock schedule
│   ├── hud.js                  # Score, equation display, player labels
│   ├── screens.js              # Start, retry, pause, countdown, settings overlays
│   ├── input.js                # Keyboard state, dynamic keymaps, rebuildInputMaps()
│   ├── settings.js             # Keybind + volume persistence (localStorage)
│   ├── audio.js                # Web Audio SFX + cycling background music
│   ├── particles.js            # Death explosion particle system
│   └── config.js               # Shared constants
├── SESSION-STATE.md
├── PROJECT-MEMORY.md
├── LEARNING-LOG.md
├── AGENTS.md
├── CLAUDE.md
└── COMPLETION-CHECKLIST.md
```
