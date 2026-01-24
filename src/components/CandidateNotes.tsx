import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  createdAt: Date;
}

interface CandidateNotesProps {
  candidateId: string;
  candidateName: string;
}

// In-memory storage for notes (in production, this would be in a database)
const notesStorage: Record<string, Note[]> = {};

export function CandidateNotes({ candidateId, candidateName }: CandidateNotesProps) {
  const [notes, setNotes] = useState<Note[]>(notesStorage[candidateId] || []);
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: crypto.randomUUID(),
      text: newNote.trim(),
      createdAt: new Date(),
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    notesStorage[candidateId] = updatedNotes;
    setNewNote("");
    setIsAdding(false);
    toast.success("Note added successfully");
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    setNotes(updatedNotes);
    notesStorage[candidateId] = updatedNotes;
    toast.success("Note deleted");
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" />
          Notes for {candidateName}
        </h4>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-accent hover:text-accent"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4"
        >
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add your notes about this candidate..."
            className="mb-2"
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addNote} className="bg-accent hover:bg-accent/90">
              Save Note
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewNote("");
              }}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-muted/30 rounded-lg border border-border/30 group"
            >
              <p className="text-sm text-foreground">{note.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {note.createdAt.toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNote(note.id)}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <p className="text-sm text-muted-foreground italic">
            No notes yet. Click "Add Note" to add your observations.
          </p>
        )
      )}
    </div>
  );
}
