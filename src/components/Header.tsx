import React from "react";
import { 
  Bot, 
  Search, 
  Layers, 
  PlayCircle, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

interface HeaderProps {
  activeTab: "catalog" | "compare" | "simulator" | "advisor" | "recommender";
  setActiveTab: (tab: "catalog" | "compare" | "simulator" | "advisor" | "recommender") => void;
  serverStatus: { status: string; hasApiKey: boolean } | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, serverStatus }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("catalog")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">SwarmUI Hub</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Research 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">Open-Source Agent Swarm & Multi-Agent UI Navigator</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
            <button
              id="tab-catalog"
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "catalog"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Research Catalog</span>
            </button>

            <button
              id="tab-compare"
              onClick={() => setActiveTab("compare")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "compare"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Matrix Compare</span>
            </button>

            <button
              id="tab-simulator"
              onClick={() => setActiveTab("simulator")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "simulator"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Topology Simulator</span>
            </button>

            <button
              id="tab-advisor"
              onClick={() => setActiveTab("advisor")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "advisor"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Research Advisor</span>
            </button>

            <button
              id="tab-recommender"
              onClick={() => setActiveTab("recommender")}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "recommender"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Stack Matcher</span>
            </button>
          </nav>

          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            {serverStatus?.hasApiKey ? (
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 rounded-full text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gemini 3.7 Online</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-full text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Research Mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800 space-x-2 scrollbar-none">
          {[
            { id: "catalog", label: "Catalog", icon: Search },
            { id: "compare", label: "Compare", icon: Layers },
            { id: "simulator", label: "Simulator", icon: PlayCircle },
            { id: "advisor", label: "AI Advisor", icon: Sparkles },
            { id: "recommender", label: "Matcher", icon: Compass },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs whitespace-nowrap ${
                  isSelected ? "bg-indigo-600 text-white" : "text-slate-400 bg-slate-800/40"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
