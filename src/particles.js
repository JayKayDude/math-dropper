import * as THREE from 'three';
import { scene } from './scene.js';

const COUNT = 120;
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const velocities = new Array(COUNT * 3).fill(0);
let lifetimes = new Float32Array(COUNT);
let active = false;

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({
  size: 0.2,
  vertexColors: true,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const points = new THREE.Points(geo, mat);
points.visible = false;
scene.add(points);

// Palette: mix cyan and red
const palette = [
  [0, 1, 0.93],  // cyan
  [1, 0.13, 0.27], // red
];

export function explode(position) {
  // If already active (e.g. two players die simultaneously), use the second
  // half of the pool so both explosions are visible at once.
  const start = active ? COUNT >> 1 : 0;
  mat.opacity = 1;
  active = true;
  points.visible = true;

  for (let i = start; i < COUNT; i++) {
    positions[i*3]   = position.x;
    positions[i*3+1] = position.y;
    positions[i*3+2] = position.z;

    const c = palette[Math.random() < 0.5 ? 0 : 1];
    colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];

    const theta = Math.random() * Math.PI * 2;
    const phi   = (Math.random() - 0.5) * Math.PI;
    const speed = 3 + Math.random() * 8;
    velocities[i*3]   = Math.cos(phi) * Math.cos(theta) * speed;
    velocities[i*3+1] = Math.sin(phi) * speed;
    velocities[i*3+2] = Math.cos(phi) * Math.sin(theta) * speed;

    lifetimes[i] = 0.6 + Math.random() * 0.4;
  }
  geo.attributes.position.needsUpdate = true;
  geo.attributes.color.needsUpdate = true;
}

export function updateParticles(delta) {
  if (!active) return;
  let anyAlive = false;
  for (let i = 0; i < COUNT; i++) {
    lifetimes[i] -= delta;
    if (lifetimes[i] <= 0) continue;
    anyAlive = true;
    positions[i*3]   += velocities[i*3]   * delta;
    positions[i*3+1] += velocities[i*3+1] * delta;
    positions[i*3+2] += velocities[i*3+2] * delta;
    velocities[i*3+1] -= 4 * delta; // gravity
  }
  mat.opacity = Math.max(0, mat.opacity - delta * 1.2);
  geo.attributes.position.needsUpdate = true;

  if (!anyAlive) {
    active = false;
    points.visible = false;
  }
}
