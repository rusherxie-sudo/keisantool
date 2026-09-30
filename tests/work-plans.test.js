import {describe,it,expect} from 'vitest';
import {retirementLeavePlan as retire,holidayPlan as plan} from '../src/lib/work-plans.js';
describe('work plans',()=>{
 it('includes the retirement date and excludes weekends',()=>{
  const r=retire('2026-10-30',5);expect(r.firstLeave).toBe('2026-10-26');expect(r.lastWork).toBe('2026-10-23');expect(r.leaveDates).toHaveLength(5);
 });
 it('excludes national and company holidays without double counting',()=>{
  const r=retire('2026-11-06',5,[1,2,3,4,5],['2026-11-04']);expect(r.firstLeave).toBe('2026-10-29');expect(r.lastWork).toBe('2026-10-28');expect(r.leaveDates).not.toContain('2026-11-03');expect(r.leaveDates).not.toContain('2026-11-04');
 });
 it('weekend retirement, zero balance and part-time weekdays',()=>{
  expect(retire('2026-10-31',0).lastWork).toBe('2026-10-30');
  const r=retire('2026-10-31',2,[1,3,5]);expect(r.leaveDates).toEqual(['2026-10-28','2026-10-30']);expect(r.lastWork).toBe('2026-10-26');
 });
 it('cross-year company shutdown is distinct from public holidays',()=>{
  const extra=['2026-12-29','2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03'];
  const r=plan('2026-12-26','2027-01-05',[1,2,3,4,5],extra);expect(r.workingDays).toBe(3);expect(r.offDays).toBe(8);
 });
 it('keeps the full calendar for a long leave balance',()=>{const r=retire('2027-12-31',120);expect(r.leaveDates).toHaveLength(120);expect(r.days.length).toBeGreaterThan(120);expect(r.days.filter(d=>d.working)).toHaveLength(120);});
 it('rejects invalid, reversed, oversized and insufficient supported periods',()=>{
  expect(plan('2026-02-30','2026-03-01')).toBeNull();expect(plan('2026-03-01','2026-02-01')).toBeNull();expect(plan('2026-01-01','2026-12-31')).toBeNull();expect(retire('2026-01-05',20)).toBeNull();expect(retire('2026-10-30',1.5)).toBeNull();expect(retire('2026-10-30',5,[])).toBeNull();expect(retire('2026-10-30',5,[1],['<script>'])).toBeNull();
 });
});
