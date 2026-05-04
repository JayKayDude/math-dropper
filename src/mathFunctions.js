export const FuncType = { RATIONAL: 0, RATIONAL_T: 1, RATIONAL_D: 2, EXPONENTIAL: 3, LOGARITHMIC: 4 };

// JS-side solid check (for collision detection)
export function isSolid(x, z, funcType, params) {
  const { h = 0, k = 0, a = 1, b = 1 } = params;
  switch (funcType) {
    case FuncType.RATIONAL: {
      if (Math.abs(x) < 0.001) return false;
      return x > 0 ? z > 1 / x : z < 1 / x;
    }
    case FuncType.RATIONAL_T: {
      const dx = x - h;
      if (Math.abs(dx) < 0.001) return false;
      const fval = 1 / dx + k;
      return dx > 0 ? z > fval : z < fval;
    }
    case FuncType.RATIONAL_D: {
      const bx = b * x;
      if (Math.abs(bx) < 0.001) return false;
      const fval = a / bx;
      return bx > 0 ? z > fval : z < fval;
    }
    case FuncType.EXPONENTIAL: {
      return z > a * Math.exp(b * x) + k;
    }
    case FuncType.LOGARITHMIC: {
      if (x - h <= 0.001) return true;
      return z > a * Math.log(x - h) + k;
    }
    default: return false;
  }
}

// GLSL snippets — must set bool `solid` and float `boundary` (f(x) value for edge detection)
export const glsl = {
  [FuncType.RATIONAL]: `
    float boundary = (abs(x) < 0.001) ? 9999.0 : 1.0 / x;
    solid = (x > 0.001 && z > boundary) || (x < -0.001 && z < boundary);
  `,
  [FuncType.RATIONAL_T]: `
    float dx = x - uH;
    float boundary = (abs(dx) < 0.001) ? 9999.0 : 1.0 / dx + uK;
    solid = (dx > 0.001 && z > boundary) || (dx < -0.001 && z < boundary);
  `,
  [FuncType.RATIONAL_D]: `
    float bx = uB * x;
    float boundary = (abs(bx) < 0.001) ? 9999.0 : uA / bx;
    solid = (bx > 0.001 && z > boundary) || (bx < -0.001 && z < boundary);
  `,
  [FuncType.EXPONENTIAL]: `
    float boundary = uA * exp(uB * x) + uK;
    solid = z > boundary;
  `,
  [FuncType.LOGARITHMIC]: `
    float xh = x - uH;
    float boundary = (xh > 0.001) ? uA * log(xh) + uK : 9999.0;
    solid = (xh <= 0.001) || (z > boundary);
  `,
};

export function equationString(funcType, params) {
  const { h = 0, k = 0, a = 1, b = 1 } = params;
  const fmt = n => Number(n.toFixed(2));
  switch (funcType) {
    case FuncType.RATIONAL:    return 'f(x) = 1/x';
    case FuncType.RATIONAL_T:  return `f(x) = 1/(x${h >= 0 ? '-' : '+'}${Math.abs(fmt(h))}) ${k >= 0 ? '+' : '-'} ${Math.abs(fmt(k))}`;
    case FuncType.RATIONAL_D:  return `f(x) = ${fmt(a)}/(${fmt(b)}x)`;
    case FuncType.EXPONENTIAL: return `f(x) = ${fmt(a)}·e^(${fmt(b)}x) ${k >= 0 ? '+' : '-'} ${Math.abs(fmt(k))}`;
    case FuncType.LOGARITHMIC: return `f(x) = ${fmt(a)}·ln(x${h >= 0 ? '-' : '+'}${Math.abs(fmt(h))}) ${k >= 0 ? '+' : '-'} ${Math.abs(fmt(k))}`;
    default: return '';
  }
}
