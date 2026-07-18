import { categories, tools } from '../data/tools.js';

export function buildLlms() {
  const lines = [
    '# 計算ツール（keisantool.com）',
    '',
    '> 日本語の計算・変換ツール集。登録不要・ブラウザ内完結・無料で提供しています。入力内容はサーバーに送信されません。計算結果はすべて参考値です。',
    '',
    'このサイトは Astro により静的生成され、JavaScript を実行しなくても本文を取得できます。',
  ];
  for (const category of categories) {
    const entries = tools.filter((tool) => tool.category === category && tool.live !== false);
    if (!entries.length) continue;
    lines.push('', `## ${category}`, '');
    for (const tool of entries) {
      lines.push(`- [${tool.name}](https://keisantool.com/${tool.slug}/): ${tool.short}`);
    }
  }
  lines.push(
    '', '## コンテンツ', '',
    '- [ブログ](https://keisantool.com/blog/): 税金・社会保険・暮らしに関する解説記事',
    '', '## サイト情報', '',
    '- [このサイトについて](https://keisantool.com/about/)',
    '- [プライバシーポリシー](https://keisantool.com/privacy/)',
    '- [利用規約・免責事項](https://keisantool.com/terms/)',
    '- [お問い合わせ](https://keisantool.com/contact/)', ''
  );
  return lines.join('\n');
}
