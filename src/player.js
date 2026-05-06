import * as THREE from 'three';
import { scene } from './scene.js';
import { PLAYER_RADIUS, PLAYER_SPEED, PLAYFIELD_HALF, TRON_CYAN } from './config.js';

const geo = new THREE.SphereGeometry(PLAYER_RADIUS, 16, 16);
const mat = new THREE.MeshStandardMaterial({
  color: TRON_CYAN,
  emissive: TRON_CYAN,
  emissiveIntensity: 1.5,
});

export const playerMesh = new THREE.Mesh(geo, mat);
playerMesh.position.set(0, PLAYER_RADIUS, 0);

const light = new THREE.PointLight(TRON_CYAN, 3, 6);
playerMesh.add(light);

scene.add(playerMesh);

const vel = new THREE.Vector2(0, 0);

export function updatePlayer(delta, keys, maxSpeed = PLAYER_SPEED) {
  const accel = maxSpeed * 5;
  const drag  = maxSpeed * 3.5;

  if (keys.left)  vel.x -= accel * delta;
  if (keys.right) vel.x += accel * delta;
  if (keys.up)    vel.y -= accel * delta;
  if (keys.down)  vel.y += accel * delta;

  if (!keys.left && !keys.right) {
    const dx = drag * delta;
    vel.x = Math.abs(vel.x) <= dx ? 0 : vel.x - Math.sign(vel.x) * dx;
  }
  if (!keys.up && !keys.down) {
    const dz = drag * delta;
    vel.y = Math.abs(vel.y) <= dz ? 0 : vel.y - Math.sign(vel.y) * dz;
  }

  vel.x = Math.max(-maxSpeed, Math.min(maxSpeed, vel.x));
  vel.y = Math.max(-maxSpeed, Math.min(maxSpeed, vel.y));

  const limit = PLAYFIELD_HALF - PLAYER_RADIUS;
  playerMesh.position.x = Math.max(-limit, Math.min(limit, playerMesh.position.x + vel.x * delta));
  playerMesh.position.z = Math.max(-limit, Math.min(limit, playerMesh.position.z + vel.y * delta));
}

export function resetPlayer() {
  vel.set(0, 0);
  playerMesh.position.set(0, PLAYER_RADIUS, 0);
  playerMesh.visible = true;
}
