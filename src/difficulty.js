import { FuncType } from './mathFunctions.js';
import { BASE_FALL_SPEED, MAX_FALL_SPEED } from './config.js';

export function getDifficulty(floor) {
  const f = floor;

  let funcType = FuncType.RATIONAL;
  if (f >= 121) funcType = FuncType.LOGARITHMIC;
  else if (f >= 81) funcType = FuncType.LOGARITHMIC;
  else if (f >= 51) funcType = FuncType.EXPONENTIAL;
  else if (f >= 31) funcType = FuncType.RATIONAL_D;
  else if (f >= 16) funcType = FuncType.RATIONAL_T;

  const fallSpeed = Math.min(MAX_FALL_SPEED, BASE_FALL_SPEED + f * 0.06);

  // animAmplitude: 0 for first 5 floors, ramps up
  const animAmplitude = f <= 5 ? 0 : Math.min(2.5, (f - 5) * 0.04);
  const animFrequency = 0.4 + Math.min(0.8, f * 0.005);

  // Scale (a param) for dilated/exp/log
  const a = funcType === FuncType.RATIONAL_D ? 1 + Math.min(1, (f - 31) * 0.03) : 1;
  const b = funcType === FuncType.RATIONAL_D ? 1 : 0.3 + Math.min(0.4, f * 0.002);

  // h offset for translated (oscillates around 0, but base offset cycles)
  const h = funcType === FuncType.RATIONAL_T ? (Math.random() - 0.5) * 2 : 0;
  const k = funcType === FuncType.RATIONAL_T ? (Math.random() - 0.5) * 2 : 0;

  const edgeWidth = Math.max(0.15, 0.5 - f * 0.003);

  return { funcType, fallSpeed, params: { h, k, a, b }, animAmplitude, animFrequency, edgeWidth };
}
