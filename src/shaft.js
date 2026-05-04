import * as THREE from 'three';
import { scene } from './scene.js';
import { OBSIDIAN, TRON_RED } from './config.js';

const HALF = 10;
const HEIGHT = 120;

export function createShaft() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: OBSIDIAN,
    metalness: 0.6,
    roughness: 0.4,
    side: THREE.BackSide,
  });

  const wallGeo = new THREE.PlaneGeometry(HALF * 2, HEIGHT);

  // 4 walls
  const walls = [
    { pos: [-HALF, 0, 0], rot: [0,  Math.PI / 2, 0] },
    { pos: [ HALF, 0, 0], rot: [0, -Math.PI / 2, 0] },
    { pos: [0, 0, -HALF], rot: [0, 0, 0] },
    { pos: [0, 0,  HALF], rot: [0, Math.PI, 0] },
  ];

  for (const { pos, rot } of walls) {
    const mesh = new THREE.Mesh(wallGeo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    group.add(mesh);
  }

  // Glowing corner edge lines
  const edgeMat = new THREE.LineBasicMaterial({ color: TRON_RED, transparent: true, opacity: 0.25 });
  const corners = [
    [[-HALF, -HEIGHT/2, -HALF], [-HALF, HEIGHT/2, -HALF]],
    [[ HALF, -HEIGHT/2, -HALF], [ HALF, HEIGHT/2, -HALF]],
    [[-HALF, -HEIGHT/2,  HALF], [-HALF, HEIGHT/2,  HALF]],
    [[ HALF, -HEIGHT/2,  HALF], [ HALF, HEIGHT/2,  HALF]],
  ];
  for (const [a, b] of corners) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...a),
      new THREE.Vector3(...b),
    ]);
    group.add(new THREE.Line(geo, edgeMat));
  }

  scene.add(group);
  return group;
}
