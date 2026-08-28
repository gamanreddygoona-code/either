import React, { useState } from "react";
import { 
  Globe, 
  Users, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Server,
  Layers
} from "lucide-react";
import { UrlTrafficReport } from "../types";

interface TrafficAnalyticsCardProps {
  report: UrlTrafficReport;
  onInspectAnother?: (url: string) => void;
}

export const TrafficAnalyticsCard: React.FC<TrafficAnalyticsCardProps> = ({ report, onInspectAnother }) => {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h");
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; hour: string; visitors: number; online: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localReport, setLocalReport] = useState<UrlTrafficReport>(report);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/analytics/inspect-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: localReport.url }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setLocalReport(data.report);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const trafficData = localReport.hourlyTraffic || [];
  const maxVisitors = Math.max(...trafficData.map((d) => d.visitors), 10);
  const chartWidth = 560;
  const chartHeight = 160;
  const padding = 20;

  // Build SVG Path coordinates
  const points = trafficData.map((d, i) => {
    const x = padding + (i / Math.max(trafficData.length - 1, 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - (d.visitors / maxVisitors) * (chartHeight - padding * 2 - 10);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i, arr) => {
    if (i === 0) return "M " + p.x + " " + p.y;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return acc + " C " + cx + " " + prev.y + ", " + cx + " " + p.y + ", " + p.x + " " + p.y;
  }, "");

  const areaD = points.length > 0 
    ? pathD + " L " + points[points.length - 1].x + " " + (chartHeight - padding) + " L " + points[0].x + " " + (chartHeight - padding) + " Z"
    : "";

  return (
    <div className="my-3 w-full max-w-2xl bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl p-4 sm:p-5 shadow-xl font-sans overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-stone-950 font-bold shadow-md">
            <Globe className="w-4 h-4 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">{localReport.domain}</span>
              <a 
                href={localReport.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-stone-400 hover:text-emerald-400 transition-colors"
                title="Open URL"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              {localReport.isSelfApp && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  Primary Node
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-stone-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                <span className="text-emerald-400 font-medium">{localReport.status}</span>
              </span>
              <span>•</span>
              <span>HTTP {localReport.httpStatus}</span>
              <span>•</span>
              <span>{localReport.latencyMs}ms latency</span>
            </div>
          </div>
        </div>

        {/* Live Online Users Badge */}
        <div className="flex items-center space-x-2 bg-stone-950/80 border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 leading-none">Online Now</div>
            <div className="text-sm font-extrabold text-white leading-tight">
              {localReport.onlineUsers} <span className="text-[10px] font-normal text-stone-400">users</span>
            </div>
          </div>
          <button 
            onClick={handleRefresh} 
            className={"p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-all " + (isRefreshing ? "animate-spin text-emerald-400" : "")}
            title="Refresh live metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
        <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-2.5">
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-400 mb-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>24h Total Visits</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {localReport.totalVisitors.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center space-x-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs prev day</span>
          </div>
        </div>

        <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-2.5">
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Peak Online (24h)</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {localReport.peakOnline24h}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            Concurrent max
          </div>
        </div>

        <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-2.5">
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg Session</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {Math.floor(localReport.avgDurationSec / 60)}m {localReport.avgDurationSec % 60}s
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            Bounce: {localReport.bounceRatePercent}%
          </div>
        </div>

        <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-2.5">
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span>Server / Ping</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {localReport.latencyMs} <span className="text-xs font-normal text-stone-400">ms</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5 truncate" title={localReport.serverLocation}>
            Edge Anycast
          </div>
        </div>
      </div>

      {/* Interactive Time-Series Area Graph */}
      <div className="bg-stone-950/90 border border-stone-800/90 rounded-xl p-3 my-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-stone-200">Real-Time Traffic Trajectory</span>
          </div>
          <div className="flex items-center space-x-1 bg-stone-900 rounded-lg p-0.5 border border-stone-800">
            {(["24h", "7d", "30d"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={"px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors " + (timeframe === tf ? "bg-emerald-600 text-white" : "text-stone-400 hover:text-white")}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full h-36">
          <svg className="w-full h-full overflow-visible" viewBox={"0 0 " + chartWidth + " " + chartHeight} preserveAspectRatio="none">
            <defs>
              <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0.25, 0.5, 0.75].map((ratio, idx) => (
              <line
                key={idx}
                x1={padding}
                y1={padding + ratio * (chartHeight - padding * 2)}
                x2={chartWidth - padding}
                y2={padding + ratio * (chartHeight - padding * 2)}
                stroke="#262626"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Filled Area */}
            {areaD && <path d={areaD} fill="url(#trafficGradient)" />}

            {/* Main Spline Curve */}
            {pathD && <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />}

            {/* Interactive Points */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.index === idx ? 5 : 2.5}
                fill={hoveredPoint?.index === idx ? "#34d399" : "#10b981"}
                stroke="#09090b"
                strokeWidth="1.5"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredPoint({ index: idx, hour: p.hour, visitors: p.visitors, online: p.online })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div 
              className="absolute top-2 left-1/2 -translate-x-1/2 bg-stone-900 border border-emerald-500/50 rounded-lg px-3 py-1.5 shadow-xl text-xs text-white pointer-events-none flex items-center space-x-3 animate-fadeIn z-10"
            >
              <span className="font-mono text-stone-400">{hoveredPoint.hour}</span>
              <span className="text-emerald-400 font-bold">{hoveredPoint.visitors.toLocaleString()} visitors</span>
              <span className="text-cyan-400 font-medium">({hoveredPoint.online} online)</span>
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-[10px] text-stone-500 font-mono pt-1 px-2 border-t border-stone-800/60">
          <span>24h ago</span>
          <span>18h ago</span>
          <span>12h ago</span>
          <span>6h ago</span>
          <span className="text-emerald-400 font-semibold">Now (Live)</span>
        </div>
      </div>

      {/* Geographies & Host Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-stone-800 text-xs">
        <div>
          <div className="text-[11px] font-semibold text-stone-400 mb-1.5 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Top Geographies by Traffic</span>
          </div>
          <div className="space-y-1.5">
            {localReport.countryDistribution.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center space-x-1.5 text-stone-300">
                  <span>{c.flag}</span>
                  <span>{c.country}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-stone-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: c.percent + "%" }}></div>
                  </div>
                  <span className="font-mono text-stone-400 w-7 text-right">{c.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-stone-400 mb-1.5 flex items-center space-x-1">
            <Server className="w-3 h-3 text-violet-400" />
            <span>Network & Infrastructure</span>
          </div>
          <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-2.5 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-500">Host IP:</span>
              <span className="font-mono text-stone-300">{localReport.dnsResolvedIp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Security:</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>TLS 1.3 Active</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Last Synced:</span>
              <span className="text-stone-300">{localReport.lastChecked}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
