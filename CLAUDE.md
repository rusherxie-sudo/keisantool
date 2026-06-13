# CLAUDE.md

## このプロジェクトについて
日本語の計算・変換ツールサイト（keisantool.com）。Google 日本の自然検索から流入を得て AdSense で収益化する。Astro でビルドした純静的サイトを Cloudflare Pages にデプロイする。

## 言語・コミュニケーション
- **Owner との会話・ドキュメントはすべて中国語で**
- ページ内の日本語コンテンツは Claude が生成（Owner は日本語不可・校正不可）

## 技術スタック
- **Astro**（静的サイトジェネレーター、純静的 HTML を出力）
- 計算ロジックは Vanilla JS の純関数（`src/lib/`）
- テスト: vitest
- デプロイ: Cloudflare Pages
- 分析: Google Search Console + GA4

## 重要な決まり（必ず守る）

### 計算ロジックは TDD
- 計算関数は `src/lib/<tool>.js` に純関数として書く（DOM 非依存）。
- **先にテストを書き、失敗を確認してから実装する**（Owner は計算ミスを校正できないため、テストが唯一の正しさの保証）。
- 金額の端数は「切り捨て」（`Math.floor`）で整数円に丸める。

### ツールのメタデータは単一データソース
- 全ツールの情報は `src/data/tools.js` に登録。ナビ・関連リンク・トップページのカードは全てここを参照。
- **新しいツールを追加する時は、まず `tools.js` に登録**し、`live` を切り替える。

### SEO（各ページ必須）
- `<title>` / `<meta description>` / 唯一の `<h1>` / `<link canonical>` / JSON-LD（WebApplication）
- `<html lang="ja">`
- 内部リンク: 各ページから3つ以上（`RelatedTools` コンポーネントが自動生成）
- 免責事項: 「計算結果はあくまで参考値です」を必ず掲載

### 広告（AdSense）
- 結果表示エリアの直下 + ページ下部に配置（`.ad-slot`）。
- ポップアップ・インタースティシャル禁止。

## ディレクトリ構造
```
src/
  layouts/ToolLayout.astro     全ツールページ共通テンプレート（head/SEO/JSON-LD/header/footer）
  components/                  SiteHeader / SiteFooter / RelatedTools
  data/tools.js               ツールメタデータ（単一データソース）
  lib/<tool>.js               計算ロジック純関数（TDD 対象）
  pages/<slug>/index.astro     各ツールページ
  styles/global.css           全体スタイル
tests/<tool>.test.js          vitest テスト
public/robots.txt
```

## 新しいツールページの作り方（手順）
1. `src/data/tools.js` にメタデータを追加（または `live:true` に変更）
2. `tests/<tool>.test.js` を書く → `npm test` で失敗を確認（RED）
3. `src/lib/<tool>.js` を実装 → `npm test` で通過を確認（GREEN）
4. `src/pages/<slug>/index.astro` を作成（`ToolLayout` + `RelatedTools` を使う）
5. `npm run build` でビルド確認
6. デプロイ

## コマンド
- `npm test` — テスト実行
- `npm run dev` — 開発サーバー
- `npm run build` — 本番ビルド（`dist/`）

## 調研データ・建站文档の場所
- 建站文档: `/Users/jww/5kong/find/建站文档_日本計算ツールサイト.md`
- 設計仕様: `docs/superpowers/specs/`

## 残りのツール（未作成）
固定資産税 / 国保 / 割合 / BMI / カロリー / 偏差値 / 出産予定日 / 厄年 / 給与 / 六星占術 / 文字変換
（全て `tools.js` に登録済み・`live:false`。`/zeizei/` がテンプレートの見本）
