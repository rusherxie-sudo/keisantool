import { describe, it, expect } from 'vitest';
import { mdToHtml } from '../src/lib/markdown.js';

describe('mdToHtml', () => {
  it('空文字列は空文字列を返す', () => {
    expect(mdToHtml('')).toBe('');
  });

  it('非文字列（null/undefined/数値）は空文字列を返す', () => {
    expect(mdToHtml(null)).toBe('');
    expect(mdToHtml(undefined)).toBe('');
    expect(mdToHtml(123)).toBe('');
  });

  it('見出しを <h1> に変換する', () => {
    const html = mdToHtml('# 見出し');
    expect(html).toContain('<h1');
    expect(html).toContain('見出し');
  });

  it('太字を <strong> に変換する', () => {
    expect(mdToHtml('**太字**')).toContain('<strong>太字</strong>');
  });

  it('斜体を <em> に変換する', () => {
    expect(mdToHtml('*斜体*')).toContain('<em>斜体</em>');
  });

  it('リンクを <a> に変換する', () => {
    const html = mdToHtml('[リンク](https://example.com)');
    expect(html).toContain('<a');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('リンク');
  });

  it('箇条書きリストを <li> に変換する', () => {
    const html = mdToHtml('- a\n- b');
    expect(html).toContain('<li>a</li>');
    expect(html).toContain('<li>b</li>');
  });

  it('インラインコードを <code> に変換する', () => {
    expect(mdToHtml('`x`')).toContain('<code>x</code>');
  });

  it('段落を <p> に変換する', () => {
    expect(mdToHtml('普通の文章です。')).toContain('<p>普通の文章です。</p>');
  });
});
