import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

function halfWidthDigits(value) {
  return String(value ?? '').replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
}

export function normalizePhoneDigits(value) {
  const raw = halfWidthDigits(value).trim();
  const hasJapanCode = /^\+\s*81/.test(raw) || /^0081/.test(raw);
  let digits = raw.replace(/\D/g, '');
  if (hasJapanCode) digits = digits.replace(/^(?:0081|81)0?/, '0');
  return digits;
}

export function formatJapanesePhone(value) {
  const original = String(value ?? '').trim();
  const digits = normalizePhoneDigits(original);
  const source = /^\+/.test(halfWidthDigits(original)) ? `+${halfWidthDigits(original).replace(/\D/g, '')}` : digits;
  const parsed = parsePhoneNumberFromString(source, 'JP');
  const valid = Boolean(parsed?.isValid() && parsed.country === 'JP');
  if (!valid) return { original, digits, formatted: original, international: '', valid: false, type: null };
  return {
    original,
    digits: parsed.nationalNumber ? `0${parsed.nationalNumber}` : digits,
    formatted: parsed.formatNational(),
    international: parsed.formatInternational(),
    valid: true,
    type: parsed.getType() ?? null,
  };
}

export function formatPhoneLines(value) {
  return String(value ?? '').split(/\r?\n/).map((line) => {
    if (!line.trim()) return { original: line, digits: '', formatted: '', international: '', valid: false, type: null };
    return formatJapanesePhone(line);
  });
}
