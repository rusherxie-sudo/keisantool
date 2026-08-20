const TARGETS = new Set(['area', 'topBase', 'bottomBase', 'height']);

function positive(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function solveTrapezoid({ target = 'area', topBase, bottomBase, height, area } = {}) {
  if (!TARGETS.has(target)) return null;

  let a = target === 'topBase' ? null : positive(topBase);
  let b = target === 'bottomBase' ? null : positive(bottomBase);
  let h = target === 'height' ? null : positive(height);
  let s = target === 'area' ? null : positive(area);

  if (target === 'area') {
    if (a === null || b === null || h === null) return null;
    s = ((a + b) * h) / 2;
  } else if (target === 'height') {
    if (a === null || b === null || s === null) return null;
    h = (2 * s) / (a + b);
  } else if (target === 'topBase') {
    if (b === null || h === null || s === null) return null;
    a = (2 * s) / h - b;
  } else {
    if (a === null || h === null || s === null) return null;
    b = (2 * s) / h - a;
  }

  if (![a, b, h, s].every((value) => Number.isFinite(value) && value > 0)) return null;
  return { topBase: a, bottomBase: b, height: h, area: s, midline: (a + b) / 2 };
}
