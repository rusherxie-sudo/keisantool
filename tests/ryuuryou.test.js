import { describe, expect, it } from 'vitest';
import { convertFlow, solveVolumeFlow, solvePipeFlow } from '../src/lib/ryuuryou.js';

describe('流量換算', () => {
  it('m³/s・L/min・m³/hを換算する', () => {
    expect(convertFlow(1, 'm3/s', 'L/min')).toBeCloseTo(60_000, 10);
    expect(convertFlow(60, 'L/min', 'm3/h')).toBeCloseTo(3.6, 10);
  });
  it('空欄・非有限・未知単位を拒否する', () => {
    expect(convertFlow('', 'L/min', 'm3/s')).toBeNull();
    expect(convertFlow(Infinity, 'L/min', 'm3/s')).toBeNull();
    expect(convertFlow(1, 'bad', 'm3/s')).toBeNull();
  });
});

describe('体積・時間・流量', () => {
  it('120Lを2分で流すと60L/min', () => {
    expect(solveVolumeFlow({ target: 'flow', volume: 120, volumeUnit: 'L', time: 2, timeUnit: 'min' }).flowM3s).toBeCloseTo(0.001, 12);
  });
  it('30L/minを10分流すと300L', () => {
    expect(solveVolumeFlow({ target: 'volume', flow: 30, flowUnit: 'L/min', time: 10, timeUnit: 'min' }).volumeM3).toBeCloseTo(0.3, 12);
  });
  it('500Lを25L/minで流すと20分', () => {
    expect(solveVolumeFlow({ target: 'time', volume: 500, volumeUnit: 'L', flow: 25, flowUnit: 'L/min' }).timeSec).toBeCloseTo(1200, 10);
  });
});

describe('円管の断面積・流速・流量', () => {
  it('内径100mm・流速2m/sの流量を求める', () => {
    const result = solvePipeFlow({ target: 'flow', diameter: 100, diameterUnit: 'mm', velocity: 2 });
    expect(result.areaM2).toBeCloseTo(Math.PI * 0.05 ** 2, 12);
    expect(result.flowM3s).toBeCloseTo(Math.PI * 0.05 ** 2 * 2, 12);
  });
  it('流量と内径から流速を逆算する', () => {
    const result = solvePipeFlow({ target: 'velocity', diameter: 100, diameterUnit: 'mm', flow: 60, flowUnit: 'L/min' });
    expect(result.velocityMs).toBeCloseTo(0.001 / (Math.PI * 0.05 ** 2), 12);
  });
  it('0・負数・未知の求値を拒否する', () => {
    expect(solvePipeFlow({ target: 'flow', diameter: 0, velocity: 1 })).toBeNull();
    expect(solvePipeFlow({ target: 'velocity', diameter: 10, flow: -1 })).toBeNull();
    expect(solvePipeFlow({ target: 'bad', diameter: 10, velocity: 1 })).toBeNull();
  });
});
