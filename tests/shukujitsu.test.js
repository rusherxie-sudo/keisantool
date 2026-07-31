import { describe, it, expect } from 'vitest';
import {
  shunbunDay,
  shubunDay,
  baseHolidays,
  holidays,
  renkyuList,
  calendarMonths,
  officialHolidayYearLimit,
} from '../src/lib/shukujitsu.js';

// アンカーデータ出典：内閣府「国民の祝日について」(cao.go.jp/chosei/shukujitsu/gaiyou.html)、
// 国立天文台暦計算室の暦要項。2024〜2027年の実際の祝日・振替休日・国民の休日を
// 丸ごと突き合わせる（部分一致ではなく年間の集合を厳密比較）。
describe('shunbunDay/shubunDay（春分の日・秋分の日の近似式）', () => {
  it.each([
    [2024, 20, 22],
    [2025, 20, 23],
    [2026, 20, 23],
    [2027, 21, 23],
  ])('%i年：春分3/%i、秋分9/%i', (year, shun, shu) => {
    expect(shunbunDay(year)).toBe(shun);
    expect(shubunDay(year)).toBe(shu);
  });
});

describe('baseHolidays（振替休日・国民の休日を適用する前の基本祝日）', () => {
  it('2026年は16件（固定10+ハッピーマンデー4+春分・秋分2）', () => {
    expect(baseHolidays(2026)).toHaveLength(16);
  });

  it('不正な年は空配列', () => {
    expect(baseHolidays('x')).toEqual([]);
  });
});

describe('holidays（振替休日・国民の休日を適用した最終的な祝日一覧）', () => {
  it('2024年：内閣府公表の全21件と完全一致', () => {
    const rows = holidays(2024).map((h) => `${h.date}:${h.name}`);
    expect(rows.sort()).toEqual(
      [
        '2024-01-01:元日',
        '2024-01-08:成人の日',
        '2024-02-11:建国記念の日',
        '2024-02-12:振替休日',
        '2024-02-23:天皇誕生日',
        '2024-03-20:春分の日',
        '2024-04-29:昭和の日',
        '2024-05-03:憲法記念日',
        '2024-05-04:みどりの日',
        '2024-05-05:こどもの日',
        '2024-05-06:振替休日',
        '2024-07-15:海の日',
        '2024-08-11:山の日',
        '2024-08-12:振替休日',
        '2024-09-16:敬老の日',
        '2024-09-22:秋分の日',
        '2024-09-23:振替休日',
        '2024-10-14:スポーツの日',
        '2024-11-03:文化の日',
        '2024-11-04:振替休日',
        '2024-11-23:勤労感謝の日',
      ].sort()
    );
  });

  it('2025年：内閣府公表の全19件と完全一致（みどりの日が日曜→こどもの日も祝日のため振替は5/6にスライド）', () => {
    const rows = holidays(2025).map((h) => `${h.date}:${h.name}`);
    expect(rows.sort()).toEqual(
      [
        '2025-01-01:元日',
        '2025-01-13:成人の日',
        '2025-02-11:建国記念の日',
        '2025-02-23:天皇誕生日',
        '2025-02-24:振替休日',
        '2025-03-20:春分の日',
        '2025-04-29:昭和の日',
        '2025-05-03:憲法記念日',
        '2025-05-04:みどりの日',
        '2025-05-05:こどもの日',
        '2025-05-06:振替休日',
        '2025-07-21:海の日',
        '2025-08-11:山の日',
        '2025-09-15:敬老の日',
        '2025-09-23:秋分の日',
        '2025-10-13:スポーツの日',
        '2025-11-03:文化の日',
        '2025-11-23:勤労感謝の日',
        '2025-11-24:振替休日',
      ].sort()
    );
  });

  it('2026年：内閣府公表の全18件と完全一致（憲法記念日が日曜→振替休日は5/6にスライド、敬老の日と秋分の日に挟まれた9/22が国民の休日）', () => {
    // 2026-05-06 の振替休日は複数の独立ソースで確認済み：
    // JR東日本メディア(media.jreast.co.jp/articles/3016)、JPX公式Xポスト、9rando.info。
    // 5/3(憲法記念日)が日曜のため、既に祝日の5/4(みどりの日)・5/5(こどもの日)を
    // 飛び越して5/6(水)が振替休日になる。
    const rows = holidays(2026).map((h) => `${h.date}:${h.name}`);
    expect(rows.sort()).toEqual(
      [
        '2026-01-01:元日',
        '2026-01-12:成人の日',
        '2026-02-11:建国記念の日',
        '2026-02-23:天皇誕生日',
        '2026-03-20:春分の日',
        '2026-04-29:昭和の日',
        '2026-05-03:憲法記念日',
        '2026-05-04:みどりの日',
        '2026-05-05:こどもの日',
        '2026-05-06:振替休日',
        '2026-07-20:海の日',
        '2026-08-11:山の日',
        '2026-09-21:敬老の日',
        '2026-09-22:国民の休日',
        '2026-09-23:秋分の日',
        '2026-10-12:スポーツの日',
        '2026-11-03:文化の日',
        '2026-11-23:勤労感謝の日',
      ].sort()
    );
    const kokumin = holidays(2026).find((h) => h.date === '2026-09-22');
    expect(kokumin.kind).toBe('kokumin');
  });

  it('2027年：内閣府公表の全17件と完全一致（春分の日が日曜→振替休日3/22）', () => {
    const rows = holidays(2027).map((h) => `${h.date}:${h.name}`);
    expect(rows.sort()).toEqual(
      [
        '2027-01-01:元日',
        '2027-01-11:成人の日',
        '2027-02-11:建国記念の日',
        '2027-02-23:天皇誕生日',
        '2027-03-21:春分の日',
        '2027-03-22:振替休日',
        '2027-04-29:昭和の日',
        '2027-05-03:憲法記念日',
        '2027-05-04:みどりの日',
        '2027-05-05:こどもの日',
        '2027-07-19:海の日',
        '2027-08-11:山の日',
        '2027-09-20:敬老の日',
        '2027-09-23:秋分の日',
        '2027-10-11:スポーツの日',
        '2027-11-03:文化の日',
        '2027-11-23:勤労感謝の日',
      ].sort()
    );
  });

  it('日付昇順で返す', () => {
    const rows = holidays(2026);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].date >= rows[i - 1].date).toBe(true);
    }
  });

  it('不正な年は空配列', () => {
    expect(holidays(null)).toEqual([]);
  });
});

describe('renkyuList（3連休以上の抽出）', () => {
  it('2026年9月：敬老の日(9/21・月)〜秋分の日(9/23・水)は国民の休日を挟んで5連休', () => {
    const list = renkyuList(2026);
    const sep = list.find((r) => r.from === '2026-09-19');
    expect(sep).toBeTruthy();
    expect(sep.to).toBe('2026-09-23');
    expect(sep.length).toBe(5);
    expect(sep.holidayNames).toEqual(expect.arrayContaining(['敬老の日', '国民の休日', '秋分の日']));
  });

  it('すべての連休は3日以上である', () => {
    const list = renkyuList(2026);
    for (const r of list) expect(r.length).toBeGreaterThanOrEqual(3);
  });

  it('不正な年は空配列', () => {
    expect(renkyuList('x')).toEqual([]);
  });
});

describe('calendarMonths（年間カレンダー表示用データ）', () => {
  it('2028年の12か月を日曜始まり・各6週で返す', () => {
    const months = calendarMonths(2028);
    expect(months).toHaveLength(12);
    expect(months.map((month) => month.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const month of months) {
      expect(month.weeks).toHaveLength(6);
      for (const week of month.weeks) expect(week).toHaveLength(7);
    }
  });

  it('月外セルをnullにし、祝日名と区分を同じセルに載せる', () => {
    const january = calendarMonths(2028)[0];
    expect(january.weeks[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(january.weeks[0][6]).toMatchObject({
      date: '2028-01-01',
      day: 1,
      weekday: 6,
      holidayName: '元日',
      holidayKind: 'holiday',
    });

    const may3 = calendarMonths(2028)[4].weeks.flat().find((cell) => cell?.day === 3);
    expect(may3).toMatchObject({ date: '2028-05-03', holidayName: '憲法記念日' });
  });

  it('返却値を変更しても次の呼び出しへ影響しない', () => {
    const first = calendarMonths(2028);
    first[0].weeks[0][6].holidayName = '変更';
    expect(calendarMonths(2028)[0].weeks[0][6].holidayName).toBe('元日');
  });

  it('不正な年は空配列', () => {
    expect(calendarMonths('x')).toEqual([]);
  });
});

describe('officialHolidayYearLimit（正式発表済みの最終年）', () => {
  it('2月1日より前は当年まで、2月1日以降は翌年まで', () => {
    expect(officialHolidayYearLimit('2026-01-31')).toBe(2026);
    expect(officialHolidayYearLimit('2026-02-01')).toBe(2027);
    expect(officialHolidayYearLimit('2026-12-31')).toBe(2027);
  });

  it('不正な日付はnull', () => {
    expect(officialHolidayYearLimit('invalid')).toBeNull();
  });
});
