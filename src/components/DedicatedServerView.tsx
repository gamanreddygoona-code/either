import React, { useState, useEffect } from "react";
import { 
  Server, 
  Wifi, 
  Cloud, 
  Plus, 
  RotateCw, 
  CheckCircle2, 
  Activity, 
  Terminal, 
  ShieldCheck, 
  ExternalLink, 
  Play, 
  Folder, 
  Clock, 
  Cpu, 
  HardDrive,
  Check,
  AlertTriangle
} from "lucide-react";
import { DedicatedServer, DaemonLogEntry } from "../types";

interface DedicatedServerViewProps {
  onOpenFolderDeploy?: (server: DedicatedServer) => void;
}

export const DedicatedServerView: React.FC<DedicatedServerViewProps> = () => {
  const [servers, setServers] = useState<DedicatedServer[]>([]);
  const [logs, setLogs] = useState<DaemonLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  // New Server Form State
  const [newServerName, setNewServerName] = useState("");
  const [newServerHost, setNewServerHost] = useState("");
  const [newServerPort, setNewServerPort] = useState("8080");
  const [newServerType, setNewServerType] = useState<"local-wifi" | "vps-cloud" | "docker-daemon">("local-wifi");

  // Fetch server fleet and daemon logs
  const fetchData = async () => {
    try {
      const [serversRes, logsRes] = await Promise.all([
        fetch("/api/servers"),
        fetch("/api/daemon/logs"),
      ]);
      const serversData = await serversRes.json();
      const logsData = await logsRes.json();

      if (serversData.servers) setServers(serversData.servers);
      if (logsData.logs) setLogs(logsData.logs);
    } catch (err) {
      console.warn("Failed to fetch server data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerHost) return;

    try {
      const res = await fetch("/api/servers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newServerName || `Server (${newServerHost})`,
          host: newServerHost,
          port: Number(newServerPort) || 8080,
          type: newServerType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setServers([...servers, data.server]);
        setShowAddModal(false);
        setNewServerName("");
        setNewServerHost("");
      }
    } catch (err) {
      console.error("Add server failed:", err);
    }
  };

  const handleQuickDeploy = async (server: DedicatedServer) => {
    setDeployingId(server.id);
    try {
      const res = await fetch("/api/servers/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverId: server.id,
          folderPath: "C:/Users/gaman/antigravity/Either-AI-Workspace",
          port: server.port,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error("Deploy failed:", err);
    } finally {
      setTimeout(() => setDeployingId(null), 1000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-6xl mx-auto w-full p-6 space-y-6 overflow-y-auto animate-fadeIn select-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded7c8] pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif flex items-center space-x-2.5">
            <Server className="w-5 h-5 text-emerald-700" />
            <span>Local Hosting & Live Telemetry</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real CPU, memory, and uptime from this machine. Background execution while powered off is not available.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Server / Node</span>
          </button>
        </div>
      </div>

      {/* Server Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {servers.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-[#ded7c8] hover:border-stone-400 rounded-2xl p-5 space-y-4 shadow-xs transition-all"
          >
            {/* Server Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#f5f1e8] border border-[#ded7c8] flex items-center justify-center text-stone-800">
                  {srv.type === "local-wifi" ? (
                    <Wifi className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Cloud className="w-5 h-5 text-cyan-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{srv.name}</h4>
                  <div className="flex items-center space-x-2 text-[11px] text-stone-500 font-mono">
                    <span>{srv.host}:{srv.port}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Uptime: {srv.uptime}</span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full uppercase flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{srv.status}</span>
              </span>
            </div>

            {/* Performance Gauges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#faf8f5] p-2.5 rounded-xl border border-[#ebe5da] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                  <span className="flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-stone-400" />
                    <span>CPU Usage</span>
                  </span>
                  <span>{srv.cpuUsage}%</span>
                </div>
                <div className="w-full bg-[#e8e2d4] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${srv.cpuUsage}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-[#faf8f5] p-2.5 rounded-xl border border-[#ebe5da] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                  <span className="flex items-center space-x-1">
                    <HardDrive className="w-3 h-3 text-stone-400" />
                    <span>Memory Usage</span>
                  </span>
                  <span>{srv.memoryUsage}%</span>
                </div>
                <div className="w-full bg-[#e8e2d4] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all"
                    style={{ width: `${srv.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Active Deployments */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-stone-600 block uppercase tracking-wider">
                Active Deployed Services ({srv.activeDeployments.length})
              </span>
              {srv.activeDeployments.map((dep, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-[#f7f4ec] px-3 py-2 rounded-xl text-xs border border-[#ded7c8]"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Folder className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="font-semibold text-stone-900 truncate">{dep.folderName}</span>
                  </div>
                  <a
                    href={dep.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-stone-600 hover:text-stone-900 text-[11px] font-mono flex items-center space-x-1"
                  >
                    <span>:{dep.targetPort}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            {/* Deploy Action */}
            <div className="pt-2 border-t border-[#f0ebd9] flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-mono">
                Heartbeat: {srv.lastHeartbeat}
              </span>
              <button
                onClick={() => handleQuickDeploy(srv)}
                disabled={deployingId === srv.id}
                className="px-3 py-1.5 bg-[#f0ebd9] hover:bg-[#e6dfcb] text-stone-800 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {deployingId === srv.id ? (
                  <>
                    <RotateCw className="w-3 h-3 animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-emerald-600" />
                    <span>Deploy Current Folder</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live System Activity Log */}
      <div className="bg-white border border-[#ded7c8] rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">
              Live System Activity Log (real events only)
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full border border-emerald-300">
            ● Live telemetry · 60s samples
          </span>
        </div>

        <div className="bg-stone-950 text-stone-200 rounded-xl p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
              <span className="text-stone-500 shrink-0 select-none">[{log.timestamp}]</span>
              <span
                className={`font-semibold shrink-0 ${
                  log.level === "success"
                    ? "text-emerald-400"
                    : log.level === "warn"
                    ? "text-amber-400"
                    : "text-cyan-400"
                }`}
              >
                [{log.agentName}]
              </span>
              <span className="text-stone-300">
                <span className="text-stone-400 font-medium">({log.targetService})</span>: {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Server Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] border border-[#ded7c8] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif">Add Dedicated Host Server</h3>
            <form onSubmit={handleAddServer} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Server Name</label>
                <input
                  type="text"
                  placeholder="e.g. Home Lab Server / Wi-Fi Node"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-stone-600 block mb-1">Host IP / Domain</label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.1.100"
                    value={newServerHost}
                    onChange={(e) => setNewServerHost(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs font-mono text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">Port</label>
                  <input
                    type="number"
                    placeholder="8080"
                    value={newServerPort}
                    onChange={(e) => setNewServerPort(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs font-mono text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Host Type</label>
                <select
                  value={newServerType}
                  onChange={(e: any) => setNewServerType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs text-stone-900 focus:outline-none"
                >
                  <option value="local-wifi">Local Wi-Fi Network Machine</option>
                  <option value="vps-cloud">Remote Dedicated VPS / Cloud</option>
                  <option value="docker-daemon">Docker Host Daemon</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-stone-200 text-stone-700 text-xs font-medium rounded-xl hover:bg-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-stone-800"
                >
                  Register Server
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};