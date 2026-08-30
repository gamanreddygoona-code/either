import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Copy,
  Check,
  Sparkles,
  RotateCw,
  Film,
  Image as ImageIcon,
  ExternalLink,
  Clapperboard,
  Layers,
  ChevronRight,
  Camera,
  X
} from "lucide-react";
import { GeneratedMediaPayload, MovieClip } from "../types";

interface GeneratedMediaCardProps {
  media: GeneratedMediaPayload;
  onRegenerate?: (prompt: string) => void;
}

export const GeneratedMediaCard: React.FC<GeneratedMediaCardProps> = ({
  media,
  onRegenerate,
}) => {
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const clips = media.clips || [];
  const hasClips = clips.length > 0;
  const currentClip: MovieClip | null = hasClips ? clips[activeClipIndex] : null;
  const isMovie = media.type === "movie" || hasClips;
  const isVideo = media.type === "video";

  const displayUrl = currentClip ? currentClip.url : media.url;
  const displayTitle = currentClip ? `Scene ${currentClip.sceneNumber}: ${currentClip.title}` : (media.title || (isMovie ? "Cinematic Movie Studio" : isVideo ? "AI Video Render" : "AI Generated Artwork"));

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(displayUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = displayUrl;
    a.download = `${media.title || "either-ai-clip"}.${isVideo ? "mp4" : "png"}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full my-3 bg-[#121214] border border-stone-800 text-stone-100 rounded-2xl overflow-hidden shadow-2xl animate-fadeIn select-none font-sans">
      {/* Header Info Bar */}
      <div className="px-4 py-3 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isMovie 
              ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-900/30" 
              : isVideo 
              ? "bg-purple-900/60 text-purple-300 border border-purple-700/50" 
              : "bg-cyan-900/60 text-cyan-300 border border-cyan-700/50"
          }`}>
            {isMovie ? <Clapperboard className="w-4 h-4" /> : isVideo ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-wide">
                {displayTitle}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-800 text-violet-300 border border-stone-700">
                {media.model || (isMovie ? "Veo 3 • 4-Clip Swarm" : isVideo ? "Either Video Gen-2" : "Flux 1024 HDR")}
              </span>
            </div>
            {isMovie && hasClips && (
              <p className="text-[11px] text-stone-400 mt-0.5">
                4 Multi-Scene Timeline • 24 FPS Cinematic Composition
              </p>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handleCopyLink}
            title="Copy Media URL"
            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            title="Download Media File"
            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            title="Expand Fullscreen"
            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Media Canvas Viewport */}
      <div className="relative bg-black flex items-center justify-center overflow-hidden min-h-[280px] max-h-[480px]">
        {isVideo ? (
          <div className="relative w-full h-full group">
            <video
              ref={videoRef}
              src={displayUrl}
              poster={media.poster}
              loop
              playsInline
              muted={isMuted}
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain max-h-[480px] cursor-pointer"
            />
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center group">
            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-stone-950 text-stone-400">
                <Sparkles className="w-6 h-6 animate-spin text-violet-400" />
                <span className="text-xs">Synthesizing cinematic frames...</span>
              </div>
            )}
            <img
              src={displayUrl}
              alt={media.prompt}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover max-h-[480px] transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            />
            {currentClip && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white flex items-center space-x-2 shadow-lg">
                <Camera className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-semibold">{currentClip.cameraMovement}</span>
                <span className="text-stone-400">• {currentClip.durationSec}s</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Multi-Clip Scene Swarm Selector (for Movies / Clips) */}
      {hasClips && (
        <div className="p-3.5 bg-stone-900/90 border-t border-stone-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-stone-300">
            <span className="font-semibold flex items-center space-x-1.5">
              <Film className="w-3.5 h-3.5 text-violet-400" />
              <span>Movie Scene Timeline (4 Clips)</span>
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              Clip {activeClipIndex + 1} of {clips.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {clips.map((clip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveClipIndex(idx);
                  setImageLoaded(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeClipIndex === idx
                    ? "bg-violet-950/60 border-violet-500 shadow-md shadow-violet-950/50 ring-1 ring-violet-500/40"
                    : "bg-stone-950/50 border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-[10px] font-bold uppercase font-mono ${activeClipIndex === idx ? "text-violet-300" : "text-stone-500"}`}>
                    Scene {clip.sceneNumber}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/50 text-stone-400">
                    {clip.durationSec}s
                  </span>
                </div>
                <p className="text-xs font-semibold text-white line-clamp-1">
                  {clip.title}
                </p>
                <div className="flex items-center space-x-1 text-[10px] text-stone-400 mt-1">
                  <Camera className="w-2.5 h-2.5 text-violet-400 shrink-0" />
                  <span className="truncate">{clip.cameraMovement}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Footer & Screenplay Breakdown */}
      <div className="px-4 py-3 bg-stone-950 border-t border-stone-800 text-xs text-stone-300 space-y-1.5">
        <div className="flex items-start space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-stone-300">
            <span className="font-semibold text-stone-100">Screenplay Direction: </span>
            {currentClip ? currentClip.prompt : media.prompt}
          </p>
        </div>
        {onRegenerate && (
          <div className="pt-1 flex items-center justify-between border-t border-stone-800/60">
            <span className="text-[11px] text-stone-500">Either Neural Creative Suite</span>
            <button
              onClick={() => onRegenerate(media.prompt)}
              className="flex items-center space-x-1.5 text-violet-400 hover:text-violet-300 transition-colors font-medium cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
              <span>Regenerate Movie Swarm</span>
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center">
            {isVideo ? (
              <video
                src={displayUrl}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={displayUrl}
                alt={media.prompt}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
            <p className="text-sm text-stone-300 mt-4 text-center max-w-2xl">
              {currentClip ? currentClip.prompt : media.prompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
