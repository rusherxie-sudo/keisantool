#!/usr/bin/env python3
"""Functional checks against cached results produced by a real spreadsheet engine.

prepare: copy the actual public workbook and populate independent acceptance cases.
verify: compare office_recalculate output with fixed expected answers; never evaluate
Excel formulas in Python. Run verify on the unrecalculated fixture to see RED.
"""
import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path
from zipfile import ZipFile

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / 'public/downloads/kinzoku-nensuu-template.xlsx'
WORK = ROOT / '.astro/growth-tenure-validation'


def date(value):
    return datetime.strptime(value, '%Y-%m-%d')


# Literal expected values are acceptance examples, not another date implementation.
CASES = [
    ('anniversary-before', '2026-03-31', '2020-04-01', 'A-001', 7, [5, '5年11か月', 6, '計算済み']),
    ('anniversary-on', '2026-04-01', '2020-04-01', 'A-001', 7, [6, '6年0か月', 7, '計算済み']),
    ('anniversary-after', '2026-04-02', '2020-04-01', 'A-001', 7, [6, '6年0か月', 7, '計算済み']),
    ('hire-today', '2026-04-01', '2026-04-01', 'A-002', 7, [0, '0年0か月', 1, '計算済み']),
    ('month-end-short', '2025-02-28', '2025-01-31', 'M-001', 7, [0, '0年0か月', 1, '計算済み']),
    ('month-end-two', '2025-03-31', '2025-01-31', 'M-002', 7, [0, '0年2か月', 1, '計算済み']),
    ('leap-before', '2025-02-28', '2024-02-29', 'L-001', 7, [0, '0年11か月', 1, '計算済み']),
    ('leap-after', '2025-03-01', '2024-02-29', 'L-002', 7, [1, '1年0か月', 2, '計算済み']),
    ('leap-four-years', '2028-02-29', '2024-02-29', 'L-003', 7, [4, '4年0か月', 5, '計算済み']),
    ('hundredth-row', '2026-04-01', '2016-04-01', 'LAST-100', 106, [10, '10年0か月', 11, '計算済み']),
    ('both-empty', '2026-04-01', None, None, 7, ['', '', '', '']),
    ('missing-hire', '2026-04-01', None, 'NO-DATE', 7, ['', '', '', '入社日を入力']),
    ('missing-base', None, '2020-04-01', 'NO-BASE', 7, ['', '', '', '基準日を入力']),
    ('reverse', '2026-04-01', '2026-04-02', 'FUTURE', 7, ['', '', '', '日付の順序を確認']),
    ('text-hire', '2026-04-01', {'text': '2020/4/1'}, 'TEXT', 7, ['', '', '', '入社日を日付で入力']),
    ('text-base', {'text': '2026/4/1'}, '2020-04-01', 'TEXT', 7, ['', '', '', '基準日を日付で入力']),
    ('negative-hire', '2026-04-01', -1, 'NEGATIVE', 7, ['', '', '', '入社日を日付で入力']),
    ('boolean-hire', '2026-04-01', True, 'BOOLEAN', 7, ['', '', '', '入社日を日付で入力']),
    ('fractional-base', 46113.5, '2020-04-01', 'TIME', 7, ['', '', '', '基準日を日付で入力']),
    ('id-optional', '2026-04-01', '2020-04-01', None, 7, [6, '6年0か月', 7, '計算済み']),
]


def input_value(value):
    if isinstance(value, dict):
        return value['text']
    if isinstance(value, str):
        return date(value)
    return value


def blank(value):
    return '' if value is None else value


def inspect_template(path):
    wb = load_workbook(path, data_only=False)
    assert wb.sheetnames == ['入力用100人', '記入例3人', '使い方'], wb.sheetnames
    ws = wb['入力用100人']
    assert ws['B3'].value is None, 'The shared reference date must start blank'
    assert all(ws.cell(r, c).value is None for r in range(7, 107) for c in (1, 2)), '100 genuinely blank employee inputs required'
    assert all(ws.cell(r, c).data_type == 'f' for r in range(7, 107) for c in range(3, 8)), 'All 100 rows must be usable'
    assert ws['B107'].value is None and ws['D107'].data_type != 'f', 'Exactly 100 input rows'
    assert sum(wb['記入例3人'].cell(r, 2).value is not None for r in range(7, 107)) == 3
    with ZipFile(path) as archive:
        assert not any('vba' in n.lower() or 'externallink' in n.lower() for n in archive.namelist())
    return wb


def prepare():
    wb = inspect_template(TEMPLATE)
    source = wb['入力用100人']
    for name, base, hire, employee, row, expected in CASES:
        ws = wb.copy_worksheet(source)
        ws.title = name
        ws['B3'] = input_value(base)
        ws.cell(row, 1, employee)
        ws.cell(row, 2, input_value(hire))
    # Change one common date and observe both the first and last employee together.
    for name, base in [('shared-before', '2026-03-31'), ('shared-after', '2026-04-01')]:
        ws = wb.copy_worksheet(source)
        ws.title = name
        ws['B3'] = date(base)
        for row, hire in [(7, '2020-04-01'), (106, '2016-04-01')]:
            ws.cell(row, 1, f'EMP-{row}')
            ws.cell(row, 2, date(hire))
    WORK.mkdir(parents=True, exist_ok=True)
    fixture = WORK / 'tenure-functional-input.xlsx'
    wb.save(fixture)
    print(json.dumps({'fixture': str(fixture), 'cases': len(CASES) + 4}, ensure_ascii=False))


def verify(path):
    formulas = load_workbook(path, data_only=False)
    cached = load_workbook(path, data_only=True)
    records = []
    for name, base, hire, employee, row, expected in CASES:
        actual = [blank(cached[name].cell(row, col).value) for col in range(4, 8)]
        assert actual == expected, f'{name}: expected {expected!r}; cached {actual!r}'
        assert all(formulas[name].cell(row, col).data_type == 'f' for col in range(3, 8)), name
        if expected[-1] == '計算済み':
            assert cached[name].cell(row, 3).value == date(base), name
        else:
            assert blank(cached[name].cell(row, 3).value) == '', name
        records.append({'case': name, 'row': row, 'expected': expected, 'cached': actual})
    for name, expected_years in [('shared-before', [5, 9]), ('shared-after', [6, 10])]:
        for row, years in zip([7, 106], expected_years):
            actual = cached[name].cell(row, 4).value
            assert actual == years, (name, row, actual, years)
            assert cached[name].cell(row, 3).value == cached[name]['B3'].value
            records.append({'case': name, 'row': row, 'expectedYears': years, 'cachedYears': actual})
    errors = [(ws.title, cell.coordinate, cell.value) for ws in cached for cells in ws for cell in cells if cell.data_type == 'e']
    assert not errors, errors
    report = {'engineInput': str(WORK / 'tenure-functional-input.xlsx'), 'recalculatedFile': str(path.resolve()), 'passed': len(records), 'formulaErrors': errors, 'results': records}
    target = WORK / 'functional-results.json'
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'passed': len(records), 'formulaErrors': len(errors), 'report': str(target)}, ensure_ascii=False))


def verify_delivery(path):
    wb = inspect_template(path)
    values = load_workbook(path, data_only=True)
    for row in range(7, 107):
        assert all(blank(values['入力用100人'].cell(row, col).value) == '' for col in range(3, 8)), row
    expected = [[6, '6年0か月', 7, '計算済み'], [5, '5年11か月', 6, '計算済み'], [0, '0年0か月', 1, '計算済み']]
    for row, want in zip(range(7, 10), expected):
        actual = [values['記入例3人'].cell(row, col).value for col in range(4, 8)]
        assert actual == want, (row, want, actual)
    errors = [(ws.title, c.coordinate, c.value) for ws in values for cells in ws for c in cells if c.data_type == 'e']
    assert not errors, errors
    print(json.dumps({'blankInputs': 100, 'exampleRows': 3, 'cachedExampleResults': expected, 'formulaCells': sum(c.data_type == 'f' for ws in wb for cells in ws for c in cells), 'formulaErrors': len(errors)}, ensure_ascii=False))


def export_preview(path):
    verify_delivery(path)
    ws = load_workbook(path, data_only=True)['記入例3人']
    rows = []
    for r in range(7, 10):
        rows.append({
            'employeeId': ws.cell(r, 1).value,
            'hireDate': ws.cell(r, 2).value.strftime('%Y/%m/%d'),
            'referenceDate': ws.cell(r, 3).value.strftime('%Y/%m/%d'),
            'fullYears': ws.cell(r, 4).value,
            'yearsMonths': ws.cell(r, 5).value,
            'serviceYear': ws.cell(r, 6).value,
            'status': ws.cell(r, 7).value,
        })
    preview = {
        'file': '/downloads/kinzoku-nensuu-template.xlsx',
        'bytes': path.stat().st_size,
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'sheet': '記入例3人',
        'referenceDate': ws['B3'].value.strftime('%Y/%m/%d'),
        'rows': rows,
    }
    target = ROOT / 'src/data/kinzoku-template-preview.json'
    target.write_text(json.dumps(preview, ensure_ascii=False, indent=2) + chr(10))
    print(f'Exported actual cached example cells to {target}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['prepare', 'verify', 'delivery', 'preview'])
    parser.add_argument('file', nargs='?', type=Path)
    args = parser.parse_args()
    if args.mode == 'prepare':
        prepare()
    elif args.mode == 'verify':
        assert args.file, 'Pass the actual office_recalculate output'
        verify(args.file)
    elif args.mode == 'preview':
        export_preview(args.file or TEMPLATE)
    else:
        verify_delivery(args.file or TEMPLATE)
