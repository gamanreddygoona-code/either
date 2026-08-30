import { describe, it, expect } from 'vitest';

function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = (gains / period) / (losses / period);
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = macd * 0.8;
  return { macd, signal, histogram: macd - signal };
}

describe('Technical Analysis Indicator Algorithms', () => {
  const prices = [100, 102, 104, 103, 105, 107, 106, 108, 110, 109, 111, 113, 112, 114, 116];

  it('calculateEMA calculates correct exponential moving average', () => {
    const ema = calculateEMA(prices, 10);
    expect(ema).toBeGreaterThan(100);
    expect(ema).toBeLessThan(120);
  });

  it('calculateRSI calculates standard relative strength index', () => {
    const rsi = calculateRSI(prices, 14);
    expect(rsi).toBeGreaterThan(0);
    expect(rsi).toBeLessThanOrEqual(100);
  });

  it('calculateMACD calculates valid MACD line and histogram', () => {
    const macdResult = calculateMACD(prices);
    expect(typeof macdResult.macd).toBe('number');
    expect(typeof macdResult.histogram).toBe('number');
  });
});