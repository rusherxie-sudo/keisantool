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
    name: '文字化け・全角半角変換ツール',
    icon: '🔤',
    category: '文字ツール',
    short: '全角半角・文字数カウント',
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
