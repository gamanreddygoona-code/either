import React, { useState } from "react";
import { 
  Check, 
  X, 
  Layers, 
  Download, 
  Sparkles, 
  Plus, 
  Trash2, 
  HelpCircle,
  Code
} from "lucide-react";
import { SwarmUIProject } from "../types";

interface ComparisonMatrixProps {
  projects: SwarmUIProject[];
  selectedProjectIds: string[];
  onToggleCompare: (projectId: string) => void;
  onClearCompare: () => void;
  onSelectPresets: (ids: string[]) => void;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
  projects,
  selectedProjectIds,
  onToggleCompare,
  onClearCompare,
  onSelectPresets,
}) => {
  const [copiedExport, setCopiedExport] = useState(false);

  const selectedProjects = projects.filter((p) => selectedProjectIds.includes(p.id));

  const presets = [
    {
      title: "The Top 3 Swarm Giants",
      ids: ["agency-swarm", "autogen-studio", "langflow"],
    },
    {
      title: "Visual Canvas Showdown",
      ids: ["langflow", "dify", "agentswarms"],
    },
    {
      title: "Code & Sandbox Specialists",
      ids: ["openhands", "autogen-studio", "agency-swarm"],
    },
    {
      title: "TypeScript vs Python Engines",
      ids: ["voltagent", "agency-swarm", "chainlit"],
    },
  ];

  const exportAsMarkdown = () => {
    let md = `# Open Source Agent Swarm UI Comparison Matrix\n\n`;
    md += `| Feature | ${selectedProjects.map((p) => p.name).join(" | ")} |\n`;
    md += `| --- | ${selectedProjects.map(() => "---").join(" | ")} |\n`;
    md += `| **Category** | ${selectedProjects.map((p) => p.category).join(" | ")} |\n`;
    md += `| **Language / Stack** | ${selectedProjects.map((p) => `${p.primaryLanguage} (${p.uiFramework})`).join(" | ")} |\n`;
    md += `| **GitHub Stars** | ${selectedProjects.map((p) => p.stars).join(" | ")} |\n`;
    md += `| **License** | ${selectedProjects.map((p) => p.license).join(" | ")} |\n`;
    md += `| **Visual Node Canvas** | ${selectedProjects.map((p) => p.features.visualGraphBuilder ? "✅ Yes" : "❌ No").join(" | ")} |\n`;
    md += `| **Peer Handoffs** | ${selectedProjects.map((p) => p.features.handoffSupport ? "✅ Yes" : "❌ No").join(" | ")} |\n`;
    md += `| **Local Ollama / vLLM** | ${selectedProjects.map((p) => p.features.localModelsSupport ? "✅ Yes" : "❌ No").join(" | ")} |\n`;
    md += `| **Docker Sandbox** | ${selectedProjects.map((p) => p.features.dockerSandbox ? "✅ Yes" : "❌ No").join(" | ")} |\n`;
    md += `| **Live Trace Visualizer** | ${selectedProjects.map((p) => p.features.liveTracesVisualizer ? "✅ Yes" : "❌ No").join(" | ")} |\n`;
    md += `| **Human In The Loop** | ${selectedProjects.map((p) => p.features.humanInTheLoop ? "✅ Yes" : "❌ No").join(" | ")} |\n`;
    md += `| **Best For** | ${selectedProjects.map((p) => p.bestFor).join(" | ")} |\n`;

    navigator.clipboard.writeText(md);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Preset Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Multi-Agent Swarm UI Comparison Matrix</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select 2 to 4 frameworks to evaluate architecture, features, execution environments, and capabilities.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {selectedProjects.length > 0 && (
              <>
                <button
                  onClick={exportAsMarkdown}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{copiedExport ? "Markdown Copied!" : "Export Markdown"}</span>
                </button>
                <button
                  onClick={onClearCompare}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comparison Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Popular Presets:</span>
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPresets(preset.ids)}
              className="px-2.5 py-1 bg-slate-950 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-700 text-slate-300 hover:text-indigo-200 rounded-lg text-xs font-medium transition-colors"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* When no projects selected */}
      {selectedProjects.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No Swarm UIs Selected For Comparison</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select frameworks from the catalog or click one of the popular comparison presets above to see a deep side-by-side feature matrix.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => onSelectPresets(["agency-swarm", "autogen-studio", "langflow"])}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Compare Top 3 (Agency Swarm vs AutoGen vs Langflow)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Matrix Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="p-4 text-slate-400 font-semibold uppercase tracking-wider w-48 sticky left-0 bg-slate-950 z-10">
                  Feature / Dimension
                </th>
                {selectedProjects.map((project) => (
                  <th key={project.id} className="p-4 text-slate-100 font-bold min-w-[240px] border-l border-slate-800/80">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-indigo-400 uppercase font-semibold">{project.category}</span>
                        <div className="text-base text-white font-bold">{project.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{project.repo}</div>
                      </div>
                      <button
                        onClick={() => onToggleCompare(project.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-md"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {/* Category & Language */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">UI Paradigm</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60 font-medium text-slate-200">
                    {p.category}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Tech Stack / UI Framework</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    <span className="text-cyan-300 font-medium">{p.primaryLanguage}</span>
                    <span className="text-slate-400 block text-[11px] mt-0.5">{p.uiFramework}</span>
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Stars & License</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-300 font-bold">★ {p.stars}</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">{p.license}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Section Header: Multi-Agent Topologies */}
              <tr className="bg-slate-950/80 font-bold text-slate-400">
                <td colSpan={selectedProjects.length + 1} className="p-3 text-[11px] uppercase tracking-wider text-indigo-300">
                  Swarm Topologies & Orchestration Patterns
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Hierarchical Supervisor</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    {p.supportedArchitectures.includes("Hierarchical Supervisor") ? (
                      <span className="inline-flex items-center text-emerald-400 font-medium"><Check className="w-4 h-4 mr-1" /> Supported</span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500"><X className="w-4 h-4 mr-1" /> Partial / Custom</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Peer Handoffs (Swarm Style)</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    {p.features.handoffSupport ? (
                      <span className="inline-flex items-center text-emerald-400 font-medium"><Check className="w-4 h-4 mr-1" /> Native Handoffs</span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500"><X className="w-4 h-4 mr-1" /> Router / Manager Only</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Graph DAG / Dynamic Routing</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    {p.supportedArchitectures.includes("Graph DAG / Dynamic Routing") ? (
                      <span className="inline-flex items-center text-emerald-400 font-medium"><Check className="w-4 h-4 mr-1" /> Visual DAG</span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500"><X className="w-4 h-4 mr-1" /> Code Config</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Section Header: Features & Execution */}
              <tr className="bg-slate-950/80 font-bold text-slate-400">
                <td colSpan={selectedProjects.length + 1} className="p-3 text-[11px] uppercase tracking-wider text-indigo-300">
                  UI Features & Developer Capabilities
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Visual Node Builder</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    {p.features.visualGraphBuilder ? (
                      <span className="text-emerald-400 font-medium flex items-center"><Check className="w-4 h-4 mr-1" /> Drag & Drop Canvas</span>
                    ) : (
                      <span className="text-slate-500 flex items-center"><X className="w-4 h-4 mr-1" /> Chat / Code Only</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Local Models (Ollama / vLLM)</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    {p.features.localModelsSupport ? (
                      <span className="text-emerald-400 font-medium flex items-center"><Check className="w-4 h-4 mr-1" /> 100% Offline Compatible</span>
                    ) : (
                      <span className="text-slate-500 flex items-center"><X className="w-4 h-4 mr-1" /> Cloud Focused</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Docker Sandbox Container</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    {p.features.dockerSandbox ? (
                      <span className="text-emerald-400 font-medium flex items-center"><Check className="w-4 h-4 mr-1" /> Isolated Sandbox</span>
                    ) : (
                      <span className="text-slate-500 flex items-center"><X className="w-4 h-4 mr-1" /> Host Environment</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Live Execution Tracing</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    {p.features.liveTracesVisualizer ? (
                      <span className="text-emerald-400 font-medium flex items-center"><Check className="w-4 h-4 mr-1" /> Real-time Steps & Tokens</span>
                    ) : (
                      <span className="text-slate-500 flex items-center"><X className="w-4 h-4 mr-1" /> Terminal Logs</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Human-In-The-Loop</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    {p.features.humanInTheLoop ? (
                      <span className="text-emerald-400 font-medium flex items-center"><Check className="w-4 h-4 mr-1" /> Approval Prompts</span>
                    ) : (
                      <span className="text-slate-500 flex items-center"><X className="w-4 h-4 mr-1" /> Fully Autonomous</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Best For Summary */}
              <tr className="bg-slate-950/80 font-bold text-slate-400">
                <td colSpan={selectedProjects.length + 1} className="p-3 text-[11px] uppercase tracking-wider text-indigo-300">
                  Architectural Verdict & Recommendation
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Optimal Use Case</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60 text-slate-200 leading-relaxed">
                    {p.bestFor}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-semibold text-slate-300 sticky left-0 bg-slate-900 z-10">Quick Install Command</td>
                {selectedProjects.map((p) => (
                  <td key={p.id} className="p-3.5 border-l border-slate-800/60">
                    <pre className="bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto">
                      <code>{p.quickstart.installCommand}</code>
                    </pre>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
