export const FuncType = {
  RATIONAL:         0,   // y > a/x
  RATIONAL_INV:     1,   // y < a/x
  RATIONAL_NEG:     2,   // y > a/x  (a < 0 → branches in Q2/Q4)
  RATIONAL_NEG_INV: 3,   // y < a/x  (a < 0)
  RATIONAL_T:       4,   // y > a/(x-h)+k
  RATIONAL_T_INV:   5,   // y < a/(x-h)+k
  RATIONAL_D:       6,   // y > a/(bx)
  RATIONAL_D_INV:   7,   // y < a/(bx)
  EXPONENTIAL:      8,   // y > a·e^(bx)+k
  EXP_BELOW:        9,   // y < a·e^(bx)+k
  LOGARITHMIC:      10,  // y > a·ln(x-h)+k
  LOG_BELOW:        11,  // y < a·ln(x-h)+k
  LINEAR:           12,  // y > ax+k
  LINEAR_INV:       13,  // y < ax+k
  QUADRATIC:        14,  // y > a(x-h)²+k
  QUADRATIC_INV:    15,  // y < a(x-h)²+k
  CUBIC:            16,  // y > a(x-h)³
  CUBIC_INV:        17,  // y < a(x-h)³
  ABS:              18,  // y > a|x-h|+k
  ABS_INV:          19,  // y < a|x-h|+k
  CIRCLE:           20,  // (x-h)²+(y-k)²>a² — solid outside, gap inside
  CIRCLE_INV:       21,  // (x-h)²+(y-k)²<a² — solid inside, gap outside
  SINE:             22,  // y > a·sin(bx)+k
  SINE_INV:         23,  // y < a·sin(bx)+k
  QUADRATIC_NEG:    24,  // y > a(x-h)²+k  (a < 0 → downward arch)
  QUADRATIC_NEG_INV:25,  // y < a(x-h)²+k  (a < 0)
  ABS_NEG:          26,  // y > a|x-h|+k   (a < 0 → inverted V ceiling)
  ABS_NEG_INV:      27,  // y < a|x-h|+k   (a < 0)
  CUBIC_NEG:        28,  // y > a(x-h)³    (a < 0 → flipped S-curve)
  CUBIC_NEG_INV:    29,  // y < a(x-h)³    (a < 0)
};

export function isSolid(x, z, funcType, params) {
  const { h = 0, k = 0, a = 1, b = 1 } = params;
  switch (funcType) {
    case FuncType.RATIONAL:
    case FuncType.RATIONAL_NEG: {
      if (Math.abs(x) < 0.001) return false;
      const fval = a / x + k;
      return x > 0 ? z > fval : z < fval;
    }
    case FuncType.RATIONAL_INV:
    case FuncType.RATIONAL_NEG_INV: {
      if (Math.abs(x) < 0.001) return true;
      const fval = a / x + k;
      return x > 0 ? z < fval : z > fval;
    }
    case FuncType.RATIONAL_T: {
      const dx = x - h;
      if (Math.abs(dx) < 0.001) return false;
      const fval = a / dx + k;
      return dx > 0 ? z > fval : z < fval;
    }
    case FuncType.RATIONAL_T_INV: {
      const dx = x - h;
      if (Math.abs(dx) < 0.001) return true;
      const fval = a / dx + k;
      return dx > 0 ? z < fval : z > fval;
    }
    case FuncType.RATIONAL_D: {
      const bx = b * x;
      if (Math.abs(bx) < 0.001) return false;
      const fval = a / bx + k;
      return bx > 0 ? z > fval : z < fval;
    }
    case FuncType.RATIONAL_D_INV: {
      const bx = b * x;
      if (Math.abs(bx) < 0.001) return true;
      const fval = a / bx + k;
      return bx > 0 ? z < fval : z > fval;
    }
    case FuncType.EXPONENTIAL:
      return z > a * Math.exp(b * x) + k;
    case FuncType.EXP_BELOW:
      return z < a * Math.exp(b * x) + k;
    case FuncType.LOGARITHMIC:
      if (x - h <= 0.001) return true;
      return z > a * Math.log(x - h) + k;
    case FuncType.LOG_BELOW:
      if (x - h <= 0.001) return false;
      return z < a * Math.log(x - h) + k;
    case FuncType.LINEAR:
      return z > a * x + k;
    case FuncType.LINEAR_INV:
      return z < a * x + k;
    case FuncType.QUADRATIC: {
      const dx = x - h;
      return z > a * dx * dx + k;
    }
    case FuncType.QUADRATIC_INV: {
      const dx = x - h;
      return z < a * dx * dx + k;
    }
    case FuncType.CUBIC: {
      const dx = x - h;
      return z > a * dx * dx * dx;
    }
    case FuncType.CUBIC_INV: {
      const dx = x - h;
      return z < a * dx * dx * dx;
    }
    case FuncType.ABS: {
      const dx = x - h;
      return z > a * Math.abs(dx) + k;
    }
    case FuncType.ABS_INV: {
      const dx = x - h;
      return z < a * Math.abs(dx) + k;
    }
    case FuncType.CIRCLE: {
      const dx = x - h, dz = z - k;
      return dx * dx + dz * dz > a * a;
    }
    case FuncType.CIRCLE_INV: {
      const dx = x - h, dz = z - k;
      return dx * dx + dz * dz < a * a;
    }
    case FuncType.SINE:
      return z > a * Math.sin(b * x) + k;
    case FuncType.SINE_INV:
      return z < a * Math.sin(b * x) + k;
    // Negative variants share logic with positives — a is negative in params
    case FuncType.QUADRATIC_NEG:
    case FuncType.QUADRATIC_NEG_INV: {
      const dx = x - h;
      return funcType === FuncType.QUADRATIC_NEG
        ? z > a * dx * dx + k
        : z < a * dx * dx + k;
    }
    case FuncType.ABS_NEG:
    case FuncType.ABS_NEG_INV: {
      const dx = x - h;
      return funcType === FuncType.ABS_NEG
        ? z > a * Math.abs(dx) + k
        : z < a * Math.abs(dx) + k;
    }
    case FuncType.CUBIC_NEG:
    case FuncType.CUBIC_NEG_INV: {
      const dx = x - h;
      return funcType === FuncType.CUBIC_NEG
        ? z > a * dx * dx * dx
        : z < a * dx * dx * dx;
    }
    default: return false;
  }
}

// Each snippet must assign both `solid` and `d_curve`.
// `solid` and `d_curve` are pre-declared in the shader template before the snippet.
// Standard curves use perpendicular distance: abs(z-boundary)/sqrt(1+deriv²).
// Non-standard shapes (circle) compute d_curve directly.

const _rationalGlsl = `
  float boundary = (abs(x) < 0.001) ? 9999.0 : uA / x + uK;
  float deriv    = (abs(x) < 0.001) ? 0.0    : -uA / (x * x);
  solid   = (x > 0.001 && z > boundary) || (x < -0.001 && z < boundary);
  d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
`;
const _rationalInvGlsl = `
  float boundary = (abs(x) < 0.001) ? 9999.0 : uA / x + uK;
  float deriv    = (abs(x) < 0.001) ? 0.0    : -uA / (x * x);
  bool ns = (x > 0.001 && z > boundary) || (x < -0.001 && z < boundary);
  solid   = !ns;
  d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
`;

export const glsl = {
  [FuncType.RATIONAL]:         _rationalGlsl,
  [FuncType.RATIONAL_NEG]:     _rationalGlsl,
  [FuncType.RATIONAL_INV]:     _rationalInvGlsl,
  [FuncType.RATIONAL_NEG_INV]: _rationalInvGlsl,

  [FuncType.RATIONAL_T]: `
    float dx       = x - uH;
    float boundary = (abs(dx) < 0.001) ? 9999.0 : uA / dx + uK;
    float deriv    = (abs(dx) < 0.001) ? 0.0    : -uA / (dx * dx);
    solid   = (dx > 0.001 && z > boundary) || (dx < -0.001 && z < boundary);
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.RATIONAL_T_INV]: `
    float dx       = x - uH;
    float boundary = (abs(dx) < 0.001) ? 9999.0 : uA / dx + uK;
    float deriv    = (abs(dx) < 0.001) ? 0.0    : -uA / (dx * dx);
    bool ns = (dx > 0.001 && z > boundary) || (dx < -0.001 && z < boundary);
    solid   = !ns;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.RATIONAL_D]: `
    float bx       = uB * x;
    float boundary = (abs(bx) < 0.001) ? 9999.0 : uA / bx + uK;
    float deriv    = (abs(bx) < 0.001) ? 0.0    : -uA / (x * bx);
    solid   = (bx > 0.001 && z > boundary) || (bx < -0.001 && z < boundary);
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.RATIONAL_D_INV]: `
    float bx       = uB * x;
    float boundary = (abs(bx) < 0.001) ? 9999.0 : uA / bx + uK;
    float deriv    = (abs(bx) < 0.001) ? 0.0    : -uA / (x * bx);
    bool ns = (bx > 0.001 && z > boundary) || (bx < -0.001 && z < boundary);
    solid   = !ns;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.EXPONENTIAL]: `
    float boundary = uA * exp(uB * x) + uK;
    float deriv    = uA * uB * exp(uB * x);
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.EXP_BELOW]: `
    float boundary = uA * exp(uB * x) + uK;
    float deriv    = uA * uB * exp(uB * x);
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.LOGARITHMIC]: `
    float xh       = x - uH;
    float boundary = (xh > 0.001) ? uA * log(xh) + uK : 9999.0;
    float deriv    = (xh > 0.001) ? uA / xh : 0.0;
    solid   = (xh <= 0.001) || (z > boundary);
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.LOG_BELOW]: `
    float xh       = x - uH;
    float boundary = (xh > 0.001) ? uA * log(xh) + uK : -9999.0;
    float deriv    = (xh > 0.001) ? uA / xh : 0.0;
    solid   = (xh > 0.001) && (z < boundary);
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,

  [FuncType.LINEAR]: `
    float boundary = uA * x + uK;
    float deriv    = uA;
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.LINEAR_INV]: `
    float boundary = uA * x + uK;
    float deriv    = uA;
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,

  [FuncType.QUADRATIC]: `
    float dx       = x - uH;
    float boundary = uA * dx * dx + uK;
    float deriv    = 2.0 * uA * dx;
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.QUADRATIC_INV]: `
    float dx       = x - uH;
    float boundary = uA * dx * dx + uK;
    float deriv    = 2.0 * uA * dx;
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,

  [FuncType.CUBIC]: `
    float dx       = x - uH;
    float boundary = uA * dx * dx * dx;
    float deriv    = 3.0 * uA * dx * dx;
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.CUBIC_INV]: `
    float dx       = x - uH;
    float boundary = uA * dx * dx * dx;
    float deriv    = 3.0 * uA * dx * dx;
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,

  [FuncType.ABS]: `
    float dx       = x - uH;
    float boundary = uA * abs(dx) + uK;
    float deriv    = uA * sign(dx);
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.ABS_INV]: `
    float dx       = x - uH;
    float boundary = uA * abs(dx) + uK;
    float deriv    = uA * sign(dx);
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,

  // Circle: d_curve is direct radial distance to the boundary ring
  [FuncType.CIRCLE]: `
    float cdx    = x - uH;
    float cdz    = z - uK;
    float dist_r = sqrt(cdx * cdx + cdz * cdz);
    solid   = dist_r > uA;
    d_curve = abs(dist_r - uA);
  `,
  [FuncType.CIRCLE_INV]: `
    float cdx    = x - uH;
    float cdz    = z - uK;
    float dist_r = sqrt(cdx * cdx + cdz * cdz);
    solid   = dist_r < uA;
    d_curve = abs(dist_r - uA);
  `,

  [FuncType.SINE]: `
    float boundary = uA * sin(uB * x) + uK;
    float deriv    = uA * uB * cos(uB * x);
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.SINE_INV]: `
    float boundary = uA * sin(uB * x) + uK;
    float deriv    = uA * uB * cos(uB * x);
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,

  // Negative variants — same GLSL as positive counterparts; uA is negative
  [FuncType.QUADRATIC_NEG]:     `
    float dx       = x - uH;
    float boundary = uA * dx * dx + uK;
    float deriv    = 2.0 * uA * dx;
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.QUADRATIC_NEG_INV]: `
    float dx       = x - uH;
    float boundary = uA * dx * dx + uK;
    float deriv    = 2.0 * uA * dx;
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.ABS_NEG]: `
    float dx       = x - uH;
    float boundary = uA * abs(dx) + uK;
    float deriv    = uA * sign(dx);
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.ABS_NEG_INV]: `
    float dx       = x - uH;
    float boundary = uA * abs(dx) + uK;
    float deriv    = uA * sign(dx);
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.CUBIC_NEG]: `
    float dx       = x - uH;
    float boundary = uA * dx * dx * dx;
    float deriv    = 3.0 * uA * dx * dx;
    solid   = z > boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
  [FuncType.CUBIC_NEG_INV]: `
    float dx       = x - uH;
    float boundary = uA * dx * dx * dx;
    float deriv    = 3.0 * uA * dx * dx;
    solid   = z < boundary;
    d_curve = abs(z - boundary) / sqrt(1.0 + deriv * deriv);
  `,
};

export function equationString(funcType, params) {
  const { h = 0, k = 0, a = 1, b = 1 } = params;
  const fmt = n => Number(n.toFixed(2));
  const ks  = k >= 0 ? `+ ${fmt(k)}` : `- ${Math.abs(fmt(k))}`;
  const hs  = fmt(h);
  switch (funcType) {
    case FuncType.RATIONAL:         return `y > ${fmt(a)}/x`;
    case FuncType.RATIONAL_INV:     return `y < ${fmt(a)}/x`;
    case FuncType.RATIONAL_NEG:     return `y > ${fmt(a)}/x`;
    case FuncType.RATIONAL_NEG_INV: return `y < ${fmt(a)}/x`;
    case FuncType.RATIONAL_T:       return `y > ${fmt(a)}/(x-${hs}) ${ks}`;
    case FuncType.RATIONAL_T_INV:   return `y < ${fmt(a)}/(x-${hs}) ${ks}`;
    case FuncType.RATIONAL_D:       return `y > ${fmt(a)}/(${fmt(b)}x)`;
    case FuncType.RATIONAL_D_INV:   return `y < ${fmt(a)}/(${fmt(b)}x)`;
    case FuncType.EXPONENTIAL:      return `y > ${fmt(a)}·e^(${fmt(b)}x) ${ks}`;
    case FuncType.EXP_BELOW:        return `y < ${fmt(a)}·e^(${fmt(b)}x) ${ks}`;
    case FuncType.LOGARITHMIC:      return `y > ${fmt(a)}·ln(x-${hs}) ${ks}`;
    case FuncType.LOG_BELOW:        return `y < ${fmt(a)}·ln(x-${hs}) ${ks}`;
    case FuncType.LINEAR:           return `y > ${fmt(a)}x ${ks}`;
    case FuncType.LINEAR_INV:       return `y < ${fmt(a)}x ${ks}`;
    case FuncType.QUADRATIC:        return `y > ${fmt(a)}x^2 ${ks}`;
    case FuncType.QUADRATIC_INV:    return `y < ${fmt(a)}x^2 ${ks}`;
    case FuncType.CUBIC:            return `y > ${fmt(a)}x^3`;
    case FuncType.CUBIC_INV:        return `y < ${fmt(a)}x^3`;
    case FuncType.ABS:              return `y > ${fmt(a)}|x| ${ks}`;
    case FuncType.ABS_INV:          return `y < ${fmt(a)}|x| ${ks}`;
    case FuncType.CIRCLE:           return `x^2 + y^2 > ${fmt(a)}^2`;
    case FuncType.CIRCLE_INV:       return `x^2 + y^2 < ${fmt(a)}^2`;
    case FuncType.SINE:             return `y > ${fmt(a)}·sin(${fmt(b)}x) ${ks}`;
    case FuncType.SINE_INV:         return `y < ${fmt(a)}·sin(${fmt(b)}x) ${ks}`;
    case FuncType.QUADRATIC_NEG:    return `y > ${fmt(a)}x^2 ${ks}`;
    case FuncType.QUADRATIC_NEG_INV:return `y < ${fmt(a)}x^2 ${ks}`;
    case FuncType.ABS_NEG:          return `y > ${fmt(a)}|x| ${ks}`;
    case FuncType.ABS_NEG_INV:      return `y < ${fmt(a)}|x| ${ks}`;
    case FuncType.CUBIC_NEG:        return `y > ${fmt(a)}x^3`;
    case FuncType.CUBIC_NEG_INV:    return `y < ${fmt(a)}x^3`;
    default: return '';
  }
}
