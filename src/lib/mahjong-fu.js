// 一般的なリーチ麻雀の符を計算する純関数。
// 画面側は牌姿を直接解析せず、面子・雀頭・待ちの分類を渡す。

const MELD_BASE_FU = {
  sequence: 0,
  openTriplet: 2,
  closedTriplet: 4,
  openQuad: 8,
  closedQuad: 16,
};

export function meldFu(meld) {
  if (!meld || typeof meld !== 'object' || !(meld.type in MELD_BASE_FU)) return null;
  if (meld.type === 'sequence') return 0;
  if (typeof meld.terminalOrHonor !== 'boolean') return null;

  const base = MELD_BASE_FU[meld.type];
  return meld.terminalOrHonor ? base * 2 : base;
}

export function calculateMahjongFu(options) {
  if (!options || typeof options !== 'object') return null;

  if (options.handType === 'chiitoitsu') {
    return {
      rawFu: 25,
      fu: 25,
      fixed: true,
      breakdown: { base: 25, win: 0, pair: 0, wait: 0, melds: 0 },
    };
  }

  if (options.handType === 'pinfuTsumo') {
    return {
      rawFu: 20,
      fu: 20,
      fixed: true,
      breakdown: { base: 20, win: 0, pair: 0, wait: 0, melds: 0 },
    };
  }

  if (options.handType !== 'normal') return null;

  const { winType, isClosed, pairFu, waitFu } = options;
  const melds = options.melds ?? [];
  if (!['ron', 'tsumo'].includes(winType) || typeof isClosed !== 'boolean') return null;
  if (![0, 2, 4].includes(pairFu) || ![0, 2].includes(waitFu)) return null;
  if (!Array.isArray(melds) || melds.length > 4) return null;

  const meldValues = melds.map(meldFu);
  if (meldValues.some((value) => value === null)) return null;

  const winFu = winType === 'tsumo' ? 2 : (isClosed ? 10 : 0);
  const meldTotal = meldValues.reduce((sum, value) => sum + value, 0);
  const rawFu = 20 + winFu + pairFu + waitFu + meldTotal;
  const roundedFu = Math.ceil(rawFu / 10) * 10;

  return {
    rawFu,
    fu: rawFu === 20 ? 30 : roundedFu,
    fixed: false,
    breakdown: {
      base: 20,
      win: winFu,
      pair: pairFu,
      wait: waitFu,
      melds: meldTotal,
    },
  };
}
