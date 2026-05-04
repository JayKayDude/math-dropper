export const keys = { left: false, right: false, up: false, down: false };

const map = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
};

window.addEventListener('keydown', e => { if (map[e.code]) keys[map[e.code]] = true; });
window.addEventListener('keyup',   e => { if (map[e.code]) keys[map[e.code]] = false; });
