import * as THREE from 'three';
import { scene, composer, camera } from './scene.js';
import { createShaft, updateShaft } from './shaft.js';
import { createPlayer } from './player.js';
import { keys, keysWASD, keysArrows } from './input.js';
import { BarrierManager } from './barrierManager.js';
import { PLAYFIELD_HALF, CAM_Y, BASE_FALL_SPEED, MAX_FALL_SPEED, PLAYER_SPEED, PLAYER_MAX_SPEED, TRON_CYAN, TRON_YELLOW } from './config.js';
import { explode, updateParticles } from './particles.js';
import { updateScore, updateEquation, initEquation, setTwoPlayerMode, setPlayerAlive } from './hud.js';
import {
  showStart, hideStart,
  showRetry, hideRetry,
  showCountdown, hideCountdown,
  showPause, hidePause,
  onModeSelect,
  updateMuteButtons,
  showSettings, hideSettings,
} from './screens.js';
import * as audio from './audio.js';

scene.add(new THREE.AmbientLight(0x111122, 2));
const dir = new THREE.DirectionalLight(0xffffff, 0.5);
dir.position.set(0, 20, 10);
scene.add(dir);

createShaft();
initEquation('f(x) = 1/x');

const barriers = new BarrierManager();
barriers.onClear(floor => updateScore(floor));

const clock = new THREE.Clock(false);

const HS_KEY    = 'mathDropper_highScore';
const HS_KEY_2P = 'mathDropper_highScore2P';
let highScore   = parseInt(localStorage.getItem(HS_KEY)    || '0', 10);
let highScore2P = parseInt(localStorage.getItem(HS_KEY_2P) || '0', 10);

// State: 'idle' | 'countdown' | 'playing' | 'paused' | 'dead'
let state = 'idle';
let gameMode = 1;
let player1 = null, player2 = null;
let p1Dead = false, p2Dead = false;
let score1 = 0, score2 = 0;
let deathTimer = 0;
let countdownTimer = 0;

let camX = 0, camZ = 0, camY = CAM_Y;
let prevCountdownLabel = null;
const CAM_LERP    = 3;
const CAM_CLAMP   = PLAYFIELD_HALF - 4;
const CAM_Y_2P    = 22;   // zoomed out when both players alive
const CAM_Y_LERP  = 1.2;  // how fast height transitions

function playerSpeed() {
  const f = barriers.floor;
  return Math.min(PLAYER_MAX_SPEED, PLAYER_SPEED * (1.0 + 0.008 * f + 0.0004 * f * f));
}

function updateCamera(delta) {
  const t  = 1 - Math.exp(-CAM_LERP * delta);
  const ty = 1 - Math.exp(-CAM_Y_LERP * delta);

  let tx = player1.mesh.position.x;
  let tz = player1.mesh.position.z;
  // Target height: zoomed out while both players are alive, normal otherwise
  let targetY = CAM_Y;

  if (gameMode === 2) {
    if (!p1Dead && !p2Dead) {
      tx = (player1.mesh.position.x + player2.mesh.position.x) / 2;
      tz = (player1.mesh.position.z + player2.mesh.position.z) / 2;
      targetY = CAM_Y_2P;
    } else if (p1Dead && !p2Dead) {
      tx = player2.mesh.position.x;
      tz = player2.mesh.position.z;
    }
  }

  camX += (tx   - camX) * t;
  camZ += (tz   - camZ) * t;
  camY += (targetY - camY) * ty;
  camX = Math.max(-CAM_CLAMP, Math.min(CAM_CLAMP, camX));
  camZ = Math.max(-CAM_CLAMP, Math.min(CAM_CLAMP, camZ));
  camera.position.set(camX, camY, camZ);
  camera.lookAt(camX, 0, camZ);
}

function startGame(mode) {
  prevCountdownLabel = null;
  audio.startMusic();
  audio.resumeAmbient();
  // Clean up old player meshes
  if (player1) { player1.remove(); player1 = null; }
  if (player2) { player2.remove(); player2 = null; }

  gameMode = mode;
  p1Dead = false; p2Dead = false;
  score1 = 0; score2 = 0;
  camX = 0; camZ = 0; camY = CAM_Y;
  camera.position.set(0, CAM_Y, 0);

  player1 = createPlayer(TRON_CYAN, mode === 2 ? -2 : 0);
  if (mode === 2) player2 = createPlayer(TRON_YELLOW, 2);

  barriers.reset();
  setTwoPlayerMode(mode === 2);
  if (mode === 2) { setPlayerAlive(1, true); setPlayerAlive(2, true); }
  updateScore(0);

  hideStart();
  hideRetry();
  hidePause();

  countdownTimer = 3.0;
  showCountdown(3);
  state = 'countdown';
  clock.start();
}

function onDeath() {
  state = 'dead';
  deathTimer = 1.2;
  audio.pauseAmbient();

  if (gameMode === 2) {
    const best = Math.max(score1, score2);
    if (best > highScore2P) {
      highScore2P = best;
      localStorage.setItem(HS_KEY_2P, highScore2P);
    }
  } else {
    if (score1 > highScore) {
      highScore = score1;
      localStorage.setItem(HS_KEY, highScore);
    }
  }
}

// Mode selection buttons wire up to startGame
onModeSelect(mode => { startGame(mode); });

// Mute buttons (on all screens) — init audio on first interaction if not already done
document.querySelectorAll('.mute-btn').forEach(btn => {
  btn.onclick = () => {
    audio.init();
    audio.playClick();
    audio.setMuted(!audio.isMuted());
    updateMuteButtons(audio.isMuted());
  };
});
updateMuteButtons(audio.isMuted());

window.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    if (state === 'playing') {
      state = 'paused';
      audio.pauseAmbient();
      const liveBest = gameMode === 2
        ? Math.max(highScore2P, score1, score2)
        : Math.max(highScore, barriers.floor);
      showPause(liveBest);
    } else if (state === 'paused') {
      state = 'playing';
      audio.resumeAmbient();
      hidePause();
    }
    return;
  }
  if (state === 'paused') { state = 'playing'; audio.resumeAmbient(); hidePause(); }
});

showStart(highScore, highScore2P);

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (state === 'countdown') {
    countdownTimer -= delta;
    const _label = countdownTimer > 0 ? Math.ceil(countdownTimer) : 'GO!';
    if (_label !== prevCountdownLabel) {
      prevCountdownLabel = _label;
      audio.playCountdownBeep(_label === 'GO!' ? 0 : _label);
    }
    showCountdown(_label);

    // Players can move during countdown to pre-position
    const spd = playerSpeed();
    player1.update(delta, gameMode === 2 ? keysWASD : keys, spd);
    if (gameMode === 2) player2.update(delta, keysArrows, spd);
    updateCamera(delta);
    updateEquation(barriers.getCurrentEquation());

    if (countdownTimer <= -0.6) {
      hideCountdown();
      state = 'playing';
    }
  }

  if (state === 'playing') {
    const spd = playerSpeed();

    if (!p1Dead) {
      player1.update(delta, gameMode === 2 ? keysWASD : keys, spd);
      if (barriers.checkCollision(player1.mesh.position.x, player1.mesh.position.z)) {
        p1Dead = true;
        score1 = barriers.floor;
        player1.mesh.visible = false;
        explode(player1.mesh.position.clone());
        audio.playDeath();
        if (gameMode === 2) setPlayerAlive(1, false);
      }
    }

    if (gameMode === 2 && !p2Dead) {
      player2.update(delta, keysArrows, spd);
      if (barriers.checkCollision(player2.mesh.position.x, player2.mesh.position.z)) {
        p2Dead = true;
        score2 = barriers.floor;
        player2.mesh.visible = false;
        explode(player2.mesh.position.clone());
        audio.playDeath();
        setPlayerAlive(2, false);
      }
    }

    updateCamera(delta);
    barriers.update(delta);
    updateEquation(barriers.getCurrentEquation());

    const allDead = p1Dead && (gameMode === 1 || p2Dead);
    if (allDead) {
      if (gameMode === 1) score1 = barriers.floor; // set 1P score on death
      onDeath();
    }
  }

  if (state === 'dead') {
    deathTimer -= delta;
    if (deathTimer <= 0) {
      if (gameMode === 2) {
        const best     = Math.max(score1, score2);
        const isNewBest = best === highScore2P && best > 0;
        showRetry(score1, highScore2P, isNewBest, score2);
      } else {
        const isNewBest = score1 === highScore && score1 > 0;
        showRetry(score1, highScore, isNewBest);
      }
    }
  }

  // Particles update regardless of state (handle mid-game explosions in 2P)
  updateParticles(delta);

  if (state === 'playing') {
    const shaftSpeed = barriers.pool.find(b => b.active)?.fallSpeed ?? BASE_FALL_SPEED;
    updateShaft(delta, shaftSpeed);
  }

  composer.render();
}

animate();
