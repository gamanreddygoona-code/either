import React, { useState } from "react";
import { 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  Code, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowRight, 
  Layers, 
  Loader2,
  ExternalLink
} from "lucide-react";
import { SWARM_UI_PROJECTS } from "../data/swarmProjects";
import { SwarmUIProject } from "../types";

export const StackRecommender: React.FC = () => {
  const [answers, setAnswers] = useState<{
    language: string;
    paradigm: string;
    hosting: string;
    goal: string;
  }>({
    language: "python",
    paradigm: "canvas",
    hosting: "local",
    goal: "general_swarm",
  });

  const [generatedBoilerplate, setGeneratedBoilerplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Scoring algorithm
  const recommendations = SWARM_UI_PROJECTS.map((project) => {
    let score = 50;

    // Language match
    if (answers.language === "python" && project.primaryLanguage.toLowerCase().includes("python")) score += 20;
    if (answers.language === "typescript" && (project.primaryLanguage.toLowerCase().includes("typescript") || project.uiFramework.toLowerCase().includes("next"))) score += 25;
    if (answers.language === "no_code" && project.features.visualGraphBuilder) score += 25;

    // Paradigm match
    if (answers.paradigm === "canvas" && project.features.visualGraphBuilder) score += 25;
    if (answers.paradigm === "copilot" && project.category === "Web Copilot & Chat") score += 25;
    if (answers.paradigm === "workspace" && project.features.dockerSandbox) score += 30;
    if (answers.paradigm === "platform" && project.category === "Visual Workflow Platform") score += 25;

    // Hosting match
    if (answers.hosting === "local" && project.features.localModelsSupport) score += 20;
    if (answers.hosting === "cloud") score += 15;

    // Goal match
    if (answers.goal === "coding" && project.features.dockerSandbox) score += 30;
    if (answers.goal === "handoff" && project.features.handoffSupport) score += 25;
    if (answers.goal === "dag" && project.supportedArchitectures.includes("Graph DAG / Dynamic Routing")) score += 25;

    return {
      project,
      matchPercentage: Math.min(Math.round(score), 99),
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  const topMatch = recommendations[0]?.project;

  const handleGenerateBoilerplate = async (targetProject: SwarmUIProject) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/research/generate-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework: targetProject.name,
          topology: targetProject.supportedArchitectures[0] || "Hierarchical",
          agents: ["Supervisor", "Researcher", "Analyst"],
          goal: answers.goal,
        }),
      });
      const data = await res.json();
      setGeneratedBoilerplate(data.config || targetProject.codeSnippet.code);
    } catch (err) {
      setGeneratedBoilerplate(targetProject.codeSnippet.code);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = () => {
    if (!generatedBoilerplate) return;
    navigator.clipboard.writeText(generatedBoilerplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Compass className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white">Interactive Swarm UI Stack Matcher</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Answer 4 quick architectural questions to receive mathematically weighted framework recommendations and copy-pasteable boilerplate code.
        </p>
      </div>

      {/* 4-Step Questionnaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1: Language */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Step 1: Language Stack</span>
          <h4 className="text-xs font-semibold text-white">Preferred Primary Language?</h4>
          <div className="space-y-2">
            {[
              { id: "python", label: "Python (LangChain, AutoGen, Agency Swarm)" },
              { id: "typescript", label: "TypeScript / Node.js (VoltAgent, Next.js)" },
              { id: "no_code", label: "No-Code / Visual Canvas First (Dify, Langflow)" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAnswers(prev => ({ ...prev, language: opt.id }))}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                  answers.language === opt.id
                    ? "bg-indigo-950 border-indigo-500 text-indigo-200 font-semibold"
                    : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: UI Paradigm */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Step 2: UI Paradigm</span>
          <h4 className="text-xs font-semibold text-white">Desired Interface Experience?</h4>
          <div className="space-y-2">
            {[
              { id: "canvas", label: "Visual Drag-and-Drop Node Canvas" },
              { id: "copilot", label: "Web Copilot Chat & Debug Rail" },
              { id: "workspace", label: "Autonomous IDE Sandbox (Terminal/Diffs)" },
              { id: "platform", label: "Enterprise Workflow Platform with RAG" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAnswers(prev => ({ ...prev, paradigm: opt.id }))}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                  answers.paradigm === opt.id
                    ? "bg-cyan-950 border-cyan-500 text-cyan-200 font-semibold"
                    : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Hosting & Privacy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Step 3: Model Hosting</span>
          <h4 className="text-xs font-semibold text-white">LLM Provider & Privacy?</h4>
          <div className="space-y-2">
            {[
              { id: "local", label: "100% Offline Local Models (Ollama/vLLM)" },
              { id: "cloud", label: "Cloud APIs (Gemini 2.0 / OpenAI / Anthropic)" },
              { id: "hybrid", label: "Hybrid (Local fallback + Cloud supervisor)" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAnswers(prev => ({ ...prev, hosting: opt.id }))}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                  answers.hosting === opt.id
                    ? "bg-purple-950 border-purple-500 text-purple-200 font-semibold"
                    : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 4: Swarm Core Goal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Step 4: Swarm Objective</span>
          <h4 className="text-xs font-semibold text-white">Core Functional Goal?</h4>
          <div className="space-y-2">
            {[
              { id: "general_swarm", label: "Collaborative Research & Planning" },
              { id: "coding", label: "Autonomous Software Engineering & Docker" },
              { id: "handoff", label: "Multi-Role Customer & Triage Handoffs" },
              { id: "dag", label: "Complex Graph Data Pipelines" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAnswers(prev => ({ ...prev, goal: opt.id }))}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                  answers.goal === opt.id
                    ? "bg-amber-950 border-amber-500 text-amber-200 font-semibold"
                    : "bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Match Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Recommendation Matrix</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Top Matched Open-Source Swarm UIs</h3>
          </div>
          <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            Calculated across {SWARM_UI_PROJECTS.length} frameworks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map(({ project, matchPercentage }, idx) => (
            <div
              key={project.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${
                idx === 0
                  ? "bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10"
                  : "bg-slate-950 border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    idx === 0 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
                  }`}>
                    {matchPercentage}% Match
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">★ {project.stars}</span>
                </div>

                <h4 className="text-base font-bold text-white">{project.name}</h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{project.tagline}</p>

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  <div><span className="text-slate-500">Language:</span> <span className="text-slate-200">{project.primaryLanguage}</span></div>
                  <div><span className="text-slate-500">UI Stack:</span> <span className="text-slate-200">{project.uiFramework}</span></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleGenerateBoilerplate(project)}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Generate Code</span>
                </button>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                  title="View GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Boilerplate Generator Output */}
        {(generatedBoilerplate || isGenerating) && (
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Generated Custom Swarm Configuration Boilerplate</span>
              </h4>
              {generatedBoilerplate && (
                <button
                  onClick={copyCode}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Copied to Clipboard!" : "Copy Configuration"}</span>
                </button>
              )}
            </div>

            {isGenerating ? (
              <div className="p-8 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center space-x-2 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Generating tailored swarm architecture boilerplate...</span>
              </div>
            ) : (
              <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-96">
                <code>{generatedBoilerplate}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
