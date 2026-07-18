export function calcWarikai(amount, people, method = 'ceil', organizerPays = false) {
  const numAmount = Number(amount);
  const numPeople = Number(people);

  if (isNaN(numAmount) || isNaN(numPeople) || numAmount <= 0 || numPeople <= 0) {
    return {
      perPerson: 0,
      organizerPays: 0,
      total: 0,
      remainder: 0,
    };
  }

  let perPerson;
  if (method === 'floor') {
    perPerson = Math.floor(numAmount / numPeople);
  } else if (method === 'round') {
    perPerson = Math.round(numAmount / numPeople);
  } else {
    perPerson = Math.ceil(numAmount / numPeople);
  }

  const total = perPerson * numPeople;
  const remainder = Math.abs(total - numAmount);

  if (organizerPays) {
    const actualPerPerson = Math.floor(numAmount / numPeople);
    const organizerPaysAmount = numAmount - actualPerPerson * (numPeople - 1);
    return {
      perPerson: actualPerPerson,
      organizerPays: organizerPaysAmount,
      total: numAmount,
      remainder: numAmount % numPeople,
    };
  }

  return {
    perPerson,
    organizerPays: 0,
    total,
    remainder,
  };
}