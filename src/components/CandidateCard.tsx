import { motion } from "framer-motion";
import { User, Mail, Briefcase, FolderOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ScoreGauge } from "./ScoreGauge";
import { SkillBadge } from "./SkillBadge";
import type { Candidate } from "@/types/resume";

interface CandidateCardProps {
  candidate: Candidate;
  rank: number;
  delay?: number;
}

export function CandidateCard({ candidate, rank, delay = 0 }: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="candidate-card"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-6">
        {/* Rank Badge */}
        <div className="flex flex-col items-center">
          <span className="text-2xl mb-1">{getRankBadge(rank)}</span>
          <span className="text-xs text-muted-foreground font-medium">Rank</span>
        </div>

        {/* Score Gauge */}
        <ScoreGauge score={candidate.jobFitScore} size="md" label="Job Fit" />

        {/* Candidate Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground truncate">
              {candidate.name || "Unknown Candidate"}
            </h3>
          </div>
          {candidate.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{candidate.email}</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {candidate.summary}
          </p>

          {/* Score breakdown */}
          <div className="flex gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-muted-foreground">
                Semantic: {Math.round(candidate.semanticScore)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted-foreground">
                Skills: {Math.round(candidate.skillMatchScore)}%
              </span>
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-6 border-t border-border/50 mt-6 space-y-6">
          {/* Skills Section */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-success" />
              Matched Skills ({candidate.matchedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.matchedSkills.map((skill, i) => (
                <SkillBadge key={skill} skill={skill} matched delay={i * 0.05} />
              ))}
              {candidate.matchedSkills.length === 0 && (
                <span className="text-sm text-muted-foreground">No matched skills found</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-destructive" />
              Missing Skills ({candidate.missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.missingSkills.map((skill, i) => (
                <SkillBadge key={skill} skill={skill} matched={false} delay={i * 0.05} />
              ))}
              {candidate.missingSkills.length === 0 && (
                <span className="text-sm text-muted-foreground">No critical skills missing!</span>
              )}
            </div>
          </div>

          {/* Experience Section */}
          {candidate.relevantExperience.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" />
                Relevant Experience
              </h4>
              <ul className="space-y-2">
                {candidate.relevantExperience.map((exp, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    {exp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Projects Section */}
          {candidate.relevantProjects.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-accent" />
                Relevant Projects
              </h4>
              <ul className="space-y-2">
                {candidate.relevantProjects.map((project, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    {project}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
