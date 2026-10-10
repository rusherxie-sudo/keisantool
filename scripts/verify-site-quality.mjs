// Verify the built site, including actual heading IDs (not source-text guesses).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, extname, relative } from 'node:path';
const root = resolve('dist');
const walk = dir => readdirSync(dir, { withFileTypes:true }).flatMap(entry => entry.isDirectory() ? walk(join(dir,entry.name)) : [join(dir,entry.name)]);
const decode = text => text.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*"([^"]*)"/g)].map(m => [m[1],decode(m[2])]));
const files = walk(root).filter(f => f.endsWith('.html'));
const documents = new Map(files.map(file => {
  const html=readFileSync(file,'utf8');
  const links=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>attributes(m[0]));
  const metas=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>attributes(m[0]));
  return [file,{ html, ids:new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>decode(m[1]))), canonical:links.find(l=>l.rel==='canonical')?.href, noindex:metas.some(m=>m.name==='robots' && m.content.includes('noindex')) }];
}));
const fileForPath = path => {
  let file=join(root,decodeURIComponent(path));
  if (path.endsWith('/') || !extname(file)) file=join(file,'index.html');
  return file;
};
const errors=[];
let checkedLinks=0, checkedFragments=0, sitemapCount=0;
for (const [file,doc] of documents) {
  const label=relative(root,file);
  if (!doc.canonical && !doc.noindex) errors.push(`${label}: canonical missing`);
  for (const tag of doc.html.matchAll(/<a\b[^>]*>/g)) {
    const href=attributes(tag[0]).href;
    if (!href || (!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) continue;
    const url=new URL(href,'https://keisantool.com/'+label.replace(/index\.html$/,''));
    const target=fileForPath(url.pathname);
    checkedLinks++;
    if (!existsSync(target)) { errors.push(`${label}: missing ${href}`);continue; }
    if (url.hash && documents.has(target)) {
      checkedFragments++;
      // Dynamic tool results may legitimately provide anchors at runtime; static article TOCs must exist.
      if ((href.startsWith('#') && label.startsWith('blog/')) && !documents.get(target).ids.has(decodeURIComponent(url.hash.slice(1)))) errors.push(`${label}: missing heading ${href}`);
    }
  }
}
for (const file of walk(root).filter(f=>/sitemap-\d+\.xml$/.test(f))) {
  for (const match of readFileSync(file,'utf8').matchAll(/<loc>(.*?)<\/loc>/g)) {
    const url=decode(match[1]);const doc=documents.get(fileForPath(new URL(url).pathname));sitemapCount++;
    if (!doc || doc.noindex || doc.canonical!==url) errors.push(`sitemap: missing, noindex or noncanonical ${url}`);
  }
}
if(errors.length) { console.error(errors.join('\n'));process.exitCode=1; }
else console.log(`Site quality: ${files.length} HTML, ${sitemapCount} sitemap URLs, ${checkedLinks} internal links, ${checkedFragments} fragment links checked.`);
