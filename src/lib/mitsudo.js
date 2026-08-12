// 密度・質量・体積の相互計算（純関数・DOM非依存）。
// 内部は kg・m³・kg/m³ に統一し、表示側でのみ桁数を整える。

const MASS_TO_KG = { mg: 1e-6, g: 1e-3, kg: 1, t: 1000 };
const VOLUME_TO_M3 = { mm3: 1e-9, cm3: 1e-6, mL: 1e-6, L: 1e-3, m3: 1 };
const DENSITY_TO_KG_PER_M3 = { 'kg/m3': 1, 'g/cm3': 1000, 'g/mL': 1000, 'kg/L': 1000 };

function positiveNumber(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function convertByFactor(valueInput, fromUnit, toUnit, factors) {
  const value = positiveNumber(valueInput);
  const fromFactor = factors[fromUnit];
  const toFactor = factors[toUnit];
  if (value === null || fromFactor === undefined || toFactor === undefined) return null;
  return (value * fromFactor) / toFactor;
}

export function convertMass(value, fromUnit, toUnit) {
  return convertByFactor(value, fromUnit, toUnit, MASS_TO_KG);
}

export function convertVolume(value, fromUnit, toUnit) {
  return convertByFactor(value, fromUnit, toUnit, VOLUME_TO_M3);
}

export function convertDensity(value, fromUnit, toUnit) {
  return convertByFactor(value, fromUnit, toUnit, DENSITY_TO_KG_PER_M3);
}

export function calculateDensity(massInput, massUnit, volumeInput, volumeUnit) {
  const kilograms = convertMass(massInput, massUnit, 'kg');
  const cubicMeters = convertVolume(volumeInput, volumeUnit, 'm3');
  if (kilograms === null || cubicMeters === null) return null;
  const kgPerM3 = kilograms / cubicMeters;
  return { kgPerM3, gPerCm3: kgPerM3 / 1000 };
}

export function calculateMass(densityInput, densityUnit, volumeInput, volumeUnit) {
  const kgPerM3 = convertDensity(densityInput, densityUnit, 'kg/m3');
  const cubicMeters = convertVolume(volumeInput, volumeUnit, 'm3');
  if (kgPerM3 === null || cubicMeters === null) return null;
  const kilograms = kgPerM3 * cubicMeters;
  return { kilograms, grams: kilograms * 1000 };
}

export function calculateVolume(massInput, massUnit, densityInput, densityUnit) {
  const kilograms = convertMass(massInput, massUnit, 'kg');
  const kgPerM3 = convertDensity(densityInput, densityUnit, 'kg/m3');
  if (kilograms === null || kgPerM3 === null) return null;
  const cubicMeters = kilograms / kgPerM3;
  return {
    cubicMeters,
    cubicCentimeters: cubicMeters * 1_000_000,
    liters: cubicMeters * 1000,
  };
}
