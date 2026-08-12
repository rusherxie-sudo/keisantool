// 対角線計算の純関数。長さの単位は呼び出し側で統一する。
function positive(value) { if (value === '' || value == null) return null; const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; }

export function solveRectangle({ target, width, height, diagonal } = {}) {
  if (!['diagonal', 'width', 'height'].includes(target)) return null;
  let w = target === 'width' ? null : positive(width);
  let h = target === 'height' ? null : positive(height);
  let d = target === 'diagonal' ? null : positive(diagonal);
  if (target === 'diagonal') { if (!w || !h) return null; d = Math.hypot(w, h); }
  if (target === 'width') { if (!d || !h || d <= h) return null; w = Math.sqrt(d ** 2 - h ** 2); }
  if (target === 'height') { if (!d || !w || d <= w) return null; h = Math.sqrt(d ** 2 - w ** 2); }
  return { width: w, height: h, diagonal: d };
}

export function solveCuboid({ width, height, depth } = {}) {
  const w = positive(width), h = positive(height), z = positive(depth);
  return w && h && z ? { width: w, height: h, depth: z, diagonal: Math.hypot(w, h, z) } : null;
}

export function screenFromDiagonal({ diagonalInch, aspectWidth = 16, aspectHeight = 9 } = {}) {
  const inch = positive(diagonalInch), aw = positive(aspectWidth), ah = positive(aspectHeight);
  if (!inch || !aw || !ah) return null;
  const diagonalCm = inch * 2.54, scale = diagonalCm / Math.hypot(aw, ah);
  return { diagonalInch: inch, diagonalCm, widthCm: aw * scale, heightCm: ah * scale, aspectWidth: aw, aspectHeight: ah };
}

export function screenFromDimensions({ widthCm, heightCm } = {}) {
  const w = positive(widthCm), h = positive(heightCm);
  if (!w || !h) return null;
  const diagonalCm = Math.hypot(w, h);
  return { widthCm: w, heightCm: h, diagonalCm, diagonalInch: diagonalCm / 2.54 };
}
