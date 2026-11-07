import { marked } from 'marked';
import createDOMPurify from 'dompurify';

// Browser-only conversion: use a private sanitizer, shared by preview and export.
// No raw result from marked may reach either sink.
const purifier = createDOMPurify(globalThis.window);
const policy = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
    'strong', 'em', 'del', 's', 'b', 'i', 'u', 'blockquote',
    'ul', 'ol', 'li', 'pre', 'code', 'a', 'img',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'start', 'colspan', 'rowspan', 'align'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
};

if (purifier.isSupported) {
  purifier.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName !== 'href' && data.attrName !== 'src') return;
    // Parse URLs using the browser, including entity-decoded / obfuscated values.
    // Relative URLs resolve against a fixed HTTPS base only for validation.
    try {
      const { protocol } = new URL(data.attrValue, 'https://markdown.invalid/');
      const allowed = data.attrName === 'src'
        ? ['https:', 'http:']
        : ['https:', 'http:', 'mailto:', 'tel:'];
      if (!allowed.includes(protocol)) data.keepAttr = false;
    } catch {
      data.keepAttr = false;
    }
  });
}

/** Return sanitized HTML for both preview and HTML copy; no DOM means fail closed. */
export function mdToHtml(str) {
  if (typeof str !== 'string' || str === '') return '';
  if (!purifier.isSupported) throw new Error('Markdown conversion requires a supported browser DOM');
  return purifier.sanitize(marked.parse(str, { async: false }), policy);
}
