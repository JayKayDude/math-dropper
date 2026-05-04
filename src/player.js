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

export function updatePlayer(delta, keys) {
  const limit = PLAYFIELD_HALF - PLAYER_RADIUS;
  if (keys.left)  playerMesh.position.x -= PLAYER_SPEED * delta;
  if (keys.right) playerMesh.position.x += PLAYER_SPEED * delta;
  if (keys.up)    playerMesh.position.z -= PLAYER_SPEED * delta;
  if (keys.down)  playerMesh.position.z += PLAYER_SPEED * delta;
  playerMesh.position.x = Math.max(-limit, Math.min(limit, playerMesh.position.x));
  playerMesh.position.z = Math.max(-limit, Math.min(limit, playerMesh.position.z));
}

export function resetPlayer() {
  playerMesh.position.set(0, PLAYER_RADIUS, 0);
  playerMesh.visible = true;
}
