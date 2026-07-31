import { describe, expect, it } from 'vitest';
import {
  parseClock,
  formatDuration,
  workDuration,
  shiftClock,
  durationArithmetic,
  durationToDecimal,
  decimalToDuration,
} from '../src/lib/jikan.js';

describe('parseClock', () => {
  it('时刻转换为当天经过分钟数', () => {
    expect(parseClock('00:00')).toBe(0);
    expect(parseClock('7:05')).toBe(425);
    expect(parseClock('23:59')).toBe(1439);
  });

  it('拒绝超出一天范围或格式错误的时刻', () => {
    expect(parseClock('24:00')).toBeNull();
    expect(parseClock('12:60')).toBeNull();
    expect(parseClock('')).toBeNull();
    expect(parseClock('noon')).toBeNull();
  });
});

describe('formatDuration', () => {
  it('把分钟规范化为日、小时、分钟', () => {
    expect(formatDuration(0)).toBe('0分');
    expect(formatDuration(75)).toBe('1時間15分');
    expect(formatDuration(1500)).toBe('1日1時間');
    expect(formatDuration(1501)).toBe('1日1時間1分');
  });

  it('负持续时间保留符号', () => {
    expect(formatDuration(-75)).toBe('−1時間15分');
  });
});

describe('workDuration', () => {
  it('同日工作时间扣除休息', () => {
    expect(workDuration('09:00', '17:30', 60)).toEqual({
      grossMinutes: 510,
      breakMinutes: 60,
      netMinutes: 450,
      decimalHours: 7.5,
    });
  });

  it('跨午夜工作时间正确进位', () => {
    expect(workDuration('22:00', '06:00', 60, true)).toEqual({
      grossMinutes: 480,
      breakMinutes: 60,
      netMinutes: 420,
      decimalHours: 7,
    });
  });

  it('相同时刻可分别表示0小时或跨日24小时', () => {
    expect(workDuration('09:00', '09:00', 0).netMinutes).toBe(0);
    expect(workDuration('09:00', '09:00', 0, true).netMinutes).toBe(1440);
  });

  it('未指定翌日时拒绝倒序时刻', () => {
    expect(workDuration('22:00', '06:00', 0, false)).toBeNull();
  });

  it('拒绝休息超过拘束时间及无效输入', () => {
    expect(workDuration('09:00', '10:00', 61)).toBeNull();
    expect(workDuration('09:00', '10:00', -1)).toBeNull();
    expect(workDuration('09:00', '25:00', 0)).toBeNull();
  });
});

describe('shiftClock', () => {
  it('时刻加法支持跨到翌日', () => {
    expect(shiftClock('21:50', 2, 30, 'add')).toEqual({
      clock: '00:20',
      dayOffset: 1,
      offsetMinutes: 150,
    });
  });

  it('时刻减法支持跨到前日', () => {
    expect(shiftClock('01:00', 2, 30, 'subtract')).toEqual({
      clock: '22:30',
      dayOffset: -1,
      offsetMinutes: -150,
    });
  });

  it('超过24小时会返回完整日偏移', () => {
    expect(shiftClock('10:15', 50, 0, 'add')).toEqual({
      clock: '12:15',
      dayOffset: 2,
      offsetMinutes: 3000,
    });
  });

  it('拒绝负数、非整数和未知运算', () => {
    expect(shiftClock('10:00', -1, 0, 'add')).toBeNull();
    expect(shiftClock('10:00', 1.5, 0, 'add')).toBeNull();
    expect(shiftClock('10:00', 1, 0, 'multiply')).toBeNull();
  });
});

describe('durationArithmetic', () => {
  it('时间相加并完成60进位', () => {
    expect(durationArithmetic(1, 45, 'add', 2, 30)).toEqual({
      totalMinutes: 255,
      decimalHours: 4.25,
    });
  });

  it('时间相减允许负结果', () => {
    expect(durationArithmetic(2, 0, 'subtract', 3, 15)).toEqual({
      totalMinutes: -75,
      decimalHours: -1.25,
    });
  });

  it('分钟可超过59并统一规范化', () => {
    expect(durationArithmetic(1, 15, 'subtract', 0, 75).totalMinutes).toBe(0);
  });

  it('拒绝负数、非整数和未知运算', () => {
    expect(durationArithmetic(-1, 0, 'add', 1, 0)).toBeNull();
    expect(durationArithmetic(1, 0.5, 'add', 1, 0)).toBeNull();
    expect(durationArithmetic(1, 0, 'divide', 1, 0)).toBeNull();
  });
});

describe('十进制小时换算', () => {
  it('小时分钟转换为十进制小时', () => {
    expect(durationToDecimal(7, 30)).toEqual({ totalMinutes: 450, decimalHours: 7.5 });
    expect(durationToDecimal(1, 20)).toEqual({ totalMinutes: 80, decimalHours: 80 / 60 });
  });

  it('十进制小时四舍五入到最接近的分钟', () => {
    expect(decimalToDuration(7.5)).toEqual({ totalMinutes: 450, hours: 7, minutes: 30 });
    expect(decimalToDuration(1.999)).toEqual({ totalMinutes: 120, hours: 2, minutes: 0 });
  });

  it('拒绝负数和非有限值', () => {
    expect(durationToDecimal(-1, 0)).toBeNull();
    expect(decimalToDuration(-0.1)).toBeNull();
    expect(decimalToDuration(Infinity)).toBeNull();
  });
});
