import { describe, it, expect } from 'vitest';
import reference from '../src/data/office-holiday-reference.json';
import { holidays } from '../src/lib/shukujitsu.js';
import { workYear, leavePlans, holidayIcs, publishedWorkMonths, monthPath } from '../src/lib/office-calendar.js';

describe('official office calendar data',()=>{
  it.each([2026,2027])('matches all Cabinet Office published holiday dates in %i',year=>{
    expect(holidays(year).map(h=>h.date)).toEqual(reference.years[year].map(h=>h.date));
  });
  it('counts weekends and holiday overlaps only once',()=>{
    expect(workYear(2026).businessDays).toBe(244);
    const y=workYear(2027);expect(y.businessDays).toBe(245);expect(y.offDays).toBe(120);expect(y.days).toHaveLength(365);
    expect(y.months[2].businessDays).toBe(22); // March 21 Sunday, March 22 substitute holiday.
    expect(y.months[4].businessDays).toBe(18);expect(y.months[8].businessDays).toBe(20);
    expect(y.days.find(d=>d.date==='2027-12-31').working).toBe(true); // No implicit company/bank closure.
    expect(workYear(2028)).toBeNull();
  });
  it('publishes a fixed, retained set of 15 monthly routes',()=>{
    expect(publishedWorkMonths).toHaveLength(15);
    expect(monthPath(2026,9)).toBe('/eigyoubi/2026/');
    expect(monthPath(2027,5)).toBe('/eigyoubi/2027/05/');
  });
});
describe('leave bridge plans',()=>{
  it('uses 1 leave day for April 29–May 5, 2027',()=>{
    const p=leavePlans(2027,1).find(p=>p.start==='2027-04-29');
    expect(p.end).toBe('2027-05-05');expect(p.length).toBe(7);expect(p.leaveDates).toEqual(['2027-04-30']);
  });
  it('uses 3 leave days for the 11-day Golden Week example',()=>{
    const p=leavePlans(2027,3).find(p=>p.start==='2027-04-29');
    expect(p.end).toBe('2027-05-09');expect(p.length).toBe(11);expect(p.leaveDates).toEqual(['2027-04-30','2027-05-06','2027-05-07']);
  });
  it('never labels weekends or official holidays as required leave',()=>{
    const days=new Map(workYear(2027).days.map(d=>[d.date,d]));
    for(const budget of [0,1,2,3])for(const p of leavePlans(2027,budget)){
      expect(p.leaveDates.length).toBeLessThanOrEqual(budget);
      expect(p.leaveDates.every(date=>days.get(date).working)).toBe(true);
      expect(p.holidays.length).toBeGreaterThan(0);
      expect(p.length).toBe((Date.parse(p.end)-Date.parse(p.start))/86400000+1);
      expect(p.start.slice(0,4)).toBe('2027');expect(p.end.slice(0,4)).toBe('2027');
    }
    expect(leavePlans(2027,4)).toEqual([]);expect(leavePlans(2028,1)).toEqual([]);
  });
});
describe('calendar download',()=>{
  it('creates 17 all-day events with exclusive end dates, stable IDs and CRLF',()=>{
    const ics=holidayIcs(2027);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(17);
    expect(ics).toContain('DTSTART;VALUE=DATE:20270101\r\nDTEND;VALUE=DATE:20270102');
    expect(ics).toContain('UID:holiday-20270101@keisantool.com');
    expect(ics).toContain('DTSTART;VALUE=DATE:20270322');
    for(const line of ics.split('\r\n'))expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
  });
});

// New URL families must retain useful source dates and stay separate from embeds.
import { sourceFileForUrl, sourceFilesForUrl } from '../src/lib/lastmod.js';
import { shouldIncludeInSitemap } from '../src/lib/sitemap.js';
import { join } from 'node:path';
it('maps annual and monthly sources and excludes the calendar embed from sitemap',()=>{
  const pages=join(process.cwd(),'src/pages');
  expect(sourceFileForUrl(pages,'eigyoubi/2027')).toBe(join(pages,'eigyoubi/[year]/index.astro'));
  expect(sourceFileForUrl(pages,'eigyoubi/2027/05')).toBe(join(pages,'eigyoubi/[year]/[month].astro'));
  expect(sourceFilesForUrl(pages,'eigyoubi/2027/05')).toContain(join(process.cwd(),'src/lib/shukujitsu.js'));
  expect(sourceFilesForUrl(pages,'renkyu/2027')).toContain(join(process.cwd(),'src/lib/office-calendar.js'));
  expect(shouldIncludeInSitemap('https://keisantool.com/embed/work-calendar/')).toBe(false);
  expect(shouldIncludeInSitemap('https://keisantool.com/eigyoubi/2027/05/')).toBe(true);
});
