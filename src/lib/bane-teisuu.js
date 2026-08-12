// フックの法則と合成ばね定数の純関数。内部単位は N・m・N/m。
const LENGTH = { m: 1, cm: 0.01, mm: 0.001 };
function positive(value) { if (value === '' || value == null) return null; const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; }
function extensionM(value, unit) { const n = positive(value); return n && LENGTH[unit] ? n * LENGTH[unit] : null; }

export function solveHooke({ target, force, springConstant, extension, extensionUnit = 'm' } = {}) {
  if (!['force', 'springConstant', 'extension'].includes(target)) return null;
  let f = target === 'force' ? null : positive(force), k = target === 'springConstant' ? null : positive(springConstant), x = target === 'extension' ? null : extensionM(extension, extensionUnit);
  if (target === 'force') { if (!k || !x) return null; f = k * x; }
  if (target === 'springConstant') { if (!f || !x) return null; k = f / x; }
  if (target === 'extension') { if (!f || !k) return null; x = f / k; }
  return { forceN: f, springConstantNm: k, extensionM: x };
}

export function springEnergy({ springConstant, extension, extensionUnit = 'm' } = {}) {
  const k = positive(springConstant), x = extensionM(extension, extensionUnit);
  return k && x ? k * x ** 2 / 2 : null;
}

export function combineSprings(constants, mode) {
  if (!Array.isArray(constants) || constants.length === 0 || !['series', 'parallel'].includes(mode)) return null;
  const values = constants.map(positive); if (values.some((v) => !v)) return null;
  return mode === 'parallel' ? values.reduce((sum, v) => sum + v, 0) : 1 / values.reduce((sum, v) => sum + 1 / v, 0);
}
