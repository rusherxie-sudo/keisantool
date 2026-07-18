import csv
import os
from collections import defaultdict

DATA_DIR = '/Users/jww/5kong/keisantool/keywords/raw/jp_only'
OUTPUT_DIR = '/Users/jww/5kong/keisantool/keywords/opportunities'

os.makedirs(OUTPUT_DIR, exist_ok=True)

all_keywords = {}
seed_stats = []

for filename in os.listdir(DATA_DIR):
    if not filename.endswith('.csv'):
        continue
    filepath = os.path.join(DATA_DIR, filename)
    seed = filename.replace('_broad-match_jp_', ' ').replace('.csv', '').split('_')[0]
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    valid = []
    for r in rows:
        kd_str = (r.get('Keyword Difficulty') or '').strip()
        vol_str = (r.get('Volume') or '').strip()
        keyword = (r.get('Keyword') or '').strip()
        if not kd_str or not vol_str or not keyword:
            continue
        try:
            kd = float(kd_str)
            vol = int(vol_str.replace(',', ''))
        except (ValueError, TypeError):
            continue
        valid.append({
            'keyword': keyword,
            'volume': vol,
            'kd': kd,
            'intent': (r.get('Intent') or 'N/A').strip(),
            'cpc': (r.get('CPC') or 'N/A').strip(),
            'seed': seed
        })
    
    seed_stats.append({
        'seed': seed,
        'total': len(rows),
        'valid': len(valid)
    })
    
    for kw in valid:
        key = kw['keyword']
        if key not in all_keywords:
            all_keywords[key] = kw
        else:
            if kw['volume'] > all_keywords[key]['volume']:
                all_keywords[key] = kw

print('=' * 80)
print('种子词统计')
print('=' * 80)
for s in sorted(seed_stats, key=lambda x: x['total'], reverse=True):
    print(f"  {s['seed']}: 总{s['total']:,}个, 有效{s['valid']:,}个")

print(f'\n总去重关键词数: {len(all_keywords):,}')

kw_list = list(all_keywords.values())

kd_ranges = {'0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0, '51+': 0}
vol_ranges = {'0-100': 0, '101-500': 0, '501-1000': 0, '1001-5000': 0, '5001-10000': 0, '10001+': 0}
intent_counts = defaultdict(int)

for kw in kw_list:
    kd = kw['kd']
    vol = kw['volume']
    intent = kw['intent']
    
    if kd <= 10: kd_ranges['0-10'] += 1
    elif kd <= 20: kd_ranges['11-20'] += 1
    elif kd <= 30: kd_ranges['21-30'] += 1
    elif kd <= 40: kd_ranges['31-40'] += 1
    elif kd <= 50: kd_ranges['41-50'] += 1
    else: kd_ranges['51+'] += 1
    
    if vol <= 100: vol_ranges['0-100'] += 1
    elif vol <= 500: vol_ranges['101-500'] += 1
    elif vol <= 1000: vol_ranges['501-1000'] += 1
    elif vol <= 5000: vol_ranges['1001-5000'] += 1
    elif vol <= 10000: vol_ranges['5001-10000'] += 1
    else: vol_ranges['10001+'] += 1
    
    intent_counts[intent] += 1

print('\n' + '=' * 80)
print('KD分布（关键词难度）')
print('=' * 80)
for k, v in kd_ranges.items():
    print(f"  KD {k}%: {v:,}个 ({v/len(kw_list)*100:.1f}%)")

print('\n' + '=' * 80)
print('搜索量分布')
print('=' * 80)
for k, v in vol_ranges.items():
    print(f"  Volume {k}: {v:,}个 ({v/len(kw_list)*100:.1f}%)")

print('\n' + '=' * 80)
print('搜索意图分布')
print('=' * 80)
for intent, count in sorted(intent_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  {intent}: {count:,}个 ({count/len(kw_list)*100:.1f}%)")

blue_ocean = [kw for kw in kw_list if kw['kd'] <= 30 and kw['volume'] >= 100]
blue_ocean.sort(key=lambda x: x['volume'], reverse=True)

print('\n' + '=' * 80)
print(f'蓝海词（KD<=30%, Volume>=100）: {len(blue_ocean):,}个')
print('=' * 80)
print(f'\n搜索量Top50蓝海词:')
for i, kw in enumerate(blue_ocean[:50]):
    print(f"  {i+1}. {kw['keyword']} | Volume: {kw['volume']:,} | KD: {kw['kd']}% | Intent: {kw['intent']}")

question_keywords = [kw for kw in kw_list if any(q in kw['keyword'] for q in ['いつ', 'いくら', '何', 'どう', 'なぜ', 'なに', '誰', 'どれ', 'どこ', 'いつから', 'いつまで', '必要', '書き方', 'とは', 'しないとどうなる'])]
question_keywords.sort(key=lambda x: x['volume'], reverse=True)

print('\n' + '=' * 80)
print(f'疑问型关键词（适合博客）: {len(question_keywords):,}个')
print('=' * 80)
print(f'\n搜索量Top30疑问词:')
for i, kw in enumerate(question_keywords[:30]):
    print(f"  {i+1}. {kw['keyword']} | Volume: {kw['volume']:,} | KD: {kw['kd']}% | Intent: {kw['intent']}")

blue_ocean_questions = [kw for kw in question_keywords if kw['kd'] <= 30 and kw['volume'] >= 100]
blue_ocean_questions.sort(key=lambda x: x['volume'], reverse=True)

print('\n' + '=' * 80)
print(f'蓝海疑问词（KD<=30%, Volume>=100）: {len(blue_ocean_questions):,}个')
print('=' * 80)
print(f'\n搜索量Top50蓝海疑问词:')
for i, kw in enumerate(blue_ocean_questions[:50]):
    print(f"  {i+1}. {kw['keyword']} | Volume: {kw['volume']:,} | KD: {kw['kd']}% | Intent: {kw['intent']}")

output_file = os.path.join(OUTPUT_DIR, 'blue_ocean_keywords.csv')
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['keyword', 'volume', 'kd', 'intent', 'cpc', 'seed'])
    writer.writeheader()
    for kw in blue_ocean:
        writer.writerow(kw)

print(f'\n蓝海词已导出到: {output_file}')

output_file2 = os.path.join(OUTPUT_DIR, 'blue_ocean_questions.csv')
with open(output_file2, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['keyword', 'volume', 'kd', 'intent', 'cpc', 'seed'])
    writer.writeheader()
    for kw in blue_ocean_questions:
        writer.writerow(kw)

print(f'蓝海疑问词已导出到: {output_file2}')

category_keywords = defaultdict(list)
for kw in blue_ocean_questions:
    text = kw['keyword']
    if any(w in text for w in ['確定申告']):
        category_keywords['確定申告'].append(kw)
    elif any(w in text for w in ['年末調整']):
        category_keywords['年末調整'].append(kw)
    elif any(w in text for w in ['税金', '税', '所得税', '住民税', '相続税', '贈与税']):
        category_keywords['税金全般'].append(kw)
    elif any(w in text for w in ['控除', '生命保険', '医療費', '住宅ローン', '扶養', '配偶者', '基礎控除']):
        category_keywords['各種控除'].append(kw)
    elif any(w in text for w in ['給与', '収入', '年収', '月収', 'ボーナス']):
        category_keywords['給与収入'].append(kw)
    elif any(w in text for w in ['社会保険', '健康保険', '国民健康保険', '厚生年金', '国民年金']):
        category_keywords['社会保険'].append(kw)
    elif any(w in text for w in ['ふるさと納税', '医療費控除', 'iDeCo', 'イデコ', 'NISA']):
        category_keywords['節税対策'].append(kw)
    elif any(w in text for w in ['副業', 'ダブルワーク', '個人事業主', 'フリーランス']):
        category_keywords['副業・個人事業主'].append(kw)
    else:
        category_keywords['その他'].append(kw)

print('\n' + '=' * 80)
print('蓝海疑问词分类统计')
print('=' * 80)
for cat, kws in sorted(category_keywords.items(), key=lambda x: len(x[1]), reverse=True):
    total_vol = sum(kw['volume'] for kw in kws)
    print(f"\n  【{cat}】 {len(kws)}个词, 总搜索量: {total_vol:,}")
    for kw in kws[:10]:
        print(f"    - {kw['keyword']} | Vol: {kw['volume']:,} | KD: {kw['kd']}%")
