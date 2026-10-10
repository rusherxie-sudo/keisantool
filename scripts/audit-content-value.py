#!/usr/bin/env python3
"""Offline content inventory; signals for editorial review, never an indexing switch.

Uses Python's standard library. Search data is optional, read-only, and stays in the
chosen output directory. A missing GSC row means unobserved, not zero demand.
"""
import argparse, collections, csv, hashlib, json, re
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
SKIP_TAGS = {'script','style','nav','footer','noscript'}
SKIP_CLASSES = {'related-tools','related-articles','share-bar','result-share','ad-slot','crumb','breadcrumb','blog-article__related'}

class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, {k: v or '' for k, v in attrs}, []
    def nodes(self):
        yield self
        for child in self.children:
            if isinstance(child,Node): yield from child.nodes()
    def text(self):
        return ' '.join(c.text() if isinstance(c,Node) else c for c in self.children)
    def pruned_text(self):
        if self.tag in SKIP_TAGS or set(self.attrs.get('class','').split()) & SKIP_CLASSES: return ''
        return ' '.join(c.pruned_text() if isinstance(c,Node) else c for c in self.children)

class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root=Node();self.stack=[self.root];self.feed(html)
    def handle_starttag(self,tag,attrs):
        node=Node(tag,attrs);self.stack[-1].children.append(node)
        if tag not in VOID:self.stack.append(node)
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in VOID:self.handle_endtag(tag)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:
                del self.stack[i:];break
    def handle_data(self,data):self.stack[-1].children.append(data)

def clean(text):return re.sub(r'\s+',' ',text).strip()
def path_from_file(path,root):
    relative=path.relative_to(root).as_posix()
    if relative=='index.html':return '/'
    if relative.endswith('/index.html'):return '/'+relative[:-10]
    return '/'+relative

def family(path):
    if path in ['/2027/', '/resources/', '/widgets/']:return 'resource-hub'
    if path.startswith('/blog/category/'):return 'article-category'
    if path.startswith('/blog/'):return 'article' if path!='/blog/' else 'article-hub'
    if path.startswith('/category/'):return 'tool-category'
    if path.startswith('/seiza-aisho/'):return 'zodiac-pair' if path!='/seiza-aisho/' else 'tool'
    if path.startswith('/umaredoshi/'):return 'birth-year'
    if path.startswith('/saitei/'):return 'minimum-wage-region' if path!='/saitei/' else 'tool'
    if path.startswith('/rokuyo/'):return 'rokuyo-month' if path!='/rokuyo/' else 'tool'
    if path.startswith('/shukujitsu/'):return 'holiday-year' if path!='/shukujitsu/' else 'tool'
    if path.startswith('/jisa/'):return 'timezone-city' if path!='/jisa/' else 'tool'
    if path.startswith('/hinodeiri/'):return 'sunrise-city' if path!='/hinodeiri/' else 'tool'
    if path.startswith('/rokusei/'):return 'rokusei-content' if path!='/rokusei/' else 'tool'
    if path.startswith('/result/') or path.startswith('/embed/'):return 'shared-utility'
    if path.startswith('/eigyoubi/'):return 'business-calendar' if path!='/eigyoubi/' else 'tool'
    if path in ['/about/','/contact/','/privacy/','/terms/','/editorial-policy/']:return 'site-information'
    if path=='/404.html':return 'error-page'
    if path=='/':return 'home'
    return 'tool'

def audit(root,gsc,bing=None):
    sitemap=set()
    for file in root.glob('sitemap-*.xml'):
        for loc in ET.parse(file).getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
            if not loc.text.endswith('.xml'):sitemap.add(loc.text)
    observed={}
    if gsc:
        for row in json.loads(gsc.read_text()).get('rows',[]):
            url=row.get('keys',[''])[0]
            observed[url]='clicks-observed' if row.get('clicks',0)>0 else 'impressions-observed'
    bing_observed={}
    bing_bucket='not-loaded'
    if bing:
        data=json.loads(bing.read_text()).get('d',[])
        stamp=lambda r:int(re.search(r'-?\d+',r['Date']).group())
        if data:
            latest=max(stamp(r) for r in data)
            bing_bucket=datetime.fromtimestamp(latest/1000,timezone.utc).date().isoformat()
            for row in data:
                if stamp(row)==latest:
                    bing_observed[row['Query']]='clicks-observed' if row.get('Clicks',0)>0 else 'impressions-observed'
    rows=[]
    for file in sorted(root.rglob('*.html')):
        doc=Document(file.read_text()).root;nodes=list(doc.nodes());path=path_from_file(file,root)
        url='https://keisantool.com'+path
        main=next((n for n in nodes if n.tag=='main'),doc)
        body=list(main.nodes());text=clean(main.pruned_text())
        title=next((clean(n.text()) for n in nodes if n.tag=='title'),'')
        canonical=next((n.attrs.get('href','') for n in nodes if n.tag=='link' and n.attrs.get('rel')=='canonical'),'')
        robots=next((n.attrs.get('content','') for n in nodes if n.tag=='meta' and n.attrs.get('name')=='robots'),'')
        links=[n.attrs.get('href','') for n in body if n.tag=='a']
        external={link for link in links if link.startswith('https://') and urlparse(link).hostname!='keisantool.com' and not any(s in link for s in ['twitter.com','x.com/intent','facebook.com','line.me'])}
        controls=sum(n.tag in ['input','select','textarea'] and n.attrs.get('type') not in ['hidden','submit'] for n in body)
        heads=[clean(n.text()) for n in body if n.tag in ['h1','h2','h3']]
        chars=len(re.sub(r'\s','',text))
        flags=[]
        if chars<400:flags.append('short-text-review-only')
        if not controls and not any(n.tag=='table' for n in body) and family(path)=='tool' and path!='/rokuyo/':flags.append('check-task-delivery')
        if 'noindex' in robots and url in sitemap:flags.append('indexing-conflict')
        rows.append(dict(url=url,family=family(path),title=title,canonical=canonical,noindex='noindex' in robots,in_sitemap=url in sitemap,main_chars=chars,h2_h3_count=sum(n.tag in ['h2','h3'] for n in body),table_rows=sum(n.tag=='tr' for n in body),controls=controls,external_references=len(external),downloads=sum('/downloads/' in link or 'download' in n.attrs for n,link in [(n,n.attrs.get('href','')) for n in body if n.tag=='a']),gsc_observation=observed.get(url,'no-returned-row' if gsc else 'not-loaded'),bing_observation=bing_observed.get(url,'no-returned-row' if bing else 'not-loaded'),bing_bucket=bing_bucket,text_hash=hashlib.sha256(text.encode()).hexdigest()[:16],number_normalized_hash=hashlib.sha256(re.sub(r'\d+','N',text).encode()).hexdigest()[:16],flags=';'.join(flags),headings=' | '.join(heads),references=' | '.join(sorted(external))))
    return rows

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dist',type=Path,default=Path('dist'))
    parser.add_argument('--gsc-pages',type=Path)
    parser.add_argument('--bing-pages',type=Path)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    if not args.dist.is_dir() or not (args.dist/'sitemap-index.xml').is_file() or not any(args.dist.rglob('*.html')):
        parser.error('Build the site first; --dist must contain HTML pages.')
    rows=audit(args.dist,args.gsc_pages,args.bing_pages)
    args.output.mkdir(parents=True,exist_ok=True)
    with (args.output/'inventory.csv').open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator="\n");writer.writeheader();writer.writerows(rows)
    groups=collections.defaultdict(list)
    for row in rows:groups[row['number_normalized_hash']].append(row['url'])
    summary={'html':len(rows),'sitemap':sum(r['in_sitemap'] for r in rows),'noindex':sum(r['noindex'] for r in rows),'families':dict(collections.Counter(r['family'] for r in rows)),'numeric_template_clusters':[v for v in groups.values() if len(v)>1],'flags':[{'url':r['url'],'flags':r['flags']} for r in rows if r['flags']], 'note':'Structural signals are not quality scores; normalized similarity is not plagiarism or a reason to noindex. Missing search rows do not establish zero demand.'}
    (args.output/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in summary.items() if k not in ['numeric_template_clusters','flags']},ensure_ascii=False));print('Review flags:',len(summary['flags']),'numeric clusters:',len(summary['numeric_template_clusters']))

if __name__=='__main__':main()
