const JAPANESE = '\\u3040-\\u30ff\\u3400-\\u9fff';

export function normalizePunctuation(value) {
  let text = String(value ?? '');
  text = text.replace(new RegExp(`([${JAPANESE}])[,，]`, 'g'), '$1、');
  text = text.replace(new RegExp(`([${JAPANESE}])[.．]`, 'g'), '$1。');
  text = text.replace(/[。．]{2,}/g, '。').replace(/[、，]{2,}/g, '、');
  return text;
}

export function collapseBlankLines(value) {
  return String(value ?? '').replace(/\n[\t 　]*\n(?:[\t 　]*\n)+/g, '\n\n');
}

function isProtectedLine(line) {
  return /^\s*(?:[・●○■□◆◇▶▷]|[-*+]\s|\d+[.)、]|[（(]?\d+[）)])/u.test(line);
}

export function joinPdfWrappedLines(value) {
  const lines = String(value ?? '').replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  for (const line of lines) {
    const current = line.trim();
    if (!current) {
      if (output.at(-1) !== '') output.push('');
      continue;
    }
    const previous = output.at(-1);
    const endsSentence = previous && /[。！？!?：:；;」』）)]$/.test(previous);
    if (previous && !endsSentence && !isProtectedLine(previous) && !isProtectedLine(current)) output[output.length - 1] += current;
    else output.push(current);
  }
  return collapseBlankLines(output.join('\n')).trim();
}

export function normalizeJapaneseText(value, options = {}) {
  const settings = {
    punctuation: true,
    spaces: true,
    blankLines: true,
    trimLines: true,
    joinWrapped: false,
    unicode: 'NFC',
    ...options,
  };
  let text = String(value ?? '').replace(/\r\n?/g, '\n');
  if (settings.unicode) text = text.normalize(settings.unicode);
  if (settings.spaces) text = text.replace(/　/g, ' ').replace(/[\t ]{2,}/g, ' ');
  if (settings.trimLines) text = text.split('\n').map((line) => line.trim()).join('\n');
  if (settings.punctuation) text = normalizePunctuation(text);
  if (settings.blankLines) text = collapseBlankLines(text);
  if (settings.joinWrapped) text = joinPdfWrappedLines(text);
  return text.trim();
}
