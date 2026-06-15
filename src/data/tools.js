// 全ツールのメタデータ（単一データソース）。
// ナビゲーション・関連ツール内部リンク・トップページのカードは全てここを参照する。
// 新しいツールを追加する時は、まずここに登録する。
// live:false はまだページ未作成（リンク先は今後追加）。

export const categories = [
  '税金・お金',
  '健康・身体',
  '生活・日常',
  '占い・文化',
  '文字ツール',
  '変換・ツール',
  '開発者ツール',
];

export const tools = [
  {
    slug: 'zeizei',
    nav: '消費税',
    name: '消費税・割引計算器',
    icon: '🧾',
    category: '税金・お金',
    short: '税込・税抜・割引',
    live: true,
  },
  {
    slug: 'kotei-shisan',
    nav: '固定資産税',
    name: '固定資産税計算器',
    icon: '🏠',
    category: '税金・お金',
    short: '固定資産税・都市計画税',
    live: true,
  },
  {
    slug: 'kokuho',
    nav: '国保',
    name: '国民健康保険料計算器',
    icon: '🏥',
    category: '税金・お金',
    short: '保険料シミュレーション',
    live: true,
  },
  {
    slug: 'wariai',
    nav: '割合',
    name: '割合・パーセント・比率計算器',
    icon: '％',
    category: '税金・お金',
    short: 'パーセント・比率',
    live: true,
  },
  {
    slug: 'bmi',
    nav: 'BMI',
    name: 'BMI・体脂肪率計算器',
    icon: '⚖️',
    category: '健康・身体',
    short: 'BMI・標準体重',
    live: true,
  },
  {
    slug: 'calorie',
    nav: 'カロリー',
    name: 'カロリー・基礎代謝計算器',
    icon: '🔥',
    category: '健康・身体',
    short: 'TDEE・PFCバランス',
    live: true,
  },
  {
    slug: 'hensachi',
    nav: '偏差値',
    name: '偏差値計算器',
    icon: '📊',
    category: '健康・身体',
    short: '得点から偏差値',
    live: true,
  },
  {
    slug: 'shussan',
    nav: '出産予定日',
    name: '出産予定日計算器',
    icon: '👶',
    category: '生活・日常',
    short: '妊娠週数・予定日',
    live: true,
  },
  {
    slug: 'yakudoshi',
    nav: '厄年',
    name: '厄年チェッカー',
    icon: '⛩️',
    category: '生活・日常',
    short: '前厄・本厄・後厄',
    live: true,
  },
  {
    slug: 'kyuyo',
    nav: '給与',
    name: '給与・時給・残業代計算器',
    icon: '💴',
    category: '生活・日常',
    short: '時給・残業代・手取り',
    live: true,
  },
  {
    slug: 'rokusei',
    nav: '六星占術',
    name: '六星占術・大殺界計算器',
    icon: '🔮',
    category: '占い・文化',
    short: '星・大殺界の自動計算',
    live: true,
  },
  {
    slug: 'moji',
    nav: '文字変換',
    name: '全角半角変換・文字数カウントツール',
    icon: '🔤',
    category: '文字ツール',
    short: '全角半角・かな・文字数カウント',
    live: true,
  },
  {
    slug: 'jisa',
    nav: '時差計算',
    name: '時差計算器',
    icon: '🌏',
    category: '生活・日常',
    short: '世界の都市との時差をリアルタイム表示',
    live: true,
  },
  {
    slug: 'gasoline',
    nav: 'ガソリン代',
    name: 'ガソリン代計算器',
    icon: '⛽',
    category: '生活・日常',
    short: '走行距離・燃費から交通費を計算',
    live: true,
  },
  {
    slug: 'saniku',
    nav: '産休・育休',
    name: '産休・育休計算器',
    icon: '👶',
    category: '生活・日常',
    short: '休業期間・出産手当金・育休給付金',
    live: true,
  },
  {
    slug: 'nenrei',
    nav: '年齢',
    name: '年齢計算器',
    icon: '🎂',
    category: '生活・日常',
    short: '満年齢・数え年・学年',
    live: true,
  },
  {
    slug: 'color-code',
    nav: 'カラーコード',
    name: 'カラーコード変換ツール',
    icon: '🎨',
    category: '変換・ツール',
    short: 'HEX・RGB・HSL・抵抗カラーコード',
    live: true,
  },
  {
    slug: 'tani',
    nav: '単位変換',
    name: '単位変換器',
    icon: '📐',
    category: '変換・ツール',
    short: '長さ・重さ・面積・温度ほか',
    live: true,
  },
  {
    slug: 'wareki',
    nav: '和暦西暦',
    name: '和暦・西暦変換器',
    icon: '📅',
    category: '変換・ツール',
    short: '元号⇔西暦・年齢早見',
    live: true,
  },
  {
    slug: 'base64',
    nav: 'Base64',
    name: 'Base64 エンコード / デコード',
    icon: '🔣',
    category: '開発者ツール',
    short: '文字列のBase64変換',
    live: true,
  },
  {
    slug: 'json',
    nav: 'JSON整形',
    name: 'JSON 整形・圧縮ツール',
    icon: '🧩',
    category: '開発者ツール',
    short: 'JSONの整形・圧縮・検証',
    live: true,
  },
  {
    slug: 'urlencode',
    nav: 'URLエンコード',
    name: 'URL エンコード / デコード',
    icon: '🔗',
    category: '開発者ツール',
    short: 'URL文字列の変換',
    live: true,
  },
  {
    slug: 'regex',
    nav: '正規表現',
    name: '正規表現テストツール',
    icon: '⚙️',
    category: '開発者ツール',
    short: 'パターンのマッチ確認',
    live: true,
  },
  {
    slug: 'markdown',
    nav: 'Markdown',
    name: 'Markdown → HTML 変換',
    icon: '📝',
    category: '開発者ツール',
    short: 'MarkdownをHTMLに変換',
    live: true,
  },
];

// slug でツールを取得
export function getTool(slug) {
  return tools.find((t) => t.slug === slug);
}

// 指定ツールの関連ツールを返す（同カテゴリ優先 → 不足分は他カテゴリで補充）。
// 内部リンク用。SEO要件「各ページから3つ以上」を満たす。
export function getRelated(slug, count = 4) {
  const current = getTool(slug);
  if (!current) return tools.slice(0, count);
  const sameCategory = tools.filter(
    (t) => t.slug !== slug && t.category === current.category
  );
  const others = tools.filter(
    (t) => t.slug !== slug && t.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, count);
}
