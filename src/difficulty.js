import { FuncType } from './mathFunctions.js';
import { BASE_FALL_SPEED, MAX_FALL_SPEED } from './config.js';

// Pairs unlock together. Most pairs start at floor 0 for immediate variety.
// Every few floors the remaining harder shapes enter the pool.
const UNLOCK_SCHEDULE = [
  { at: 0, pair: [FuncType.RATIONAL,      FuncType.RATIONAL_INV]     },
  { at: 0, pair: [FuncType.RATIONAL_NEG,  FuncType.RATIONAL_NEG_INV] },
  { at: 0, pair: [FuncType.LINEAR,        FuncType.LINEAR_INV]       },
  { at: 0, pair: [FuncType.QUADRATIC,     FuncType.QUADRATIC_INV]    },
  { at: 0, pair: [FuncType.QUADRATIC_NEG, FuncType.QUADRATIC_NEG_INV]},
  { at: 0, pair: [FuncType.ABS,           FuncType.ABS_INV]          },
  { at: 0, pair: [FuncType.ABS_NEG,       FuncType.ABS_NEG_INV]      },
  { at: 0, pair: [FuncType.CIRCLE,        FuncType.CIRCLE_INV]       },
  { at: 0, pair: [FuncType.SINE,          FuncType.SINE_INV]         },
  { at: 3, pair: [FuncType.RATIONAL_T,    FuncType.RATIONAL_T_INV]   },
  { at: 3, pair: [FuncType.RATIONAL_D,    FuncType.RATIONAL_D_INV]   },
  { at: 3, pair: [FuncType.CUBIC,         FuncType.CUBIC_INV]        },
  { at: 3, pair: [FuncType.CUBIC_NEG,    FuncType.CUBIC_NEG_INV]    },
  { at: 6, pair: [FuncType.EXPONENTIAL,   FuncType.EXP_BELOW]        },
  { at: 9, pair: [FuncType.LOGARITHMIC,   FuncType.LOG_BELOW]        },
];

export function getPool(floor) {
  return UNLOCK_SCHEDULE
    .filter(u => floor >= u.at)
    .flatMap(u => u.pair);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function getDifficulty(floor, forcedType = undefined) {
  const f = floor;
  const funcType = forcedType !== undefined ? forcedType : pick(getPool(f));

  const fallSpeed     = Math.min(MAX_FALL_SPEED, BASE_FALL_SPEED * (1.0 + 0.01 * f + 0.0005 * f * f));
  const animAmplitude = f === 0 ? 0 : Math.min(10.0, f * 0.9);
  const animFrequency = 1.0 + Math.min(3.5, f * 0.08);
  const baseA         = Math.max(0.55, 1.6 - f * 0.04);

  let h = 0, k = 0, a = baseA, b = 1;

  if (funcType === FuncType.RATIONAL_NEG || funcType === FuncType.RATIONAL_NEG_INV) {
    a = -baseA;

  } else if (funcType === FuncType.RATIONAL_T || funcType === FuncType.RATIONAL_T_INV) {
    const hRange = 3.0 + Math.min(5.0, f * 0.35);
    const kRange = 1.0 + Math.min(3.0, f * 0.2);
    h = (Math.random() < 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.3) * hRange;
    k = (Math.random() - 0.5) * 2 * kRange;

  } else if (funcType === FuncType.RATIONAL_D || funcType === FuncType.RATIONAL_D_INV) {
    b = 0.5 + Math.random() * Math.min(2.5, 0.5 + f * 0.12);

  } else if (funcType === FuncType.EXPONENTIAL || funcType === FuncType.EXP_BELOW) {
    b = 0.15 + Math.random() * 0.25;
    k = (Math.random() - 0.5) * 4;

  } else if (funcType === FuncType.LOGARITHMIC || funcType === FuncType.LOG_BELOW) {
    h = -5 + Math.random() * 4;
    k = (Math.random() - 0.5) * 3;

  } else if (funcType === FuncType.LINEAR || funcType === FuncType.LINEAR_INV) {
    // Slope ±0.3–2.0; steepens slightly with floor.
    const slopeMax = 0.5 + Math.min(1.5, f * 0.1);
    a = (Math.random() < 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.7) * slopeMax;
    k = (Math.random() - 0.5) * 6;

  } else if (funcType === FuncType.QUADRATIC || funcType === FuncType.QUADRATIC_INV) {
    a = 0.04 + Math.random() * Math.min(0.15, 0.04 + f * 0.005);
    h = (Math.random() - 0.5) * 8;
    k = (Math.random() - 0.5) * 5;

  } else if (funcType === FuncType.QUADRATIC_NEG || funcType === FuncType.QUADRATIC_NEG_INV) {
    // Negative a → downward arch. Offset k upward so the arch is visible.
    a = -(0.04 + Math.random() * Math.min(0.15, 0.04 + f * 0.005));
    h = (Math.random() - 0.5) * 8;
    k = 2 + Math.random() * 4;  // arch peaks above centre

  } else if (funcType === FuncType.CUBIC || funcType === FuncType.CUBIC_INV) {
    a = 0.002 + Math.random() * Math.min(0.008, 0.003 + f * 0.0003);
    h = (Math.random() - 0.5) * 6;

  } else if (funcType === FuncType.CUBIC_NEG || funcType === FuncType.CUBIC_NEG_INV) {
    // Negative a → S-curve mirrored left-right
    a = -(0.002 + Math.random() * Math.min(0.008, 0.003 + f * 0.0003));
    h = (Math.random() - 0.5) * 6;

  } else if (funcType === FuncType.ABS || funcType === FuncType.ABS_INV) {
    a = 0.3 + Math.random() * Math.min(1.4, 0.4 + f * 0.07);
    h = (Math.random() - 0.5) * 6;
    if (funcType === FuncType.ABS_INV) {
      // ABS_INV gap (z ≥ a|x-h|+k) shrinks outward — must exist at |x-h|=10.
      // Worst-case k rises by animAmplitude*0.6 during animation.
      const kCeil = (1 - a) * 10 - 3.0 - animAmplitude * 0.6;
      k = kCeil - Math.random() * 1.5;
    } else {
      k = (Math.random() - 0.5) * 5;
    }

  } else if (funcType === FuncType.ABS_NEG || funcType === FuncType.ABS_NEG_INV) {
    a = -(0.3 + Math.random() * Math.min(1.2, 0.3 + f * 0.07));
    h = (Math.random() - 0.5) * 4;
    if (funcType === FuncType.ABS_NEG) {
      // ABS_NEG gap (z ≤ a|x-h|+k) shrinks outward — must exist at |x-h|=10.
      // Worst-case k drops by animAmplitude*0.6 during animation.
      const absA = Math.abs(a);
      const kFloor = (absA - 1) * 10 + 3.0 + animAmplitude * 0.6;
      k = kFloor + Math.random() * 1.5;
    } else {
      k = (Math.random() - 0.5) * 4;
    }

  } else if (funcType === FuncType.CIRCLE || funcType === FuncType.CIRCLE_INV) {
    // a = radius (3.5–6.5).  Center shifts more with floor.
    a = 3.5 + Math.random() * 3.0;
    const shift = Math.min(3.5, f * 0.25);
    h = (Math.random() - 0.5) * 2 * shift;
    k = (Math.random() - 0.5) * 2 * shift;

  } else if (funcType === FuncType.SINE || funcType === FuncType.SINE_INV) {
    // Amplitude 2–5; frequency 0.3–1.1.
    a = 2.0 + Math.random() * Math.min(3.0, 1.0 + f * 0.2);
    b = 0.3 + Math.random() * Math.min(0.8, 0.3 + f * 0.05);
    k = (Math.random() - 0.5) * 3;
  }

  // Spinning starts 5 floors after parameter animation (which begins floor 1),
  // so floor 6+. 25% chance per barrier; speed grows slightly with floor.
  let spinSpeed = 0;
  if (f >= 6 && Math.random() < 0.25) {
    spinSpeed = 0.4 + Math.random() * Math.min(1.2, 0.3 + f * 0.04);
  }

  return {
    funcType,
    fallSpeed,
    spinSpeed,
    params: { h, k, a, b },
    animAmplitude,
    animFrequency,
    edgeWidth: Math.max(0.12, 0.5 - f * 0.006),
  };
}
