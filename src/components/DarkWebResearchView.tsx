import React, { useState } from "react";
import { ShieldCheck, Search, AlertTriangle, Globe, Eye, Lock, FileText } from "lucide-react";

export const DarkWebResearchView: React.FC = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("general-osint");
  const [justification, setJustification] = useState("");
  const [onion, setOnion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    setError(null); setResult(null);
    if (!query.trim() || query.trim().length < 3) { setError("Query min 3 chars"); return; }
    if (!justification.trim() || justification.trim().length < 10) { setError("Justification min 10 chars — describe legitimate research purpose. All queries are logged."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/osint/darkweb/research", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category, justification, onionAddress: onion || undefined })
      });
      const j = await res.json();
      if (!res.ok) setError(j.error || "Research failed");
      else setResult(j);
    } catch (e:any) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="flex-1 h-full bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 space-y-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white grid place-items-center"><ShieldCheck className="w-5 h-5" /></div>
          <div className="flex-1">
            <h2 className="text-base font-bold font-serif text-stone-900">Dark Web OSINT — Threat Intel Research</h2>
            <p className="text-xs text-stone-600">Legitimate security research only. Tor via SOCKS5H for .onion OSINT. All queries logged with justification.</p>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800">LOGGED • AUDITED</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-amber-900 leading-relaxed">
            <div className="font-bold">Ethics guard — read before you research:</div>
            <ul className="list-disc ml-4 space-y-0.5 text-amber-800">
              <li>For <b>threat hunting, leaked credential monitoring, ransomware chatter, IOC correlation</b> only.</li>
              <li><b>Do not</b> facilitate illegal market, weapon, or drug trade. This tool blocks market addresses and logs all queries.</li>
              <li>Requires <b>justification</b> (min 10 chars) and valid <b>.onion v2/v3</b> format if you supply an onion address.</li>
              <li>Install Tor locally for .onion: <a href="https://www.torproject.org/download/" target="_blank" rel="noreferrer" className="underline">torproject.org/download</a> (SOCKS5H 127.0.0.1:9050) or Tor Browser. Without Tor, clearnet threat intel still works.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Research query *</label>
              <input value={query} onChange={e=> setQuery(e.target.value)} placeholder="e.g. leaked credentials for example.com, ransomware group LockBit chatter" className="w-full px-3 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none focus:border-stone-400" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Category *</label>
              <select value={category} onChange={e=> setCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none">
                <option value="general-osint">general-osint</option>
                <option value="threat-actor">threat-actor</option>
                <option value="leaked-credentials">leaked-credentials</option>
                <option value="ransomware">ransomware</option>
                <option value="ioc">ioc</option>
                <option value="phishing">phishing</option>
                <option value="vulnerability">vulnerability</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Justification — legitimate research purpose *</label>
            <textarea value={justification} onChange={e=> setJustification(e.target.value)} placeholder="e.g. Threat hunting for client Acme — checking if corporate domain appears in dark web leak collections (OSINT, with consent)" rows={2} className="w-full px-3 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none resize-none" />
            <div className="text-[10px] text-stone-400">{justification.length}/300 • logged with email + IP</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">.onion address (optional, v2/v3 only)</label>
            <input value={onion} onChange={e=> setOnion(e.target.value)} placeholder="e.g. 3g2upl4pq6kufc4m.onion (16) or 56-char v3.onion — market addresses blocked" className="w-full px-3 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs font-mono focus:outline-none" />
            <div className="text-[10px] text-stone-400">Validated: 16 or 56 base32 + .onion . No illegal market facilitation.</div>
          </div>
          <button onClick={handleResearch} disabled={loading} className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Search className="w-3.5 h-3.5 animate-pulse" /> Researching…</> : <><Eye className="w-3.5 h-3.5" /> Research via Tor + Threat Intel</>}
          </button>
          {error && <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">{error}</div>}
        </div>

        {result && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-bold border ${result.torAvailable ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-stone-100 border-stone-200 text-stone-600"}`}>{result.torAvailable ? "Tor: Available (SOCKS5H)" : "Tor: Not detected"}</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-mono">{result.mode}</span>
              <span className="text-stone-400 font-mono text-[11px]">logId {result.logId}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">{result.warning}</div>
            <div className="text-xs text-stone-700 leading-relaxed bg-[#faf8f5] border border-stone-200 rounded-xl p-3 whitespace-pre-wrap">{result.summary}</div>

            {result.table && (
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-xs border-collapse">
                  <thead><tr className="bg-stone-900 text-white">{result.table.headers.map((h:string,i:number)=><th key={i} className="px-3 py-2 text-left font-bold border-b border-stone-200 whitespace-nowrap">{h}</th>)}</tr></thead>
                  <tbody>{result.table.rows.map((r:string[],ri:number)=>(
                    <tr key={ri} className={ri%2===0?"bg-white":"bg-stone-50"}>
                      {r.map((c:string,ci:number)=> <td key={ci} className="px-3 py-2 border-b border-stone-100 align-top">{c}</td>)}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

            {result.findings && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Findings (defensive)</div>
                {result.findings.map((f:any,i:number)=>(
                  <div key={i} className="p-3 rounded-xl border border-stone-200 bg-[#fafaf9] flex gap-3">
                    <div className={`w-1.5 self-stretch rounded-full ${f.risk==="high"?"bg-red-500":f.risk==="medium"?"bg-amber-500":"bg-emerald-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-stone-900 truncate">{f.indicator}</div>
                      <div className="text-[11px] text-stone-600">{f.type} • risk {f.risk} • {f.mitigation}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded-xl p-2.5">
              <div className="font-bold text-stone-700 flex items-center gap-1"><Lock className="w-3 h-3" /> Next steps</div>
              <div>{result.nextSteps}</div>
            </div>
          </div>
        )}

        <div className="bg-stone-900 text-stone-300 rounded-2xl p-4 space-y-2 border border-stone-800">
          <div className="flex items-center gap-2 text-xs font-bold text-white"><FileText className="w-3.5 h-3.5" /> How this stays legitimate</div>
          <ul className="text-xs leading-relaxed list-disc ml-4 space-y-1 text-stone-400">
            <li>All queries logged: <code className="bg-white/10 px-1 rounded">POST /api/osint/darkweb/research</code> → <code>pushLog warn DarkWeb-OSINT</code> + <code>DARKWEB_RESEARCH_LOG:100</code>.</li>
            <li>Only <b>OSINT</b> — leaked creds, IOCs, ransomware chatter via Gemini + threat intel, not market listings.</li>
            <li>Tor is optional anonymity layer for .onion OSINT; without Tor, still correlates clearnet IOCs via <code>correlate_threat_intelligence</code>-style.</li>
            <li>Admin audit: <code>GET /api/osint/darkweb/logs</code> requires <code>x-lb-token</code> unless same user.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
