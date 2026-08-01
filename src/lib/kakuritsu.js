// 確率・順列・組み合わせの純関数。
// 場合の数はBigIntで保持し、Numberの安全整数を超えても正確に返す。

const MAX_N = 1000;

function validCount(value) {
  return Number.isInteger(value) && value >= 0 && value <= MAX_N;
}

function absolute(value) {
  return value < 0n ? -value : value;
}

function gcd(left, right) {
  let a = absolute(left);
  let b = absolute(right);
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

export function factorial(n) {
  if (!validCount(n)) return null;
  let result = 1n;
  for (let value = 2n; value <= BigInt(n); value += 1n) result *= value;
  return result.toString();
}

export function permutation(n, r) {
  if (!validCount(n) || !validCount(r) || r > n) return null;
  let result = 1n;
  for (let index = 0; index < r; index += 1) result *= BigInt(n - index);
  return result.toString();
}

export function combination(n, r) {
  if (!validCount(n) || !validCount(r) || r > n) return null;
  const selected = Math.min(r, n - r);
  let result = 1n;
  for (let index = 1; index <= selected; index += 1) {
    result = (result * BigInt(n - selected + index)) / BigInt(index);
  }
  return result.toString();
}

export function simpleProbability(favorable, total) {
  if (!Number.isSafeInteger(favorable) || !Number.isSafeInteger(total)) return null;
  if (favorable < 0 || total <= 0 || favorable > total) return null;

  const numerator = BigInt(favorable);
  const denominator = BigInt(total);
  const divisor = gcd(numerator, denominator);
  return {
    favorable,
    total,
    numerator: (numerator / divisor).toString(),
    denominator: (denominator / divisor).toString(),
    decimal: favorable / total,
    percent: (favorable / total) * 100,
  };
}

export function repeatedTrialProbability(trials, successes, probability) {
  if (!validCount(trials) || !validCount(successes) || successes > trials) return null;
  if (typeof probability !== 'number' || !Number.isFinite(probability)) return null;
  if (probability < 0 || probability > 1) return null;

  const combinations = combination(trials, successes);
  const coefficient = Number(combinations);
  const exactly = coefficient
    * (probability ** successes)
    * ((1 - probability) ** (trials - successes));
  const atLeastOne = trials === 0 ? 0 : 1 - ((1 - probability) ** trials);

  return {
    trials,
    successes,
    probability,
    combinations,
    exactly,
    atLeastOne,
  };
}
