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

// 「日本と○○の時差」という都市別ページの単一データ源。
// dstPattern は代表日を選ぶための区分で、実際の変換は Intl の IANA データに委ねる。
export const JAPAN_TIME_PAIRS = [
  {
    slug: 'new-york', city: 'ニューヨーク', country: 'アメリカ', tzId: 'America/New_York', dstPattern: 'north',
    summary: '出張・オンライン会議・米国市場の開始時刻を、日本時間から迷わず確認できます。',
  },
  {
    slug: 'los-angeles', city: 'ロサンゼルス', country: 'アメリカ', tzId: 'America/Los_Angeles', dstPattern: 'north',
    summary: '西海岸への連絡やフライト予定に使える、日本時間とロサンゼルス時間の変換ページです。',
  },
  {
    slug: 'hawaii', city: 'ハワイ（ホノルル）', country: 'アメリカ', tzId: 'Pacific/Honolulu', dstPattern: 'none',
    summary: 'ハワイ旅行の到着時刻や日本への連絡時間を、日付のずれまで含めて確認できます。',
  },
  {
    slug: 'london', city: 'ロンドン', country: 'イギリス', tzId: 'Europe/London', dstPattern: 'north',
    summary: '英国との会議や旅行に便利な、日本時間とロンドン時間の変換ページです。',
  },
  {
    slug: 'paris', city: 'パリ', country: 'フランス', tzId: 'Europe/Paris', dstPattern: 'north',
    summary: 'フランスへの連絡や旅行計画に使える、日本時間とパリ時間の変換ページです。',
  },
  {
    slug: 'sydney', city: 'シドニー', country: 'オーストラリア', tzId: 'Australia/Sydney', dstPattern: 'south',
    summary: '南半球の夏時間も含め、日本時間とシドニー時間を正確に変換できます。',
  },
  {
    slug: 'seoul', city: 'ソウル', country: '韓国', tzId: 'Asia/Seoul', dstPattern: 'none',
    summary: '日本と同じ時刻を使うソウルについて、現在時刻と日付を並べて確認できます。',
  },
  {
    slug: 'shanghai', city: '上海・北京', country: '中国', tzId: 'Asia/Shanghai', dstPattern: 'none',
    summary: '中国への連絡や出張に使える、日本時間と中国標準時の変換ページです。',
  },
  {
    slug: 'taipei', city: '台北', country: '台湾', tzId: 'Asia/Taipei', dstPattern: 'none',
    summary: '台湾旅行や現地への連絡に便利な、日本時間と台北時間の変換ページです。',
  },
  {
    slug: 'singapore', city: 'シンガポール', country: 'シンガポール', tzId: 'Asia/Singapore', dstPattern: 'none',
    summary: '出張やオンライン会議に使える、日本時間とシンガポール時間の変換ページです。',
  },
  {
    slug: 'bangkok', city: 'バンコク', country: 'タイ', tzId: 'Asia/Bangkok', dstPattern: 'none',
    summary: 'タイ旅行や現地への連絡に便利な、日本時間とバンコク時間の変換ページです。',
  },
  {
    slug: 'india', city: 'インド（デリー・ムンバイ）', country: 'インド', tzId: 'Asia/Kolkata', dstPattern: 'none',
    summary: '30分単位のずれがある日本時間とインド標準時を、分まで正確に変換できます。',
  },
];

export function getJapanTimePair(slug) {
  return JAPAN_TIME_PAIRS.find((pair) => pair.slug === slug);
}

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

// 標準時と夏時間それぞれの「日本が現地より何時間進んでいるか」を返す。
// 北半球は1月が標準時・7月が夏時間、南半球はその逆を代表日として使う。
export function getJapanTimeProfile(pair, year = new Date().getFullYear()) {
  if (!pair) throw new TypeError('都市データが必要です');

  const january = new Date(Date.UTC(year, 0, 15, 12));
  const july = new Date(Date.UTC(year, 6, 15, 12));
  const januaryDiff = getDiffHours('Asia/Tokyo', pair.tzId, january);
  const julyDiff = getDiffHours('Asia/Tokyo', pair.tzId, july);

  if (pair.dstPattern === 'none' || januaryDiff === julyDiff) {
    return { standardDiff: januaryDiff, daylightDiff: null, hasDst: false };
  }

  return pair.dstPattern === 'south'
    ? { standardDiff: julyDiff, daylightDiff: januaryDiff, hasDst: true }
    : { standardDiff: januaryDiff, daylightDiff: julyDiff, hasDst: true };
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function dateRelation(source, destination) {
  const sourceDay = Date.UTC(source.year, source.month - 1, source.day);
  const destinationDay = Date.UTC(destination.year, destination.month - 1, destination.day);
  const dayDiff = Math.round((destinationDay - sourceDay) / 86400000);
  if (dayDiff < 0) return '前日';
  if (dayDiff > 0) return '翌日';
  return '同日';
}

// 日本時間の代表時刻を現地時刻に変換し、検索結果にも読める静的な早見表を作る。
export function buildJapanTimeTable(pair, date, hours = [0, 3, 6, 9, 12, 15, 18, 21]) {
  if (!pair) throw new TypeError('都市データが必要です');

  return hours.map((hour) => {
    const japanWall = { ...date, hour, minute: 0 };
    const localWall = convertWallClock('Asia/Tokyo', pair.tzId, japanWall);
    return {
      japan: `${pad2(hour)}:00`,
      local: `${dateRelation(japanWall, localWall)} ${pad2(localWall.hour)}:${pad2(localWall.minute)}`,
    };
  });
}
