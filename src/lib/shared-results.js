import { convertSpeed,calculateSpeed,calculateDistance,calculateTime } from './hayasa.js';
import { calculateServicePeriod } from './kinzoku-nensuu.js';
import { businessMonth, durationText } from './office-tools.js';
import { holidayPlan,retirementLeavePlan,normalizeSchedule } from './work-plans.js';

export const SHARE_TOOLS = {
  hayasa:'速さ・距離・時間', 'kinzoku-nensuu':'勤続年数', eigyoubi:'営業日数',
  'taishoku-yukyu':'退職前の有給消化', 'nenmatsu-nenshi':'年末年始の休業予定',
};
const n = (v) => new Intl.NumberFormat('ja-JP',{maximumFractionDigits:4}).format(v);
const amount = v => typeof v==='number' && Number.isFinite(v) && v>0 && v<=1e9;
const keysOnly = (o,keys) => Object.keys(o).every(k=>keys.includes(k)) && keys.every(k=>Object.hasOwn(o,k));
const object = o => o && typeof o==='object' && !Array.isArray(o);
const date = d => typeof d==='string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && d>='1900-01-01' && d<='2100-12-31';
const time = a => a.every(v=>Number.isInteger(v)&&v>=0) && a[0]<=1e6 && a[1]<60 && a[2]<60;

// v1 stores validated conditions, never user-provided HTML or an asserted answer.
export function sharedResult(tool,input) {
  if (!Object.hasOwn(SHARE_TOOLS,tool) || !object(input)) return null;
  let normalized, facts, days, note='';
  if(tool==='hayasa'){
    const modes={convert:['mode','value','unit'],speed:['mode','distance','distanceUnit','hours','minutes','seconds'],distance:['mode','value','unit','hours','minutes','seconds'],time:['mode','distance','distanceUnit','value','unit']};
    const fields=Object.hasOwn(modes,input.mode)?modes[input.mode]:null;if(!fields || !keysOnly(input,fields))return null;
    if(Object.hasOwn(input,'value') && (!amount(input.value)||!['kmh','mps','mpm'].includes(input.unit)))return null;
    if(Object.hasOwn(input,'distance') && (!amount(input.distance)||!['km','m'].includes(input.distanceUnit)))return null;
    if(Object.hasOwn(input,'hours')&&!time([input.hours,input.minutes,input.seconds]))return null;
    normalized=Object.fromEntries(fields.map(k=>[k,input[k]]));
    const {mode,value,unit,distance,distanceUnit,hours,minutes,seconds}=input;
    let r;
    if(mode==='convert')r=convertSpeed(value,unit);
    else if(mode==='speed')r=calculateSpeed(distance,distanceUnit,hours,minutes,seconds);
    else if(mode==='distance')r=calculateDistance(value,unit,hours,minutes,seconds);
    else r=calculateTime(distance,distanceUnit,value,unit);
    if(!r||Object.values(r).some(v=>typeof v==='number'&&!Number.isFinite(v)))return null;
    facts=mode==='distance'?[['移動距離',n(r.distanceKilometers)+' km'],['距離（m）',n(r.distanceMeters)+' m']]:mode==='time'?[['所要時間',durationText(r.durationSeconds)],['所要秒数',n(r.durationSeconds)+' 秒']]:[['時速',n(r.kilometersPerHour)+' km/h'],['秒速',n(r.metersPerSecond)+' m/s'],['分速',n(r.metersPerMinute)+' m/分']];
    const units={kmh:'km/h',mps:'m/s',mpm:'m/分'};
    if(Object.hasOwn(input,'distance')) facts.push(['入力距離',n(distance)+' '+distanceUnit]);
    if(Object.hasOwn(input,'value'))facts.push(['入力速度',n(value)+' '+units[unit]]);
    if(Object.hasOwn(input,'hours'))facts.push(['入力時間',`${hours}時間${minutes}分${seconds}秒`]);
    note='一定の速度で進む場合の換算です。加減速や停止時間は含みません。';
  }else if(tool==='kinzoku-nensuu'){
    if(!keysOnly(input,['join','reference'])||!date(input.join)||!date(input.reference))return null;
    const r=calculateServicePeriod(input.join,input.reference);if(!r)return null;
    normalized={join:input.join,reference:input.reference};
    facts=[['入社日',r.joinDate],['基準日',r.referenceDate],['勤続期間',`${r.duration.years}年${r.duration.months}ヶ月${r.duration.days}日`],['入社何年目',r.serviceYear+'年目'],['経過日数',n(r.totalDays)+'日'],['次の周年日',r.nextAnniversary.date]];
    note='基準日はリンク作成時の指定日です。受け取った日の「現在」に自動変更しません。会社の就業規則による数え方とは異なる場合があります。';
  }else{
    const fields=tool==='eigyoubi'?['year','month','weekdays','extra']:tool==='taishoku-yukyu'?['retire','balance','weekdays','extra']:['start','end','weekdays','extra'];
    if(!keysOnly(input,fields))return null;
    const schedule=normalizeSchedule(input.weekdays,input.extra);if(!schedule)return null;
    let r;
    if(tool==='eigyoubi'){
      if(![2026,2027].includes(input.year)||!Number.isInteger(input.month))return null;
      r=businessMonth(input.year,input.month,schedule.extra,schedule.weekdays);if(!r)return null;
      facts=[['対象月',`${input.year}年${input.month}月`],['営業日数',r.businessDays+'日'],['暦日数',r.calendarDays+'日']];
    }else if(tool==='taishoku-yukyu'){
      r=retirementLeavePlan(input.retire,input.balance,schedule.weekdays,schedule.extra);if(!r)return null;
      facts=[['退職日',r.retire],['確認済み有給残日数',r.balance+'日'],['有給消化の開始日',r.firstLeave || '有給を使わない'],['最終出勤日の目安',r.lastWork]];
    }else{
      r=holidayPlan(input.start,input.end,schedule.weekdays,schedule.extra);if(!r)return null;
      facts=[['対象期間',`${r.start}〜${r.end}`],['出勤予定日',r.workingDays+'日'],['休日',r.offDays+'日']];
    }
    normalized={...Object.fromEntries(fields.filter(k=>!['weekdays','extra'].includes(k)).map(k=>[k,input[k]])),...schedule};
    facts.push(['通常の勤務曜日',schedule.weekdays.map(d=>'日月火水木金土'[d]).join('・')],['会社独自の休日',schedule.extra.length?schedule.extra.join('、'):'指定なし']);
    days=r.days;
    note=tool==='taishoku-yukyu'?'退職日を含めた所定労働日だけに、確認済みの全日有給を連続して割り当てた予定です。半休、時間休、期限切れ、途中の追加付与、引継ぎは計算しません。勤務先との調整にお使いください。':'土日などの勤務曜日外の日と日本の祝日、指定した会社休日を除きます。銀行・会社の休業日を自動で推定するものではありません。';
  }
  return {tool,input:normalized,title:SHARE_TOOLS[tool]+'の計算結果',facts,days,note};
}
export function sharedResultUrl(tool,input,origin='https://keisantool.com') {
  const r=sharedResult(tool,input);if(!r)return null;
  const fragment='#v1='+encodeURIComponent(JSON.stringify(r.input));
  if(fragment.length>6000)return null;
  return `${origin}/result/${tool}/${fragment}`;
}
export function readSharedResult(tool,hash) {
  if(typeof hash!=='string'||!hash.startsWith('#v1=')||hash.length>6000)return null;
  try{return sharedResult(tool,JSON.parse(decodeURIComponent(hash.slice(4))));}catch{return null;}
}
