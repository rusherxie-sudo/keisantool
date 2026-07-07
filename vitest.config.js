import { defineConfig } from 'vitest/config';

// テスト対象は「このプロジェクトの tests/ ディレクトリ」だけに限定する。
// 理由: vitest はデフォルトで全リポジトリの *.test.js を拾うため、
// .claude/worktrees/ 配下に残った旧 worktree のテスト副本や、その node_modules の
// テストまで実行してしまい、`npm test` の件数が実態（39ファイル/943件）から
// 大きく水増しされていた（2865件/118ファイルと誤報）。include で白リスト化して防ぐ。
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**'],
  },
});
