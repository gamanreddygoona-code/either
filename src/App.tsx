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
  const [activeView, setActiveView] = useState<"chat" | "search" | "meeting-notes" | "routines" | "project" | "servers" | "wifi-hardware" | "trading" | "browser-agent">("chat");
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

  const [user, setUser] = useState<UserProfile>({
    name: "Gaman Sai",
    email: "gamanreddy.goona@gmail.com",
    plan: "Pro Agent Workspace",
    avatarGradient: "from-purple-400 via-pink-300 to-cyan-300",
    avatarUrl: "https://lh3.googleusercontent.com/a/ACg8ocIS8iB_f_gPjV_qV1w5B=s96-c",
    version: "0.84.17",
    contextEnabled: true,
    isAuthenticated: true,
  });

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
          setUser((prev) => ({ ...prev, ...data.user }));
        }
      })
      .catch((err) => console.warn("Auth fetch:", err));

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
    try {
      const res = await fetch(`/api/connectors/${id}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, credentials }),
      });
      const data = await res.json();
      if (data.needsOAuth && data.authUrl) {
        window.open(data.authUrl, "_blank", "width=560,height=720");
        return;
      }
      if (data.success) {
        setConnectors((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...data.connector } : c))
        );
      }
    } catch (err) {
      console.error("Connector connect failed:", err);
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

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: data.answer || "No response received.",
        timestamp: "Just now",
        toolsUsed: data.toolsUsed,
        sources: data.sources,
        mode: data.mode,
        analyticsData: data.analyticsData,
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
