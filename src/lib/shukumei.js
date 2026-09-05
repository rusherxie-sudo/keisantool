// 六星占術「宿命大殺界」（人生の20年周期）の計算ロジック（純関数・DOM非依存）。
//
// ▼算法の出典・口径（公開基準）
//  - 宿命大殺界 = 四柱推命の「大運」のうち、日柱の空亡（2つの連続する地支）に該当する
//    連続する2運（各10年）= 20年間。内訳：初起殺界(前5年) → 中起殺界(中10年) → 転起殺界(末5年)。
//    出典：大久保占い研究室「宿命大殺界の調べ方」 https://www.senjutsu.jp/labo_6sei
//  - 日柱の空亡・運命星：lunar-javascript の EightChar.getDayXunKong() と src/lib/rokusei.js の
//    unmeiStar() が一致することをテストで担保（例：1958-02-24 = 壬申 → 空亡 戌亥 → 土星人）。
//  - 大運の起法（標準的な四柱推命）：
//    ・年干の陰陽：甲丙戊庚壬=陽年、乙丁己辛癸=陰年。
//    ・順逆：陽年男／陰年女→順行、陰年男／陽年女→逆行。
//    ・起運歳数：順行=出生日から次の「節」まで、逆行=前の「節」までの日数 ÷3（3日=1歳、1日=4ヶ月）。
//    ・大運干支：順行=月柱の次の干支(60甲子+1)、逆行=月柱の前の干支(-1) から、各10年。
//
//  ※ 六星占術は占い（娯楽）であり、科学的根拠はありません。大運の起法・年の境界
//    （立春境界 vs 元旦境界）は流派によって差異があります。本実装は上記の標準口径を
//    公開基準として採用し、結果はあくまで参考値です。
import { Solar } from 'lunar-javascript';
import { unmeiStar, polarity } from './rokusei.js';

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const YANG_GAN = ['甲', '丙', '戊', '庚', '壬'];

// 干支（例 '甲戌'）→ 60甲子インデックス（甲子=0）。干支の組が成立しない場合は -1。
function jiaziIndex(gan, zhi) {
  const gi = GAN.indexOf(gan);
  const zi = ZHI.indexOf(zhi);
  if (gi < 0 || zi < 0) return -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === gi && i % 12 === zi) return i;
  }
  return -1;
}

// 2 つの日付（UTC正午基準）の日数差（b - a）。
function daysBetween(y1, m1, d1, y2, m2, d2) {
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

function validDate(y, m, d) {
  if (![y, m, d].every((v) => Number.isInteger(v))) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
}

/**
 * 生年月日と性別から「宿命大殺界」を計算する。
 * @param {number} year 西暦
 * @param {number} month 月(1-12)
 * @param {number} day 日
 * @param {'male'|'female'} gender 性別
 * @returns 計算結果オブジェクト、または null（不正入力）。
 */
export function shukumeiDaisakkai(year, month, day, gender) {
  if (!validDate(year, month, day)) return null;
  if (gender !== 'male' && gender !== 'female') return null;

  const isMale = gender === 'male';
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  // 運命星・空亡（既存 /rokusei/ と同じ口径を共有）
  const { star, kuubou } = unmeiStar(year, month, day);
  const pol = polarity(year);
  const kongZhi = [kuubou[0], kuubou[1]];

  // 年干の陰陽 → 順行/逆行
  const yearGan = ec.getYearGan();
  const yang = YANG_GAN.includes(yearGan);
  const forward = (yang && isMale) || (!yang && !isMale);

  // 月柱（節で区切る。lunar-javascript の getMonth が対応）
  const monthGan = ec.getMonthGan();
  const monthZhi = ec.getMonthZhi();
  const monthGZ = monthGan + monthZhi;

  // 起運歳数：順行=次の節まで / 逆行=前の節まで の日数 ÷3
  const jq = forward ? lunar.getNextJie(true) : lunar.getPrevJie(true);
  const jqSolar = jq.getSolar();
  const diffDays = forward
    ? daysBetween(year, month, day, jqSolar.getYear(), jqSolar.getMonth(), jqSolar.getDay())
    : daysBetween(jqSolar.getYear(), jqSolar.getMonth(), jqSolar.getDay(), year, month, day);
  const startYears = Math.floor(diffDays / 3);
  const startMonths = Math.round((diffDays % 3) * 4);

  // 大運（10年ごと、前10運 = 100年ぶん生成）
  const monthIdx = jiaziIndex(monthGan, monthZhi);
  const firstIdx = forward ? (monthIdx + 1) % 60 : (monthIdx - 1 + 60) % 60;
  const dayun = [];
  for (let i = 0; i < 10; i++) {
    const idx = (firstIdx + (forward ? i : -i) + 60) % 60;
    const fromAge = startYears + i * 10;
    dayun.push({
      gz: GAN[idx % 10] + ZHI[idx % 12],
      zhi: ZHI[idx % 12],
      fromAge,
      toAge: fromAge + 10,
    });
  }

  // 宿命大殺界 = 空亡地支（連続2支）に該当する連続2運 = 20年
  const firstKong = dayun.findIndex((y) => kongZhi.includes(y.zhi));
  if (firstKong < 0 || firstKong + 1 >= dayun.length) {
    return {
      star,
      polarity: pol,
      dayXunKong: kuubou,
      monthGZ,
      forward,
      startYears,
      startMonths,
      hasShukumei: false,
      dayun,
    };
  }
  const a = dayun[firstKong];
  const b = dayun[firstKong + 1];
  const sStartAge = a.fromAge;
  const sEndAge = b.toAge;
  const sStartYear = year + sStartAge;
  const sEndYear = year + sEndAge;

  return {
    star,
    polarity: pol,
    dayXunKong: kuubou,
    monthGZ,
    forward,
    startYears,
    startMonths,
    hasShukumei: sStartAge < 100, // 100歳以降なら「実質なし」として扱う
    shukumei: {
      startAge: sStartAge,
      endAge: sEndAge,
      startYear: sStartYear,
      endYear: sEndYear,
      // 20年の内訳：初起(前5年) → 中起(中10年) → 転起(末5年)
      shoki: { fromAge: sStartAge, toAge: sStartAge + 5 },
      chuki: { fromAge: sStartAge + 5, toAge: sStartAge + 15 },
      tenki: { fromAge: sStartAge + 15, toAge: sStartAge + 20 },
    },
    dayun,
  };
}
