# Session State

**Last Updated:** 2026-05-07
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
| Controls | Configurable via Settings panel (defaults: P1 WASD, P2 arrows) |

## Session Summary

- 2026-05-04: Full design spec locked. Repo initialized and pushed to GitHub.
- 2026-05-05: Full game implemented and polished. 2-player co-op mode added. Dynamic camera zoom for 2P.
- 2026-05-06: ABS_NEG and ABS_INV impossibility bug fixed. Full 30-type passability audit — zero failures. Equation HUD tracking fixed.
- 2026-05-06: Audio system added (Web Audio SFX + HTML Audio music). Settings panel added (keybinds, volume sliders). 2P death sound and simultaneous explosion bugs fixed.
- 2026-05-07: Gapless music looping (BufferSource, findLoopPoints). Music cycles between two tracks. Shaft doubled lines. Barrier asymptote kill line fixes. Spinning barrier ↻ HUD icon. Click-to-capture keybinds. Button click SFX. Settings-screen SFX without music.

## Current State

Game is fully playable with 1P and 2P modes. All features complete:

**Core**
- 30 FuncTypes, animated tunnel, floaty player, dynamic difficulty, passability guard
- 2-player co-op: cyan (WASD) + yellow (arrows), independent collision, shared barrier stream
- Camera zooms out (Y=22) when both players alive, lerps back to Y=13 on first death
- Separate high scores: 1P and 2P; shown on start, retry, and pause screens

**Audio**
- Background music cycles between Glass Pulse.mp3 and Glass Pulse 2.mp3 (gapless via BufferSource + findLoopPoints)
- Music starts only when a game run begins; SFX available immediately on start screen
- Death SFX: noise burst + descending sweep
- Countdown beeps (660Hz 3/2/1, 990Hz GO!)
- Button click SFX (1200Hz tick) on all interactive buttons
- Music ducks on pause/death; restores on resume
- Mute toggle persists via localStorage
- Music and SFX volume independently controlled via settings sliders

**Settings Panel**
- Accessible from start and retry screens via SETTINGS button
- Per-direction click-to-capture keybind assignment (P1 Primary, P1 Secondary, P2)
- Music and SFX volume sliders with live preview
- All settings persist via localStorage (`mathDropper_settings`)

**Barriers**
- Spinning barriers show animated ↻ icon next to HUD equation
- RATIONAL_NEG_INV and RATIONAL_NEG asymptote dead zones corrected (no invisible kill lines)
- Shaft ring and corner lines doubled for visibility on low-contrast displays

## Next Actions

- Deploy to Vercel
- Potential: mobile/touch controls, additional function types, leaderboard
