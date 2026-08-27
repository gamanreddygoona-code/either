import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Brain, 
  Plus, 
  X, 
  RotateCw, 
  Check, 
  Trash2, 
  Bot, 
  Wrench, 
  Database,
  Code,
  ShieldCheck
} from "lucide-react";
import { CustomSkill, PersistentMemory } from "../types";

interface SkillsMemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill?: (skill: CustomSkill) => void;
}

export const SkillsMemoryDrawer: React.FC<SkillsMemoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSkill,
}) => {
  const [activeTab, setActiveTab] = useState<"skills" | "memory">("skills");
  const [skills, setSkills] = useState<CustomSkill[]>([]);
  const [memories, setMemories] = useState<PersistentMemory[]>([]);
  const [loading, setLoading] = useState(false);

  // New Skill Form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDescription, setNewSkillDescription] = useState("");
  const [newSkillTrigger, setNewSkillTrigger] = useState("");
  const [newSkillInstructions, setNewSkillInstructions] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);

  // New Memory Form
  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [newMemoryValue, setNewMemoryValue] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState<any>("project_context");
  const [showAddMemory, setShowAddMemory] = useState(false);

  const fetchData = async () => {
    try {
      const [skillsRes, memRes] = await Promise.all([
        fetch("/api/skills"),
        fetch("/api/memory"),
      ]);
      const skillsData = await skillsRes.json();
      const memData = await memRes.json();

      if (skillsData.skills) setSkills(skillsData.skills);
      if (memData.memories) setMemories(memData.memories);
    } catch (err) {
      console.warn("Failed to fetch skills/memories:", err);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName) return;

    try {
      const res = await fetch("/api/skills/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkillName,
          description: newSkillDescription,
          triggerPattern: newSkillTrigger,
          instructions: newSkillInstructions,
          toolsRequired: ["Gemini 3.7", "Live Connectors"],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSkills([data.skill, ...skills]);
        setShowAddSkill(false);
        setNewSkillName("");
        setNewSkillDescription("");
        setNewSkillTrigger("");
        setNewSkillInstructions("");
      }
    } catch (err) {
      console.error("Create skill failed:", err);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey || !newMemoryValue) return;

    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newMemoryKey,
          value: newMemoryValue,
          category: newMemoryCategory,
          importance: "high",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMemories([data.memory, ...memories.filter(m => m.key !== newMemoryKey)]);
        setShowAddMemory(false);
        setNewMemoryKey("");
        setNewMemoryValue("");
      }
    } catch (err) {
      console.error("Create memory failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex justify-end animate-fadeIn select-text">
      <div className="w-full max-w-xl bg-[#faf8f5] border-l border-[#ded7c8] h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#ded7c8] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <Brain className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif">
                Dynamic Skills & Permanent Memory Bank
              </h3>
              <p className="text-xs text-stone-500">
                Self-synthesized AI agent capabilities and persistent context retained across sessions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#ded7c8] bg-[#f5f1e8] px-5 pt-2">
          <button
            onClick={() => setActiveTab("skills")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === "skills"
                ? "border-purple-600 text-purple-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Skills & Sub-Agents ({skills.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("memory")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === "memory"
                ? "border-purple-600 text-purple-900"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Permanent Context Memory ({memories.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "skills" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600 font-medium">
                  Dynamic skills auto-synthesized by Either or custom defined.
                </span>
                <button
                  onClick={() => setShowAddSkill(!showAddSkill)}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Skill</span>
                </button>
              </div>

              {/* Add Skill Card Form */}
              {showAddSkill && (
                <form onSubmit={handleCreateSkill} className="bg-white border border-purple-200 rounded-xl p-4 space-y-3 shadow-sm animate-fadeIn">
                  <h4 className="text-xs font-bold text-purple-950">Synthesize New AI Agent Skill</h4>
                  <input
                    type="text"
                    required
                    placeholder="Skill Name (e.g. Discord Announcement Monitor)"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#ded7c8] rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Description & Goal"
                    value={newSkillDescription}
                    onChange={(e) => setNewSkillDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#ded7c8] rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Trigger Keywords (e.g. discord|announcement|news)"
                    value={newSkillTrigger}
                    onChange={(e) => setNewSkillTrigger(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#ded7c8] rounded-lg text-xs font-mono"
                  />
                  <textarea
                    rows={2}
                    placeholder="Instructions for the agent..."
                    value={newSkillInstructions}
                    onChange={(e) => setNewSkillInstructions(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#ded7c8] rounded-lg text-xs"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSkill(false)}
                      className="px-3 py-1 bg-stone-200 text-stone-700 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-purple-700 text-white text-xs font-semibold rounded-lg hover:bg-purple-800"
                    >
                      Save Skill
                    </button>
                  </div>
                </form>
              )}

              {/* Skills List */}
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="bg-white border border-[#ded7c8] rounded-xl p-4 space-y-2 hover:border-purple-300 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-bold text-stone-900">{skill.name}</h4>
                    </div>
                    {skill.isAiGenerated && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold rounded-full">
                        AI-Generated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{skill.description}</p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span>Trigger: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">{skill.triggerPattern}</code></span>
                    <span>Tools: {skill.toolsRequired.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600 font-medium">
                  Permanent facts & rules preserved across all chat conversations.
                </span>
                <button
                  onClick={() => setShowAddMemory(!showAddMemory)}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Memory</span>
                </button>
              </div>

              {/* Add Memory Form */}
              {showAddMemory && (
                <form onSubmit={handleCreateMemory} className="bg-white border border-purple-200 rounded-xl p-4 space-y-3 shadow-sm animate-fadeIn">
                  <h4 className="text-xs font-bold text-purple-950">Add Permanent Memory Key</h4>
                  <input
                    type="text"
                    required
                    placeholder="Memory Key (e.g. preferred_deployment_port)"
                    value={newMemoryKey}
                    onChange={(e) => setNewMemoryKey(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#ded7c8] rounded-lg text-xs font-mono"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="Context value to remember permanently..."
                    value={newMemoryValue}
                    onChange={(e) => setNewMemoryValue(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#ded7c8] rounded-lg text-xs"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemory(false)}
                      className="px-3 py-1 bg-stone-200 text-stone-700 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-purple-700 text-white text-xs font-semibold rounded-lg hover:bg-purple-800"
                    >
                      Store in Context
                    </button>
                  </div>
                </form>
              )}

              {/* Memories List */}
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-white border border-[#ded7c8] rounded-xl p-4 space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {mem.key}
                    </span>
                    <span className="text-[10px] text-stone-400">{mem.lastAccessed}</span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed font-sans">{mem.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};