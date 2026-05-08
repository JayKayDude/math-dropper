import { Barrier } from './barrier.js';
import { getDifficulty, getPool } from './difficulty.js';
import { BARRIER_POOL_SIZE, BARRIER_SPACING_START, BARRIER_SPACING_END, BARRIER_Y_PLAYER, COLLISION_EPSILON, CAM_DEACTIVATE_Y } from './config.js';
import { equationString } from './mathFunctions.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class BarrierManager {
  constructor() {
    this.pool = Array.from({ length: BARRIER_POOL_SIZE }, () => new Barrier());
    this.floor = 0;
    this._onClear = null;
    this._onEquationChange = null;
  }

  get _spacing() {
    return BARRIER_SPACING_START - (BARRIER_SPACING_START - BARRIER_SPACING_END) * Math.min(this.floor / 50, 1);
  }

  onClear(cb) { this._onClear = cb; }
  onEquationChange(cb) { this._onEquationChange = cb; }

  start(startingFloor = 0) {
    this.floor = startingFloor;
    this.pool.forEach(b => b.deactivate());

    const startingPool = shuffle(getPool(startingFloor));
    for (let i = 0; i < BARRIER_POOL_SIZE; i++) {
      this._spawnOne(-(i + 1) * this._spacing, startingPool[i % startingPool.length]);
    }
  }

  reset() { this.start(0); }

  _spawnOne(y, forcedType = undefined) {
    const barrier = this.pool.find(b => !b.active);
    if (!barrier) return;
    const diff = getDifficulty(this.floor, forcedType);
    barrier.reset(y, diff.funcType, diff.params, diff.animAmplitude, diff.animFrequency, diff.fallSpeed, diff.edgeWidth, diff.spinSpeed);
  }

  update(delta) {
    let cleared = false;
    for (const b of this.pool) {
      if (!b.active) continue;
      b.update(delta);

      // Score as soon as the barrier clears the player level.
      if (!b.passed && b.y > BARRIER_Y_PLAYER + 0.3) {
        b.passed = true;
        this.floor++;
        cleared = true;
        if (this._onClear) this._onClear(this.floor);
      }

      // Deactivate only after the barrier has swept fully past the camera.
      if (b.y > CAM_DEACTIVATE_Y) {
        b.deactivate();
      }
    }

    // Spawn a replacement whenever a pool slot opens — always directly below
    // the current lowest active barrier so spacing stays consistent.
    const active = this.pool.filter(b => b.active);
    if (active.length > 0 && active.length < BARRIER_POOL_SIZE) {
      const lowestY = Math.min(...active.map(b => b.y));
      this._spawnOne(lowestY - this._spacing);
    }

    return cleared;
  }

  getCurrentEquation() {
    // Track the barrier closest to player level. While a barrier is approaching it
    // wins naturally. The moment it scores (b.passed, same instant floor increments)
    // it gets a large distance penalty so the next approaching barrier takes over.
    let closest = null;
    let minDist = Infinity;
    for (const b of this.pool) {
      if (!b.active) continue;
      const dist = Math.abs(b.y - BARRIER_Y_PLAYER) + (b.passed ? 1000 : 0);
      if (dist < minDist) { minDist = dist; closest = b; }
    }
    return closest
      ? { text: equationString(closest.funcType, closest.params), spinning: closest.spinSpeed !== 0 }
      : { text: '', spinning: false };
  }

  checkCollision(px, pz) {
    for (const b of this.pool) {
      if (!b.active) continue;
      const atPlayer = Math.abs(b.y - BARRIER_Y_PLAYER) < COLLISION_EPSILON;
      if (atPlayer && b.checkCollision(px, pz)) return true;
    }
    return false;
  }
}
