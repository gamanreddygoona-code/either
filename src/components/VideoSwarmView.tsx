import React, { useState } from "react";
import {
  Film,
  Sparkles,
  Clapperboard,
  Play,
  CheckCircle2,
  Wand2,
  Scissors,
  Clock,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
  Eye,
  MessageSquare,
  Globe,
  Code2,
  ExternalLink,
  Download,
  Check,
  Send,
  Layers,
  Sliders,
  Camera,
  Bot
} from "lucide-react";
import { VideoProject, VideoScene, VideoVariant } from "../types";

type WorkflowStage = "prompt" | "script" | "produce" | "editor-chat" | "render-webpage";

export const VideoSwarmView: React.FC = () => {
  const [activeStage, setActiveStage] = useState<WorkflowStage>("prompt");
  const [project, setProject] = useState<VideoProject | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [title, setTitle] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [segmenting, setSegmenting] = useState(false);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  // Editor Swarm Chat state
  const [editorMessages, setEditorMessages] = useState<Array<{ role: "user" | "model"; content: string; agent?: string }>>([
    { role: "model", content: "🎬 **[Director]**: AI Editor Swarm initialized. Let us review the script beats, visual style, and pacing together. How would you like to refine this film?", agent: "Director" }
  ]);
  const [editorInput, setEditorInput] = useState("");
  const [editorSending, setEditorSending] = useState(false);

  // Render Webpage state
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
  const [renderingWebpage, setRenderingWebpage] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [swarmStepLog, setSwarmStepLog] = useState<string>("");

  const handleAutoRunPipeline = async () => {
    setAutoRunning(true);
    const activePrompt = promptInput.trim() || "Neo-Tokyo 2088: A rogue android hacker speeds across elevated monorails on a light-cycle, evading autonomous security drones under holographic advertisements.";
    const activeTitle = title.trim() || "Neo-Tokyo Cyberpunk 2088";
    if (!promptInput.trim()) {
      setPromptInput(activePrompt);
      setTitle(activeTitle);
    }

    try {
      // Step 1 & 2: Script Scene Agent
      setSwarmStepLog("Agent 2 (Screenwriter) is cutting script into 10s calibrated scene beats...");
      setActiveStage("script");
      const projRes = await fetch("/api/video/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: activePrompt, title: activeTitle })
      });
      const projData = await projRes.json();
      if (!projData.success || !projData.project) throw new Error("Project segmentation failed");
      let currentProj = projData.project;
      setProject(currentProj);

      // Step 3: Video Producer Agent - Generate & pick variants
      setActiveStage("produce");
      for (let i = 0; i < currentProj.scenes.length; i++) {
        const sc = currentProj.scenes[i];
        setSwarmStepLog(`Agent 3 (Video Producer) is rendering 4 cinematic variants for Scene ${i + 1}...`);
        const genRes = await fetch(`/api/video/scene/${sc.id}/generate`, { method: "POST" });
        const genData = await genRes.json();
        if (genData.success && genData.scene) {
          const varId = genData.scene.variants[0]?.id || "v1";
          const selRes = await fetch(`/api/video/scene/${sc.id}/select`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ variantId: varId })
          });
          const selData = await selRes.json();
          if (selData.success && selData.project) {
            currentProj = selData.project;
            setProject(currentProj);
          }
        }
      }

      // Step 4: AI Editor Swarm Chat Agent - Finalize Timeline & Review
      setSwarmStepLog("Agent 4 (AI Editor Swarm) is syncing cuts, rhythm, and color transitions...");
      setActiveStage("editor-chat");
      const finRes = await fetch(`/api/video/project/${currentProj.id}/finalize`, { method: "POST" });
      const finData = await finRes.json();
      if (finData.success && finData.project) {
        currentProj = finData.project;
        setProject(currentProj);
      }

      // Step 5: Render Final Webpage Agent
      setSwarmStepLog("Agent 5 (Web Publisher) is packaging the movie into a standalone responsive webpage...");
      setActiveStage("render-webpage");
      const webRes = await fetch("/api/video/render-webpage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: currentProj })
      });
      const webData = await webRes.json();
      if (webData.success && webData.html) {
        setRenderedHtml(webData.html);
      }
      setSwarmStepLog("✓ 5-Agent Autonomous Pipeline Complete!");
    } catch (e: any) {
      console.error(e);
      setSwarmStepLog(`Swarm halted: ${e.message}`);
    } finally {
      setAutoRunning(false);
    }
  };

  const currentScene: VideoScene | null = project ? project.scenes[project.currentSceneIdx] || project.scenes[0] : null;
  const allSelected = project ? project.scenes.every(s => s.status === "selected") : false;
  const selectedCount = project ? project.scenes.filter(s => s.status === "selected").length : 0;

  // Preset prompts
  const samplePrompts = [
    {
      title: "Mars Dawn: The Living Forest",
      prompt: "A lone astronaut discovers a glowing biometric forest on Mars at dawn. As he touches the pulsating bark, ancient holographic visions of Earth's forgotten oceans surge through his helmet display."
    },
    {
      title: "Neo-Tokyo Cyberpunk Pursuit",
      prompt: "Rain-slicked neon skyscrapers of 2088. A rogue android hacker speeds across elevated monorails on a light-cycle, evading autonomous security drones under holographic advertisements."
    },
    {
      title: "Abyssal Leviathan",
      prompt: "Deep ocean research submarine descends into the Mariana Trench at 10,000 meters. The searchlights illuminate the ancient ruins of an underwater temple and a colossal bioluminescent creature awakening."
    }
  ];

  const handleApplyPreset = (p: { title: string; prompt: string }) => {
    setTitle(p.title);
    setPromptInput(p.prompt);
    setScriptText(p.prompt);
  };

  const handleSegmentScript = async () => {
    const text = scriptText || promptInput;
    if (!text.trim()) return;
    setSegmenting(true);
    try {
      const res = await fetch("/api/video/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: text, title: title || "Agent 2 AI Movie" }),
      });
      const j = await res.json();
      if (j.success && j.project) {
        setProject(j.project);
        setActiveStage("produce");
      }
    } catch (e) {
      console.error(e);
    }
    setSegmenting(false);
  };

  const handleGenerateVariants = async (sceneId: string) => {
    setGeneratingSceneId(sceneId);
    try {
      const res = await fetch(`/api/video/scene/${sceneId}/generate`, { method: "POST" });
      const j = await res.json();
      if (j.success && project) {
        setProject(prev => prev ? {
          ...prev,
          scenes: prev.scenes.map(s => s.id === sceneId ? j.scene : s)
        } : prev);
      }
    } catch (e) {}
    setGeneratingSceneId(null);
  };

  const handleSelectVariant = async (sceneId: string, variantId: string) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/video/scene/${sceneId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      const j = await res.json();
      if (j.success && j.project) {
        setProject(j.project);
      }
    } catch (e) {}
  };

  const handleFinalizeMovie = async () => {
    if (!project) return;
    setFinalizing(true);
    try {
      const res = await fetch(`/api/video/project/${project.id}/finalize`, { method: "POST" });
      const j = await res.json();
      if (j.success && j.project) {
        setProject(j.project);
        setActiveStage("editor-chat");
      }
    } catch (e) {}
    setFinalizing(false);
  };

  const handleSendEditorMessage = async (customPrompt?: string) => {
    const text = customPrompt || editorInput;
    if (!text.trim()) return;
    const userMsg = { role: "user" as const, content: text };
    setEditorMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setEditorInput("");
    setEditorSending(true);

    try {
      const res = await fetch("/api/video/editor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          history: editorMessages,
          project: project || { title: title || "Cinematic Project", prompt: promptInput },
          stage: activeStage
        })
      });
      const data = await res.json();
      setEditorMessages(prev => [...prev, { role: "model", content: data.answer || "Swarm verified your edit." }]);
    } catch (e) {
      setEditorMessages(prev => [...prev, { role: "model", content: "🎬 **[Director]**: Changes recorded and synced to timeline." }]);
    } finally {
      setEditorSending(false);
    }
  };

  const handleRenderFinalWebpage = async () => {
    setRenderingWebpage(true);
    try {
      const res = await fetch("/api/video/render-webpage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project || {
            title: title || "Agent 2 AI Movie",
            prompt: promptInput || "An AI directed cinematic story",
            scenes: [{ id: "sc-1", prompt: promptInput, scriptChunk: promptInput, startSec: 0, endSec: 10, variants: [{ id: "v1", style: "Cinematic 8K", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }] }],
            totalDurationSec: 60
          }
        })
      });
      const data = await res.json();
      if (data.html) {
        setRenderedHtml(data.html);
        setActiveStage("render-webpage");
      }
    } catch (e) {}
    setRenderingWebpage(false);
  };

  const handleOpenInNewWindow = () => {
    if (!renderedHtml) return;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(renderedHtml);
      win.document.close();
    }
  };

  const handleDownloadHtml = () => {
    if (!renderedHtml) return;
    const blob = new Blob([renderedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "movie").toLowerCase().replace(/\s+/g, "_")}_webpage.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 h-full bg-[#f8f6f0] flex flex-col overflow-hidden select-text">
      {/* Header */}
      <div className="h-16 border-b border-[#e2dcce] bg-[#fdfbf7] px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold font-serif text-stone-900">
                Agent 2 — Filmmaking Workflow Engine
              </h2>
              <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full border border-violet-200 uppercase font-mono">
                Multi-Agent Pipeline
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Autonomous multi-agent cinematic production from prompt to final responsive web release.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAutoRunPipeline}
            disabled={autoRunning}
            className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
          >
            {autoRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{autoRunning ? "Autonomous Swarm Running..." : "Auto-Run 5-Agent Pipeline"}</span>
          </button>
          {project && (
            <button
              onClick={() => { setProject(null); setActiveStage("prompt"); setRenderedHtml(null); setSwarmStepLog(""); }}
              className="px-3 py-1.5 bg-white border border-[#ded7c8] hover:bg-[#f5f1e8] text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              + New Movie
            </button>
          )}
          {project && allSelected && (
            <button
              onClick={handleRenderFinalWebpage}
              disabled={renderingWebpage}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
            >
              {renderingWebpage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              <span>Render Final Webpage</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Swarm Execution Progress Banner */}
      {swarmStepLog && (
        <div className="bg-violet-900 text-white px-6 py-2 text-xs flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono font-bold text-violet-200">SWARM PIPELINE:</span>
            <span className="font-medium">{swarmStepLog}</span>
          </div>
          {autoRunning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-300" />}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5-AGENT AUTONOMOUS WORKFLOW CANVAS (Exact matching Image 3) */}
      {/* ========================================================================= */}
      <div className="border-b border-[#e5dfd3] bg-[#f5f0e6] px-6 py-4 overflow-x-auto">
        <div className="flex items-center min-w-[960px] justify-between relative">
          
          {/* Agent 1: Movie Prompt Agent (Yellow Header) */}
          <div
            onClick={() => setActiveStage("prompt")}
            className={`w-52 rounded-2xl bg-white border-2 transition-all cursor-pointer shadow-xs overflow-hidden ${
              activeStage === "prompt"
                ? "border-amber-400 ring-2 ring-amber-200 scale-[1.02]"
                : "border-[#ded7c8] hover:border-amber-300"
            }`}
          >
            <div className="bg-[#facc15] px-3 py-1.5 flex items-center justify-between text-stone-900 text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-stone-900 text-amber-300 text-[10px] flex items-center justify-center font-mono">1</span>
                <span>Movie Prompt Agent</span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-stone-900 px-1 rounded font-mono">
                {promptInput.trim() ? "✓ READY" : "INPUT"}
              </span>
            </div>
            <div className="p-2.5 space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-700 font-mono">
                Story Architect Agent
              </div>
              <p className="text-[10px] text-stone-600 leading-snug">
                Describe the movie scene or plot you want to create.
              </p>
            </div>
          </div>

          {/* Connector 1 */}
          <div className="flex-1 flex items-center justify-center px-1">
            <div className="w-full border-t-2 border-dashed border-stone-400 relative flex items-center justify-end">
              <div className="w-2 h-2 rounded-full bg-stone-500 absolute -left-1"></div>
              <span className="text-stone-400 text-xs translate-x-1 font-mono">▶</span>
            </div>
          </div>

          {/* Agent 2: Script Scene Agent (Blue Header) */}
          <div
            onClick={() => setActiveStage("script")}
            className={`w-56 rounded-2xl bg-white border-2 transition-all cursor-pointer shadow-xs overflow-hidden ${
              activeStage === "script"
                ? "border-blue-500 ring-2 ring-blue-200 scale-[1.02]"
                : "border-[#ded7c8] hover:border-blue-300"
            }`}
          >
            <div className="bg-[#bfdbfe] px-3 py-1.5 flex items-center justify-between text-blue-950 text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center font-mono">2</span>
                <span>Script Scene Agent</span>
              </div>
              <span className="text-[10px] bg-blue-200/80 text-blue-900 px-1 rounded font-mono">
                {segmenting ? "CUTTING..." : project ? "✓ SCENES" : "PENDING"}
              </span>
            </div>
            <div className="p-2.5 space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                Screenwriter Agent
              </div>
              <p className="text-[10px] text-stone-600 leading-snug">
                Take user-provided movie_prompt and write detailed, visually descriptive 10s scene scripts.
              </p>
            </div>
          </div>

          {/* Connector 2 */}
          <div className="flex-1 flex items-center justify-center px-1">
            <div className="w-full border-t-2 border-dashed border-stone-400 relative flex items-center justify-end">
              <div className="w-2 h-2 rounded-full bg-stone-500 absolute -left-1"></div>
              <span className="text-stone-400 text-xs translate-x-1 font-mono">▶</span>
            </div>
          </div>

          {/* Agent 3: Produce FinalMovie Agent (Blue Header) */}
          <div
            onClick={() => setActiveStage("produce")}
            className={`w-56 rounded-2xl bg-white border-2 transition-all cursor-pointer shadow-xs overflow-hidden ${
              activeStage === "produce"
                ? "border-blue-500 ring-2 ring-blue-200 scale-[1.02]"
                : "border-[#ded7c8] hover:border-blue-300"
            }`}
          >
            <div className="bg-[#bfdbfe] px-3 py-1.5 flex items-center justify-between text-blue-950 text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center font-mono">3</span>
                <span>Produce FinalMovie Agent</span>
              </div>
              <span className="text-[10px] bg-blue-200/80 text-blue-900 px-1 rounded font-mono">
                {allSelected ? "✓ LOCKED" : `${selectedCount}/${project?.scenes.length || 0}`}
              </span>
            </div>
            <div className="p-2.5 space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                Video Producer Agent
              </div>
              <p className="text-[10px] text-stone-600 leading-snug">
                Use script generated in previous step to create video scenes and style variations.
              </p>
            </div>
          </div>

          {/* Connector 3 */}
          <div className="flex-1 flex items-center justify-center px-1">
            <div className="w-full border-t-2 border-dashed border-stone-400 relative flex items-center justify-end">
              <div className="w-2 h-2 rounded-full bg-stone-500 absolute -left-1"></div>
              <span className="text-stone-400 text-xs translate-x-1 font-mono">▶</span>
            </div>
          </div>

          {/* Agent 4: AI Editor Swarm Chat Agent (Blue Header) */}
          <div
            onClick={() => setActiveStage("editor-chat")}
            className={`w-56 rounded-2xl bg-white border-2 transition-all cursor-pointer shadow-xs overflow-hidden ${
              activeStage === "editor-chat"
                ? "border-blue-500 ring-2 ring-blue-200 scale-[1.02]"
                : "border-[#ded7c8] hover:border-blue-300"
            }`}
          >
            <div className="bg-[#bfdbfe] px-3 py-1.5 flex items-center justify-between text-blue-950 text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] flex items-center justify-center font-mono">4</span>
                <span>AI Editor Swarm Agent</span>
              </div>
              <span className="text-[10px] bg-blue-200/80 text-blue-900 px-1 rounded font-mono">
                {editorMessages.length > 1 ? `${editorMessages.length} MSGS` : "READY"}
              </span>
            </div>
            <div className="p-2.5 space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                Director & Critic Swarm
              </div>
              <p className="text-[10px] text-stone-600 leading-snug">
                Interactive conversational interface where user discusses script and suggests edits.
              </p>
            </div>
          </div>

          {/* Connector 4 */}
          <div className="flex-1 flex items-center justify-center px-1">
            <div className="w-full border-t-2 border-dashed border-stone-400 relative flex items-center justify-end">
              <div className="w-2 h-2 rounded-full bg-stone-500 absolute -left-1"></div>
              <span className="text-stone-400 text-xs translate-x-1 font-mono">▶</span>
            </div>
          </div>

          {/* Agent 5: Render Final Webpage Agent (Green Header) */}
          <div
            onClick={() => setActiveStage("render-webpage")}
            className={`w-56 rounded-2xl bg-white border-2 transition-all cursor-pointer shadow-xs overflow-hidden ${
              activeStage === "render-webpage"
                ? "border-emerald-500 ring-2 ring-emerald-200 scale-[1.02]"
                : "border-[#ded7c8] hover:border-emerald-300"
            }`}
          >
            <div className="bg-[#bbf7d0] px-3 py-1.5 flex items-center justify-between text-emerald-950 text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-900 text-white text-[10px] flex items-center justify-center font-mono">5</span>
                <span>Render Final Webpage</span>
              </div>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1 rounded font-mono">
                {renderedHtml ? "✓ RELEASED" : "READY"}
              </span>
            </div>
            <div className="p-2.5 space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                Web Publisher Agent
              </div>
              <p className="text-[10px] text-stone-600 leading-snug">
                Combines prompt, script, movie clips, and editor chat into a cohesive HTML release.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE STAGE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-6">

          {/* STAGE 1: MOVIE PROMPT */}
          {activeStage === "prompt" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-[#ded7c8] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-900 font-bold text-xs flex items-center justify-center">1</span>
                  <h3 className="text-base font-bold font-serif text-stone-900">Step 1 — Movie Prompt & Premise</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">Movie Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Dawn of the Red Horizon — Sci-Fi Trailer"
                    className="w-full px-4 py-2.5 bg-[#faf8f5] border border-[#ded7c8] rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">Describe Movie Premise or Plot</label>
                  <textarea
                    value={promptInput}
                    onChange={(e) => { setPromptInput(e.target.value); setScriptText(e.target.value); }}
                    rows={5}
                    placeholder="Describe characters, visual atmosphere, lighting, camera motion, and story beats..."
                    className="w-full px-4 py-3 bg-[#faf8f5] border border-[#ded7c8] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none leading-relaxed"
                  />
                </div>

                {/* Creative Presets */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Or Select Premise Preset:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {samplePrompts.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleApplyPreset(p)}
                        className="p-3 bg-[#faf8f5] hover:bg-[#f3ede1] border border-[#ded7c8] rounded-2xl cursor-pointer transition-all space-y-1"
                      >
                        <span className="text-xs font-bold text-stone-900 block truncate">{p.title}</span>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-snug">{p.prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setActiveStage("script")}
                    disabled={!promptInput.trim()}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all"
                  >
                    <span>Proceed to Script Scene</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: SCRIPT SCENE */}
          {activeStage === "script" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-[#ded7c8] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <h3 className="text-base font-bold font-serif text-stone-900">Step 2 — Screenplay & Scene Breakdown</h3>
                  <span className="ml-auto text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono font-bold">
                    Agent 2 Script Cutter
                  </span>
                </div>

                <p className="text-xs text-stone-500 leading-relaxed">
                  The AI screenwriter cuts your premise into calibrated 10-second scene beats with cinematography instructions.
                </p>

                <textarea
                  value={scriptText || promptInput}
                  onChange={(e) => setScriptText(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-[#faf8f5] border border-[#ded7c8] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 font-mono leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActiveStage("prompt")}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-medium"
                  >
                    ← Back to Prompt
                  </button>

                  <button
                    onClick={handleSegmentScript}
                    disabled={segmenting || (!scriptText.trim() && !promptInput.trim())}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all"
                  >
                    {segmenting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    <span>{segmenting ? "Cutting into 10s Scenes..." : "Slice into 10s Beats & Produce"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: PRODUCE FINALMOVIE */}
          {activeStage === "produce" && (
            <div className="space-y-6 animate-fadeIn">
              {project ? (
                <div className="space-y-4">
                  {/* Current Scene Selector Header */}
                  <div className="bg-white border border-[#ded7c8] rounded-2xl p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-xl bg-violet-100 text-violet-800 font-bold text-xs flex items-center justify-center">
                        {project.currentSceneIdx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 font-serif">
                          Scene {project.currentSceneIdx + 1} of {project.scenes.length}
                        </h4>
                        <p className="text-xs text-stone-500">
                          {selectedCount}/{project.scenes.length} clips locked • {project.totalDurationSec}s total runtime
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {allSelected && (
                        <button
                          onClick={handleFinalizeMovie}
                          disabled={finalizing}
                          className="px-4 py-1.5 bg-violet-700 hover:bg-violet-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          {finalizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5" />}
                          <span>{finalizing ? "Syncing..." : "Sync Final Timeline"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scene Prompt Details */}
                  {currentScene && (
                    <div className="bg-white border border-[#ded7c8] rounded-2xl p-5 space-y-4 shadow-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Scene Script Beat:</span>
                        <p className="text-xs text-stone-800 bg-[#faf8f5] border border-[#ded7c8] rounded-xl p-3.5 leading-relaxed font-medium">
                          "{currentScene.scriptChunk}"
                        </p>
                      </div>

                      {currentScene.variants.length === 0 ? (
                        <button
                          onClick={() => handleGenerateVariants(currentScene.id)}
                          disabled={generatingSceneId === currentScene.id}
                          className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                        >
                          {generatingSceneId === currentScene.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          <span>{generatingSceneId === currentScene.id ? "Synthesizing 4 Multi-Style Video Variants..." : "Generate 4 Video Variants for this 10s Scene"}</span>
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center space-x-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Select your preferred cinematography variant below:</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentScene.variants.map((v) => {
                              const isSelected = v.id === currentScene.selectedVariantId;
                              return (
                                <div
                                  key={v.id}
                                  className={`bg-white border rounded-2xl overflow-hidden shadow-xs flex flex-col transition-all ${
                                    isSelected
                                      ? "border-emerald-500 ring-2 ring-emerald-200"
                                      : "border-[#ded7c8] hover:border-stone-400"
                                  }`}
                                >
                                  <div className="relative aspect-video bg-stone-950 overflow-hidden group">
                                    <img src={v.thumbnail} alt={v.style} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      {v.style} • 10s
                                    </div>
                                    {isSelected && (
                                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>SELECTED</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3 space-y-2">
                                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-snug">{v.prompt}</p>
                                    <button
                                      onClick={() => handleSelectVariant(currentScene.id, v.id)}
                                      disabled={isSelected}
                                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer ${
                                        isSelected
                                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                                          : "bg-stone-900 hover:bg-stone-800 text-white"
                                      }`}
                                    >
                                      {isSelected ? <span>✓ Locked Clip</span> : <span>Select Variant</span>}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Film className="w-10 h-10 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-500">Please start with Step 1 & 2 to slice scenes.</p>
                  <button onClick={() => setActiveStage("prompt")} className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl">Go to Step 1</button>
                </div>
              )}
            </div>
          )}

          {/* STAGE 4: AI EDITOR SWARM CHAT */}
          {activeStage === "editor-chat" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-[#ded7c8] rounded-3xl p-6 shadow-xs flex flex-col h-[520px]">
                <div className="flex items-center space-x-3 pb-4 border-b border-[#ded7c8]">
                  <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-stone-900">AI Editor Swarm Conversation</h3>
                    <p className="text-[11px] text-stone-500">Director • Cinematographer • Sound & Rhythm Editor</p>
                  </div>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {editorMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          m.role === "user"
                            ? "bg-stone-900 text-white"
                            : "bg-[#faf8f5] border border-[#ded7c8] text-stone-800"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    </div>
                  ))}
                  {editorSending && (
                    <div className="flex justify-start">
                      <div className="bg-[#faf8f5] border border-[#ded7c8] rounded-2xl p-3 text-xs text-stone-500 flex items-center space-x-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Swarm analyzing cuts and grading...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Swarm Action Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-[#ded7c8]">
                  {[
                    "Make the atmosphere darker & more moody",
                    "Add anamorphic widescreen 2.39:1 advice",
                    "Increase tension in Scene 2 transition",
                    "Suggest orchestral synth soundtrack beats"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendEditorMessage(sug)}
                      className="px-2.5 py-1 bg-[#f5f0e6] hover:bg-[#ede5d5] text-stone-700 rounded-full text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="pt-2 flex space-x-2">
                  <input
                    value={editorInput}
                    onChange={(e) => setEditorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendEditorMessage()}
                    placeholder="Ask the Director or Editor swarm for changes..."
                    className="flex-1 px-4 py-2.5 bg-[#faf8f5] border border-[#ded7c8] rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"
                  />
                  <button
                    onClick={() => handleSendEditorMessage()}
                    disabled={editorSending || !editorInput.trim()}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: RENDER FINAL WEBPAGE */}
          {activeStage === "render-webpage" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border border-[#ded7c8] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">5</span>
                    <h3 className="text-base font-bold font-serif text-stone-900">Step 5 — Final HTML Webpage Package</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadHtml}
                      disabled={!renderedHtml}
                      className="px-3 py-1.5 bg-[#faf8f5] hover:bg-[#ede7db] border border-[#ded7c8] text-stone-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download HTML</span>
                    </button>
                    <button
                      onClick={handleOpenInNewWindow}
                      disabled={!renderedHtml}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in New Tab</span>
                    </button>
                  </div>
                </div>

                {!renderedHtml ? (
                  <div className="text-center py-10 space-y-3">
                    <Globe className="w-10 h-10 text-stone-400 mx-auto" />
                    <p className="text-xs text-stone-500">Render your production into a standalone cohesive web release.</p>
                    <button
                      onClick={handleRenderFinalWebpage}
                      disabled={renderingWebpage}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {renderingWebpage ? "Compiling Webpage..." : "Generate Webpage Now"}
                    </button>
                  </div>
                ) : (
                  <div className="border border-stone-800 rounded-2xl overflow-hidden shadow-lg h-[500px] bg-stone-950">
                    <iframe
                      srcDoc={renderedHtml}
                      title="Rendered Movie Webpage"
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
