import { sharedResult,sharedResultUrl } from '../lib/shared-results.js';
const form=document.querySelector('#plan-form'), tool=form.dataset.planTool;
let tracked=false;
const $=id=>document.getElementById(id);
function clear(){$('plan-result').hidden=true;$('plan-error').textContent='';window.hideResultShare?.();}
form.addEventListener('input',clear);form.addEventListener('change',clear);
form.addEventListener('submit',event=>{
 event.preventDefault();clear();
 const common={weekdays:[...form.querySelectorAll('[name=plan-weekday]:checked')].map(e=>Number(e.value)),extra:$('plan-extra').value.split(/\s+/).filter(Boolean)};
 const input=tool==='taishoku-yukyu'?{retire:$('plan-retire').value,balance:Number($('plan-balance').value),...common}:{start:$('plan-start').value,end:$('plan-end').value,...common};
 const r=sharedResult(tool,input);
 if(!r){$('plan-error').textContent=tool==='taishoku-yukyu'?'2026・2027年の実在する日付、勤務曜日、0〜120の整数日を確認してください。有給開始日・最終出勤日が2026年より前になる予定は計算できません。':'2026・2027年の実在する日付と勤務曜日を確認してください。対象期間は開始日〜終了日が62日以内です。';return;}
 $('plan-heading').textContent=r.title;const dl=$('plan-facts');dl.replaceChildren();for(const [k,v] of r.facts){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd);}
 $('plan-note').textContent=r.note;const body=$('plan-days');body.replaceChildren();for(const d of r.days){const tr=document.createElement('tr');for(const value of [d.date,'日月火水木金土'[d.weekday],d.working?(tool==='taishoku-yukyu'&&input.balance?'有給休暇':'出勤予定'):d.holiday||(d.companyHoliday?'会社休日':'休日')]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}
 $('plan-result').hidden=false;window.setResultShare?.(r.title,{url:sharedResultUrl(tool,r.input,location.origin)});if(!tracked){window.trackCalculatorResult?.(tool);tracked=true;}
});
$('yearend-example')?.addEventListener('click',()=>{clear();$('plan-start').value='2026-12-26';$('plan-end').value='2027-01-05';$('plan-extra').value=['2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03'].join('\n');form.requestSubmit();});
