const scoreEl    = document.getElementById('score');
const equationEl = document.getElementById('equation');

let p1Label = null, p2Label = null;

export function updateScore(n) { scoreEl.textContent = n; }
export function updateEquation({ text, spinning }) {
  equationEl.innerHTML = spinning
    ? `${text} <span class="spin-icon">↻</span>`
    : text;
}
export function initEquation(str) { equationEl.textContent = str; }

export function setTwoPlayerMode(enabled) {
  if (enabled && !p1Label) {
    const hud = document.getElementById('hud');

    p1Label = document.createElement('div');
    p1Label.style.cssText = `
      position:absolute;top:24px;left:32px;
      color:#00ffee;font-size:16px;letter-spacing:3px;
      text-shadow:0 0 10px #00ffee;font-family:monospace;
    `;
    p1Label.textContent = 'P1';
    hud.appendChild(p1Label);

    p2Label = document.createElement('div');
    p2Label.style.cssText = `
      position:absolute;top:24px;right:32px;
      color:#ffee00;font-size:16px;letter-spacing:3px;
      text-shadow:0 0 10px #ffee00;font-family:monospace;
    `;
    p2Label.textContent = 'P2';
    hud.appendChild(p2Label);
  } else if (!enabled) {
    if (p1Label) { p1Label.remove(); p1Label = null; }
    if (p2Label) { p2Label.remove(); p2Label = null; }
  }
}

export function setPlayerAlive(player, alive) {
  const el = player === 1 ? p1Label : p2Label;
  if (!el) return;
  el.style.opacity = alive ? '1' : '0.3';
  el.textContent   = alive ? (player === 1 ? 'P1' : 'P2')
                           : (player === 1 ? 'P1 ✕' : 'P2 ✕');
}
