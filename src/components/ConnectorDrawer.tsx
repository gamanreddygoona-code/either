import React, { useState } from "react";
import {
  X,
  Check,
  CheckCircle2,
  RotateCw,
  ExternalLink,
  Search,
  Key,
  Link2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Plus,
  Layers,
  Sparkles
} from "lucide-react";
import { AppIconRenderer } from "./ConnectorIcons";
import { AppConnector } from "../types";
import { AVAILABLE_CONNECTORS } from "../data/connectors";

interface ConnectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: AppConnector[];
  onConnect: (id: string, account?: string, credentials?: any) => Promise<void>;
  onSync: (id: string) => Promise<void>;
  onDisconnect: (id: string) => Promise<void>;
  selectedConnectorId?: string | null;
}

/** Per-connector auth config: how to connect each one for real */
const CONNECTOR_AUTH: Record<string, {
  type: "oauth" | "token" | "both";
  label: string;
  description: string;
  setupUrl?: string;
  setupSteps?: string[];
  tokenPlaceholder?: string;
  tokenLabel?: string;
  scopes?: string;
}> = {
  gmail: {
    type: "oauth",
    label: "Sign in with Google",
    description: "Connect your Gmail inbox to read emails, extract action items, and draft replies.",
    setupUrl: "https://console.cloud.google.com/apis/credentials",
    setupSteps: [
      "Create OAuth Client ID (Web application) in Google Cloud Console",
      "Add redirect URI: http://localhost:3000/auth/google/callback",
      "Enable Gmail API for your project",
      "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env",
    ],
  },
  gdrive: {
    type: "oauth",
    label: "Connect Google Drive",
    description: "Search Google Docs, Sheets, and PDFs for AI grounding.",
    setupSteps: [
      "Uses the same Google OAuth as Gmail — just enable Drive API",
      "Enable Google Drive API in your Cloud Console project",
    ],
  },
  gcalendar: {
    type: "oauth",
    label: "Connect Google Calendar",
    description: "Fetch upcoming schedule and prepare meeting briefs.",
    setupSteps: [
      "Uses the same Google OAuth as Gmail — just enable Calendar API",
      "Enable Google Calendar API in your Cloud Console project",
    ],
  },
  github: {
    type: "oauth",
    label: "Sign in with GitHub",
    description: "Connect GitHub to read repos, issues, PRs, and commit history.",
    setupUrl: "https://github.com/settings/developers",
    setupSteps: [
      "Create OAuth App at github.com/settings/developers",
      "Set callback URL: http://localhost:3000/auth/github/callback",
      "Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env",
      "Or paste a Personal Access Token below for instant access",
    ],
    tokenLabel: "Or paste a GitHub Personal Access Token",
    tokenPlaceholder: "ghp_...",
  },
  notion: {
    type: "token",
    label: "Paste Notion Integration Token",
    description: "Search workspace docs, databases, and team knowledge.",
    setupUrl: "https://www.notion.so/profile/integrations",
    setupSteps: [
      "Go to notion.so/profile/integrations → New integration",
      "Name it 'Either', select your workspace, click Submit",
      "Copy the Internal Integration Secret (ntn_...)",
      "IMPORTANT: Share pages with the integration (page → ••• → Connections → add Either)",
    ],
    tokenLabel: "Internal Integration Secret",
    tokenPlaceholder: "ntn_...",
  },
  slack: {
    type: "token",
    label: "Paste Slack Bot Token",
    description: "Search channels, messages, and project threads.",
    setupUrl: "https://api.slack.com/apps",
    setupSteps: [
      "Create New App at api.slack.com/apps",
      "Go to OAuth & Permissions → add scopes: channels:read, channels:history, chat:write",
      "Install to Workspace → copy the Bot User OAuth Token (xoxb-...)",
    ],
    tokenLabel: "Bot User OAuth Token",
    tokenPlaceholder: "xoxb-...",
  },
  huggingface: {
    type: "token",
    label: "Paste Hugging Face Token",
    description: "Deploy models, run inference, inspect Hub spaces.",
    setupUrl: "https://huggingface.co/settings/tokens",
    setupSteps: [
      "Go to huggingface.co/settings/tokens",
      "Create new token with 'read' scope",
      "Token looks like: hf_...",
    ],
    tokenLabel: "User Access Token",
    tokenPlaceholder: "hf_...",
  },
  servers: {
    type: "token",
    label: "Configure Local Node",
    description: "24/7 background agent execution on local Wi-Fi node.",
    setupSteps: [
      "Runs automatically on your local port 3000",
      "Monitors system memory, CPU, and autonomous agent swarms",
    ],
  },
  discord: {
    type: "token",
    label: "Paste Discord Bot Token",
    description: "Monitor developer discussions and community channels.",
    setupUrl: "https://discord.com/developers/applications",
    setupSteps: [
      "Create New Application at discord.com/developers/applications",
      "Go to Bot tab → click Reset Token → copy it",
      "Enable MESSAGE CONTENT intent under Privileged Gateway Intents",
    ],
    tokenLabel: "Discord Bot Token",
    tokenPlaceholder: "Bot token...",
  },
  linear: {
    type: "token",
    label: "Paste Linear API Key",
    description: "Sync engineering issues, sprints, and roadmap updates.",
    setupUrl: "https://linear.app/settings/api",
    tokenLabel: "Linear API Key",
    tokenPlaceholder: "lin_api_...",
  },
  asana: {
    type: "token",
    label: "Paste Asana Personal Access Token",
    description: "Access projects, milestones, and task assignees.",
    setupUrl: "https://app.asana.com/0/developer-console",
    tokenLabel: "Personal Access Token",
    tokenPlaceholder: "1/120...",
  },
  dropbox: {
    type: "token",
    label: "Paste Dropbox Access Token",
    description: "Search files and manage documents in Dropbox.",
    setupUrl: "https://www.dropbox.com/developers/apps",
    tokenLabel: "Dropbox Access Token",
    tokenPlaceholder: "sl....",
  },
  zapier: {
    type: "token",
    label: "Paste Zapier API Key",
    description: "Trigger routines across 6,000+ external web services.",
    setupUrl: "https://platform.zapier.com/reference/api",
    tokenLabel: "Zapier API Key",
    tokenPlaceholder: "sk-ak-...",
  },
};

export const ConnectorDrawer: React.FC<ConnectorDrawerProps> = ({
  isOpen,
  onClose,
  connectors,
  onConnect,
  onSync,
  onDisconnect,
  selectedConnectorId = null,
}) => {
  const [activeTab, setActiveTab] = useState<"connected" | "available">("connected");
  const [activeId, setActiveId] = useState<string>(selectedConnectorId || connectors[0]?.id || "gmail");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  if (!isOpen) return null;

  // Active list vs Available list
  const activeConnectors = connectors.filter((c) => c.status === "connected" || connectors.length <= 8);
  const displayList = activeTab === "connected" ? activeConnectors : AVAILABLE_CONNECTORS;

  const currentConnector = [...connectors, ...AVAILABLE_CONNECTORS].find((c) => c.id === activeId) || activeConnectors[0] || connectors[0];
  const authConfig = CONNECTOR_AUTH[currentConnector.id];
  const isConnected = currentConnector.status === "connected";

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await onSync(id);
    setSyncingId(null);
    showToast(`Synced ${currentConnector.name} successfully.`);
  };

  const handleTokenConnect = async () => {
    if (!tokenInput.trim()) return;
    await onConnect(currentConnector.id, undefined, { token: tokenInput.trim() });
    setTokenInput("");
    showToast(`Connected ${currentConnector.name}.`);
  };

  const handleOAuthConnect = () => {
    const authUrl = (currentConnector.id === "gmail" || currentConnector.id === "gdrive" || currentConnector.id === "gcalendar") 
      ? "/auth/google" 
      : `/auth/${currentConnector.id}`;
    window.open(authUrl, "_blank", "width=600,height=700");
    showToast(`Opening ${currentConnector.name} authorization...`);
  };

  const handleDisconnect = async (id: string) => {
    await onDisconnect(id);
    showToast(`Disconnected ${currentConnector.name}.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredItems = currentConnector.dataItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-text">
      <div className="bg-[#faf8f5] border border-[#ded7c8] rounded-3xl w-full max-w-4xl h-[640px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-[#e8e3d8] px-6 flex items-center justify-between bg-[#f5f1e8]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#ded7c8] flex items-center justify-center shadow-xs">
              <AppIconRenderer iconName={currentConnector.icon} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-stone-900 font-serif">
                  Connected Workspace Integrations
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  {connectors.filter((c) => c.status === "connected").length} Verified & Active
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Grounding AI models with your live emails, repos, databases, and servers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-[#eae4d7] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Active vs Available */}
        <div className="flex border-b border-[#e8e3d8] bg-[#f7f4ec] px-6 pt-2">
          <button
            onClick={() => { setActiveTab("connected"); setActiveId(activeConnectors[0]?.id || "gmail"); }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "connected"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Integrations ({connectors.filter((c) => c.status === "connected").length})</span>
          </button>

          <button
            onClick={() => { setActiveTab("available"); setActiveId(AVAILABLE_CONNECTORS[0]?.id || "discord"); }}
            className={`pb-2.5 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === "available"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-stone-600" />
            <span>Add More Integrations ({AVAILABLE_CONNECTORS.length})</span>
          </button>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left App List */}
          <div className="w-64 border-r border-[#e8e3d8] bg-[#f7f4ec] p-3 overflow-y-auto space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              {activeTab === "connected" ? "Configured Apps" : "Available Apps"}
            </div>
            {displayList.map((connector) => {
              const isSelected = connector.id === currentConnector.id;
              const connected = connector.status === "connected";
              return (
                <button
                  key={connector.id}
                  onClick={() => { setActiveId(connector.id); setSearchQuery(""); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-stone-900 font-bold shadow-xs border border-[#ded7c8]"
                      : "text-stone-700 hover:bg-[#eee8dc] border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <AppIconRenderer iconName={connector.icon} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{connector.name}</span>
                  </div>
                  {connected ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs"></span>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-mono">+Add</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Details */}
          <div className="flex-1 flex flex-col bg-[#faf8f5] p-5 overflow-y-auto space-y-4">
            {toastMessage && (
              <div className="p-3 bg-stone-900 text-white rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Status Banner */}
            <div className="bg-white border border-[#ded7c8] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#f7f4ec] border border-[#ded7c8] flex items-center justify-center shadow-2xs shrink-0">
                  <AppIconRenderer iconName={currentConnector.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-stone-900 font-serif">{currentConnector.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isConnected
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "bg-stone-100 text-stone-600 border border-stone-200"
                    }`}>
                      {isConnected ? "Verified & Live" : "Not Configured"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{currentConnector.description}</p>
                </div>
              </div>
              {isConnected && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleSync(currentConnector.id)}
                    disabled={syncingId === currentConnector.id}
                    className="px-3 py-1.5 bg-[#f0ebd9] hover:bg-[#e6dfcb] text-stone-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${syncingId === currentConnector.id ? "animate-spin" : ""}`} />
                    <span>{syncingId === currentConnector.id ? "Syncing..." : "Sync Now"}</span>
                  </button>
                  <button
                    onClick={() => handleDisconnect(currentConnector.id)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-rose-700 hover:text-rose-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* Connected Account Info */}
            {isConnected && (
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="bg-[#f5f1e8] p-3 rounded-xl border border-[#e8e3d8]">
                  <span className="text-stone-500 text-[10px] block font-bold uppercase tracking-wider">Account</span>
                  <span className="font-semibold text-stone-900 truncate block mt-0.5">{currentConnector.connectedAccount || "Connected"}</span>
                </div>
                <div className="bg-[#f5f1e8] p-3 rounded-xl border border-[#e8e3d8]">
                  <span className="text-stone-500 text-[10px] block font-bold uppercase tracking-wider">Last Synced</span>
                  <span className="font-semibold text-stone-900 block mt-0.5">{currentConnector.lastSynced || "Live API"}</span>
                </div>
                <div className="bg-[#f5f1e8] p-3 rounded-xl border border-[#e8e3d8]">
                  <span className="text-stone-500 text-[10px] block font-bold uppercase tracking-wider">Data Synced</span>
                  <span className="font-semibold text-stone-900 block mt-0.5">{currentConnector.itemCount || currentConnector.dataItems?.length || 0} items</span>
                </div>
              </div>
            )}


            {/* SIGN-IN SECTION — Real auth options */}
            {!isConnected && authConfig && (
              <div className="space-y-3">
                {/* OAuth button */}
                {authConfig.type === "oauth" && (
                  <button
                    onClick={handleOAuthConnect}
                    className="w-full px-4 py-3 bg-white border-2 border-stone-900 hover:bg-stone-900 hover:text-white text-stone-900 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
                  >
                    <AppIconRenderer iconName={currentConnector.icon} className="w-5 h-5" />
                    <span>{authConfig.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Token input */}
                {(authConfig.type === "token" || authConfig.tokenLabel) && (
                  <div className="bg-white border border-[#ded7c8] rounded-xl p-4 space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-stone-800">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>{authConfig.tokenLabel || "Paste your access token"}</span>
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="password"
                        placeholder={authConfig.tokenPlaceholder || "Paste token..."}
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#faf8f5] border border-[#ded7c8] rounded-lg text-xs text-stone-800 font-mono focus:outline-none focus:border-stone-600"
                        onKeyDown={(e) => e.key === "Enter" && handleTokenConnect()}
                      />
                      <button
                        onClick={handleTokenConnect}
                        disabled={!tokenInput.trim()}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    </div>
                    {authConfig.setupUrl && (
                      <a
                        href={authConfig.setupUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Get your token from {new URL(authConfig.setupUrl).hostname}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Setup instructions toggle */}
                {authConfig.setupSteps && (
                  <div className="bg-[#f5f1e8] border border-[#e8e3d8] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowSetup(!showSetup)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-stone-700 hover:bg-[#ede5d5] transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                        <span>Setup Instructions ({authConfig.setupSteps.length} steps)</span>
                      </div>
                      <span className="text-stone-400">{showSetup ? "▲" : "▼"}</span>
                    </button>
                    {showSetup && (
                      <div className="px-4 pb-3 space-y-2">
                        {authConfig.setupSteps.map((step, i) => (
                          <div key={i} className="flex items-start space-x-2 text-[11px] text-stone-600">
                            <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Data Items Browser (when connected) */}
            {isConnected && (
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">
                    Synced Data ({currentConnector.dataItems.length})
                  </span>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-stone-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter items..."
                      className="w-full pl-8 pr-2 py-1 bg-white border border-[#ded7c8] rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto max-h-64 pr-1">
                  {filteredItems.length === 0 ? (
                    <div className="p-6 bg-white border border-[#ded7c8] rounded-xl text-center text-xs text-stone-500">
                      {currentConnector.dataItems.length === 0
                        ? "No data synced yet. Click 'Sync Now' above."
                        : "No items match your filter."}
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div key={item.id} className="p-3 bg-white border border-[#ded7c8] hover:border-stone-400 rounded-xl space-y-1 transition-all shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900">{item.title}</span>
                          <span className="text-[10px] text-stone-500">{item.updatedAt}</span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-500 bg-[#f7f4ec] px-1.5 py-0.5 rounded border border-[#e8e3d8]">
                          {item.type}
                        </span>
                        {item.summary && (
                          <p className="text-[11px] text-stone-600 leading-relaxed pt-0.5">{item.summary}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Warning for disconnected state */}
            {!isConnected && !authConfig && (
              <div className="flex items-start space-x-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>This connector needs real credentials. Check the server documentation for setup instructions.</span>
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="absolute bottom-4 right-4 bg-stone-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center space-x-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
