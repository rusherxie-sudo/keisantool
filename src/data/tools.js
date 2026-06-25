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

// 各カテゴリのテーマカラー（accent / tint）。方向B「明朗・親しみ」の7分類色。
// ツールページは所属カテゴリの色を --cat-color / --cat-tint として継承する（ToolLayout が <main> に注入）。
export const categoryColors = {
  '税金・お金':   { id: 'tax',     accent: '#2f6df0', tint: '#eef3ff' },
  '健康・身体':   { id: 'health',  accent: '#15a06a', tint: '#e8f7f0' },
  '生活・日常':   { id: 'life',    accent: '#e08a00', tint: '#fdf3e0' },
  '占い・文化':   { id: 'fortune', accent: '#8b5cf6', tint: '#f2edff' },
  '文字ツール':   { id: 'text',    accent: '#db4f78', tint: '#fdecf1' },
  '変換・ツール': { id: 'conv',    accent: '#0e9aa7', tint: '#e4f6f7' },
  '開発者ツール': { id: 'dev',     accent: '#5566e0', tint: '#ececff' },
};

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

// カテゴリ別ハブページ用メタデータ。name は categories と一致させる。
// slug はハブの URL（/category/<slug>/）。faq は FAQPage 構造化データにも使う。
export const categoryMeta = [
  {
    name: '税金・お金',
    slug: 'zeikin',
    h1: '税金・お金の計算ツール一覧',
    title: '税金・お金の計算ツール一覧（消費税・固定資産税・国保）| 計算ツール',
    description:
      '消費税・固定資産税・国民健康保険料・割合など、税金とお金にまつわる計算を無料でその場でできるツールをまとめました。登録不要・ブラウザ内で完結します。',
    intro:
      '消費税の税込・税抜計算、固定資産税や都市計画税の試算、国民健康保険料のシミュレーション、割合・パーセント計算など、お金に関わる計算をまとめたカテゴリです。すべて無料・登録不要で、計算はお使いのブラウザ内だけで行われます。',
    faq: [
      { q: '消費税の税込・税抜はどう計算しますか？', a: '税抜価格×1.1で税込価格に、税込価格÷1.1で税抜価格に換算できます（標準税率10%の場合）。軽減税率8%の商品は1.08で計算します。「消費税・割引計算器」で自動計算できます。' },
      { q: '固定資産税の税率は何%ですか？', a: '標準税率は課税標準額の1.4%で、別途、都市計画税が最大0.3%かかる地域があります。住宅用地や新築住宅には軽減措置があります。具体額は「固定資産税計算器」で試算してください。' },
      { q: 'これらのツールは無料で使えますか？', a: 'はい。すべて無料・登録不要です。入力した内容はサーバーに送信されず、計算はブラウザ内だけで完結します。' },
    ],
  },
  {
    name: '健康・身体',
    slug: 'kenko',
    h1: '健康・身体の計算ツール一覧',
    title: '健康・身体の計算ツール一覧（BMI・カロリー・偏差値）| 計算ツール',
    description:
      'BMI・体脂肪率、基礎代謝やカロリー（TDEE）、偏差値など、健康と身体に関する計算を無料でできるツールをまとめました。',
    intro:
      'BMIや標準体重、1日の消費カロリー（基礎代謝・TDEE）、テストの偏差値など、健康・身体まわりの数値を手軽に計算できるカテゴリです。すべて無料・登録不要で使えます。',
    faq: [
      { q: 'BMIはどうやって求めますか？', a: 'BMI＝体重(kg)÷(身長(m)×身長(m)) で計算します。例えば身長170cm・体重65kgなら 65÷(1.7×1.7)≒22.5 です。「BMI・体脂肪率計算器」で標準体重も同時に確認できます。' },
      { q: '基礎代謝とカロリー（TDEE）の違いは？', a: '基礎代謝は安静時に消費する最低限のエネルギー、TDEEは活動量も含めた1日の総消費カロリーです。「カロリー・基礎代謝計算器」で両方を計算できます。' },
    ],
  },
  {
    name: '生活・日常',
    slug: 'seikatsu',
    h1: '生活・日常の計算ツール一覧',
    title: '生活・日常の計算ツール一覧（年齢・給与・出産予定日ほか）| 計算ツール',
    description:
      '年齢計算・給与や残業代・出産予定日・産休育休・厄年・時差・ガソリン代など、日常で使う計算を無料でまとめました。',
    intro:
      '満年齢や数え年、給与・残業代・手取り、出産予定日や妊娠週数、産休・育休の期間と給付金、厄年、世界の都市との時差、ガソリン代など、暮らしに役立つ計算を集めたカテゴリです。',
    faq: [
      { q: '満年齢と数え年はどう違いますか？', a: '満年齢は生まれた日を0歳とし誕生日ごとに1歳増えます。数え年は生まれた年を1歳とし、元日（1月1日）ごとに1歳増えます。「年齢計算器」で両方を同時に確認できます。' },
      { q: '出産予定日はどう計算しますか？', a: '最終月経開始日（LMP）に280日（40週）を加えた日が一般的な目安です。「出産予定日計算器」でLMPから自動計算でき、逆算もできます。' },
    ],
  },
  {
    name: '占い・文化',
    slug: 'uranai',
    h1: '占い・文化の計算ツール一覧',
    title: '占い・文化の計算ツール一覧（六星占術・大殺界）| 計算ツール',
    description:
      '六星占術の運命星や大殺界など、占い・文化にまつわる自動計算ツールをまとめました。娯楽としてお楽しみください。',
    intro:
      '生年月日から六星占術の運命星や今年の運勢ゾーン（大殺界など）を自動で判定するなど、占い・文化に関するツールを集めたカテゴリです。結果は文化的な慣習に基づくもので、娯楽としてお楽しみください。',
    faq: [
      { q: '六星占術の運命星はどう決まりますか？', a: '生年月日をもとに、土星人・金星人・火星人・天王星人・木星人・水星人の6つの「運命星」と、陽（プラス）／陰（マイナス）を組み合わせた12タイプで判定します。「六星占術・大殺界計算器」で自動判定できます。' },
      { q: '占いの結果は信頼できますか？', a: '占い系ツールは文化的な慣習や娯楽を目的としたもので、科学的根拠を保証するものではありません。参考程度にお楽しみください。' },
    ],
  },
  {
    name: '文字ツール',
    slug: 'moji-tool',
    h1: '文字ツール一覧',
    title: '文字ツール一覧（全角半角変換・文字数カウント）| 計算ツール',
    description:
      '全角半角変換・ひらがなカタカナ変換・文字数カウントなど、文字にまつわる無料ツールをまとめました。',
    intro:
      '全角・半角の変換、ひらがな⇔カタカナ、文字数・バイト数のカウントなど、文章作成や入力チェックに役立つ文字ツールを集めたカテゴリです。すべてブラウザ内で完結します。',
    faq: [
      { q: '全角と半角はどう違いますか？', a: '全角は「ＡＢＣ１２３」のように1文字分の幅をとる文字、半角は「ABC123」のように半分の幅の文字です。文字化けや表記ゆれの原因になるため、「全角半角変換ツール」で統一できます。' },
      { q: '文字数のカウントに空白や改行は含まれますか？', a: 'ツールでは空白あり・なしの両方を表示できます。原稿用紙換算やSNSの文字数チェックにも使えます。' },
    ],
  },
  {
    name: '変換・ツール',
    slug: 'henkan',
    h1: '変換ツール一覧',
    title: '変換ツール一覧（カラーコード・単位変換・和暦西暦）| 計算ツール',
    description:
      'カラーコード（HEX・RGB・HSL）変換、長さ・重さなどの単位変換、和暦・西暦変換など、各種変換ツールを無料でまとめました。',
    intro:
      'HEX・RGB・HSLのカラーコード変換、長さ・重さ・面積・温度などの単位変換、元号と西暦の相互変換など、よく使う変換ツールを集めたカテゴリです。',
    faq: [
      { q: '令和は西暦何年ですか？', a: '令和元年は西暦2019年です。令和n年は「2018＋n」年で求められます（例：令和8年＝2026年）。「和暦・西暦変換器」で改元の境目も正確に変換できます。' },
      { q: 'HEXとRGBはどう違いますか？', a: 'HEXは #1e3a5f のように16進数で色を表す表記、RGBは赤・緑・青を0〜255の数値で表す表記です。「カラーコード変換ツール」で相互に変換できます。' },
    ],
  },
  {
    name: '開発者ツール',
    slug: 'dev-tool',
    h1: '開発者ツール一覧',
    title: '開発者ツール一覧（Base64・JSON整形・正規表現ほか）| 計算ツール',
    description:
      'Base64エンコード/デコード、JSON整形・圧縮、URLエンコード、正規表現テスト、Markdown変換など、開発者向けの無料ツールをまとめました。',
    intro:
      'Base64の変換、JSONの整形・圧縮・検証、URLエンコード/デコード、正規表現のマッチ確認、Markdown→HTML変換など、開発作業に役立つツールを集めたカテゴリです。処理はすべてブラウザ内で完結し、入力内容は送信されません。',
    faq: [
      { q: '入力したデータは外部に送信されますか？', a: 'いいえ。開発者ツールの処理はすべてお使いのブラウザ内（クライアントサイド）で完結し、入力した文字列やデータがサーバーへ送信されることはありません。' },
      { q: 'Base64とは何ですか？', a: 'Base64はデータを64種類の文字だけで表す符号化方式です。日本語や絵文字を含む文字列もUTF-8で安全に変換できます。「Base64 エンコード/デコード」で利用できます。' },
    ],
  },
];

// slug でカテゴリメタを取得
export function getCategoryMeta(slug) {
  return categoryMeta.find((c) => c.slug === slug);
}

// カテゴリ名から slug を引く（導入リンク用）
export function getCategorySlug(name) {
  return categoryMeta.find((c) => c.name === name)?.slug;
}

// slug でツールを取得
export function getTool(slug) {
  return tools.find((t) => t.slug === slug);
}

// カテゴリ名からテーマカラーを引く（未定義はブランド色にフォールバック）
export function getColorByCategory(name) {
  return categoryColors[name] || { id: '', accent: '#2563eb', tint: '#eef4ff' };
}

// ツール slug からテーマカラーを引く
export function getColorBySlug(slug) {
  const t = getTool(slug);
  return getColorByCategory(t ? t.category : '');
}

// カテゴリ slug（ハブURL）からテーマカラーを引く
export function getColorByCategorySlug(catSlug) {
  const meta = categoryMeta.find((c) => c.slug === catSlug);
  return getColorByCategory(meta ? meta.name : '');
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
