// 回転数計算の純関数。内部単位は rpm・秒・mm・m/min。
function positive(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function calculateRpm({ rotations, time, timeUnit = 's' } = {}) {
  const count = positive(rotations);
  const duration = positive(time);
  if (count == null || duration == null || !['s', 'min'].includes(timeUnit)) return null;
  const seconds = timeUnit === 'min' ? duration * 60 : duration;
  const rps = count / seconds;
  return { rpm: rps * 60, rps, periodSeconds: 1 / rps };
}

export function calculateMotorSpeed({ frequency, poles, slip = 0 } = {}) {
  const hz = positive(frequency);
  const poleCount = positive(poles);
  const slipPercent = Number(slip);
  if (hz == null || poleCount == null || !Number.isInteger(poleCount) || poleCount % 2 !== 0) return null;
  if (!Number.isFinite(slipPercent) || slipPercent < 0 || slipPercent >= 100) return null;
  const synchronousRpm = 120 * hz / poleCount;
  return { synchronousRpm, actualRpm: synchronousRpm * (1 - slipPercent / 100), slipPercent };
}

export function calculatePulleySpeed({ driverRpm, driverDiameter, drivenDiameter } = {}) {
  const inputRpm = positive(driverRpm);
  const drive = positive(driverDiameter);
  const driven = positive(drivenDiameter);
  if (inputRpm == null || drive == null || driven == null) return null;
  return { drivenRpm: inputRpm * drive / driven, speedRatio: driven / drive };
}

export function calculateCuttingSpeed({ target, diameterMm, rpm, cuttingSpeedMpm } = {}) {
  const diameter = positive(diameterMm);
  if (diameter == null || !['speed', 'rpm'].includes(target)) return null;
  if (target === 'speed') {
    const rotation = positive(rpm);
    if (rotation == null) return null;
    return { rpm: rotation, cuttingSpeedMpm: Math.PI * diameter * rotation / 1000 };
  }
  const speed = positive(cuttingSpeedMpm);
  if (speed == null) return null;
  return { rpm: 1000 * speed / (Math.PI * diameter), cuttingSpeedMpm: speed };
}
