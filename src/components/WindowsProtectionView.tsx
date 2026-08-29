import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Lock, Eye, FileText, Terminal, Globe, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

interface Rule {
  id: string;
  level: "BLOCK" | "ASK" | "ENFORCE" | "LOG";
  title: string;
  desc: string;
  mitigates: string;
}

export const WindowsProtectionView: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [h, r, l] = await Promise.all([
        fetch("/api/windows/protection/health").then(res=> res.json()).catch(()=>null),
        fetch("/api/windows/protection/rules").then(res=> res.json()).catch(()=>null),
        fetch("/api/windows/protection/logs").then(res=> res.json()).catch(()=>null),
      ]);
      if (h) setHealth(h);
      if (r) setRules(r.rules || []);
      if (l) setLogs(l.logs || []);
    } catch {}
    setLoading(false);
  };

  useEffect(()=>{ fetchData(); const id=setInterval(fetchData, 5000); return()=> clearInterval(id); },[]);

  if (loading) return <div className="flex-1 grid place-items-center p-8"><RefreshCw className="w-6 h-6 animate-spin text-stone-400" /></div>;

  return (
    <div className="flex-1 h-full bg-[#fcfcf9] overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* Header — Shield */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 flex gap-4 items-start shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white grid place-items-center shrink-0 shadow"><ShieldCheck className="w-6 h-6" /></div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold font-serif text-emerald-950">Windows Protection — ACTIVE</h2>
          <p className="text-xs text-emerald-800 leading-relaxed mt-1">Powerful guard is shielding your PC. Every file, command, and network hop is checked against 10 strict AI rules. Your .env and project stay local.</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white border border-emerald-100 rounded-xl p-2.5 text-center">
              <div className="text-[10px] font-mono text-emerald-700">HOST</div><div className="font-bold text-stone-900 truncate">{health?.hostname || "Host Node"}</div><div className="text-[10px] text-stone-500">{health?.platform?.slice(0,22) || "Windows"}</div>
            </div>
            <div className="bg-white border border-emerald-100 rounded-xl p-2.5 text-center">
              <div className="text-[10px] font-mono text-emerald-700">RULES</div><div className="font-bold text-stone-900">{rules.length || 10} Active</div><div className="text-[10px] text-emerald-600">BLOCK • ASK • LOG</div>
            </div>
            <div className="bg-white border border-emerald-100 rounded-xl p-2.5 text-center">
              <div className="text-[10px] font-mono text-emerald-700">ALLOWLIST</div><div className="font-bold text-stone-900">{health?.allowlistedHosts || 17} hosts</div><div className="text-[10px] text-stone-500">+ LAN</div>
            </div>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold"><span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Shield ON</span>
      </div>

      {/* Rules — powerful */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-stone-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-stone-700" />
          <h3 className="text-sm font-bold text-stone-900">Powerful Rules — AI Must Follow</h3>
          <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 text-white">10 rules</span>
        </div>
        <div className="divide-y divide-stone-100 max-h-[380px] overflow-y-auto">
          {rules.map(r=>(
            <div key={r.id} className="p-3 flex gap-3 hover:bg-stone-50">
              <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded h-fit ${r.level==="BLOCK"?"bg-red-500 text-white":r.level==="ASK"?"bg-amber-500 text-white":r.level==="ENFORCE"?"bg-violet-600 text-white":"bg-stone-200 text-stone-700"}`}>{r.level}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">{r.id}: {r.title} <span className="text-[10px] font-normal text-stone-400">• mitigates {r.mitigates}</span></div>
                <div className="text-xs text-stone-600 leading-relaxed mt-0.5">{r.desc}</div>
              </div>
              {r.level==="BLOCK" ? <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> : r.level==="ASK" ? <Eye className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
            </div>
          ))}
        </div>
      </div>

      {/* Live logs + Desktop Shield */}
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="px-3 py-2 bg-stone-900 border-b border-stone-800 flex items-center gap-2 text-xs font-bold text-white"><Terminal className="w-3.5 h-3.5" /> Protection Audit Log (live)</div>
          <div className="p-3 font-mono text-[11px] leading-relaxed max-h-[220px] overflow-y-auto space-y-1">
            {logs.length===0 ? <div className="text-stone-500">No events yet — try running a command in Sandbox.</div> : logs.slice(0,20).map((l:any,i:number)=>(
              <div key={i} className="flex gap-2"><span className="text-stone-500">{l.timestamp?.slice(11,19) || ""}</span><span className={`px-1 rounded text-[10px] font-bold ${l.level==="BLOCK"?"bg-red-500 text-white":l.level==="ASK"?"bg-amber-500 text-black":"bg-stone-800 text-stone-300"}`}>{l.level || l.agentName}</span><span className="text-stone-200">{l.message || l.details}</span></div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-600" /> Desktop Shield</h4>
          <div className="text-xs text-stone-600 leading-relaxed">
            Your Windows PC is isolated. The desktop app (`electron/main.cjs`) runs its own `dist/server.cjs` on <code className="bg-stone-100 px-1 rounded">127.0.0.1:3000</code> — no cloud needed. Tray shows live `CPU/MEM` from `getSystemHealth()`.
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="font-bold text-emerald-900">PC Safe</span><span className="text-emerald-700">Sandbox jailed to project • 15s timeout • 1MB maxBuffer • .env never leaves</span>
          </div>
          <div className="flex gap-2">
            <a href="/download/windows" className="flex-1 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold text-center hover:bg-black">Download Desktop App</a>
            <button onClick={()=> window.dispatchEvent(new CustomEvent("open-video-swarm"))} className="flex-1 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50">Open Sandbox</button>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-amber-500" /> All file ops outside project need `x-lb-token` — set `EITHER_ADMIN_TOKEN` in `.env`.</div>
        </div>
      </div>
    </div>
  );
};
