// 質量パーセント濃度・モル濃度・希釈の純関数。
// 質量はg、モル濃度の体積はLにそろえ、表示側でのみ桁数を整える。

const VOLUME_TO_LITER = { mL: 0.001, L: 1 };

function finiteNumber(value) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function nonNegativeNumber(value) {
  const number = finiteNumber(value);
  return number !== null && number >= 0 ? number : null;
}

function positiveNumber(value) {
  const number = finiteNumber(value);
  return number !== null && number > 0 ? number : null;
}

function massPercentResult(soluteMass, solutionMass) {
  return {
    percent: (soluteMass / solutionMass) * 100,
    soluteMass,
    solventMass: solutionMass - soluteMass,
    solutionMass,
  };
}

export function calculateMassPercent(soluteInput, solutionInput) {
  const soluteMass = nonNegativeNumber(soluteInput);
  const solutionMass = positiveNumber(solutionInput);
  if (soluteMass === null || solutionMass === null || soluteMass > solutionMass) return null;
  return massPercentResult(soluteMass, solutionMass);
}

export function soluteMassFromPercent(solutionInput, percentInput) {
  const solutionMass = positiveNumber(solutionInput);
  const percent = nonNegativeNumber(percentInput);
  if (solutionMass === null || percent === null || percent > 100) return null;
  return massPercentResult((solutionMass * percent) / 100, solutionMass);
}

export function solutionMassFromPercent(soluteInput, percentInput) {
  const soluteMass = positiveNumber(soluteInput);
  const percent = positiveNumber(percentInput);
  if (soluteMass === null || percent === null || percent > 100) return null;
  return massPercentResult(soluteMass, (soluteMass * 100) / percent);
}

function volumeInLiters(valueInput, unit) {
  const value = positiveNumber(valueInput);
  const factor = VOLUME_TO_LITER[unit];
  return value === null || factor === undefined ? null : value * factor;
}

export function calculateMolarityFromMoles(molesInput, volumeInput, volumeUnit) {
  const moles = nonNegativeNumber(molesInput);
  const liters = volumeInLiters(volumeInput, volumeUnit);
  if (moles === null || liters === null) return null;
  return { moles, liters, molPerLiter: moles / liters };
}

export function calculateMolarityFromMass(massInput, molarMassInput, volumeInput, volumeUnit) {
  const massGrams = nonNegativeNumber(massInput);
  const molarMass = positiveNumber(molarMassInput);
  if (massGrams === null || molarMass === null) return null;
  return calculateMolarityFromMoles(massGrams / molarMass, volumeInput, volumeUnit);
}

function dilutionResult(initialConcentration, targetConcentration, stockVolume, finalVolume) {
  return {
    initialConcentration,
    targetConcentration,
    stockVolume,
    finalVolume,
    solventToAdd: finalVolume - stockVolume,
    dilutionFactor: initialConcentration / targetConcentration,
  };
}

function dilutionInputs(initialInput, targetInput) {
  const initialConcentration = positiveNumber(initialInput);
  const targetConcentration = positiveNumber(targetInput);
  if (
    initialConcentration === null ||
    targetConcentration === null ||
    targetConcentration > initialConcentration
  ) return null;
  return { initialConcentration, targetConcentration };
}

export function diluteFromStock(initialInput, stockVolumeInput, targetInput) {
  const concentrations = dilutionInputs(initialInput, targetInput);
  const stockVolume = positiveNumber(stockVolumeInput);
  if (!concentrations || stockVolume === null) return null;
  const finalVolume =
    (concentrations.initialConcentration * stockVolume) / concentrations.targetConcentration;
  return dilutionResult(
    concentrations.initialConcentration,
    concentrations.targetConcentration,
    stockVolume,
    finalVolume
  );
}

export function prepareDilution(initialInput, targetInput, finalVolumeInput) {
  const concentrations = dilutionInputs(initialInput, targetInput);
  const finalVolume = positiveNumber(finalVolumeInput);
  if (!concentrations || finalVolume === null) return null;
  const stockVolume =
    (concentrations.targetConcentration * finalVolume) / concentrations.initialConcentration;
  return dilutionResult(
    concentrations.initialConcentration,
    concentrations.targetConcentration,
    stockVolume,
    finalVolume
  );
}
