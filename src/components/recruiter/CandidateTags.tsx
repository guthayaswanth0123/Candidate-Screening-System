import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Check } from "lucide-react";
import { toast } from "sonner";

interface CandidateTagsProps {
  candidateId: string;
  candidateName: string;
}

type TagType = "strong-fit" | "shortlisted" | "interview" | "rejected";

interface CandidateTagDef {
  id: TagType;
  label: string;
  color: string;
  bgColor: string;
}

const availableTags: CandidateTagDef[] = [
  { id: "strong-fit", label: "Strong Fit", color: "text-success", bgColor: "bg-success/15 border-success/30" },
  { id: "shortlisted", label: "Shortlisted", color: "text-accent", bgColor: "bg-accent/15 border-accent/30" },
  { id: "interview", label: "Interview Later", color: "text-warning", bgColor: "bg-warning/15 border-warning/30" },
  { id: "rejected", label: "Rejected", color: "text-destructive", bgColor: "bg-destructive/15 border-destructive/30" },
];

// In-memory storage for tags
const tagStorage: Record<string, TagType[]> = {};

export function CandidateTags({ candidateId, candidateName }: CandidateTagsProps) {
  const [selectedTags, setSelectedTags] = useState<TagType[]>(tagStorage[candidateId] || []);

  const toggleTag = (tagId: TagType) => {
    let updatedTags: TagType[];
    if (selectedTags.includes(tagId)) {
      updatedTags = selectedTags.filter((t) => t !== tagId);
      toast.success(`Removed "${availableTags.find((t) => t.id === tagId)?.label}" from ${candidateName}`);
    } else {
      updatedTags = [...selectedTags, tagId];
      toast.success(`Marked ${candidateName} as "${availableTags.find((t) => t.id === tagId)?.label}"`);
    }
    setSelectedTags(updatedTags);
    tagStorage[candidateId] = updatedTags;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        return (
          <motion.button
            key={tag.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleTag(tag.id);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isSelected
                ? `${tag.bgColor} ${tag.color}`
                : "bg-muted/50 text-muted-foreground border-border/50 hover:border-border"
            }`}
          >
            {isSelected ? <Check className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
            {tag.label}
          </motion.button>
        );
      })}
    </div>
  );
}
