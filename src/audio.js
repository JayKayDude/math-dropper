// Background music via Web Audio API BufferSource (gapless loop).
// Sound effects (countdown beeps, death) via Web Audio API.

import { getMusicVolume, getSFXVolume } from './settings.js';

let ctx        = null;
let masterGain = null;
let reverbNode = null;
let bgGain     = null;
let bgBuffers  = [];   // decoded buffers for each track
let bgTrack    = 0;    // index of currently playing track
let bgSource   = null;
let _muted  = localStorage.getItem('mathDropper_muted') === 'true';
let _ducked = false;  // true when ambient is paused (death / ESC)

const BG_TRACKS = ['/audio/Glass Pulse.mp3', '/audio/Glass Pulse 2.mp3'];

let trackVol = getMusicVolume();

// ── Helpers ───────────────────────────────────────────────────────────────────

function createIR(duration = 2.0, decay = 2.0) {
  const len = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function now() { return ctx.currentTime; }

function sineShot(freq, startTime, duration, peakGain, dest) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

// Trim encoder-delay silence from a decoded PCM buffer so loop points land
// on the actual audio content.  Returns { loopStart, loopEnd } in seconds.
function findLoopPoints(buffer, threshold = 0.001) {
  const sr  = buffer.sampleRate;
  const ch  = buffer.getChannelData(0);
  const len = ch.length;

  let start = 0;
  while (start < len && Math.abs(ch[start]) < threshold) start++;

  let end = len - 1;
  while (end > start && Math.abs(ch[end]) < threshold) end--;

  return { loopStart: start / sr, loopEnd: (end + 1) / sr };
}

function setGain(gainNode, value, rampTime = 0) {
  const t = now();
  gainNode.gain.cancelScheduledValues(t);
  // Snapshot the true current value before cancelling scheduled events.
  gainNode.gain.setValueAtTime(gainNode.gain.value, t);
  if (rampTime > 0) {
    gainNode.gain.linearRampToValueAtTime(value, t + rampTime);
  } else {
    gainNode.gain.setValueAtTime(value, t);
  }
}

function startBGSource() {
  if (!bgBuffers.length || !bgGain) return;
  const buf = bgBuffers[bgTrack % bgBuffers.length];
  if (!buf) return;
  bgSource = ctx.createBufferSource();
  bgSource.buffer = buf;
  bgSource.loop   = false;
  bgSource.connect(bgGain);
  bgSource.onended = () => {
    bgTrack = (bgTrack + 1) % bgBuffers.length;
    startBGSource();
  };
  bgSource.start();
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function init() {
  if (ctx) return;

  ctx = new AudioContext();
  ctx.resume();  // required for Safari and Chrome autoplay policy

  masterGain = ctx.createGain();
  masterGain.gain.value = _muted ? 0 : getSFXVolume();
  masterGain.connect(ctx.destination);

  reverbNode = ctx.createConvolver();
  reverbNode.buffer = createIR();
  const reverbOut = ctx.createGain();
  reverbOut.gain.value = 0.3;
  reverbNode.connect(reverbOut);
  reverbOut.connect(masterGain);

  bgGain = ctx.createGain();
  bgGain.gain.value = 0;
  bgGain.connect(ctx.destination);

  Promise.all(BG_TRACKS.map(url =>
    fetch(url).then(r => r.arrayBuffer()).then(ab => ctx.decodeAudioData(ab))
  )).then(buffers => {
    bgBuffers = buffers;
    bgTrack   = 0;
    startBGSource();
    if (!_muted) {
      const t = now();
      bgGain.gain.setValueAtTime(0, t);
      bgGain.gain.linearRampToValueAtTime(trackVol, t + 3);
    }
  }).catch(err => console.warn('[audio] bgm load failed:', err));
}

// ── Mute ──────────────────────────────────────────────────────────────────────

export function isMuted() { return _muted; }

export function setMuted(muted) {
  _muted = muted;
  localStorage.setItem('mathDropper_muted', muted);
  if (bgGain) {
    const target = muted ? 0 : (_ducked ? trackVol * 0.25 : trackVol);
    setGain(bgGain, target, 0.15);
  }
  if (masterGain) {
    setGain(masterGain, muted ? 0 : getSFXVolume(), 0.15);
  }
}

export function setMusicVolume(v) {
  trackVol = v;
  if (bgGain && !_muted && !_ducked) setGain(bgGain, v);
}

export function setSFXVolume(v) {
  if (masterGain && !_muted) setGain(masterGain, v);
}

// ── Ambient duck / restore ────────────────────────────────────────────────────

export function pauseAmbient() {
  _ducked = true;
  if (bgGain && !_muted) setGain(bgGain, trackVol * 0.25, 0.1);
}

export function resumeAmbient() {
  _ducked = false;
  if (bgGain && !_muted) setGain(bgGain, trackVol, 0.1);
}

// ── Sound effects ─────────────────────────────────────────────────────────────

export function playCountdownBeep(n) {
  if (!ctx) return;
  const out = ctx.createGain();
  out.gain.value = 0.45;
  out.connect(masterGain);
  if (n === 0) {
    sineShot(990, now(), 0.22, 1.0, out);
  } else {
    sineShot(660, now(), 0.09, 1.0, out);
  }
}

export function playDeath() {
  if (!ctx) return;
  const t = now();
  const out = ctx.createGain();
  out.gain.value = 0.8;
  out.connect(masterGain);

  const bufLen   = ctx.sampleRate * 0.5;
  const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data     = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

  const src       = ctx.createBufferSource();
  src.buffer      = noiseBuf;
  const bp        = ctx.createBiquadFilter();
  bp.type         = 'bandpass';
  bp.frequency.value = 800;
  bp.Q.value      = 2;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.6, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  src.connect(bp); bp.connect(noiseGain); noiseGain.connect(out);
  src.start(t); src.stop(t + 0.25);

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type   = 'sine';
  osc.frequency.setValueAtTime(500, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
  gain.gain.setValueAtTime(0.7, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  osc.connect(gain); gain.connect(out);
  osc.start(t); osc.stop(t + 0.52);
}
