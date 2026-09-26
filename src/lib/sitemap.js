import { japanDateParts } from './japanDate.js';

export function shouldIncludeInSitemap(page, now = new Date()) {
  const path = new URL(page).pathname;
  if (path.startsWith('/embed/')) return false;
  if (/^\/seiza-aisho\/[^/]+\/$/.test(path)) return false;

  const { year, month: japanMonth } = japanDateParts(now);
  const month = String(japanMonth).padStart(2, '0');
  if (path === `/shukujitsu/${year}/`) return false;
  if (path === `/rokuyo/${year}-${month}/`) return false;
  return true;
}
