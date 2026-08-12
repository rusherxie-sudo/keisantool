// 加速度計算の純関数。内部単位は m/s・m/s²・s・m。
const SPEED = { 'm/s': 1, 'km/h': 1 / 3.6, 'mph': 0.44704 };
const ACCELERATION = { 'm/s2': 1, G: 9.80665, 'Gal': 0.01 };
function number(value) { if (value === '' || value == null) return null; const n = Number(value); return Number.isFinite(n) ? n : null; }
function convert(value, from, to, units) { const n = number(value); return n === null || !units[from] || !units[to] ? null : n * units[from] / units[to]; }
export function convertSpeed(value, from = 'm/s', to = 'm/s') { return convert(value, from, to, SPEED); }
export function convertAcceleration(value, from = 'm/s2', to = 'm/s2') { return convert(value, from, to, ACCELERATION); }

export function solveAcceleration({ initialSpeed, finalSpeed, speedUnit = 'm/s', time } = {}) {
  const initialSpeedMs = convertSpeed(initialSpeed, speedUnit, 'm/s');
  const finalSpeedMs = convertSpeed(finalSpeed, speedUnit, 'm/s');
  const timeSec = number(time);
  if (initialSpeedMs === null || finalSpeedMs === null || timeSec === null || timeSec <= 0) return null;
  const accelerationMs2 = (finalSpeedMs - initialSpeedMs) / timeSec;
  return { initialSpeedMs, finalSpeedMs, timeSec, accelerationMs2, accelerationG: accelerationMs2 / 9.80665 };
}

export function solveConstantAcceleration({ initialSpeed, speedUnit = 'm/s', acceleration, accelerationUnit = 'm/s2', time } = {}) {
  const initialSpeedMs = convertSpeed(initialSpeed, speedUnit, 'm/s');
  const accelerationMs2 = convertAcceleration(acceleration, accelerationUnit, 'm/s2');
  const timeSec = number(time);
  if (initialSpeedMs === null || accelerationMs2 === null || timeSec === null || timeSec <= 0) return null;
  return { initialSpeedMs, accelerationMs2, timeSec, finalSpeedMs: initialSpeedMs + accelerationMs2 * timeSec, distanceM: initialSpeedMs * timeSec + accelerationMs2 * timeSec ** 2 / 2 };
}
