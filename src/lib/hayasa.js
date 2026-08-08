// 速さ・距離・時間の計算。内部単位をメートルと秒に統一する。

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function distanceToMeters(value, unit) {
  const distance = positiveNumber(value);
  if (distance == null) return null;
  if (unit === 'm') return distance;
  if (unit === 'km') return distance * 1000;
  return null;
}

export function durationToSeconds(hours, minutes, seconds) {
  const parts = [hours, minutes, seconds].map(Number);
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return null;
  if (parts[1] >= 60 || parts[2] >= 60) return null;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function speedToMetersPerSecond(value, unit) {
  const speed = positiveNumber(value);
  if (speed == null) return null;
  if (unit === 'mps') return speed;
  if (unit === 'kmh') return speed / 3.6;
  if (unit === 'mpm') return speed / 60;
  return null;
}

function durationParts(totalSeconds) {
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  return { hours, minutes, seconds };
}

export function calculateSpeed(distance, distanceUnit, hours, minutes, seconds) {
  const distanceMeters = distanceToMeters(distance, distanceUnit);
  const durationSeconds = durationToSeconds(hours, minutes, seconds);
  if (distanceMeters == null || durationSeconds == null || durationSeconds === 0) return null;

  const metersPerSecond = distanceMeters / durationSeconds;
  return {
    distanceMeters,
    durationSeconds,
    metersPerSecond,
    kilometersPerHour: metersPerSecond * 3.6,
    metersPerMinute: metersPerSecond * 60,
    paceSecondsPerKm: durationSeconds * 1000 / distanceMeters,
  };
}

export function calculateDistance(speed, speedUnit, hours, minutes, seconds) {
  const metersPerSecond = speedToMetersPerSecond(speed, speedUnit);
  const durationSeconds = durationToSeconds(hours, minutes, seconds);
  if (metersPerSecond == null || durationSeconds == null || durationSeconds === 0) return null;

  const distanceMeters = metersPerSecond * durationSeconds;
  return {
    metersPerSecond,
    durationSeconds,
    distanceMeters,
    distanceKilometers: distanceMeters / 1000,
  };
}

export function calculateTime(distance, distanceUnit, speed, speedUnit) {
  const distanceMeters = distanceToMeters(distance, distanceUnit);
  const metersPerSecond = speedToMetersPerSecond(speed, speedUnit);
  if (distanceMeters == null || metersPerSecond == null) return null;

  const durationSeconds = distanceMeters / metersPerSecond;
  return {
    distanceMeters,
    metersPerSecond,
    durationSeconds,
    ...durationParts(durationSeconds),
  };
}
