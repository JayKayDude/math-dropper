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
| Polish | Complete | 2026-05-05 | High score, screens, keybinds, equation display |

---

## Spec Summary

**Genre:** 3D fixed-camera dropper (web game)

**Core mechanic:** Player navigates a vertical shaft top-down. Periodic barriers cross the shaft. Each barrier has a gap region defined by a math inequality. The player must be inside the gap when the barrier reaches player level.

**Visual style:** Tron-inspired — dark obsidian shaft, red glowing barriers, cyan player orb, bloom post-processing.

---

## Key Decisions

### Math Function System
- 30 FuncTypes across 15 pairs (rational, linear, quadratic, cubic, abs, circle, sine, exponential, logarithmic — all with positive/negative/inv variants)
- GLSL snippets each set `solid` (bool) and `d_curve` (float) — template pre-declares both
- Coordinate rotation for spinning: uAngle uniform rotates x/z before snippet evaluates — works for all 30 types

### Passability Guard
- Per-frame binary search prevents animation from creating impossible gaps
- isPassable(): 10×10 grid + 4-neighbor clearance at PLAYER_RADIUS×1.5
- If ideal h/k fails: binary search between current (valid) and ideal (invalid) — no lerp, no stutter

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
- xh helper: `(x-h)` or `(x+|h|)` with correct sign

### High Score
- Stored in localStorage under key `mathDropper_highScore`
- Saved on death only; displayed on start, retry, and pause screens
- Pause screen shows `max(storedHighScore, barriers.floor)` so it reflects in-run best
- NEW BEST glow effect on retry screen when score === highScore && score > 0

---

## Repository

- GitHub: https://github.com/JayKayDude/math-dropper
- Main branch: `main`
- Build: `npm run build` (Vite → dist/)
- Deploy: Vercel (auto-detect Vite, no config needed)
