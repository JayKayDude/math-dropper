const DEFAULTS = {
  keybinds: {
    p1Primary:   { up: 'KeyW',    down: 'KeyS',    left: 'KeyA',    right: 'KeyD'          },
    p1Secondary: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' },
    p2:          { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' },
  },
  musicVolume: 0.45,
  sfxVolume:   0.70,
};

function deepMerge(defaults, saved) {
  const out = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (saved?.[key] !== undefined) {
      out[key] = (typeof defaults[key] === 'object' && !Array.isArray(defaults[key]))
        ? deepMerge(defaults[key], saved[key])
        : saved[key];
    }
  }
  return out;
}

let state;
try {
  const raw = localStorage.getItem('mathDropper_settings');
  state = deepMerge(DEFAULTS, raw ? JSON.parse(raw) : null);
} catch {
  state = deepMerge(DEFAULTS, null);
}

function save() {
  localStorage.setItem('mathDropper_settings', JSON.stringify(state));
}

export function getKeybinds() { return state.keybinds; }

export function setKeybind(slot, direction, keyCode) {
  state.keybinds[slot][direction] = keyCode;
  save();
}

export function getMusicVolume() { return state.musicVolume; }
export function getSFXVolume()   { return state.sfxVolume;   }

export function setMusicVolume(v) {
  state.musicVolume = Math.max(0, Math.min(1, v));
  save();
}

export function setSFXVolume(v) {
  state.sfxVolume = Math.max(0, Math.min(1, v));
  save();
}
