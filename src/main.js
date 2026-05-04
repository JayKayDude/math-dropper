import * as THREE from 'three';
import { scene, composer } from './scene.js';
import { createShaft } from './shaft.js';
import { playerMesh, updatePlayer, resetPlayer } from './player.js';
import { keys } from './input.js';
import { BarrierManager } from './barrierManager.js';
import { explode, updateParticles } from './particles.js';
import { updateScore, updateEquation } from './hud.js';
import { showStart, hideStart, showRetry, hideRetry } from './screens.js';

// Ambient + directional light (needed for MeshStandardMaterial)
scene.add(new THREE.AmbientLight(0x111122, 2));
const dir = new THREE.DirectionalLight(0xffffff, 0.5);
dir.position.set(0, 20, 10);
scene.add(dir);

createShaft();

const barriers = new BarrierManager();
barriers.onClear(floor => updateScore(floor));
barriers.onEquationChange(eq => updateEquation(eq));

const clock = new THREE.Clock(false);

// State: 'idle' | 'playing' | 'dead'
let state = 'idle';
let score = 0;
let deathTimer = 0;

function startGame() {
  score = 0;
  resetPlayer();
  barriers.reset();
  updateScore(0);
  hideStart();
  hideRetry();
  state = 'playing';
  clock.start();
}

function onDeath() {
  state = 'dead';
  deathTimer = 1.2;
  playerMesh.visible = false;
  explode(playerMesh.position.clone());
}

// Space to start / retry
window.addEventListener('keydown', e => {
  if (e.code !== 'Space') return;
  if (state === 'idle') startGame();
  else if (state === 'dead' && deathTimer <= 0) startGame();
});

// Show start screen
showStart();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (state === 'playing') {
    updatePlayer(delta, keys);
    barriers.update(delta);

    const px = playerMesh.position.x;
    const pz = playerMesh.position.z;

    if (barriers.checkCollision(px, pz)) {
      score = barriers.floor;
      onDeath();
    }
  }

  if (state === 'dead') {
    deathTimer -= delta;
    updateParticles(delta);
    if (deathTimer <= 0) {
      showRetry(score);
    }
  }

  composer.render();
}

animate();
