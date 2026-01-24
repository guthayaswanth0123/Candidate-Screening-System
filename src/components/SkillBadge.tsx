import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface SkillBadgeProps {
  skill: string;
  matched: boolean;
  delay?: number;
}

export function SkillBadge({ skill, matched, delay = 0 }: SkillBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
        matched ? "skill-badge-matched" : "skill-badge-missing"
      }`}
    >
      {matched ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {skill}
    </motion.span>
  );
}
