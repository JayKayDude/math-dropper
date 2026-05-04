const style = `
  position:fixed;top:0;left:0;width:100%;height:100%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:rgba(0,0,0,0.75);color:#ff2244;font-family:monospace;
  pointer-events:none;
`;

const startEl = document.createElement('div');
startEl.id = 'screen-start';
startEl.style.cssText = style;
startEl.innerHTML = `
  <div style="font-size:48px;letter-spacing:8px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:40px">MATH DROPPER</div>
  <div style="font-size:18px;letter-spacing:4px;opacity:0.7">PRESS SPACE TO START</div>
`;

const retryEl = document.createElement('div');
retryEl.id = 'screen-retry';
retryEl.style.cssText = style;
retryEl.style.display = 'none';
retryEl.innerHTML = `
  <div id="retry-floor" style="font-size:64px;letter-spacing:6px;text-shadow:0 0 20px #ff2244,0 0 40px #ff2244;margin-bottom:16px">0</div>
  <div style="font-size:16px;letter-spacing:4px;opacity:0.5;margin-bottom:48px">FLOORS</div>
  <div style="font-size:18px;letter-spacing:4px;opacity:0.7">PRESS SPACE TO RETRY</div>
`;

document.body.appendChild(startEl);
document.body.appendChild(retryEl);

export function showStart() { startEl.style.display = 'flex'; }
export function hideStart() { startEl.style.display = 'none'; }

export function showRetry(score) {
  document.getElementById('retry-floor').textContent = score;
  retryEl.style.display = 'flex';
}
export function hideRetry() { retryEl.style.display = 'none'; }
