export const TIMEZONES = [
  { id: 'Asia/Tokyo',           label: '東京（日本）' },
  { id: 'Asia/Seoul',           label: 'ソウル（韓国）' },
  { id: 'Asia/Shanghai',        label: '上海・北京（中国）' },
  { id: 'Asia/Hong_Kong',       label: '香港' },
  { id: 'Asia/Taipei',          label: '台北（台湾）' },
  { id: 'Asia/Bangkok',         label: 'バンコク（タイ）' },
  { id: 'Asia/Singapore',       label: 'シンガポール' },
  { id: 'Asia/Jakarta',         label: 'ジャカルタ（インドネシア）' },
  { id: 'Asia/Kolkata',         label: 'ムンバイ・デリー（インド）' },
  { id: 'Asia/Dubai',           label: 'ドバイ（UAE）' },
  { id: 'Europe/Istanbul',      label: 'イスタンブール（トルコ）' },
  { id: 'Europe/Moscow',        label: 'モスクワ（ロシア）' },
  { id: 'Europe/Paris',         label: 'パリ（フランス）' },
  { id: 'Europe/Berlin',        label: 'ベルリン（ドイツ）' },
  { id: 'Europe/London',        label: 'ロンドン（英国）' },
  { id: 'America/New_York',     label: 'ニューヨーク（米国東部）' },
  { id: 'America/Chicago',      label: 'シカゴ（米国中部）' },
  { id: 'America/Denver',       label: 'デンバー（米国山岳）' },
  { id: 'America/Los_Angeles',  label: 'ロサンゼルス（米国西部）' },
  { id: 'America/Anchorage',    label: 'アンカレッジ（アラスカ）' },
  { id: 'Pacific/Honolulu',     label: 'ホノルル（ハワイ）' },
  { id: 'America/Toronto',      label: 'トロント（カナダ）' },
  { id: 'America/Sao_Paulo',    label: 'サンパウロ（ブラジル）' },
  { id: 'Australia/Sydney',     label: 'シドニー（オーストラリア）' },
  { id: 'Pacific/Auckland',     label: 'オークランド（ニュージーランド）' },
];

// 指定タイムゾーンの UTC オフセット（分）を返す。DST を考慮した実際の値。
export function getOffsetMinutes(tzId, date = new Date()) {
  const utcMs = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' })).getTime();
  const localMs = new Date(date.toLocaleString('en-US', { timeZone: tzId })).getTime();
  return (localMs - utcMs) / 60000;
}

// tz1 が tz2 より何時間進んでいるかを返す（小数点0.5刻み・夏時間考慮）。
export function getDiffHours(tz1, tz2, date = new Date()) {
  const diffMinutes = getOffsetMinutes(tz1, date) - getOffsetMinutes(tz2, date);
  return diffMinutes / 60;
}

// 時差を日本語文字列にフォーマット。
export function formatDiff(diffHours) {
  if (diffHours === 0) return '同じ時刻';
  const abs = Math.abs(diffHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  let timeStr;
  if (h === 0) {
    timeStr = `${m}分`;
  } else if (m === 0) {
    timeStr = `${h}時間`;
  } else {
    timeStr = `${h}時間${m}分`;
  }
  return diffHours > 0 ? `${timeStr}進んでいる` : `${timeStr}遅れている`;
}

// 源タイムゾーンの「壁時計時刻」を目標タイムゾーンの壁時計時刻に変換する（DST 対応）。
// wall: { year, month(1-12), day, hour, minute } → 同形式を返す。
export function convertWallClock(srcTz, dstTz, wall) {
  const { year, month, day, hour, minute } = wall;
  // 近似 UTC 瞬間（源の壁時計を UTC とみなす）でオフセットを取得 → 実 UTC 瞬間を確定。
  const approxUtcMs = Date.UTC(year, month - 1, day, hour, minute);
  const srcOffset = getOffsetMinutes(srcTz, new Date(approxUtcMs));
  const utcMs = approxUtcMs - srcOffset * 60000;
  const instant = new Date(utcMs);

  // 目標タイムゾーンの壁時計成分を Intl で取り出す。
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: dstTz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(instant);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  let h = parseInt(p.hour, 10);
  if (h === 24) h = 0; // 一部環境で 24:00 と返るのを正規化
  return {
    year: parseInt(p.year, 10),
    month: parseInt(p.month, 10),
    day: parseInt(p.day, 10),
    hour: h,
    minute: parseInt(p.minute, 10),
  };
}
