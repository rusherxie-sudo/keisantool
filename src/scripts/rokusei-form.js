// Helpers for local-only input. No birthdays or selected results enter events/URLs.
export function write(id, value) { document.getElementById(id).textContent = value; }
export function rows(id, values) {
  const body = document.getElementById(id); body.replaceChildren();
  for (const row of values) {
    const tr=document.createElement('tr');
    row.forEach((value,i)=>{ const cell=document.createElement(i===0?'th':'td'); if(i===0)cell.scope='row';cell.textContent=String(value);tr.append(cell); });
    body.append(tr);
  }
}
export function bindResult(form, result, status, calculate, eventType) {
  let tracked=false;
  form.addEventListener('input',()=>{result.hidden=true;status.textContent='入力を変更しました。「調べる」を押してください。';});
  form.addEventListener('submit',e=>{
    e.preventDefault();result.hidden=true;
    const error=calculate();
    if(error){status.textContent=error;return;}
    result.hidden=false;status.textContent='結果を表示しました。';
    if(!tracked){window.trackCalculatorResult?.(eventType);tracked=true;}
  });
}
