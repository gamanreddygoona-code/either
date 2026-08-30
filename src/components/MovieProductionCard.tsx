import React, { useState } from "react";
import {
  Clapperboard,
  Film,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera,
  Layers,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  Download,
  Maximize2,
  X,
  Check,
  FastForward,
  Edit3,
  Sliders
} from "lucide-react";
import { MovieProductionPayload, SceneScript, MovieTake } from "../types";

interface MovieProductionCardProps {
  production: MovieProductionPayload;
  onApproveAndProduce?: (productionId: string) => void;
  onSelectTake?: (sceneIndex: number, takeIndex: number) => void;
}

export const MovieProductionCard: React.FC<MovieProductionCardProps> = ({
  production,
  onApproveAndProduce,
  onSelectTake,
}) => {
  const [stage, setStage] = useState<"script_approval" | "producing_clips" | "completed">(production.stage || "script_approval");
  const [activeSceneIdx, setActiveSceneIdx] = useState(production.activeSceneIndex || 0);
  const [selectedTakes, setSelectedTakes] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0
  });
  const [isProducing, setIsProducing] = useState(false);
  const [producingProgress, setProducingProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"screenplay" | "production">("screenplay");

  const scenes = production.scenes || [];
  const currentScene: SceneScript | undefined = scenes[activeSceneIdx];
  const takes = currentScene?.takes || [];
  const currentTakeIdx = selectedTakes[activeSceneIdx] || 0;
  const currentTake: MovieTake | undefined = takes[currentTakeIdx] || (takes.length > 0 ? takes[0] : undefined);

  const handleApprove = () => {
    setIsProducing(true);
    setStage("producing_clips");
    setActiveTab("production");
    
    // Simulate multi-agent Veo 3 swarm synthesis pipeline
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setProducingProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsProducing(false);
        setStage("completed");
        if (onApproveAndProduce) onApproveAndProduce(production.id);
      }
    }, 600);
  };

  const handleTakeChange = (takeIdx: number) => {
    setSelectedTakes(prev => ({ ...prev, [activeSceneIdx]: takeIdx }));
    setImageLoaded(false);
    if (onSelectTake) onSelectTake(activeSceneIdx, takeIdx);
  };

  return (
    <div className="w-full my-4 bg-[#0d0e12] border border-violet-900/40 text-stone-100 rounded-2xl overflow-hidden shadow-2xl font-sans select-none animate-fadeIn">
      {/* Header Studio Banner */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#171923] via-[#13151c] to-[#0d0e12] border-b border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-violet-950/60 shrink-0">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-bold text-base text-white tracking-tight">
                {production.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-950/80 text-violet-300 border border-violet-700/60">
                {production.genre}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
              {production.logline}
            </p>
          </div>
        </div>

        {/* Status Badge & Tab Toggles */}
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <div className="flex bg-stone-900/90 rounded-lg p-0.5 border border-stone-800 text-xs">
            <button
              onClick={() => setActiveTab("screenplay")}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "screenplay"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              Screenplay
            </button>
            <button
              onClick={() => setActiveTab("production")}
              className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "production"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              Veo 3 Production ({stage === "completed" ? "4 Clips Ready" : stage === "producing_clips" ? "Rendering..." : "Pending Approval"})
            </button>
          </div>
        </div>
      </div>

      {/* Screenplay Script Breakdown Tab */}
      {activeTab === "screenplay" && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold flex items-center space-x-2">
              <Film className="w-3.5 h-3.5" />
              <span>Multi-Scene Screenplay Structure ({scenes.length} Scenes)</span>
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Runtime: ~{production.estimatedRuntimeSec || 24}s • 24 FPS
            </span>
          </div>

          {/* Scene Cards Accordion/Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenes.map((scene, sIdx) => (
              <div
                key={sIdx}
                onClick={() => setActiveSceneIdx(sIdx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeSceneIdx === sIdx
                    ? "bg-violet-950/30 border-violet-500/80 shadow-md shadow-violet-950/40 ring-1 ring-violet-500/30"
                    : "bg-stone-900/60 border-stone-800/80 hover:border-stone-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                    Scene {scene.sceneNumber}: {scene.slug}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-stone-400">
                    {scene.durationSec}s
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1.5">{scene.title}</h4>
                <p className="text-xs text-stone-300 leading-relaxed mb-3">
                  {scene.narrativeDescription}
                </p>

                {/* Director Technical Breakdown */}
                <div className="space-y-1.5 pt-2.5 border-t border-stone-800/80 text-[11px]">
                  <div className="flex items-center space-x-2 text-stone-400">
                    <Camera className="w-3 h-3 text-violet-400 shrink-0" />
                    <span><strong className="text-stone-300">Camera:</strong> {scene.cameraMovement}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-stone-400">
                    <Sparkles className="w-3 h-3 text-fuchsia-400 shrink-0" />
                    <span><strong className="text-stone-300">Lighting:</strong> {scene.lightingAtmosphere}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-stone-400">
                    <Volume2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span><strong className="text-stone-300">Audio / Foley:</strong> {scene.audioFoleyCues}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Director Approval Action Bar */}
          {stage === "script_approval" ? (
            <div className="p-4 bg-gradient-to-r from-violet-950/80 via-stone-900 to-violet-950/80 rounded-xl border border-violet-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
              <div className="flex items-center space-x-3 text-xs text-stone-300">
                <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-violet-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Director Review Required</p>
                  <p className="text-stone-400">Approve this screenplay to trigger the Veo 3 Multi-Agent Video Swarm (4 clips with 4 takes each).</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={handleApprove}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-violet-900/40 flex items-center justify-center space-x-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
                >
                  <Clapperboard className="w-4 h-4" />
                  <span>Approve Script & Produce Movie Clips</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Screenplay Approved • Multi-Agent Video Production Ready</span>
              </span>
              <button
                onClick={() => setActiveTab("production")}
                className="px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-white font-medium transition-colors cursor-pointer"
              >
                View Video Takes &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Veo 3 Multi-Clip Video Production Studio Tab */}
      {activeTab === "production" && (
        <div className="p-5 space-y-4">
          {/* Rendering Progress Bar if producing */}
          {isProducing && (
            <div className="p-4 bg-violet-950/50 border border-violet-800/60 rounded-xl space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-violet-300 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 animate-spin text-fuchsia-400" />
                  <span>Veo 3 Multi-Agent Swarm Synthesizing 4 Clips...</span>
                </span>
                <span className="font-mono text-violet-400">{producingProgress}%</span>
              </div>
              <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-800">
                <div
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-300"
                  style={{ width: `${producingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Scene Selector Stepper Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center space-x-2">
              {scenes.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSceneIdx(idx);
                    setImageLoaded(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeSceneIdx === idx
                      ? "bg-violet-600 text-white shadow-md shadow-violet-950"
                      : "bg-stone-900 hover:bg-stone-800 text-stone-400"
                  }`}
                >
                  <span>Scene {s.sceneNumber}</span>
                </button>
              ))}
            </div>

            <div className="text-xs text-stone-400 font-mono">
              Scene {activeSceneIdx + 1} of {scenes.length}
            </div>
          </div>

          {/* Main Visual Viewport for Active Scene Take */}
          <div className="relative bg-black rounded-xl overflow-hidden min-h-[300px] max-h-[500px] flex items-center justify-center border border-stone-800 group">
            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-stone-950 text-stone-400">
                <Sparkles className="w-6 h-6 animate-spin text-violet-400" />
                <span className="text-xs">Synthesizing Scene {activeSceneIdx + 1} High-Definition Frames...</span>
              </div>
            )}
            <img
              src={currentTake?.url || "https://image.pollinations.ai/prompt/cinematic+movie+scene?width=1024&height=576&nologo=true&model=flux"}
              alt={currentScene?.title || "Movie scene"}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover max-h-[500px] transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            />

            {/* Overlay Camera Tag & Scene Info */}
            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white shadow-xl space-y-1">
              <div className="flex items-center space-x-2 font-bold">
                <Camera className="w-3.5 h-3.5 text-violet-400" />
                <span>{currentTake?.label || `Take ${currentTakeIdx + 1}`}</span>
                <span className="text-stone-400 font-mono">• {currentTake?.durationSec || currentScene?.durationSec || 6}s</span>
              </div>
              <p className="text-[11px] text-stone-300">{currentTake?.cameraMovement || currentScene?.cameraMovement}</p>
            </div>

            {/* Action Bar Overlay */}
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Multi-Take Coverage Variations for this Scene */}
          {takes.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span className="font-bold font-mono text-violet-300 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Veo 3 Multi-Angle Takes ({takes.length} Variations):</span>
                </span>
                <span className="text-[11px] text-stone-500">Select preferred cut for final sequence</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {takes.map((take, tIdx) => (
                  <button
                    key={tIdx}
                    onClick={() => handleTakeChange(tIdx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      currentTakeIdx === tIdx
                        ? "bg-violet-950/80 border-violet-500 text-white shadow-md shadow-violet-950/60 ring-1 ring-violet-500/40"
                        : "bg-stone-900/60 border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-[10px] font-bold font-mono uppercase ${currentTakeIdx === tIdx ? "text-violet-300" : "text-stone-500"}`}>
                        {take.label}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/50 text-stone-400">
                        {take.durationSec}s
                      </span>
                    </div>
                    <p className="text-xs font-semibold line-clamp-1 text-stone-200">{take.cameraMovement}</p>
                    <span className="text-[10px] text-stone-400 mt-1 truncate">{take.visualStyle}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls between Scenes */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-800/80 text-xs">
            <button
              disabled={activeSceneIdx === 0}
              onClick={() => {
                setActiveSceneIdx(prev => Math.max(0, prev - 1));
                setImageLoaded(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-stone-300 font-medium transition-colors flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Scene</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-stone-500 font-mono text-[11px]">Either Neural Director</span>
            </div>

            <button
              disabled={activeSceneIdx === scenes.length - 1}
              onClick={() => {
                setActiveSceneIdx(prev => Math.min(scenes.length - 1, prev + 1));
                setImageLoaded(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-violet-950"
            >
              <span>Next Scene</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center">
            <img
              src={currentTake?.url || currentScene?.takes?.[0]?.url}
              alt={currentScene?.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="text-center mt-4 space-y-1">
              <p className="text-sm font-bold text-white">Scene {currentScene?.sceneNumber}: {currentScene?.title}</p>
              <p className="text-xs text-stone-400">{currentScene?.narrativeDescription}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
