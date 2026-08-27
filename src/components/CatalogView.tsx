import React, { useState, useMemo } from "react";
import { 
  Search, 
  Star, 
  ExternalLink, 
  Check, 
  Copy, 
  Code, 
  Zap, 
  Layers, 
  Cpu, 
  BookOpen, 
  Terminal, 
  Filter,
  PlusCircle,
  CheckCircle2,
  X
} from "lucide-react";
import { SwarmUIProject, UICategory, ArchitecturePattern } from "../types";

interface CatalogViewProps {
  projects: SwarmUIProject[];
  onSelectProject: (project: SwarmUIProject) => void;
  selectedForCompare: string[];
  onToggleCompare: (projectId: string) => void;
  onOpenAdvisorWithProject: (project: SwarmUIProject) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  projects,
  onSelectProject,
  selectedForCompare,
  onToggleCompare,
  onOpenAdvisorWithProject,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedArchitecture, setSelectedArchitecture] = useState<string>("All");
  const [featureFilters, setFeatureFilters] = useState<{
    visualGraph: boolean;
    localModels: boolean;
    dockerSandbox: boolean;
    liveTraces: boolean;
    handoffs: boolean;
  }>({
    visualGraph: false,
    localModels: false,
    dockerSandbox: false,
    liveTraces: false,
    handoffs: false,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalProject, setActiveModalProject] = useState<SwarmUIProject | null>(null);

  const categories: ("All" | UICategory)[] = [
    "All",
    "Node Graph Canvas",
    "Web Copilot & Chat",
    "Workspace & Agent Sandbox",
    "Visual Workflow Platform",
    "Control Plane & Dashboard",
  ];

  const architectures: ("All" | ArchitecturePattern)[] = [
    "All",
    "Hierarchical Supervisor",
    "Peer-to-Peer Handoffs",
    "Sequential Pipeline",
    "Graph DAG / Dynamic Routing",
    "Consensus & Debate",
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search query
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.primaryLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.uiFramework.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keyPros.some((pro) => pro.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory !== "All" && p.category !== selectedCategory) {
        return false;
      }

      // Architecture filter
      if (selectedArchitecture !== "All" && !p.supportedArchitectures.includes(selectedArchitecture as ArchitecturePattern)) {
        return false;
      }

      // Feature filters
      if (featureFilters.visualGraph && !p.features.visualGraphBuilder) return false;
      if (featureFilters.localModels && !p.features.localModelsSupport) return false;
      if (featureFilters.dockerSandbox && !p.features.dockerSandbox) return false;
      if (featureFilters.liveTraces && !p.features.liveTracesVisualizer) return false;
      if (featureFilters.handoffs && !p.features.handoffSupport) return false;

      return true;
    });
  }, [projects, searchQuery, selectedCategory, selectedArchitecture, featureFilters]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Open Source Agent Swarm UI Landscape</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Free & Open-Source UIs for AI Agent Swarms
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            A state-of-the-art research directory comparing visual canvases, web copilots, workspace sandboxes, and orchestration control planes for multi-agent systems.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Open-Source UIs</span>
              <p className="text-xl font-bold text-white mt-0.5">{projects.length} Platforms</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">UI Paradigms</span>
              <p className="text-xl font-bold text-indigo-400 mt-0.5">5 Categories</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Multi-Agent Topologies</span>
              <p className="text-xl font-bold text-cyan-400 mt-0.5">5 Patterns</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Selected for Compare</span>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{selectedForCompare.length} Selected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-swarm-uis"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by framework name, language (Python/TypeScript), paradigm, or feature (e.g. handoffs, Docker)..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-slate-800 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Architecture & Feature Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Swarm Topology:</span>
          <select
            value={selectedArchitecture}
            onChange={(e) => setSelectedArchitecture(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
          >
            {architectures.map((arch) => (
              <option key={arch} value={arch}>{arch}</option>
            ))}
          </select>

          <span className="text-xs text-slate-600 mx-1">|</span>

          {/* Feature Toggles */}
          <button
            onClick={() => setFeatureFilters(prev => ({ ...prev, visualGraph: !prev.visualGraph }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              featureFilters.visualGraph
                ? "bg-indigo-950 border-indigo-500 text-indigo-200"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            🎨 Node Graph Canvas
          </button>

          <button
            onClick={() => setFeatureFilters(prev => ({ ...prev, handoffs: !prev.handoffs }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              featureFilters.handoffs
                ? "bg-indigo-950 border-indigo-500 text-indigo-200"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            🤝 Peer Handoffs
          </button>

          <button
            onClick={() => setFeatureFilters(prev => ({ ...prev, localModels: !prev.localModels }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              featureFilters.localModels
                ? "bg-indigo-950 border-indigo-500 text-indigo-200"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            💻 Local LLM / Ollama
          </button>

          <button
            onClick={() => setFeatureFilters(prev => ({ ...prev, dockerSandbox: !prev.dockerSandbox }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              featureFilters.dockerSandbox
                ? "bg-indigo-950 border-indigo-500 text-indigo-200"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            🐳 Docker Sandbox
          </button>

          <button
            onClick={() => setFeatureFilters(prev => ({ ...prev, liveTraces: !prev.liveTraces }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              featureFilters.liveTraces
                ? "bg-indigo-950 border-indigo-500 text-indigo-200"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
          >
            📊 Live Traces
          </button>
        </div>
      </div>

      {/* Grid of Swarm UI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const isComparing = selectedForCompare.includes(project.id);

          return (
            <div
              key={project.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-indigo-500/5 group"
            >
              <div>
                {/* Top Meta */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-0.5 rounded-full">
                      {project.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 group-hover:text-indigo-300 transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{project.stars}</span>
                  </div>
                </div>

                {/* Tagline & Description */}
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {project.tagline}
                </p>

                {/* Language & UI Stack badges */}
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  <span className="text-[11px] font-medium bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Code className="w-3 h-3 text-cyan-400" />
                    <span>{project.primaryLanguage}</span>
                  </span>
                  <span className="text-[11px] font-medium bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-purple-400" />
                    <span>{project.license}</span>
                  </span>
                  <span className="text-[11px] font-medium bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                    {project.uiFramework}
                  </span>
                </div>

                {/* Key Strengths Chips */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Key Strengths:</span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {project.keyPros.slice(0, 2).map((pro, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scorecard Mini Bars */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Setup Ease</span>
                      <span className="text-white font-medium">{project.scorecard.easeOfSetup}/10</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${project.scorecard.easeOfSetup * 10}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Swarm Depth</span>
                      <span className="text-white font-medium">{project.scorecard.swarmOrchestrationDepth}/10</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${project.scorecard.swarmOrchestrationDepth * 10}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalProject(project)}
                  className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Deep Dive</span>
                </button>

                <button
                  onClick={() => onToggleCompare(project.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center space-x-1 ${
                    isComparing
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                  title={isComparing ? "Remove from comparison" : "Add to comparison"}
                >
                  {isComparing ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>{isComparing ? "Compared" : "Compare"}</span>
                </button>

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors"
                  title="View on GitHub"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive Profile Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-800">
                    {activeModalProject.category}
                  </span>
                  <span className="text-xs text-amber-300 font-semibold flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{activeModalProject.stars} stars</span>
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1.5">{activeModalProject.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activeModalProject.repo}</p>
              </div>
              <button
                onClick={() => setActiveModalProject(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Description */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Overview & Architecture</h4>
              <p className="text-sm text-slate-200 mt-1.5 leading-relaxed">{activeModalProject.description}</p>
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-indigo-300">Architecture Details: </span>
                {activeModalProject.architectureDetails}
              </div>
            </div>

            {/* Supported Multi-Agent Topologies */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Supported Swarm Topologies</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeModalProject.supportedArchitectures.map((arch) => (
                  <span key={arch} className="px-3 py-1 bg-indigo-950/80 border border-indigo-800/60 text-indigo-200 rounded-lg text-xs font-medium flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{arch}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/70 border border-emerald-950/80 p-4 rounded-xl">
                <h5 className="text-xs font-bold uppercase text-emerald-400 mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Advantages</span>
                </h5>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {activeModalProject.keyPros.map((pro, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/70 border border-rose-950/80 p-4 rounded-xl">
                <h5 className="text-xs font-bold uppercase text-rose-400 mb-2 flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-rose-900/60 text-rose-400 flex items-center justify-center text-[10px] font-bold">!</span>
                  <span>Limitations / Considerations</span>
                </h5>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {activeModalProject.keyCons.map((con, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quickstart Command */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Quickstart Installation</span>
                </h4>
                <button
                  onClick={() => copyToClipboard(activeModalProject.quickstart.installCommand, "install")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  {copiedId === "install" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "install" ? "Copied!" : "Copy Command"}</span>
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-emerald-300 font-mono overflow-x-auto">
                <code>{activeModalProject.quickstart.installCommand}</code>
              </pre>
            </div>

            {/* Code Snippet */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>{activeModalProject.codeSnippet.title}</span>
                </h4>
                <button
                  onClick={() => copyToClipboard(activeModalProject.codeSnippet.code, "code")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  {copiedId === "code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === "code" ? "Copied Code!" : "Copy Code"}</span>
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 font-mono overflow-x-auto max-h-60">
                <code>{activeModalProject.codeSnippet.code}</code>
              </pre>
            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <a
                  href={activeModalProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {activeModalProject.docsUrl && (
                  <a
                    href={activeModalProject.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Official Documentation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <button
                onClick={() => {
                  onOpenAdvisorWithProject(activeModalProject);
                  setActiveModalProject(null);
                }}
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask AI Advisor About This UI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
