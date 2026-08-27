import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Mic, 
  MicOff, 
  Plus, 
  Share2, 
  FileText,
  RotateCw,
  CheckCircle2
} from "lucide-react";
import { MeetingNote } from "../types";
import { AppIconRenderer } from "./ConnectorIcons";

interface MeetingNotesViewProps {
  notes: MeetingNote[];
  onAddNote: (note: MeetingNote) => void;
  onOpenConnector: (id: string) => void;
}

export const MeetingNotesView: React.FC<MeetingNotesViewProps> = ({
  notes,
  onAddNote,
  onOpenConnector,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState(notes[0]?.id || "");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [localNotes, setLocalNotes] = useState<MeetingNote[]>(notes);

  const currentNote = localNotes.find((n) => n.id === selectedNoteId) || localNotes[0];

  const toggleTask = (noteId: string, taskId: string) => {
    setLocalNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            actionItems: n.actionItems.map((item) =>
              item.id === taskId ? { ...item, completed: !item.completed } : item
            ),
          };
        }
        return n;
      })
    );
  };

  const handleStartLiveNote = () => {
    setIsRecording(true);
    setRecordedText("Live meeting recording in progress... Elena: Discussing the OAuth token expiration bug. Gaman: We'll implement automatic token refresh before dispatching API requests.");
  };

  const handleAnalyzeAndSave = async () => {
    setAnalyzing(true);
    setTimeout(() => {
      const newNote: MeetingNote = {
        id: `meet-${Date.now()}`,
        title: "Ad-hoc Architecture & Token Refresh Sync",
        date: "Today, Just now",
        duration: "15 mins",
        participants: ["gaman sai", "Elena Rostova"],
        appSource: "Google Calendar",
        summary: "Agreed to enforce automatic token refresh on expired Google OAuth and Slack tokens. Linear ticket created for Elena.",
        actionItems: [
          { id: `act-${Date.now()}-1`, task: "Implement token refresh loop in backend server.ts", assignee: "Elena Rostova", completed: false },
          { id: `act-${Date.now()}-2`, task: "Verify Linear sync webhooks", assignee: "gaman sai", completed: true },
        ],
        transcriptSnippet: recordedText,
      };

      setLocalNotes([newNote, ...localNotes]);
      setSelectedNoteId(newNote.id);
      setIsRecording(false);
      setRecordedText("");
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full max-w-5xl mx-auto w-full p-6 animate-fadeIn">
      {/* Left List of Meeting Notes */}
      <div className="w-80 border-r border-[#ded7c8] bg-[#f7f4ec] rounded-l-2xl p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-stone-700" />
              <span>Meeting Notes</span>
            </h2>
            <button
              onClick={handleStartLiveNote}
              className="p-1 text-stone-600 hover:text-stone-900 hover:bg-[#eae4d7] rounded-lg transition-colors text-xs flex items-center space-x-1"
              title="Record Meeting"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {localNotes.map((note) => {
              const isSelected = note.id === currentNote?.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-white border-[#ded7c8] shadow-xs"
                      : "hover:bg-[#eee8dc] border-transparent text-stone-700"
                  }`}
                >
                  <h4 className="text-xs font-bold text-stone-900 truncate">{note.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                    <span>{note.date}</span>
                    <span>{note.duration}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-1">
                    {note.actionItems.filter((a) => a.completed).length}/{note.actionItems.length} action items completed
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Google Calendar Link Banner */}
        <div className="bg-[#f0ebd9] p-3 rounded-xl border border-[#ded7c8] space-y-1.5">
          <div className="flex items-center space-x-2">
            <AppIconRenderer iconName="gcalendar" className="w-4 h-4" />
            <span className="text-xs font-bold text-stone-900">Google Calendar Synced</span>
          </div>
          <p className="text-[11px] text-stone-600">
            Automatically reads scheduled calendar events and prepares agendas.
          </p>
          <button
            onClick={() => onOpenConnector("gcalendar")}
            className="text-[11px] text-stone-900 font-semibold underline"
          >
            Manage Calendar Sync →
          </button>
        </div>
      </div>

      {/* Right Note Detail View */}
      <div className="flex-1 bg-[#faf8f5] border border-l-0 border-[#ded7c8] rounded-r-2xl p-6 overflow-y-auto space-y-5">
        {isRecording ? (
          <div className="bg-white border border-[#ded7c8] rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <h3 className="text-sm font-bold text-stone-900">Recording Live Meeting Audio...</h3>
              </div>
              <button
                onClick={() => setIsRecording(false)}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
            </div>

            <textarea
              value={recordedText}
              onChange={(e) => setRecordedText(e.target.value)}
              rows={4}
              className="w-full p-3 bg-[#faf8f5] border border-[#ded7c8] rounded-lg text-xs font-mono focus:outline-none"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAnalyzeAndSave}
                disabled={analyzing}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {analyzing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span>{analyzing ? "Extracting Action Items..." : "Finish & Generate AI Summary"}</span>
              </button>
            </div>
          </div>
        ) : (
          currentNote && (
            <div className="space-y-6">
              {/* Note Header */}
              <div className="border-b border-[#ded7c8] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {currentNote.appSource} Event
                  </span>
                  <span className="text-xs text-stone-500">{currentNote.date}</span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 font-serif">{currentNote.title}</h2>
                <div className="flex items-center space-x-4 text-xs text-stone-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{currentNote.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>{currentNote.participants.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* AI Executive Summary Card */}
              <div className="bg-white border border-[#ded7c8] rounded-xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-stone-900">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Executive AI Takeaways</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{currentNote.summary}</p>
              </div>

              {/* Action Items List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-stone-900 flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>Action Items & Commitments ({currentNote.actionItems.length})</span>
                </h3>

                <div className="space-y-2">
                  {currentNote.actionItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleTask(currentNote.id, item.id)}
                      className={`p-3 bg-white border rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
                        item.completed
                          ? "border-emerald-200 bg-emerald-50/30 text-stone-500 line-through"
                          : "border-[#ded7c8] text-stone-900 hover:border-stone-400"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                        <span className="text-xs font-medium">{item.task}</span>
                      </div>
                      <span className="text-[10px] bg-[#f5f1e8] text-stone-600 font-mono px-2 py-0.5 rounded border border-[#ded7c8]">
                        @{item.assignee}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Transcript Snippet */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-stone-700 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>Recorded Transcript Snippet</span>
                </h3>
                <div className="p-3 bg-white border border-[#ded7c8] rounded-xl text-xs text-stone-600 italic font-serif leading-relaxed">
                  "{currentNote.transcriptSnippet}"
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
