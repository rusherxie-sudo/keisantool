from pathlib import Path
import re,json,os
from urllib.parse import urlparse
root=Path('.')
files=list(Path('src').rglob('*.js'))+list(Path('src').rglob('*.astro'))+list(Path('src').rglob('*.json'))
imports={}
for p in files:
 imports[str(p)]=[]
 for ref in re.findall(r'''(?:from\s*|import\s*)['"]([^'"]+)['"]''',p.read_text()):
  if ref.startswith('.'):
   q=os.path.normpath(str(p.parent/ref))
   if not Path(q).suffix:q+='.js'
   imports[str(p)].append(q)
def depends(p,target,seen=None):
 seen=set() if seen is None else seen
 if p==target:return True
 if p in seen:return False
 seen.add(p)
 return any(depends(q,target,seen) for q in imports.get(p,[]))
def urls(text):return sorted(set(re.findall(r'https?://[^\s<>\'"）)]+',text)))
nta=lambda n:f'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/{n}.htm'
source_map={
'zeizei':(['https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6102.htm','https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6371.htm'],'现行8%/10%税率；不是逐年度所得税','税率/发票规则改正时；本工具逐次floor与发票单据处理不同','2026-11-07','继承11/7消费税定向整改；不重新认证'),
'koteiShisan':(['https://www.tax.metro.tokyo.lg.jp/kazei/real_estate/kotei_tosi'],'现行标准概算；自治体差异、评估额年度需自行确认','每年1月1日征收基准；评估/新筑减免适用期另核','2026-10-10','继承页面来源；全国各地舍入、评估替换与120㎡边界未全验，不称税单准确'),
'japan-tax-2026':([nta(1199),nta(1410),nta(2260)],'2025/2026所得年；2027+未获生产支持，不能默认为2026','2026-12-01（2026年末精算）；2025另表','2026-11-08','本轮在线复核No1199/1410，其余继承10/10；未发现生产2027所得税复用入口'),
'japan-social-2026':(['https://www.kyoukaikenpo.or.jp/lp/2026hokenryou/','https://www.kyoukaikenpo.or.jp/assets/R8_44oita.pdf'],'2026年度，全国平均概算','健康介护3月；支援金4月；雇保4月（须按项目核对）','2026-10-10','继承既有证据，未重新认证47支部保费'),
'kokuho':(['https://www.city.nerima.tokyo.jp/kurashi/nenkinhoken/kokuminkenkohoken/hoken_hokenryo/keisan_hoho.html','https://www.city.osaka.lg.jp/fukushima/page/0000624311.html'],'2026年度，2025年所得，练马/大阪','2026-04-01','2026-11-08','本轮仅重新读取练马4区分；大阪继承10/10'),
'juminzei':(['https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html',nta(1410)],'2026年度＝2025所得','2026-04-01；特别征收6月起','2026-10-10','继承旧核验；非课税与超额税率地方差异未全验'),
'seimei-hoken-kojo':([nta(1140)],'2026/2027所得年及次年度住民税','来源明文令和8年分以后；23岁未满条件需每年判定','2026-11-08','本轮No1140确认令和8年分以后，不以2026沿用推断2027'),
'bonus-tedori':(['https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2026/02.htm'],'2026源泉甲乙普通计算，不含特殊分支','2026-01-01','2026-09-18','继承奖金规格及上线记录，2027未核验'),
'shukujitsu':(['https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html'],'路由2025—2029；官方已公布至2027，2028/2029春秋分预测','各法定祝日；2028表预定2027年2月公布','2026-11-08','本轮重新读取2026/2027官方表；自动公布年上限是推定不是未来外部证据'),
'office-calendar':(['https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html'],'2026/2027，仅15个月明细路由','各月1日；无自动公司假日','2026-11-08','复用完整official-holiday-reference fixture，下载与网页同源'),
'bank-calendar':(['https://laws.e-gov.go.jp/law/356AC0000000059#Mp-At_15','https://laws.e-gov.go.jp/law/357CO0000000040#Mp-At_5'],'2026/2027，银行12/31—1/3独立假期','各日期；网银/ATM非统一保证','2026-11-01','继承银行法规核验，不重复造工具'),
'rokuyo':(['https://www.ndl.go.jp/koyomi/chapter3/s3.html'],'固定2025—2028；hub构建当月','旧历换月；中国农历/日本旧历边界不同','2026-11-08','仅文化/起点资料本轮核验；全日期日本旧历独立核验未完成'),
'hinodeiri':(['https://gml.noaa.gov/grad/solcalc/','https://eco.mtk.nao.ac.jp/koyomi/'],'hub交互日期；15城市静态构建基准年','每日；年表每年重建','2026-11-07','继承15城整改；仅东京少量fixture，不能声称全期±1分钟'),
'shussan':(['https://www.sendai.jrc.or.jp/patient/expectantMothers/obstetricsAndGynecologyNews/511/'],'日期推算，非年度金额','无固定生效日','2026-10-10','280日与跨年日期需要边界回归；非医疗预言'),
'saniku':(['https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000158500.html'],'2026育休上限及产休日期','上限通常每年8月1日','2026-10-10','历史8月来源主要转载，官方原始金额证据待补；不称再次通过'),
'ikuji':(['https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000158500.html'],'2026育児休业给付','上限每年8月1日','2026-10-10','需核实与saniku同上限和出生后支援给付条件'),
'shitsugyou-teate':(['https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000135026.html'],'当前页面标注适用期，2027未核验','日额上下限每年8月1日','2026-10-10','未重新读官方具体日额表，列作高优先更新门禁'),
'shoubyou':(['https://www.kyoukaikenpo.or.jp/benefit/injury_and_sickness_allowance/'],'伤病手当，标准报酬平均期/12月不足条件','标准平均比较额每年复核','2026-10-10','先10円四舍五入再1円四舍五入，不机械floor'),
'nenrei':(['https://laws.e-gov.go.jp/law/135AC1000000050'],'日期年龄；静态出生年与年龄表随构建年','JST元日，生日/闰日','2026-11-07','复用生年任务改进；年表PDF须离线重生成'),
'hayami':(['https://www.mext.go.jp/a_menu/shotou/shugaku/detail/1422233.htm'],'2026/2027学年和年龄表','学年4/1，出生界4/2','2026-09-30','继承学年期末年龄修复，未来年不自动扩路由'),
'jisa':(['https://www.iana.org/time-zones'],'IANA时区/DST，城市年度说明','各地区夏令时变动日','unknown','运行环境Intl tzdata与构建文本需法规变更触发核验，未查当前tzdata版本'),
}
# Thin wrappers also carry annual exposure through dependencies.
for name,parent in {'shotokuzei':'japan-tax-2026','nematsu':'japan-tax-2026','kyuyo':'japan-social-2026','shakaihoken':'japan-social-2026','office-tools':'office-calendar','nissu':'shukujitsu','work-plans':'office-calendar','publishedRoutes':'shukujitsu','yukyu-nissu':'nenrei','kinzoku-nensuu':'nenrei','gakureki':'hayami','yakudoshi':'nenrei','rokusei':'nenrei'}.items():source_map[name]=source_map[parent]
rows=[]
for name,(sources,years,effective,reviewed,scope) in source_map.items():
 p=f'src/lib/{name}.js';affected=sorted(f for f in imports if f.startswith('src/pages/') and depends(f,p));slugs={Path(f).parts[2] for f in affected}
 articles=[]
 for f in Path('src/content/blog').glob('*.md'):
  if any(re.search(r'(?m)^- '+re.escape(slug)+r'\s*$',f.read_text()) for slug in slugs):articles.append(str(f))
 downloads=[]
 if name in ['office-calendar','office-tools','shukujitsu','bank-calendar','work-plans']:downloads=[str(f) for f in Path('public/downloads').glob('*') if any(x in f.name for x in ['eigyoubi','work-calendar','holidays','kinmu-template'])]
 if name in ['nenrei','hayami']:downloads=[str(f) for f in Path('public/downloads').glob('nenrei*')]
 rows.append({'id':name,'path':p,'official_source_urls':sources,'applicable_year':years,'effective_date':effective,'last_verified':reviewed,'verification_scope':scope,'affected_tools_pages':affected,'affected_articles':articles,'affected_downloads':downloads,'maintenance_trigger':'年度改正/官方发表/生效日；每年1月/2月/3-4月/8月/工资公布后分项检查；不把触发日当核验完成','rebuild_required':True,'rebuild_scope':'数据/内容提交→lastmod独立提交→npm test/build；下载需专用生成器复核','2027_policy':'未明确列2027的制度金额不得沿用2026；未知保留unknown'})
w=json.loads(Path('src/data/minimum-wage-2026.json').read_text())
for slug,p in w['prefectures'].items():
 rows.append({'id':'minimum-wage-'+slug,'path':'src/data/minimum-wage-2026.json#'+slug,'official_source_urls':[w['source'],w['indexSource']],'applicable_year':2026,'effective_date':p['effectiveDate'],'last_verified':w['reviewedDate'],'verification_scope':'复用11/5全国官方最终表47地区核验，本轮未重复外查','wage':p['wage'],'previous_wage':p['previousWage'],'affected_tools_pages':['/saitei/','/saitei/'+slug+'/'],'affected_articles':['src/content/blog/saitei-chingin-no-kakikata.md'],'affected_downloads':[],'maintenance_trigger':'改定决定/公示/发效日；2027官方公告后另核','rebuild_required':True,'rebuild_scope':'静态地区表和全国现行额需生效前后重建；客户端依生效日切换','2027_policy':'unknown，不预测'})
# Every regulatory article is a separately maintained asset; date is inherited, never build day.
for p in Path('src/content/blog').glob('*.md'):
 s=p.read_text();m=re.search(r'(?m)^category:\s*[\'\"]?([\w-]+)',s)
 if m and m[1] in ['shakai-hoken','zeikin-kiso','nematsu-chosei','kakutei-shinkoku','life-event']:
  def field(k):
   m=re.search(r'(?m)^'+k+r':\s*(.+)',s);return m[1] if m else 'unknown'
  rows.append({'id':'article-'+p.stem,'path':str(p),'official_source_urls':urls(s),'applicable_year':field('applicableYear'),'effective_date':'见正文具体制度；未标者unknown','last_verified':field('reviewedDate'),'verification_scope':'继承文章注明核验；本轮全文审读≠逐来源再核验','affected_tools_pages':['/blog/'+p.stem+'/'],'affected_articles':[str(p)],'affected_downloads':[],'maintenance_trigger':'正文涉及制度变化、申告期限、扶养/保费条件改正；不能全局替换年份','rebuild_required':True,'rebuild_scope':'文章和关联导航、manifest、sitemap','2027_policy':'按正文范围，未核验不得改为2027版'})
for row in rows:
 all_urls=row['official_source_urls']
 def is_authority(u):
  h=urlparse(u).hostname or ''
  return h.endswith('.go.jp') or h.endswith('.lg.jp') or h in ['www.kyoukaikenpo.or.jp','www.iana.org','gml.noaa.gov']
 row['other_reference_urls']=[u for u in all_urls if not is_authority(u)]
 row['official_source_urls']=[u for u in all_urls if is_authority(u)]
 if not row['official_source_urls']:row['official_source_gap']='unknown；现有来源并非官方原始资料，待补'
Path('docs/overnight-20261108/annual-assets.json').write_text(json.dumps({'scope':'仓库年度敏感资产：制度逻辑/包装器、47工资、法规文章、日期与下载依赖。官方URL为现有来源或本轮读取，verification_scope区分未知。','assets':rows,'count':len(rows),'known_gaps':['部分历史给付来源仅有二手转述；官方原始金额资料待补','未审计云端定时任务，不能保证跨年自动构建','所有现有下载列入维护范围；本轮不重新认证Excel/所有PDF兼容性','basicDeduction/salaryIncome默认年度不能用于无准入的新年份功能；生产2027入口未发现套用2026所得税'],'cross_year_findings':'未发现本轮可确证的生产2027误用2026制度金额；现有2027保险控除有No1140令和8年分以后明文支持；住民税2026按2025所得正确。'},ensure_ascii=False,indent=2)+'\n')
print(len(rows),'assets;',len(w['prefectures']),'wages')
