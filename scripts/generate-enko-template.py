"""Generate the standalone arc workbook. Run via tools/dev/run keisantool python."""
from pathlib import Path
import argparse
import math
import xlsxwriter

parser = argparse.ArgumentParser()
parser.add_argument('--output', default='public/downloads/enko/enko-batch-template.xlsx')
parser.add_argument('--verification', action='store_true')
args = parser.parse_args()
path = Path(args.output)
path.parent.mkdir(parents=True, exist_ok=True)
wb = xlsxwriter.Workbook(path)
wb.set_properties({'title': '円弧・弦・扇形 Excel一括計算', 'author': 'keisantool.com', 'comments': '半径と中心角から計算。マクロ・外部データ接続なし。'})
ws = wb.add_worksheet('一括計算')
header = wb.add_format({'bold': True, 'bg_color': '#1E5264', 'font_color': 'white', 'text_wrap': True})
input_fmt = wb.add_format({'bg_color': '#EAF5FF', 'num_format': '0.########'})
result_fmt = wb.add_format({'num_format': '0.000', 'bg_color': '#F4F7F8'})
text_fmt = wb.add_format({'text_wrap': True})
ws.merge_range('A1:F1', '円弧・弦・扇形｜Excel 一括計算テンプレート', header)
ws.merge_range('A2:F2', '青いB・C列を編集。1行1組、100組。例は上書きできます。結果は小数3桁表示（計算途中は丸めません）。', text_fmt)
ws.merge_range('A3:F3', '半径は全行で同じ長さ単位（mm・cm・m等）に統一。単位の自動換算はしません。面積はその平方単位です。', text_fmt)
ws.merge_range('A4:F4', '条件：半径 > 0、0 < 中心角 ≤ 360度。B・Cが両方空なら結果も空。貼り付け時もG列の判定を確認。', text_fmt)
ws.merge_range('A5:C5', '')
ws.write_url('A5', 'https://keisantool.com/enko/', string='元の円弧計算器・使い方')
ws.merge_range('D5:G5', '幾何学上の円弧が対象。弦高の逆算・加工公差・材料厚みは扱いません。計算結果はあくまで参考値です。', text_fmt)
ws.write_row('A7', ['No.', '半径 r（統一長さ単位）', '中心角 θ（度）', '円弧の長さ（同じ単位）', '弦の長さ（同じ単位）', '扇形の面積（平方単位）', '入力判定'], header)
samples = [(10,90),(5,180)]
if args.verification:
    samples = [(10,90),(5,180),(10,360),(2.5,30.5),(0,90),(-1,90),(10,0),(10,-5),(10,361),('abc',90),(10,None),(None,None),(1e308,360)]
for row in range(8,108):
    idx = row - 8
    pair = samples[idx] if idx < len(samples) else (None,None)
    ws.write_number(row-1,0,idx+1)
    for col,val in enumerate(pair,1):
        ws.write(row-1,col,val,input_fmt)
    status = f'=IF(AND(B{row}="",C{row}=""),"",IF(COUNT(B{row}:C{row})<>2,"数値を2つ入力",IF(OR(B{row}<=0,C{row}<=0,C{row}>360),"半径>0・0<角度≤360",IFERROR(IF(AND(ISNUMBER(B{row}*PI()*C{row}/180),ISNUMBER(2*B{row}*SIN(C{row}*PI()/360)),ISNUMBER(PI()*B{row}^2*C{row}/360)),"OK","数値が大きすぎます"),"数値が大きすぎます"))))'
    valid = all(isinstance(v,(int,float)) for v in pair) and pair[0]>0 and 0<pair[1]<=360
    vals = [None]*3
    if valid:
        try:
            r,t = pair
            vals=[r*math.pi*t/180,2*r*math.sin(t*math.pi/360),math.pi*r*r*t/360]
            valid=all(math.isfinite(v) for v in vals)
        except OverflowError:
            valid=False
    formulas=[f'B{row}*PI()*C{row}/180',f'2*B{row}*SIN(C{row}*PI()/360)',f'PI()*B{row}^2*C{row}/360']
    for col,formula in enumerate(formulas,3):
        ws.write_formula(row-1,col,f'=IF(G{row}="OK",{formula},"")',result_fmt,vals[col-3] if valid else '')
    cached='OK' if valid else ('' if pair==(None,None) else '数値が大きすぎます' if all(isinstance(v,(int,float)) for v in pair) and pair[0]>0 and 0<pair[1]<=360 else '半径>0・0<角度≤360' if all(isinstance(v,(int,float)) for v in pair) else '数値を2つ入力')
    ws.write_formula(row-1,6,status,text_fmt,cached)
ws.data_validation('B8:B107', {'validate':'decimal','criteria':'>','value':0,'input_title':'半径','input_message':'0より大きい数値。全行同じ単位。','error_title':'半径を確認','error_message':'0より大きい数値を入力してください。','error_type':'stop'})
ws.data_validation('C8:C107', {'validate':'custom','value':'=AND(ISNUMBER(C8),C8>0,C8<=360)','input_title':'中心角（度）','input_message':'0より大きく360以下。','error_title':'中心角を確認','error_message':'0より大きく360以下の数値を入力してください。','error_type':'stop'})
ws.set_column('A:A',7)
ws.set_column('B:F',23)
ws.set_column('G:G',29)
for row in range(1,5): ws.set_row(row,34)
ws.set_row(6,34)
ws.freeze_panes(7,3)
ws.autofilter('A7:G107')
ws.set_landscape()
ws.fit_to_pages(1,0)
ws.repeat_rows(0,6)
help_ws=wb.add_worksheet('使い方と数式')
help_ws.set_column('A:A',24)
help_ws.set_column('B:B',100)
notes=[('使い方','一括計算のB・C列に入力。D〜G列は数式なので上書きしないでください。'),('追加行','107行目のB〜G列を下へコピー。数式の行番号が変わることを確認してください。'),('円弧の長さ','=B8*PI()*C8/180'),('弦の長さ','=2*B8*SIN(C8*PI()/360)'),('扇形の面積','=PI()*B8^2*C8/360'),('空欄・無効値','結果列はG列がOKのときだけ計算。空行は空欄、片方空欄や文字はエラー表示。'),('360度','円弧は円周、扇形は円全体。弦は理論上0（浮動小数点の微小誤差は表示上0.000）。'),('対応範囲','Excelで使える基本関数 IF / AND / OR / COUNT / ISNUMBER / IFERROR / PI / SIN を使用。マクロ不要。'),('確認例','r=10・90度：円弧15.708、弦14.142、面積78.540。r=5・180度：円弧15.708、弦10.000、面積39.270。'),('ご注意','計算結果はあくまで参考値です。単位換算、弦高逆算、公差や加工判断には対応しません。')]
for i,(key,val) in enumerate(notes):
    help_ws.write(i,0,key,header)
    help_ws.write_string(i,1,val,text_fmt)
    help_ws.set_row(i,42)
help_ws.write_url('B12','https://keisantool.com/enko/')
wb.close()
print(path)
