import Encoding from 'encoding-japanese';

const BOM = [0xef, 0xbb, 0xbf];

function bytesOf(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  return Uint8Array.from(input ?? []);
}

export function detectEncoding(input) {
  const bytes = bytesOf(input);
  if (bytes.length >= 3 && BOM.every((value, index) => bytes[index] === value)) return 'UTF-8-BOM';
  if (bytes.length === 0) return 'UTF-8';
  const detected = Encoding.detect(Array.from(bytes));
  if (detected === 'SJIS') return 'Shift_JIS';
  if (detected === 'EUCJP') return 'EUC-JP';
  if (detected === 'JIS') return 'ISO-2022-JP';
  return 'UTF-8';
}

function libraryEncoding(label) {
  return {
    'UTF-8': 'UTF8',
    'UTF-8-BOM': 'UTF8',
    'Shift_JIS': 'SJIS',
    CP932: 'SJIS',
    'EUC-JP': 'EUCJP',
    'ISO-2022-JP': 'JIS',
  }[label] ?? 'UTF8';
}

export function decodeText(input, requestedEncoding = 'auto') {
  const original = bytesOf(input);
  const encoding = requestedEncoding === 'auto' ? detectEncoding(original) : requestedEncoding;
  const bytes = encoding === 'UTF-8-BOM' ? original.slice(3) : original;
  const text = Encoding.convert(Array.from(bytes), {
    from: libraryEncoding(encoding),
    to: 'UNICODE',
    type: 'string',
  });
  return { text, encoding };
}

export function encodeText(value, targetEncoding = 'UTF-8-BOM') {
  const text = String(value ?? '');
  if (targetEncoding === 'UTF-8' || targetEncoding === 'UTF-8-BOM') {
    const body = new TextEncoder().encode(text);
    if (targetEncoding === 'UTF-8') return body;
    const output = new Uint8Array(BOM.length + body.length);
    output.set(BOM);
    output.set(body, BOM.length);
    return output;
  }
  return Uint8Array.from(Encoding.convert(text, {
    from: 'UNICODE',
    to: libraryEncoding(targetEncoding),
    type: 'array',
  }));
}

export function parseCsvPreview(value, maxRows = 20) {
  const text = String(value ?? '');
  const limit = Math.max(0, Number.isFinite(Number(maxRows)) ? Math.floor(Number(maxRows)) : 20);
  if (!text || limit === 0) return [];

  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"' && cell === '') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      if (rows.length >= limit) return rows;
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.slice(0, limit);
}

export function normalizeCsvLineEndings(value, style = 'CRLF') {
  const normalized = String(value ?? '').replace(/\r\n?/g, '\n');
  return style === 'LF' ? normalized : normalized.replace(/\n/g, '\r\n');
}
