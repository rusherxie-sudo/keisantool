export const blogCategories = [
  {
    slug: 'uranai',
    name: '占い・文化',
    icon: '🔮',
    color: 'uranai',
    description: '六星占術の運命星・年運・霊合星人・相性の読み方を、計算例と図で解説します。占いとしての意味と、計算で確認できる範囲を分けて紹介します。',
  },
  {
    slug: 'kakutei-shinkoku',
    name: '確定申告',
    icon: '📋',
    color: 'tax',
    description:
      '確定申告の対象者、必要書類、各種控除の申告方法、還付金の仕組みを解説します。',
  },
  {
    slug: 'nematsu-chosei',
    name: '年末調整',
    icon: '🧾',
    color: 'tax',
    description:
      '年末調整の書き方や控除の種類、還付金の計算方法、パート・ダブルワークのケース別解説をまとめています。',
  },
  {
    slug: 'shakai-hoken',
    name: '社会保険・年金',
    icon: '🏥',
    color: 'tax',
    description:
      '社会保険料の計算方法や種類、パート・アルバイトの社会保険加入条件、年金やiDeCo・NISAについて解説します。',
  },
  {
    slug: 'zeikin-kiso',
    name: '税金の基礎知識',
    icon: '💰',
    color: 'tax',
    description:
      '所得税・住民税・消費税の仕組みや、各種控除の条件と計算方法を解説します。',
  },
  {
    slug: 'life-event',
    name: 'ライフイベントと税金',
    icon: '🏠',
    color: 'life',
    description:
      '結婚・出産・マイホーム購入・退職・相続など、人生の節目でかかわる税金や手続きを解説します。',
  },
  {
    slug: 'life',
    name: '暮らしの計算',
    icon: '🧮',
    color: 'life',
    description: '給与・日付・割り勘など、日常で役立つ計算方法を解説します。',
  },
  {
    slug: 'health',
    name: '健康・身体',
    icon: '🌿',
    color: 'health',
    description: 'BMIやカロリーなど、健康管理の基礎知識を解説します。',
  },
  {
    slug: 'pet',
    name: 'ペット・動物',
    icon: '🐾',
    color: 'life',
    description: '犬・猫の年齢や健康管理に役立つ基礎知識を解説します。',
  },
  {
    slug: 'tools',
    name: 'ツールの使い方',
    icon: '🛠️',
    color: 'life',
    description: '計算ツールを正しく使うための基本を解説します。',
  },
];

export const blogAuthors = {
  '計算ツール編集部': {
    name: '計算ツール編集部',
    avatar: '📝',
    bio: '税金・社会保険・日付などの計算方法と、ツールの前提・使い方を解説しています。計算結果はあくまで参考値です。',
  },
};

export function getBlogCategory(slug) {
  return blogCategories.find((c) => c.slug === slug);
}

export function getBlogCategoryColor(slug) {
  const cat = getBlogCategory(slug);
  const colorMap = {
    uranai: { accent: '#7953c4', tint: '#f3effa' },
    tax: { accent: '#2f6df0', tint: '#eef3ff' },
    health: { accent: '#15a06a', tint: '#e8f7f0' },
    life: { accent: '#e08a00', tint: '#fdf3e0' },
  };
  return colorMap[cat?.color || 'tax'] || colorMap.tax;
}
