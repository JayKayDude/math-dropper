import * as THREE from 'three';
import { scene } from './scene.js';
import { OBSIDIAN, TRON_RED } from './config.js';

const HALF = 10;
const BORDER = 4;
const OUTER = HALF + BORDER;

const RING_COUNT   = 14;
const RING_SPACING = 14;
const RING_TOP     = 16;
const RING_BOTTOM  = -(RING_COUNT - 1) * RING_SPACING;
const WALL_HEIGHT  = 80;
const WALL_MID_Y   = -25;

let _rings = [];

function ringOpacity(y) {
  return Math.max(0.05, 0.45 + y * 0.004);
}

// Ring square geometry (reused across all rings)
const _ringPoints = [
  new THREE.Vector3(-HALF, 0, -HALF),
  new THREE.Vector3( HALF, 0, -HALF),
  new THREE.Vector3( HALF, 0,  HALF),
  new THREE.Vector3(-HALF, 0,  HALF),
  new THREE.Vector3(-HALF, 0, -HALF),
];
const _ringGeo = new THREE.BufferGeometry().setFromPoints(_ringPoints);

export function createShaft() {
  const group = new THREE.Group();

  // Dark obsidian moat planes
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

  // Corner lines — doubled (two lines per corner, 0.06 units apart) so they
  // read as a thicker line on displays where 1px red blends into black.
  const cornerMat = new THREE.LineBasicMaterial({ color: TRON_RED, transparent: true, opacity: 0.5 });
  const corners = [
    [[-HALF, RING_TOP, -HALF], [-HALF, RING_BOTTOM, -HALF]],
    [[ HALF, RING_TOP, -HALF], [ HALF, RING_BOTTOM, -HALF]],
    [[-HALF, RING_TOP,  HALF], [-HALF, RING_BOTTOM,  HALF]],
    [[ HALF, RING_TOP,  HALF], [ HALF, RING_BOTTOM,  HALF]],
  ];
  // Offset direction for each corner: inward toward center in X
  const cornerOffsets = [0.06, -0.06, 0.06, -0.06];
  corners.forEach(([a, b], ci) => {
    for (const xOff of [0, cornerOffsets[ci]]) {
      const pa = new THREE.Vector3(a[0] + xOff, a[1], a[2]);
      const pb = new THREE.Vector3(b[0] + xOff, b[1], b[2]);
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([pa, pb]),
        cornerMat
      ));
    }
  });

  // Wall planes — MeshStandardMaterial so the player PointLight illuminates them.
  // Positioned 0.05 units outside the playfield edge to avoid z-fighting with rings.
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x111118, roughness: 0.6, metalness: 0.4, side: THREE.DoubleSide,
  });
  const WO = HALF + 0.05;
  [
    { pos: [-WO, WALL_MID_Y, 0],  ry:  Math.PI / 2 },
    { pos: [ WO, WALL_MID_Y, 0],  ry: -Math.PI / 2 },
    { pos: [0, WALL_MID_Y, -WO],  ry: 0             },
    { pos: [0, WALL_MID_Y,  WO],  ry: Math.PI       },
  ].forEach(({ pos, ry }) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, WALL_HEIGHT), wallMat);
    wall.position.set(...pos);
    wall.rotation.y = ry;
    group.add(wall);
  });

  // Animated depth rings — doubled (two lines per ring, 0.1 units apart in Y)
  // so they read as thicker on low-contrast displays.
  _rings = [];
  for (let i = 0; i < RING_COUNT; i++) {
    const y = -(i * RING_SPACING);
    for (const yOff of [0, 0.1]) {
      const mat = new THREE.LineBasicMaterial({
        color: TRON_RED, transparent: true, opacity: ringOpacity(y + yOff),
      });
      const ring = new THREE.Line(_ringGeo, mat);
      ring.position.y = y + yOff;
      _rings.push(ring);
      group.add(ring);
    }
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

  const lowestY = Math.min(..._rings.map(r => r.position.y));
  for (const ring of _rings) {
    if (ring.position.y > RING_TOP) {
      ring.position.y = lowestY - RING_SPACING;
    }
  }
}
