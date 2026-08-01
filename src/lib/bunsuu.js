// 分数の四則計算・約分・帯分数・小数変換の純関数。
// 計算の中心はBigIntで保持し、Numberへ変換しないことで分数を正確に扱う。

const MAX_INTEGER_DIGITS = 100;
const MAX_DECIMAL_DIGITS = 30;
const DECIMAL_DISPLAY_DIGITS = 12;

function parseInteger(value) {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) ? BigInt(value) : null;
  }
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!/^[+-]?\d+$/.test(text)) return null;
  if (text.replace(/^[+-]/, '').length > MAX_INTEGER_DIGITS) return null;
  try {
    return BigInt(text);
  } catch {
    return null;
  }
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

function normalizePair(numerator, denominator) {
  if (denominator === 0n) return null;
  if (numerator === 0n) return { numerator: 0n, denominator: 1n };

  let n = numerator;
  let d = denominator;
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const divisor = gcd(n, d);
  return { numerator: n / divisor, denominator: d / divisor };
}

function pairToStrings(pair) {
  return {
    numerator: pair.numerator.toString(),
    denominator: pair.denominator.toString(),
  };
}

export function normalizeFraction(numerator, denominator) {
  const n = parseInteger(numerator);
  const d = parseInteger(denominator);
  if (n === null || d === null) return null;
  const pair = normalizePair(n, d);
  return pair ? pairToStrings(pair) : null;
}

function mixedToPair({ whole = '0', numerator = '0', denominator = '1' } = {}) {
  const w = parseInteger(whole === '' ? '0' : whole);
  const n = parseInteger(numerator);
  const d = parseInteger(denominator);
  if (w === null || n === null || d === null || d === 0n) return null;

  const positiveDenominator = absolute(d);
  const signedNumerator = d < 0n ? -n : n;
  let improper;
  if (w < 0n && signedNumerator > 0n) {
    improper = w * positiveDenominator - signedNumerator;
  } else {
    improper = w * positiveDenominator + signedNumerator;
  }
  return normalizePair(improper, positiveDenominator);
}

export function mixedToFraction(parts) {
  const pair = mixedToPair(parts);
  return pair ? pairToStrings(pair) : null;
}

function pairToMixed(pair) {
  const n = pair.numerator;
  const d = pair.denominator;
  const sign = n < 0n ? '-' : '';
  const magnitude = absolute(n);
  const wholeMagnitude = magnitude / d;
  const remainder = magnitude % d;

  if (remainder === 0n) {
    const whole = `${sign}${wholeMagnitude}`;
    return { whole, numerator: '0', denominator: '1', display: whole };
  }

  if (wholeMagnitude === 0n) {
    return {
      whole: '0',
      numerator: remainder.toString(),
      denominator: d.toString(),
      display: `${sign}${remainder}/${d}`,
    };
  }

  const whole = `${sign}${wholeMagnitude}`;
  return {
    whole,
    numerator: remainder.toString(),
    denominator: d.toString(),
    display: `${whole} ${remainder}/${d}`,
  };
}

export function fractionToMixed(numerator, denominator) {
  const normalized = normalizeFraction(numerator, denominator);
  if (!normalized) return null;
  return pairToMixed({
    numerator: BigInt(normalized.numerator),
    denominator: BigInt(normalized.denominator),
  });
}

function pairToImproper(pair) {
  if (pair.denominator === 1n) return pair.numerator.toString();
  return `${pair.numerator}/${pair.denominator}`;
}

function pairToDecimal(pair, maximumDigits = DECIMAL_DISPLAY_DIGITS) {
  if (pair.numerator === 0n) return '0';
  const sign = pair.numerator < 0n ? '-' : '';
  const magnitude = absolute(pair.numerator);
  const integerPart = magnitude / pair.denominator;
  let remainder = magnitude % pair.denominator;
  if (remainder === 0n) return `${sign}${integerPart}`;

  let decimals = '';
  for (let index = 0; index < maximumDigits && remainder !== 0n; index += 1) {
    remainder *= 10n;
    decimals += (remainder / pair.denominator).toString();
    remainder %= pair.denominator;
  }
  return `${sign}${integerPart}.${decimals}`;
}

function buildResult(pair) {
  const mixed = pairToMixed(pair);
  const percentPair = normalizePair(pair.numerator * 100n, pair.denominator);
  return {
    ...pairToStrings(pair),
    improper: pairToImproper(pair),
    mixed: mixed.display,
    decimal: pairToDecimal(pair),
    percent: `${pairToDecimal(percentPair, 10)}%`,
  };
}

function operationSymbol(operation) {
  return { add: '＋', subtract: '−', multiply: '×', divide: '÷' }[operation] ?? null;
}

export function calculateFraction({ left, right, operation } = {}) {
  const leftPair = mixedToPair(left);
  const rightPair = mixedToPair(right);
  const symbol = operationSymbol(operation);
  if (!leftPair || !rightPair || !symbol) return null;
  if (operation === 'divide' && rightPair.numerator === 0n) return null;

  let rawNumerator;
  let rawDenominator;
  const leftText = pairToImproper(leftPair);
  const rightText = pairToImproper(rightPair);
  const steps = [`${leftText} ${symbol} ${rightText}`];

  if (operation === 'add' || operation === 'subtract') {
    const commonDenominator = (leftPair.denominator / gcd(leftPair.denominator, rightPair.denominator))
      * rightPair.denominator;
    const convertedLeft = leftPair.numerator * (commonDenominator / leftPair.denominator);
    const convertedRight = rightPair.numerator * (commonDenominator / rightPair.denominator);
    steps.push(`${convertedLeft}/${commonDenominator} ${symbol} ${convertedRight}/${commonDenominator}`);
    rawNumerator = operation === 'add'
      ? convertedLeft + convertedRight
      : convertedLeft - convertedRight;
    rawDenominator = commonDenominator;
  } else if (operation === 'multiply') {
    rawNumerator = leftPair.numerator * rightPair.numerator;
    rawDenominator = leftPair.denominator * rightPair.denominator;
    steps.push(`${rawNumerator}/${rawDenominator}`);
  } else {
    const reciprocal = normalizePair(rightPair.denominator, rightPair.numerator);
    steps.push(`${leftText} × ${pairToImproper(reciprocal)}`);
    rawNumerator = leftPair.numerator * reciprocal.numerator;
    rawDenominator = leftPair.denominator * reciprocal.denominator;
    steps.push(`${rawNumerator}/${rawDenominator}`);
  }

  const resultPair = normalizePair(rawNumerator, rawDenominator);
  if (!resultPair) return null;
  const finalText = pairToImproper(resultPair);
  if (steps[steps.length - 1] !== finalText) steps.push(finalText);

  return {
    left: buildResult(leftPair),
    right: buildResult(rightPair),
    operation,
    symbol,
    result: buildResult(resultPair),
    steps,
  };
}

export function decimalToFraction(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  const match = /^([+-]?)(\d+)(?:\.(\d*))?$/.exec(text);
  if (!match) return null;

  const [, sign, integerPart, decimalPart = ''] = match;
  if (decimalPart.length > MAX_DECIMAL_DIGITS) return null;
  if (`${integerPart}${decimalPart}`.length > MAX_INTEGER_DIGITS) return null;

  const denominator = 10n ** BigInt(decimalPart.length);
  const digits = BigInt(`${integerPart}${decimalPart}` || '0');
  const numerator = sign === '-' ? -digits : digits;
  const pair = normalizePair(numerator, denominator);
  return pair ? buildResult(pair) : null;
}
