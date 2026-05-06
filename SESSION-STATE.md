# Session State

**Last Updated:** 2026-05-05
**Memory Type:** Working (transient)
**Lifecycle:** Prune at session start per §7.0.4

---

## Current Position

- **Phase:** Polish / done
- **Mode:** Standard
- **Active Task:** —

## Quick Reference

| Metric | Value |
|--------|-------|
| Project | **Math Dropper** |
| Stack | Three.js + Vite (vanilla JS) |
| Repo | https://github.com/JayKayDude/math-dropper |
| Score | Floor count (barriers cleared) |
| Controls | P1: WASD (or arrows in 1P) · P2: Arrow keys |

## Session Summary

- 2026-05-04: Full design spec locked. Repo initialized and pushed to GitHub.
- 2026-05-05: Full game implemented and polished. 2-player co-op mode added. Dynamic camera zoom for 2P.

## Current State

Game is fully playable with 1P and 2P modes. All features complete:
- 30 FuncTypes, animated tunnel, floaty player, dynamic difficulty, passability guard
- 2-player co-op: cyan (WASD) + yellow (arrows), independent collision, shared barrier stream
- Camera zooms out (Y=22) when both players alive, lerps back to Y=13 when one dies (CAM_Y_LERP=1.2)
- Clickable 1 PLAYER / 2 PLAYER buttons on start and retry screens
- Separate high scores: 1P (mathDropper_highScore) and 2P (mathDropper_highScore2P)
- High score shown on start, retry, and pause screens
- Any-key resume from pause (Esc to pause)
- Equation HUD shows all animated parameters live
- Vercel-ready (Vite static build, no backend)

## Next Actions

- Deploy to Vercel
- Potential: mobile/touch controls, sound
