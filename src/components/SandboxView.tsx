import React, { useState, useRef, useEffect } from "react";
import { Terminal, Play, RotateCw, CheckCircle2, AlertCircle, MessageCircleQuestion, Film, Sparkles, ArrowRight, Eye } from "lucide-react";

interface SandboxViewProps {
  onOpenMovie?: (script: string) => void;
}

export const SandboxView: React.FC<SandboxViewProps> = ({ onOpenMovie }) => {
  const [command, setCommand] = useState("dir");
  const [output, setOutput] = useState<string>("Sandbox ready — project root: Either-AI-Workspace\nType a command and press Run. Agent will ask if clarification is needed.\n");
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<{ role:"user"|"agent", text:string, needAsk?:boolean }[]>([]);
  const [askText, setAskText] = useState<string | null>(null);
  const [pendingMovieScene, setPendingMovieScene] = useState<{ sceneId:string, variants:any[], sceneIdx:number } | null>(null);
  const [movieScript, setMovieScript] = useState("");

  const runCommand = async () => {
    if (!command.trim()) return;
    setRunning(true);
    setOutput(prev => prev + `\n> ${command}\n`);
    setHistory(h => [...h, { role:"user", text: command }]);
    try {
      const res = await fetch("/api/sandbox/exec", {
        method: "POST", headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ command })
      });
      const j = await res.json();
      if (j.needsAsk) {
        setAskText(j.question);
        setOutput(prev => prev + `\n[Agent asks] ${j.question}\n`);
        setHistory(h=> [...h, { role:"agent", text: j.question, needAsk:true }]);
      } else {
        const out = j.output || j.error || "No output";
        setOutput(prev => prev + out + "\n");
        setHistory(h=> [...h, { role:"agent", text: out }]);
      }
    } catch(e:any){
      setOutput(prev => prev + `\n[Error] ${e.message}\n`);
    }
    setRunning(false);
  };

  const answerAsk = async (answer: string) => {
    if (!askText) return;
    // If we're in movie pick mode, handle 1-4 selection
    if (pendingMovieScene) {
      const n = parseInt(answer.trim());
      if (n >=1 && n <=4) {
        const variant = pendingMovieScene.variants[n-1];
        if (variant) {
          try{
            const sel = await fetch(`/api/video/scene/${pendingMovieScene.sceneId}/select`, {
              method:"POST", headers:{"Content-Type":"application/json"},
              body: JSON.stringify({ variantId: variant.id })
            });
            const sj:any = await sel.json();
            setOutput(prev=> prev + `\n[You picked ${n} — ${variant.style}] ${sj.allSelected?'All scenes done!':'Next scene...'}\n`);
            setHistory(h=> [...h, { role:"user", text: `Picked ${n} for Scene ${pendingMovieScene.sceneIdx+1}` }]);
            setAskText(null);
            setPendingMovieScene(null);
            return;
          }catch(e:any){ setOutput(prev=> prev + `\n[Pick failed] ${e.message}\n`); }
        }
      }
    }
    setHistoria(answer);
    setAskText(null);
  };
  const setHistoria = (answer:string) => {
    setHistory(h=> [...h, { role:"user", text: answer }]);
    setOutput(prev=> prev + `\n[You answered] ${answer}\n`);
    setTimeout(()=> runCommandWithContext(answer), 300);
  };
  const runCommandWithContext = async (ctx:string) => {
    setRunning(true);
    try{
      const res = await fetch("/api/sandbox/exec", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ command, context: ctx }) });
      const j = await res.json();
      if (j.needsAsk) { setAskText(j.question); setOutput(p=>p+`\n[Agent asks] ${j.question}\n`); }
      else { setOutput(p=>p+ (j.output||j.error||"done")+"\n"); }
    }catch(e:any){ setOutput(p=>p+`\n[Error] ${e.message}\n`); }
    setRunning(false);
  };

  const handleMakeMovie = async () => {
    if(!movieScript.trim()){ setOutput(p=>p+"\n[Movie] Please paste a script first.\n"); return; }
    setOutput(p=> p+`\n[Movie] Creating project — breaking script every 10s, will generate 4 Veo 3 clips per scene and ask you to pick per clip...\n`);
    try{
      const res = await fetch("/api/video/project", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ script: movieScript, title: "Sandbox Movie", useVeo: true })
      });
      const j = await res.json();
      if(!j.success){ setOutput(p=>p+`[Movie Error] ${j.error}\n`); return; }
      const proj = j.project;
      setOutput(p=> p+`[Movie] Project ${proj.id} — ${proj.scenes.length} scenes × 10s. Starting Veo 3 generation...\n`);
      // Brake per clip: generate 4 for each scene sequentially, asking each time
      for(let i=0;i<proj.scenes.length;i++){
        const sc = proj.scenes[i];
        setOutput(p=> p+`\n[Scene ${i+1}/${proj.scenes.length}] "${sc.scriptChunk.slice(0,60)}..." — generating 4 Veo 3 clips...\n`);
        const gen = await fetch(`/api/video/scene/${sc.id}/generate`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ useVeo: true, veoModel: "veo-3.0-generate-001" })
        });
        const gj = await gen.json();
        if(!gj.success){ setOutput(p=>p+`[Scene ${i+1} Gen failed] ${gj.error}\n`); continue; }
        setOutput(p=> p+`[Scene ${i+1}] 4 Veo 3 clips ready:\n` + gj.scene.variants.map((v:any,idx:number)=>`  ${idx+1}. [${v.style}] ${v.prompt.slice(0,70)}\n`).join("") + `→ Pick one in Video Swarm view, or reply 1-4 here. Waiting...\n`);
        setAskText(`Pick clip for Scene ${i+1} (1-4) — 4 Veo 3 variants ready. Reply 1-4 to select, or pick in Video Swarm view.`);
        setPendingMovieScene({ sceneId: sc.id, variants: gj.scene.variants, sceneIdx: i });
        // Proper brake: wait for user to pick via Video Swarm or via ask box; poll project state until this scene is selected
        await new Promise<void>(async (resolve)=>{
          for(let waited=0; waited<120; waited++){
            await new Promise(r=> setTimeout(r, 1000));
            try{
              const checkRes = await fetch(`/api/video/project/${proj.id}`);
              const checkJ = await checkRes.json();
              const curSc = checkJ.project?.scenes?.find((s:any)=> s.id===sc.id);
              if(curSc && curSc.status==="selected"){
                setOutput(p=> p+`[Scene ${i+1} picked: ${curSc.selectedVariantId}]\n`);
                setAskText(null);
                setPendingMovieScene(null);
                break;
              }
            }catch{}
            if(waited===119){
              try{
                await fetch(`/api/video/scene/${sc.id}/select`, {
                  method:"POST", headers:{"Content-Type":"application/json"},
                  body: JSON.stringify({ variantId: gj.scene.variants[0].id })
                });
                setOutput(p=> p+`[Timeout — auto-picked 1]\n`);
                setAskText(null);
                setPendingMovieScene(null);
              }catch{}
              break;
            }
          }
          resolve();
        });
      }
      setOutput(p=> p+`\n[Movie] All clips picked — finalizing with Veo 3 sync editor...\n`);
      const fin = await fetch(`/api/video/project/${proj.id}/finalize`, { method:"POST" });
      const fj = await fin.json();
      if(fj.success) setOutput(p=> p+`[Movie Done] ${fj.project.finalTimeline.syncNotes}\nOpen Video Swarm to view timeline and download.\n`);
      if(onOpenMovie) onOpenMovie(movieScript);
    }catch(e:any){ setOutput(p=>p+`[Movie Error] ${e.message}\n`); }
  };

  return (
    <div className="flex-1 h-full bg-[#faf8f5] overflow-hidden flex flex-col p-4 gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-stone-900 text-white grid place-items-center"><Terminal className="w-4 h-4" /></div>
        <div><div className="text-sm font-bold font-serif text-stone-900">Sandbox — Run Commands</div><div className="text-xs text-stone-500">Agent asks if clarification is needed • Connected to your servers</div></div>
        <span className="ml-auto text-[10px] font-mono px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">SANDBOX LIVE</span>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 flex-1 min-h-0">
        {/* Terminal */}
        <div className="bg-stone-950 border border-stone-800 rounded-2xl flex flex-col overflow-hidden shadow-sm min-h-[320px]">
          <div className="px-3 py-2 bg-stone-900 border-b border-stone-800 flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 font-mono text-stone-400">sandbox@Either:~/Either-AI-Workspace</span>
            {running && <RotateCw className="w-3 h-3 animate-spin text-stone-400 ml-auto" />}
          </div>
          <pre className="flex-1 p-3 text-[12px] font-mono text-stone-200 whitespace-pre-wrap overflow-y-auto leading-relaxed">{output}</pre>
          <div className="p-2 bg-stone-900 border-t border-stone-800 flex gap-2">
            <input value={command} onChange={e=> setCommand(e.target.value)} onKeyDown={e=> e.key==="Enter"&&runCommand()} placeholder="e.g. dir, type package.json, git status, npm test" className="flex-1 px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-100 text-xs font-mono focus:outline-none focus:border-stone-600" />
            <button onClick={runCommand} disabled={running} className="px-4 py-2 rounded-lg bg-white text-stone-900 text-xs font-bold hover:bg-stone-100 disabled:opacity-50 flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Run</button>
          </div>
          {askText && (
            <div className="p-3 bg-amber-950/30 border-t border-amber-900/30 flex gap-2 items-start">
              <MessageCircleQuestion className="w-4 h-4 text-amber-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-200">Agent asks:</div>
                <div className="text-xs text-amber-100">{askText}</div>
                <div className="mt-2 flex gap-2">
                  <input id="ask-input" placeholder="Your answer..." className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-800 border border-amber-900/30 text-xs text-white placeholder-stone-400 focus:outline-none" onKeyDown={e=>{
                    if(e.key==="Enter"){
                      const v=(e.target as HTMLInputElement).value;
                      if(v.trim()){ answerAsk(v); (e.target as HTMLInputElement).value=""; }
                    }
                  }} />
                  <button onClick={()=>{
                    const el=document.getElementById('ask-input') as HTMLInputElement;
                    if(el && el.value.trim()){ answerAsk(el.value); el.value=""; }
                  }} className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold">Answer</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Movie with Veo 3 */}
        <div className="bg-white border border-[#e8e3d8] rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white grid place-items-center"><Film className="w-4 h-4" /></div>
            <div><div className="text-sm font-bold text-stone-900">Make Movie — Veo 3</div><div className="text-xs text-stone-500">4 clips per 10s scene • brake & ask per clip</div></div>
            <span className="ml-auto text-[10px] font-mono px-2 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700">Veo 3</span>
          </div>
          <textarea value={movieScript} onChange={e=> setMovieScript(e.target.value)} placeholder="Paste script here… e.g. A lone astronaut discovers a glowing forest on Mars at dawn. He steps out, breath fogging. Trees pulse..." rows={6} className="w-full px-3 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none resize-none" />
          <button onClick={handleMakeMovie} className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" /> Generate 4× Veo 3 per clip — ask to select
          </button>
          <div className="text-[11px] text-stone-500 leading-relaxed bg-[#faf8f5] border border-stone-200 rounded-xl p-2.5">
            Flow: <b>Break every 10s</b> → for each scene, Veo 3 generates <b>4 clips</b> (Cinematic/Anime/Realistic/Documentary) → <b>Agent asks “pick 1-4”</b> → you pick → next scene. After last clip, Editor syncs final timeline. Works even if you close sandbox — picks persist in Video Swarm view.
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <Eye className="w-3 h-3" /> Picks also visible in <span className="font-semibold text-stone-700">Video Swarm</span> → timeline
            <a href="#" onClick={e=>{e.preventDefault(); if(onOpenMovie) onOpenMovie(movieScript);}} className="ml-auto text-violet-700 hover:underline inline-flex items-center gap-1">Open Swarm <ArrowRight className="w-3 h-3" /></a>
          </div>
        </div>
      </div>
    </div>
  );
};
