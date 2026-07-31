const ROUND_UNITS = [1, 10, 100, 500, 1000];

function emptyResult() {
  return {
    perPerson: 0,
    organizerPays: 0,
    total: 0,
    remainder: 0,
    difference: 0,
  };
}

export function roundToUnit(value, unit = 1, method = 'ceil') {
  const numValue = Number(value);
  const numUnit = ROUND_UNITS.includes(Number(unit)) ? Number(unit) : 1;
  if (!Number.isFinite(numValue)) return 0;

  const scaled = numValue / numUnit;
  if (method === 'floor') return Math.floor(scaled) * numUnit;
  if (method === 'round') return Math.round(scaled) * numUnit;
  return Math.ceil(scaled) * numUnit;
}

export function calcWarikai(amount, people, method = 'ceil', organizerPays = false, unit = 1) {
  const numAmount = Math.floor(Number(amount));
  const numPeople = Number(people);

  if (!Number.isFinite(numAmount) || !Number.isInteger(numPeople) || numAmount <= 0 || numPeople <= 0) {
    return emptyResult();
  }

  // 幹事調整では、ほかの参加者を指定単位で切り捨て、幹事が残額を正確に負担する。
  if (organizerPays) {
    const perPerson = roundToUnit(numAmount / numPeople, unit, 'floor');
    const organizerPaysAmount = numAmount - perPerson * (numPeople - 1);
    return {
      perPerson,
      organizerPays: organizerPaysAmount,
      total: numAmount,
      remainder: numAmount - perPerson * numPeople,
      difference: 0,
    };
  }

  const perPerson = roundToUnit(numAmount / numPeople, unit, method);
  const total = perPerson * numPeople;
  const difference = total - numAmount;

  return {
    perPerson,
    organizerPays: 0,
    total,
    remainder: Math.abs(difference),
    difference,
  };
}

function emptyWeightedResult() {
  return { groups: [], people: 0, total: 0, collectedTotal: 0, difference: 0 };
}

// 人数×倍率を「口数」として会計を比例配分し、グループごとの集金額を返す。
export function calcWeightedWarikai(amount, groups, unit = 100, method = 'round') {
  const numAmount = Math.floor(Number(amount));
  if (!Number.isFinite(numAmount) || numAmount <= 0 || !Array.isArray(groups) || groups.length === 0) {
    return emptyWeightedResult();
  }

  const normalizedGroups = groups.map((group, index) => ({
    name: String(group?.name || `グループ${index + 1}`),
    people: Number(group?.people),
    weight: Number(group?.weight),
  }));

  const invalid = normalizedGroups.some((group) => (
    !Number.isInteger(group.people) || group.people <= 0 ||
    !Number.isFinite(group.weight) || group.weight <= 0
  ));
  if (invalid) return emptyWeightedResult();

  const totalWeight = normalizedGroups.reduce((sum, group) => sum + group.people * group.weight, 0);
  const resultGroups = normalizedGroups.map((group) => {
    const rawPerPerson = numAmount * group.weight / totalWeight;
    const perPerson = roundToUnit(rawPerPerson, unit, method);
    return {
      ...group,
      perPerson,
      subtotal: perPerson * group.people,
    };
  });
  const people = resultGroups.reduce((sum, group) => sum + group.people, 0);
  const collectedTotal = resultGroups.reduce((sum, group) => sum + group.subtotal, 0);

  return {
    groups: resultGroups,
    people,
    total: numAmount,
    collectedTotal,
    difference: collectedTotal - numAmount,
  };
}
