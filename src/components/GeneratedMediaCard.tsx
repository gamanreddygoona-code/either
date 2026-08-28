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
  X
} from "lucide-react";
import { GeneratedMediaPayload } from "../types";

interface GeneratedMediaCardProps {
  media: GeneratedMediaPayload;
  onRegenerate?: (prompt: string) => void;
}

export const GeneratedMediaCard: React.FC<GeneratedMediaCardProps> = ({
  media,
  onRegenerate,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    navigator.clipboard.writeText(media.url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = media.url;
    a.download = `${media.title || "either-ai-generated"}.${media.type === "video" ? "mp4" : "png"}`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isVideo = media.type === "video";

  return (
    <div className="w-full my-3 bg-[#18181b] border border-stone-800 text-stone-100 rounded-2xl overflow-hidden shadow-xl animate-fadeIn select-none">
      {/* Header Info Bar */}
      <div className="px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isVideo ? "bg-purple-900/60 text-purple-300 border border-purple-700/50" : "bg-cyan-900/60 text-cyan-300 border border-cyan-700/50"}`}>
            {isVideo ? <Film className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">
                {media.title || (isVideo ? "AI Video Render" : "AI Generated Artwork")}
              </span>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                {media.model || (isVideo ? "Either Video Gen-2" : "Flux 1024 HDR")}
              </span>
            </div>
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

      {/* Main Media Canvas */}
      <div className="relative bg-black flex items-center justify-center overflow-hidden min-h-[260px] max-h-[460px]">
        {isVideo ? (
          <div className="relative w-full h-full group">
            <video
              ref={videoRef}
              src={media.url}
              poster={media.poster}
              loop
              playsInline
              muted={isMuted}
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain max-h-[460px] cursor-pointer"
            />

            {/* Play/Pause Center Overlay */}
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

            {/* Bottom Video Controls Overlay */}
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
                <span className="text-[11px] font-mono text-stone-300">
                  {media.resolution || "1080p"} • {media.fps || 30} FPS
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-sm transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>MP4</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center group">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-950">
                <div className="flex flex-col items-center space-y-2">
                  <RotateCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs text-stone-400">Synthesizing visual neural output...</span>
                </div>
              </div>
            )}
            <img
              src={media.url}
              alt={media.prompt}
              onLoad={() => setImageLoaded(true)}
              onClick={() => setIsFullscreen(true)}
              className={`w-full h-full object-contain max-h-[460px] cursor-pointer hover:scale-[1.01] transition-transform duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        )}
      </div>

      {/* Footer Prompt & Generation Metadata */}
      <div className="p-3.5 bg-stone-900/70 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex-1 pr-2">
          <div className="flex items-center space-x-1.5 text-stone-400 mb-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Prompt:</span>
          </div>
          <p className="text-xs text-stone-200 italic line-clamp-2">
            "${media.prompt}"
          </p>
        </div>

        {onRegenerate && (
          <button
            onClick={() => onRegenerate(media.prompt)}
            className="self-start sm:self-center px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 border border-stone-700"
          >
            <RotateCw className="w-3 h-3" />
            <span>Generate Variant</span>
          </button>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn select-text">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[80vh] w-full flex items-center justify-center p-2">
            {isVideo ? (
              <video
                src={media.url}
                controls
                autoPlay
                className="max-w-full max-h-[75vh] rounded-2xl shadow-2xl"
              />
            ) : (
              <img
                src={media.url}
                alt={media.prompt}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            )}
          </div>

          <div className="mt-4 text-center max-w-2xl px-4">
            <p className="text-sm text-stone-300 font-medium">"${media.prompt}"</p>
            <div className="flex items-center justify-center space-x-3 mt-3">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-white text-stone-900 font-bold rounded-xl text-xs flex items-center space-x-1.5 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download ${isVideo ? "MP4 Video" : "High-Res PNG"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
