import { describe, it, expect } from 'vitest';
import { hinodeIri, listCities } from '../src/lib/hinodeiri.js';

// アンカーデータ出典：国立天文台暦計算室「日の出入り＠東京」
// https://eco.mtk.nao.ac.jp/koyomi/dni/2026/s1301.html （1月）
// https://eco.mtk.nao.ac.jp/koyomi/dni/2026/s1307.html （7月）
// 採用したNOAA式（低精度太陽位置式）は公表値と ±1分程度で一致することを確認済み。
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

describe('hinodeIri（日の出・日の入り計算・国立天文台実測値との突き合わせ）', () => {
  it.each([
    [2026, 1, 1, '06:51', '16:38'],
    [2026, 1, 15, '06:50', '16:51'],
    [2026, 1, 31, '06:42', '17:07'],
    [2026, 7, 1, '04:29', '19:01'],
  ])('%i-%i-%i 東京：日の出%s・日の入り%s（±1分許容）', (y, m, d, expSunrise, expSunset) => {
    const r = hinodeIri(y, m, d, 'tokyo');
    expect(Math.abs(toMinutes(r.sunrise) - toMinutes(expSunrise))).toBeLessThanOrEqual(1);
    expect(Math.abs(toMinutes(r.sunset) - toMinutes(expSunset))).toBeLessThanOrEqual(1);
  });

  it('冬より夏のほうが昼の長さが長い（東京）', () => {
    const winter = hinodeIri(2026, 1, 1, 'tokyo');
    const summer = hinodeIri(2026, 7, 1, 'tokyo');
    expect(summer.dayLengthMinutes).toBeGreaterThan(winter.dayLengthMinutes);
  });

  it('同じ日でも高緯度（稚内）は低緯度（那覇）より夏至に近い時期の昼が長い', () => {
    const wakkanai = hinodeIri(2026, 7, 1, 'wakkanai');
    const naha = hinodeIri(2026, 7, 1, 'naha');
    expect(wakkanai.dayLengthMinutes).toBeGreaterThan(naha.dayLengthMinutes);
  });

  it('都市名を含む結果を返す', () => {
    expect(hinodeIri(2026, 7, 1, 'osaka').city).toBe('大阪');
  });

  it('不正な都市・日付は null', () => {
    expect(hinodeIri(2026, 7, 1, 'nowhere')).toBeNull();
    expect(hinodeIri(2026, 2, 30, 'tokyo')).toBeNull();
    expect(hinodeIri('x', 7, 1, 'tokyo')).toBeNull();
  });
});

describe('listCities（都市一覧）', () => {
  it('東京・大阪・札幌・福岡・那覇を含む', () => {
    const ids = listCities().map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(['tokyo', 'osaka', 'sapporo', 'fukuoka', 'naha']));
  });

  it('id と name のみを持つ（緯度経度は非公開）', () => {
    for (const c of listCities()) {
      expect(Object.keys(c).sort()).toEqual(['id', 'name']);
    }
  });
});
