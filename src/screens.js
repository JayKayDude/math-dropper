import { getKeybinds, setKeybind, getMusicVolume, getSFXVolume, setMusicVolume as saveMusicVol, setSFXVolume as saveSFXVol, getPlayerColor, setPlayerColor } from './settings.js';
import { PLAYER_COLOR_HEX } from './config.js';
import { rebuildInputMaps } from './input.js';
import * as audio from './audio.js';

function click() { audio.init(); audio.playClick(); }

// ── Key label map ────────────────────────────────────────────────────────────
const KEY_LABELS = {
  KeyA:'A', KeyB:'B', KeyC:'C', KeyD:'D', KeyE:'E', KeyF:'F', KeyG:'G',
  KeyH:'H', KeyI:'I', KeyJ:'J', KeyK:'K', KeyL:'L', KeyM:'M', KeyN:'N',
  KeyO:'O', KeyP:'P', KeyQ:'Q', KeyR:'R', KeyS:'S', KeyT:'T', KeyU:'U',
  KeyV:'V', KeyW:'W', KeyX:'X', KeyY:'Y', KeyZ:'Z',
  ArrowUp:'↑', ArrowDown:'↓', ArrowLeft:'←', ArrowRight:'→',
  Numpad8:'NUM 8', Numpad2:'NUM 2', Numpad4:'NUM 4', Numpad6:'NUM 6',
  Space:'SPACE', Enter:'ENTER',
};

function keyLabel(code) { return KEY_LABELS[code] ?? code; }

function getControlLines(mode) {
  const kb = getKeybinds();
  const fmt = b => `${keyLabel(b.left)} ${keyLabel(b.up)} ${keyLabel(b.down)} ${keyLabel(b.right)}`;
  if (mode === 1) return [
    `PRIMARY  ·  ${fmt(kb.p1Primary)}`,
    `SECONDARY  ·  ${fmt(kb.p1Secondary)}`,
  ];
  return [
    `P1  ·  ${fmt(kb.p1Primary)}`,
    `P2  ·  ${fmt(kb.p2)}`,
  ];
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styleEl = document.createElement('style');
styleEl.textContent = `
  .mode-btn {
    background: transparent;
    border: 2px solid rgba(255,34,68,0.4);
    color: rgba(255,34,68,0.5);
    font-family: monospace; font-size: 18px; letter-spacing: 4px;
    padding: 16px 40px; cursor: pointer; margin: 8px 16px;
    transition: background 0.15s, color 0.15s, border-color 0.15s, text-shadow 0.15s;
  }
  .mode-btn:hover { background: rgba(255,34,68,0.1); color: #ff2244; border-color: rgba(255,34,68,0.7); }
  .mode-btn.selected { background: rgba(255,34,68,0.18); border-color: #ff2244; color: #ff2244; text-shadow: 0 0 10px #ff2244, 0 0 20px #ff2244; }
  .start-btn {
    background: transparent; border: 2px solid #ff2244; color: #ff2244;
    font-family: monospace; font-size: 22px; letter-spacing: 6px;
    padding: 18px 64px; cursor: pointer; margin-top: 8px;
    transition: background 0.15s, text-shadow 0.15s; pointer-events: auto;
  }
  .start-btn:hover { background: rgba(255,34,68,0.15); text-shadow: 0 0 14px #ff2244, 0 0 28px #ff2244; }
  .mute-btn {
    position: absolute; top: 14px; right: 16px;
    background: transparent; border: 1px solid rgba(255,34,68,0.45); color: rgba(255,34,68,0.65);
    font-family: monospace; font-size: 11px; letter-spacing: 2px;
    padding: 5px 10px; cursor: pointer;
    transition: border-color 0.15s, color 0.15s; pointer-events: auto;
  }
  .mute-btn:hover { border-color: #ff2244; color: #ff2244; }
  .settings-btn {
    position: absolute; top: 14px; left: 16px;
    background: transparent; border: 1px solid rgba(255,34,68,0.45); color: rgba(255,34,68,0.65);
    font-family: monospace; font-size: 11px; letter-spacing: 2px;
    padding: 5px 10px; cursor: pointer;
    transition: border-color 0.15s, color 0.15s; pointer-events: auto;
  }
  .settings-btn:hover { border-color: #ff2244; color: #ff2244; }
  .keybind-btn {
    background: rgba(0,0,0,0.7); border: 1px solid rgba(255,34,68,0.5); color: #ff2244;
    font-family: monospace; font-size: 13px; letter-spacing: 1px;
    padding: 4px 8px; cursor: pointer; pointer-events: auto;
    min-width: 62px; text-align: center;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .keybind-btn:hover { border-color: #ff2244; box-shadow: 0 0 6px rgba(255,34,68,0.5); }
  .keybind-btn.listening {
    border-color: #ff2244; color: #000; background: #ff2244;
    box-shadow: 0 0 12px #ff2244, 0 0 24px #ff2244;
    animation: keybind-pulse 0.7s ease-in-out infinite;
  }
  @keyframes keybind-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.55; }
  }
  .color-swatch {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2px solid transparent; cursor: pointer; pointer-events: auto;
    transition: transform 0.1s, box-shadow 0.15s;
    flex-shrink: 0; position: relative; overflow: hidden;
  }
  .color-swatch:hover { transform: scale(1.18); }
  .color-swatch.selected { border-color: #fff; box-shadow: 0 0 10px var(--sw-color), 0 0 20px var(--sw-color); }
  .color-swatch.taken { opacity: 0.45; cursor: not-allowed; pointer-events: none; }
  .color-swatch.taken::after {
    content: '';
    position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px;
    background: linear-gradient(
      to bottom right,
      transparent calc(50% - 1.5px),
      #ff2244 calc(50% - 1.5px),
      #ff2244 calc(50% + 1.5px),
      transparent calc(50% + 1.5px)
    );
  }
  .settings-slider {
    -webkit-appearance: none; appearance: none;
    width: 180px; height: 3px; background: rgba(255,34,68,0.3);
    outline: none; cursor: pointer; pointer-events: auto; vertical-align: middle;
  }
  .settings-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
    background: #ff2244; box-shadow: 0 0 8px #ff2244; cursor: pointer;
  }
  .settings-slider::-moz-range-thumb {
    width: 14px; height: 14px; border-radius: 50%; border: none;
    background: #ff2244; box-shadow: 0 0 8px #ff2244; cursor: pointer;
  }
`;
document.head.appendChild(styleEl);

const overlayStyle = `
  position:fixed;top:0;left:0;width:100%;height:100%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:rgba(0,0,0,0.75);color:#ff2244;font-family:monospace;
  pointer-events:none;
`;

// ── Internal state ────────────────────────────────────────────────────────────
let selectedMode = 1;
let _onStart = null;
let _listeningCancel = null;  // cancels an in-progress key capture

function startKeyCapture(btn, slotKey, dir) {
  // Cancel any previous capture first
  if (_listeningCancel) _listeningCancel();

  btn.classList.add('listening');
  btn.textContent = 'PRESS KEY';

  const onKey = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.code === 'Escape') { cancel(); return; }
    setKeybind(slotKey, dir, e.code);
    rebuildInputMaps();
    refreshModeUI();
    btn.classList.remove('listening');
    btn.textContent = keyLabel(e.code);
    _listeningCancel = null;
    window.removeEventListener('keydown', onKey, true);
  };

  const cancel = () => {
    btn.classList.remove('listening');
    btn.textContent = keyLabel(getKeybinds()[slotKey][dir]);
    _listeningCancel = null;
    window.removeEventListener('keydown', onKey, true);
  };

  _listeningCancel = cancel;
  window.addEventListener('keydown', onKey, true);
}

function refreshModeUI() {
  document.querySelectorAll('.mode-btn-1p').forEach(el => el.classList.toggle('selected', selectedMode === 1));
  document.querySelectorAll('.mode-btn-2p').forEach(el => el.classList.toggle('selected', selectedMode === 2));
  document.querySelectorAll('.keybind-display').forEach(el => {
    el.innerHTML = getControlLines(selectedMode).map(l => `<div style="margin:3px 0">${l}</div>`).join('');
  });
}

function buildModeBlock() {
  return `
    <div style="display:flex;pointer-events:auto;margin-bottom:20px">
      <button class="mode-btn mode-btn-1p">1 PLAYER</button>
      <button class="mode-btn mode-btn-2p">2 PLAYER</button>
    </div>
    <div class="keybind-display" style="font-size:13px;letter-spacing:2px;opacity:0.7;margin-bottom:24px;text-align:center"></div>
    <button class="start-btn">PLAY</button>
  `;
}

// ── Start screen ──────────────────────────────────────────────────────────────
const startEl = document.createElement('div');
startEl.style.cssText = overlayStyle;
startEl.innerHTML = `
  <button class="mute-btn" id="mute-btn-start">SOUND ON</button>
  <button class="settings-btn" id="settings-btn-start">SETTINGS</button>
  <div style="font-size:48px;letter-spacing:8px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:32px">MATH DROPPER</div>
  <div id="start-best" style="font-size:22px;letter-spacing:5px;opacity:0.85;margin-bottom:28px;text-shadow:0 0 12px #ff2244;display:none"></div>
  ${buildModeBlock()}
`;

// ── Retry screen ──────────────────────────────────────────────────────────────
const retryEl = document.createElement('div');
retryEl.style.cssText = overlayStyle + 'display:none;';
retryEl.innerHTML = `
  <button class="mute-btn" id="mute-btn-retry">SOUND ON</button>
  <button class="settings-btn" id="settings-btn-retry">SETTINGS</button>
  <div id="retry-scores" style="margin-bottom:12px"></div>
  <div id="retry-best" style="font-size:22px;letter-spacing:5px;opacity:0.85;margin-bottom:28px;text-shadow:0 0 12px #ff2244">BEST · 0</div>
  ${buildModeBlock()}
`;

// ── Countdown overlay ─────────────────────────────────────────────────────────
const countdownEl = document.createElement('div');
countdownEl.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;display:none;align-items:center;justify-content:center;pointer-events:none;`;
const countdownNum = document.createElement('div');
countdownNum.style.cssText = `font-size:160px;font-family:monospace;color:#ff2244;text-shadow:0 0 30px #ff2244,0 0 80px #ff2244,0 0 120px #ff2244;letter-spacing:8px;line-height:1;`;
countdownNum.textContent = '3';
countdownEl.appendChild(countdownNum);

// ── Pause screen ──────────────────────────────────────────────────────────────
const pauseEl = document.createElement('div');
pauseEl.style.cssText = overlayStyle + 'display:none;';
pauseEl.innerHTML = `
  <button class="mute-btn" id="mute-btn-pause">SOUND ON</button>
  <div style="font-size:48px;letter-spacing:10px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:32px">PAUSED</div>
  <div id="pause-best" style="font-size:22px;letter-spacing:5px;opacity:0.85;margin-bottom:32px;text-shadow:0 0 12px #ff2244">BEST · <span id="pause-best-num">0</span></div>
  <div style="font-size:16px;letter-spacing:4px;opacity:0.6">PRESS ANY KEY TO RESUME</div>
`;

// ── Settings overlay ──────────────────────────────────────────────────────────
const settingsEl = document.createElement('div');
settingsEl.style.cssText = overlayStyle + 'display:none;overflow-y:auto;padding:40px 0;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);background:rgba(0,0,0,0.88);';

function buildColorSection() {
  const colorKeys = Object.keys(PLAYER_COLOR_HEX);
  const p1 = getPlayerColor(1);
  const p2 = getPlayerColor(2);

  const swatchRow = (player, currentKey, otherKey) =>
    colorKeys.map(key => {
      const hex = PLAYER_COLOR_HEX[key];
      const selected = key === currentKey ? 'selected' : '';
      const taken    = key === otherKey   ? 'taken'    : '';
      return `<button class="color-swatch ${selected} ${taken}"
        id="cs-p${player}-${key}"
        style="background:${hex};--sw-color:${hex}"
        title="${key}"></button>`;
    }).join('');

  return `
    <div style="margin-bottom:20px;text-align:center">
      <div style="display:flex;align-items:center;gap:12px;margin:6px 0;width:300px">
        <span style="font-size:12px;letter-spacing:3px;opacity:0.7;width:26px">P1</span>
        <div style="display:flex;gap:8px;pointer-events:auto">${swatchRow(1, p1, p2)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin:6px 0;width:300px">
        <span style="font-size:12px;letter-spacing:3px;opacity:0.7;width:26px">P2</span>
        <div style="display:flex;gap:8px;pointer-events:auto">${swatchRow(2, p2, p1)}</div>
      </div>
    </div>`;
}

function buildKeybindBtnHTML(id, currentCode) {
  return `<button class="keybind-btn" id="${id}">${keyLabel(currentCode)}</button>`;
}

function buildKeybindSection(slotKey, title) {
  const kb   = getKeybinds()[slotKey];
  const dirs = [['up','↑'], ['down','↓'], ['left','←'], ['right','→']];
  const btns = dirs.map(([dir, arrow]) =>
    `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
       <span style="font-size:11px;opacity:0.5">${arrow}</span>
       ${buildKeybindBtnHTML(`kb-${slotKey}-${dir}`, kb[dir])}
     </div>`
  ).join('');
  return `
    <div style="margin-bottom:14px">
      <div style="font-size:12px;letter-spacing:4px;opacity:0.6;margin-bottom:6px">${title}</div>
      <div style="display:flex;gap:8px;pointer-events:auto">${btns}</div>
    </div>`;
}

function renderSettingsContent() {
  settingsEl.innerHTML = `
    <div style="font-size:36px;letter-spacing:8px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:20px">SETTINGS</div>

    <div style="font-size:13px;letter-spacing:5px;opacity:0.5;margin-bottom:16px;border-bottom:1px solid rgba(255,34,68,0.2);padding-bottom:8px;width:300px;text-align:center">COLOR</div>
    ${buildColorSection()}

    <div style="font-size:13px;letter-spacing:5px;opacity:0.5;margin-bottom:16px;border-bottom:1px solid rgba(255,34,68,0.2);padding-bottom:8px;width:300px;text-align:center">KEYBINDS</div>

    <div id="settings-keybinds" style="pointer-events:auto">
      ${buildKeybindSection('p1Primary',   'P1 PRIMARY')}
      ${buildKeybindSection('p1Secondary', 'P1 SECONDARY')}
      ${buildKeybindSection('p2',          'P2')}
    </div>

    <div style="font-size:13px;letter-spacing:5px;opacity:0.5;margin:16px 0 16px;border-bottom:1px solid rgba(255,34,68,0.2);padding-bottom:8px;width:300px;text-align:center">VOLUME</div>

    <div style="pointer-events:auto;display:flex;flex-direction:column;gap:14px;width:300px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:12px;letter-spacing:3px;opacity:0.7;width:60px">MUSIC</span>
        <input class="settings-slider" id="sl-music" type="range" min="0" max="1" step="0.01" value="${getMusicVolume()}">
        <span id="sl-music-pct" style="font-size:12px;letter-spacing:1px;width:38px;text-align:right">${Math.round(getMusicVolume()*100)}%</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:12px;letter-spacing:3px;opacity:0.7;width:60px">SFX</span>
        <input class="settings-slider" id="sl-sfx" type="range" min="0" max="1" step="0.01" value="${getSFXVolume()}">
        <span id="sl-sfx-pct" style="font-size:12px;letter-spacing:1px;width:38px;text-align:right">${Math.round(getSFXVolume()*100)}%</span>
      </div>
    </div>

    <button class="start-btn" id="settings-close" style="margin-top:36px;pointer-events:auto">CLOSE</button>
  `;

  // Wire color swatches
  for (const player of [1, 2]) {
    for (const key of Object.keys(PLAYER_COLOR_HEX)) {
      const btn = document.getElementById(`cs-p${player}-${key}`);
      if (!btn || btn.classList.contains('taken')) continue;
      btn.addEventListener('click', () => {
        click();
        setPlayerColor(player, key);
        renderSettingsContent(); // re-render to update selected/taken states
      });
    }
  }

  // Wire keybind capture buttons
  for (const slotKey of ['p1Primary', 'p1Secondary', 'p2']) {
    for (const dir of ['up', 'down', 'left', 'right']) {
      const btn = document.getElementById(`kb-${slotKey}-${dir}`);
      if (btn) btn.addEventListener('click', () => { click(); startKeyCapture(btn, slotKey, dir); });
    }
  }

  // Wire volume sliders
  document.getElementById('sl-music').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    saveMusicVol(v);
    audio.setMusicVolume(v);
    document.getElementById('sl-music-pct').textContent = Math.round(v * 100) + '%';
  });
  document.getElementById('sl-sfx').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    saveSFXVol(v);
    audio.setSFXVolume(v);
    document.getElementById('sl-sfx-pct').textContent = Math.round(v * 100) + '%';
  });

  // Wire close button
  document.getElementById('settings-close').onclick = () => { click(); hideSettings(); };
}

document.body.append(startEl, retryEl, countdownEl, pauseEl, settingsEl);

// Wire mode buttons
document.querySelectorAll('.mode-btn-1p').forEach(el => el.addEventListener('click', () => { click(); selectedMode = 1; refreshModeUI(); }));
document.querySelectorAll('.mode-btn-2p').forEach(el => el.addEventListener('click', () => { click(); selectedMode = 2; refreshModeUI(); }));

// Wire settings buttons
document.querySelectorAll('.settings-btn').forEach(el => el.addEventListener('click', () => { click(); showSettings(); }));

// ── Exports ───────────────────────────────────────────────────────────────────

export function onModeSelect(cb) {
  _onStart = cb;
  document.querySelectorAll('.start-btn').forEach(el =>
    el.addEventListener('click', () => { click(); _onStart && _onStart(selectedMode); }));
}

export function showSettings() {
  renderSettingsContent();
  settingsEl.style.display = 'flex';
}
export function hideSettings() {
  if (_listeningCancel) _listeningCancel();
  settingsEl.style.display = 'none';
}

export function showStart(hs1P, hs2P) {
  const bestEl = document.getElementById('start-best');
  const lines  = [];
  if (hs1P > 0) lines.push(`1P BEST · ${hs1P}`);
  if (hs2P > 0) lines.push(`2P BEST · ${hs2P}`);
  bestEl.innerHTML = lines.join('<br>');
  bestEl.style.display = lines.length ? 'block' : 'none';
  refreshModeUI();
  startEl.style.display = 'flex';
}
export function hideStart() { startEl.style.display = 'none'; }

export function showRetry(score1, bestScore, isNewBest, score2 = null) {
  const scoresEl = document.getElementById('retry-scores');
  if (score2 !== null) {
    const p1Hex = PLAYER_COLOR_HEX[getPlayerColor(1)];
    const p2Hex = PLAYER_COLOR_HEX[getPlayerColor(2)];
    scoresEl.innerHTML = `
      <div style="font-size:48px;letter-spacing:4px;margin-bottom:4px;text-shadow:0 0 16px ${p1Hex};color:${p1Hex}">P1 · ${score1}</div>
      <div style="font-size:48px;letter-spacing:4px;margin-bottom:16px;text-shadow:0 0 16px ${p2Hex};color:${p2Hex}">P2 · ${score2}</div>
      <div style="font-size:14px;letter-spacing:3px;opacity:0.5;margin-bottom:8px">FLOORS</div>`;
  } else {
    scoresEl.innerHTML = `
      <div style="font-size:64px;letter-spacing:6px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:16px">${score1}</div>
      <div style="font-size:16px;letter-spacing:4px;opacity:0.5;margin-bottom:8px">FLOORS</div>`;
  }
  document.getElementById('retry-best').innerHTML = isNewBest
    ? `NEW BEST · <span style="text-shadow:0 0 20px #ff2244,0 0 40px #ff2244">${bestScore}</span>`
    : `BEST · ${bestScore}`;
  refreshModeUI();
  retryEl.style.display = 'flex';
}
export function hideRetry() { retryEl.style.display = 'none'; }

export function showCountdown(label) { countdownNum.textContent = label; countdownEl.style.display = 'flex'; }
export function hideCountdown()      { countdownEl.style.display = 'none'; }

export function showPause(liveHighScore) {
  document.getElementById('pause-best-num').textContent = liveHighScore;
  pauseEl.style.display = 'flex';
}
export function hidePause() { pauseEl.style.display = 'none'; }

export function updateMuteButtons(muted) {
  const label = muted ? 'SOUND OFF' : 'SOUND ON';
  ['mute-btn-start', 'mute-btn-retry', 'mute-btn-pause'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = label;
  });
}
