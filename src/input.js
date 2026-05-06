export const keysWASD   = { left: false, right: false, up: false, down: false };
export const keysArrows = { left: false, right: false, up: false, down: false };

// Combined view for single-player (both WASD and arrows work)
export const keys = {
  get left()  { return keysWASD.left  || keysArrows.left;  },
  get right() { return keysWASD.right || keysArrows.right; },
  get up()    { return keysWASD.up    || keysArrows.up;    },
  get down()  { return keysWASD.down  || keysArrows.down;  },
};

const wasdMap  = { KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down' };
const arrowMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };

window.addEventListener('keydown', e => {
  if (wasdMap[e.code])  keysWASD[wasdMap[e.code]]   = true;
  if (arrowMap[e.code]) keysArrows[arrowMap[e.code]] = true;
});
window.addEventListener('keyup', e => {
  if (wasdMap[e.code])  keysWASD[wasdMap[e.code]]   = false;
  if (arrowMap[e.code]) keysArrows[arrowMap[e.code]] = false;
});
