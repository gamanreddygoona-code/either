import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Unlock, Users, Search, RefreshCw, Eye, AlertTriangle } from "lucide-react";

export const AdminDashboardView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const j = await res.json();
      if (j.success) setUsers(j.users || []);
    } catch {}
    setLoading(false);
  };
  useEffect(()=>{ fetchUsers(); },[]);

  const toggleLock = async (user:any) => {
    const action = user.darkWebUnlocked ? "lock" : "unlock";
    if (!confirm(`${action === "unlock" ? "Unlock" : "Lock"} deep dark web research for ${user.email}? ${action==="unlock"?"They will be able to do deep .onion research.":"They will be limited to shallow clearnet."}`)) return;
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/${action}`, { method:"POST" });
      const j = await res.json();
      if (j.success) fetchUsers();
    } catch {}
  };

  const filtered = users.filter(u=> !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 h-full bg-[#faf8f5] overflow-y-auto p-4 sm:p-6 space-y-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white grid place-items-center"><ShieldCheck className="w-5 h-5" /></div>
          <div className="flex-1">
            <h2 className="text-base font-bold font-serif text-stone-900">Admin Dashboard — Users & Deep Research</h2>
            <p className="text-xs text-stone-600">Every user • Lock/Unlock deep dark web research • AI gives details after research • All deep queries logged</p>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-1 rounded-full bg-stone-900 text-white">ADMIN</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-amber-900 leading-relaxed">
            <b>Deep dark web</b> = real .onion fetch via Tor + Gemini + Google Search. <b>Locked</b> by default — user gets <code className="bg-white px-1 rounded">403 Deep research locked</code>. Admin unlock → user can do deep research, AI returns <b>details + table + mitigation</b> and is audited.
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
            <input value={query} onChange={e=> setQuery(e.target.value)} placeholder="Search users by name or email..." className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none focus:border-stone-400" />
          </div>
          <button onClick={fetchUsers} className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-stone-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">Every User</h3>
            <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600">{filtered.length} total • {filtered.filter(u=>u.darkWebUnlocked).length} unlocked</span>
          </div>
          <div className="divide-y divide-stone-100 max-h-[520px] overflow-y-auto">
            {loading ? <div className="p-8 text-center text-sm text-stone-500">Loading users…</div> : filtered.length===0 ? <div className="p-8 text-center text-sm text-stone-500">No users match "{query}"</div> : filtered.map(u=>(
              <div key={u.id} className="p-3 flex gap-3 items-center hover:bg-stone-50">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 grid place-items-center text-white text-xs font-bold shrink-0 overflow-hidden">
                  {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-stone-900 truncate flex items-center gap-1.5">{u.name} <span className={`w-1.5 h-1.5 rounded-full ${u.darkWebUnlocked?"bg-emerald-500":"bg-stone-300"}`} /> <span className="text-[10px] font-normal text-stone-500">{u.plan}</span></div>
                  <div className="text-[11px] text-stone-500 truncate">{u.email} • tokens {u.tokenUsage?.used?.toLocaleString() || 0}/{u.tokenUsage?.limit?.toLocaleString() || "100k"} • {u.isAuthenticated?"auth":"guest"}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-bold border ${u.darkWebUnlocked?"bg-emerald-50 border-emerald-200 text-emerald-800":"bg-stone-100 border-stone-200 text-stone-600"}`}>{u.darkWebUnlocked?"Unlocked • Deep":"Locked • Shallow"}</span>
                </div>
                <button
                  onClick={()=> toggleLock(u)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${u.darkWebUnlocked?"bg-white border-stone-200 text-stone-700 hover:bg-stone-50":"bg-stone-900 text-white border-stone-900 hover:bg-black"}`}
                  title={u.darkWebUnlocked?"Click to lock deep research":"Click to unlock deep research"}
                >
                  {u.darkWebUnlocked ? <><Lock className="w-3.5 h-3.5" /> Lock</> : <><Unlock className="w-3.5 h-3.5" /> Unlock</>}
                </button>
                <a href="#" onClick={e=>{ e.preventDefault(); alert(`Details for ${u.email}:\nPlan: ${u.plan}\nTokens: ${u.tokenUsage?.used||0}/${u.tokenUsage?.limit||100000}\nDark Web: ${u.darkWebUnlocked?"Unlocked":"Locked"}\n\nAfter dark web research, AI gives details + table + mitigation and is logged.`); }} className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-600"><Eye className="w-3.5 h-3.5" /></a>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 bg-[#fafaf9] border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
            <span>Click Unlock → user can do deep .onion research. Locked → shallow clearnet only, 403 on deep.</span>
            <span className="hidden sm:inline font-mono">Either Core • Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
