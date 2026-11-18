#!/usr/bin/env python3
"""Create the tenure template with openpyxl; formulas need real Office recalculation.

After generation, run check-tenure-workbook.py prepare, office_recalculate on both
files, and check-tenure-workbook.py verify/delivery. Export the preview only from
verified cached values. Never replace a calculated workbook by saving data_only.
"""
from datetime import datetime
from pathlib import Path

from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Protection, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.pagebreak import Break
from openpyxl.workbook.properties import CalcProperties

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public/downloads/kinzoku-nensuu-template.xlsx'
FONT = 'Arial Unicode MS'
INK = '183D48'
INPUT = 'FFF2CC'
RESULT = 'EAF3F7'
LINE = 'CEDDE2'
DATE_FORMAT = 'yyyy/mm/dd'
SOURCE = 'https://support.microsoft.com/en-us/excel/functions/datedif-function'


def joined(ws, address, text, *, size=11, bold=False, fill=None, color=INK):
    ws.merge_cells(address)
    cell = ws[address.split(':')[0]]
    cell.value = text
    cell.font = Font(name=FONT, size=size, bold=bold, color=color)
    cell.alignment = Alignment(vertical='center', wrap_text=True)
    if fill:
        for row in ws[address]:
            for item in row:
                item.fill = PatternFill('solid', fgColor=fill)


def date_validation(ws, address, anchor):
    rule = DataValidation(type='custom', formula1=f'AND(ISNUMBER({anchor}),{anchor}>=DATE(1901,1,1),{anchor}<=DATE(2099,12,31),INT({anchor})={anchor})', allow_blank=True)
    rule.errorTitle = '日付を確認してください'
    rule.error = '1901/01/01〜2099/12/31の日付を入力してください。文字列や時刻は使用できません。'
    rule.promptTitle = '日付として入力'
    rule.prompt = '例：2026/04/01。表示形式だけ変えても文字列は日付になりません。'
    rule.showErrorMessage = True
    rule.showInputMessage = True
    rule.errorStyle = 'stop'
    ws.add_data_validation(rule)
    rule.add(address)


def formulas(ws, row):
    r = row
    status = (
        f'IF(AND(A{r}="",B{r}=""),"",'
        f'IF(B{r}="","入社日を入力",'
        'IF($B$3="","基準日を入力",'
        f'IF(NOT(ISNUMBER(B{r})),"入社日を日付で入力",'
        'IF(NOT(ISNUMBER($B$3)),"基準日を日付で入力",'
        f'IF(OR(B{r}<DATE(1901,1,1),B{r}>DATE(2099,12,31),INT(B{r})<>B{r}),"入社日を日付で入力",'
        'IF(OR($B$3<DATE(1901,1,1),$B$3>DATE(2099,12,31),INT($B$3)<>$B$3),"基準日を日付で入力",'
        f'IF($B$3<B{r},"日付の順序を確認","計算済み")'
        ')))))))'
    )
    ws.cell(r, 7, f'=IFERROR({status},"入力内容を確認")')
    ws.cell(r, 3, f'=IF(G{r}="計算済み",$B$3,"")')
    ws.cell(r, 4, f'=IF(G{r}="計算済み",DATEDIF(B{r},$B$3,"Y"),"")')
    ws.cell(r, 5, f'=IF(G{r}="計算済み",DATEDIF(B{r},$B$3,"Y")&"年"&DATEDIF(B{r},$B$3,"YM")&"か月","")')
    ws.cell(r, 6, f'=IF(G{r}="計算済み",D{r}+1,"")')


def table_sheet(wb, name, count, example=False):
    ws = wb.create_sheet(name)
    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = 90
    widths = {'A': 18, 'B': 17, 'C': 17, 'D': 13, 'E': 19, 'F': 13, 'G': 27}
    for key, width in widths.items():
        ws.column_dimensions[key].width = width
    joined(ws, 'A1:G1', '勤続年数 一括計算｜' + ('記入例3人' if example else '入力用100人'), size=18, bold=True, fill=INK, color='FFFFFF')
    ws.row_dimensions[1].height = 42
    joined(ws, 'A2:G2', '黄色：入力するセル（基準日・社員番号・入社日）　／　青色：自動計算。氏名の入力は不要です。')
    ws.row_dimensions[2].height = 30
    ws['A3'] = '統一基準日 →'
    ws['A3'].font = Font(name=FONT, bold=True, size=11, color=INK)
    ws['B3'].fill = PatternFill('solid', fgColor=INPUT)
    ws['B3'].font = Font(name=FONT, size=12, bold=True, color='7A4600')
    ws['B3'].number_format = DATE_FORMAT
    ws['B3'].protection = Protection(locked=False)
    ws['B3'].alignment = Alignment(horizontal='center', vertical='center')
    ws['B3'].comment = Comment('この日付を変更すると、このシート内の全員の結果が更新されます。日付として入力してください。', 'KeisanTool')
    joined(ws, 'C3:G3', '全員共通の日付をB3に入力。入社日はB列に1人ずつ入力します。')
    ws.row_dimensions[3].height = 32
    joined(ws, 'A4:G4', '満年数＝経過した年数　／　年月＝満年＋残りの月　／　何年目＝満年数＋1（入社日を1年目）')
    ws.row_dimensions[4].height = 30
    joined(ws, 'A5:G5', '通常の在籍期間の目安です。退職所得の税務計算・有給休暇・就業規則上の勤続年数にはそのまま使えません。', size=10)
    ws.row_dimensions[5].height = 28
    headers = ['社員番号（任意）', '入社日', '基準日（共通）', '満年数', '年月', '何年目', '確認']
    for col, text in enumerate(headers, 1):
        cell = ws.cell(6, col, text)
        cell.fill = PatternFill('solid', fgColor='A56F10' if col <= 2 else '276273')
        cell.font = Font(name=FONT, size=11, color='FFFFFF', bold=True)
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    ws.row_dimensions[6].height = 30
    end = 6 + count
    for r in range(7, end + 1):
        formulas(ws, r)
        ws.row_dimensions[r].height = 29
        for col in range(1, 8):
            cell = ws.cell(r, col)
            cell.fill = PatternFill('solid', fgColor=INPUT if col <= 2 else RESULT)
            cell.font = Font(name=FONT, size=11, color='6C4700' if col <= 2 else INK)
            cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=(col == 7))
            cell.border = Border(bottom=Side(style='hair', color=LINE))
            cell.protection = Protection(locked=col > 2)
        ws.cell(r, 1).number_format = '@'
        ws.cell(r, 2).number_format = DATE_FORMAT
        ws.cell(r, 3).number_format = DATE_FORMAT
        ws.cell(r, 4).number_format = '0"年"'
        ws.cell(r, 6).number_format = '0"年目"'
    ws['D6'].comment = Comment('DATEDIFのY：完了した年数。端数の切り上げは行いません。', 'KeisanTool')
    ws['E6'].comment = Comment('DATEDIFのYとYM：満年と残りの月数。日数は表示しません。', 'KeisanTool')
    ws['F6'].comment = Comment('満年数に1を加算します。入社日は1年目、満1年なら2年目です。', 'KeisanTool')
    date_validation(ws, 'B3', 'B3')
    date_validation(ws, f'B7:B{end}', 'B7')
    ws.conditional_formatting.add(f'G7:G{end}', FormulaRule(formula=['AND(G7<>"",G7<>"計算済み")'], fill=PatternFill('solid', fgColor='FFE0CF'), font=Font(name=FONT, color='9E3417', bold=True)))
    ws.freeze_panes = 'C7'
    ws.auto_filter.ref = f'A6:G{end}'
    ws.protection.sheet = True
    ws.protection.autoFilter = False
    ws.protection.selectLockedCells = False
    ws.protection.selectUnlockedCells = False
    ws.print_title_rows = '1:6'
    ws.print_options.horizontalCentered = True
    ws.page_setup.orientation = 'landscape'
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_margins.left = ws.page_margins.right = 0.25
    ws.page_margins.top = ws.page_margins.bottom = 0.35
    ws.oddFooter.center.text = 'KeisanTool | &P / &N'
    ws.oddFooter.center.size = 8
    footer = end + 2
    joined(ws, f'A{footer}:G{footer}', '月末・うるう日の扱いはDATEDIFに従います。「使い方」で確認してください。計算結果はあくまで参考値です。', size=10)
    ws.row_dimensions[footer].height = 30
    ws.print_area = f'A1:G{footer}'
    if not example:
        for r in (26, 46, 66, 86):
            ws.row_breaks.append(Break(id=r))
    return ws


def guide(wb):
    ws = wb.create_sheet('使い方')
    ws.sheet_view.showGridLines = False
    ws.column_dimensions['A'].width = 4
    for col in 'BCDEF':
        ws.column_dimensions[col].width = 20
    ws.column_dimensions['G'].width = 4
    joined(ws, 'B2:F2', '勤続年数テンプレートの使い方', size=18, bold=True, fill=INK, color='FFFFFF')
    ws.row_dimensions[2].height = 44
    sections = [
        ('1　100人分の空白テンプレート', '「入力用100人」の7〜106行が入力欄です。「記入例3人」は別シートなので、例を消す必要はありません。社員番号は任意です。氏名やメールアドレスは必要ありません。'),
        ('2　黄色のセルに入力', 'B3に全員共通の基準日、A列に社員番号、B列に入社日を入力します。1901/01/01〜2099/12/31の日付に対応します。時刻や文字列は入力しないでください。'),
        ('3　青色の結果を確認', '満年数：DATEDIFのY。年月：YとYM。何年目：満年数＋1。例：2020/04/01入社、2026/04/01基準なら、満6年・6年0か月・7年目です。日数は表示しません。'),
        ('4　月末・うるう日の数え方', 'DATEDIFの例：2025/01/31→2025/02/28は0年0か月。2024/02/29→2025/02/28は0年11か月、2025/03/01では1年0か月。月末を同一日とみなす勤務先の規則やWeb版とは異なる場合があります。'),
        ('5　入力エラーと貼り付け', '確認欄の案内に従って、空欄・文字列の日付・基準日より後の入社日を修正してください。貼り付けで入力規則を回避しても、数式は不正な日付を計算しません。日付の表示形式を変えるだけでは文字列は変換されません。'),
        ('6　保存と数式の保護', 'ファイルを自分の端末に保存し、Excelなどの対応表計算ソフトで開きます。マクロは使いません。数式セルは誤操作を防ぐため保護しています。必要なら「校閲」→「シート保護の解除」で解除できます（パスワードなし）。'),
        ('7　用途と個人情報', '通常の在籍期間の目安を一覧にする用途です。休職・再入社・通算期間は考慮しません。退職所得の勤続年数や有給休暇の付与には別の規則があるため、この結果だけでは判断できません。サイトへのアップロードは不要です。'),
        ('8　結果が更新されない場合', '表計算ソフトの計算方法を「自動」に設定して再計算してください。DATEDIFのMDには既知の制限があるため使用していません。計算結果はあくまで参考値です。利用するソフトと勤務先の規定を確認してください。'),
    ]
    r = 4
    for title, text in sections:
        joined(ws, f'B{r}:F{r}', title, size=12, bold=True, fill=RESULT)
        ws.row_dimensions[r].height = 27
        joined(ws, f'B{r+1}:F{r+1}', text, size=10)
        ws.row_dimensions[r+1].height = 49
        r += 3
    joined(ws, f'B{r}:F{r}', '出典：Microsoft DATEDIF関数 / KeisanTool', size=10)
    ws.cell(r, 2).hyperlink = SOURCE
    ws.cell(r, 2).font = Font(name=FONT, size=10, color='0563C1', underline='single')
    ws.row_dimensions[r].height = 25
    joined(ws, f'B{r+1}:F{r+1}', 'https://keisantool.com/kinzoku-nensuu/excel/', size=10)
    ws.cell(r + 1, 2).hyperlink = 'https://keisantool.com/kinzoku-nensuu/excel/'
    ws.print_area = f'A1:G{r+2}'
    ws.page_setup.orientation = 'portrait'
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 1
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_margins.left = ws.page_margins.right = 0.25
    ws.page_margins.top = ws.page_margins.bottom = 0.3


def main():
    wb = Workbook()
    wb.remove(wb.active)
    wb.properties.creator = 'KeisanTool'
    wb.properties.title = '勤続年数 Excelテンプレート（100人分）'
    wb.properties.subject = '通常の在籍期間：満年数・年月・何年目'
    wb.properties.description = '100 blank employee rows plus 3 separate examples. DATEDIF Y/YM; not for tax calculations.'
    wb.calculation = CalcProperties(calcId=191029, calcMode='auto', fullCalcOnLoad=True, forceFullCalc=True)
    table_sheet(wb, '入力用100人', 100)
    example = table_sheet(wb, '記入例3人', 3, example=True)
    example['B3'] = datetime(2026, 4, 1)
    for row, employee, hire in [(7, 'EX-001', datetime(2020, 4, 1)), (8, 'EX-002', datetime(2020, 4, 2)), (9, 'EX-003', datetime(2026, 4, 1))]:
        example.cell(row, 1, employee)
        example.cell(row, 2, hire)
    guide(wb)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUTPUT)
    print(f'Created {OUTPUT}; 100 blank inputs, 3 example rows; native recalculation required.')


if __name__ == '__main__':
    main()
