// 日の出・日の入り計算ロジック（純関数・DOM非依存）。
//
// NOAA（米国海洋大気庁）が公開している低精度太陽位置式に基づく。
// 出典：NOAA General Solar Position Calculations
// （https://gml.noaa.gov/grad/solcalc/solareqns.PDF 相当のアルゴリズム）。
// 東京の実測値（国立天文台暦計算室 https://eco.mtk.nao.ac.jp/koyomi/dni/ ）との
// 突き合わせで ±1分程度の精度を確認済み（tests/hinodeiri.test.js）。
// 日本国内の緯度（北緯24〜46度程度）では白夜・極夜は発生しない。

const CITIES = [
  { id: 'wakkanai', name: '稚内', lat: 45.4153, lon: 141.6733 },
  { id: 'sapporo', name: '札幌', lat: 43.0642, lon: 141.3469 },
  { id: 'sendai', name: '仙台', lat: 38.2682, lon: 140.8694 },
  { id: 'niigata', name: '新潟', lat: 37.9161, lon: 139.0364 },
  { id: 'kanazawa', name: '金沢', lat: 36.5613, lon: 136.6562 },
  { id: 'tokyo', name: '東京', lat: 35.6762, lon: 139.6503 },
  { id: 'yokohama', name: '横浜', lat: 35.4437, lon: 139.638 },
  { id: 'nagoya', name: '名古屋', lat: 35.1815, lon: 136.9066 },
  { id: 'kyoto', name: '京都', lat: 35.0116, lon: 135.7681 },
  { id: 'osaka', name: '大阪', lat: 34.6937, lon: 135.5023 },
  { id: 'kobe', name: '神戸', lat: 34.6901, lon: 135.1955 },
  { id: 'hiroshima', name: '広島', lat: 34.3853, lon: 132.4553 },
  { id: 'fukuoka', name: '福岡', lat: 33.5904, lon: 130.4017 },
  { id: 'kagoshima', name: '鹿児島', lat: 31.5966, lon: 130.5571 },
  { id: 'naha', name: '那覇', lat: 26.2124, lon: 127.6809 },
];

const JST_OFFSET_HOURS = 9;

function toInt(v) {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

function validDate(y, m, d) {
  if (![y, m, d].every(Number.isInteger)) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

// グレゴリオ暦のユリウス通日（JDN）。
function jdn(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

// 指定日・緯度経度の日の出・日の入りをUTC分（0時からの経過分）で返す。
// 高緯度で太陽が沈まない/昇らない日は null（日本国内では実質発生しない）。
function computeSunUTCMinutes(year, month, day, lat, lon) {
  const jd = jdn(year, month, day);
  const T = (jd - 2451545.0) / 36525;
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const Mrad = toRad(M);
  const C =
    Math.sin(Mrad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * Mrad) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * Mrad) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(toRad(omega));
  const epsilon0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const epsilon = epsilon0 + 0.00256 * Math.cos(toRad(omega));
  const decl = toDeg(Math.asin(Math.sin(toRad(epsilon)) * Math.sin(toRad(lambda))));
  const y2 = Math.pow(Math.tan(toRad(epsilon) / 2), 2);
  const eqTime =
    4 *
    toDeg(
      y2 * Math.sin(2 * toRad(L0)) -
        2 * e * Math.sin(Mrad) +
        4 * e * y2 * Math.sin(Mrad) * Math.cos(2 * toRad(L0)) -
        0.5 * y2 * y2 * Math.sin(4 * toRad(L0)) -
        1.25 * e * e * Math.sin(2 * Mrad)
    );

  const zenith = 90.833; // 大気差＋太陽視半径を考慮した標準的な値
  const haArg =
    Math.cos(toRad(zenith)) / (Math.cos(toRad(lat)) * Math.cos(toRad(decl))) -
    Math.tan(toRad(lat)) * Math.tan(toRad(decl));
  if (haArg < -1 || haArg > 1) return null; // 白夜・極夜（日本国内では非該当）
  const ha = toDeg(Math.acos(haArg));

  const solarNoonUTCMin = 720 - 4 * lon - eqTime;
  return {
    sunriseUTCMin: solarNoonUTCMin - 4 * ha,
    sunsetUTCMin: solarNoonUTCMin + 4 * ha,
  };
}

function formatMinutes(mins, tzOffsetHours) {
  let m = Math.round(mins + tzOffsetHours * 60);
  m = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mi = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
}

function findCity(id) {
  return CITIES.find((c) => c.id === id);
}

/**
 * 指定日・都市の日の出・日の入り時刻（JST）。不正な日付・都市は null。
 *   { sunrise: 'HH:MM', sunset: 'HH:MM', dayLengthMinutes, city }
 */
export function hinodeIri(year, month, day, cityId) {
  const y = toInt(year);
  const m = toInt(month);
  const d = toInt(day);
  const city = findCity(cityId);
  if (!city || !validDate(y, m, d)) return null;
  const r = computeSunUTCMinutes(y, m, d, city.lat, city.lon);
  if (!r) return null;
  return {
    sunrise: formatMinutes(r.sunriseUTCMin, JST_OFFSET_HOURS),
    sunset: formatMinutes(r.sunsetUTCMin, JST_OFFSET_HOURS),
    dayLengthMinutes: Math.round(r.sunsetUTCMin - r.sunriseUTCMin),
    city: city.name,
  };
}

// 都市一覧（id・表示名のみ。緯度経度は内部計算専用のため非公開）。
export function listCities() {
  return CITIES.map(({ id, name }) => ({ id, name }));
}

/**
 * 都市別の年間早見表。各月1日・15日の日の出入りを返す。
 * SEO用の静的表と画面表示の双方で hinodeIri と同じ計算結果を共有する。
 */
export function cityYearTable(year, cityId) {
  const y = toInt(year);
  if (!Number.isInteger(y) || !findCity(cityId)) return [];

  const rows = [];
  for (let month = 1; month <= 12; month++) {
    for (const day of [1, 15]) {
      const result = hinodeIri(y, month, day, cityId);
      if (result) rows.push({ month, day, ...result });
    }
  }
  return rows;
}
