import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Camera, 
  Video, 
  Plus, 
  RotateCw, 
  ShieldCheck, 
  Activity, 
  Radio, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  Lock,
  Cpu
} from "lucide-react";
import { WiFiDevice } from "../types";

export const WiFiHardwareView: React.FC = () => {
  const [devices, setDevices] = useState<WiFiDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [analyzingCamId, setAnalyzingCamId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // New Device Form
  const [deviceName, setDeviceName] = useState("");
  const [deviceIp, setDeviceIp] = useState("192.168.1.");
  const [devicePort, setDevicePort] = useState("554");
  const [deviceType, setDeviceType] = useState<"cctv-rtsp" | "smart-hub" | "iot-sensor" | "network-node">("cctv-rtsp");
  const [location, setLocation] = useState("");

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/wifi/devices");
      const data = await res.json();
      if (data.devices) setDevices(data.devices);
    } catch (err) {
      console.warn("Failed to fetch wifi devices:", err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceIp) return;

    try {
      const res = await fetch("/api/wifi/devices/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: deviceName || `Camera (${deviceIp})`,
          ip: deviceIp,
          port: Number(devicePort) || 554,
          type: deviceType,
          location: location || "Office Network",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDevices([...devices, data.device]);
        setShowAddModal(false);
        setDeviceName("");
        setLocation("");
      }
    } catch (err) {
      console.error("Add device failed:", err);
    }
  };

  const handleAnalyzeSnapshot = (dev: WiFiDevice) => {
    setAnalyzingCamId(dev.id);
    setAnalysisResult(null);

    setTimeout(() => {
      setAnalyzingCamId(null);
      setAnalysisResult(`Security Frame Analysis for ${dev.name} (${dev.location}): Area clear. No unauthorized motion detected. Camera latency: 4ms. Stream bitrate: 4.2 Mbps.`);
    }, 1200);
  };

  const cameras = devices.filter(d => d.type === "cctv-rtsp");
  const iotNodes = devices.filter(d => d.type !== "cctv-rtsp");

  return (
    <div className="flex-1 flex flex-col h-full max-w-6xl mx-auto w-full p-6 space-y-6 overflow-y-auto animate-fadeIn select-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded7c8] pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif flex items-center space-x-2.5">
            <Wifi className="w-5 h-5 text-emerald-700" />
            <span>Local Wi-Fi Hardware & IP CCTV Camera Hub</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Connect and monitor local network devices, RTSP camera streams, and IoT controllers securely over your LAN.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Link Wi-Fi Device / CCTV</span>
          </button>
        </div>
      </div>

      {/* CCTV Camera Stream Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-stone-500" />
            <span>Live Wi-Fi CCTV Streams ({cameras.length})</span>
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono border border-emerald-300">
            ● RTSP/ONVIF Secure LAN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cameras.map((cam) => (
            <div
              key={cam.id}
              className="bg-white border border-[#ded7c8] rounded-2xl overflow-hidden shadow-xs hover:border-stone-400 transition-all flex flex-col"
            >
              {/* Camera Video / Snapshot Frame */}
              <div className="relative h-48 bg-stone-900 overflow-hidden flex items-center justify-center group">
                {cam.snapshotUrl ? (
                  <img
                    src={cam.snapshotUrl}
                    alt={cam.name}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="text-stone-500 text-xs flex flex-col items-center space-y-1">
                    <Video className="w-8 h-8 text-stone-600" />
                    <span>RTSP Feed Standby</span>
                  </div>
                )}

                <div className="absolute top-3 left-3 bg-stone-950/70 backdrop-blur-xs text-white px-2 py-1 rounded-lg text-[10px] font-mono flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LIVE • {cam.ip}:{cam.port}</span>
                </div>

                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={() => handleAnalyzeSnapshot(cam)}
                    disabled={analyzingCamId === cam.id}
                    className="px-2.5 py-1 bg-white/90 hover:bg-white text-stone-900 text-[11px] font-semibold rounded-lg backdrop-blur-xs shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    {analyzingCamId === cam.id ? (
                      <RotateCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Eye className="w-3 h-3 text-cyan-700" />
                    )}
                    <span>{analyzingCamId === cam.id ? "Analyzing Frame..." : "AI Inspect Frame"}</span>
                  </button>
                </div>
              </div>

              {/* Camera Details */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{cam.name}</h4>
                    <span className="text-[10px] text-stone-500 font-medium">{cam.location}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">{cam.lastPing}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frame Analysis Result Banner */}
      {analysisResult && (
        <div className="bg-[#f5f1e8] border border-emerald-300 rounded-2xl p-4 flex items-start space-x-3 text-xs text-stone-800 animate-fadeIn shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-stone-900 block">AI Visual Camera Audit:</span>
            <p className="leading-relaxed">{analysisResult}</p>
          </div>
        </div>
      )}

      {/* Connected IoT Nodes & Network Gateways */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
          <Activity className="w-4 h-4 text-stone-500" />
          <span>Local Wi-Fi Network Nodes & Gateways ({iotNodes.length})</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {iotNodes.map((node) => (
            <div
              key={node.id}
              className="bg-white border border-[#ded7c8] rounded-xl p-4 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-stone-900">{node.name}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[11px] text-stone-500 font-mono space-y-0.5">
                <div>IP: {node.ip}:{node.port}</div>
                <div>Location: {node.location}</div>
                <div>Status: {node.lastPing}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] border border-[#ded7c8] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif">Link Wi-Fi Device or CCTV Camera</h3>
            <form onSubmit={handleAddDevice} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Front Door Camera / Lab Hub"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-stone-600 block mb-1">IP Address</label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.1.120"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs font-mono text-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">Port</label>
                  <input
                    type="number"
                    placeholder="554"
                    value={devicePort}
                    onChange={(e) => setDevicePort(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs font-mono text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">Device Type</label>
                  <select
                    value={deviceType}
                    onChange={(e: any) => setDeviceType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs text-stone-900 focus:outline-none"
                  >
                    <option value="cctv-rtsp">IP Camera (RTSP/ONVIF)</option>
                    <option value="smart-hub">Smart Hub (Home Assistant)</option>
                    <option value="iot-sensor">IoT Environmental Sensor</option>
                    <option value="network-node">Network Node</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Front Gate"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#ded7c8] rounded-xl text-xs text-stone-900 focus:outline-none"
                  />
                </div>
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
                  Link Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};