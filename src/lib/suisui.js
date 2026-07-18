export function calcSuisui(weight, activity = 'normal') {
  const numWeight = Number(weight);

  if (isNaN(numWeight) || numWeight <= 0) {
    return {
      recommended: 0,
      glasses: 0,
    };
  }

  let multiplier;
  if (activity === 'active') {
    multiplier = 40;
  } else if (activity === 'sedentary') {
    multiplier = 25;
  } else {
    multiplier = 30;
  }

  const recommended = Math.floor(numWeight * multiplier);
  const glasses = Math.ceil(recommended / 150);

  return {
    recommended,
    glasses,
  };
}