import { describe, expect, it } from 'vitest';
import { calculateMahjongFu, meldFu } from '../src/lib/mahjong-fu.js';

describe('meldFu（面子の符）', () => {
  it('順子は0符', () => {
    expect(meldFu({ type: 'sequence', terminalOrHonor: false })).toBe(0);
  });

  it('中張牌の明刻・暗刻・明槓・暗槓を計算する', () => {
    expect(meldFu({ type: 'openTriplet', terminalOrHonor: false })).toBe(2);
    expect(meldFu({ type: 'closedTriplet', terminalOrHonor: false })).toBe(4);
    expect(meldFu({ type: 'openQuad', terminalOrHonor: false })).toBe(8);
    expect(meldFu({ type: 'closedQuad', terminalOrHonor: false })).toBe(16);
  });

  it('幺九牌・字牌は中張牌の2倍になる', () => {
    expect(meldFu({ type: 'openTriplet', terminalOrHonor: true })).toBe(4);
    expect(meldFu({ type: 'closedTriplet', terminalOrHonor: true })).toBe(8);
    expect(meldFu({ type: 'openQuad', terminalOrHonor: true })).toBe(16);
    expect(meldFu({ type: 'closedQuad', terminalOrHonor: true })).toBe(32);
  });

  it('不正な面子はnull', () => {
    expect(meldFu({ type: 'unknown', terminalOrHonor: false })).toBeNull();
    expect(meldFu(null)).toBeNull();
  });
});

describe('calculateMahjongFu（符計算）', () => {
  it('門前ロン・役牌雀頭・中張牌暗刻・カンチャン待ちは40符', () => {
    const result = calculateMahjongFu({
      handType: 'normal',
      winType: 'ron',
      isClosed: true,
      pairFu: 2,
      waitFu: 2,
      melds: [
        { type: 'closedTriplet', terminalOrHonor: false },
        { type: 'sequence', terminalOrHonor: false },
        { type: 'sequence', terminalOrHonor: false },
        { type: 'sequence', terminalOrHonor: false },
      ],
    });

    expect(result.rawFu).toBe(38);
    expect(result.fu).toBe(40);
    expect(result.breakdown).toEqual({ base: 20, win: 10, pair: 2, wait: 2, melds: 4 });
  });

  it('ツモ・役牌雀頭・幺九牌暗槓は60符', () => {
    const result = calculateMahjongFu({
      handType: 'normal',
      winType: 'tsumo',
      isClosed: true,
      pairFu: 2,
      waitFu: 0,
      melds: [
        { type: 'closedQuad', terminalOrHonor: true },
        { type: 'sequence', terminalOrHonor: false },
        { type: 'sequence', terminalOrHonor: false },
        { type: 'sequence', terminalOrHonor: false },
      ],
    });

    expect(result.rawFu).toBe(56);
    expect(result.fu).toBe(60);
  });

  it('副露ロンで加符がない形は最低30符', () => {
    const result = calculateMahjongFu({
      handType: 'normal',
      winType: 'ron',
      isClosed: false,
      pairFu: 0,
      waitFu: 0,
      melds: Array(4).fill({ type: 'sequence', terminalOrHonor: false }),
    });

    expect(result.rawFu).toBe(20);
    expect(result.fu).toBe(30);
  });

  it('七対子は固定25符、平和ツモは固定20符', () => {
    expect(calculateMahjongFu({ handType: 'chiitoitsu' })).toMatchObject({ rawFu: 25, fu: 25 });
    expect(calculateMahjongFu({ handType: 'pinfuTsumo' })).toMatchObject({ rawFu: 20, fu: 20 });
  });

  it('連風牌の雀頭を4符として選べる', () => {
    const result = calculateMahjongFu({
      handType: 'normal',
      winType: 'ron',
      isClosed: true,
      pairFu: 4,
      waitFu: 0,
      melds: [],
    });
    expect(result.breakdown.pair).toBe(4);
    expect(result.fu).toBe(40);
  });

  it('不正な入力はnull', () => {
    expect(calculateMahjongFu(null)).toBeNull();
    expect(calculateMahjongFu({ handType: 'normal', winType: 'invalid', isClosed: true, pairFu: 0, waitFu: 0, melds: [] })).toBeNull();
    expect(calculateMahjongFu({ handType: 'normal', winType: 'ron', isClosed: true, pairFu: 3, waitFu: 0, melds: [] })).toBeNull();
    expect(calculateMahjongFu({ handType: 'normal', winType: 'ron', isClosed: true, pairFu: 0, waitFu: 1, melds: [] })).toBeNull();
    expect(calculateMahjongFu({ handType: 'normal', winType: 'ron', isClosed: true, pairFu: 0, waitFu: 0, melds: [{ type: 'invalid' }] })).toBeNull();
  });
});
