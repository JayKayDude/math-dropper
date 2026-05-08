export const PLAYFIELD_HALF = 10;
export const BARRIER_THICKNESS = 0.2;
export const PLAYER_RADIUS = 0.4;
export const PLAYER_SPEED = 10;
export const PLAYER_MAX_SPEED = 25;  // caps around floor 44
export const BASE_FALL_SPEED = 20;
export const MAX_FALL_SPEED = 100;  // 500% of base, hit around floor 43
export const BARRIER_POOL_SIZE = 5;
export const BARRIER_SPACING_START = 55;  // spacing at floor 0
export const BARRIER_SPACING_END   = 40;  // tightens to this by floor 50
export const BARRIER_Y_PLAYER = 0;
export const BARRIER_Y_SPAWN = -90;
export const FREEZE_DISTANCE = 1.5;
export const COLLISION_EPSILON = 0.2;

export const CAM_Y = 13;
export const CAM_DEACTIVATE_Y = 20; // barriers recycle once they clear the camera

export const TRON_RED    = 0xff2244;
export const TRON_CYAN   = 0x00ffee;
export const TRON_YELLOW = 0xffee00;
export const TRON_BLUE   = 0x4488ff;
export const TRON_PURPLE = 0xcc44ff;
export const TRON_GREEN  = 0x44ff88;
export const TRON_PINK   = 0xff44aa;
export const OBSIDIAN    = 0x0a0a12;

export const PLAYER_COLORS = {
  cyan:   TRON_CYAN,
  yellow: TRON_YELLOW,
  blue:   TRON_BLUE,
  purple: TRON_PURPLE,
  green:  TRON_GREEN,
  pink:   TRON_PINK,
};

// CSS hex strings for each color key (used in UI)
export const PLAYER_COLOR_HEX = {
  cyan:   '#00ffee',
  yellow: '#ffee00',
  blue:   '#4488ff',
  purple: '#cc44ff',
  green:  '#44ff88',
  pink:   '#ff44aa',
};
