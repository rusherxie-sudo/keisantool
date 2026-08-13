import { describe, expect, it } from 'vitest';
import { calculateArc, calculateCentralAngle } from '../src/lib/enko.js';

describe('calculateArc', () => {
  it('半径10・中心角90度の円弧長、扇形面積、弦長を計算する', () => {
    const result = calculateArc({ radius: 10, angle: 90 });
    expect(result.arcLength).toBeCloseTo(5 * Math.PI);
    expect(result.sectorArea).toBeCloseTo(25 * Math.PI);
    expect(result.chordLength).toBeCloseTo(10 * Math.sqrt(2));
    expect(result.circumference).toBeCloseTo(20 * Math.PI);
    expect(result.diameter).toBe(20);
  });

  it('直径入力を半径へ変換し、360度を円全体として計算する', () => {
    const result = calculateArc({ radius: 20, radiusType: 'diameter', angle: 360 });
    expect(result.radius).toBe(10);
    expect(result.arcLength).toBeCloseTo(20 * Math.PI);
    expect(result.sectorArea).toBeCloseTo(100 * Math.PI);
    expect(result.chordLength).toBeCloseTo(0);
  });

  it('0以下、360度超、非数値、未知の半径種別を拒否する', () => {
    expect(calculateArc({ radius: 0, angle: 90 })).toBeNull();
    expect(calculateArc({ radius: 10, angle: 0 })).toBeNull();
    expect(calculateArc({ radius: 10, angle: 361 })).toBeNull();
    expect(calculateArc({ radius: 'abc', angle: 90 })).toBeNull();
    expect(calculateArc({ radius: 10, radiusType: 'circumference', angle: 90 })).toBeNull();
  });
});

describe('calculateCentralAngle', () => {
  it('半径10・円弧長5πから中心角90度を逆算する', () => {
    const result = calculateCentralAngle({ radius: 10, arcLength: 5 * Math.PI });
    expect(result.angle).toBeCloseTo(90);
    expect(result.sectorArea).toBeCloseTo(25 * Math.PI);
    expect(result.chordLength).toBeCloseTo(10 * Math.sqrt(2));
  });

  it('直径入力にも対応する', () => {
    const result = calculateCentralAngle({ radius: 20, radiusType: 'diameter', arcLength: 10 * Math.PI });
    expect(result.radius).toBe(10);
    expect(result.angle).toBeCloseTo(180);
  });

  it('円周を超える円弧、0以下、未知の半径種別を拒否する', () => {
    expect(calculateCentralAngle({ radius: 10, arcLength: 0 })).toBeNull();
    expect(calculateCentralAngle({ radius: 10, arcLength: 21 * Math.PI })).toBeNull();
    expect(calculateCentralAngle({ radius: -1, arcLength: 1 })).toBeNull();
    expect(calculateCentralAngle({ radius: 10, radiusType: 'x', arcLength: 1 })).toBeNull();
  });
});
