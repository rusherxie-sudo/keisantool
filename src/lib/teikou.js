// 抵抗・オームの法則計算の純関数。
// 内部単位は電圧V・電流A・抵抗Ω・電力Wに統一し、表示側で単位を切り替える。

const RESISTANCE_FACTORS = { 'Ω': 1, 'kΩ': 1_000, 'MΩ': 1_000_000 };
const COMMON_POWER_RATINGS = [0.125, 0.25, 0.5, 1, 2, 3, 5, 10, 20, 25, 50, 100];

function finiteNumber(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function positiveNumber(value) {
  const number = finiteNumber(value);
  return number !== null && number > 0 ? number : null;
}

export function convertResistance(valueInput, unit = 'Ω') {
  const value = positiveNumber(valueInput);
  const factor = RESISTANCE_FACTORS[unit];
  return value === null || factor === undefined ? null : value * factor;
}

export function parseResistanceValues(text, unit = 'Ω') {
  if (typeof text !== 'string' || text.trim() === '') return null;
  const tokens = text.trim().split(/[,\s、，]+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const values = tokens.map((token) => convertResistance(token, unit));
  return values.some((value) => value === null) ? null : values;
}

export function solveOhmsLaw(inputs = {}) {
  const rawValues = {
    voltage: inputs.voltage,
    current: inputs.current,
    resistance: inputs.resistance,
  };
  const supplied = Object.entries(rawValues).filter(([, value]) => value !== '' && value != null);
  if (supplied.length !== 2) return null;
  const values = Object.fromEntries(
    Object.entries(rawValues).map(([key, value]) => [key, positiveNumber(value)])
  );
  if (supplied.some(([key]) => values[key] === null)) return null;

  let { voltage, current, resistance } = values;
  if (voltage === null) voltage = current * resistance;
  if (current === null) current = voltage / resistance;
  if (resistance === null) resistance = voltage / current;
  if (![voltage, current, resistance].every(Number.isFinite)) return null;

  return { voltage, current, resistance, power: voltage * current };
}

export function equivalentResistance(values, type) {
  if (!Array.isArray(values) || values.length < 1 || !['series', 'parallel'].includes(type)) {
    return null;
  }
  const resistances = values.map(positiveNumber);
  if (resistances.some((value) => value === null)) return null;
  const resistance = type === 'series'
    ? resistances.reduce((sum, value) => sum + value, 0)
    : 1 / resistances.reduce((sum, value) => sum + 1 / value, 0);
  if (!Number.isFinite(resistance) || resistance <= 0) return null;
  return { type, count: resistances.length, resistance };
}

export function calculateLedResistor(
  supplyVoltageInput,
  forwardVoltageInput,
  currentMilliAmpsInput,
  ledCountInput = 1
) {
  const supplyVoltage = positiveNumber(supplyVoltageInput);
  const forwardVoltage = positiveNumber(forwardVoltageInput);
  const currentMilliAmps = positiveNumber(currentMilliAmpsInput);
  const ledCount = positiveNumber(ledCountInput);
  if (
    supplyVoltage === null ||
    forwardVoltage === null ||
    currentMilliAmps === null ||
    ledCount === null ||
    !Number.isInteger(ledCount)
  ) return null;

  const totalForwardVoltage = forwardVoltage * ledCount;
  if (totalForwardVoltage >= supplyVoltage) return null;
  const currentAmps = currentMilliAmps / 1_000;
  const resistorVoltage = supplyVoltage - totalForwardVoltage;
  const resistance = resistorVoltage / currentAmps;
  const resistorPower = resistorVoltage * currentAmps;
  const minimumRatedPower = resistorPower * 2;
  const recommendedRatedPower =
    COMMON_POWER_RATINGS.find((rating) => rating >= minimumRatedPower) ?? minimumRatedPower;

  return {
    supplyVoltage,
    totalForwardVoltage,
    currentAmps,
    resistance,
    resistorPower,
    minimumRatedPower,
    recommendedRatedPower,
    ledCount,
  };
}
