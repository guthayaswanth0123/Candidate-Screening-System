import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Sparkles, FileCheck, TrendingUp } from "lucide-react";
import type { Candidate } from "@/types/resume";

interface CandidateResultProps {
  candidate: Candidate;
  requiredSkills: string[];
}

export function CandidateResult({ candidate, requiredSkills }: CandidateResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/20";
    if (score >= 60) return "bg-warning/20";
    return "bg-destructive/20";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Job Fit", score: candidate.jobFitScore, icon: TrendingUp },
          { label: "Semantic Match", score: candidate.semanticScore, icon: Sparkles },
          { label: "Skill Match", score: candidate.skillMatchScore, icon: FileCheck },
          { label: "ATS Score", score: candidate.atsScore ?? 0, icon: FileCheck },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="stat-card text-center"
          >
            <item.icon className={`h-5 w-5 mx-auto mb-2 ${getScoreColor(item.score)}`} />
            <p className={`text-3xl font-bold ${getScoreColor(item.score)}`}>
              {Math.round(item.score)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
        <p className="text-muted-foreground text-sm">{candidate.summary}</p>
      </div>

      {/* Match Percentage Visual */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Skill Match Breakdown</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-success font-medium">
                {candidate.matchedSkills.length} Matched
              </span>
              <span className="text-destructive font-medium">
                {candidate.missingSkills.length} Missing
              </span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden flex">
              <div
                className="bg-success h-full rounded-l-full transition-all"
                style={{
                  width: `${requiredSkills.length > 0
                    ? (candidate.matchedSkills.length / requiredSkills.length) * 100
                    : 0}%`,
                }}
              />
              <div
                className="bg-destructive h-full rounded-r-full transition-all"
                style={{
                  width: `${requiredSkills.length > 0
                    ? (candidate.missingSkills.length / requiredSkills.length) * 100
                    : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Matched Skills */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-success mb-2">✅ Skills Present in Resume</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.matchedSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-success/15 text-success border border-success/30">
                {skill}
              </span>
            ))}
            {candidate.matchedSkills.length === 0 && (
              <span className="text-xs text-muted-foreground">No matching skills found</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div>
          <h4 className="text-xs font-medium text-destructive mb-2">❌ Missing Skills from JD</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.missingSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/15 text-destructive border border-destructive/30">
                {skill}
              </span>
            ))}
            {candidate.missingSkills.length === 0 && (
              <span className="text-xs text-muted-foreground">No critical skills missing!</span>
            )}
          </div>
        </div>
      </div>

      {/* Extra Skills */}
      {candidate.extraSkills && candidate.extraSkills.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Additional Skills (Beyond JD Requirements)
          </h3>
          <div className="flex flex-wrap gap-2">
            {candidate.extraSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent border border-accent/30">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {candidate.improvementSuggestions && candidate.improvementSuggestions.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Improvement Suggestions
          </h3>
          <ul className="space-y-3">
            {candidate.improvementSuggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warning/20 text-warning text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Keywords */}
      {candidate.missingKeywords && candidate.missingKeywords.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Missing Keywords to Add
          </h3>
          <div className="flex flex-wrap gap-2">
            {candidate.missingKeywords.map((keyword) => (
              <span key={keyword} className="px-3 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning border border-warning/30">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ATS Tips */}
      {candidate.atsTips && candidate.atsTips.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            ATS Optimization Tips
          </h3>
          <ul className="space-y-3">
            {candidate.atsTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Experience & Projects */}
      <div className="grid md:grid-cols-2 gap-4">
        {candidate.relevantExperience.length > 0 && (
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Relevant Experience</h3>
            <ul className="space-y-2">
              {candidate.relevantExperience.map((exp, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  {exp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {candidate.relevantProjects.length > 0 && (
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Relevant Projects</h3>
            <ul className="space-y-2">
              {candidate.relevantProjects.map((project, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  {project}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
