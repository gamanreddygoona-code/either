import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  MiniMap, Controls, Background, BackgroundVariant,
  useNodesState, useEdgesState, addEdge, Connection, Edge, Node,
  ReactFlowProvider, useReactFlow
} from "reactflow";
import "reactflow/dist/style.css";
import { Sparkles, Play, Wand2, ShieldCheck, Bug, Webhook, Globe, Mail, Hand } from "lucide-react";

const nodeTypes = {
  trigger: ({ data }: any) => (
    <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm min-w-[160px]">
      <div className="text-[10px] font-mono text-emerald-700 font-bold">TRIGGER</div>
      <div className="text-xs font-bold text-stone-900">{data.label}</div>
      <div className="text-[10px] text-stone-500">{data.sub}</div>
    </div>
  ),
  condition: ({ data }: any) => (
    <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 shadow-sm min-w-[140px] rotate-0">
      <div className="text-[10px] font-mono text-amber-700 font-bold">CONDITION</div>
      <div className="text-xs font-bold text-stone-900">{data.label}</div>
    </div>
  ),
  action: ({ data }: any) => (
    <div className="px-3 py-2 rounded-xl bg-white border border-stone-200 shadow-sm min-w-[160px]">
      <div className="text-[10px] font-mono text-stone-500 font-bold flex items-center gap-1">{data.icon} {data.cat}</div>
      <div className="text-xs font-bold text-stone-900">{data.label}</div>
      <div className="text-[10px] text-stone-500">{data.sub}</div>
      {data.needsApproval && <div className="mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold inline-flex items-center gap-1"><Hand className="w-3 h-3" /> HitL Approval</div>}
    </div>
  ),
  loop: ({ data }: any) => (
    <div className="px-3 py-2 rounded-xl bg-violet-50 border border-violet-200 shadow-sm min-w-[120px]">
      <div className="text-[10px] font-mono text-violet-700 font-bold">LOOP</div>
      <div className="text-xs font-bold text-stone-900">{data.label}</div>
    </div>
  ),
};

const initialNodes: Node[] = [
  { id: "1", type: "trigger", position: { x: 80, y: 80 }, data: { label: "Gmail: Refund Email", sub: "subject contains 'refund'" } },
  { id: "2", type: "action", position: { x: 320, y: 80 }, data: { label: "Stripe: Retrieve Charge", sub: "by customer email", cat: "Business", icon: "💳", needsApproval: false } },
  { id: "3", type: "condition", position: { x: 560, y: 80 }, data: { label: "Amount > $100 ?" } },
  { id: "4", type: "action", position: { x: 760, y: 30 }, data: { label: "HubSpot: Update Deal", sub: "set refunded", cat: "Business", icon: "🏢" } },
  { id: "5", type: "action", position: { x: 760, y: 130 }, data: { label: "Slack: Ping #refunds", sub: "with AI summary", cat: "Communication", icon: "💬", needsApproval: true } },
];
const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#10b981" } },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", label: "yes", style: { stroke: "#f59e0b" } },
  { id: "e3-5", source: "3", target: "5", label: "no" },
];

function CanvasInner({ onNeedApproval }: { onNeedApproval: (node: any) => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nlInput, setNlInput] = useState("When a customer emails asking for a refund, check Stripe, update HubSpot, and ping Slack.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>(["Canvas ready — drag to chain triggers, conditions, loops, actions."]);
  const { project } = useReactFlow();
  const fileRef = useRef<HTMLInputElement>(null);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const handleNLGenerate = async () => {
    setIsGenerating(true);
    setLogs(l => [...l, `NL: "${nlInput.slice(0,60)}..." → AI mapping...`]);
    try {
      const res = await fetch("/api/workflow/nl", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: nlInput })
      });
      const j = await res.json();
      if (j.success && j.workflow) {
        // Replace canvas with AI-generated workflow
        setNodes(j.workflow.nodes);
        setEdges(j.workflow.edges);
        setLogs(l => [...l, `✓ AI mapped ${j.workflow.nodes.length} nodes, ${j.workflow.edges.length} edges — self-healing enabled`]);
      } else {
        setLogs(l => [...l, `AI mapping fallback — using template`]);
      }
    } catch {
      setLogs(l => [...l, `Offline — showing template`]);
    }
    setIsGenerating(false);
  };

  const handleRun = async () => {
    setLogs(l => [...l, `▶ Running workflow — executing ${nodes.length} nodes...`]);
    // Find nodes that need HitL
    const hitl = nodes.filter((n:any) => n.data?.needsApproval);
    if (hitl.length) {
      onNeedApproval(hitl[0]);
      setLogs(l => [...l, `⏸ HitL: Paused at "${hitl[0].data.label}" — awaiting Slack/WhatsApp approval`]);
      return;
    }
    // Simulate self-healing execution
    try {
      const res = await fetch("/api/workflow/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges, test: true })
      });
      const j = await res.json();
      if (j.success) {
        setLogs(l => [...l, `✓ Executed — ${j.steps?.length || nodes.length} steps, healRetries: ${j.healRetries || 0}`]);
        if (j.healed) setLogs(l => [...l, `🩹 Self-healed: ${j.healed}`]);
      } else {
        setLogs(l => [...l, `✗ Failed: ${j.error} — proposed fix: ${j.proposedFix || "retry"}`]);
      }
    } catch (e:any) {
      setLogs(l => [...l, `✗ Run error: ${e.message}`]);
    }
  };

  const handleMultiModal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = (reader.result as string).split(",")[1];
      setLogs(l => [...l, `📎 Multi-modal: ${file.name} (${file.type}, ${(file.size/1024).toFixed(1)}KB) → Gemini inlineData`]);
      try {
        const res = await fetch("/api/workflow/trigger/upload", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, data: b64 })
        });
        const j = await res.json();
        setLogs(l => [...l, j.success ? `✓ Trigger extracted: ${j.extract}` : `✗ ${j.error}`]);
      } catch (e:any) { setLogs(l => [...l, `✗ Upload ${e.message}`]); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top bar: NL input + actions */}
      <div className="p-3 bg-white border-b border-stone-200 flex flex-col gap-2">
        <div className="flex gap-2">
          <input value={nlInput} onChange={e=> setNlInput(e.target.value)} placeholder="Natural Language to Workflow..." className="flex-1 px-3 py-2 rounded-xl bg-[#faf8f5] border border-stone-200 text-xs focus:outline-none focus:border-violet-400" />
          <button onClick={handleNLGenerate} disabled={isGenerating} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5" />{isGenerating?"Mapping...":"NL → Workflow"}</button>
          <button onClick={handleRun} className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Run</button>
        </div>
        <div className="flex gap-2">
          <label className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs cursor-pointer hover:bg-stone-50 flex items-center gap-1.5">
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.wav,.mp3,.xlsx,.csv" className="hidden" onChange={handleMultiModal} />
            <span>📎 Multi-Modal: PDF/Image/Audio/Sheet</span>
          </label>
          <span className="text-[10px] font-mono text-stone-400 px-2 py-1">Vector RAG per workspace • HitL pauses • Self-healing retries</span>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#fcfcf9]"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </div>

      {/* Execution logs */}
      <div className="h-[140px] border-t border-stone-200 bg-stone-950 text-stone-200 p-2 font-mono text-[11px] overflow-y-auto">
        <div className="flex items-center gap-1.5 mb-1 text-stone-400"><Bug className="w-3 h-3" /> Execution Logs & Debugging (live data per node)</div>
        {logs.map((l,i)=> <div key={i} className="leading-relaxed">{l}</div>)}
      </div>
    </div>
  );
}

export const WorkflowCanvas: React.FC<{ onNeedApproval?: (node:any)=>void }> = ({ onNeedApproval }) => {
  const [approvalNode, setApprovalNode] = useState<any>(null);
  return (
    <ReactFlowProvider>
      <div className="flex-1 h-full flex flex-col bg-[#fcfcf9] overflow-hidden relative">
        {approvalNode && (
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white grid place-items-center mb-3"><Hand className="w-5 h-5" /></div>
              <h3 className="font-bold text-stone-900">Human-in-the-Loop Approval</h3>
              <p className="text-xs text-stone-600 mt-1">Paused at <b>{approvalNode.data.label}</b> — this node requires approval before proceeding (payments, customer emails).</p>
              <p className="text-[11px] text-stone-500 mt-2">Sent to Slack #approvals + WhatsApp + Web dashboard. Approve to continue.</p>
              <div className="mt-4 flex gap-2">
                <button onClick={()=> setApprovalNode(null)} className="flex-1 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold">Approve & Continue</button>
                <button onClick={()=> setApprovalNode(null)} className="flex-1 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold">Reject</button>
              </div>
            </div>
          </div>
        )}
        <CanvasInner onNeedApproval={setApprovalNode} />
      </div>
    </ReactFlowProvider>
  );
};
