// 六星占術の地運相性を、ふたりの生年月日から双方向でまとめる純関数。
// 基礎となる運命星・年運は rokusei.js、地運12ゾーンの判定基準は
// tanjobi-aisho.js の既存実装を再利用し、ページごとの判定ずれを防ぐ。

import { rokusei, fortuneZone } from './rokusei.js';
import { rokuseiAisho, RANK_LABELS } from './tanjobi-aisho.js';

// 地運スコアの表示帯。0〜100以外は扱わない。
export function rokuseiCompatibilityRank(score) {
  if (!Number.isFinite(score) || score < 0 || score > 100) return null;
  const rank = score >= 85 ? '◎' : score >= 70 ? '○' : score >= 55 ? '△' : '▲';
  return { rank, label: RANK_LABELS[rank] };
}

function personResult(person, result, year) {
  const fortune = fortuneZone(result.type, year);
  if (!fortune) return null;
  return {
    type: result.type,
    star: result.star,
    polarity: result.polarity,
    birthYear: person.y,
    yearFortune: { zone: fortune.zone, category: fortune.category },
  };
}

// person は { y, m, d }。固定的な地運を双方向で判定し、平均点を切り捨てる。
// year は相性点には混ぜず、ふたりの年運を並べて表示するためだけに使う。
export function rokuseiCompatibility(person1, person2, year) {
  if (!person1 || !person2 || !Number.isInteger(year)) return null;

  const result1 = rokusei(person1.y, person1.m, person1.d);
  const result2 = rokusei(person2.y, person2.m, person2.d);
  if (!result1 || !result2) return null;

  const p1ToP2 = rokuseiAisho(result1.type, person2.y);
  const p2ToP1 = rokuseiAisho(result2.type, person1.y);
  if (!p1ToP2 || !p2ToP1) return null;

  const score = Math.floor((p1ToP2.score + p2ToP1.score) / 2);
  const band = rokuseiCompatibilityRank(score);
  return {
    p1: personResult(person1, result1, year),
    p2: personResult(person2, result2, year),
    p1ToP2,
    p2ToP1,
    total: { score, ...band },
    year,
  };
}
