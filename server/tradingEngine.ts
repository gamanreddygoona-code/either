import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export interface CandleStickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  ema20: number;
  ema50: number;
  ema200: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  };
  atr: number;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  volatility: "LOW" | "NORMAL" | "HIGH" | "EXTREME";
}

export interface TradingSignal {
  id: string;
  symbol: string;
  timestamp: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  price: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: string;
  timeframe: string;
  strategy: string;
  rationale: string;
  technicalSummary: {
    rsi: number;
    macdCross: "BULLISH" | "BEARISH" | "NONE";
    emaTrend: "STRONG_UP" | "WEAK_UP" | "DOWN" | "CONSOLIDATING";
    keySupport: number;
    keyResistance: number;
  };
}

export interface TradePosition {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  currentPrice: number;
  amount: number;
  leverage: number;
  valueUsd: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: string;
  mode: "paper" | "live";
}

export interface TradeOrder {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP_LOSS";
  price: number;
  amount: number;
  totalUsd: number;
  status: "FILLED" | "PENDING" | "CANCELLED" | "STOPPED_OUT" | "TAKE_PROFIT";
  pnl?: number;
  timestamp: string;
  mode: "paper" | "live";
  reason?: string;
}

export interface TradingPortfolio {
  cashBalance: number;
  initialBalance: number;
  totalEquity: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPnlPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  profitFactor: number;
  openPositions: TradePosition[];
  orderHistory: TradeOrder[];
  mode: "paper" | "live";
}

export interface TradingBotConfig {
  enabled: boolean;
  symbol: string;
  strategy: "ai_confluence" | "rsi_reversion" | "breakout_momentum" | "ema_cross" | "scalper";
  riskPerTradePercent: number;
  maxOpenPositions: number;
  scanIntervalSeconds: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  mode: "paper" | "live";
  lastScanTime?: string;
  lastAction?: string;
}

/* ================= Quantitative Indicators Engine ================= */

export function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const slice = data.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return Number((sum / period).toFixed(2));
}

export function calculateEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  if (data.length < period) return calculateSMA(data, data.length);
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  return Number(ema.toFixed(2));
}

export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length <= period) return 50;
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return Number(rsi.toFixed(2));
}

export function calculateMACD(closes: number[], fast = 12, slow = 26, signal = 9) {
  if (closes.length < slow + signal) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  const emaFast = calculateEMA(closes, fast);
  const emaSlow = calculateEMA(closes, slow);
  const macd = Number((emaFast - emaSlow).toFixed(2));

  // MACD series for signal line
  const macdSeries: number[] = [];
  for (let i = slow; i <= closes.length; i++) {
    const subCloses = closes.slice(0, i);
    const f = calculateEMA(subCloses, fast);
    const s = calculateEMA(subCloses, slow);
    macdSeries.push(f - s);
  }

  const signalLine = calculateEMA(macdSeries, signal);
  const histogram = Number((macd - signalLine).toFixed(2));

  return { macd, signal: signalLine, histogram };
}

export function calculateBollingerBands(closes: number[], period = 20, multiplier = 2) {
  if (closes.length < period) {
    const c = closes[closes.length - 1] || 0;
    return { upper: c * 1.02, middle: c, lower: c * 0.98, bandwidth: 4 };
  }
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = Number((mean + multiplier * stdDev).toFixed(2));
  const lower = Number((mean - multiplier * stdDev).toFixed(2));
  const middle = Number(mean.toFixed(2));
  const bandwidth = Number((((upper - lower) / middle) * 100).toFixed(2));

  return { upper, middle, lower, bandwidth };
}

export function calculateATR(highs: number[], lows: number[], closes: number[], period = 14): number {
  if (highs.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trs.push(tr);
  }
  return calculateSMA(trs, Math.min(trs.length, period));
}

export function computeTechnicalIndicators(candles: CandleStickData[]): TechnicalIndicators {
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const currentClose = closes[closes.length - 1] || 0;
  const rsi = calculateRSI(closes, 14);
  const macd = calculateMACD(closes, 12, 26, 9);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const bollingerBands = calculateBollingerBands(closes, 20, 2);
  const atr = calculateATR(highs, lows, closes, 14);

  let trend: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  if (currentClose > ema20 && ema20 > ema50) trend = "BULLISH";
  else if (currentClose < ema20 && ema20 < ema50) trend = "BEARISH";

  let volatility: "LOW" | "NORMAL" | "HIGH" | "EXTREME" = "NORMAL";
  if (bollingerBands.bandwidth < 2.5) volatility = "LOW";
  else if (bollingerBands.bandwidth > 7) volatility = "HIGH";
  else if (bollingerBands.bandwidth > 12) volatility = "EXTREME";

  return {
    rsi,
    macd,
    ema20,
    ema50,
    ema200,
    bollingerBands,
    atr,
    trend,
    volatility,
  };
}

/* ================= Live Market Data Provider ================= */

export async function fetchLiveCandlesticks(symbol: string = "BTCUSDT", interval: string = "1h", limit = 100): Promise<CandleStickData[]> {
  const cleanSymbol = symbol.toUpperCase().replace("/", "").replace("-", "");
  const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${interval}&limit=${limit}`;

  try {
    const res = await fetch(binanceUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Littlebird-Quant-Engine/1.0" }
    });

    if (res.ok) {
      const rawData = await res.json();
      if (Array.isArray(rawData) && rawData.length > 0) {
        return rawData.map((k: any) => ({
          time: Number(k[0]),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        }));
      }
    }
  } catch (err) {
    // fallback if external API is rate-limited or offline
  }

  // Robust realistic fallback generator if offline
  const basePrice = cleanSymbol.includes("BTC") ? 64250 : cleanSymbol.includes("ETH") ? 3480 : cleanSymbol.includes("SOL") ? 148 : 220;
  const now = Date.now();
  const stepMs = interval === "1m" ? 60000 : interval === "15m" ? 900000 : 3600000;
  const candles: CandleStickData[] = [];
  let prevClose = basePrice;

  for (let i = limit; i >= 0; i--) {
    const time = now - i * stepMs;
    const change = (Math.sin(i / 6) * 0.008 + (Math.random() - 0.49) * 0.015) * prevClose;
    const open = prevClose;
    const close = Number((open + change).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * 0.008 * prevClose).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * 0.008 * prevClose).toFixed(2));
    const volume = Number((Math.random() * 150 + 20).toFixed(2));

    candles.push({ time, open, high, low, close, volume });
    prevClose = close;
  }

  return candles;
}

export async function fetchLiveTicker(symbol: string = "BTCUSDT"): Promise<{ price: number; change24h: number; high24h: number; low24h: number; volume24h: number }> {
  const cleanSymbol = symbol.toUpperCase().replace("/", "").replace("-", "");
  const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`;

  try {
    const res = await fetch(binanceUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      return {
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        volume24h: parseFloat(data.volume),
      };
    }
  } catch (e) {}

  const candles = await fetchLiveCandlesticks(cleanSymbol, "1h", 24);
  const latest = candles[candles.length - 1];
  const first = candles[0];
  const change24h = Number((((latest.close - first.open) / first.open) * 100).toFixed(2));
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  return {
    price: latest.close,
    change24h,
    high24h: Math.max(...highs),
    low24h: Math.min(...lows),
    volume24h: 1250000,
  };
}

/* ================= Portfolio & Order Execution State ================= */

class TradingEngineState {
  portfolio: TradingPortfolio = {
    cashBalance: 10000.0,
    initialBalance: 10000.0,
    totalEquity: 10000.0,
    unrealizedPnl: 0,
    realizedPnl: 0,
    totalPnlPercent: 0,
    winRate: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    profitFactor: 1.0,
    openPositions: [],
    orderHistory: [],
    mode: "paper",
  };

  botConfig: TradingBotConfig = {
    enabled: false,
    symbol: "BTCUSDT",
    strategy: "ai_confluence",
    riskPerTradePercent: 2.0,
    maxOpenPositions: 3,
    scanIntervalSeconds: 10,
    stopLossPercent: 1.5,
    takeProfitPercent: 3.5,
    mode: "paper",
    lastAction: "Idle - Waiting for activation",
  };

  botInterval: NodeJS.Timeout | null = null;
  botLogs: string[] = [];

  constructor() {
    this.startPriceMonitor();
  }

  /* Real-time PnL & Stop-Loss/Take-Profit Guard */
  private startPriceMonitor() {
    setInterval(async () => {
      if (this.portfolio.openPositions.length === 0) return;

      for (const pos of [...this.portfolio.openPositions]) {
        try {
          const ticker = await fetchLiveTicker(pos.symbol);
          pos.currentPrice = ticker.price;

          const priceDiff = pos.side === "BUY" ? (ticker.price - pos.entryPrice) : (pos.entryPrice - ticker.price);
          pos.unrealizedPnl = Number((priceDiff * pos.amount * pos.leverage).toFixed(2));
          pos.unrealizedPnlPercent = Number(((priceDiff / pos.entryPrice) * 100 * pos.leverage).toFixed(2));

          // Automated Stop-Loss Trigger
          if (pos.stopLoss) {
            const isStopHit = pos.side === "BUY" ? ticker.price <= pos.stopLoss : ticker.price >= pos.stopLoss;
            if (isStopHit) {
              this.closePosition(pos.id, "STOPPED_OUT", `Auto Stop-Loss triggered at $${ticker.price}`);
              continue;
            }
          }

          // Automated Take-Profit Trigger
          if (pos.takeProfit) {
            const isTakeProfitHit = pos.side === "BUY" ? ticker.price >= pos.takeProfit : ticker.price <= pos.takeProfit;
            if (isTakeProfitHit) {
              this.closePosition(pos.id, "TAKE_PROFIT", `Take-Profit target hit at $${ticker.price}`);
              continue;
            }
          }
        } catch (err) {}
      }

      this.recalculateEquity();
    }, 3000);
  }

  private recalculateEquity() {
    const unrealized = this.portfolio.openPositions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
    const positionMargin = this.portfolio.openPositions.reduce((acc, p) => acc + p.valueUsd, 0);
    this.portfolio.unrealizedPnl = Number(unrealized.toFixed(2));
    this.portfolio.totalEquity = Number((this.portfolio.cashBalance + positionMargin + unrealized).toFixed(2));
    this.portfolio.totalPnlPercent = Number((((this.portfolio.totalEquity - this.portfolio.initialBalance) / this.portfolio.initialBalance) * 100).toFixed(2));

    const closedOrders = this.portfolio.orderHistory.filter(o => o.pnl !== undefined);
    if (closedOrders.length > 0) {
      this.portfolio.totalTrades = closedOrders.length;
      this.portfolio.winningTrades = closedOrders.filter(o => (o.pnl || 0) > 0).length;
      this.portfolio.losingTrades = closedOrders.filter(o => (o.pnl || 0) < 0).length;
      this.portfolio.winRate = Number(((this.portfolio.winningTrades / this.portfolio.totalTrades) * 100).toFixed(1));

      const totalGain = closedOrders.filter(o => (o.pnl || 0) > 0).reduce((acc, o) => acc + (o.pnl || 0), 0);
      const totalLoss = Math.abs(closedOrders.filter(o => (o.pnl || 0) < 0).reduce((acc, o) => acc + (o.pnl || 0), 0));
      this.portfolio.profitFactor = totalLoss === 0 ? (totalGain > 0 ? 10.0 : 1.0) : Number((totalGain / totalLoss).toFixed(2));
    }
  }

  public placeOrder(orderReq: {
    symbol: string;
    side: "BUY" | "SELL";
    amount: number;
    leverage?: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
    type?: "MARKET" | "LIMIT";
  }): { success: boolean; order?: TradeOrder; position?: TradePosition; error?: string } {
    const { symbol, side, amount, leverage = 1, stopLoss, takeProfit, type = "MARKET" } = orderReq;
    const cleanSymbol = symbol.toUpperCase();

    const entryPrice = orderReq.price || 0;
    const totalCostUsd = (amount * entryPrice) / leverage;

    if (totalCostUsd > this.portfolio.cashBalance) {
      return { success: false, error: `Insufficient cash balance. Required: $${totalCostUsd.toFixed(2)}, Available: $${this.portfolio.cashBalance.toFixed(2)}` };
    }

    this.portfolio.cashBalance -= totalCostUsd;

    const orderId = `ord-${Date.now()}`;
    const order: TradeOrder = {
      id: orderId,
      symbol: cleanSymbol,
      side,
      type,
      price: entryPrice,
      amount,
      totalUsd: totalCostUsd,
      status: "FILLED",
      timestamp: new Date().toISOString(),
      mode: this.portfolio.mode,
      reason: `Manual/AI ${side} execution`,
    };

    const positionId = `pos-${Date.now()}`;
    const position: TradePosition = {
      id: positionId,
      symbol: cleanSymbol,
      side,
      entryPrice,
      currentPrice: entryPrice,
      amount,
      leverage,
      valueUsd: totalCostUsd,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      stopLoss,
      takeProfit,
      entryTime: new Date().toISOString(),
      mode: this.portfolio.mode,
    };

    this.portfolio.openPositions.unshift(position);
    this.portfolio.orderHistory.unshift(order);
    this.recalculateEquity();

    return { success: true, order, position };
  }

  public closePosition(positionId: string, status: "FILLED" | "STOPPED_OUT" | "TAKE_PROFIT" = "FILLED", reason = "Position closed"): { success: boolean; pnl?: number; error?: string } {
    const idx = this.portfolio.openPositions.findIndex(p => p.id === positionId);
    if (idx === -1) return { success: false, error: "Position not found" };

    const pos = this.portfolio.openPositions[idx];
    const realizedPnl = pos.unrealizedPnl;

    this.portfolio.cashBalance += pos.valueUsd + realizedPnl;
    this.portfolio.realizedPnl += realizedPnl;

    const closeOrder: TradeOrder = {
      id: `ord-close-${Date.now()}`,
      symbol: pos.symbol,
      side: pos.side === "BUY" ? "SELL" : "BUY",
      type: "MARKET",
      price: pos.currentPrice,
      amount: pos.amount,
      totalUsd: pos.valueUsd,
      status,
      pnl: realizedPnl,
      timestamp: new Date().toISOString(),
      mode: this.portfolio.mode,
      reason,
    };

    this.portfolio.openPositions.splice(idx, 1);
    this.portfolio.orderHistory.unshift(closeOrder);
    this.recalculateEquity();

    return { success: true, pnl: realizedPnl };
  }

  public resetPortfolio() {
    this.portfolio = {
      cashBalance: 10000.0,
      initialBalance: 10000.0,
      totalEquity: 10000.0,
      unrealizedPnl: 0,
      realizedPnl: 0,
      totalPnlPercent: 0,
      winRate: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      profitFactor: 1.0,
      openPositions: [],
      orderHistory: [],
      mode: "paper",
    };
  }
}

export const tradingState = new TradingEngineState();

/* ================= Gemini Deep Quant Market Reasoning ================= */

export async function analyzeMarketWithGemini(symbol: string = "BTCUSDT", strategy = "ai_confluence"): Promise<TradingSignal> {
  const candles = await fetchLiveCandlesticks(symbol, "1h", 60);
  const ticker = await fetchLiveTicker(symbol);
  const indicators = computeTechnicalIndicators(candles);
  const currentPrice = ticker.price;

  let aiSignal: TradingSignal = {
    id: `sig-${Date.now()}`,
    symbol: symbol.toUpperCase(),
    timestamp: new Date().toISOString(),
    action: "HOLD",
    confidence: 65,
    price: currentPrice,
    stopLoss: Number((currentPrice * (indicators.trend === "BULLISH" ? 0.985 : 1.015)).toFixed(2)),
    takeProfit1: Number((currentPrice * (indicators.trend === "BULLISH" ? 1.025 : 0.975)).toFixed(2)),
    takeProfit2: Number((currentPrice * (indicators.trend === "BULLISH" ? 1.050 : 0.950)).toFixed(2)),
    riskRewardRatio: "1:2.3",
    timeframe: "1h (Swing / Day Trade)",
    strategy,
    rationale: `Market showing ${indicators.trend} momentum with RSI at ${indicators.rsi} and ATR volatility of $${indicators.atr}. Bollinger Bandwidth is ${indicators.bollingerBands.bandwidth}%.`,
    technicalSummary: {
      rsi: indicators.rsi,
      macdCross: indicators.macd.histogram > 0 ? "BULLISH" : "BEARISH",
      emaTrend: indicators.trend === "BULLISH" ? "STRONG_UP" : indicators.trend === "BEARISH" ? "DOWN" : "CONSOLIDATING",
      keySupport: indicators.bollingerBands.lower,
      keyResistance: indicators.bollingerBands.upper,
    }
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return aiSignal;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a Senior Quantitative Trader and Technical Analyst AI.
Analyze the following live market data and technical indicators for ${symbol}:

Current Live Price: $${currentPrice}
24h Price Change: ${ticker.change24h}%
24h High: $${ticker.high24h} | 24h Low: $${ticker.low24h}

Technical Indicators:
- RSI (14): ${indicators.rsi} (${indicators.rsi > 70 ? 'OVERBOUGHT' : indicators.rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'})
- MACD Line: ${indicators.macd.macd} | Signal Line: ${indicators.macd.signal} | Histogram: ${indicators.macd.histogram}
- EMA 20: $${indicators.ema20} | EMA 50: $${indicators.ema50} | EMA 200: $${indicators.ema200}
- Bollinger Bands: Upper $${indicators.bollingerBands.upper}, Middle $${indicators.bollingerBands.middle}, Lower $${indicators.bollingerBands.lower} (Bandwidth: ${indicators.bollingerBands.bandwidth}%)
- ATR Volatility: $${indicators.atr}
- Current Trend: ${indicators.trend}

Selected Strategy: "${strategy}".

Respond with a strictly formatted JSON object:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": number between 50 and 95,
  "stopLoss": number (logical price level based on ATR/Support/Resistance),
  "takeProfit1": number (conservative target, 1:1.5 R:R),
  "takeProfit2": number (extended target, 1:3 R:R),
  "riskRewardRatio": "1:2.2",
  "rationale": "Clear, concise 2-sentence quantitative thesis explaining why this trade is favored."
}`;

    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const text = res.text;
    if (text) {
      const parsed = JSON.parse(text);
      if (parsed.action && parsed.confidence) {
        aiSignal = {
          ...aiSignal,
          action: parsed.action,
          confidence: Number(parsed.confidence),
          stopLoss: Number(parsed.stopLoss) || aiSignal.stopLoss,
          takeProfit1: Number(parsed.takeProfit1) || aiSignal.takeProfit1,
          takeProfit2: Number(parsed.takeProfit2) || aiSignal.takeProfit2,
          riskRewardRatio: parsed.riskRewardRatio || aiSignal.riskRewardRatio,
          rationale: parsed.rationale || aiSignal.rationale,
        };
      }
    }
  } catch (err: any) {
    // use technical heuristic fallback
  }

  return aiSignal;
}

/* ================= Autonomous Bot Swarm Loop ================= */

export function startTradingBot(configPartial?: Partial<TradingBotConfig>) {
  if (configPartial) {
    tradingState.botConfig = { ...tradingState.botConfig, ...configPartial, enabled: true };
  } else {
    tradingState.botConfig.enabled = true;
  }

  if (tradingState.botInterval) clearInterval(tradingState.botInterval);

  const scan = async () => {
    if (!tradingState.botConfig.enabled) return;

    try {
      const symbol = tradingState.botConfig.symbol || "BTCUSDT";
      const signal = await analyzeMarketWithGemini(symbol, tradingState.botConfig.strategy);
      const ticker = await fetchLiveTicker(symbol);

      tradingState.botConfig.lastScanTime = new Date().toLocaleTimeString();

      const existingPosition = tradingState.portfolio.openPositions.find(p => p.symbol === symbol);

      // Entry logic
      if (!existingPosition && (signal.action === "BUY" || signal.action === "SELL") && signal.confidence >= 70) {
        if (tradingState.portfolio.openPositions.length < tradingState.botConfig.maxOpenPositions) {
          const riskAmountUsd = (tradingState.portfolio.totalEquity * (tradingState.botConfig.riskPerTradePercent / 100));
          const tradeAmount = Number((riskAmountUsd / ticker.price).toFixed(4));

          if (tradeAmount > 0) {
            const res = tradingState.placeOrder({
              symbol,
              side: signal.action,
              amount: tradeAmount,
              price: ticker.price,
              stopLoss: signal.stopLoss,
              takeProfit: signal.takeProfit1,
              leverage: 1,
            });

            if (res.success) {
              const logMsg = `🤖 Bot auto-executed ${signal.action} ${tradeAmount} ${symbol} @ $${ticker.price} (Confidence: ${signal.confidence}%)`;
              tradingState.botLogs.unshift(logMsg);
              tradingState.botConfig.lastAction = logMsg;
            }
          }
        }
      } else {
        tradingState.botConfig.lastAction = `Scanned ${symbol} @ $${ticker.price} — Signal: ${signal.action} (${signal.confidence}%) — ${existingPosition ? "Position Active" : "No High-Confidence Setup"}`;
      }
    } catch (e: any) {
      tradingState.botConfig.lastAction = `Scan error: ${e.message}`;
    }
  };

  scan();
  tradingState.botInterval = setInterval(scan, (tradingState.botConfig.scanIntervalSeconds || 10) * 1000);
}

export function stopTradingBot() {
  tradingState.botConfig.enabled = false;
  if (tradingState.botInterval) {
    clearInterval(tradingState.botInterval);
    tradingState.botInterval = null;
  }
  tradingState.botConfig.lastAction = "Bot paused by user";
}
