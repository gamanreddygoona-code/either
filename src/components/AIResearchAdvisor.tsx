import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Loader2, 
  HelpCircle,
  Cpu,
  Zap,
  Globe
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: {
    title: string;
    uri: string;
  }[];
}

interface AIResearchAdvisorProps {
  initialPrompt?: string;
}

export const AIResearchAdvisor: React.FC<AIResearchAdvisorProps> = ({ initialPrompt = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `### Welcome to the Multi-Agent Swarm UI Research Advisor

I am your specialized AI Multi-Agent Architect. You can ask me anything about **free and open-source UIs and visual frameworks for agent swarms**, such as:

- **Agency Swarm** vs **AutoGen Studio** vs **Langflow** architectural trade-offs
- Setting up **100% offline local Ollama/vLLM** swarms
- Docker container sandboxing for autonomous coding agents (**OpenHands**, **Dify**)
- Visual drag-and-drop node builders vs Code-first handoff networks
- Generating runnable boilerplate configurations and Docker compose files

Click one of the suggested research topics below or type your custom query!`,
    },
  ]);

  const [inputQuery, setInputQuery] = useState(initialPrompt);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const suggestedQueries = [
    "Compare Agency Swarm vs AutoGen Studio for multi-agent handoffs",
    "Which open source Swarm UI is best for 100% offline Ollama models?",
    "How does Langflow compare to Dify for visual multi-agent workflows?",
    "What is the best Docker sandbox UI for autonomous coding swarms?",
    "Generate Python Agency Swarm boilerplate for a 3-agent research team",
  ];

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/research/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          history: newMessages.slice(-6),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "No response generated.",
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Failed to fetch live AI research response: ${err.message}. Please check your connection or try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessageContent = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportChatAsMarkdown = () => {
    let md = `# AI Swarm UI Research Advisor Report\n\n`;
    md += `*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    messages.forEach((m) => {
      md += `### ${m.role === "user" ? "User Query" : "AI Swarm Architect"}\n\n`;
      md += `${m.content}\n\n`;
      if (m.sources && m.sources.length > 0) {
        md += `**Sources & References:**\n`;
        m.sources.forEach((s) => {
          md += `- [${s.title}](${s.uri})\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    navigator.clipboard.writeText(md);
    alert("Research Report copied to clipboard as Markdown!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </span>
            <h2 className="text-xl font-bold text-white">AI Multi-Agent Swarm Research Advisor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Powered by Gemini 3.7 Flash with Google Search grounding. Ask complex architectural questions, request benchmarks, and generate swarm boilerplate.
          </p>
        </div>

        <button
          onClick={exportChatAsMarkdown}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Research Report</span>
        </button>
      </div>

      {/* Suggested Queries Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Research Prompts:</span>
        </span>
        {suggestedQueries.map((query, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(query)}
            className="px-3 py-1 bg-slate-900 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-700 text-slate-300 hover:text-indigo-200 rounded-xl text-xs transition-colors text-left"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Chat Messages Thread */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 min-h-[420px]">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={index}
              className={`flex items-start space-x-3.5 ${
                isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none space-y-3"
                }`}
              >
                {/* Text Content */}
                <div className="prose prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Sources if present */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Verified Sources & Documentation:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((s, sIdx) => (
                        <a
                          key={sIdx}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 rounded-lg text-[11px] flex items-center space-x-1 transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{s.title || s.uri}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy button on assistant messages */}
                {!isUser && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => copyMessageContent(msg.content, index)}
                      className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center space-x-1"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedIndex === index ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-700 flex items-center justify-center text-purple-300">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <span className="animate-pulse">AI Swarm Architect researching web documentation and synthesizing response...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center space-x-2">
        <input
          id="advisor-query-input"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendQuery();
            }
          }}
          placeholder="Ask anything about open-source Swarm UIs, architecture, code boilerplate, or local Ollama setup..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSendQuery()}
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-md shadow-indigo-600/20"
        >
          <span>Ask Advisor</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
