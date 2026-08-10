// 立体の体積・表面積計算（純関数・DOM非依存）。
// 内部では丸めず、表示桁の調整は画面側で行う。

function positiveNumber(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function calculateRectangularPrism(lengthInput, widthInput, heightInput) {
  const length = positiveNumber(lengthInput);
  const width = positiveNumber(widthInput);
  const height = positiveNumber(heightInput);
  if (length === null || width === null || height === null) return null;
  return {
    volume: length * width * height,
    surfaceArea: 2 * ((length * width) + (length * height) + (width * height)),
  };
}

export function calculateCube(sideInput) {
  const side = positiveNumber(sideInput);
  if (side === null) return null;
  return { volume: side ** 3, surfaceArea: 6 * side ** 2 };
}

export function calculateCylinder(radiusInput, heightInput) {
  const radius = positiveNumber(radiusInput);
  const height = positiveNumber(heightInput);
  if (radius === null || height === null) return null;
  return {
    volume: Math.PI * radius ** 2 * height,
    surfaceArea: 2 * Math.PI * radius * (radius + height),
  };
}

export function calculateCone(radiusInput, heightInput) {
  const radius = positiveNumber(radiusInput);
  const height = positiveNumber(heightInput);
  if (radius === null || height === null) return null;
  const slantHeight = Math.hypot(radius, height);
  return {
    volume: (Math.PI * radius ** 2 * height) / 3,
    surfaceArea: Math.PI * radius * (radius + slantHeight),
    slantHeight,
  };
}

export function calculateSphere(radiusInput) {
  const radius = positiveNumber(radiusInput);
  if (radius === null) return null;
  return {
    volume: (4 * Math.PI * radius ** 3) / 3,
    surfaceArea: 4 * Math.PI * radius ** 2,
  };
}

export function convertCubicVolume(volumeInput, lengthUnit) {
  const volume = positiveNumber(volumeInput);
  const cubicMeterFactors = { mm: 1e-9, cm: 1e-6, m: 1 };
  const factor = cubicMeterFactors[lengthUnit];
  if (volume === null || factor === undefined) return null;
  const cubicMeters = volume * factor;
  return { cubicMeters, liters: cubicMeters * 1000, milliliters: cubicMeters * 1_000_000 };
}
