import { describe, it, expect } from 'vitest';
import {
  NATIONAL_WEIGHTED_AVERAGE,
  NATIONAL_WAGE_GUIDELINE_2026,
  MINIMUM_WAGE_DATA,
  minimumWagePrefectures,
  getMinimumWage,
  getMinimumWageInfo,
  dailyWage,
  monthlyWage,
  yearlyWage,
  calcSaitei,
  getAllPrefectures,
  overtimeWage,
  monthlyHourlyEquivalent,
  checkMonthlyWage,
  getMinimumWageHistory,
  getMinimumWageCities,
} from '../src/lib/saitei.js';

// 令和8年度（2026年度）の地方最低賃金審議会答申。
// 各金額・増額は地方労働局発表または複数の報道で確認済み（2026-08-28時点）。
// proposedSource は一次情報（労働局/審議会/主要報道）を1件ずつ保持する。
const CONFIRMED_ANSWERS = [
  ['wakayama', 1045, 1101, 56, '2026-08-10'],
  ['toyama', 1062, 1119, 57, '2026-08-05'],
  ['fukui', 1053, 1112, 59, '2026-08-10'],
  ['miyazaki', 1023, 1085, 62, '2026-08-25'],
  ['ibaraki', 1074, 1136, 62, '2026-08-24'],
  ['tokyo', 1226, 1280, 54, '2026-08-05'],
  ['kanagawa', 1225, 1279, 54, '2026-08-04'],
  ['osaka', 1177, 1231, 54, '2026-08-05'],
  ['saitama', 1141, 1196, 55, '2026-08-05'],
  ['chiba', 1140, 1195, 55, '2026-08-05'],
  ['aichi', 1140, 1195, 55, '2026-08-05'],
  ['hyogo', 1116, 1172, 56, '2026-08-04'],
  ['kyoto', 1122, 1180, 58, '2026-08-20'],
  ['shizuoka', 1097, 1154, 57, '2026-08-12'],
  ['mie', 1087, 1143, 56, '2026-08-05'],
  ['hiroshima', 1085, 1141, 56, '2026-08-17'],
  ['shiga', 1080, 1136, 56, '2026-08-07'],
  ['hokkaido', 1075, 1131, 56, '2026-08-05'],
  ['gifu', 1065, 1121, 56, '2026-08-05'],
  ['nagano', 1061, 1117, 56, '2026-08-06'],
  ['ishikawa', 1054, 1113, 59, '2026-08-07'],
  ['niigata', 1050, 1108, 58, '2026-08-05'],
  ['miyagi', 1038, 1098, 60, '2026-08-05'],
  ['fukushima', 1033, 1094, 61, '2026-08-20'],
  ['shimane', 1033, 1092, 59, '2026-08-14'],
  ['akita', 1031, 1090, 59, '2026-08-18'],
  ['aomori', 1029, 1090, 61, '2026-08-26'],
  ['tottori', 1030, 1090, 60, '2026-08-07'],
  ['kagawa', 1036, 1092, 56, '2026-08-05'],
  ['yamaguchi', 1043, 1101, 58, '2026-08-12'],
  ['okayama', 1047, 1104, 57, '2026-08-05'],
  ['tokushima', 1046, 1103, 57, '2026-08-23'],
  ['nara', 1051, 1107, 56, '2026-08-10'],
  ['tochigi', 1068, 1125, 57, '2026-08-05'],
  ['gunma', 1063, 1120, 57, '2026-08-06'],
  ['yamagata', 1032, 1092, 60, '2026-08-27'],
  ['fukuoka', 1057, 1114, 57, '2026-08-10'],
  ['kagoshima', 1026, 1090, 64, '2026-08-26'],
  ['ehime', 1033, 1093, 60, '2026-08-21'],
];

// 2026-08-28時点で答申額を確認できていない地域（審議中または未確認）。
// 金額を推定・予測として書き込んではならない。
const NOT_YET_CONFIRMED = [
  'iwate', 'yamanashi', 'saga', 'nagasaki', 'kumamoto', 'oita', 'okinawa', 'kochi',
];

describe('令和7年度の地域別最低賃金データ', () => {
  it('確認済みの令和8年度地方答申額を現行額と分けて保持する', () => {
    for (const [slug, wage, proposedWage, proposedIncrease, proposedDate] of CONFIRMED_ANSWERS) {
      expect(getMinimumWageInfo(slug)).toMatchObject({ wage, proposedWage, proposedIncrease, proposedDate });
    }
    for (const slug of NOT_YET_CONFIRMED) {
      expect(getMinimumWageInfo(slug)).not.toHaveProperty('proposedWage');
    }
  });

  it('令和8年度の中央目安ベース全国加重平均を保持する', () => {
    expect(NATIONAL_WAGE_GUIDELINE_2026).toBe(1176);
  });

  it('47都道府県を一意なslugと発効日つきで返す', () => {
    const rows = minimumWagePrefectures();
    expect(rows).toHaveLength(47);
    expect(new Set(rows.map((row) => row.prefecture)).size).toBe(47);
    expect(new Set(rows.map((row) => row.slug)).size).toBe(47);
    expect(rows.every((row) => /^202[56]-\d{2}-\d{2}$/.test(row.effectiveDate))).toBe(true);
  });

  it('厚生労働省の主要地域と遅い発効日の公表値に一致する', () => {
    expect(getMinimumWageInfo('東京都')).toMatchObject({
      prefecture: '東京都', slug: 'tokyo', wage: 1226, effectiveDate: '2025-10-03',
    });
    expect(getMinimumWageInfo('大阪府').wage).toBe(1177);
    expect(getMinimumWageInfo('神奈川県').wage).toBe(1225);
    expect(getMinimumWageInfo('秋田県').effectiveDate).toBe('2026-03-31');
    expect(getMinimumWageInfo('群馬県').effectiveDate).toBe('2026-03-01');
    expect(NATIONAL_WEIGHTED_AVERAGE).toBe(1121);
  });

  it('厚生労働省の47都道府県一覧を金額・発効日ごと固定する', () => {
    const official = [
      '北海道:1075:2025-10-04', '青森県:1029:2025-11-21', '岩手県:1031:2025-12-01',
      '宮城県:1038:2025-10-04', '秋田県:1031:2026-03-31', '山形県:1032:2025-12-23',
      '福島県:1033:2026-01-01', '茨城県:1074:2025-10-12', '栃木県:1068:2025-10-01',
      '群馬県:1063:2026-03-01', '埼玉県:1141:2025-11-01', '千葉県:1140:2025-10-03',
      '東京都:1226:2025-10-03', '神奈川県:1225:2025-10-04', '新潟県:1050:2025-10-02',
      '富山県:1062:2025-10-12', '石川県:1054:2025-10-08', '福井県:1053:2025-10-08',
      '山梨県:1052:2025-12-01', '長野県:1061:2025-10-03', '岐阜県:1065:2025-10-18',
      '静岡県:1097:2025-11-01', '愛知県:1140:2025-10-18', '三重県:1087:2025-11-21',
      '滋賀県:1080:2025-10-05', '京都府:1122:2025-11-21', '大阪府:1177:2025-10-16',
      '兵庫県:1116:2025-10-04', '奈良県:1051:2025-11-16', '和歌山県:1045:2025-11-01',
      '鳥取県:1030:2025-10-04', '島根県:1033:2025-11-17', '岡山県:1047:2025-12-01',
      '広島県:1085:2025-11-01', '山口県:1043:2025-10-16', '徳島県:1046:2026-01-01',
      '香川県:1036:2025-10-18', '愛媛県:1033:2025-12-01', '高知県:1023:2025-12-01',
      '福岡県:1057:2025-11-16', '佐賀県:1030:2025-11-21', '長崎県:1031:2025-12-01',
      '熊本県:1034:2026-01-01', '大分県:1035:2026-01-01', '宮崎県:1023:2025-11-16',
      '鹿児島県:1026:2025-11-01', '沖縄県:1023:2025-12-01',
    ];
    expect(minimumWagePrefectures().map(({ prefecture, wage, effectiveDate }) => (
      `${prefecture}:${wage}:${effectiveDate}`
    ))).toEqual(official);
  });

  it('最高額は東京1226円、最低額は1023円の3県', () => {
    const rows = minimumWagePrefectures();
    expect(Math.max(...rows.map((row) => row.wage))).toBe(1226);
    expect(rows.filter((row) => row.wage === 1023).map((row) => row.prefecture)).toEqual([
      '高知県', '宮崎県', '沖縄県',
    ]);
  });

  it('呼び出し側で変更しても内部データを汚染しない', () => {
    const rows = minimumWagePrefectures();
    rows[0].wage = 1;
    expect(minimumWagePrefectures()[0].wage).toBe(1075);
  });

  it('互換用データも47地域の正確な時給を持つ', () => {
    expect(Object.keys(MINIMUM_WAGE_DATA)).toHaveLength(47);
    expect(MINIMUM_WAGE_DATA['北海道']).toBe(1075);
    expect(MINIMUM_WAGE_DATA['福岡県']).toBe(1057);
  });
});

describe('地域別最低賃金の取得', () => {
  it('東京都は1226円', () => expect(getMinimumWage('東京都')).toBe(1226));
  it('北海道は1075円', () => expect(getMinimumWage('北海道')).toBe(1075));
  it('存在しない地域はnull', () => expect(getMinimumWage('不明')).toBeNull());
  it('slugからも情報を取得できる', () => expect(getMinimumWageInfo('fukuoka').prefecture).toBe('福岡県'));
});

describe('最低賃金の推移と主要都市', () => {
  it('検索需要の大きい地域は令和2〜7年度の公式推移を返す', () => {
    expect(getMinimumWageHistory('tokyo')).toEqual([
      { fiscalYear: 2020, wage: 1013 },
      { fiscalYear: 2021, wage: 1041 },
      { fiscalYear: 2022, wage: 1072 },
      { fiscalYear: 2023, wage: 1113 },
      { fiscalYear: 2024, wage: 1163 },
      { fiscalYear: 2025, wage: 1226 },
    ]);
    expect(getMinimumWageHistory('大阪府').map((row) => row.wage)).toEqual([
      964, 992, 1023, 1064, 1114, 1177,
    ]);
    expect(getMinimumWageHistory('北海道').map((row) => row.wage)).toEqual([
      861, 889, 920, 960, 1010, 1075,
    ]);
  });

  it('返却値を変更しても履歴データを汚染しない', () => {
    const history = getMinimumWageHistory('tokyo');
    history[0].wage = 1;
    expect(getMinimumWageHistory('tokyo')[0].wage).toBe(1013);
  });

  it('都道府県額が適用される主要都市を返す', () => {
    expect(getMinimumWageCities('osaka')).toEqual(['大阪市', '堺市', '東大阪市']);
    expect(getMinimumWageCities('愛知県')).toEqual(['名古屋市', '豊田市', '岡崎市']);
    expect(getMinimumWageCities('不明')).toEqual([]);
  });
});

describe('最低賃金から日給・月給・年給を計算', () => {
  it('東京都、8時間の日給は9808円', () => expect(dailyWage('東京都', 8)).toBe(1226 * 8));
  it('小数時間の金額は切り捨てる', () => expect(dailyWage('東京都', 7.25)).toBe(Math.floor(1226 * 7.25)));
  it('無効な地域・時間は0', () => {
    expect(dailyWage('不明', 8)).toBe(0);
    expect(dailyWage('東京都', -1)).toBe(0);
  });
  it('月給と年給を整数円で計算する', () => {
    expect(monthlyWage('東京都', 8, 22)).toBe(1226 * 8 * 22);
    expect(yearlyWage('東京都', 8, 22)).toBe(1226 * 8 * 22 * 12);
  });
  it('集計結果に発効日を含める', () => {
    expect(calcSaitei('東京都', 8, 22)).toMatchObject({
      prefecture: '東京都', hourlyWage: 1226, effectiveDate: '2025-10-03',
      dailyWage: 9808, monthlyWage: 215776, yearlyWage: 2589312,
    });
  });
  it('全地域名を公式順で返す', () => {
    const prefectures = getAllPrefectures();
    expect(prefectures).toHaveLength(47);
    expect(prefectures[0]).toBe('北海道');
    expect(prefectures.at(-1)).toBe('沖縄県');
  });
});

describe('月給制の最低賃金チェック', () => {
  it('厚生労働省例：18万円×12÷(250日×8時間)=1080円', () => {
    expect(monthlyHourlyEquivalent(180000, 250, 8)).toBe(1080);
  });
  it('東京で月給22万円は最低賃金以上、20万円は未満', () => {
    expect(checkMonthlyWage('東京都', 220000, 250, 8)).toMatchObject({
      minimumWage: 1226,
      hourlyEquivalent: 1320,
      meetsMinimum: true,
    });
    expect(checkMonthlyWage('東京都', 200000, 250, 8).meetsMinimum).toBe(false);
  });
  it('境界値は最低賃金以上として判定する', () => {
    expect(checkMonthlyWage('東京都', 1226 * 2000 / 12, 250, 8).meetsMinimum).toBe(true);
  });
  it('無効入力はnull', () => {
    expect(monthlyHourlyEquivalent(0, 250, 8)).toBeNull();
    expect(monthlyHourlyEquivalent(180000, 0, 8)).toBeNull();
    expect(checkMonthlyWage('不明', 180000, 250, 8)).toBeNull();
  });
});

describe('割増賃金の参考計算', () => {
  it('東京都、5時間×1.25割増', () => {
    expect(overtimeWage('東京都', 5, 1.25)).toBe(Math.floor(1226 * 5 * 1.25));
  });
  it('無効な地域・時間・割増率は0', () => {
    expect(overtimeWage('不明', 5, 1.25)).toBe(0);
    expect(overtimeWage('東京都', -1, 1.25)).toBe(0);
    expect(overtimeWage('東京都', 5, 0.5)).toBe(0);
  });
});
