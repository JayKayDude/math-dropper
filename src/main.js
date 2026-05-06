import * as THREE from 'three';
import { scene, composer, camera } from './scene.js';
import { createShaft, updateShaft } from './shaft.js';
import { playerMesh, updatePlayer, resetPlayer } from './player.js';
import { keys } from './input.js';
import { BarrierManager } from './barrierManager.js';
import { PLAYFIELD_HALF, CAM_Y, BASE_FALL_SPEED, MAX_FALL_SPEED, PLAYER_SPEED, PLAYER_MAX_SPEED } from './config.js';
import { explode, updateParticles } from './particles.js';
import { updateScore, updateEquation, initEquation } from './hud.js';
import {
  showStart, hideStart,
  showRetry, hideRetry,
  showCountdown, hideCountdown,
  showPause, hidePause,
} from './screens.js';

scene.add(new THREE.AmbientLight(0x111122, 2));
const dir = new THREE.DirectionalLight(0xffffff, 0.5);
dir.position.set(0, 20, 10);
scene.add(dir);

createShaft();
initEquation('f(x) = 1/x');

const barriers = new BarrierManager();
barriers.onClear(floor => updateScore(floor));

const clock = new THREE.Clock(false);

const HS_KEY = 'mathDropper_highScore';
let highScore = parseInt(localStorage.getItem(HS_KEY) || '0', 10);

// State: 'idle' | 'countdown' | 'playing' | 'paused' | 'dead'
let state = 'idle';
let score = 0;
let deathTimer = 0;
let countdownTimer = 0;

// Smooth camera follow
let camX = 0, camZ = 0;
const CAM_LERP  = 3;
const CAM_CLAMP = PLAYFIELD_HALF - 4;

function updateCamera(delta) {
  const t = 1 - Math.exp(-CAM_LERP * delta);
  camX += (playerMesh.position.x - camX) * t;
  camZ += (playerMesh.position.z - camZ) * t;
  camX = Math.max(-CAM_CLAMP, Math.min(CAM_CLAMP, camX));
  camZ = Math.max(-CAM_CLAMP, Math.min(CAM_CLAMP, camZ));
  camera.position.set(camX, CAM_Y, camZ);
  camera.lookAt(camX, 0, camZ);
}

function startGame() {
  score = 0;
  camX = 0; camZ = 0;
  camera.position.set(0, CAM_Y, 0);
  resetPlayer();
  barriers.reset();
  updateScore(0);
  hideStart();
  hideRetry();
  hidePause();
  // 3-second countdown: barriers are visible but frozen until it ends
  countdownTimer = 3.0;
  showCountdown(3);
  state = 'countdown';
  clock.start();
}

function onDeath() {
  state = 'dead';
  deathTimer = 1.2;
  score = barriers.floor;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HS_KEY, highScore);
  }
  playerMesh.visible = false;
  explode(playerMesh.position.clone());
}

window.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    if (state === 'playing') { state = 'paused'; showPause(Math.max(highScore, barriers.floor)); }
    else if (state === 'paused') { state = 'playing'; hidePause(); }
    return;
  }
  if (state === 'paused') { state = 'playing'; hidePause(); }
  else if (state === 'idle') startGame();
  else if (state === 'dead' && deathTimer <= 0) startGame();
});

showStart(highScore);

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (state === 'countdown') {
    countdownTimer -= delta;
    // Show 3 → 2 → 1 → GO!, then start playing
    if (countdownTimer > 0) {
      showCountdown(Math.ceil(countdownTimer));
    } else {
      showCountdown('GO!');
    }
    updateEquation(barriers.getCurrentEquation());
    if (countdownTimer <= -0.6) {
      hideCountdown();
      state = 'playing';
    }
  }

  if (state === 'playing') {
    const f = barriers.floor;
    const playerSpeed = Math.min(PLAYER_MAX_SPEED, PLAYER_SPEED * (1.0 + 0.008 * f + 0.0004 * f * f));
    updatePlayer(delta, keys, playerSpeed);
    updateCamera(delta);
    barriers.update(delta);

    const px = playerMesh.position.x;
    const pz = playerMesh.position.z;

    updateEquation(barriers.getCurrentEquation());

    if (barriers.checkCollision(px, pz)) {
      onDeath();
    }
  }

  if (state === 'dead') {
    deathTimer -= delta;
    updateParticles(delta);
    if (deathTimer <= 0) showRetry(score, highScore, score === highScore && score > 0);
  }

  // Shaft rings only scroll when barriers are moving
  if (state === 'playing') {
    const shaftSpeed = barriers.pool.find(b => b.active)?.fallSpeed ?? BASE_FALL_SPEED;
    updateShaft(delta, shaftSpeed);
  }

  composer.render();
}

animate();
