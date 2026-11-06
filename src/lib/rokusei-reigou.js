import { rokusei, fortuneZone, fortuneTypes } from './rokusei.js';

// Public rule/table checked 2026-11-07:
// https://www.senjutsu.jp/labo_6sei (birth year is 停止)
// https://fortune.netoff.co.jp/rokusei/reigousei/ (opposite star, same polarity)
const OPPOSITE = {
  土星人: '天王星人', 天王星人: '土星人',
  金星人: '木星人', 木星人: '金星人',
  火星人: '水星人', 水星人: '火星人',
};

export function reigouTable() {
  const branches = ['戌', '亥', '申', '酉', '午', '未', '辰', '巳', '寅', '卯', '子', '丑'];
  return fortuneTypes().map((item, i) => ({
    ...item, branch: branches[i], secondaryType: OPPOSITE[item.star] + item.polarity,
  }));
}

// Calendar-year boundary (January 1); no birth time or sex is needed.
export function reigou(year, month, day) {
  if (!Number.isInteger(year) || year < 1900 || year > 2099) return null;
  const result = rokusei(year, month, day);
  if (!result) return null;
  const birthZone = fortuneZone(result.type, year).zone;
  const isReigou = birthZone === '停止';
  return { ...result, birthZone, isReigou,
    secondaryType: isReigou ? OPPOSITE[result.star] + result.polarity : null };
}
