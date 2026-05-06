import * as THREE from 'three';
import { scene } from './scene.js';
import { BARRIER_THICKNESS, BARRIER_Y_PLAYER, PLAYFIELD_HALF, PLAYER_RADIUS } from './config.js';
import { isSolid, glsl, FuncType } from './mathFunctions.js';

const SIZE = PLAYFIELD_HALF * 2;

function buildShader(funcType) {
  const solidSnippet = glsl[funcType] ?? glsl[FuncType.RATIONAL];
  return {
    vertexShader: `
      varying vec2 vXZ;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vXZ = world.xz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform float uH, uK, uA, uB, uEdgeWidth, uFade, uAngle;
      varying vec2 vXZ;

      void main() {
        // World coords — used for playfield edge glow only.
        float wx = vXZ.x;
        float wz = vXZ.y;

        // Rotate coordinate frame so the function spins (identity when uAngle=0).
        float cosA = cos(uAngle);
        float sinA = sin(uAngle);
        float x = wx * cosA - wz * sinA;
        float z = wx * sinA + wz * cosA;

        bool  solid   = false;
        float d_curve = 9999.0;

        ${solidSnippet}

        if (!solid) discard;

        // Edge glow: curve boundary distance (rotated frame) + playfield edges (world frame).
        float d_edge = min(min(10.0 - wx, wx + 10.0), min(10.0 - wz, wz + 10.0));
        float dist = min(d_curve, d_edge);
        float edge = 1.0 - smoothstep(0.0, uEdgeWidth, dist);

        vec3 fill  = vec3(0.45, 0.0, 0.06);
        vec3 glow  = vec3(1.0, 0.2, 0.3);
        vec3 color = mix(fill, glow, edge);
        float alpha = mix(0.22, 0.95, edge) * uFade;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  };
}

const CLEARANCE = PLAYER_RADIUS * 1.5; // minimum navigable gap radius

// Returns true if the playfield contains at least one point with enough
// clearance for the player — i.e. a non-solid point whose 4 cardinal
// neighbours (at CLEARANCE distance) are also non-solid.
function isPassable(funcType, params) {
  for (let x = -9; x <= 9; x += 2) {
    for (let z = -9; z <= 9; z += 2) {
      if (isSolid(x, z, funcType, params)) continue;
      if (!isSolid(x + CLEARANCE, z, funcType, params) &&
          !isSolid(x - CLEARANCE, z, funcType, params) &&
          !isSolid(x, z + CLEARANCE, funcType, params) &&
          !isSolid(x, z - CLEARANCE, funcType, params)) {
        return true;
      }
    }
  }
  return false;
}


export class Barrier {
  constructor() {
    this.funcType = FuncType.RATIONAL;
    this.params = { h: 0, k: 0, a: 1, b: 1 };
    this.baseParams = { h: 0, k: 0, a: 1, b: 1 };
    this.animAmplitude = 0;
    this.animFrequency = 0.4;
    this.animPhase = Math.random() * Math.PI * 2;
    this.animTime = 0;
    this.fallSpeed = 4;
    this.spinSpeed = 0;
    this.spinAngle = 0;
    this.active = false;
    this.passed = false;

    const { vertexShader, fragmentShader } = buildShader(FuncType.RATIONAL);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uH: { value: 0 }, uK: { value: 0 },
        uA: { value: 1 }, uB: { value: 1 },
        uEdgeWidth: { value: 0.4 },
        uFade:  { value: 1.0 },
        uAngle: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const geo = new THREE.BoxGeometry(SIZE, BARRIER_THICKNESS, SIZE);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  reset(y, funcType, params, animAmplitude, animFrequency, fallSpeed, edgeWidth, spinSpeed = 0) {
    this.funcType = funcType;
    this.baseParams = { ...params };
    this.params = { ...params };
    this.animAmplitude = animAmplitude;
    this.animFrequency = animFrequency;
    this.animTime = 0;
    this.animPhase = Math.random() * Math.PI * 2;
    this.fallSpeed = fallSpeed;
    this.spinSpeed = spinSpeed;
    this.spinAngle = 0;
    this.active = true;
    this.passed = false;

    const { vertexShader, fragmentShader } = buildShader(funcType);
    this.material.vertexShader = vertexShader;
    this.material.fragmentShader = fragmentShader;
    this.material.needsUpdate = true;
    this.material.uniforms.uEdgeWidth.value = edgeWidth;
    this.material.uniforms.uFade.value  = 1.0;
    this.material.uniforms.uAngle.value = 0.0;
    this._syncUniforms();

    this.mesh.position.y = y;
    this.mesh.visible = true;
  }

  update(delta) {
    if (!this.active) return;
    this.mesh.position.y += this.fallSpeed * delta;
    this.animTime += delta;

    if (this.mesh.position.y < BARRIER_Y_PLAYER) {
      const dist = BARRIER_Y_PLAYER - this.mesh.position.y;
      this.material.uniforms.uFade.value = 0.12 + 0.88 * Math.max(0, 1.0 - dist / 80.0);
    } else {
      this.material.uniforms.uFade.value = 1.0;
    }

    if (this.animAmplitude > 0) {
      const t      = this.animTime * this.animFrequency + this.animPhase;
      const idealH = Math.max(-8, Math.min(8, this.baseParams.h + Math.sin(t) * this.animAmplitude));
      const idealK = Math.max(-8, Math.min(8, this.baseParams.k + Math.cos(t * 0.8) * this.animAmplitude * 0.6));

      if (isPassable(this.funcType, { ...this.params, h: idealH, k: idealK })) {
        this.params.h = idealH;
        this.params.k = idealK;
      } else {
        // Binary search for the furthest passable position along the movement direction.
        // lo=0 is the current (known valid) position; hi=1 is the ideal (invalid) position.
        let lo = 0, hi = 1;
        for (let i = 0; i < 6; i++) {
          const mid = (lo + hi) * 0.5;
          const mH  = this.params.h + (idealH - this.params.h) * mid;
          const mK  = this.params.k + (idealK - this.params.k) * mid;
          if (isPassable(this.funcType, { ...this.params, h: mH, k: mK })) lo = mid;
          else hi = mid;
        }
        this.params.h += (idealH - this.params.h) * lo;
        this.params.k += (idealK - this.params.k) * lo;
      }
      this._syncUniforms();
    }

    if (this.spinSpeed !== 0) {
      this.spinAngle += this.spinSpeed * delta;
      this.material.uniforms.uAngle.value = this.spinAngle;
    }
  }

  checkCollision(px, pz) {
    // Rotate player into the barrier's coordinate frame before testing.
    if (this.spinAngle !== 0) {
      const c = Math.cos(this.spinAngle);
      const s = Math.sin(this.spinAngle);
      const rx = px * c - pz * s;
      const rz = px * s + pz * c;
      return isSolid(rx, rz, this.funcType, this.params);
    }
    return isSolid(px, pz, this.funcType, this.params);
  }

  get y() { return this.mesh.position.y; }

  deactivate() {
    this.active = false;
    this.mesh.visible = false;
  }

  _syncUniforms() {
    this.material.uniforms.uH.value = this.params.h;
    this.material.uniforms.uK.value = this.params.k;
    this.material.uniforms.uA.value = this.params.a;
    this.material.uniforms.uB.value = this.params.b;
  }
}
