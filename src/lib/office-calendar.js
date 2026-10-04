import { businessMonth, BUSINESS_YEARS } from './office-tools.js';
import { holidays } from './shukujitsu.js';

export const OFFICE_SOURCE = 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html';
export const OFFICE_REVIEWED = '2026-10-04';
// Published routes are retained even after the month/year has passed.
export const publishedWorkMonths = [
  ...[10,11,12].map(month=>({year:2026,month})),
  ...Array.from({length:12},(_,i)=>({year:2027,month:i+1})),
];
export const monthPath = (year,month) => publishedWorkMonths.some(p=>p.year===year&&p.month===month) ? `/eigyoubi/${year}/${String(month).padStart(2,'0')}/` : `/eigyoubi/${year}/`;
export function workYear(year) {
  if(!BUSINESS_YEARS.includes(year))return null;
  const months=Array.from({length:12},(_,i)=>businessMonth(year,i+1));
  const days=months.flatMap(m=>m.days);
  const businessDays=months.reduce((sum,m)=>sum+m.businessDays,0);
  return {year,months,days,businessDays,offDays:days.length-businessDays};
}

// Only weekends + Japanese public holidays. Stays within the requested calendar year.
export function leavePlans(year,budget) {
  if(!Number.isInteger(budget)||budget<0||budget>3)return [];
  const calendar=workYear(year);if(!calendar)return [];
  const days=calendar.days,candidates=[];
  for(let i=0;i<days.length;i++){
    if(days[i].working || (i>0&&!days[i-1].working))continue;
    const leaveDates=[],holidayNames=[];
    for(let j=i;j<days.length;j++){
      if(days[j].working)leaveDates.push(days[j].date);
      if(leaveDates.length>budget)break;
      if(days[j].holiday)holidayNames.push(days[j].holiday);
      if(!days[j].working && (j===days.length-1||days[j+1].working) && j-i+1>=3 && holidayNames.length){
        candidates.push({start:days[i].date,end:days[j].date,length:j-i+1,leaveDates:[...leaveDates],holidays:[...new Set(holidayNames)]});
      }
    }
  }
  // Prefer the longest option; suppress overlapping variants of the same holiday break.
  candidates.sort((a,b)=>b.length-a.length||a.leaveDates.length-b.leaveDates.length||a.start.localeCompare(b.start));
  const selected=[];
  for(const p of candidates)if(!selected.some(s=>p.start<=s.end&&p.end>=s.start))selected.push(p);
  return selected.sort((a,b)=>a.start.localeCompare(b.start));
}

export function holidayIcs(year) {
  if(!BUSINESS_YEARS.includes(year))return null;
  const escape=value=>String(value).replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
  const compact=date=>date.replaceAll('-','');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//keisantool.com//Japan Holidays//JA','CALSCALE:GREGORIAN',`X-WR-CALNAME:${year}年 日本の祝日・休日`];
  for(const h of holidays(year)){
    const next=new Date(Date.parse(h.date+'T00:00:00Z')+86400000).toISOString().slice(0,10);
    lines.push('BEGIN:VEVENT',`UID:holiday-${compact(h.date)}@keisantool.com`,`DTSTAMP:${compact(OFFICE_REVIEWED)}T000000Z`,`DTSTART;VALUE=DATE:${compact(h.date)}`,`DTEND;VALUE=DATE:${compact(next)}`,`SUMMARY:${escape(h.name)}`,'TRANSP:TRANSPARENT',`URL:https://keisantool.com/shukujitsu/${year}/`,'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  // RFC 5545: fold by UTF-8 bytes without splitting a character.
  return lines.map(line=>{let out='',part='';for(const char of line){if(new TextEncoder().encode(part+char).length>75){out+=part+'\r\n';part=' ';}part+=char;}return out+part;}).join('\r\n')+'\r\n';
}
