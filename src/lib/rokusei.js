// 六星占術（細木数子・細木かおり）の運命星・大殺界の計算ロジック（純関数・DOM非依存）。
//
// ▼算法の出典・検証根拠
//  - 運命星の決定法（日の干支→空亡→運命星）と陽陰判定:
//      大久保占い研究室「六星占術 大殺界の調べ方」 https://www.senjutsu.jp/labo_6sei
//      （公式例: 1958-02-24 は 壬申 → 空亡 戌亥 → 土星人）
//  - 計算式・星数→運命星の対応・陽陰: https://fortune.netoff.co.jp/rokusei/keisan/ 他
//  - 年運（ゾーン周期・大殺界の年）: 大殺界早見表 https://daisakkai.net/nenun
//      （2025/2026年の12タイプ別ゾーン一覧から各タイプの「種子の年」を導出・検証）
//
//  ※六星占術は占い（娯楽）であり、科学的根拠はありません。出版物・各サイト間で
//    計算法に細部の差異があるため、本実装は最も整合性の高い「日の空亡」方式を採用しています。

// ── 六十干支（甲子=0 起点）────────────────────────────────
const KAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const SHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 旬（10干支ごと）に対応する空亡と運命星。
//  甲子旬(0-9)→戌亥→土星人 / 甲戌旬(10-19)→申酉→金星人 /
//  甲申旬(20-29)→午未→火星人 / 甲午旬(30-39)→辰巳→天王星人 /
//  甲辰旬(40-49)→寅卯→木星人 / 甲寅旬(50-59)→子丑→水星人
const KUUBOU = ['戌亥', '申酉', '午未', '辰巳', '寅卯', '子丑'];
const STARS = ['土星人', '金星人', '火星人', '天王星人', '木星人', '水星人'];

// 陽支（プラス）: 子寅辰午申戌 / 陰支（マイナス）: 丑卯巳未酉亥
const PLUS_BRANCHES = new Set([0, 2, 4, 6, 8, 10]);

// 入力の妥当性チェック（実在する日付か）。
function validDate(y, m, d) {
  if (![y, m, d].every((v) => Number.isInteger(v))) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
}

// グレゴリオ暦のユリウス通日（JDN）。日の干支を一意に決めるために使う。
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

// 日の干支インデックス（0=甲子 … 59=癸亥）。
// アンカー11は「1958-02-24=壬申(index8)」「1985-08-20=辛卯(index27)」で校正済み。
function kanshiIndex(y, m, d) {
  return ((jdn(y, m, d) - 11) % 60 + 60) % 60;
}

// 年支インデックス（0=子 … 11=亥）。
function yearBranch(y) {
  return ((y - 4) % 12 + 12) % 12;
}

// 日の六十干支（例: '辛卯'）。
export function kanshi(y, m, d) {
  const k = kanshiIndex(y, m, d);
  return KAN[k % 10] + SHI[k % 12];
}

// 日の空亡から運命星を求める。{ star, kuubou } を返す。
export function unmeiStar(y, m, d) {
  const g = Math.floor(kanshiIndex(y, m, d) / 10);
  return { star: STARS[g], kuubou: KUUBOU[g] };
}

// 年支による陽陰（プラス／マイナス）。
export function polarity(y) {
  return PLUS_BRANCHES.has(yearBranch(y)) ? 'プラス' : 'マイナス';
}

// ── 運命周期（12年）────────────────────────────────────
// 並び順。陰影・停止・減退が大殺界、健弱が小殺界、乱気が中殺界。
const ZONES = [
  '種子',
  '緑生',
  '立花',
  '健弱',
  '達成',
  '乱気',
  '再会',
  '財成',
  '安定',
  '陰影',
  '停止',
  '減退',
];

// 各ゾーンの分類（殺界の区分）。
const ZONE_CATEGORY = {
  種子: '好調',
  緑生: '好調',
  立花: '好調',
  健弱: '小殺界',
  達成: '好調',
  乱気: '中殺界',
  再会: '好調',
  財成: '好調',
  安定: '好調',
  陰影: '大殺界',
  停止: '大殺界',
  減退: '大殺界',
};

// 各ゾーンの一言コメント（娯楽目的の参考）。
const ZONE_DESC = {
  種子: '新しい運気が芽吹く出発の年。種まきに向く時期。',
  緑生: '蓄えた力が育ち始める成長の年。',
  立花: '努力が実を結び花開く好調の年。',
  健弱: '小殺界。心身の無理は禁物。健康管理を大切に。',
  達成: '目標が形になりやすい充実の年。',
  乱気: '中殺界。気持ちが乱れやすく判断ミスに注意。',
  再会: '人との縁が再びつながる回復の年。',
  財成: '実りや成果が得られやすい安定の年。',
  安定: '心穏やかに過ごせる落ち着いた年。',
  陰影: '大殺界の入口。新規の大きな決断は控えめに。',
  停止: '大殺界の中心。現状維持と慎重さを心がけたい年。',
  減退: '大殺界の終盤。次への充電期間として静かに過ごす年。',
};

// 各タイプ（運命星＋陽陰）の「種子の年」の年支インデックス。
// daisakkai.net の2025/2026年運一覧から導出（種子=2025年の年支 − その年のゾーン番号）。
//   土星人プラス=子, 土星人マイナス=丑, 金星人プラス=戌, 金星人マイナス=亥,
//   火星人プラス=申, 火星人マイナス=酉, 天王星人プラス=午, 天王星人マイナス=未,
//   木星人プラス=辰, 木星人マイナス=巳, 水星人プラス=寅, 水星人マイナス=卯
const SEED_BRANCH = {
  土星人プラス: 0,
  土星人マイナス: 1,
  水星人マイナス: 3,
  水星人プラス: 2,
  木星人マイナス: 5,
  木星人プラス: 4,
  金星人マイナス: 11,
  金星人プラス: 10,
  火星人マイナス: 9,
  火星人プラス: 8,
  天王星人マイナス: 7,
  天王星人プラス: 6,
};

// 早見表で使う表示順。6運命星ごとにプラス→マイナスの順で固定する。
const FORTUNE_TYPES = STARS.flatMap((star) => [
  `${star}プラス`,
  `${star}マイナス`,
]);

// タイプ別静的ページのURL契約。表示順は FORTUNE_TYPES と一致させる。
const FORTUNE_TYPE_PAGES = [
  { slug: 'doseijin-plus', type: '土星人プラス', star: '土星人', polarity: 'プラス' },
  { slug: 'doseijin-minus', type: '土星人マイナス', star: '土星人', polarity: 'マイナス' },
  { slug: 'kinseijin-plus', type: '金星人プラス', star: '金星人', polarity: 'プラス' },
  { slug: 'kinseijin-minus', type: '金星人マイナス', star: '金星人', polarity: 'マイナス' },
  { slug: 'kaseijin-plus', type: '火星人プラス', star: '火星人', polarity: 'プラス' },
  { slug: 'kaseijin-minus', type: '火星人マイナス', star: '火星人', polarity: 'マイナス' },
  { slug: 'tenouseijin-plus', type: '天王星人プラス', star: '天王星人', polarity: 'プラス' },
  { slug: 'tenouseijin-minus', type: '天王星人マイナス', star: '天王星人', polarity: 'マイナス' },
  { slug: 'mokuseijin-plus', type: '木星人プラス', star: '木星人', polarity: 'プラス' },
  { slug: 'mokuseijin-minus', type: '木星人マイナス', star: '木星人', polarity: 'マイナス' },
  { slug: 'suiseijin-plus', type: '水星人プラス', star: '水星人', polarity: 'プラス' },
  { slug: 'suiseijin-minus', type: '水星人マイナス', star: '水星人', polarity: 'マイナス' },
];

// 呼び出し側が静的定義を変更できないよう、各要素もコピーして返す。
export function fortuneTypes() {
  return FORTUNE_TYPE_PAGES.map((item) => ({ ...item }));
}

// 指定タイプ・指定西暦年のゾーンを返す。{ zone, category, desc } または null。
export function fortuneZone(type, year) {
  const seed = SEED_BRANCH[type];
  if (seed === undefined || !Number.isInteger(year)) return null;
  const idx = ((yearBranch(year) - seed) % 12 + 12) % 12;
  const zone = ZONES[idx];
  return { zone, category: ZONE_CATEGORY[zone], desc: ZONE_DESC[zone] };
}

// 指定年の12タイプ別運勢を、早見表向けの固定順で返す。
// ページ側で12タイプや分類を重複定義しないための単一データ源。
export function fortuneTable(year) {
  if (!Number.isInteger(year)) return [];
  return FORTUNE_TYPES.map((type) => {
    const { zone, category } = fortuneZone(type, year);
    return { type, zone, category };
  });
}

// 基準年から count 年分の運勢ゾーンを配列で返す。
export function forecast(type, baseYear, count = 3) {
  if (SEED_BRANCH[type] === undefined || !Number.isInteger(baseYear)) return [];
  const list = [];
  for (let i = 0; i < count; i++) {
    const year = baseYear + i;
    list.push({ year, ...fortuneZone(type, year) });
  }
  return list;
}

// 生年月日から運命星・陽陰・干支・空亡を総合判定。不正な日付は null。
export function rokusei(year, month, day) {
  if (!validDate(year, month, day)) return null;
  const { star, kuubou } = unmeiStar(year, month, day);
  const pol = polarity(year);
  return {
    star,
    polarity: pol,
    type: star + pol,
    kanshi: kanshi(year, month, day),
    kuubou,
    yearBranch: SHI[yearBranch(year)],
  };
}
