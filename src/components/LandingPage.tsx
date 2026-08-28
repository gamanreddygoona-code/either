import React, { useRef, useState, useEffect } from 'react';
import { motion, useTransform, useScroll } from 'motion/react';
import {
  ArrowRight, Download, Sparkles, Globe, TrendingUp, Mail, Github, Zap, ShieldCheck, Cpu,
  CheckCircle2, ChevronRight, Check, Copy, Terminal, FolderDown, Box, Play, Film, Wand2, Clapperboard,
  Search, Brain, Monitor, Layers, Eye, Rocket, Star
} from 'lucide-react';
import { EitherLogo } from './ConnectorIcons';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenTradingDesk?: () => void;
  onOpenBrowserAgent?: () => void;
}



export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenTradingDesk, onOpenBrowserAgent }) => {
  const [copied, setCopied] = useState<string|null>(null);
  const [telemetry, setTelemetry] = useState({ mem:'—', cpu:'—', uptime:'—', status:'Sovereign Node Booting…' });
  const [user, setUser] = useState<{name:string;email:string;avatarUrl:string}|null>(null);
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaInst = useRef<any>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0,0.25], [0, -40]);

  useEffect(()=>{
    fetch('/api/system/telemetry').then(r=>r.json()).then(d=>{
      if(d.success) setTelemetry({ mem:`${d.telemetry.usedMemory} / ${d.telemetry.totalMemory}`, cpu:`${d.telemetry.cpuUsagePercent}%`, uptime:d.telemetry.uptime, status:'Sovereign Node Live' });
    }).catch(()=>{});
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{ if(d.user) setUser({ name:d.user.name||'Gaman', email:d.user.email||'', avatarUrl:d.user.avatarUrl||'' }); }).catch(()=>{});
  },[]);

  useEffect(()=>{
    let dead=false;
    (async()=>{
      try{
        const THREE = await import('three');
        const vmod:any = await import('vanta/dist/vanta.net.min');
        const VANTA = vmod.default || (window as any).VANTA;
        if(dead || !vantaRef.current) return;
        if(vantaInst.current) try{ vantaInst.current.destroy(); }catch{}
        const eff = (VANTA as any).NET || (window as any).VANTA?.NET;
        if(eff) vantaInst.current = eff({ el: vantaRef.current, THREE, mouseControls:true, touchControls:true, gyroControls:false, minHeight:200, minWidth:200, scale:1, scaleMobile:1, color:0x8b5cf6, backgroundColor:0x02010a, points:9, maxDistance:22, spacing:18, showDots:true });
      }catch{}
    })();
    return()=>{ dead=true; if(vantaInst.current) try{ vantaInst.current.destroy(); }catch{} };
  },[]);

  useEffect(()=>{
    let nodes:any[]=[];
    (async()=>{
      try{
        const VanillaTilt:any = (await import('vanilla-tilt')).default;
        document.querySelectorAll('.tilt-premium').forEach((el:any)=>{
          VanillaTilt.init(el, { max:8, speed:700, glare:true, 'max-glare':0.18, scale:1.015, perspective:1200 });
          nodes.push(el);
        });
      }catch{}
    })();
    return()=> nodes.forEach((n:any)=>{ try{ n.vanillaTilt?.destroy(); }catch{} });
  },[]);

  const handleDownload = () => {
    // 1-click cloud desktop install via PowerShell
    copy(ps, 'dl');
    const a = document.createElement('a');
    a.href = '/install.ps1';
    a.setAttribute('download', 'install-either.ps1');
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => {
      document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' });
    }, 600);
  };
  const copy = (t: string, k: string) => {
    navigator.clipboard.writeText(t);
    setCopied(k);
    setTimeout(() => setCopied(null), 2000);
  };
  const ps = 'irm https://either-ai.vercel.app/install.ps1 | iex';

  return (
    <div className="min-h-screen w-full bg-[#030308] text-white font-sans selection:bg-violet-500 selection:text-white overflow-x-hidden">
      {/* Premium dark Vanta + orbs */}
      <div className="fixed inset-0 -z-10">
        <div ref={vantaRef} className="absolute inset-0 opacity-[0.9]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030308]/0 via-[#030308]/20 to-[#030308] pointer-events-none" />
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.18),_transparent_68%)] blur-[1px]" />
        <div className="absolute top-[28%] -left-32 w-[520px] h-[520px] bg-violet-600/10 blur-[90px] rounded-full" />
        <div className="absolute top-[52%] -right-32 w-[640px] h-[640px] bg-cyan-500/8 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage:'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize:'30px 30px' }} />
      </div>

      {/* Premium nav — glass dark */}
      <header className="sticky top-3 z-50 max-w-[1180px] mx-auto px-4">
        <nav className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 rounded-full bg-[#0a0a0f]/70 backdrop-blur-2xl border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleDownload}>
            <div className="w-8 h-8 rounded-xl bg-white text-black grid place-items-center shadow-lg"><EitherLogo className="w-4 h-4" /></div>
            <span className="font-serif font-bold tracking-tight text-white">Either AI</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-black"><Star className="w-3 h-3 text-amber-500" /> PREMIUM • v0.84</span>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-white/60">
            <a href="#premium" className="hover:text-white transition">Premium UI</a>
            <a href="#movie" className="hover:text-white transition">Movie Swarm</a>
            <a href="#install" className="hover:text-white transition">Install</a>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur cursor-pointer" onClick={handleDownload}>
                <div className="relative">{user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-white/20" /> : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center text-white text-xs font-bold">{user.name.charAt(0)}</div>}<span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0f] animate-pulse" /></div>
                <div className="text-left leading-none"><div className="text-xs font-bold text-white">{user.name}</div><div className="text-[10px] text-white/50 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500" /> Connected</div></div>
              </div>
            )}
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-stone-100 shadow-[0_8px_24px_rgba(255,255,255,0.12)] cursor-pointer group">
              <Download className="w-3.5 h-3.5 group-hover:animate-bounce" /> Download App
            </button>
          </div>
        </nav>
      </header>

      {/* HERO — premium, bird card hero */}
      <motion.section style={{ y: heroY } as any} className="relative max-w-[880px] mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
        <div className="text-center">
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur text-xs font-medium text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> Premium Dark UI • 21st.dev • Vanta + Zdog + Tilt <ChevronRight className="w-3 h-3 opacity-50" />
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }} className="mt-5 font-serif font-bold tracking-tight leading-[0.92] text-[42px] sm:text-[56px] lg:text-[60px] text-white">
            One Canvas.<br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Unlimited<br />Autonomy.</span>
          </motion.h1>
          <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.16 }} className="mt-4 text-[15px] leading-relaxed text-white/60 max-w-[640px] mx-auto">
            Sovereign desktop OS — <span className="text-white font-medium">Gmail, Drive, Binance, Browser agents</span> + <span className="text-violet-300 font-semibold">Movie Swarm</span> — premium dark, 21st.dev animated, Vanta net.
          </motion.p>
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }} className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={handleDownload} className="h-[48px] px-7 rounded-2xl bg-white text-black font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-stone-100 shadow-[0_16px_40px_rgba(255,255,255,0.14)] active:scale-[0.98] transition cursor-pointer">
              <Download className="w-4 h-4" /> Download Desktop App <ArrowRight className="w-4 h-4" />
            </button>
            <a href="#premium" className="h-[48px] px-7 rounded-2xl bg-white/5 backdrop-blur border border-white/10 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-white/10 transition">
              <Eye className="w-4 h-4 text-violet-300" /> Explore Premium UI
            </a>
          </motion.div>
          <div className="mt-7 flex flex-wrap gap-2 justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur text-xs text-white/70"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {telemetry.status}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur text-xs text-white/60"><Cpu className="w-3 h-3" /> {telemetry.cpu}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur text-xs text-white/60"><Layers className="w-3 h-3" /> {telemetry.mem}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold"><Film className="w-3.5 h-3.5" /> 21st.dev Premium</span>
          </div>
        </div>
      </motion.section>

      {/* Premium preview — dark glass, 21st.dev */}
      <section id="premium" className="max-w-[1180px] mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="tilt-premium relative rounded-[28px] border border-white/10 bg-[#0a0a0f]/60 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden will-change-transform" style={{ transformStyle:'preserve-3d' } as any}>
          <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ background:'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 18%)' }} />
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
            <div className="flex items-center gap-2"><span className="flex gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500/90" /><span className="w-3 h-3 rounded-full bg-yellow-500/90" /><span className="w-3 h-3 rounded-full bg-green-500/90" /></span><span className="text-xs font-mono text-white/40 ml-2 hidden sm:inline">Premium UI — 21st.dev • Vanta + Zdog + Tilt + Motion</span></div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white text-black font-bold">PREMIUM DARK</span>
          </div>
          <div className="p-6 grid md:grid-cols-3 gap-4 bg-[#050508]">
            {[
              { t:'SCENES 10s × N', d:'Every 10 seconds a new scene, auto-sliced', c:'from-violet-600 to-indigo-600' },
              { t:'VARIANTS 4 / scene', d:'Cinematic • Anime • Real • Doc — you pick 1', c:'from-cyan-500 to-blue-600' },
              { t:'SYNC ✓ AUTO', d:'Editor stitches with beat-sync & crossfade', c:'from-amber-500 to-orange-600' },
            ].map((x,i)=>(
              <div key={x.t} className="tilt-premium rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-4 will-change-transform" style={{ transform:'translateZ(24px)' } as any}>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${x.c} grid place-items-center text-white mb-3`}><Sparkles className="w-4 h-4" /></div>
                <div className="text-sm font-black text-white tracking-tight">{x.t}</div>
                <div className="text-xs text-white/50 mt-1">{x.d}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features — premium dark bento */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <span className="text-xs font-mono tracking-[0.16em] text-violet-300 font-bold">PREMIUM DARK • 21ST.DEV • FROM SCRATCH</span>
          <h2 className="mt-2 font-serif font-bold text-3xl sm:text-4xl text-white">Sovereign. Animated. Premium.</h2>
          <p className="text-sm text-white/50 mt-2">Every card tilts, glows, and responds — 60fps, fully premium.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Mail, title:'Gmail & Drive Live', desc:'OAuth RO — 8 emails, docs search, premium glass', grad:'from-violet-600 to-fuchsia-600' },
            { icon: TrendingUp, title:'Binance Real-Time', desc:'Klines + RSI/EMA/BB — live WebSocket, glow', grad:'from-emerald-600 to-teal-600' },
            { icon: Film, title:'Movie Swarm', desc:'Script → 10s ×4 → pick → Editor syncs — bird card', grad:'from-cyan-600 to-blue-600' },
          ].map((f,i)=>(
            <motion.div key={f.title} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }} className="tilt-premium group rounded-[22px] bg-white/[0.04] backdrop-blur-xl border border-white/10 p-6 hover:bg-white/[0.06] hover:border-white/15 transition will-change-transform" style={{ transformStyle:'preserve-3d' } as any}>
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${f.grad} grid place-items-center text-white shadow-lg mb-4`} style={{ transform:'translateZ(28px)' } as any}><f.icon className="w-5 h-5" /></div>
              <h3 className="font-bold text-white" style={{ transform:'translateZ(18px)' } as any}>{f.title}</h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">{f.desc}</p>
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/30 group-hover:text-white/60 transition"><span>Premium UI</span><ChevronRight className="w-3.5 h-3.5" /></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Install — 100% Cloud Connected Native App */}
      <section id="install" className="max-w-[980px] mx-auto px-4 sm:px-6 pb-10">
        <div className="rounded-[24px] bg-white text-stone-900 p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.28)] border border-stone-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-xl flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /> Either AI Windows Desktop App</h3>
              <p className="text-sm text-stone-600 mt-1">Runs 100% on our Sovereign Cloud Servers. Zero terminal or local server commands required.</p>
              <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-stone-500"><span>100% Cloud Connected</span><span>•</span><span>Windows 10/11 x64</span><span>•</span><span className="text-emerald-600 font-bold">✓ Ready to Use</span></div>
            </div>
            <button onClick={handleDownload} className="px-7 py-3.5 rounded-2xl bg-stone-900 text-white font-bold text-sm inline-flex items-center gap-2 hover:bg-black shadow-xl cursor-pointer shrink-0">
              <Download className="w-4 h-4" /> Download 1-Click Launcher
            </button>
          </div>
          <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-600 overflow-x-auto">
            <Terminal className="w-3.5 h-3.5 shrink-0 text-violet-600" /><span className="truncate">{ps}</span>
            <button onClick={()=> copy(ps,'ps2')} className="ml-auto px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs flex items-center gap-1.5 shrink-0 cursor-pointer">{copied==='ps2'?<Check className="w-3.5 h-3.5 text-emerald-500" />:<Copy className="w-3.5 h-3.5" />}<span className="hidden sm:inline">{copied==='ps2'?'Copied':'Copy Command'}</span></button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#050508]/50 backdrop-blur py-6 text-center text-xs text-white/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"><EitherLogo className="w-4 h-4" /> Either AI • Premium Dark • Bird Card • 21st.dev • Vanta • Zdog</div>
        <div className="mt-2">© 2026 Sovereign Desktop — Premium UI built from scratch around your bird.</div>
      </footer>
    </div>
  );
};
