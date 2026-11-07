// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mdToHtml } from '../src/lib/markdown.js';

function preview(markdown) {
  const root = document.createElement('div');
  root.innerHTML = mdToHtml(markdown);
  return root;
}

describe('Markdown safety boundary', () => {
  it('removes executable image events from the final preview DOM', () => {
    const root = preview('<img src="/kt01-missing" onerror="window.__kt01Canary=1">');
    expect(root.querySelector('[onerror]')).toBeNull();
  });
});

import { attacks } from './fixtures/markdown-attacks.js';

describe('sanitized DOM attack groups', () => {
  it.each(attacks)('%s', (_name, payload) => {
    const root = preview(payload);
    expect(root.querySelector('script,svg,math,iframe,object,embed,form,input,button,style,link,meta,template')).toBeNull();
    for (const node of root.querySelectorAll('*')) {
      for (const attr of node.attributes) {
        expect(attr.name).not.toMatch(/^(on|data-)/i);
        expect(['style', 'id', 'name', 'srcdoc', 'srcset', 'formaction', 'xlink:href']).not.toContain(attr.name);
        if (attr.name === 'href' || attr.name === 'src') {
          const protocol = new URL(attr.value, 'https://markdown.invalid/').protocol;
          expect(attr.name === 'src' ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:', 'tel:']).toContain(protocol);
        }
      }
    }
    // Reparse the exported HTML too: the clipboard sink must be equally safe.
    const exported = new DOMParser().parseFromString(mdToHtml(payload), 'text/html');
    expect(exported.body.innerHTML).toBe(root.innerHTML);
  });
});

describe('normal Markdown and static HTML', () => {
  it('keeps headings, paragraphs, both lists, quotes, tables and emphasis', () => {
    const root = preview('# Title\n\nParagraph **bold** *em* ~~del~~\n\n- item\n\n1. one\n\n> quote\n\n| A | B |\n|---|---|\n| x | y |');
    for (const tag of ['h1', 'p', 'strong', 'em', 'del', 'ul', 'ol', 'blockquote', 'table', 'th', 'td']) expect(root.querySelector(tag)).not.toBeNull();
  });
  it('keeps exact code text without turning it into active DOM', () => {
    const code = '<img src=x onerror="window.__kt01Canary=1"> & <script>alert(1)</script>';
    const root = preview('```html\n' + code + '\n```\n\n`<svg onload=alert(1)>`');
    expect(root.querySelector('pre code').textContent).toBe(code + '\n');
    expect(root.querySelector('pre code').className).toBe('language-html');
    expect(root.querySelector('img,script,svg')).toBeNull();
  });
  it('keeps safe links, images, static HTML and relative URLs', () => {
    const root = preview('[web](https://example.com) [local](/help/) [mail](mailto:hello@example.com)\n\n![alt](https://example.com/a.png "title")\n\n<b>raw bold</b>');
    expect([...root.querySelectorAll('a')].map(a => a.getAttribute('href'))).toEqual(['https://example.com', '/help/', 'mailto:hello@example.com']);
    expect(root.querySelector('img').getAttribute('src')).toBe('https://example.com/a.png');
    expect(root.querySelector('img').alt).toBe('alt');
    expect(root.querySelector('b').textContent).toBe('raw bold');
  });
});
