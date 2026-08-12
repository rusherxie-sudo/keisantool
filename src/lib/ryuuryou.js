// 流量計算の純関数。内部単位は m³・s・m³/s・m・m/s。
const FLOW = { 'm3/s': 1, 'm3/min': 1 / 60, 'm3/h': 1 / 3600, 'L/s': 0.001, 'L/min': 0.001 / 60, 'L/h': 0.001 / 3600 };
const VOLUME = { m3: 1, L: 0.001, mL: 0.000001 };
const TIME = { s: 1, min: 60, h: 3600 };
const LENGTH = { m: 1, cm: 0.01, mm: 0.001 };

function number(value) { if (value === '' || value == null) return null; const n = Number(value); return Number.isFinite(n) ? n : null; }
function positive(value) { const n = number(value); return n !== null && n > 0 ? n : null; }
function convert(value, from, to, units) { const n = number(value); return n === null || !units[from] || !units[to] ? null : n * units[from] / units[to]; }

export function convertFlow(value, from = 'm3/s', to = 'm3/s') { return convert(value, from, to, FLOW); }
export function convertVolume(value, from = 'm3', to = 'm3') { return convert(value, from, to, VOLUME); }
export function convertTime(value, from = 's', to = 's') { return convert(value, from, to, TIME); }

export function solveVolumeFlow({ target, volume, volumeUnit = 'm3', time, timeUnit = 's', flow, flowUnit = 'm3/s' } = {}) {
  if (!['flow', 'volume', 'time'].includes(target)) return null;
  let volumeM3 = target === 'volume' ? null : convertVolume(volume, volumeUnit, 'm3');
  let timeSec = target === 'time' ? null : convertTime(time, timeUnit, 's');
  let flowM3s = target === 'flow' ? null : convertFlow(flow, flowUnit, 'm3/s');
  if (target === 'flow') { if (!positive(volumeM3) || !positive(timeSec)) return null; flowM3s = volumeM3 / timeSec; }
  if (target === 'volume') { if (!positive(flowM3s) || !positive(timeSec)) return null; volumeM3 = flowM3s * timeSec; }
  if (target === 'time') { if (!positive(volumeM3) || !positive(flowM3s)) return null; timeSec = volumeM3 / flowM3s; }
  return [volumeM3, timeSec, flowM3s].every((v) => positive(v)) ? { volumeM3, timeSec, flowM3s } : null;
}

export function solvePipeFlow({ target, diameter, diameterUnit = 'mm', velocity, flow, flowUnit = 'm3/s' } = {}) {
  if (!['flow', 'velocity'].includes(target)) return null;
  const diameterM = convert(diameter, diameterUnit, 'm', LENGTH);
  if (!positive(diameterM)) return null;
  const areaM2 = Math.PI * (diameterM / 2) ** 2;
  let velocityMs = target === 'velocity' ? null : positive(velocity);
  let flowM3s = target === 'flow' ? null : convertFlow(flow, flowUnit, 'm3/s');
  if (target === 'flow') { if (!velocityMs) return null; flowM3s = areaM2 * velocityMs; }
  else { if (!positive(flowM3s)) return null; velocityMs = flowM3s / areaM2; }
  return { diameterM, areaM2, velocityMs, flowM3s };
}
