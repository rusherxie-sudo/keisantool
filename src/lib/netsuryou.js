// 熱量計算の純関数。内部単位は J・kg・K・W・s。
const ENERGY = { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3_600_000 };
const MASS = { kg: 1, g: 0.001 };
const SPECIFIC = { 'J/kgK': 1, 'kJ/kgK': 1000, 'J/gK': 1000 };
const POWER = { W: 1, kW: 1000 };
const TIME = { s: 1, min: 60, h: 3600 };
function number(value) { if (value === '' || value == null) return null; const n = Number(value); return Number.isFinite(n) ? n : null; }
function positive(value) { const n = number(value); return n !== null && n > 0 ? n : null; }
function convert(value, from, to, units) { const n = number(value); return n === null || !units[from] || !units[to] ? null : n * units[from] / units[to]; }
export function convertEnergy(value, from = 'J', to = 'J') { return convert(value, from, to, ENERGY); }

export function solveSensibleHeat({ mass, massUnit = 'kg', specificHeat, specificHeatUnit = 'J/kgK', temperatureChange } = {}) {
  const massKg = convert(mass, massUnit, 'kg', MASS), specificHeatJkgK = convert(specificHeat, specificHeatUnit, 'J/kgK', SPECIFIC), deltaK = positive(temperatureChange);
  if (!positive(massKg) || !positive(specificHeatJkgK) || !deltaK) return null;
  return { massKg, specificHeatJkgK, temperatureChangeK: deltaK, energyJ: massKg * specificHeatJkgK * deltaK };
}

export function solvePowerHeat({ target, energy, energyUnit = 'J', power, powerUnit = 'W', time, timeUnit = 's' } = {}) {
  if (!['energy', 'power', 'time'].includes(target)) return null;
  let energyJ = target === 'energy' ? null : convertEnergy(energy, energyUnit, 'J');
  let powerW = target === 'power' ? null : convert(power, powerUnit, 'W', POWER);
  let timeSec = target === 'time' ? null : convert(time, timeUnit, 's', TIME);
  if (target === 'energy') { if (!positive(powerW) || !positive(timeSec)) return null; energyJ = powerW * timeSec; }
  if (target === 'power') { if (!positive(energyJ) || !positive(timeSec)) return null; powerW = energyJ / timeSec; }
  if (target === 'time') { if (!positive(energyJ) || !positive(powerW)) return null; timeSec = energyJ / powerW; }
  return { energyJ, powerW, timeSec };
}
