# Learning Log

**Memory Type:** Episodic (experiences)
**Lifecycle:** Graduate to methods when pattern emerges per §7.0.4

> **Entry rules:** Each entry ≤5 lines. State what happened, then the actionable rule.
> Record conclusions, not evidence. If it wouldn't change future behavior, it doesn't belong here.
> Route other content: decisions → PROJECT-MEMORY, architecture → AGENTS.md

---

## Active Lessons

- **2026-05-04:** MCP server scaffold/install_agent writes files inside the Docker container at `/app/`, not the host project dir. Must use `docker cp` to extract files after scaffolding/installing agents.

- **2026-05-04:** ai-governance S-Series keyword matching produces false positives on game project names (flagged "drop" in "Math Dropper"). Safe to override when the trigger is clearly a keyword false positive with no real safety concern.

- **2026-05-07:** `HTMLAudioElement.loop` has a gap on loop due to the browser's media pipeline. `AudioBufferSourceNode.loop` with `loopStart`/`loopEnd` set from `findLoopPoints()` is required for gapless looping. Always prefer Web Audio for game music.

- **2026-05-07:** When GLSL snippets are shared between positive and negative `a` variants (e.g. RATIONAL and RATIONAL_NEG), asymptote dead zone behavior diverges. Give NEG variants their own snippet rather than adding sign checks inside shared snippets — the code stays readable and the cases are genuinely different shapes.

- **2026-05-07:** `AudioContext` starts in `suspended` state on Chrome/Safari. Always call `ctx.resume()` immediately after `new AudioContext()` in the user-gesture handler, not later. Forgetting this causes silent audio on Safari with no error.

- **2026-05-07:** `cancelScheduledValues(t)` cancels scheduled automation but does NOT snapshot the current interpolated value — `gain.value` reflects the last explicit set, not the current ramp position. Always follow cancel with `setValueAtTime(gain.value, t)` to anchor correctly before a new ramp.

---

## Graduated Patterns

| Pattern | Graduated To | Date |
|---------|-------------|------|
| | | |
