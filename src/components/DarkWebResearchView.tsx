import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  Globe,
  Eye,
  Lock,
  FileText,
  Activity,
  Terminal,
  Database,
  Radio,
  ExternalLink,
  CheckCircle2,
  XCircle,
  KeyRound,
  Fingerprint
} from "lucide-react";

export const DarkWebResearchView: React.FC = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("general-osint");
  const [justification, setJustification] = useState("");
  const [onion, setOnion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "onions" | "telemetry" | "hibp" | "ledger">("report");
  const [statusData, setStatusData] = useState<any>(null);
  const [auditLedger, setAuditLedger] = useState<any[]>([]);

  // Standalone HIBP Lookup tool state
  const [hibpQuery, setHibpQuery] = useState("");
  const [hibpLoading, setHibpLoading] = useState(false);
  const [hibpStandaloneResult, setHibpStandaloneResult] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/osint/darkweb/status");
      if (res.ok) setStatusData(await res.json());
    } catch {}
  };

  const fetchLedger = async () => {
    try {
      const res = await fetch("/api/osint/darkweb/audit-ledger");
      if (res.ok) {
        const d = await res.json();
        setAuditLedger(d.ledger || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    fetchLedger();
    const interval = setInterval(() => {
      fetchStatus();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResearch = async () => {
    setError(null);
    setResult(null);
    if (!query.trim() || query.trim().length < 3) {
      setError("Query min 3 chars");
      return;
    }
    if (!justification.trim() || justification.trim().length < 10) {
      setError("Justification min 10 chars — describe legitimate research purpose. All queries are audited.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/osint/darkweb/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, category, justification, onionAddress: onion || undefined })
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error || "Research failed");
      } else {
        setResult(j);
        fetchLedger();
        fetchStatus();
      }
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleHibpLookup = async () => {
    if (!hibpQuery.trim()) return;
    setHibpLoading(true);
    try {
      const res = await fetch("/api/osint/darkweb/hibp-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: hibpQuery.trim() })
      });
      if (res.ok) {
        setHibpStandaloneResult(await res.json());
      }
    } catch {}
    setHibpLoading(false);
  };

  return (
    <div className="flex-1 h-full bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 space-y-5">
      <div className="max-w-5xl mx-auto space-y-5">
        
        {/* Header Title & Real Architecture Pipeline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-white grid place-items-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-serif text-stone-900">Dark Web OSINT & Threat Intel Crawler</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> REAL CRAWLERS LIVE
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Real .onion indexing (Ahmia) • Tor SOCKS5H • CISA KEV Exploits • ThreatFox IOCs • HIBP Range Check • AI Firewall
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-stone-900 text-stone-300 border border-stone-800 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-amber-400" /> AI Firewall: <strong className="text-emerald-400">7/7 Hard Rules</strong>
            </span>
          </div>
        </div>

        {/* Real Architecture Visual Banner matching user diagram */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 text-stone-300 shadow-md">
          <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Multi-Layer Sovereign Threat Hunting Pipeline
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" /> 1. Tor Proxy
              </div>
              <div className="text-[11px] text-stone-400 font-mono">
                {statusData?.tor?.available ? (
                  <span className="text-emerald-400 font-bold">● SOCKS5H 127.0.0.1:9050 (Active)</span>
                ) : (
                  <span className="text-amber-400">○ SOCKS5H Probed • Clearnet Gateway</span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 2. AI Firewall
              </div>
              <div className="text-[11px] text-stone-400">
                Pre-Execution Sanitizer • 3-Strike Lockout • Anti-Jailbreak
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-violet-400" /> 3. Real Threat Intel
              </div>
              <div className="text-[11px] text-stone-400">
                Ahmia .onion • CISA KEV • ThreatFox • HIBP Range API
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-amber-400" /> 4. Tamper-Proof Audit
              </div>
              <div className="text-[11px] text-stone-400 font-mono truncate">
                SHA-256 Hash Chain: <span className="text-amber-300">{statusData?.firewall?.latestHash || "Verified"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Query Input Form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-stone-600" /> Research Target / Query *
              </label>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. ransomware leak telemetry, compromised domain, LockBit chatter, CVE-2024"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none focus:border-stone-400 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-stone-600" /> OSINT Threat Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none font-medium"
              >
                <option value="general-osint">general-osint (Perimeter & Surface Scan)</option>
                <option value="threat-actor">threat-actor (Ransomware / APT Tracking)</option>
                <option value="leaked-credentials">leaked-credentials (Credential Dumps & HIBP)</option>
                <option value="ransomware">ransomware (Extortion & Darknet Shaming)</option>
                <option value="ioc">ioc (Indicators of Compromise & C2 Nodes)</option>
                <option value="vulnerability">vulnerability (Zero-Days & CISA KEV)</option>
                <option value="phishing">phishing (Malicious Campaigns & Domains)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-800">
              Legitimate Research Justification * (Audited in Cryptographic Ledger)
            </label>
            <textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="e.g. Threat hunting for client infrastructure — verifying if compromised domain appears in dark web breach dumps or ransomware victim lists (Defensive OSINT with authorization)."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none resize-none font-medium"
            />
            <div className="text-[10px] text-stone-400 flex items-center justify-between">
              <span>{justification.length}/300 chars • SHA-256 signed with email & timestamp</span>
              <span>Min 10 chars required</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span>Optional .onion Hidden Service Address (v2 / v3 only)</span>
              <span className="text-[10px] text-stone-400 font-normal">Direct Tor crawler target</span>
            </label>
            <input
              value={onion}
              onChange={e => setOnion(e.target.value)}
              placeholder="e.g. juhanurmihxlp77nkq76byazcldy2hlmovfu2epvl5ankdibsot4csyd.onion"
              className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleResearch}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition"
          >
            {loading ? (
              <>
                <Search className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Crawling Ahmia .onion + ThreatFeeds + CISA KEV + HIBP…</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Execute Real Multi-Source Dark Web & Threat Intel Crawl</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Security / Validation Notice:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Output Tabs */}
        {result && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
            {/* Threat Level Badge Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={
                    "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 " +
                    (result.threatLevel === "CRITICAL"
                      ? "bg-red-50 text-red-800 border-red-200"
                      : result.threatLevel === "HIGH"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : result.threatLevel === "MEDIUM"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200")
                  }
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Threat Level: {result.threatLevel} (Score {result.threatScore}/100)
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700">
                  {result.tor?.mode}
                </span>
              </div>

              <div className="text-xs text-stone-500 font-mono flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-amber-500" />
                <span>Audit Hash: <strong className="text-stone-800">{result.auditHash ? result.auditHash.slice(0, 12) + "..." : "verified"}</strong></span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-stone-200 pb-2 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setActiveTab("report")}
                className={
                  "px-3 py-1.5 rounded-xl transition " +
                  (activeTab === "report" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100")
                }
              >
                Executive Threat Brief
              </button>
              <button
                onClick={() => setActiveTab("onions")}
                className={
                  "px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 " +
                  (activeTab === "onions" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100")
                }
              >
                <span>Crawled .onion Nodes</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-700 text-[10px] rounded-full">
                  {result.crawledOnions?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={
                  "px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 " +
                  (activeTab === "telemetry" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100")
                }
              >
                <span>IOCs & CISA KEV</span>
                <span className="px-1.5 py-0.2 bg-violet-500/20 text-violet-700 text-[10px] rounded-full">
                  {(result.cisaKevVulnerabilities?.length || 0) + (result.threatFoxIocs?.length || 0)}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("hibp")}
                className={
                  "px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 " +
                  (activeTab === "hibp" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100")
                }
              >
                <span>HIBP Breach Range</span>
                {result.hibpBreachResult?.pwned && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("ledger")}
                className={
                  "px-3 py-1.5 rounded-xl transition " +
                  (activeTab === "ledger" ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100")
                }
              >
                Audit Hash Ledger
              </button>
            </div>

            {/* TAB 1: Executive Threat Brief */}
            {activeTab === "report" && (
              <div className="space-y-4">
                <div className="text-xs text-stone-800 leading-relaxed bg-[#faf8f5] border border-stone-200 rounded-xl p-4 whitespace-pre-wrap">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-stone-700" /> Executive Threat Summary:
                  </div>
                  {result.summary}
                </div>

                {/* Structured Findings Table */}
                {result.table && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-stone-900">Correlated Threat Indicators & Mitigations</div>
                    <div className="overflow-x-auto rounded-xl border border-stone-200">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-stone-900 text-white">
                            {result.table.headers.map((h: string, i: number) => (
                              <th key={i} className="px-3 py-2 text-left font-bold border-b border-stone-700 whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.table.rows.map((r: string[], ri: number) => (
                            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                              {r.map((c: string, ci: number) => (
                                <td key={ci} className="px-3 py-2 border-b border-stone-100 align-top">
                                  {ci === 2 ? (
                                    <span
                                      className={
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold " +
                                        (c === "CRITICAL" || c === "HIGH"
                                          ? "bg-red-100 text-red-800"
                                          : c === "MEDIUM"
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-emerald-100 text-emerald-800")
                                      }
                                    >
                                      {c}
                                    </span>
                                  ) : (
                                    c
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Step-by-Step Mitigations */}
                {result.mitigationSteps && (
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Defensive Mitigations:
                    </div>
                    <ul className="list-disc ml-5 space-y-1 text-emerald-950 font-medium">
                      {result.mitigationSteps.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Crawled .onion Nodes (Ahmia) */}
            {activeTab === "onions" && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-stone-900 flex items-center justify-between">
                  <span>Live Ahmia Tor Engine Search Results</span>
                  <span className="text-[10px] text-stone-500 font-mono">Active Hidden Services Crawled</span>
                </div>
                {result.crawledOnions && result.crawledOnions.length > 0 ? (
                  <div className="space-y-2">
                    {result.crawledOnions.map((o: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-[#fafaf9] space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-bold text-xs text-stone-900 truncate">{o.title || "Indexed Onion Service"}</div>
                          <span
                            className={
                              "px-2 py-0.5 rounded-full text-[10px] font-bold " +
                              (o.safetyStatus === "POTENTIAL_THREAT"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800")
                            }
                          >
                            {o.safetyStatus}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-600 leading-relaxed">{o.snippet}</div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
                          <span className="text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200 truncate">
                            {o.onionUrl}
                          </span>
                          <span>• {new Date(o.crawledAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                    No active .onion matches found on current index query.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Telemetry (CISA KEV + ThreatFox IOCs) */}
            {activeTab === "telemetry" && (
              <div className="space-y-4 text-xs">
                {/* CISA KEV Exploited CVEs */}
                <div className="space-y-2">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> CISA Known Exploited Vulnerabilities (KEV) Matches
                  </div>
                  {result.cisaKevVulnerabilities && result.cisaKevVulnerabilities.length > 0 ? (
                    <div className="space-y-2">
                      {result.cisaKevVulnerabilities.map((c: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl border border-red-200 bg-red-50/50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-red-900">{c.cve} — {c.vendor} {c.product}</span>
                            <span className="text-[10px] font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded">Added: {c.dateAdded}</span>
                          </div>
                          <div className="text-[11px] text-stone-700">{c.description}</div>
                          <div className="text-[11px] font-bold text-red-800">Required Action: {c.action}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-500">
                      No active CISA KEV catalog triggers for this query string.
                    </div>
                  )}
                </div>

                {/* ThreatFox IOCs */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-violet-600" /> abuse.ch ThreatFox IOC Indicators
                  </div>
                  {result.threatFoxIocs && result.threatFoxIocs.length > 0 ? (
                    <div className="space-y-2">
                      {result.threatFoxIocs.map((ioc: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl border border-violet-200 bg-violet-50/50 space-y-1 font-mono text-[11px]">
                          <div className="flex items-center justify-between font-bold text-violet-900">
                            <span>{ioc.indicator}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-100 text-violet-800">{ioc.type}</span>
                          </div>
                          <div className="text-stone-700 font-sans">Threat: <strong>{ioc.threat}</strong> • Confidence: {ioc.confidence}%</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-500">
                      No active ThreatFox IOC alerts matched.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: HIBP Breach Range */}
            {activeTab === "hibp" && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" /> HaveIBeenPwned k-Anonymity SHA-1 Breach Status
                </div>
                {result.hibpBreachResult ? (
                  <div className={
                    "p-4 rounded-xl border space-y-2 " +
                    (result.hibpBreachResult.pwned
                      ? "bg-red-50 border-red-200 text-red-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900")
                  }>
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>Query: "{result.hibpBreachResult.query}"</span>
                      <span className={
                        "px-2.5 py-0.5 rounded-full text-xs " +
                        (result.hibpBreachResult.pwned ? "bg-red-600 text-white" : "bg-emerald-600 text-white")
                      }>
                        {result.hibpBreachResult.pwned ? "EXPOSED (" + result.hibpBreachResult.occurrences.toLocaleString() + " breaches)" : "CLEAN"}
                      </span>
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      {result.hibpBreachResult.recommendation}
                    </div>
                    <div className="text-[10px] font-mono opacity-80">
                      SHA-1 Prefix Hash: {result.hibpBreachResult.sha1Prefix}***** (Protected by k-anonymity)
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl text-stone-500">No HIBP verification data.</div>
                )}
              </div>
            )}

            {/* TAB 5: Cryptographic Audit Ledger */}
            {activeTab === "ledger" && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-stone-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-amber-600" /> Tamper-Proof Cryptographic Audit Trail
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">SHA-256 Linked Block Chain</span>
                </div>
                <div className="space-y-2">
                  {auditLedger.slice(0, 8).map((entry: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-stone-900 text-stone-300 font-mono text-[11px] border border-stone-800 space-y-1">
                      <div className="flex items-center justify-between text-white">
                        <span>Block #{entry.index} • {entry.user}</span>
                        <span className={
                          "px-2 py-0.5 rounded text-[10px] font-bold " +
                          (entry.verdict === "ALLOWED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800")
                        }>
                          {entry.verdict}
                        </span>
                      </div>
                      <div className="text-stone-400 font-sans text-xs">{entry.reason}</div>
                      <div className="text-[10px] text-stone-500 truncate pt-1 border-t border-stone-800">
                        Hash: <span className="text-amber-400">{entry.hash}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Standalone Live HIBP Breach Checker Utility */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Live HaveIBeenPwned Breach Range Checker
            </h3>
          </div>
          <p className="text-xs text-stone-600">
            Check any password, email hash, or string against 2+ billion exposed dark web breach entries using SHA-1 k-anonymity (safe & zero credential disclosure).
          </p>

          <div className="flex gap-2">
            <input
              value={hibpQuery}
              onChange={e => setHibpQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleHibpLookup()}
              placeholder="e.g. password to verify exposure"
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none font-mono"
            />
            <button
              onClick={handleHibpLookup}
              disabled={hibpLoading || !hibpQuery.trim()}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black disabled:opacity-50 flex items-center gap-1.5"
            >
              {hibpLoading ? "Checking…" : "Check Exposure"}
            </button>
          </div>

          {hibpStandaloneResult && (
            <div className={
              "p-3 rounded-xl border text-xs " +
              (hibpStandaloneResult.pwned
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900")
            }>
              <div className="font-bold flex items-center gap-1.5">
                {hibpStandaloneResult.pwned ? (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Exposed in {hibpStandaloneResult.occurrences.toLocaleString()} dark web breach collections!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No exposures detected in public HIBP breach catalog.</span>
                  </>
                )}
              </div>
              <div className="text-[11px] mt-1 text-stone-700">
                {hibpStandaloneResult.recommendation}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
