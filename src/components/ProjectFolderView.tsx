import React, { useState } from "react";
import { Folder, FileText, Plus, MessageSquare, Trash2, Edit3, Sparkles } from "lucide-react";
import { ProjectItem } from "../types";

interface ProjectFolderViewProps {
  projects: ProjectItem[];
  onOpenDoc: (docName: string) => void;
}

export const ProjectFolderView: React.FC<ProjectFolderViewProps> = ({
  projects,
  onOpenDoc,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("proj-ai");
  const activeProj = projects.find((p) => p.id === selectedFolder) || projects[0];

  return (
    <div className="flex-1 flex flex-col h-full max-w-5xl mx-auto w-full p-6 space-y-6 overflow-y-auto animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#ded7c8] pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900 font-serif flex items-center space-x-2">
            <Folder className="w-5 h-5 text-stone-700" />
            <span>Workspace Project: {activeProj.name}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage project context, attached documents, prompt instructions, and datasets.
          </p>
        </div>

        <button
          onClick={() => onOpenDoc("New Project Note")}
          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add File</span>
        </button>
      </div>

      {/* Files List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeProj.children?.map((item) => (
          <div
            key={item.id}
            onClick={() => onOpenDoc(item.name)}
            className="p-4 bg-white border border-[#ded7c8] hover:border-stone-400 rounded-xl space-y-2 cursor-pointer transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#faf8f5] border border-[#ded7c8] flex items-center justify-center text-stone-700">
                {item.type === "doc" ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
              </div>
              <span className="text-[10px] text-stone-400">{item.updatedAt}</span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-stone-900 group-hover:text-stone-950 truncate">
                {item.name}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Attached to Either context engine
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
