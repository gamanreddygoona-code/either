import React, { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { AppIconRenderer } from "./ConnectorIcons";
import { AppConnector } from "../types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (query: string) => void;
  connectors?: AppConnector[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  connectors = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [serverResults, setServerResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setServerResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        if (data.results) {
          setServerResults(data.results);
        }
      } catch (err) {
        console.error("Search query failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  // Local connector items
  const localItems = connectors.flatMap((c) =>
    (c.dataItems || []).map((item) => ({
      title: item.title,
      source: c.id,
      type: item.type,
      date: item.updatedAt,
      snippet: item.summary || item.title,
    }))
  );

  const combinedResults = [
    ...localItems.filter(
      (item) =>
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.snippet.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    ...serverResults,
  ];

  // Deduplicate by title
  const filtered = Array.from(new Map(combinedResults.map((r) => [r.title, r])).values());

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#faf8f5] border border-[#ded7c8] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[550px]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#e8e3d8] flex items-center space-x-3 bg-white">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search across Google Drive, Notion, Slack, Linear, Calendar..."
            autoFocus
            className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-2">
            Connected Knowledge Grounding ({filtered.length})
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-stone-500">
              No results found for "{searchTerm}".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectResult(`Search result: "${item.title}" - ${item.snippet}`);
                  onClose();
                }}
                className="p-3 bg-white hover:bg-[#f7f4ec] border border-[#ded7c8] hover:border-stone-400 rounded-xl cursor-pointer transition-all shadow-2xs space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AppIconRenderer iconName={item.source} className="w-4 h-4" />
                    <span className="text-xs font-bold text-stone-900 group-hover:text-stone-950">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400">{item.date}</span>
                </div>
                <p className="text-[11px] text-stone-600 pl-6 leading-relaxed">
                  {item.snippet}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
