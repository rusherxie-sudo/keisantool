import { mkdirSync, writeFileSync } from 'node:fs';
import { workYear, holidayIcs, OFFICE_SOURCE, OFFICE_REVIEWED } from '../src/lib/office-calendar.js';
import { holidays } from '../src/lib/shukujitsu.js';
import { csvText } from '../src/lib/office-tools.js';
import reference from '../src/data/office-holiday-reference.json' with { type:'json' };
mkdirSync('public/downloads',{recursive:true});
for(const year of [2026,2027]){
  const actual=holidays(year).map(h=>h.date), expected=reference.years[year].map(h=>h.date);
  if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error(`${year}: public holiday dates do not match verified source`);
  const data=workYear(year);
  const rows=data.days.map(d=>({date:d.date,weekday:d.weekday,holiday:d.holiday,isBusinessDay:d.working}));
  const payload={year,source:OFFICE_SOURCE,reviewed:OFFICE_REVIEWED,definition:'Monday–Friday excluding Japanese public holidays; company and bank year-end closures are not included.',businessDays:data.businessDays,offDays:data.offDays,months:data.months.map(m=>({month:m.month,businessDays:m.businessDays,calendarDays:m.calendarDays})),days:rows};
  writeFileSync(`public/downloads/work-calendar-${year}.json`,JSON.stringify(payload,null,2)+'\n');
  writeFileSync(`public/downloads/work-calendar-${year}.csv`,csvText([['日付','曜日','区分','祝日名'],...data.days.map(d=>[d.date,'日月火水木金土'[d.weekday],d.working?'営業日':'休日',d.holiday])]));
  writeFileSync(`public/downloads/holidays-${year}.ics`,holidayIcs(year));
}
console.log('Work calendar: 2 verified years, CSV/JSON/ICS generated.');
