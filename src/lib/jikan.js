// 时间计算的纯函数。内部统一使用整数分钟，避免60进制进位与浮点误差。

const MINUTES_PER_DAY = 24 * 60;

function isDurationPart(value) {
  return Number.isInteger(value) && value >= 0;
}

function durationMinutes(hours, minutes) {
  if (!isDurationPart(hours) || !isDurationPart(minutes)) return null;
  return hours * 60 + minutes;
}

export function parseClock(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatDuration(totalMinutes) {
  if (!Number.isInteger(totalMinutes) || !Number.isFinite(totalMinutes)) return null;

  const sign = totalMinutes < 0 ? '−' : '';
  let remaining = Math.abs(totalMinutes);
  const days = Math.floor(remaining / MINUTES_PER_DAY);
  remaining %= MINUTES_PER_DAY;
  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;

  const parts = [];
  if (days) parts.push(`${days}日`);
  if (hours) parts.push(`${hours}時間`);
  if (minutes || parts.length === 0) parts.push(`${minutes}分`);
  return sign + parts.join('');
}

export function workDuration(startTime, endTime, breakMinutes = 0, nextDay = false) {
  const start = parseClock(startTime);
  const end = parseClock(endTime);
  if (start == null || end == null || !isDurationPart(breakMinutes)) return null;

  const grossMinutes = end - start + (nextDay ? MINUTES_PER_DAY : 0);
  if (grossMinutes < 0 || breakMinutes > grossMinutes) return null;

  const netMinutes = grossMinutes - breakMinutes;
  return {
    grossMinutes,
    breakMinutes,
    netMinutes,
    decimalHours: netMinutes / 60,
  };
}

export function shiftClock(baseTime, hours, minutes, operation = 'add') {
  const base = parseClock(baseTime);
  const duration = durationMinutes(hours, minutes);
  if (base == null || duration == null || !['add', 'subtract'].includes(operation)) return null;

  const offsetMinutes = operation === 'add' ? duration : -duration;
  const shifted = base + offsetMinutes;
  const dayOffset = Math.floor(shifted / MINUTES_PER_DAY);
  const normalized = ((shifted % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const resultHours = String(Math.floor(normalized / 60)).padStart(2, '0');
  const resultMinutes = String(normalized % 60).padStart(2, '0');

  return {
    clock: `${resultHours}:${resultMinutes}`,
    dayOffset,
    offsetMinutes,
  };
}

export function durationArithmetic(aHours, aMinutes, operation, bHours, bMinutes) {
  const a = durationMinutes(aHours, aMinutes);
  const b = durationMinutes(bHours, bMinutes);
  if (a == null || b == null || !['add', 'subtract'].includes(operation)) return null;

  const totalMinutes = operation === 'add' ? a + b : a - b;
  return { totalMinutes, decimalHours: totalMinutes / 60 };
}

export function durationToDecimal(hours, minutes) {
  const totalMinutes = durationMinutes(hours, minutes);
  if (totalMinutes == null) return null;
  return { totalMinutes, decimalHours: totalMinutes / 60 };
}

export function decimalToDuration(decimalHours) {
  if (!Number.isFinite(decimalHours) || decimalHours < 0) return null;
  const totalMinutes = Math.round(decimalHours * 60);
  return {
    totalMinutes,
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}
