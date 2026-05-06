# Project Memory

**Memory Type:** Semantic (accumulates)
**Lifecycle:** Grows with project per §7.0.4
**Project:** Math Dropper
**Created:** 2026-05-04
**Updated:** 2026-05-05

---

## Phase Gates

| Gate | Status | Date | Notes |
|------|--------|------|-------|
| Specify | Complete | 2026-05-04 | Full design spec locked |
| Plan | Complete | 2026-05-04 | Architecture planned |
| Implement | Complete | 2026-05-05 | Full game shipped |
| Validate | Complete | 2026-05-05 | Playtesting and tuning done |
| Polish | Complete | 2026-05-05 | 2P mode, high score, screens, camera zoom |

---

## Spec Summary

**Genre:** 3D fixed-camera dropper (web game)

**Core mechanic:** Player navigates a vertical shaft top-down. Periodic barriers cross the shaft. Each barrier has a gap region defined by a math inequality. The player must be inside the gap when the barrier reaches player level.

**Visual style:** Tron-inspired — dark obsidian shaft, red glowing barriers, cyan player orb, bloom post-processing.

---

## Key Decisions

### Equation HUD Tracking (2026-05-06)
- `getCurrentEquation()` uses `Math.abs(b.y - BARRIER_Y_PLAYER) + (b.passed ? 1000 : 0)` as sort key
- While a barrier approaches it wins naturally (distance → 0). The instant it scores (`b.passed = true`, same frame floor increments) it gets +1000 penalty so the next barrier takes over immediately
- Equation and floor counter update at the exact same moment
- Previous bugs: original code switched at y=0 (before floor increment), absolute-closest switched at midpoint (too late)

### ABS Passability Fix (2026-05-06)
- `ABS_INV` (solid = z < a|x-h|+k, a>0): gap shrinks outward — at `|x-h|=10`, gap only exists if `k < (1-a)*10`. For large `a`, k must be negative.
  - Fix: `kCeil = (1-a)*10 - 3 - animAmplitude*0.6`; k spawns at or below kCeil.
- `ABS_NEG` (solid = z > a|x-h|+k, a<0): gap shrinks outward — at `|x-h|=10`, gap only exists if `k > (|a|-1)*10`.
  - Fix: `kFloor = (|a|-1)*10 + 3 + animAmplitude*0.6`; k spawns at or above kFloor.
- Analytical proof + 3,682-test simulation confirms zero impossible frames across all 30 FuncTypes, all floor levels, full animation cycles.
- Other 28 types were already safe: their gaps open outward from center, split the playfield in halves, or use bounded shapes.

### Math Function System
- 30 FuncTypes across 15 pairs (rational, linear, quadratic, cubic, abs, circle, sine, exponential, logarithmic — all with positive/negative/inv variants)
- GLSL snippets each set `solid` (bool) and `d_curve` (float) — template pre-declares both
- Coordinate rotation for spinning: uAngle uniform rotates x/z before snippet evaluates

### Passability Guard
- Per-frame binary search prevents animation from creating impossible gaps
- isPassable(): 10×10 grid + 4-neighbor clearance at PLAYER_RADIUS×1.5
- If ideal h/k fails: binary search between current (valid) and ideal (invalid)

### Spawn Logic
- Always spawn at `lowestActive - _spacing`, NOT a tracked nextSpawnY offset
- Old nextSpawnY caused a multi-second gap after first pool cycle (floor 5 bug)

### Difficulty Curve
- Speed: `BASE * (1 + 0.01f + 0.0005f²)` capped at 100 — ~1% at floor 1, caps ~floor 80
- Spacing: 55→40 linearly over 50 floors — very gentle decrease
- Player speed: same quadratic formula at 80% rate, capped at 25

### Equation Display
- equationString() uses LIVE animated params — must show h, k, b when non-trivial
- Suppress near-zero terms (|k|<0.05, |h|<0.05) to avoid "+ 0.00" clutter

### High Score
- 1P: localStorage `mathDropper_highScore`
- 2P: localStorage `mathDropper_highScore2P` = max(score1, score2)
- Saved on death; shown on start, retry, and pause screens

### 2-Player Mode
- `createPlayer(color, startX)` factory in player.js — no singleton
- input.js exports `keysWASD`, `keysArrows`, and combined `keys` (1P uses combined)
- Camera zooms out to Y=22 when both alive, lerps back to Y=13 (CAM_Y_LERP=1.2) on first death
- Game ends only when both players dead; individual death triggers explosion + HUD label update
- Clickable mode buttons (not keyboard) on start/retry screens — `pointer-events:auto` on buttons only

---

## Repository

- GitHub: https://github.com/JayKayDude/math-dropper
- Main branch: `main`
- Build: `npm run build` (Vite → dist/)
- Deploy: Vercel (auto-detect Vite, no config needed)
