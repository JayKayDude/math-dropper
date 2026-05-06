import * as THREE from 'three';
import { scene } from './scene.js';
import { PLAYER_RADIUS, PLAYER_SPEED, PLAYFIELD_HALF } from './config.js';

export function createPlayer(color, startX = 0) {
  const geo  = new THREE.SphereGeometry(PLAYER_RADIUS, 16, 16);
  const mat  = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.5 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(startX, PLAYER_RADIUS, 0);
  mesh.add(new THREE.PointLight(color, 3, 6));
  scene.add(mesh);

  const vel = new THREE.Vector2(0, 0);

  return {
    mesh,
    update(delta, keys, maxSpeed = PLAYER_SPEED) {
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
      mesh.position.x = Math.max(-limit, Math.min(limit, mesh.position.x + vel.x * delta));
      mesh.position.z = Math.max(-limit, Math.min(limit, mesh.position.z + vel.y * delta));
    },
    reset() {
      vel.set(0, 0);
      mesh.position.set(startX, PLAYER_RADIUS, 0);
      mesh.visible = true;
    },
    remove() {
      scene.remove(mesh);
    },
  };
}
