import { Barrier } from './barrier.js';
import { getDifficulty } from './difficulty.js';
import { BARRIER_POOL_SIZE, BARRIER_SPACING, BARRIER_Y_PLAYER, COLLISION_EPSILON } from './config.js';
import { equationString } from './mathFunctions.js';

export class BarrierManager {
  constructor() {
    this.pool = Array.from({ length: BARRIER_POOL_SIZE }, () => new Barrier());
    this.floor = 0;
    this.nextSpawnY = 0;
    this._onClear = null;
    this._onEquationChange = null;
  }

  onClear(cb) { this._onClear = cb; }
  onEquationChange(cb) { this._onEquationChange = cb; }

  start(startingFloor = 0) {
    this.floor = startingFloor;
    this.nextSpawnY = -BARRIER_SPACING;
    this.pool.forEach(b => b.deactivate());

    // Pre-populate staggered barriers
    for (let i = 0; i < BARRIER_POOL_SIZE; i++) {
      this._spawnOne(-(i + 1) * BARRIER_SPACING);
    }
  }

  reset() { this.start(0); }

  _spawnOne(y) {
    const barrier = this.pool.find(b => !b.active);
    if (!barrier) return;
    const diff = getDifficulty(this.floor);
    barrier.reset(y, diff.funcType, diff.params, diff.animAmplitude, diff.animFrequency, diff.fallSpeed, diff.edgeWidth);
    if (this._onEquationChange) {
      this._onEquationChange(equationString(diff.funcType, diff.params));
    }
    this.nextSpawnY = y - BARRIER_SPACING;
  }

  update(delta) {
    let cleared = false;
    for (const b of this.pool) {
      if (!b.active) continue;
      b.update(delta);

      // Barrier passed the player — cleared safely
      if (b.y > BARRIER_Y_PLAYER + 2) {
        b.deactivate();
        this.floor++;
        cleared = true;
        if (this._onClear) this._onClear(this.floor);
      }
    }

    // Spawn new barrier if there's room below
    const lowestActive = this.pool.filter(b => b.active).reduce((min, b) => Math.min(min, b.y), 0);
    if (lowestActive > this.nextSpawnY + BARRIER_SPACING * 0.5) {
      this._spawnOne(this.nextSpawnY);
    }

    return cleared;
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
