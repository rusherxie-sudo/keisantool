// 年齢早見表（/nenrei-hayami/）と生まれ年ページ（/umaredoshi/<year>/）の
// 表データ生成ロジック（純関数・DOM非依存）。
// 既存 lib（wareki / nenrei / rokusei / seiza / yakudoshi）の組み合わせで、
// 基準年は必ず引数で受け取る（テスト再現性のため）。

import { seirekiToWareki } from './wareki.js';
import { eto, kazoedoshi, schoolGrade, mannenrei } from './nenrei.js';
import { unmeiStar } from './rokusei.js';
import { seiza } from './seiza.js';
import { yakudoshiList } from './yakudoshi.js';

// 生まれ年の個別ページ（/umaredoshi/<year>/）を生成する範囲。
// ハブ表のリンク範囲と getStaticPaths の両方がここを参照する（不一致だと404リンクになる）。
export const UMAREDOSHI_FROM = 1900;
export const UMAREDOSHI_TO = 2010;

// 十二支の読み
const ETO_YOMI = {
  子: 'ね',
  丑: 'うし',
  寅: 'とら',
  卯: 'う',
  辰: 'たつ',
  巳: 'み',
  午: 'うま',
  未: 'ひつじ',
  申: 'さる',
  酉: 'とり',
  戌: 'いぬ',
  亥: 'い',
};

// その年の月ごとの日数（閏年判定込み）。
function daysInMonth(year) {
  const feb = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
  return [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}

// 整数化ヘルパ。null / '' / 非数値は NaN（Number(null)=0 の罠を避ける）。
function toInt(v) {
  if (v === null || v === undefined || v === '') return NaN;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

/**
 * その年の和暦表記。改元年は「旧元号／新元号」を併記する
 * （年齢早見表の慣例：昭和64年／平成元年）。
 * 明治改元年（1868）は年初が明治より前のため「明治元年」のみ。
 * 明治より前・不正入力は null。
 */
export function warekiLabels(year) {
  const y = toInt(year);
  if (Number.isNaN(y)) return null;
  const atStart = seirekiToWareki(y, 1, 1);
  const atEnd = seirekiToWareki(y, 12, 31);
  if (!atEnd) return null;
  if (!atStart || atStart.era === atEnd.era) return atEnd.label;
  return atStart.label + '／' + atEnd.label;
}

// 十二支の漢字＋読み。不正入力は null。
export function etoYomi(year) {
  const kanji = eto(year);
  if (!kanji) return null;
  return { kanji, yomi: ETO_YOMI[kanji] };
}

/**
 * 年齢早見表の行データ（fromYear〜toYear の昇順）。
 * age は「基準年の誕生日を迎えた後の満年齢」（誕生日前は −1 歳。表の注記で案内する）。
 *   { seireki, wareki, age, kazoe, eto, etoYomi }
 */
export function hayamiTable(fromYear, toYear, baseYear) {
  const f = toInt(fromYear);
  const t = toInt(toYear);
  const b = toInt(baseYear);
  if ([f, t, b].some(Number.isNaN) || f > t) return [];
  const rows = [];
  for (let y = f; y <= t; y++) {
    const e = etoYomi(y);
    rows.push({
      seireki: y,
      wareki: warekiLabels(y),
      age: b - y,
      kazoe: kazoedoshi(y, b),
      eto: e.kanji,
      etoYomi: e.yomi,
    });
  }
  return rows;
}

/**
 * 六星占術：指定した生まれ年の「誕生日の区間 → 運命星」の一覧。
 * 運命星は日の干支の旬（10日周期）で決まるため、1年を走査して
 * 同じ星が続く区間にまとめる（約36〜37区間）。
 *   [{ from: {month, day}, to: {month, day}, star }]
 */
export function rokuseiSegments(year) {
  const y = toInt(year);
  if (Number.isNaN(y)) return [];
  const dim = daysInMonth(y);
  const segs = [];
  let cur = null;
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= dim[m - 1]; d++) {
      const { star } = unmeiStar(y, m, d);
      if (!cur || cur.star !== star) {
        if (cur) segs.push(cur);
        cur = { from: { month: m, day: d }, to: { month: m, day: d }, star };
      } else {
        cur.to = { month: m, day: d };
      }
    }
  }
  if (cur) segs.push(cur);
  return segs;
}

/**
 * 12星座の誕生日区間（牡羊座始まりの慣例順）。
 * seiza() を全日付で走査して区間化するため、境界日は seiza.js と必ず一致する。
 * 山羊座は年をまたぐので 12/22〜1/19 の1区間に結合する。
 *   [{ name, en, symbol, from: {month, day}, to: {month, day} }]
 */
export function seizaRanges() {
  // 2月は29日まで走査（seiza() は年非依存で 2/29 を受け付ける）
  const dim = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const segs = [];
  let cur = null;
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= dim[m - 1]; d++) {
      const s = seiza(m, d);
      if (!cur || cur.name !== s.name) {
        if (cur) segs.push(cur);
        cur = { name: s.name, en: s.en, symbol: s.symbol, from: { month: m, day: d }, to: { month: m, day: d } };
      } else {
        cur.to = { month: m, day: d };
      }
    }
  }
  segs.push(cur);
  // 年初（1/1〜の山羊座の続き）と年末（12/22〜）の山羊座を1区間に結合
  if (segs.length > 12 && segs[0].name === segs[segs.length - 1].name) {
    const head = segs.shift();
    segs[segs.length - 1].to = head.to;
  }
  // 牡羊座（3/21〜）始まりに回転
  const start = segs.findIndex((s) => s.name === '牡羊座');
  return start > 0 ? [...segs.slice(start), ...segs.slice(0, start)] : segs;
}

/**
 * 学年早見表：指定した学年度(baseSchoolYear、例2026=令和8年度)における、
 * 各生まれ年度(4/2〜翌4/1)ごとの学年を返す（高3〜未就学、grade降順）。
 * ロジックは既存の schoolGrade() を「学年度の4/2」代表日で呼び出すことで導出し、
 * 早見表と単発計算（/nenrei/ ツール）が二重実装にならないようにする。
 *   [{ cohortYear, cohortLabel, grade, label, age }]
 */
export function gakunenTable(baseSchoolYear) {
  const base = toInt(baseSchoolYear);
  if (Number.isNaN(base)) return [];
  const refDate = `${base}-04-02`;
  const rows = [];
  for (let cohortYear = base - 19; cohortYear <= base - 5; cohortYear++) {
    const birthDate = `${cohortYear}-04-02`;
    const g = schoolGrade(birthDate, refDate);
    rows.push({
      cohortYear,
      cohortLabel: `${cohortYear}年4月2日〜${cohortYear + 1}年4月1日`,
      grade: g.grade,
      label: g.label,
      age: mannenrei(birthDate, refDate),
    });
  }
  return rows;
}

/**
 * 生まれ年 → 厄年に当たる西暦年の一覧（数え年の昇順）。
 * 数え年 n 歳の年 = 生まれ年 + n − 1（数え年 = 当年 − 生年 + 1 の逆算）。
 *   [{ kind: '前厄'|'本厄'|'後厄', kazoe, year, isTaiyaku }]
 */
export function yakudoshiSeirekiYears(birthYear, gender) {
  const b = toInt(birthYear);
  if (Number.isNaN(b)) return [];
  const list = yakudoshiList(gender);
  const rows = [];
  for (const y of list) {
    rows.push({ kind: '前厄', kazoe: y.maeyaku, year: b + y.maeyaku - 1, isTaiyaku: false });
    rows.push({ kind: '本厄', kazoe: y.honyaku, year: b + y.honyaku - 1, isTaiyaku: y.taiyaku });
    rows.push({ kind: '後厄', kazoe: y.atoyaku, year: b + y.atoyaku - 1, isTaiyaku: false });
  }
  rows.sort((a, c) => a.kazoe - c.kazoe);
  return rows;
}
