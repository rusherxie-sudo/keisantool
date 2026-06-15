// Markdown → HTML 変換（marked の薄いラッパー）
//
// 計算ロジックではなく文字列変換だが、ページが依存する公開関数として
// テスト可能な純関数の形で提供する。実際の変換は実績のある marked に委譲し、
// ここでは「空文字列・非文字列を安全に処理する」ガードのみを足す。
//
// XSS について：本ツールはユーザー自身が入力した Markdown を、ユーザー自身の
// ブラウザ内でプレビュー表示するだけ（サーバー送信・他者への配信なし）。
// そのため影響範囲は入力者自身に限られ、DOMPurify 等のサニタイズは導入しない。
// ページ側ではプレビュー区に「プレビューは自己責任で」の注記を表示する。
import { marked } from 'marked';

/**
 * Markdown 文字列を HTML 文字列に変換する。
 * @param {string} str Markdown テキスト
 * @returns {string} 変換後の HTML。入力が空または文字列でない場合は ''。
 */
export function mdToHtml(str) {
  if (typeof str !== 'string' || str === '') return '';
  // marked.parse は同期実行（デフォルト設定）。改行を <br> にはせず標準挙動。
  return marked.parse(str, { async: false });
}
