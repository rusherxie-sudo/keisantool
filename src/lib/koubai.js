// 勾配の各表記を相互換算する純関数。
// 基準は ratio = 高低差 ÷ 水平距離。画面表示用の丸めは呼び出し側で行う。

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function calculateSlope(rise, run) {
  if (!isFiniteNumber(rise) || !isFiniteNumber(run) || run <= 0) return null;

  const ratio = rise / run;
  return {
    rise,
    run,
    ratio,
    percent: ratio * 100,
    permille: ratio * 1000,
    degrees: Math.atan(ratio) * 180 / Math.PI,
    oneIn: ratio === 0 ? null : 1 / ratio,
    roofPitchSun: ratio * 10,
    slopeLength: Math.hypot(rise, run),
  };
}

export function slopeFromPercent(percent, run = 1) {
  if (!isFiniteNumber(percent) || !isFiniteNumber(run) || run <= 0) return null;
  return calculateSlope(run * percent / 100, run);
}

export function slopeFromAngle(degrees, run = 1) {
  if (
    !isFiniteNumber(degrees)
    || !isFiniteNumber(run)
    || run <= 0
    || degrees <= -90
    || degrees >= 90
  ) return null;

  return calculateSlope(run * Math.tan(degrees * Math.PI / 180), run);
}

export function slopeFromRoofPitch(sun, run = 1) {
  if (!isFiniteNumber(sun) || !isFiniteNumber(run) || run <= 0) return null;
  return calculateSlope(run * sun / 10, run);
}
