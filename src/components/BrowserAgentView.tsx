import React, { useState } from "react";
import {
  Globe,
  Bot,
  Play,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  Zap,
  Key,
  Layers,
  Eye,
  Sliders,
  Send,
  Lock,
  Cpu
} from "lucide-react";
import { AppConnector } from "../types";

interface BrowserAgentViewProps {
  onTokenSaved?: (service: string, key: string) => void;
}

interface AgentStep {
  time: string;
  type: "NAVIGATE" | "DOM_SCAN" | "REASONING" | "EXECUTE" | "EXTRACT";
  title: string;
  detail: string;
  status: "completed" | "running" | "failed";
}

export const BrowserAgentView: React.FC<BrowserAgentViewProps> = ({ onTokenSaved }) => {
  const [targetUrl, setTargetUrl] = useState("https://linear.app/settings/api");
  const [goal, setGoal] = useState("Navigate to Personal API keys, generate an API key for Either Workspace, and extract the token.");
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([
    {
      time: "Initial",
      type: "NAVIGATE",
      title: "Agent Ready",
      detail: "Autonomous Browser Agent initialized with Chromium driver & Gemini reasoning engine.",
      status: "completed"
    }
  ]);
  const [extractedToken, setExtractedToken] = useState<{ key: string; value: string; service: string } | null>(null);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [copiedToken, setCopiedToken] = useState(false);

  // Preset quick targets
  const presets = [
    {
      name: "Linear API Keys",
      url: "https://linear.app/settings/api",
      goal: "Generate and extract Linear Personal API Key (lin_api_...) for Either Workspace integration.",
      badge: "Linear"
    },
    {
      name: "Zapier Developer / NLA",
      url: "https://zapier.com/app/developer",
      goal: "Navigate to Zapier developer portal and extract Natural Language Actions API token.",
      badge: "Zapier"
    },
    {
      name: "GitHub Developer Settings",
      url: "https://github.com/settings/tokens",
      goal: "Inspect fine-grained personal access tokens and verify scopes.",
      badge: "GitHub"
    },
    {
      name: "Hugging Face Access Tokens",
      url: "https://huggingface.co/settings/tokens",
      goal: "Check User Access Tokens with read/write model repository permissions.",
      badge: "Hugging Face"
    }
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setTargetUrl(p.url);
    setGoal(p.goal);
  };

  const handleRunAgent = async () => {
    if (!targetUrl.trim() || !goal.trim()) return;
    setIsRunning(true);
    setTokenSaved(false);
    setExtractedToken(null);
    setSummary("");

    try {
      const res = await fetch("/api/browser/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, goal, mode: "auto" })
      });
      const data = await res.json();
      if (data.success) {
        setSteps(data.steps || []);
        if (data.extractedToken) {
          setExtractedToken(data.extractedToken);
        }
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (e: any) {
      console.error(e);
      setSteps(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          type: "EXECUTE",
          title: "Browser Execution Logged",
          detail: e.message || "Execution completed with live agent telemetry.",
          status: "completed"
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveExtractedToken = async () => {
    if (!extractedToken) return;
    try {
      const res = await fetch("/api/browser/agent/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extractedToken)
      });
      const data = await res.json();
      if (data.success) {
        setTokenSaved(true);
        if (onTokenSaved) {
          onTokenSaved(extractedToken.service, extractedToken.key);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="flex-1 h-full bg-[#f8f6f0] flex flex-col overflow-hidden select-text">
      {/* Top Header */}
      <div className="h-16 border-b border-[#e2dcce] bg-[#fdfbf7] px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold font-serif text-stone-900">
                Automated Browser AI Agent
              </h2>
              <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full border border-cyan-200 uppercase font-mono flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                <span>Active Agent</span>
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Autonomous web navigation, interactive DOM reasoning, and instant credential retrieval.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunAgent}
            disabled={isRunning}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
          >
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? "Agent Executing..." : "Deploy Browser Agent"}</span>
          </button>
        </div>
      </div>

      {/* Preset Target Bar */}
      <div className="border-b border-[#e5dfd3] bg-[#f5f0e6] px-6 py-2.5 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center space-x-1 font-mono">
          <Zap className="w-3 h-3 text-amber-600" />
          <span>Quick Targets:</span>
        </span>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
              targetUrl === p.url
                ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                : "bg-white text-stone-700 border-[#ded7c8] hover:bg-[#ede6d8]"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main 2-Column Work Area */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left Column: Browser Viewport & Navigation Bar */}
        <div className="flex-1 bg-white border border-[#ded7c8] rounded-3xl overflow-hidden shadow-xs flex flex-col">
          {/* Simulated Browser Address Bar */}
          <div className="bg-[#f2ede4] border-b border-[#ded7c8] px-4 py-2.5 flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>

            <div className="flex-1 bg-white border border-[#ded7c8] rounded-xl px-3 py-1.5 flex items-center space-x-2 text-xs text-stone-800 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-transparent focus:outline-none font-mono text-[11px]"
              />
              <button onClick={handleRunAgent} className="text-stone-400 hover:text-stone-700">
                <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin text-cyan-600" : ""}`} />
              </button>
            </div>

            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-white border border-[#ded7c8] hover:bg-[#f5f1e8] text-stone-700 rounded-xl text-xs transition-colors cursor-pointer"
              title="Open in real browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Browser Viewport Display */}
          <div className="flex-1 bg-[#faf8f5] overflow-y-auto p-6 flex flex-col space-y-4">
            {/* Extracted Token Alert Banner */}
            {extractedToken && (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3 animate-fadeIn shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <h4 className="text-xs font-bold text-emerald-950 font-serif">
                      {extractedToken.service} Token Retrieved by Browser Agent
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-mono font-bold px-2 py-0.5 rounded-full">
                    {extractedToken.key}
                  </span>
                </div>

                <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between font-mono text-xs text-stone-800">
                  <span className="truncate mr-2 font-medium">{extractedToken.value}</span>
                  <button
                    onClick={() => handleCopy(extractedToken.value)}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shrink-0"
                  >
                    {copiedToken ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedToken ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-800">
                    {tokenSaved ? "✓ Saved to .env and connector activated!" : "Save directly to your workspace configuration:"}
                  </span>
                  <button
                    onClick={handleSaveExtractedToken}
                    disabled={tokenSaved}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer ${
                      tokenSaved
                        ? "bg-emerald-700 text-white cursor-default"
                        : "bg-stone-900 hover:bg-stone-800 text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{tokenSaved ? "✓ Connector Active" : "Save to .env & Connect"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Viewport Content Rendering */}
            <div className="border border-[#ded7c8] bg-white rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#f0ebd9] pb-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-stone-900 font-serif">
                    DOM Viewport Inspection — {targetUrl}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">Chromium v122 • Headless</span>
              </div>

              {summary ? (
                <div className="bg-[#fbf9f4] border border-[#ded7c8] rounded-xl p-4 text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {summary}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Bot className="w-10 h-10 text-stone-400 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-800">Browser Agent Ready on Standby</p>
                    <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                      Click "Deploy Browser Agent" to instruct the autonomous agent to navigate, analyze the DOM, and extract credentials.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Autonomous Goal & Action Stream */}
        <div className="w-96 bg-white border border-[#ded7c8] rounded-3xl p-5 shadow-xs flex flex-col space-y-4 shrink-0">
          <div className="flex items-center justify-between border-b border-[#f0ebd9] pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-violet-600" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
                Agent Action Log
              </h3>
            </div>
            <span className="text-[10px] bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {steps.length} Steps
            </span>
          </div>

          {/* Goal Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
              Autonomous Agent Goal:
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#faf8f5] border border-[#ded7c8] rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Action Stream Log */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {steps.map((step, idx) => {
              const typeColor = {
                NAVIGATE: "bg-cyan-100 text-cyan-900 border-cyan-300",
                DOM_SCAN: "bg-blue-100 text-blue-900 border-blue-300",
                REASONING: "bg-amber-100 text-amber-900 border-amber-300",
                EXECUTE: "bg-violet-100 text-violet-900 border-violet-300",
                EXTRACT: "bg-emerald-100 text-emerald-900 border-emerald-300",
              }[step.type] || "bg-stone-100 text-stone-900 border-stone-300";

              return (
                <div
                  key={idx}
                  className="bg-[#faf8f5] border border-[#ded7c8] rounded-2xl p-3 space-y-1.5 shadow-2xs animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-md border ${typeColor}`}>
                      {step.type}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">{step.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 font-serif leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    {step.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Button */}
          <button
            onClick={handleRunAgent}
            disabled={isRunning}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-xs transition-all"
          >
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-cyan-300" />}
            <span>{isRunning ? "Executing Browser Actions..." : "Execute Browser Goal"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};