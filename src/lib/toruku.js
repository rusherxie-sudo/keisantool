// トルク計算の純関数。内部単位は N・m・W・rpm。
const TORQUE = { 'N-m': 1, 'N-cm': 0.01, 'kgf-m': 9.80665, 'kgf-cm': 0.0980665, 'lbf-ft': 1.3558179483314 };
const FORCE = { N: 1, kN: 1000, kgf: 9.80665 };
const LENGTH = { m: 1, cm: 0.01, mm: 0.001 };
const POWER = { W: 1, kW: 1000 };

function number(value) { if (value === '' || value == null) return null; const n = Number(value); return Number.isFinite(n) ? n : null; }
function positive(value) { const n = number(value); return n !== null && n > 0 ? n : null; }
function convert(value, from, to, units) { const n = number(value); return n === null || !units[from] || !units[to] ? null : n * units[from] / units[to]; }
export function convertTorque(value, from = 'N-m', to = 'N-m') { return convert(value, from, to, TORQUE); }

export function solveLeverTorque({ target, torque, torqueUnit = 'N-m', force, forceUnit = 'N', radius, radiusUnit = 'm' } = {}) {
  if (!['torque', 'force', 'radius'].includes(target)) return null;
  let torqueNm = target === 'torque' ? null : convertTorque(torque, torqueUnit, 'N-m');
  let forceN = target === 'force' ? null : convert(force, forceUnit, 'N', FORCE);
  let radiusM = target === 'radius' ? null : convert(radius, radiusUnit, 'm', LENGTH);
  if (target === 'torque') { if (!positive(forceN) || !positive(radiusM)) return null; torqueNm = forceN * radiusM; }
  if (target === 'force') { if (!positive(torqueNm) || !positive(radiusM)) return null; forceN = torqueNm / radiusM; }
  if (target === 'radius') { if (!positive(torqueNm) || !positive(forceN)) return null; radiusM = torqueNm / forceN; }
  return { torqueNm, forceN, radiusM };
}

export function solveMotorTorque({ target, torque, torqueUnit = 'N-m', power, powerUnit = 'W', rpm } = {}) {
  if (!['torque', 'power', 'rpm'].includes(target)) return null;
  let torqueNm = target === 'torque' ? null : convertTorque(torque, torqueUnit, 'N-m');
  let powerW = target === 'power' ? null : convert(power, powerUnit, 'W', POWER);
  let rpmValue = target === 'rpm' ? null : positive(rpm);
  if (target === 'torque') { if (!positive(powerW) || !rpmValue) return null; torqueNm = powerW * 60 / (2 * Math.PI * rpmValue); }
  if (target === 'power') { if (!positive(torqueNm) || !rpmValue) return null; powerW = torqueNm * 2 * Math.PI * rpmValue / 60; }
  if (target === 'rpm') { if (!positive(torqueNm) || !positive(powerW)) return null; rpmValue = powerW * 60 / (2 * Math.PI * torqueNm); }
  return { torqueNm, powerW, rpm: rpmValue };
}
