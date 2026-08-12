// 歯車比計算の純関数。単純な外歯車対と理想伝達を扱う。
function positive(value) { if (value === '' || value == null) return null; const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; }

export function solveGearPair({ driveTeeth, drivenTeeth, inputRpm, inputTorque, efficiency = 100 } = {}) {
  const drive = positive(driveTeeth), driven = positive(drivenTeeth), eff = positive(efficiency);
  if (!drive || !driven || !eff || eff > 100) return null;
  const ratio = driven / drive;
  const rpm = inputRpm === '' || inputRpm == null ? null : positive(inputRpm);
  const torque = inputTorque === '' || inputTorque == null ? null : positive(inputTorque);
  if ((inputRpm !== '' && inputRpm != null && !rpm) || (inputTorque !== '' && inputTorque != null && !torque)) return null;
  return { ratio, driveTeeth: drive, drivenTeeth: driven, efficiency: eff / 100, outputRpm: rpm === null ? null : rpm / ratio, outputTorque: torque === null ? null : torque * ratio * eff / 100 };
}

export function compoundGearRatio(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) return null;
  let ratio = 1;
  for (const pair of pairs) { const drive = positive(pair?.drive), driven = positive(pair?.driven); if (!drive || !driven) return null; ratio *= driven / drive; }
  return ratio;
}

export function solveBicycleGear({ frontTeeth, rearTeeth, wheelCircumferenceM, cadenceRpm } = {}) {
  const front = positive(frontTeeth), rear = positive(rearTeeth), circumference = positive(wheelCircumferenceM), cadence = positive(cadenceRpm);
  if (!front || !rear || !circumference || !cadence) return null;
  const ratio = front / rear, distancePerCrankM = circumference * ratio;
  return { ratio, distancePerCrankM, speedKmh: distancePerCrankM * cadence * 60 / 1000 };
}
