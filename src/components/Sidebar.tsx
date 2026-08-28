import React, { useState } from "react";
import { 
  MessageSquare, 
  Search, 
  Calendar, 
  RotateCw, 
  Folder, 
  FileText, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw,
  Sparkles,
  Check,
  Server,
  Wifi,
  Brain,
  TrendingUp,
  Globe,
  Film,
  Clapperboard,
  SearchCheck,
  Wand2,
  Terminal
} from "lucide-react";
import { EitherLogo } from "./ConnectorIcons";
import { ProjectItem, UserProfile } from "../types";

interface SidebarProps {
  activeView: "chat" | "search" | "meeting-notes" | "routines" | "project" | "servers" | "wifi-hardware" | "trading" | "browser-agent";
  onSelectView: (view: "chat" | "search" | "meeting-notes" | "routines" | "project" | "servers" | "wifi-hardware" | "trading" | "browser-agent") => void;
  onNewChat: () => void;
  projects: ProjectItem[];
  user: UserProfile;
  onToggleContext: () => void;
  onOpenConnectors: () => void;
  onOpenSkills?: () => void;
  onOpenAuth?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  onNewChat,
  projects,
  user,
  onToggleContext,
  onOpenConnectors,
  onOpenSkills,
  onOpenAuth,
  isPinned = false,
  onTogglePin,
  onClose,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "proj-ai": true,
  });
  const [restarting, setRestarting] = useState(false);
  const [restarted, setRestarted] = useState(false);
  const [agent2Topic, setAgent2Topic] = useState("");
  const [agent2Researching, setAgent2Researching] = useState(false);
  const [agent2Result, setAgent2Result] = useState<string | null>(null);
  const [agent2Format, setAgent2Format] = useState<"bullets"|"table">("bullets");

  // Extract first word of the user's name (e.g. "Gaman")
  const rawFirstWord = user.name ? user.name.trim().split(/\s+/)[0] : "Gaman";
  const firstName = rawFirstWord.charAt(0).toUpperCase() + rawFirstWord.slice(1).toLowerCase();
  const initial = firstName.charAt(0).toUpperCase() || "G";

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleRestartUpdate = () => {
    setRestarting(true);
    setTimeout(() => {
      setRestarting(false);
      setRestarted(true);
      setTimeout(() => setRestarted(false), 3000);
    }, 1200);
  };

  const handleAgent2Research = async (forceFormat?: "bullets"|"table") => {
    if (!agent2Topic.trim()) return;
    const fmt = forceFormat || agent2Format;
    setAgent2Researching(true);
    setAgent2Result(null);
    try {
      const res = await fetch("/api/agent2/research", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: agent2Topic, format: fmt }),
      });
      const j = await res.json();
      if (j.success) {
        setAgent2Result(j.brief);
        if (j.format) setAgent2Format(j.format);
      } else setAgent2Result(`Error: ${j.error}`);
    } catch(e:any) { setAgent2Result(`Network error: ${e.message}`); }
    setAgent2Researching(false);
  };

  const renderResearchMarkdown = (text: string) => {
    if (!text) return null;
    // Detect markdown table: lines with | and separator --- 
    const lines = text.split("\n");
    const hasTable = lines.some(l => l.includes("|")) && lines.some(l => /---/.test(l));
    if (!hasTable) {
      return <div className="whitespace-pre-wrap">{text}</div>;
    }
    const elements: React.ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim().startsWith("|") && i+1 < lines.length && /---/.test(lines[i+1])) {
        // Table header
        const headerCells = line.split("|").map(c=>c.trim()).filter(Boolean);
        i+=2; // skip separator
        const rows: string[][] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim() !== "") {
          const cells = lines[i].split("|").map(c=>c.trim()).filter(Boolean);
          if (cells.length) rows.push(cells);
          i++;
        }
        elements.push(
          <div key={`tbl-${elements.length}`} className="my-2 overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-[11px] border-collapse">
              <thead><tr className="bg-stone-900 text-white">{headerCells.map((h,idx)=><th key={idx} className="px-2 py-1.5 text-left font-bold border-b border-stone-200 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>{rows.map((r,ri)=><tr key={ri} className={ri%2===0?"bg-white":"bg-stone-50"}>{r.map((c,ci)=><td key={ci} className="px-2 py-1.5 border-b border-stone-100 text-stone-700 align-top">{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        );
      } else {
        if (line.trim()) elements.push(<div key={`p-${i}`} className="leading-relaxed">{line}</div>);
        i++;
      }
    }
    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <aside className="w-64 bg-[#faf8f5] border-r border-[#e8e3d8] flex flex-col justify-between p-3 select-none shrink-0 h-full shadow-lg sm:shadow-none z-30 animate-slideInLeft">
      {/* Top Section: Brand & Primary Navigation */}
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onNewChat}>
            <div className="text-stone-900">
              <EitherLogo className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold text-stone-900 tracking-tight font-serif">
              Either
            </span>
          </div>

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              className={`p-1 rounded-md text-xs transition-colors ${
                isPinned
                  ? "text-stone-900 bg-[#e8e2d4]"
                  : "text-stone-400 hover:text-stone-700 hover:bg-[#eee8dc]"
              }`}
              title={isPinned ? "Unpin sidebar (auto-peek on hover)" : "Pin sidebar"}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {/* New Chat Button */}
          <button
            id="sidebar-new-chat-btn"
            onClick={() => {
              onNewChat();
              onSelectView("chat");
            }}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === "chat"
                ? "bg-[#eee8dc] text-stone-900 font-semibold shadow-xs"
                : "text-stone-700 hover:text-stone-900 hover:bg-[#f3ede1]"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-stone-600 shrink-0" />
            <span>New Chat</span>
          </button>

          {/* Search Button */}
          <button
            id="sidebar-search-btn"
            onClick={() => onSelectView("search")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === "search"
                ? "bg-[#eee8dc] text-stone-900 font-semibold shadow-xs"
                : "text-stone-700 hover:text-stone-900 hover:bg-[#f3ede1]"
            }`}
          >
            <Search className="w-4 h-4 text-stone-600 shrink-0" />
            <span>Search</span>
          </button>

          {/* Meeting Notes */}
          <button
            id="sidebar-meeting-notes-btn"
            onClick={() => onSelectView("meeting-notes")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === "meeting-notes"
                ? "bg-[#eee8dc] text-stone-900 font-semibold shadow-xs"
                : "text-stone-700 hover:text-stone-900 hover:bg-[#f3ede1]"
            }`}
          >
            <Calendar className="w-4 h-4 text-stone-600 shrink-0" />
            <span>Meeting Notes</span>
          </button>

          {/* Routines */}
          <button
            id="sidebar-routines-btn"
            onClick={() => onSelectView("routines")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === "routines"
                ? "bg-[#eee8dc] text-stone-900 font-semibold shadow-xs"
                : "text-stone-700 hover:text-stone-900 hover:bg-[#f3ede1]"
            }`}
          >
            <RotateCw className="w-4 h-4 text-stone-600 shrink-0" />
            <span>Routines</span>
          </button>

          {/* Browser AI Agent (Autonomous Web & Token Retriever) */}
          <button
            id="sidebar-browser-agent-btn"
            onClick={() => onSelectView("browser-agent")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === "browser-agent"
                ? "bg-[#eee8dc] text-stone-900 font-semibold shadow-xs"
                : "text-stone-700 hover:text-stone-900 hover:bg-[#f3ede1]"
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-600 shrink-0" />
            <div className="flex items-center justify-between w-full">
              <span>Browser AI Agent</span>
              <span className="text-[9px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.2 rounded font-mono">LIVE</span>
            </div>
          </button>

          {/* Sandbox — Run Commands + Ask */}
          <button
            id="sidebar-sandbox-btn"
            onClick={() => onSelectView("sandbox")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === "sandbox"
                ? "bg-stone-900 text-white font-semibold shadow-xs"
                : "text-stone-700 hover:text-stone-900 hover:bg-[#f3ede1]"
            }`}
          >
            <Terminal className={`w-4 h-4 shrink-0 ${activeView==="sandbox"?"text-white":"text-stone-600"}`} />
            <div className="flex items-center justify-between w-full">
              <span>Sandbox</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${activeView==="sandbox"?"bg-white text-stone-900":"bg-stone-900 text-white"}`}>RUN</span>
            </div>
          </button>

          {/* Movie Swarm — Veo 3 4 clips per scene */}
          <button
            id="sidebar-video-swarm-btn"
            onClick={() => onSelectView("video-swarm")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === "video-swarm"
                ? "bg-violet-600 text-white font-semibold shadow-xs"
                : "text-stone-700 hover:text-stone-900 hover:bg-[#f3ede1]"
            }`}
          >
            <Film className={`w-4 h-4 shrink-0 ${activeView==="video-swarm"?"text-white":"text-violet-600"}`} />
            <div className="flex items-center justify-between w-full">
              <span>Movie Swarm</span>
              <span className="text-[9px] bg-violet-100 text-violet-800 font-bold px-1.5 py-0.2 rounded font-mono">Veo 3 • 4×</span>
            </div>
          </button>
        </nav>

        {/* Projects Section */}
        <div className="pt-3 border-t border-[#ebe5da]/80 space-y-1.5">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Projects
            </span>
            <button
              onClick={() => onSelectView("project")}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded hover:bg-[#eee8dc]"
              title="Add Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Project Tree */}
          <div className="space-y-0.5">
            {projects.map((proj) => {
              const isExpanded = expandedFolders[proj.id];
              return (
                <div key={proj.id} className="space-y-0.5">
                  <div
                    onClick={() => {
                      toggleFolder(proj.id);
                      onSelectView("project");
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-[#f3ede1] cursor-pointer transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    )}
                    <Folder className="w-3.5 h-3.5 text-stone-600" />
                    <span className="truncate">{proj.name}</span>
                  </div>

                  {/* Folder Children */}
                  {isExpanded && proj.children && (
                    <div className="pl-6 space-y-0.5">
                      {proj.children.map((child) => (
                        <div
                          key={child.id}
                          onClick={() => onSelectView("project")}
                          className="flex items-center space-x-2 px-2.5 py-1 rounded-md text-[11px] text-stone-600 hover:text-stone-900 hover:bg-[#f3ede1] cursor-pointer transition-colors truncate"
                        >
                          <FileText className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{child.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Update Card, Context Status, and Profile */}
      <div className="space-y-3 pt-4 border-t border-[#ebe5da]">
        {/* Update Ready Card */}
        <div className="bg-[#f2ece0] border border-[#e2dcce] rounded-xl p-3 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-stone-900">
              {restarted ? "Updated to latest" : "Update ready"}
            </div>
            <div className="text-[11px] text-stone-500">
              {restarted ? "Ready to fly" : `Version ${user.version}`}
            </div>
          </div>
          <button
            id="restart-update-btn"
            onClick={handleRestartUpdate}
            disabled={restarting}
            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {restarting ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : restarted ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : null}
            <span>{restarting ? "Updating..." : restarted ? "Done" : "Restart"}</span>
          </button>
        </div>

        {/* Token Usage — Start plan: 100k / month */}
        <div className="bg-white border border-[#e8e3d8] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              {user.plan} • Tokens
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-700">
              {(user.tokenUsage?.used || 0).toLocaleString()} / {(user.tokenUsage?.limit || 100000).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all"
              style={{ width: `${Math.min(100, user.tokenUsage?.percentUsed || 0)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
            <span>{(user.tokenUsage?.remaining ?? 100000).toLocaleString()} left</span>
            <span>Resets {user.tokenUsage?.resetDate ? new Date(user.tokenUsage.resetDate).toLocaleDateString() : "next month"}</span>
          </div>
          {(user.tokenUsage?.percentUsed || 0) > 85 && (
            <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2 py-1 text-center">
              { (user.tokenUsage?.percentUsed || 0) >= 100 ? "Limit reached — upgrade for more" : "Approaching limit — consider upgrading" }
            </div>
          )}
        </div>

        {/* Context Enabled Pill Indicator */}
        <div
          onClick={onToggleContext}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-[#f3ede1] cursor-pointer transition-colors"
          title="Toggle Context Engine"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              user.contextEnabled ? "bg-emerald-500" : "bg-stone-400"
            }`}
          ></span>
          <span>{user.contextEnabled ? "Context enabled" : "Context disabled"}</span>
        </div>

        {/* Connected Apps Quick Trigger */}
        <button
          onClick={onOpenConnectors}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-[#f3ede1] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Connected Apps</span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
            8 Verified
          </span>
        </button>

        {/* User Profile Card */}
        <div 
          onClick={onOpenAuth}
          className="flex items-center space-x-2.5 px-2 py-1.5 rounded-xl hover:bg-[#f3ede1] cursor-pointer transition-colors" 
          title={`Logged in as ${user.email} (Click to manage accounts)`}
        >
          {/* Avatar with Google profile photo support */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 flex items-center justify-center text-white shadow-xs p-0.5 overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-xs text-purple-900">
                {initial}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-stone-900 truncate">
                {firstName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Verified Account"></span>
            </div>
            <span className="text-[11px] text-stone-500 truncate font-mono">
              {user.email || user.plan}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
