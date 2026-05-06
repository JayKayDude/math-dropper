// Inject button styles once
const btnCSS = document.createElement('style');
btnCSS.textContent = `
  .mode-btn {
    background: transparent;
    border: 2px solid #ff2244;
    color: #ff2244;
    font-family: monospace;
    font-size: 18px;
    letter-spacing: 4px;
    padding: 16px 40px;
    cursor: pointer;
    margin: 8px 16px;
    transition: background 0.15s, text-shadow 0.15s;
  }
  .mode-btn:hover {
    background: rgba(255,34,68,0.15);
    text-shadow: 0 0 12px #ff2244, 0 0 24px #ff2244;
  }
`;
document.head.appendChild(btnCSS);

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
  <div style="font-size:48px;letter-spacing:8px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:32px">MATH DROPPER</div>
  <div id="start-best" style="font-size:22px;letter-spacing:5px;opacity:0.85;margin-bottom:28px;text-shadow:0 0 12px #ff2244;display:none"></div>
  <div style="display:flex;pointer-events:auto;margin-bottom:28px">
    <button class="mode-btn mode-btn-1p">1 PLAYER</button>
    <button class="mode-btn mode-btn-2p">2 PLAYER</button>
  </div>
  <div style="font-size:13px;letter-spacing:2px;opacity:0.75;margin-top:4px">
    P1 · WASD &nbsp;&nbsp;·&nbsp;&nbsp; P2 · ARROW KEYS
  </div>
`;

// ── Retry screen ──────────────────────────────────────────────────────────────
const retryEl = document.createElement('div');
retryEl.style.cssText = overlayStyle + 'display:none;';
retryEl.innerHTML = `
  <div id="retry-scores" style="margin-bottom:12px"></div>
  <div id="retry-best" style="font-size:22px;letter-spacing:5px;opacity:0.85;margin-bottom:32px;text-shadow:0 0 12px #ff2244">BEST · 0</div>
  <div style="display:flex;pointer-events:auto;">
    <button class="mode-btn mode-btn-1p">1 PLAYER</button>
    <button class="mode-btn mode-btn-2p">2 PLAYER</button>
  </div>
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

// Wire all mode buttons to a single callback (covers both start + retry screens)
export function onModeSelect(cb) {
  document.querySelectorAll('.mode-btn-1p').forEach(el => el.onclick = () => cb(1));
  document.querySelectorAll('.mode-btn-2p').forEach(el => el.onclick = () => cb(2));
}

export function showStart(hs1P, hs2P) {
  const bestEl = document.getElementById('start-best');
  const lines  = [];
  if (hs1P > 0) lines.push(`1P BEST · ${hs1P}`);
  if (hs2P > 0) lines.push(`2P BEST · ${hs2P}`);
  if (lines.length) {
    bestEl.innerHTML = lines.join('<br>');
    bestEl.style.display = 'block';
  } else {
    bestEl.style.display = 'none';
  }
  startEl.style.display = 'flex';
}
export function hideStart() { startEl.style.display = 'none'; }

export function showRetry(score1, bestScore, isNewBest, score2 = null) {
  const scoresEl = document.getElementById('retry-scores');
  if (score2 !== null) {
    scoresEl.innerHTML = `
      <div style="font-size:48px;letter-spacing:4px;margin-bottom:4px;text-shadow:0 0 16px #00ffee;color:#00ffee">
        P1 · ${score1}
      </div>
      <div style="font-size:48px;letter-spacing:4px;margin-bottom:16px;text-shadow:0 0 16px #ffee00;color:#ffee00">
        P2 · ${score2}
      </div>
      <div style="font-size:14px;letter-spacing:3px;opacity:0.5;margin-bottom:8px">FLOORS</div>
    `;
  } else {
    scoresEl.innerHTML = `
      <div style="font-size:64px;letter-spacing:6px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:16px">
        ${score1}
      </div>
      <div style="font-size:16px;letter-spacing:4px;opacity:0.5;margin-bottom:8px">FLOORS</div>
    `;
  }

  document.getElementById('retry-best').innerHTML = isNewBest
    ? `NEW BEST · <span style="text-shadow:0 0 20px #ff2244,0 0 40px #ff2244">${bestScore}</span>`
    : `BEST · ${bestScore}`;

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
