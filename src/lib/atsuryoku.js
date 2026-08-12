// 圧力・力・面積・静水圧計算の純関数。
// 内部単位は Pa・N・m²・kg/m³・m に統一する。

export const PRESSURE_UNITS = Object.freeze([
  { id: 'Pa', label: 'Pa（パスカル）', factor: 1 },
  { id: 'hPa', label: 'hPa（ヘクトパスカル）', factor: 100 },
  { id: 'kPa', label: 'kPa（キロパスカル）', factor: 1_000 },
  { id: 'MPa', label: 'MPa（メガパスカル）', factor: 1_000_000 },
  { id: 'bar', label: 'bar（バール）', factor: 100_000 },
  { id: 'atm', label: 'atm（標準気圧）', factor: 101_325 },
  { id: 'Torr', label: 'Torr（トル）', factor: 101_325 / 760 },
  { id: 'kgf/cm²', label: 'kgf/cm²', factor: 98_066.5 },
  { id: 'psi', label: 'psi', factor: 6_894.76 },
]);

export const FORCE_UNITS = Object.freeze([
  { id: 'N', label: 'N（ニュートン）', factor: 1 },
  { id: 'kN', label: 'kN（キロニュートン）', factor: 1_000 },
  { id: 'kgf', label: 'kgf（重量キログラム）', factor: 9.80665 },
]);

export const AREA_UNITS = Object.freeze([
  { id: 'mm²', label: 'mm²', factor: 0.000001 },
  { id: 'cm²', label: 'cm²', factor: 0.0001 },
  { id: 'm²', label: 'm²', factor: 1 },
]);

function finiteNumber(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function positiveNumber(value) {
  const number = finiteNumber(value);
  return number !== null && number > 0 ? number : null;
}

function convert(valueInput, fromId, toId, units) {
  const value = finiteNumber(valueInput);
  const from = units.find((unit) => unit.id === fromId);
  const to = units.find((unit) => unit.id === toId);
  if (value === null || !from || !to) return null;
  return (value * from.factor) / to.factor;
}

export function convertPressure(value, fromUnit = 'Pa', toUnit = 'Pa') {
  return convert(value, fromUnit, toUnit, PRESSURE_UNITS);
}

export function convertForce(value, fromUnit = 'N', toUnit = 'N') {
  return convert(value, fromUnit, toUnit, FORCE_UNITS);
}

export function convertArea(value, fromUnit = 'm²', toUnit = 'm²') {
  return convert(value, fromUnit, toUnit, AREA_UNITS);
}

export function solvePressure({
  target,
  pressure,
  pressureUnit = 'Pa',
  force,
  forceUnit = 'N',
  area,
  areaUnit = 'm²',
} = {}) {
  if (!['pressure', 'force', 'area'].includes(target)) return null;

  let pressurePa = target === 'pressure' ? null : convertPressure(pressure, pressureUnit, 'Pa');
  let forceN = target === 'force' ? null : convertForce(force, forceUnit, 'N');
  let areaM2 = target === 'area' ? null : convertArea(area, areaUnit, 'm²');

  if (target === 'pressure') {
    if (positiveNumber(forceN) === null || positiveNumber(areaM2) === null) return null;
    pressurePa = forceN / areaM2;
  } else if (target === 'force') {
    if (positiveNumber(pressurePa) === null || positiveNumber(areaM2) === null) return null;
    forceN = pressurePa * areaM2;
  } else {
    if (positiveNumber(forceN) === null || positiveNumber(pressurePa) === null) return null;
    areaM2 = forceN / pressurePa;
  }

  if (![pressurePa, forceN, areaM2].every((value) => Number.isFinite(value) && value > 0)) {
    return null;
  }
  return { pressurePa, forceN, areaM2 };
}

export function solveHydrostatic({
  target,
  density,
  depth,
  pressure,
  pressureUnit = 'Pa',
  gravity = 9.80665,
} = {}) {
  const densityKgM3 = positiveNumber(density);
  const gravityValue = positiveNumber(gravity);
  if (!['pressure', 'depth'].includes(target) || densityKgM3 === null || gravityValue === null) {
    return null;
  }

  let pressurePa;
  let depthM;
  if (target === 'pressure') {
    depthM = positiveNumber(depth);
    if (depthM === null) return null;
    pressurePa = densityKgM3 * gravityValue * depthM;
  } else {
    pressurePa = convertPressure(pressure, pressureUnit, 'Pa');
    if (positiveNumber(pressurePa) === null) return null;
    depthM = pressurePa / (densityKgM3 * gravityValue);
  }

  if (![pressurePa, depthM].every((value) => Number.isFinite(value) && value > 0)) return null;
  return { pressurePa, densityKgM3, depthM, gravity: gravityValue };
}
