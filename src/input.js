import { getKeybinds } from './settings.js';

export const keysP1Primary   = { up: false, down: false, left: false, right: false };
export const keysP1Secondary = { up: false, down: false, left: false, right: false };
export const keysP2          = { up: false, down: false, left: false, right: false };

// Combined for 1P — player can use either binding simultaneously
export const keys = {
  get up()    { return keysP1Primary.up    || keysP1Secondary.up;    },
  get down()  { return keysP1Primary.down  || keysP1Secondary.down;  },
  get left()  { return keysP1Primary.left  || keysP1Secondary.left;  },
  get right() { return keysP1Primary.right || keysP1Secondary.right; },
};

// Backward-compatible aliases — main.js imports these names unchanged
export const keysWASD   = keysP1Primary;
export const keysArrows = keysP2;

function invert(binding) {
  const map = {};
  for (const [dir, code] of Object.entries(binding)) map[code] = dir;
  return map;
}

let p1PrimaryMap = {}, p1SecondaryMap = {}, p2Map = {};

export function rebuildInputMaps() {
  const kb    = getKeybinds();
  p1PrimaryMap   = invert(kb.p1Primary);
  p1SecondaryMap = invert(kb.p1Secondary);
  p2Map          = invert(kb.p2);
}

rebuildInputMaps();

window.addEventListener('keydown', e => {
  if (p1PrimaryMap[e.code])   keysP1Primary[p1PrimaryMap[e.code]]     = true;
  if (p1SecondaryMap[e.code]) keysP1Secondary[p1SecondaryMap[e.code]] = true;
  if (p2Map[e.code])          keysP2[p2Map[e.code]]                   = true;
});

window.addEventListener('keyup', e => {
  if (p1PrimaryMap[e.code])   keysP1Primary[p1PrimaryMap[e.code]]     = false;
  if (p1SecondaryMap[e.code]) keysP1Secondary[p1SecondaryMap[e.code]] = false;
  if (p2Map[e.code])          keysP2[p2Map[e.code]]                   = false;
});
