const LENGTH_IN_METERS = Object.freeze({
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
});

function finiteNumber(value) {
  const number = typeof value === 'string' && value.trim() === '' ? Number.NaN : Number(value);
  return Number.isFinite(number) ? number : null;
}

function positiveNumber(value) {
  const number = finiteNumber(value);
  return number !== null && number > 0 ? number : null;
}

export function convertLength(value, fromUnit, toUnit) {
  const number = finiteNumber(value);
  const fromFactor = LENGTH_IN_METERS[fromUnit];
  const toFactor = LENGTH_IN_METERS[toUnit];
  if (number === null || fromFactor === undefined || toFactor === undefined) return null;
  return (number * fromFactor) / toFactor;
}

export function realLengthFromScale(drawingLength, drawingUnit, scaleDenominator, outputUnit = 'm') {
  const drawing = positiveNumber(drawingLength);
  const denominator = positiveNumber(scaleDenominator);
  if (drawing === null || denominator === null || denominator < 1) return null;
  const drawingMeters = convertLength(drawing, drawingUnit, 'm');
  return drawingMeters === null ? null : convertLength(drawingMeters * denominator, 'm', outputUnit);
}

export function drawingLengthFromScale(realLength, realUnit, scaleDenominator, outputUnit = 'cm') {
  const real = positiveNumber(realLength);
  const denominator = positiveNumber(scaleDenominator);
  if (real === null || denominator === null || denominator < 1) return null;
  const realMeters = convertLength(real, realUnit, 'm');
  return realMeters === null ? null : convertLength(realMeters / denominator, 'm', outputUnit);
}

export function scaleFromLengths(drawingLength, drawingUnit, realLength, realUnit) {
  const drawing = positiveNumber(drawingLength);
  const real = positiveNumber(realLength);
  if (drawing === null || real === null) return null;
  const drawingMeters = convertLength(drawing, drawingUnit, 'm');
  const realMeters = convertLength(real, realUnit, 'm');
  if (drawingMeters === null || realMeters === null) return null;
  const denominator = realMeters / drawingMeters;
  return denominator >= 1 ? denominator : null;
}
