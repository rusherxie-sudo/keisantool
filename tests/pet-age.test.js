import { describe, it, expect } from 'vitest';
import {
  dogHumanAge,
  catHumanAge,
  sizeFromWeight,
} from '../src/lib/pet-age.js';

// 出典（一次資料）:
//   犬 = 環境省『飼い主のためのペットフード・ガイドライン』2区分式
//        小型・中型: 1歳=15, 2歳=24, 以降+4/年 → 24+(age-2)*4
//        大型:       1歳=12, 2歳=19, 以降+7/年 → 12+(age-1)*7
//   猫 = 環境省 / iCatCare: 1歳=15, 2歳=24, 以降+4/年 → 24+(age-2)*4
//   ※1歳は式の例外値（犬小中=15/犬大=12/猫=15）、2歳以降のみ式適用。

describe('dogHumanAge(犬の人間換算: 環境省2区分式)', () => {
  it('小型犬 1歳 → 15歳（例外値）', () => {
    expect(dogHumanAge(1, 'small')).toBe(15);
  });

  it('小型犬 2歳 → 24歳', () => {
    expect(dogHumanAge(2, 'small')).toBe(24);
  });

  it('小型犬 3歳 → 28歳', () => {
    expect(dogHumanAge(3, 'small')).toBe(28);
  });

  it('小型犬 10歳 → 56歳', () => {
    expect(dogHumanAge(10, 'small')).toBe(56);
  });

  it('小型犬 11歳 → 60歳', () => {
    expect(dogHumanAge(11, 'small')).toBe(60);
  });

  it('中型犬は小型と同じ式（10歳 → 56歳）', () => {
    expect(dogHumanAge(10, 'medium')).toBe(56);
  });

  it('大型犬 1歳 → 12歳', () => {
    expect(dogHumanAge(1, 'large')).toBe(12);
  });

  it('大型犬 2歳 → 19歳', () => {
    expect(dogHumanAge(2, 'large')).toBe(19);
  });

  it('大型犬 3歳 → 26歳', () => {
    expect(dogHumanAge(3, 'large')).toBe(26);
  });

  it('大型犬 8歳 → 61歳', () => {
    expect(dogHumanAge(8, 'large')).toBe(61);
  });

  it('小数年齢（1歳6ヶ月=1.5歳など）でも結果は整数（floor）', () => {
    // ページは step=0.5 の小数入力を明示サポート。全区分で整数化されること。
    expect(dogHumanAge(1.5, 'large')).toBe(15); // 生値 15.5
    expect(dogHumanAge(2.5, 'large')).toBe(22); // 生値 22.5
    expect(dogHumanAge(2.3, 'small')).toBe(25); // 生値 25.2
  });

  it('負数・無効 → null', () => {
    expect(dogHumanAge(-1, 'small')).toBeNull();
    expect(dogHumanAge(NaN, 'large')).toBeNull();
    expect(dogHumanAge('x', 'small')).toBeNull();
  });
});

describe('catHumanAge(猫の人間換算: 環境省/iCatCare)', () => {
  it('1歳 → 15歳（例外値、au損保系の18歳は不採用）', () => {
    expect(catHumanAge(1)).toBe(15);
  });

  it('2歳 → 24歳', () => {
    expect(catHumanAge(2)).toBe(24);
  });

  it('3歳 → 28歳', () => {
    expect(catHumanAge(3)).toBe(28);
  });

  it('5歳 → 36歳', () => {
    expect(catHumanAge(5)).toBe(36);
  });

  it('10歳 → 56歳', () => {
    expect(catHumanAge(10)).toBe(56);
  });

  it('20歳 → 96歳', () => {
    expect(catHumanAge(20)).toBe(96);
  });

  it('0.5歳 → 7歳（線形補間 floor）', () => {
    expect(catHumanAge(0.5)).toBe(7);
  });

  it('2歳以降の小数年齢も整数（floor）', () => {
    expect(catHumanAge(2.3)).toBe(25); // 生値 25.2
  });

  it('負数・無効 → null', () => {
    expect(catHumanAge(-1)).toBeNull();
    expect(catHumanAge(NaN)).toBeNull();
    expect(catHumanAge('x')).toBeNull();
  });
});

describe('sizeFromWeight(体重→体型区分)', () => {
  it('10kg以下 → small', () => {
    expect(sizeFromWeight(5)).toBe('small');
    expect(sizeFromWeight(10)).toBe('small');
  });

  it('10kg超〜25kg → medium', () => {
    expect(sizeFromWeight(10.1)).toBe('medium');
    expect(sizeFromWeight(25)).toBe('medium');
  });

  it('25kg超 → large', () => {
    expect(sizeFromWeight(25.1)).toBe('large');
    expect(sizeFromWeight(40)).toBe('large');
  });

  it('無効 → null', () => {
    expect(sizeFromWeight(0)).toBeNull();
    expect(sizeFromWeight(-3)).toBeNull();
    expect(sizeFromWeight(NaN)).toBeNull();
  });
});
