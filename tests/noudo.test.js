import { describe, expect, it } from 'vitest';
import {
  calculateMassPercent,
  soluteMassFromPercent,
  solutionMassFromPercent,
  calculateMolarityFromMass,
  calculateMolarityFromMoles,
  diluteFromStock,
  prepareDilution,
} from '../src/lib/noudo.js';

describe('質量パーセント濃度', () => {
  it('食塩20gを水180gに溶かした濃度は10%', () => {
    expect(calculateMassPercent(20, 200)).toEqual({
      percent: 10,
      soluteMass: 20,
      solventMass: 180,
      solutionMass: 200,
    });
  });

  it('濃度5%の溶液300gに必要な溶質と溶媒を求める', () => {
    expect(soluteMassFromPercent(300, 5)).toEqual({
      percent: 5,
      soluteMass: 15,
      solventMass: 285,
      solutionMass: 300,
    });
  });

  it('溶質12gで8%溶液を作ると溶液150g・溶媒138g', () => {
    expect(solutionMassFromPercent(12, 8)).toEqual({
      percent: 8,
      soluteMass: 12,
      solventMass: 138,
      solutionMass: 150,
    });
  });

  it('正向计算允许0%和100%，但拒绝溶质大于溶液', () => {
    expect(calculateMassPercent(0, 100)?.percent).toBe(0);
    expect(calculateMassPercent(100, 100)?.percent).toBe(100);
    expect(calculateMassPercent(101, 100)).toBeNull();
    expect(solutionMassFromPercent(0, 8)).toBeNull();
  });
});

describe('モル濃度', () => {
  it('NaCl 5.844g・モル質量58.44g/mol・溶液500mLは0.2mol/L', () => {
    const result = calculateMolarityFromMass(5.844, 58.44, 500, 'mL');
    expect(result.moles).toBeCloseTo(0.1, 12);
    expect(result.liters).toBeCloseTo(0.5, 12);
    expect(result.molPerLiter).toBeCloseTo(0.2, 12);
  });

  it('0.25molを2Lに溶かすと0.125mol/L', () => {
    expect(calculateMolarityFromMoles(0.25, 2, 'L')).toEqual({
      moles: 0.25,
      liters: 2,
      molPerLiter: 0.125,
    });
  });

  it('溶質0molは0mol/Lとして扱う', () => {
    expect(calculateMolarityFromMoles(0, 250, 'mL')?.molPerLiter).toBe(0);
  });
});

describe('希釈計算', () => {
  it('2mol/L原液100mLを0.5mol/Lにすると全量400mL・溶媒300mL', () => {
    expect(diluteFromStock(2, 100, 0.5)).toEqual({
      initialConcentration: 2,
      targetConcentration: 0.5,
      stockVolume: 100,
      finalVolume: 400,
      solventToAdd: 300,
      dilutionFactor: 4,
    });
  });

  it('10%原液から2%溶液500mLを作るには原液100mL・溶媒400mL', () => {
    expect(prepareDilution(10, 2, 500)).toEqual({
      initialConcentration: 10,
      targetConcentration: 2,
      stockVolume: 100,
      finalVolume: 500,
      solventToAdd: 400,
      dilutionFactor: 5,
    });
  });

  it('目标浓度高于原液或非法输入时返回null', () => {
    expect(diluteFromStock(1, 100, 2)).toBeNull();
    expect(prepareDilution(10, 0, 500)).toBeNull();
    expect(prepareDilution(Infinity, 2, 500)).toBeNull();
  });
});

describe('共通入力検証', () => {
  it('空欄・負数・未知単位・0除算を拒否する', () => {
    expect(calculateMassPercent('', 100)).toBeNull();
    expect(soluteMassFromPercent(100, -1)).toBeNull();
    expect(solutionMassFromPercent(10, 0)).toBeNull();
    expect(calculateMolarityFromMass(10, 0, 1, 'L')).toBeNull();
    expect(calculateMolarityFromMoles(1, 100, 'dL')).toBeNull();
  });
});
