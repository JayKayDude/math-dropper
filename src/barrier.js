import * as THREE from 'three';
import { scene } from './scene.js';
import { BARRIER_THICKNESS, BARRIER_Y_PLAYER, FREEZE_DISTANCE, PLAYFIELD_HALF } from './config.js';
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
      uniform float uH, uK, uA, uB, uEdgeWidth;
      varying vec2 vXZ;

      void main() {
        float x = vXZ.x;
        float z = vXZ.y;
        bool solid = false;
        float boundary = 0.0;

        ${solidSnippet}

        if (!solid) discard;

        float dist = abs(z - boundary);
        float edge = 1.0 - smoothstep(0.0, uEdgeWidth, dist);

        vec3 fill = vec3(0.7, 0.04, 0.1);
        vec3 glow = vec3(1.0, 0.15, 0.25);
        vec3 color = mix(fill, glow, edge);
        float alpha = mix(0.18, 1.0, edge);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  };
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
    this.active = false;

    const { vertexShader, fragmentShader } = buildShader(FuncType.RATIONAL);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uH: { value: 0 }, uK: { value: 0 },
        uA: { value: 1 }, uB: { value: 1 },
        uEdgeWidth: { value: 0.4 },
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

  reset(y, funcType, params, animAmplitude, animFrequency, fallSpeed, edgeWidth) {
    this.funcType = funcType;
    this.baseParams = { ...params };
    this.params = { ...params };
    this.animAmplitude = animAmplitude;
    this.animFrequency = animFrequency;
    this.animTime = 0;
    this.animPhase = Math.random() * Math.PI * 2;
    this.fallSpeed = fallSpeed;
    this.active = true;

    // Rebuild shader for this function type
    const { vertexShader, fragmentShader } = buildShader(funcType);
    this.material.vertexShader = vertexShader;
    this.material.fragmentShader = fragmentShader;
    this.material.needsUpdate = true;
    this.material.uniforms.uEdgeWidth.value = edgeWidth;
    this._syncUniforms();

    this.mesh.position.y = y;
    this.mesh.visible = true;
  }

  update(delta) {
    if (!this.active) return;
    this.mesh.position.y += this.fallSpeed * delta;
    this.animTime += delta;

    const frozen = this.mesh.position.y > BARRIER_Y_PLAYER - FREEZE_DISTANCE;
    if (!frozen && this.animAmplitude > 0) {
      const t = this.animTime * this.animFrequency + this.animPhase;
      this.params.h = this.baseParams.h + Math.sin(t) * this.animAmplitude;
      this.params.k = this.baseParams.k + Math.cos(t * 0.7) * this.animAmplitude * 0.5;
      this._syncUniforms();
    }
  }

  checkCollision(px, pz) {
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
