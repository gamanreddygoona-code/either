import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Bot, 
  Zap, 
  ShieldAlert, 
  Activity, 
  DollarSign, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  Play, 
  Square, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BarChart2, 
  Target, 
  Lock, 
  Layers, 
  Maximize2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { 
  CandleStickData, 
  TechnicalIndicators, 
  TradingSignal, 
  TradePosition, 
  TradeOrder, 
  TradingPortfolio, 
  TradingBotConfig 
} from "../types";

const SYMBOLS = [
  { id: "BTCUSDT", label: "BTC/USDT", name: "Bitcoin", icon: "₿" },
  { id: "ETHUSDT", label: "ETH/USDT", name: "Ethereum", icon: "Ξ" },
  { id: "SOLUSDT", label: "SOL/USDT", name: "Solana", icon: "◎" },
  { id: "BNBUSDT", label: "BNB/USDT", name: "Binance Coin", icon: "🔶" },
  { id: "XRPUSDT", label: "XRP/USDT", name: "Ripple", icon: "✕" },
  { id: "DOGEUSDT", label: "DOGE/USDT", name: "Dogecoin", icon: "Ð" },
];

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

const STRATEGIES = [
  { id: "ai_confluence", name: "Gemini AI Confluence", desc: "Multi-indicator reasoning & sentiment synthesis" },
  { id: "rsi_reversion", name: "RSI Mean Reversion", desc: "Buy <30 oversold, Sell >70 overbought" },
  { id: "breakout_momentum", name: "Bollinger Volatility Breakout", desc: "Captures high-volume band expansions" },
  { id: "ema_cross", name: "EMA Golden / Death Cross", desc: "Trend following via EMA 20 & 50 crossovers" },
  { id: "scalper", name: "High-Frequency AI Scalper", desc: "Micro-pullback captures with tight stop-losses" },
];

export const AITradingDesk: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [candles, setCandles] = useState<CandleStickData[]>([]);
  const [ticker, setTicker] = useState<any>({ price: 0, change24h: 0, high24h: 0, low24h: 0, volume24h: 0 });
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [portfolio, setPortfolio] = useState<TradingPortfolio | null>(null);
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [botConfig, setBotConfig] = useState<TradingBotConfig | null>(null);
  const [botLogs, setBotLogs] = useState<string[]>([]);
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);

  // Order Dock Form State
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [orderAmount, setOrderAmount] = useState<string>("0.05");
  const [orderLeverage, setOrderLeverage] = useState<number>(1);
  const [orderStopLoss, setOrderStopLoss] = useState<string>("");
  const [orderTakeProfit, setOrderTakeProfit] = useState<string>("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const prevPriceRef = useRef<number>(0);

  // Fetch Market Data & Indicators
  const fetchMarketData = async () => {
    try {
      const res = await fetch(`/api/trading/market-data?symbol=${selectedSymbol}&interval=${timeframe}&limit=60`);
      const data = await res.json();
      if (data.success) {
        setCandles(data.candles || []);
        setIndicators(data.indicators);
        if (prevPriceRef.current && data.ticker.price !== prevPriceRef.current) {
          setPriceFlash(data.ticker.price > prevPriceRef.current ? "up" : "down");
          setTimeout(() => setPriceFlash(null), 800);
        }
        prevPriceRef.current = data.ticker.price;
        setTicker(data.ticker);
      }
    } catch (err) {}
  };

  // Fetch Portfolio State
  const fetchPortfolio = async () => {
    try {
      const res = await fetch("/api/trading/portfolio");
      const data = await res.json();
      if (data.success) setPortfolio(data.portfolio);
    } catch (err) {}
  };

  // Fetch Bot Status
  const fetchBotStatus = async () => {
    try {
      const res = await fetch("/api/trading/bot/status");
      const data = await res.json();
      if (data.success) {
        setBotConfig(data.config);
        setBotLogs(data.logs || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMarketData();
    fetchPortfolio();
    fetchBotStatus();

    const interval = setInterval(() => {
      fetchMarketData();
      fetchPortfolio();
      fetchBotStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedSymbol, timeframe]);

  // Run Gemini AI Market Analysis
  const runAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/trading/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: selectedSymbol, strategy: botConfig?.strategy || "ai_confluence" }),
      });
      const data = await res.json();
      if (data.success) {
        setSignal(data.signal);
        if (data.signal.stopLoss) setOrderStopLoss(String(data.signal.stopLoss));
        if (data.signal.takeProfit1) setOrderTakeProfit(String(data.signal.takeProfit1));
        if (data.signal.action === "BUY" || data.signal.action === "SELL") {
          setOrderSide(data.signal.action);
        }
      }
    } catch (e) {
    } finally {
      setAnalyzing(false);
    }
  };

  // Place Order Handler
  const handleExecuteOrder = async () => {
    setOrderSubmitting(true);
    setOrderFeedback(null);
    try {
      const res = await fetch("/api/trading/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedSymbol,
          side: orderSide,
          amount: parseFloat(orderAmount),
          leverage: orderLeverage,
          price: ticker.price,
          stopLoss: orderStopLoss ? parseFloat(orderStopLoss) : undefined,
          takeProfit: orderTakeProfit ? parseFloat(orderTakeProfit) : undefined,
          type: orderType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderFeedback({ type: "success", msg: `Filled ${orderSide} ${orderAmount} ${selectedSymbol} @ $${ticker.price}` });
        fetchPortfolio();
      } else {
        setOrderFeedback({ type: "error", msg: data.error || "Order execution failed" });
      }
    } catch (err: any) {
      setOrderFeedback({ type: "error", msg: err.message || "Network error executing order" });
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Close Position Handler
  const handleClosePosition = async (positionId: string) => {
    try {
      const res = await fetch("/api/trading/positions/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId }),
      });
      const data = await res.json();
      if (data.success) fetchPortfolio();
    } catch (err) {}
  };

  // Bot Toggle Handler
  const handleToggleBot = async () => {
    const isRunning = botConfig?.enabled;
    const endpoint = isRunning ? "/api/trading/bot/stop" : "/api/trading/bot/start";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: isRunning ? "{}" : JSON.stringify({ symbol: selectedSymbol, strategy: "ai_confluence", riskPerTradePercent: 2 }),
      });
      const data = await res.json();
      if (data.success) setBotConfig(data.config);
    } catch (err) {}
  };

  // Portfolio Reset
  const handleResetPortfolio = async () => {
    if (confirm("Reset paper trading portfolio balance to $10,000.00 USDT?")) {
      await fetch("/api/trading/portfolio/reset", { method: "POST" });
      fetchPortfolio();
    }
  };

  // SVG Chart Dimensions & Calculation
  const chartHeight = 260;
  const chartWidth = 720;
  const candleWidth = candles.length > 0 ? Math.max(chartWidth / candles.length - 3, 4) : 8;

  const minPrice = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) * 0.998 : 1;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) * 1.002 : 2;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val: number) => chartHeight - ((val - minPrice) / priceRange) * (chartHeight - 30) - 15;

  return (
    <div className="flex-1 h-full bg-[#f6f3ee] text-stone-900 overflow-y-auto flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <header className="bg-[#faf8f5] border-b border-[#e5dfd3] px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4 shadow-xs sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-stone-900 tracking-tight font-serif">AI Trading Desk</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Binance Feed
                </span>
              </div>
              <span className="text-xs text-stone-500">Autonomous Quant Strategy & Risk Execution</span>
            </div>
          </div>

          {/* Symbol Selector Pills */}
          <div className="hidden lg:flex items-center bg-[#ede7db] p-1 rounded-xl border border-[#ded7c8] space-x-1">
            {SYMBOLS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSymbol(s.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  selectedSymbol === s.id
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-900 hover:bg-[#e2dcce]"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Price & 24h Stats */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-[11px] text-stone-500 font-medium">{selectedSymbol} Mark Price</div>
              <div
                className={`text-xl font-mono font-bold transition-colors ${
                  priceFlash === "up"
                    ? "text-emerald-600"
                    : priceFlash === "down"
                    ? "text-rose-600"
                    : "text-stone-900"
                }`}
              >
                ${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 border ${
                ticker.change24h >= 0
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {ticker.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{ticker.change24h >= 0 ? `+${ticker.change24h}%` : `${ticker.change24h}%`}</span>
            </div>
          </div>

          {/* Quick Portfolio Equity Card */}
          <div className="hidden sm:flex items-center bg-[#ede7db] px-3.5 py-1.5 rounded-xl border border-[#ded7c8] space-x-3">
            <div>
              <div className="text-[10px] text-stone-500 font-medium">Paper Equity</div>
              <div className="text-sm font-mono font-bold text-stone-900">
                ${portfolio?.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "10,000.00"}
              </div>
            </div>
            <div className="h-6 w-px bg-stone-300"></div>
            <div>
              <div className="text-[10px] text-stone-500 font-medium">PnL</div>
              <div
                className={`text-xs font-mono font-bold ${
                  (portfolio?.totalPnlPercent || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {(portfolio?.totalPnlPercent || 0) >= 0 ? `+${portfolio?.totalPnlPercent}%` : `${portfolio?.totalPnlPercent}%`}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Terminal View */}
      <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left Column: Live Chart & Analytics & Positions (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Chart Container Card */}
          <div className="bg-[#faf8f5] border border-[#e5dfd3] rounded-2xl p-5 shadow-xs space-y-4">
            {/* Chart Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ece6d9]">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-stone-900 font-serif">Candlestick Price Action</span>
                <span className="text-xs text-stone-400 font-mono">({timeframe})</span>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center bg-[#ede7db] p-0.5 rounded-lg border border-[#ded7c8] space-x-0.5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                      timeframe === tf
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-[#ded7c8]"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Candlestick Chart */}
            <div className="relative w-full h-[260px] bg-[#f2ece0]/60 rounded-xl border border-[#ded7c8] p-2 flex items-center justify-center overflow-hidden">
              {candles.length === 0 ? (
                <div className="flex items-center space-x-2 text-stone-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-xs">Loading market feed...</span>
                </div>
              ) : (
                <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="#ded7c8" strokeDasharray="3,3" />
                  <line x1="0" y1={chartHeight * 0.50} x2={chartWidth} y2={chartHeight * 0.50} stroke="#ded7c8" strokeDasharray="3,3" />
                  <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="#ded7c8" strokeDasharray="3,3" />

                  {/* Candlesticks */}
                  {candles.map((c, idx) => {
                    const x = (idx / candles.length) * chartWidth + candleWidth / 2;
                    const openY = getY(c.open);
                    const closeY = getY(c.close);
                    const highY = getY(c.high);
                    const lowY = getY(c.low);
                    const isBullish = c.close >= c.open;
                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

                    return (
                      <g key={c.time + "-" + idx}>
                        {/* High/Low Wick */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={isBullish ? "#10b981" : "#ef4444"}
                          strokeWidth="1.2"
                        />
                        {/* Candle Body */}
                        <rect
                          x={x - candleWidth / 2}
                          y={bodyTop}
                          width={candleWidth}
                          height={bodyHeight}
                          fill={isBullish ? "#10b981" : "#ef4444"}
                          rx="1"
                        />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Technical Indicators Bar */}
            {indicators && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-[#ede7db] p-3 rounded-xl border border-[#ded7c8]">
                  <div className="text-[10px] text-stone-500 font-medium">RSI (14-Period)</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-bold text-sm text-stone-900">{indicators.rsi}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        indicators.rsi < 30
                          ? "bg-emerald-100 text-emerald-800"
                          : indicators.rsi > 70
                          ? "bg-rose-100 text-rose-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {indicators.rsi < 30 ? "Oversold" : indicators.rsi > 70 ? "Overbought" : "Neutral"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#ede7db] p-3 rounded-xl border border-[#ded7c8]">
                  <div className="text-[10px] text-stone-500 font-medium">MACD (12, 26, 9)</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-bold text-sm text-stone-900">{indicators.macd.histogram}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        indicators.macd.histogram >= 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {indicators.macd.histogram >= 0 ? "Bullish Hist" : "Bearish Hist"}
                    </span>
                  </div>
                </div>

                <div className="bg-[#ede7db] p-3 rounded-xl border border-[#ded7c8]">
                  <div className="text-[10px] text-stone-500 font-medium">EMA Trend Alignment</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-bold text-xs text-stone-900">${indicators.ema20} / ${indicators.ema50}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        indicators.trend === "BULLISH"
                          ? "bg-emerald-100 text-emerald-800"
                          : indicators.trend === "BEARISH"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {indicators.trend}
                    </span>
                  </div>
                </div>

                <div className="bg-[#ede7db] p-3 rounded-xl border border-[#ded7c8]">
                  <div className="text-[10px] text-stone-500 font-medium">Bollinger Volatility</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono font-bold text-sm text-stone-900">{indicators.bollingerBands.bandwidth}%</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase bg-amber-100 text-amber-800">
                      {indicators.volatility}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Open Positions Table */}
          <div className="bg-[#faf8f5] border border-[#e5dfd3] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-stone-900 font-serif">Active Positions</span>
                <span className="text-xs bg-stone-200 text-stone-700 font-mono px-2 py-0.5 rounded-full font-semibold">
                  {portfolio?.openPositions.length || 0}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-stone-500">Unrealized PnL:</span>
                <span
                  className={`font-mono font-bold ${
                    (portfolio?.unrealizedPnl || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  ${portfolio?.unrealizedPnl.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            {(!portfolio || portfolio.openPositions.length === 0) ? (
              <div className="text-center py-8 bg-[#f2ece0]/40 rounded-xl border border-dashed border-[#ded7c8] text-stone-400 text-xs">
                No active positions. Execute a trade or turn on the AI Bot Swarm.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#e5dfd3] text-stone-400 text-[11px]">
                      <th className="pb-2 font-normal">Symbol</th>
                      <th className="pb-2 font-normal">Side</th>
                      <th className="pb-2 font-normal">Size</th>
                      <th className="pb-2 font-normal">Entry</th>
                      <th className="pb-2 font-normal">Mark</th>
                      <th className="pb-2 font-normal">Stop / Target</th>
                      <th className="pb-2 font-normal text-right">Unrealized PnL</th>
                      <th className="pb-2 font-normal text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ece6d9]">
                    {portfolio.openPositions.map((pos) => (
                      <tr key={pos.id} className="hover:bg-[#f3ede1] transition-colors">
                        <td className="py-2.5 font-bold text-stone-900">{pos.symbol}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.side === "BUY"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {pos.side === "BUY" ? "LONG" : "SHORT"}
                          </span>
                        </td>
                        <td className="py-2.5">{pos.amount}</td>
                        <td className="py-2.5">${pos.entryPrice.toLocaleString()}</td>
                        <td className="py-2.5">${pos.currentPrice.toLocaleString()}</td>
                        <td className="py-2.5 text-[11px] text-stone-500">
                          SL: {pos.stopLoss ? `$${pos.stopLoss}` : "None"} | TP: {pos.takeProfit ? `$${pos.takeProfit}` : "None"}
                        </td>
                        <td className={`py-2.5 text-right font-bold ${pos.unrealizedPnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {pos.unrealizedPnl >= 0 ? `+$${pos.unrealizedPnl}` : `-$${Math.abs(pos.unrealizedPnl)}`} ({pos.unrealizedPnlPercent}%)
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleClosePosition(pos.id)}
                            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-semibold transition-all shadow-xs cursor-pointer"
                          >
                            Market Close
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Trade History Ledger */}
          <div className="bg-[#faf8f5] border border-[#e5dfd3] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-stone-900 font-serif">Trade Execution Ledger</span>
                <span className="text-xs text-stone-400 font-mono">
                  (Win Rate: {portfolio?.winRate || 0}% · Trades: {portfolio?.totalTrades || 0})
                </span>
              </div>
              <button
                onClick={handleResetPortfolio}
                className="text-[11px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
              >
                Reset Portfolio ($10k)
              </button>
            </div>

            {(!portfolio || portfolio.orderHistory.length === 0) ? (
              <div className="text-center py-6 bg-[#f2ece0]/40 rounded-xl border border-dashed border-[#ded7c8] text-stone-400 text-xs">
                No closed trades in history ledger.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#e5dfd3] text-stone-400 text-[11px]">
                      <th className="pb-2 font-normal">Time</th>
                      <th className="pb-2 font-normal">Symbol</th>
                      <th className="pb-2 font-normal">Side</th>
                      <th className="pb-2 font-normal">Price</th>
                      <th className="pb-2 font-normal">Status</th>
                      <th className="pb-2 font-normal text-right">Realized PnL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ece6d9]">
                    {portfolio.orderHistory.slice(0, 10).map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#f3ede1] transition-colors">
                        <td className="py-2 text-[11px] text-stone-500">{new Date(ord.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2 font-bold text-stone-900">{ord.symbol}</td>
                        <td className="py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              ord.side === "BUY" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {ord.side}
                          </span>
                        </td>
                        <td className="py-2">${ord.price.toLocaleString()}</td>
                        <td className="py-2 text-[11px]">
                          <span className="text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">{ord.status}</span>
                        </td>
                        <td className={`py-2 text-right font-bold ${ord.pnl !== undefined ? (ord.pnl >= 0 ? "text-emerald-600" : "text-rose-600") : "text-stone-400"}`}>
                          {ord.pnl !== undefined ? (ord.pnl >= 0 ? `+$${ord.pnl.toFixed(2)}` : `-$${Math.abs(ord.pnl).toFixed(2)}`) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Quant Copilot & Order Execution & Bot Swarm (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Gemini Deep Quant Signal Card */}
          <div className="bg-[#faf8f5] border border-[#e5dfd3] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-900 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900 font-serif">Gemini Quant Signal</div>
                  <div className="text-[10px] text-stone-500">Autonomous Alpha Generator</div>
                </div>
              </div>

              <button
                onClick={runAiAnalysis}
                disabled={analyzing}
                className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {analyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
                <span>{analyzing ? "Analyzing..." : "Analyze"}</span>
              </button>
            </div>

            {signal ? (
              <div className="space-y-3 bg-[#ede7db] p-4 rounded-xl border border-[#ded7c8]">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider ${
                      signal.action === "BUY"
                        ? "bg-emerald-600 text-white"
                        : signal.action === "SELL"
                        ? "bg-rose-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {signal.action} SIGNAL
                  </span>
                  <div className="text-right">
                    <div className="text-[10px] text-stone-500 font-medium">Confidence</div>
                    <div className="text-sm font-mono font-bold text-stone-900">{signal.confidence}%</div>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-sans italic border-l-2 border-purple-800 pl-2.5 py-0.5">
                  "{signal.rationale}"
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="bg-white/60 p-2 rounded-lg border border-[#ded7c8]/60">
                    <div className="text-[10px] text-stone-500">Stop-Loss</div>
                    <div className="font-bold text-rose-600">${signal.stopLoss}</div>
                  </div>
                  <div className="bg-white/60 p-2 rounded-lg border border-[#ded7c8]/60">
                    <div className="text-[10px] text-stone-500">Take-Profit 1</div>
                    <div className="font-bold text-emerald-600">${signal.takeProfit1}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-[#f2ece0]/40 rounded-xl border border-dashed border-[#ded7c8] text-stone-400 text-xs space-y-1">
                <p>No active AI Signal.</p>
                <p className="text-[11px] text-stone-400">Click <b>Analyze</b> to generate high-conviction trade setups.</p>
              </div>
            )}
          </div>

          {/* Autonomous Bot Swarm Control Card */}
          <div className="bg-[#faf8f5] border border-[#e5dfd3] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900 font-serif">Auto-Pilot Bot Swarm</div>
                  <div className="text-[10px] text-stone-500">24/7 Automated Execution</div>
                </div>
              </div>

              <button
                onClick={handleToggleBot}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                  botConfig?.enabled
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {botConfig?.enabled ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{botConfig?.enabled ? "Stop Bot" : "Start Bot"}</span>
              </button>
            </div>

            <div className="bg-[#ede7db] p-3 rounded-xl border border-[#ded7c8] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Active Strategy:</span>
                <span className="font-bold text-stone-900">Gemini AI Confluence</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Risk per Trade:</span>
                <span className="font-mono font-bold text-stone-900">2.0% Equity</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600 font-medium">Last Scan Status:</span>
                <span className="font-mono text-[10px] text-stone-500">{botConfig?.lastScanTime || "Never"}</span>
              </div>
              <div className="text-[11px] text-stone-700 italic border-t border-[#ded7c8] pt-2 truncate">
                {botConfig?.lastAction || "Bot is ready"}
              </div>
            </div>
          </div>

          {/* Manual / AI Order Dock */}
          <div className="bg-[#faf8f5] border border-[#e5dfd3] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-stone-900 font-serif">Execution Dock</span>
              <span className="text-[11px] text-stone-500 font-mono">
                Avail: ${portfolio?.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "10,000.00"}
              </span>
            </div>

            {/* Buy / Sell Selector */}
            <div className="grid grid-cols-2 gap-2 bg-[#ede7db] p-1 rounded-xl border border-[#ded7c8]">
              <button
                onClick={() => setOrderSide("BUY")}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderSide === "BUY"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-900"
                }`}
              >
                BUY / LONG
              </button>
              <button
                onClick={() => setOrderSide("SELL")}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderSide === "SELL"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-900"
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Order Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-stone-500 font-medium block mb-1">Amount ({selectedSymbol.replace("USDT", "")})</label>
                <input
                  type="number"
                  step="0.01"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                  placeholder="0.05"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-stone-500 font-medium block mb-1">Stop-Loss ($)</label>
                  <input
                    type="number"
                    value={orderStopLoss}
                    onChange={(e) => setOrderStopLoss(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 font-medium block mb-1">Take-Profit ($)</label>
                  <input
                    type="number"
                    value={orderTakeProfit}
                    onChange={(e) => setOrderTakeProfit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-stone-900 shadow-xs"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Order Feedback Alert */}
              {orderFeedback && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center space-x-1.5 ${
                    orderFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {orderFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="truncate">{orderFeedback.msg}</span>
                </div>
              )}

              {/* Submit Order Button */}
              <button
                onClick={handleExecuteOrder}
                disabled={orderSubmitting || parseFloat(orderAmount) <= 0}
                className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 ${
                  orderSide === "BUY"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {orderSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                <span>
                  Execute {orderSide} {orderAmount} {selectedSymbol} (~${(parseFloat(orderAmount || "0") * ticker.price).toFixed(2)})
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
