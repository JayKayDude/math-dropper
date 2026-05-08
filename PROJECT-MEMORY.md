# Project Memory

**Memory Type:** Semantic (accumulates)
**Lifecycle:** Grows with project per §7.0.4
**Project:** Math Dropper
**Created:** 2026-05-04
**Updated:** 2026-05-07

---

## Phase Gates

| Gate | Status | Date | Notes |
|------|--------|------|-------|
| Specify | Complete | 2026-05-04 | Full design spec locked |
| Plan | Complete | 2026-05-04 | Architecture planned |
| Implement | Complete | 2026-05-05 | Full game shipped |
| Validate | Complete | 2026-05-05 | Playtesting and tuning done |
| Polish | Complete | 2026-05-07 | Audio, settings, barrier fixes, HUD improvements |

---

## Spec Summary

**Genre:** 3D fixed-camera dropper (web game)

**Core mechanic:** Player navigates a vertical shaft top-down. Periodic barriers cross the shaft. Each barrier has a gap region defined by a math inequality. The player must be inside the gap when the barrier reaches player level.

**Visual style:** Tron-inspired — dark obsidian shaft, red glowing barriers, cyan player orb, bloom post-processing.

---

## Key Decisions

### Audio Architecture (2026-05-07)
- `audio.init()` sets up SFX only (AudioContext, masterGain, reverb, bgGain) — safe to call on first button click
- `audio.startMusic()` loads and starts background music — called when game run begins, not on page load
- This allows button click SFX on start screen without triggering music prematurely
- Background music: Web Audio `AudioBufferSourceNode` with `loop=false`, cycling via `onended` between multiple tracks
- Gapless cycling: `findLoopPoints()` scans decoded PCM for first/last non-silent sample to trim LAME encoder padding
- Music ducks on pause/death via `bgGain` ramp; `_ducked` flag ensures unmuting restores the correct volume level
- SFX (countdown, death, button click) use Web Audio synthesis, routed through `masterGain`
- Button click: 1200Hz sine, 45ms, gain 0.3 — distinct from 660Hz countdown beep

### Settings Persistence (2026-05-07)
- `src/settings.js` is pure data module — no imports from other game files
- Single localStorage key `mathDropper_settings` stores keybinds + musicVolume + sfxVolume
- Deep-merged with defaults on load so new fields added later don't break existing saves
- Input maps rebuilt via `rebuildInputMaps()` in input.js whenever keybinds change

### Keybind System (2026-05-07)
- Three slots: `p1Primary`, `p1Secondary`, `p2`
- `keys` (1P combined) uses getter properties: `up = p1Primary.up || p1Secondary.up` etc.
- `keysWASD = keysP1Primary`, `keysArrows = keysP2` — backward-compat aliases, main.js unchanged
- Click-to-capture UI: click button → listens on `keydown` (capture phase, stopPropagation) → saves on any key, Escape to cancel
- Only one capture active at a time; opening a second cancels the first

### Barrier Asymptote Fixes (2026-05-07)
- `RATIONAL_NEG` (y > a/x, a<0): at `|x|<0.001` returns `a < 0` (true = solid). Asymptote IS a wall; separate GLSL snippet renders it as solid with glow.
- `RATIONAL_NEG_INV` (y < a/x, a<0): at `|x|<0.001` returns `a > 0` (false = open). Separate GLSL snippet discards at asymptote. Fixed invisible kill at player spawn position (x=0).
- `RATIONAL_INV` (y < a/x, a>0): returns `true` at asymptote — correct, wall exists here.
- `RATIONAL` (y > a/x, a>0): returns `false` at asymptote — correct, passage through center.
- Root cause of kill line: shared cases between NEG and non-NEG variants meant the sign of `a` was ignored.

### Spinning Barriers (2026-05-05 / updated 2026-05-07)
- Spin is coordinate-frame rotation, not parameter change — `uAngle` uniform rotates x/z in shader before function evaluation
- Collision check rotates player position into barrier frame before calling `isSolid`
- HUD equation shows the unrotated function (mathematically it's a rotated conic, not expressible cleanly) with an animated ↻ icon when `spinSpeed !== 0`

### Equation HUD Tracking (2026-05-06)
- `getCurrentEquation()` uses `Math.abs(b.y - BARRIER_Y_PLAYER) + (b.passed ? 1000 : 0)` as sort key
- Returns `{ text, spinning }` object — `updateEquation` in hud.js uses `innerHTML` to inject spin icon span
- While a barrier approaches it wins naturally (distance → 0). The instant it scores (`b.passed = true`) it gets +1000 penalty so the next barrier takes over immediately

### ABS Passability Fix (2026-05-06)
- `ABS_INV` (solid = z < a|x-h|+k, a>0): gap shrinks outward — `kCeil = (1-a)*10 - 3 - animAmplitude*0.6`
- `ABS_NEG` (solid = z > a|x-h|+k, a<0): gap shrinks outward — `kFloor = (|a|-1)*10 + 3 + animAmplitude*0.6`
- Analytical proof + 3,682-test simulation confirms zero impossible frames across all 30 FuncTypes

### Math Function System
- 30 FuncTypes across 15 pairs (rational, linear, quadratic, cubic, abs, circle, sine, exponential, logarithmic — all with positive/negative/inv variants)
- GLSL snippets each set `solid` (bool) and `d_curve` (float) — template pre-declares both
- Coordinate rotation for spinning: `uAngle` uniform rotates x/z before snippet evaluates
- RATIONAL_NEG and RATIONAL_NEG_INV have dedicated GLSL snippets (different asymptote behavior from non-NEG variants)

### Passability Guard
- Per-frame binary search prevents animation from creating impossible gaps
- `isPassable()`: 10×10 grid + 4-neighbor clearance at PLAYER_RADIUS×1.5
- If ideal h/k fails: binary search between current (valid) and ideal (invalid)

### Spawn Logic
- Always spawn at `lowestActive - _spacing`, NOT a tracked nextSpawnY offset
- Old nextSpawnY caused a multi-second gap after first pool cycle (floor 5 bug)

### Difficulty Curve
- Speed: `BASE * (1 + 0.01f + 0.0005f²)` capped at 100 — ~1% at floor 1, caps ~floor 80
- Spacing: 55→40 linearly over 50 floors
- Player speed: same quadratic formula at 80% rate, capped at 25

### High Score
- 1P: localStorage `mathDropper_highScore`
- 2P: localStorage `mathDropper_highScore2P` = max(score1, score2)
- Saved on death; shown on start, retry, and pause screens

### 2-Player Mode
- `createPlayer(color, startX)` factory in player.js — no singleton
- Camera zooms out to Y=22 when both alive, lerps back to Y=13 on first death (CAM_Y_LERP=1.2)
- Game ends only when both players dead; individual death triggers explosion + HUD label update

### Particle System
- Single 120-particle pool; `explode()` uses second half (60-119) on simultaneous deaths
- `mat.opacity` always reset to 1 on any new `explode()` call — fixes invisible explosion when previous particles still fading

---

## Repository

- GitHub: https://github.com/JayKayDude/math-dropper
- Main branch: `main`
- Build: `npm run build` (Vite → dist/)
- Deploy: Vercel (auto-detect Vite, no config needed)
