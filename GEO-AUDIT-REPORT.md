# GEO Audit Report: keisantool.com

**监査日:** 2026-07-04
**URL:** https://keisantool.com
**サイト種別:** 日本語計算・変換ツール集（静的サイト、Astro + Cloudflare Pages、AdSense 収益）
**分析対象:** ホームページ + robots.txt + sitemap 構成 + ソースコード全体（`src/pages` 50ページ、`src/layouts/ToolLayout.astro`、`src/components/Faq.astro`、`src/components/SiteFooter.astro`、`astro.config.mjs`）

> 本監査は **GEO（Generative Engine Optimization）のみ**を対象とし、従来の SEO（キーワード順位・被リンク量など）は対象外。

---

## エグゼクティブサマリー

**総合 GEO スコア: 51/100（Poor — 弱いGEOシグナル）**

「骨格」は同規模の個人運営サイトとしては異例に強い：全50ページ中49ページに **FAQPage 構造化データ + 可視Q&A** が実装済み、完全静的HTML（JSレンダリング依存なしでAIクローラーに最適）、robots.txt は全UAに `Allow: /`（GPTBot/ClaudeBot/PerplexityBot 等を個別ブロックしていない）。一方で **llms.txt が存在しない**、**運営者・著者の実体情報がゼロ**（匿名運営）、**外部プラットフォーム上でのブランド言及が皆無**という3点が足を引っ張り、AIによる「引用はできるが、信頼できる情報源として推薦されにくい」状態になっている。

### スコア内訳

| カテゴリ | スコア | 重み | 加重スコア |
|---|---|---|---|
| AI Citability（引用適性） | 70/100 | 25% | 17.5 |
| Brand Authority（ブランド権威） | 15/100 | 20% | 3.0 |
| Content E-E-A-T | 40/100 | 20% | 8.0 |
| Technical GEO | 75/100 | 15% | 11.25 |
| Schema & Structured Data | 75/100 | 10% | 7.5 |
| Platform Optimization | 35/100 | 10% | 3.5 |
| **総合 GEO スコア** | | | **51/100** |

---

## Critical Issues（即対応）

なし。全AIクローラーがブロックされている、JSのみでコンテンツが取得不能、5xxエラー、構造化データ皆無、といった致命傷は無い。

1. ~~**llms.txt が存在しない**~~ → **対応済み（2026-07-04）**。`public/llms.txt` を新規作成し、`src/data/tools.js` の全カテゴリ・全ツールを反映。
2. **運営者・著者エンティティ情報がゼロ**（未対応）。`/about/` は運営方針は書いてあるが、個人名・組織名・資格・SNS等の"誰が書いているか"の手がかりが一切ない。AI系検索は引用元の実在性・信頼性判定にエンティティ情報を強く使う（Ahrefsの分析でも被リンクよりブランド言及の方がAI引用と相関が強いと報告）。匿名だとエンティティとして認識されず、"情報源"としてではなく"データの一部"としてしか扱われないリスクがある。
3. ~~**JSON-LDに `dateModified` が一切無い**~~ → **対応済み（2026-07-04）**。`astro.config.mjs` と `ToolLayout.astro` で git lastmod ロジックを共有関数化（`src/lib/lastmod.js`）し、jsonld を持つ306ページに `dateModified` を注入。
4. ~~**星座相性144組ページに FAQ コンポーネント未使用**~~ → **対応済み（2026-07-04）**。`seiza-aisho/[pair].astro` に3問のFAQ（相性点数・順序対称性・信頼性の免責）を追加、144ページ全てで `FAQPage` schema 出力を確認。
   - 訂正：当初「umaredoshiだけFAQ未実装」と記載したが、これは動的ルート（`[year].astro`）が `grep src/pages/*/index.astro` のワイルドカードに引っかからなかった誤検知。umaredoshiは元々FAQ実装済みだった。真の欠落は星座相性144ページの方だった。

## Medium Priority Issues（1ヶ月以内）

1. ~~**Organization / WebSite レベルの JSON-LD が無い**~~ → **一部対応済み（2026-07-04）**。ホームページに `Organization` JSON-LD を追加（`WebSite` は元々存在）。`sameAs` は外部プロフィールが無いため空のまま——今後X等を開設したら追記する。
2. **howto セクションの書き出しが「定義文」になっていない**。例：消費税ページの howto 冒頭は「上のタブから計算したい種類を選び…」という操作説明から始まり、「消費税とは何か／税込価格の計算式は何か」を1文で完結させる定義文が先頭に無い。AI Overviews やチャット系はページ冒頭〜howto先頭の1〜2文をそのまま抜粋しやすいため、抜粋されても意味が通る「一言結論文」を先頭に置くと引用されやすくなる。
3. **国保・税金など数値が自治体・年度で変わる YMYL 隣接コンテンツに、ページ単位の出典・更新日表示が無い**。`/about/` にまとめて「国税庁・厚生労働省の公開情報を参照」と書いてあるだけで、`kokuho` や `zeizei` の個別ページ本文には出典年度・根拠法令へのリンクが無い（本文中にテキストとして年度は書いてあるが、リンクや脚注形式ではない）。
4. **外部プラットフォームでのブランド存在が皆無**（Wikipedia・Reddit・YouTube・X公式アカウント・第三者レビューサイトいずれも無し、新規サイトとして想定内）。AIモデルのエンティティ認識・引用判断は一定量の第三者言及に依存するため、現状はブランドオーソリティが実質ゼロ。

## Low Priority Issues（余力があれば）

1. `og:image` はサイト共通の `og.png` 固定で、ツールごとの個別OG画像は無い（GEOへの影響は軽微、SNSシェア文脈のみ）。
2. `HowTo` schema は未使用（howto セクションはあるが `HowTo` 型JSON-LDには変換されていない）。ステップ形式の強い手順系ツール（loan返済シミュレーション等）は候補になり得る。
3. カテゴリハブページ・144件の相性診断プログラマティックページ群のFAQ内容が定型文寄りで、汎用的すぎる回答になっている箇所がある（引用時に他ページと差別化しづらい）。

---

## カテゴリ別詳細

### AI Citability（70/100）

**強み：**
- `src/components/Faq.astro` が49/50ページに実装され、`<details>` 可視Q&A + `FAQPage` JSON-LD を同時出力。AI Overviews・Perplexity・ChatGPT検索が最も好んで抜粋する「質問→簡潔な回答」形式が既にサイト全体の標準になっている（例：`kokuho` の「国民健康保険料はどう決まりますか？」→1〜2文の完結した回答）。
- howto セクション内に具体的な計算式（例：「所得割は（総所得－基礎控除43万円）×所得割率」）が明文化されており、数式レベルでの引用適性は高い。

**弱み：**
- howto の書き出しが手順説明優先で、「〇〇とは」の定義文が先頭に来ていないページが大半。
- FAQの回答文がやや長め・複文になっているページがあり、1文で完結する簡潔な回答（AIがそのまま引用しやすい形）に寄せる余地がある。

### Brand Authority（15/100）

新規個人運営サイトのため構造的に低いのは想定内だが、以下は対応可能：
- Organization/Person エンティティを`sameAs`付きで明示すれば、将来的な言及の受け皿になる。
- 運営者名・屋号を統一して名乗ることで、今後どこかで言及された際にAIが同一エンティティとして紐付けやすくなる（現状は匿名のため紐付けようがない）。

### Content E-E-A-T（40/100）

- `/about/` に運営方針・情報源（国税庁・厚労省）・独立性・広告開示（AdSense）・免責事項が揃っており、**方針レベルのTrustworthinessは悪くない**。
- 欠けているのは Experience/Expertise/Authoritativeness の3要素：著者名・監修者・資格・経歴が皆無。占い系（六星占術・厄年）は「科学的根拠を保証しない」と明記しており正直で良いが、税金・保険料計算のようなYMYL隣接ツールほど、匿名運営はAIの信頼度判定で不利に働く。
- 更新日：`/about/` 本文には「最終更新日：2026年6月16日」が手動記載されているが、個別ツールページ本体には表示が無い（sitemapのlastmodはあるがページ本体には出ていない＝AIがページを読んだだけでは鮮度不明）。

### Technical GEO（75/100）

- Astro による完全静的プリレンダリング＝JavaScript実行なしでも全コンテンツ取得可能。AIクローラー（GPTBot/ClaudeBot/PerplexityBot/Google-Extended等）にとって理想的なレンダリング形態。
- `robots.txt` は `User-agent: *` / `Allow: /` のみで、AIクローラーを個別に拒否していない＝現状は全面的にオープン。
- sitemap-index.xml → sitemap-0.xml の構成は正常。lastmodがgitコミット日時ベースで実際の更新実態を反映しており、技術実装として質が高い（ただし前述の通りJSON-LDに露出していない）。
- 減点要因はllms.txt不在のみ。

### Schema & Structured Data（75/100）

- `WebApplication`（価格0円のOffer付き）+ `BreadcrumbList` を`ToolLayout.astro`が一括注入、`FAQPage`を49ページに実装——GEOで重視される3種の構造化データのうち2.5種が高いカバー率で存在するのは同規模サイトとして優秀。
- 不足：サイト全体の`Organization`/`WebSite`、`dateModified`、`HowTo`（該当ページのみ）。

### Platform Optimization（35/100）

- llms.txt不在が最大の欠落。ChatGPT検索・Perplexity・Google AI Overviewsいずれも、サイト構造の全体像を素早くつかむ標準的な手がかりが無い状態。
- 一方でFAQ形式コンテンツ・明確な数式・完全静的レンダリングは、どのプラットフォームに対しても土台としては有利に働く。

---

## Quick Wins（今週やる）

1. ~~**`public/llms.txt` を新規作成**~~ → 完了（2026-07-04）
2. ~~**`ToolLayout.astro` の JSON-LD に `dateModified` を追加**~~ → 完了（2026-07-04、`src/lib/lastmod.js` に共通化）
3. ~~**ホームページに `Organization` + `WebSite` JSON-LD を追加**~~ → 完了（2026-07-04、`sameAs`は外部プロフィール開設後に追記）
4. ~~**星座相性144組ページにFAQコンポーネントを追加**~~ → 完了（2026-07-04）
5. **残タスク：主要ツール（zeizei/kokuho/bmi等）のhowto冒頭に1文の定義文を追加**。例：「消費税は商品・サービスの購入時にかかる税金で、標準税率10%・軽減税率8%です。」のような、単独で引用しても意味が通る一文を先頭に挿入。運営者名・屋号の明記も未着手。

## 30-Day Action Plan

### Week 1: 基盤整備
- [ ] llms.txt 作成・デプロイ
- [ ] JSON-LDに dateModified 追加
- [ ] Organization/WebSite schema をホームページに追加

### Week 2: エンティティ・信頼性
- [ ] 運営者/屋号の名称を統一し、aboutページに明記（実名開示が難しければ一貫した屋号名だけでも）
- [ ] umaredoshi に FAQ 追加
- [ ] 税金・国保など YMYL 隣接ページに出典（法令名・年度）のインライン注記を追加

### Week 3: 引用適性の底上げ
- [ ] 主要10ツール（アクセス上位）のhowto冒頭に定義文を追加
- [ ] FAQ回答文を1〜2文の簡潔な形に統一（長い複文を分割）

### Week 4: 計測・拡張
- [ ] Google Search Console / サーバーログでAIクローラー（GPTBot, ClaudeBot, PerplexityBot, Google-Extended）のアクセス有無を確認
- [ ] 残りのツールページにも定義文・出典注記を横展開

---

## Appendix: 分析対象

| 項目 | 内容 |
|---|---|
| ページ総数 | 50（`src/pages`配下、うちツールページ約41+カテゴリ/相性系プログラマティックページ） |
| FAQ実装率 | 49/50（umaredoshiのみ未実装） |
| robots.txt | `Allow: /`（AIクローラー個別ブロックなし） |
| llms.txt | 不在（404確認済み） |
| sitemap | `sitemap-index.xml` → `sitemap-0.xml`、lastmodはgitコミット日時ベース |
| JSON-LD種別 | WebApplication, BreadcrumbList, FAQPage（Organization/WebSite/HowTo/dateModifiedは未実装） |
