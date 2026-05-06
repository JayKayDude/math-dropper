const overlayStyle = `
  position:fixed;top:0;left:0;width:100%;height:100%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:rgba(0,0,0,0.75);color:#ff2244;font-family:monospace;
  pointer-events:none;
`;

// ── Start screen ──────────────────────────────────────────────────────────────
const startEl = document.createElement('div');
startEl.style.cssText = overlayStyle;
startEl.innerHTML = `
  <div style="font-size:48px;letter-spacing:8px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:40px">MATH DROPPER</div>
  <div id="start-best" style="font-size:22px;letter-spacing:5px;opacity:0.85;margin-bottom:24px;display:none;text-shadow:0 0 12px #ff2244">BEST · <span id="start-best-num">0</span> FLOORS</div>
  <div style="font-size:18px;letter-spacing:4px;opacity:0.7">PRESS ANY KEY TO START</div>
  <div style="font-size:13px;letter-spacing:2px;opacity:0.75;margin-top:32px">MOVE · WASD OR ARROW KEYS</div>
`;

// ── Retry screen ──────────────────────────────────────────────────────────────
const retryEl = document.createElement('div');
retryEl.style.cssText = overlayStyle + 'display:none;';
retryEl.innerHTML = `
  <div id="retry-floor" style="font-size:64px;letter-spacing:6px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:16px">0</div>
  <div style="font-size:16px;letter-spacing:4px;opacity:0.5;margin-bottom:16px">FLOORS</div>
  <div id="retry-best" style="font-size:22px;letter-spacing:5px;opacity:0.85;margin-bottom:40px;text-shadow:0 0 12px #ff2244">BEST · <span id="retry-best-num">0</span></div>
  <div style="font-size:18px;letter-spacing:4px;opacity:0.7">PRESS ANY KEY TO RETRY</div>
`;

// ── Countdown overlay ─────────────────────────────────────────────────────────
const countdownEl = document.createElement('div');
countdownEl.style.cssText = `
  position:fixed;top:0;left:0;width:100%;height:100%;
  display:none;align-items:center;justify-content:center;
  pointer-events:none;
`;
const countdownNum = document.createElement('div');
countdownNum.style.cssText = `
  font-size:160px;font-family:monospace;color:#ff2244;
  text-shadow:0 0 30px #ff2244,0 0 80px #ff2244,0 0 120px #ff2244;
  letter-spacing:8px;line-height:1;
`;
countdownNum.textContent = '3';
countdownEl.appendChild(countdownNum);

// ── Pause screen ──────────────────────────────────────────────────────────────
const pauseEl = document.createElement('div');
pauseEl.style.cssText = overlayStyle + 'display:none;';
pauseEl.innerHTML = `
  <div style="font-size:48px;letter-spacing:10px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:32px">PAUSED</div>
  <div id="pause-best" style="font-size:22px;letter-spacing:5px;opacity:0.85;margin-bottom:32px;text-shadow:0 0 12px #ff2244">BEST · <span id="pause-best-num">0</span></div>
  <div style="font-size:16px;letter-spacing:4px;opacity:0.6">PRESS ANY KEY TO RESUME</div>
`;

document.body.append(startEl, retryEl, countdownEl, pauseEl);

export function showStart(highScore) {
  const bestEl = document.getElementById('start-best');
  if (highScore > 0) {
    document.getElementById('start-best-num').textContent = highScore;
    bestEl.style.display = 'block';
  } else {
    bestEl.style.display = 'none';
  }
  startEl.style.display = 'flex';
}
export function hideStart() { startEl.style.display = 'none'; }

export function showRetry(score, highScore, isNewBest) {
  document.getElementById('retry-floor').textContent = score;
  const bestEl  = document.getElementById('retry-best');
  const bestNum = document.getElementById('retry-best-num');
  bestNum.textContent = highScore;
  bestEl.innerHTML = isNewBest
    ? `NEW BEST · <span style="text-shadow:0 0 20px #ff2244,0 0 40px #ff2244">${highScore}</span>`
    : `BEST · ${highScore}`;
  retryEl.style.display = 'flex';
}
export function hideRetry() { retryEl.style.display = 'none'; }

export function showCountdown(label) {
  countdownNum.textContent = label;
  countdownEl.style.display = 'flex';
}
export function hideCountdown() { countdownEl.style.display = 'none'; }

export function showPause(liveHighScore) {
  document.getElementById('pause-best-num').textContent = liveHighScore;
  pauseEl.style.display = 'flex';
}
export function hidePause() { pauseEl.style.display = 'none'; }
