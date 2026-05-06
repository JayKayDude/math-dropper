import * as THREE from 'three';
import { scene } from './scene.js';
import { OBSIDIAN, TRON_RED } from './config.js';

const HALF = 10;
const BORDER = 4;
const OUTER = HALF + BORDER;

const RING_COUNT   = 14;
const RING_SPACING = 14;
const RING_TOP     = 16;  // recycle just after clearing the camera at Y=13
const RING_BOTTOM  = -(RING_COUNT - 1) * RING_SPACING;

let _rings = [];

function ringOpacity(y) {
  return Math.max(0.03, 0.35 + y * 0.004); // brighter near Y=0, fades with depth
}

export function createShaft() {
  const group = new THREE.Group();

  // Dark obsidian moat planes around the playfield
  const moatMat = new THREE.MeshBasicMaterial({ color: OBSIDIAN });
  [
    { w: BORDER * 2, d: OUTER * 2, x: -(HALF + BORDER), z: 0 },
    { w: BORDER * 2, d: OUTER * 2, x:  (HALF + BORDER), z: 0 },
    { w: HALF * 2,   d: BORDER * 2, x: 0, z: -(HALF + BORDER) },
    { w: HALF * 2,   d: BORDER * 2, x: 0, z:  (HALF + BORDER) },
  ].forEach(({ w, d, x, z }) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), moatMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, -0.15, z);
    group.add(mesh);
  });


  // Corner lines — span from well past camera down to the deep bottom
  const cornerMat = new THREE.LineBasicMaterial({ color: TRON_RED, transparent: true, opacity: 0.15 });
  [
    [[-HALF, RING_TOP, -HALF], [-HALF, RING_BOTTOM, -HALF]],
    [[ HALF, RING_TOP, -HALF], [ HALF, RING_BOTTOM, -HALF]],
    [[-HALF, RING_TOP,  HALF], [-HALF, RING_BOTTOM,  HALF]],
    [[ HALF, RING_TOP,  HALF], [ HALF, RING_BOTTOM,  HALF]],
  ].forEach(([a, b]) => {
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]),
      cornerMat
    ));
  });

  // Animated depth rings — scroll upward to simulate movement
  _rings = [];
  for (let i = 0; i < RING_COUNT; i++) {
    const y = -(i * RING_SPACING);
    const mat = new THREE.LineBasicMaterial({
      color: TRON_RED, transparent: true, opacity: ringOpacity(y),
    });
    const ring = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-HALF, 0, -HALF),
        new THREE.Vector3( HALF, 0, -HALF),
        new THREE.Vector3( HALF, 0,  HALF),
        new THREE.Vector3(-HALF, 0,  HALF),
        new THREE.Vector3(-HALF, 0, -HALF),
      ]),
      mat
    );
    ring.position.y = y;
    _rings.push(ring);
    group.add(ring);
  }

  scene.add(group);
  return group;
}

export function updateShaft(delta, fallSpeed) {
  if (!_rings.length) return;

  for (const ring of _rings) {
    ring.position.y += fallSpeed * delta;
    ring.material.opacity = ringOpacity(ring.position.y);
  }

  // Recycle any ring that has scrolled past the camera
  const lowestY = Math.min(..._rings.map(r => r.position.y));
  for (const ring of _rings) {
    if (ring.position.y > RING_TOP) {
      ring.position.y = lowestY - RING_SPACING;
    }
  }
}
