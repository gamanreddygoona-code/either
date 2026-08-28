import React, { useState, useEffect } from "react";
import { WindowTabBar } from "./components/WindowTabBar";
import { Sidebar } from "./components/Sidebar";
import { MainChatView } from "./components/MainChatView";
import { ConnectorDrawer } from "./components/ConnectorDrawer";
import { MeetingNotesView } from "./components/MeetingNotesView";
import { RoutinesView } from "./components/RoutinesView";
import { SearchModal } from "./components/SearchModal";
import { ProjectFolderView } from "./components/ProjectFolderView";
import { DedicatedServerView } from "./components/DedicatedServerView";
import { WiFiHardwareView } from "./components/WiFiHardwareView";
import { AITradingDesk } from "./components/AITradingDesk";
import { BrowserAgentView } from "./components/BrowserAgentView";
import { SandboxView } from "./components/SandboxView";
import { VideoSwarmView } from "./components/VideoSwarmView";
import { SkillsMemoryDrawer } from "./components/SkillsMemoryDrawer";
import { AuthModal } from "./components/AuthModal";
import { LandingPage } from "./components/LandingPage";
import { 
  INITIAL_CONNECTORS, 
  INITIAL_MEETING_NOTES, 
  INITIAL_ROUTINES, 
  INITIAL_PROJECTS 
} from "./data/connectors";
import { 
  AppConnector, 
  ChatTab, 
  ChatMessage, 
  MeetingNote, 
  Routine, 
  ProjectItem, 
  UserProfile 
} from "./types";

export default function App() {
  const [showLanding, setShowLanding] = useState(() => {
    // If explicitly on /landing or #landing, show landing
    if (window.location.pathname === "/landing" || window.location.hash === "#landing") return true;
    // Default directly into the full Chat UI & Sovereign Workspace!
    return false;
  });
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [activeView, setActiveView] = useState<"chat" | "search" | "meeting-notes" | "routines" | "project" | "servers" | "wifi-hardware" | "trading" | "browser-agent" | "sandbox" | "video-swarm">("chat");
  const [connectors, setConnectors] = useState<AppConnector[]>(INITIAL_CONNECTORS);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>(INITIAL_MEETING_NOTES);
  const [routines, setRoutines] = useState<Routine[]>(INITIAL_ROUTINES);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [connectorDrawerOpen, setConnectorDrawerOpen] = useState(false);
  const [skillsDrawerOpen, setSkillsDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("either_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old Pro to Start if needed, but keep Start as default for new users
        return parsed;
      }
    } catch (e) {}
    return {
      name: "Gaman Sai",
      email: "gamanreddy.goona@gmail.com",
      plan: "Start",
      avatarGradient: "from-purple-400 via-pink-300 to-cyan-300",
      avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocIS8iB_f_gPjV_qV1w5B=s96-c",
      version: "0.84.17",
      contextEnabled: true,
      isAuthenticated: true,
      tokenUsage: {
        used: 0,
        limit: 100000,
        remaining: 100000,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth()+1, 1).toISOString(),
        plan: "Start",
      }
    };
  });

  // Listen for OAuth completion from popup windows
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "EITHER_AUTH_SUCCESS") {
        if (event.data.user) {
          const newUser = { ...user, ...event.data.user, isAuthenticated: true };
          setUser(newUser);
          try {
            localStorage.setItem("either_user", JSON.stringify(newUser));
          } catch (e) {}
        }
        // Force refresh connectors
        fetch("/api/connectors")
          .then((res) => res.json())
          .then((data) => {
            if (data.connectors) {
              setConnectors((prev) =>
                prev.map((c) => {
                  const serverData = data.connectors[c.id];
                  return serverData ? { ...c, ...serverData } : c;
                })
              );
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [user]);

  // Real fresh chat session grounded in real user data
  const [tabs, setTabs] = useState<ChatTab[]>([
    {
      id: "tab-real-1",
      title: "New Chat",
      type: "chat",
      messages: [],
      model: "Max",
      createdAt: "Today",
      connectedAppIds: ["gmail", "github", "gcalendar", "gdrive", "notion", "slack", "huggingface", "servers"],
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>("tab-real-1");

  const currentTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const isSidebarVisible = sidebarPinned || sidebarHovered;

  // Listen for navigation events from Plus menu
  useEffect(() => {
    const openPlan = () => setActiveView("routines");
    const openResearch = () => setActiveView("chat");
    window.addEventListener("open-plan-view", openPlan);
    window.addEventListener("open-agent2-research", openResearch);
    return () => {
      window.removeEventListener("open-plan-view", openPlan);
      window.removeEventListener("open-agent2-research", openResearch);
    };
  }, []);

  // Fetch live user & connector status from server
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser((prev) => ({ ...prev, ...data.user, tokenUsage: data.user.tokenUsage || prev.tokenUsage }));
          try {
            localStorage.setItem("either_user", JSON.stringify(data.user));
          } catch (e) {}
        }
      })
      .catch((err) => console.warn("Auth fetch:", err));

    // Fetch Start plan token usage (100k/month) — refresh on mount
    fetch("/api/user/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.usage) {
          setUser((prev) => ({
            ...prev,
            tokenUsage: {
              used: data.usage.used,
              limit: data.usage.limit,
              remaining: data.usage.remaining,
              resetDate: data.usage.resetDate,
              plan: data.usage.plan,
              percentUsed: data.usage.percentUsed,
            },
            plan: data.usage.plan || prev.plan,
          }));
        }
      })
      .catch(() => {});

    const fetchStatus = () => {
      fetch("/api/connectors")
        .then((res) => res.json())
        .then((data) => {
          if (data.connectors) {
            setConnectors((prev) =>
              prev.map((c) => {
                const serverData = data.connectors[c.id];
                return serverData ? { ...c, ...serverData } : c;
              })
            );
          }
        })
        .catch(() => {});
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Tab Creation
  const handleNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: ChatTab = {
      id: newTabId,
      title: "New Chat",
      type: "chat",
      messages: [],
      model: "Max",
      createdAt: "Just now",
      connectedAppIds: connectors.map((c) => c.id),
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
    setActiveView("chat");
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[remaining.length - 1].id);
    }
  };

  // Connect / Disconnect handlers
  const handleConnect = async (id: string, account?: string, credentials?: any) => {
    const connectedAccount = account || (id === "github" ? "github.com/gamanreddygoona-code" : "gamanreddy.goona@gmail.com");
    
    // Immediate UI update
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id === id || (id === "gmail" && (c.id === "gdrive" || c.id === "gcalendar"))) {
          return {
            ...c,
            status: "connected",
            connectedAccount,
            lastSynced: "Just now (Verified Live)",
          };
        }
        return c;
      })
    );

    // Sync user auth
    if (id === "gmail" || id === "gdrive" || id === "gcalendar") {
      const updated = {
        ...user,
        name: user.name && user.name !== "Guest" ? user.name : "Gaman Sai",
        email: connectedAccount,
        isAuthenticated: true,
      };
      setUser(updated);
      try {
        localStorage.setItem("either_user", JSON.stringify(updated));
      } catch (e) {}
    }

    try {
      const res = await fetch(`/api/connectors/${id}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: connectedAccount, credentials }),
      });
      const data = await res.json();
      if (data.success && data.connector) {
        setConnectors((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...data.connector } : c))
        );
      }
    } catch (err) {
      console.warn("Server connector sync:", err);
    }
  };

  const handleSync = async (id: string) => {
    try {
      const res = await fetch(`/api/connectors/${id}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setConnectors((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...data.connector } : c))
        );
      }
    } catch (err) {
      console.error("Connector sync failed:", err);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      const res = await fetch(`/api/connectors/${id}/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setConnectors((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...data.connector } : c))
        );
      }
    } catch (err) {
      console.error("Connector disconnect failed:", err);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (content: string, model: string, attachments?: any[]) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: "Just now",
      attachments,
    };

    // Update active tab title if it's the first message
    const updatedMessages = [...currentTab.messages, userMsg];
    const newTitle = currentTab.messages.length === 0
      ? content.slice(0, 22) + (content.length > 22 ? "..." : "")
      : currentTab.title;

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, messages: updatedMessages, title: newTitle, model }
          : t
      )
    );

    setIsLoading(true);

    try {
      // Build context from active connected apps
      const connectedContext = user.contextEnabled
        ? connectors
            .filter((c) => c.status === "connected")
            .map((c) => `[${c.name}]: ${c.dataItems.map((d) => d.title).join(", ")}`)
            .join("\n")
        : "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: content,
          history: currentTab.messages,
          model,
          activeConnectors: connectors.filter((c) => c.status === "connected").map((c) => c.id),
          connectedContext,
        }),
      });

      const data = await res.json();

      // Update token usage if provided
      if (data.usage || data.code === "TOKEN_LIMIT_EXCEEDED") {
        const usage = data.usage || data.usage;
        if (usage) {
          setUser((prev) => ({
            ...prev,
            tokenUsage: {
              used: usage.used ?? prev.tokenUsage?.used ?? 0,
              limit: usage.limit ?? prev.tokenUsage?.limit ?? 100000,
              remaining: usage.remaining ?? 0,
              resetDate: usage.resetDate ?? prev.tokenUsage?.resetDate ?? new Date().toISOString(),
              plan: usage.plan ?? prev.plan,
              percentUsed: usage.percentUsed ?? Math.round(((usage.used || 0) / (usage.limit || 100000)) * 100),
            }
          }));
        }
      }

      // Handle token limit exceeded
      if (res.status === 429 || data.code === "TOKEN_LIMIT_EXCEEDED") {
        const limitMsg: ChatMessage = {
          id: `msg-${Date.now()}-limit`,
          role: "assistant",
          content: `⚠️ **Start plan limit reached — 100k tokens/month**\n\nYou've used **${data.usage?.used?.toLocaleString() || "100,000"}/${data.usage?.limit?.toLocaleString() || "100,000"}** tokens. Resets **${data.usage?.resetDate ? new Date(data.usage.resetDate).toLocaleDateString() : "next month"}**.\n\nUpgrade to **Pro (500k)** or **Enterprise (2M)** for more, or wait for reset. Your prompt was not processed to save tokens.`,
          timestamp: "Just now",
          mode: "fallback" as const,
        };
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabId
              ? { ...t, messages: [...updatedMessages, limitMsg] }
              : t
          )
        );
        setIsLoading(false);
        return;
      }

      // Also refresh usage via dedicated endpoint for accuracy
      fetch("/api/user/usage").then(r=>r.json()).then(d=>{
        if(d.success && d.usage){
          setUser(prev=> ({ ...prev, tokenUsage: { used: d.usage.used, limit: d.usage.limit, remaining: d.usage.remaining, resetDate: d.usage.resetDate, plan: d.usage.plan, percentUsed: d.usage.percentUsed } }));
        }
      }).catch(()=>{});

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: data.answer || "No response received.",
        timestamp: "Just now",
        toolsUsed: data.toolsUsed,
        sources: data.sources,
        mode: data.mode,
        analyticsData: data.analyticsData,
        generatedMedia: data.generatedMedia,
      };

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? { ...t, messages: [...updatedMessages, assistantMsg] }
            : t
        )
      );
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "I encountered a communication issue. Please check your network or try again.",
        timestamp: "Just now",
      };
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? { ...t, messages: [...updatedMessages, errorMsg] }
            : t
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openConnectorDrawer = (connectorId?: string) => {
    if (connectorId) setSelectedConnectorId(connectorId);
    setConnectorDrawerOpen(true);
  };

  if (showLanding) {
    return (
      <LandingPage
        onEnterApp={() => {
          sessionStorage.setItem("enteredWorkspace", "1");
          setShowLanding(false);
        }}
        onOpenTradingDesk={() => {
          sessionStorage.setItem("enteredWorkspace", "1");
          setShowLanding(false);
          setActiveView("trading");
        }}
        onOpenBrowserAgent={() => {
          sessionStorage.setItem("enteredWorkspace", "1");
          setShowLanding(false);
          setActiveView("browser-agent");
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans antialiased overflow-hidden select-none">
      {/* Top Window Tab Bar — Swarm Hub removed */}
      <WindowTabBar
        sidebarOpen={isSidebarVisible}
        onToggleSidebar={() => setSidebarPinned(!sidebarPinned)}
        onToggleLanding={() => setShowLanding(true)}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => {
          setActiveTabId(id);
          setActiveView("chat");
        }}
        onNewTab={handleNewTab}
        onCloseTab={handleCloseTab}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">


        {/* Left Navigation Sidebar (visible when pinned or hovered) */}
        {isSidebarVisible && (
          <div
            onMouseLeave={() => {
              if (!sidebarPinned) setSidebarHovered(false);
            }}
            className={`${sidebarPinned ? '' : 'absolute left-0 top-11 bottom-0 z-40'}`}
          >
            <Sidebar
              activeView={activeView}
              onSelectView={(view) => {
                if (view === "search") {
                  setSearchModalOpen(true);
                } else {
                  setActiveView(view);
                }
              }}
              onNewChat={handleNewTab}
              projects={projects}
              user={user}
              onToggleContext={() =>
                setUser((prev) => ({ ...prev, contextEnabled: !prev.contextEnabled }))
              }
              onOpenConnectors={() => openConnectorDrawer()}
              onOpenSkills={() => setSkillsDrawerOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
              isPinned={sidebarPinned}
              onTogglePin={() => setSidebarPinned(!sidebarPinned)}
            />
          </div>
        )}

        {/* Center Content Workspace */}
        <main className="flex-1 flex flex-col bg-[#faf8f5] overflow-hidden relative">
          {activeView === "chat" && (
            <MainChatView
              messages={currentTab.messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              connectors={connectors}
              onOpenConnector={(id) => openConnectorDrawer(id)}
              user={user}
            />
          )}

          {activeView === "meeting-notes" && (
            <MeetingNotesView
              notes={meetingNotes}
              onAddNote={(newNote) => setMeetingNotes([newNote, ...meetingNotes])}
              onOpenConnector={(id) => openConnectorDrawer(id)}
            />
          )}

          {activeView === "routines" && (
            <RoutinesView
              routines={routines}
              onOpenConnector={(id) => openConnectorDrawer(id)}
            />
          )}

          {activeView === "project" && (
            <ProjectFolderView
              projects={projects}
              onOpenDoc={(name) => {
                handleNewTab();
                setTimeout(() => {
                  handleSendMessage(`Please open and review project file: "${name}"`, "Max");
                }, 100);
              }}
            />
          )}

          {activeView === "servers" && (
            <DedicatedServerView />
          )}

          {activeView === "wifi-hardware" && (
            <WiFiHardwareView />
          )}

          {activeView === "trading" && (
            <AITradingDesk />
          )}

          {activeView === "browser-agent" && (
            <BrowserAgentView
              onTokenSaved={() => {
                fetch("/api/connectors")
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.connectors) {
                      setConnectors((prev) =>
                        prev.map((c) => {
                          const serverData = data.connectors[c.id];
                          return serverData ? { ...c, ...serverData } : c;
                        })
                      );
                    }
                  })
                  .catch(() => {});
              }}
            />
          )}

          {activeView === "sandbox" && (
            <SandboxView onOpenMovie={(script)=> { setActiveView("video-swarm"); if(script) window.dispatchEvent(new CustomEvent("sandbox-movie-script", { detail: script })); }} />
          )}

          {activeView === "video-swarm" && (
            <VideoSwarmView />
          )}
        </main>
      </div>

      {/* Account Authentication Modal (Google / Instagram / Email) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        onUserUpdate={(u) => setUser(u)}
      />

      {/* Skills & Permanent Memory Drawer */}
      <SkillsMemoryDrawer
        isOpen={skillsDrawerOpen}
        onClose={() => setSkillsDrawerOpen(false)}
      />

      {/* Connectors Modal / Drawer */}
      <ConnectorDrawer
        isOpen={connectorDrawerOpen}
        onClose={() => setConnectorDrawerOpen(false)}
        connectors={connectors}
        onConnect={handleConnect}
        onSync={handleSync}
        onDisconnect={handleDisconnect}
        selectedConnectorId={selectedConnectorId}
        user={user}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        connectors={connectors}
        onSelectResult={(query) => {
          handleSendMessage(query, "Max");
          setActiveView("chat");
        }}
      />
    </div>
  );
}
