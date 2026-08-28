import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  ChevronDown, 
  Mic, 
  MicOff, 
  ArrowUp, 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCw, 
  Bot, 
  User, 
  ExternalLink, 
  Layers, 
  Globe, 
  ShieldCheck, 
  Paperclip,
  CheckCircle2,
  Folder,
  Image as ImageIcon,
  Film,
  Video,
  ClipboardList,
  Brain,
  Clapperboard,
  ChevronRight
} from "lucide-react";
import { 
  AppIconRenderer, 
  GmailIcon,
  WhatsAppIcon,
  DropboxIcon, 
  GoogleCalendarIcon, 
  GoogleDriveIcon, 
  AsanaIcon, 
  LinearIcon, 
  NotionIcon, 
  SlackIcon, 
  DiscordIcon, 
  ZapierIcon, 
  GitHubIcon, 
  EitherLogo 
} from "./ConnectorIcons";
import { TrafficAnalyticsCard } from "./TrafficAnalyticsCard";
import { AppConnector, ChatMessage, UserProfile } from "../types";

interface MainChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, model: string, attachments?: any[]) => Promise<void>;
  isLoading: boolean;
  connectors: AppConnector[];
  onOpenConnector: (connectorId: string) => void;
  user: UserProfile;
}

export const MainChatView: React.FC<MainChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  connectors,
  onOpenConnector,
  user,
}) => {
  const [promptText, setPromptText] = useState("");
  const [selectedModel, setSelectedModel] = useState("Max");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [suggestionSet, setSuggestionSet] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const modelOptions = [
    { id: "Max", label: "Max", desc: "Most capable Gemini 3.7 Flash reasoning & tool execution" },
    { id: "Gemini 3.7 Flash", label: "Gemini 3.7 Flash", desc: "Ultra-fast response with Google Search grounding" },
    { id: "Gemini Pro", label: "Gemini Pro", desc: "Deep multi-agent architecture synthesis" },
    { id: "Thinking", label: "Thinking Mode", desc: "Extended step-by-step reasoning tree" },
  ];

  const suggestionSets = [
    [
      "Inspect live traffic and online users for https://either-ai.vercel.app",
      "Scan my Gmail inbox for today's urgent action items",
      "Check my GitHub repos for open pull requests and review requests",
    ],
    [
      "Analyze live visitor traffic & online users for github.com",
      "List unread messages in Gmail with sender and summary",
      "Generate BTC/USDT live trading signal with RSI and MACD",
    ],
    [
      "What are the top active models on Hugging Face right now?",
      "Summarize action items from my last Google Calendar meetings",
      "Show live server health and system telemetry",
    ],
  ];

  const currentSuggestions = suggestionSets[suggestionSet % suggestionSets.length];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [promptText]);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((result: any) => result[0].transcript).join("");
        setPromptText(transcript);
      };
      recognition.onerror = () => { setIsListening(false); };
      recognition.onend = () => { setIsListening(false); };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) { alert("Speech recognition is not supported in your current browser."); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { try { recognitionRef.current.start(); setIsListening(true); } catch (err) { console.error("Speech recognition start failed:", err); } }
  };

  const handleSend = async (customText?: string) => {
    const text = customText || promptText;
    if (!text.trim() || isLoading) return;
    const queryToSend = text.trim();
    setPromptText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await onSendMessage(queryToSend, selectedModel);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const isHomeView = messages.length === 0;
  const formattedDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl w-full mx-auto px-4 sm:px-8 select-text overflow-hidden">
      {isHomeView ? (
        <div className="flex-1 overflow-y-auto flex flex-col justify-center items-center py-10 space-y-7 animate-fadeIn">
          <div className="w-full text-left space-y-1">
            <h1 className="text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight font-serif">
              What's the next step, {(() => { const w = (user.name || "").trim().split(/\s+/)[0]; return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); })()}?
            </h1>
            <p className="text-sm font-medium text-stone-500">{formattedDate}</p>
          </div>

          <div className="w-full bg-white border border-[#ded7c8] hover:border-[#cfc6b4] focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-200/50 rounded-2xl p-4 transition-all shadow-xs flex flex-col justify-between min-h-[140px] relative">
            <textarea
              id="main-prompt-input"
              ref={textareaRef}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Either"
              rows={2}
              className="w-full bg-transparent text-base text-stone-900 placeholder-stone-400 resize-none focus:outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 mt-1">
              <div className="flex items-center space-x-1.5 relative">
                <button
                  id="prompt-attachment-plus-btn"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="w-8 h-8 rounded-lg bg-[#f5f1e8] hover:bg-[#eae4d7] text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                  title="Add attachment or tool context"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {showAttachmentMenu && (
                  <div className="absolute left-0 bottom-10 bg-white border border-[#ded7c8] rounded-xl shadow-xl p-2 w-72 z-40 text-xs text-stone-700 animate-fadeIn space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 bg-[#f5f1e8] border border-[#ded7c8] rounded-lg flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Workspace Tools & Actions</span>
                    </div>

                    <button onClick={() => { setShowAttachmentMenu(false); onOpenConnector("gdrive"); }} className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-[#f5f1e8] text-left transition-colors cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center"><Folder className="w-3.5 h-3.5 text-amber-600" /></div>
                      <div className="flex-1"><div className="font-bold text-stone-900">Google Drive & Docs</div><div className="text-[10px] text-stone-500">Attach and analyze cloud documents</div></div>
                    </button>

                    <button onClick={() => { setShowAttachmentMenu(false); setPromptText((prev) => prev + " [Image] Generate an image: "); setTimeout(() => textareaRef.current?.focus(), 50); }} className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-[#f5f1e8] text-left transition-colors cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center"><ImageIcon className="w-3.5 h-3.5 text-blue-600" /></div>
                      <div className="flex-1"><div className="font-bold text-stone-900">Image Generation</div><div className="text-[10px] text-stone-500">Generate creative visuals with AI</div></div>
                    </button>

                    <button onClick={() => { setShowAttachmentMenu(false); window.dispatchEvent(new CustomEvent("open-plan-view")); setPromptText((prev) => prev + " Create a structured execution plan for: "); }} className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-[#f5f1e8] text-left transition-colors cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center"><ClipboardList className="w-3.5 h-3.5 text-emerald-600" /></div>
                      <div className="flex-1"><div className="font-bold text-stone-900">Plan Builder</div><div className="text-[10px] text-stone-500">Build a research & execution roadmap</div></div>
                    </button>

                    <button onClick={() => { setShowAttachmentMenu(false); window.dispatchEvent(new CustomEvent("open-agent2-research")); setPromptText((prev) => prev + " Research and summarize: "); }} className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg hover:bg-[#f5f1e8] text-left transition-colors cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center"><Brain className="w-3.5 h-3.5 text-violet-600" /></div>
                      <div className="flex-1"><div className="font-bold text-stone-900 flex items-center space-x-1"><span>Deep Research Swarm</span></div><div className="text-[10px] text-stone-500">Autonomous research across connected sources</div></div>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button id="model-selector-dropdown-btn" onClick={() => setShowModelDropdown(!showModelDropdown)} className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-700 hover:bg-[#f5f1e8] transition-colors cursor-pointer">
                    <span>{selectedModel}</span><ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                  {showModelDropdown && (
                    <div className="absolute right-0 bottom-8 bg-white border border-[#ded7c8] rounded-xl shadow-xl p-1.5 w-60 space-y-1 z-40 text-xs animate-fadeIn">
                      {modelOptions.map((opt) => (
                        <button key={opt.id} onClick={() => { setSelectedModel(opt.label); setShowModelDropdown(false); }} className={`w-full text-left p-2 rounded-lg transition-colors ${selectedModel === opt.label ? "bg-[#f5f1e8] font-bold text-stone-900" : "hover:bg-[#faf8f5] text-stone-700"}`}>
                          <div className="font-semibold text-stone-900">{opt.label}</div><div className="text-[10px] text-stone-500 leading-tight">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button id="voice-mic-btn" onClick={toggleSpeechRecognition} className={`p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#f5f1e8] transition-colors cursor-pointer ${isListening ? "bg-rose-100 text-rose-600 animate-pulse" : ""}`} title={isListening ? "Listening... (Click to stop)" : "Dictate voice prompt"}>
                  {isListening ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4" />}
                </button>

                <button id="send-prompt-btn" onClick={() => handleSend()} disabled={!promptText.trim() || isLoading} className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer" title="Send message">
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center gap-1.5 pt-3">
            {connectors.slice(0, 8).map((c) => (
              <button key={c.id} onClick={() => onOpenConnector(c.id)} className={`group relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${c.status === "connected" ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" : "bg-white text-stone-600 border-[#ded7c8] hover:bg-[#f5f1e8] hover:border-stone-300"}`} title={c.status === "connected" ? `${c.name} — connected` : `Connect ${c.name}`}>
                <AppIconRenderer iconName={c.icon} className="w-3.5 h-3.5" /><span className="hidden sm:inline">{c.name}</span>{c.status === "connected" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
              </button>
            ))}
            <button onClick={() => onOpenConnector(connectors[0]?.id || "gmail")} className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-stone-500 hover:text-stone-800 hover:bg-[#f5f1e8] border border-dashed border-stone-300 hover:border-stone-400 transition-all cursor-pointer">
              <Plus className="w-3 h-3" /><span>All</span>
            </button>
          </div>

          <div className="w-full flex flex-wrap items-center gap-2 pt-2">
            {currentSuggestions.map((sug, idx) => (
              <button key={idx} onClick={() => handleSend(sug)} className="px-4 py-2 bg-white hover:bg-[#f7f4ec] border border-[#ded7c8] text-stone-800 rounded-2xl text-xs sm:text-sm font-medium transition-all shadow-2xs cursor-pointer hover:border-stone-400">
                {sug}
              </button>
            ))}
            <button onClick={() => setSuggestionSet((prev) => prev + 1)} className="px-3 py-2 bg-transparent hover:bg-[#f0ebd9] text-stone-600 rounded-2xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 transition-colors cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /><span>More suggestions</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto py-4 space-y-6 w-full pr-1">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id || idx} className={`flex items-start space-x-3 w-full ${isUser ? "flex-row-reverse space-x-reverse justify-start" : "flex-row justify-start"} animate-fadeIn`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs overflow-hidden ${isUser ? "bg-gradient-to-tr from-purple-400 to-cyan-300 text-purple-900 font-bold text-xs" : "bg-stone-900 text-white"}`}>
                    {isUser ? (user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : (user.name || "G").trim().charAt(0).toUpperCase()) : <EitherLogo className="w-4 h-4" />}
                  </div>
                  <div className={`flex-1 max-w-[88%] space-y-2 ${isUser ? "text-right" : "text-left"}`}>
                    <div className="flex items-center space-x-2 text-xs text-stone-500">
                      <span className="font-semibold text-stone-800">{isUser ? user.name || "You" : "Either"}</span><span>•</span><span>{msg.timestamp || "Just now"}</span>
                    </div>
                    {!isUser && msg.toolsUsed && msg.toolsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.toolsUsed.map((tool: any, tIdx: number) => (
                          <div key={tIdx} className="px-2 py-0.5 rounded-md bg-[#ede8dc] border border-[#ded7c8] text-stone-700 text-[10px] font-mono flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>{tool.name}</span>{tool.details && <span className="text-stone-400">({tool.details})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {!isUser && msg.analyticsData && (
                      <TrafficAnalyticsCard report={msg.analyticsData} onInspectAnother={(u) => onSendMessage(`Inspect live traffic and online users for ${u}`, selectedModel)} />
                    )}
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isUser ? "bg-stone-900 text-white rounded-tr-none inline-block shadow-2xs text-left" : "bg-white border border-[#ded7c8] text-stone-900 rounded-tl-none shadow-2xs prose prose-stone max-w-none text-xs sm:text-sm whitespace-pre-wrap"}`}>
                      {msg.content}
                    </div>
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[11px] font-medium text-stone-500 font-mono">Sources & Grounding:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((s, sIdx) => (
                            <a key={sIdx} href={s.url || s.uri} target="_blank" rel="noreferrer" className="px-2 py-0.5 bg-[#f7f4ec] hover:bg-[#eee8dc] border border-[#ded7c8] text-stone-700 rounded-md text-[10px] flex items-center space-x-1 transition-colors">
                              <span className="truncate max-w-[180px]">{s.title}</span><ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {!isUser && (
                      <div className="flex justify-end pt-1">
                        <button onClick={() => copyMessage(msg.content, idx)} className="text-stone-400 hover:text-stone-700 text-[11px] flex items-center space-x-1 cursor-pointer">
                          {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}<span>{copiedIdx === idx ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-start space-x-3.5 animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0"><EitherLogo className="w-4 h-4" /></div>
                <div className="bg-white border border-[#ded7c8] rounded-2xl rounded-tl-none p-4 text-xs text-stone-600 flex items-center space-x-2 shadow-2xs">
                  <RotateCw className="w-4 h-4 animate-spin text-stone-500" /><span className="animate-pulse font-medium">Either reasoning with connected enterprise tools...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 pt-2 pb-4 bg-[#faf8f5] w-full border-t border-[#f0ebd9]/80">
            <div className="bg-white border border-[#ded7c8] hover:border-stone-400 focus-within:border-stone-500 rounded-2xl p-3 shadow-2xs flex flex-col justify-between">
              <textarea ref={textareaRef} value={promptText} onChange={(e) => setPromptText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask Either..." rows={1} className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 resize-none focus:outline-none" />
              <div className="flex items-center justify-between pt-2 border-t border-[#f0ebd9] mt-2">
                <div className="flex items-center space-x-1.5">
                  <button onClick={() => onOpenConnector("gdrive")} className="p-1.5 rounded-lg bg-[#f5f1e8] hover:bg-[#eae4d7] text-stone-700 text-xs flex items-center space-x-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /><span>Attach</span>
                  </button>
                  <span className="text-[10px] text-stone-400">Model: <span className="font-semibold text-stone-700">{selectedModel}</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={toggleSpeechRecognition} className={`p-1.5 rounded-lg text-stone-600 hover:text-stone-900 transition-colors cursor-pointer ${isListening ? "bg-rose-100 text-rose-600 animate-pulse" : ""}`}>
                    {isListening ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleSend()} disabled={!promptText.trim() || isLoading} className="w-7 h-7 rounded-full bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
