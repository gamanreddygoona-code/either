import React from "react";
import { 
  PanelLeftClose, 
  PanelLeft, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Plus, 
  Minus, 
  Square, 
  X,
  Calendar,
  Zap,
  Folder,
  Bot,
  PanelRight,
  PanelRightClose,
  Sparkles
} from "lucide-react";
import { ChatTab } from "../types";

interface WindowTabBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onToggleLanding?: () => void;
  tabs: ChatTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
}

export const WindowTabBar: React.FC<WindowTabBarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  onToggleLanding,
  tabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onCloseTab,
}) => {
  return (
    <header className="h-11 bg-[#faf8f5] border-b border-[#e8e3d8] flex items-center justify-between px-3 select-none shrink-0 z-30">
      {/* Left Navigation & Sidebar Toggle Controls */}
      <div className="flex items-center space-x-2">
        <button
          id="toggle-sidebar-btn"
          onClick={onToggleSidebar}
          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-[#eee8dc] rounded-lg transition-colors"
          title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center space-x-0.5 text-stone-400">
          <button 
            id="nav-back-btn"
            className="p-1 hover:text-stone-700 hover:bg-[#eee8dc] rounded transition-colors disabled:opacity-30"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            id="nav-forward-btn"
            className="p-1 hover:text-stone-700 hover:bg-[#eee8dc] rounded transition-colors disabled:opacity-30"
            title="Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Tabs List matching screenshot */}
      <div className="flex-1 flex items-center space-x-1 px-3 overflow-x-auto no-scrollbar max-w-4xl">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-150 border max-w-[200px] shrink-0 ${
                isActive
                  ? "bg-white text-stone-900 font-medium border-[#ded7c8] shadow-sm"
                  : "bg-transparent text-stone-600 hover:text-stone-800 hover:bg-[#f2ecdf] border-transparent"
              }`}
            >
              {tab.type === "meeting" ? (
                <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              ) : tab.type === "routine" ? (
                <Zap className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              ) : tab.type === "project" ? (
                <Folder className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              )}
              
              <span className="truncate">{tab.title}</span>

              {tabs.length > 1 && (
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-stone-200 text-stone-400 hover:text-stone-700 rounded transition-opacity"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add New Tab Button */}
        <button
          id="new-tab-btn"
          onClick={onNewTab}
          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-[#eee8dc] rounded-lg transition-colors shrink-0"
          title="New Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Desktop Window Controls */}
      <div className="flex items-center space-x-2 text-stone-400">
        {onToggleLanding && (
          <button
            onClick={onToggleLanding}
            className="px-2.5 py-1 rounded-lg bg-[#f0ebd9] hover:bg-[#e6dfcb] border border-[#ded7c8] text-stone-800 text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-2xs"
            title="View 3D Animated Landing Page"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px]">3D Landing</span>
          </button>
        )}

        <div className="h-4 w-px bg-[#ded7c8]"></div>

        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).desktop?.minimize) {
              (window as any).desktop.minimize();
            }
          }}
          className="p-1 hover:text-stone-800 hover:bg-[#eee8dc] rounded transition-colors cursor-pointer"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).desktop?.maximize) {
              (window as any).desktop.maximize();
            }
          }}
          className="p-1 hover:text-stone-800 hover:bg-[#eee8dc] rounded transition-colors cursor-pointer"
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).desktop?.close) {
              (window as any).desktop.close();
            }
          }}
          className="p-1 hover:text-rose-600 hover:bg-rose-100 rounded transition-colors cursor-pointer"
          title="Close Window"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
