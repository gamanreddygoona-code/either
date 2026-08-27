import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Bot, 
  Zap, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Eye,
  Sliders,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { AgentSimulationNode, SimulationMessage } from "../types";

export const SwarmSimulator: React.FC = () => {
  const [selectedTopology, setSelectedTopology] = useState<"hierarchical" | "handoff" | "sequential" | "consensus">("hierarchical");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("supervisor");
  const [selectedGoal, setSelectedGoal] = useState("Research best open source UI for multi-agent swarms");

  // Step definitions based on topology
  const topologyScenarios: Record<string, {
    title: string;
    description: string;
    nodes: AgentSimulationNode[];
    steps: {
      activeAgent: string;
      targetAgent?: string;
      thought: string;
      actionText: string;
      message: SimulationMessage;
    }[];
  }> = {
    hierarchical: {
      title: "Hierarchical Supervisor Orchestration",
      description: "A centralized supervisor delegates sub-tasks to specialized worker agents, collects findings, and synthesizes the final output.",
      nodes: [
        {
          id: "supervisor",
          name: "Supervisor Agent",
          role: "Swarm Orchestrator & Planner",
          avatar: "👑",
          systemPrompt: "You are the Lead Coordinator. Break down user goals into subtasks and delegate to Web Researcher and Code Evaluator.",
          status: "idle",
          tools: ["delegate_task", "synthesize_report"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "researcher",
          name: "Web Researcher",
          role: "Information Gathering",
          avatar: "🔍",
          systemPrompt: "Perform grounded web queries to find open-source repositories and stars.",
          status: "idle",
          tools: ["google_search", "github_api"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "evaluator",
          name: "Tech Evaluator",
          role: "Architecture & Code Analyst",
          avatar: "⚙️",
          systemPrompt: "Analyze UI architecture, Docker configs, and local Ollama compatibility.",
          status: "idle",
          tools: ["inspect_repo", "docker_validator"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "critic",
          name: "QA & Critic",
          role: "Fact-Checker & Verifier",
          avatar: "🛡️",
          systemPrompt: "Verify facts, check for hallucinations, and ensure code snippets run cleanly.",
          status: "idle",
          tools: ["verify_sources", "test_runner"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
      ],
      steps: [
        {
          activeAgent: "supervisor",
          targetAgent: "researcher",
          thought: "Deconstructing prompt: Need active GitHub repos for Agency Swarm, AutoGen Studio, and Langflow.",
          actionText: "Delegating task #1 (Repo Discovery) to Web Researcher",
          message: {
            id: "msg-1",
            from: "Supervisor Agent",
            to: "Web Researcher",
            type: "task_delegation",
            content: "Find the top 5 open-source swarm UIs and their star counts.",
            timestamp: "00:01",
            status: "delivered",
          },
        },
        {
          activeAgent: "researcher",
          targetAgent: "supervisor",
          thought: "Querying GitHub API and documentation hubs. Discovered Agency Swarm (8.4k stars), AutoGen Studio (36k stars), Langflow (45k stars).",
          actionText: "Returning verified repository facts to Supervisor",
          message: {
            id: "msg-2",
            from: "Web Researcher",
            to: "Supervisor Agent",
            type: "final_answer",
            content: "Discovered 5 platforms: Langflow, Dify, AutoGen Studio, Agency Swarm, OpenHands.",
            timestamp: "00:03",
            status: "delivered",
          },
        },
        {
          activeAgent: "supervisor",
          targetAgent: "evaluator",
          thought: "Now need technical evaluation on Docker sandbox and local LLM support.",
          actionText: "Delegating task #2 (Architecture Audit) to Tech Evaluator",
          message: {
            id: "msg-3",
            from: "Supervisor Agent",
            to: "Tech Evaluator",
            type: "task_delegation",
            content: "Evaluate Docker container security and Ollama integration for each framework.",
            timestamp: "00:05",
            status: "delivered",
          },
        },
        {
          activeAgent: "evaluator",
          targetAgent: "critic",
          thought: "Benchmarked OpenHands with isolated Docker containers; Langflow has native Ollama nodes; Agency Swarm uses LiteLLM.",
          actionText: "Forwarding architectural assessment to QA Critic for validation",
          message: {
            id: "msg-4",
            from: "Tech Evaluator",
            to: "QA & Critic",
            type: "handoff",
            content: "Docker sandbox validated on OpenHands and Dify; Local Ollama verified on Langflow/AutoGen.",
            timestamp: "00:07",
            status: "delivered",
          },
        },
        {
          activeAgent: "critic",
          targetAgent: "supervisor",
          thought: "All citations verified against official documentation. No conflicting licenses detected.",
          actionText: "Approved findings. Delivering green light to Supervisor.",
          message: {
            id: "msg-5",
            from: "QA & Critic",
            to: "Supervisor Agent",
            type: "human_approval",
            content: "Technical review passed with 100% test integrity. Ready for final synthesis.",
            timestamp: "00:09",
            status: "delivered",
          },
        },
        {
          activeAgent: "supervisor",
          thought: "Synthesizing comprehensive research report with interactive comparison matrix and Docker boilerplates.",
          actionText: "Final research synthesis complete. Outputting report to user.",
          message: {
            id: "msg-6",
            from: "Supervisor Agent",
            to: "User Client",
            type: "final_answer",
            content: "Generated full Swarm UI directory, comparison matrix, and quickstart commands.",
            timestamp: "00:11",
            status: "delivered",
          },
        },
      ],
    },
    handoff: {
      title: "Peer-to-Peer Handoff Swarm (OpenAI Swarm / Agency Swarm)",
      description: "Agents dynamically transfer execution control via specialized handoff functions without a rigid central bottleneck.",
      nodes: [
        {
          id: "triage",
          name: "Triage Agent",
          role: "Intent Classifier & Dispatcher",
          avatar: "🎯",
          systemPrompt: "Determine user request type and execute handoff to Architecture Agent or Docker Agent.",
          status: "idle",
          tools: ["transfer_to_architect", "transfer_to_docker_agent"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "architect",
          name: "Swarm Architect",
          role: "Framework Recommender",
          avatar: "📐",
          systemPrompt: "Recommend best UI framework based on requirements.",
          status: "idle",
          tools: ["compare_paradigms", "transfer_to_dev"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "dev_agent",
          name: "Full-Stack Dev",
          role: "Boilerplate Generator",
          avatar: "💻",
          systemPrompt: "Generate runnable Python & TypeScript swarm code snippets.",
          status: "idle",
          tools: ["generate_python_agency", "generate_langflow_json"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
      ],
      steps: [
        {
          activeAgent: "triage",
          targetAgent: "architect",
          thought: "User wants to explore open-source Swarm UIs. Invoking `transfer_to_architect()` tool.",
          actionText: "Calling tool: transfer_to_architect()",
          message: {
            id: "msg-h1",
            from: "Triage Agent",
            to: "Swarm Architect",
            type: "handoff",
            content: "Context handed off: User exploring open-source multi-agent swarm UIs.",
            timestamp: "00:01",
            status: "delivered",
          },
        },
        {
          activeAgent: "architect",
          targetAgent: "dev_agent",
          thought: "Evaluating requirements: User benefits from Agency Swarm for code-first or Langflow for visual drag-and-drop. Handoff to Full-Stack Dev for boilerplate.",
          actionText: "Calling tool: transfer_to_dev()",
          message: {
            id: "msg-h2",
            from: "Swarm Architect",
            to: "Full-Stack Dev",
            type: "handoff",
            content: "Handing off: Generate Agency Swarm copilot boilerplate code.",
            timestamp: "00:03",
            status: "delivered",
          },
        },
        {
          activeAgent: "dev_agent",
          thought: "Generating agency_swarm.py with Agency, Agent, and copilot_demo() launch code.",
          actionText: "Delivering complete code boilerplate directly to user session.",
          message: {
            id: "msg-h3",
            from: "Full-Stack Dev",
            to: "User Session",
            type: "final_answer",
            content: "Provided executable Agency Swarm script with instant web copilot UI.",
            timestamp: "00:05",
            status: "delivered",
          },
        },
      ],
    },
    sequential: {
      title: "Sequential Assembly Line (CrewAI Style Pipeline)",
      description: "Agents execute strictly sequential tasks where the structured output of step N becomes the input of step N+1.",
      nodes: [
        {
          id: "extractor",
          name: "Data Extractor",
          role: "Raw Source Ingestion",
          avatar: "📥",
          systemPrompt: "Parse GitHub READMEs and repository metadata.",
          status: "idle",
          tools: ["web_scraper"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "transformer",
          name: "Matrix Formatter",
          role: "Data Normalization",
          avatar: "🔄",
          systemPrompt: "Normalize features into uniform JSON schema.",
          status: "idle",
          tools: ["json_formatter"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "reporter",
          name: "Executive Writer",
          role: "Report Generation",
          avatar: "📝",
          systemPrompt: "Create executive comparison tables and developer recommendations.",
          status: "idle",
          tools: ["markdown_writer"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
      ],
      steps: [
        {
          activeAgent: "extractor",
          targetAgent: "transformer",
          thought: "Scraped features for 10 open-source Swarm UIs.",
          actionText: "Passing raw text payload to Matrix Formatter",
          message: {
            id: "msg-s1",
            from: "Data Extractor",
            to: "Matrix Formatter",
            type: "task_delegation",
            content: "Raw feature dumps for Agency Swarm, AutoGen Studio, Langflow, Dify, OpenHands.",
            timestamp: "00:02",
            status: "delivered",
          },
        },
        {
          activeAgent: "transformer",
          targetAgent: "reporter",
          thought: "Normalized 10 feature flags across each project.",
          actionText: "Streaming JSON schema to Executive Writer",
          message: {
            id: "msg-s2",
            from: "Matrix Formatter",
            to: "Executive Writer",
            type: "task_delegation",
            content: "Structured matrix schema ready for final document compilation.",
            timestamp: "00:04",
            status: "delivered",
          },
        },
        {
          activeAgent: "reporter",
          thought: "Compiling executive summary and comparison radar.",
          actionText: "Finished final documentation pipeline.",
          message: {
            id: "msg-s3",
            from: "Executive Writer",
            to: "User",
            type: "final_answer",
            content: "Published complete multi-agent Swarm UI benchmark.",
            timestamp: "00:06",
            status: "delivered",
          },
        },
      ],
    },
    consensus: {
      title: "Consensus & Multi-Agent Debate Arena",
      description: "Independent agents analyze trade-offs and debate before a consensus moderator synthesizes the optimal decision.",
      nodes: [
        {
          id: "pro_code",
          name: "Pro-Code Agent",
          role: "Code-First Advocate",
          avatar: "⚡",
          systemPrompt: "Advocate for code-first swarm frameworks like Agency Swarm and CrewAI for testability and git versioning.",
          status: "idle",
          tools: ["code_analyzer"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "pro_visual",
          name: "Pro-Visual Agent",
          role: "Canvas & Low-Code Advocate",
          avatar: "🎨",
          systemPrompt: "Advocate for drag-and-drop node graph UIs like Langflow and Dify for accessibility and live tracing.",
          status: "idle",
          tools: ["visual_analyzer"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
        {
          id: "moderator",
          name: "Swarm Arbiter",
          role: "Consensus Moderator",
          avatar: "⚖️",
          systemPrompt: "Weigh arguments and produce balanced hybrid recommendation.",
          status: "idle",
          tools: ["consensus_builder"],
          metrics: { tokensProcessed: 0, callsCount: 0 },
        },
      ],
      steps: [
        {
          activeAgent: "pro_code",
          targetAgent: "moderator",
          thought: "Arguing that code-first (Agency Swarm) allows direct CI/CD testing, custom Python tools, and deterministic typing.",
          actionText: "Submitting Code-First Manifesto to Moderator",
          message: {
            id: "msg-c1",
            from: "Pro-Code Agent",
            to: "Swarm Arbiter",
            type: "tool_call",
            content: "Code-first allows proper IDE autocompletion and git branch reviews.",
            timestamp: "00:02",
            status: "delivered",
          },
        },
        {
          activeAgent: "pro_visual",
          targetAgent: "moderator",
          thought: "Arguing that visual DAG canvases (Langflow) enable non-technical domain experts to inspect token flows and debug loops live.",
          actionText: "Submitting Visual Canvas Benefits to Moderator",
          message: {
            id: "msg-c2",
            from: "Pro-Visual Agent",
            to: "Swarm Arbiter",
            type: "tool_call",
            content: "Visual canvases democratize swarm topology debugging and live packet inspection.",
            timestamp: "00:04",
            status: "delivered",
          },
        },
        {
          activeAgent: "moderator",
          thought: "Synthesizing consensus: Use Langflow/Dify for visual team prototyping and export Python code to Agency Swarm/CrewAI for production microservices.",
          actionText: "Consensus Reached: Hybrid Visual-to-Code Workflow recommended.",
          message: {
            id: "msg-c3",
            from: "Swarm Arbiter",
            to: "User Decision Engine",
            type: "final_answer",
            content: "Optimal strategy: Prototype topologies in Langflow canvas, deploy core agents via Agency Swarm Python.",
            timestamp: "00:06",
            status: "delivered",
          },
        },
      ],
    },
  };

  const currentScenario = topologyScenarios[selectedTopology];
  const currentStep = currentScenario.steps[currentStepIndex] || null;

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStepIndex < currentScenario.steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 2500 / speed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, currentScenario, speed]);

  const handleTopologyChange = (top: "hierarchical" | "handoff" | "sequential" | "consensus") => {
    setSelectedTopology(top);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setSelectedNodeId(topologyScenarios[top].nodes[0]?.id || null);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleStepForward = () => {
    if (currentStepIndex < currentScenario.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Active message history up to current step
  const activeMessages = currentScenario.steps.slice(0, currentStepIndex + 1).map((s) => s.message);

  const selectedNode = currentScenario.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Play className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Interactive Agent Swarm Topology Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Visualize how different Swarm UI architectures handle message passing, handoffs, supervisor delegation, and execution traces in real time.
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                isPlaying ? "bg-amber-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "Pause" : "Simulate Swarm"}</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={currentStepIndex >= currentScenario.steps.length - 1}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs transition-colors"
              title="Step Forward"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1"></div>

            <div className="flex items-center space-x-1 text-xs text-slate-400 px-1">
              <span>Speed:</span>
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    speed === s ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Topology Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 mr-1">Select Swarm Topology:</span>
          {[
            { id: "hierarchical", label: "Hierarchical Supervisor (Langflow/Dify)", icon: "👑" },
            { id: "handoff", label: "Peer Handoff Swarm (Agency Swarm/OpenAI)", icon: "🤝" },
            { id: "sequential", label: "Sequential Pipeline (CrewAI)", icon: "🔄" },
            { id: "consensus", label: "Consensus & Debate Arena (AutoGen)", icon: "⚖️" },
          ].map((top) => (
            <button
              key={top.id}
              onClick={() => handleTopologyChange(top.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-all ${
                selectedTopology === top.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{top.icon}</span>
              <span>{top.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulation Viewport & Event Trace Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Swarm Stage (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative min-h-[460px] overflow-hidden">
          {/* Top Stage Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                {currentScenario.title}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">{currentScenario.description}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Simulation Step</span>
              <div className="text-sm font-bold text-white">
                {currentStepIndex + 1} / {currentScenario.steps.length}
              </div>
            </div>
          </div>

          {/* Active Step Banner */}
          {currentStep && (
            <div className="my-3 p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-indigo-300">Active Action:</span>
                <span className="text-slate-200">{currentStep.actionText}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-900 text-indigo-400 rounded-md border border-indigo-900">
                {currentStep.message.type}
              </span>
            </div>
          )}

          {/* Nodes Visual Layout */}
          <div className="flex-1 flex flex-wrap items-center justify-around gap-6 py-6 relative">
            {currentScenario.nodes.map((node) => {
              const isActive = currentStep?.activeAgent === node.id;
              const isTarget = currentStep?.targetAgent === node.id;
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`cursor-pointer transition-all duration-300 relative p-4 rounded-2xl border flex flex-col items-center text-center w-44 ${
                    isActive
                      ? "bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 border-indigo-400 shadow-xl shadow-indigo-500/20 scale-105"
                      : isTarget
                      ? "bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-500/10 scale-100"
                      : isSelected
                      ? "bg-slate-900 border-slate-600 shadow-md"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700 opacity-90"
                  }`}
                >
                  {/* Active Pulse Animation Badge */}
                  {isActive && (
                    <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider animate-bounce shadow-md">
                      Executing
                    </span>
                  )}

                  {/* Avatar & Role */}
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner mb-2">
                    {node.avatar}
                  </div>

                  <h4 className="text-xs font-bold text-white">{node.name}</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5">{node.role}</span>

                  {/* Tool chips */}
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {node.tools.map((t) => (
                      <span key={t} className="text-[9px] bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Thought Bubble if Active */}
                  {isActive && currentStep?.thought && (
                    <div className="mt-3 p-2 bg-indigo-900/60 border border-indigo-700/70 rounded-lg text-[10px] text-indigo-100 text-left w-full leading-tight animate-fadeIn">
                      <span className="font-bold text-amber-300 block mb-0.5">💭 Agent Thought:</span>
                      {currentStep.thought}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive Agent Inspector Bar */}
          {selectedNode && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-950 p-3 rounded-xl">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base">{selectedNode.avatar}</span>
                  <span className="font-bold text-white">{selectedNode.name}</span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                    {selectedNode.role}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1 line-clamp-1">{selectedNode.systemPrompt}</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[11px] text-slate-400">Assigned Tools:</span>
                <span className="font-mono text-cyan-300 text-[11px]">{selectedNode.tools.join(", ")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Event Log & Trace Rail (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between max-h-[540px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Swarm Event Log</span>
              </h3>
              <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-full border border-slate-800">
                {activeMessages.length} Events
              </span>
            </div>

            {/* Message Stream */}
            <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
              {activeMessages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center space-x-1 font-semibold text-slate-300">
                      <span className="text-indigo-400">{msg.from}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span className="text-cyan-400">{msg.to}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>

                  <p className="text-slate-200 text-[11px] leading-relaxed">{msg.content}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                    <span className="text-slate-500 uppercase font-mono">{msg.type}</span>
                    <span className="text-emerald-400 flex items-center space-x-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{msg.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
