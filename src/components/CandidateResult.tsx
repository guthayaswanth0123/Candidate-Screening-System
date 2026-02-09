import { useState } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, AlertTriangle, Sparkles, FileCheck, TrendingUp,
  User, Briefcase, CheckSquare, Download, BarChart3, Zap,
  BookOpen, PenTool, Target, Shield
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/ScoreGauge";
import type { Candidate } from "@/types/resume";

interface CandidateResultProps {
  candidate: Candidate;
  requiredSkills: string[];
}

export function CandidateResult({ candidate, requiredSkills }: CandidateResultProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return { label: "Strong", color: "bg-success" };
    if (score >= 60) return { label: "Average", color: "bg-warning" };
    return { label: "Weak", color: "bg-destructive" };
  };

  const getExperienceBadgeColor = (level: string) => {
    switch (level) {
      case "Senior": return "bg-accent/20 text-accent border-accent/30";
      case "Mid-Level": return "bg-success/20 text-success border-success/30";
      case "Junior": return "bg-warning/20 text-warning border-warning/30";
      default: return "bg-primary/20 text-primary border-primary/30";
    }
  };

  const strength = getStrengthLabel(candidate.jobFitScore);

  const handleDownloadReport = () => {
    const sections = [
      `RESUME ANALYSIS REPORT`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `Candidate: ${candidate.name}`,
      ``,
      `═══ OVERALL SCORES ═══`,
      `Job Fit: ${candidate.jobFitScore}%`,
      `Semantic Match: ${candidate.semanticScore}%`,
      `Skill Match: ${candidate.skillMatchScore}%`,
      `ATS Score: ${candidate.atsScore ?? 0}%`,
      `Formatting Score: ${candidate.formattingScore ?? 0}%`,
      `Experience Level: ${candidate.experienceLevel || "Unknown"}`,
      ``,
      `═══ SUMMARY ═══`,
      candidate.summary,
      ``,
      `═══ SECTION-WISE SCORES ═══`,
      ...(candidate.sectionScores?.map(s => `${s.section}: ${s.score}%`) || []),
      ``,
      `═══ MATCHED SKILLS ═══`,
      candidate.matchedSkills.join(", ") || "None",
      ``,
      `═══ MISSING SKILLS ═══`,
      candidate.missingSkills.join(", ") || "None",
      ``,
      `═══ SUGGESTED ROLES ═══`,
      ...(candidate.suggestedRoles?.map((r, i) => `${i + 1}. ${r}`) || []),
      ``,
      `═══ IMPROVEMENT SUGGESTIONS ═══`,
      ...(candidate.improvementSuggestions?.map((s, i) => `${i + 1}. ${s}`) || []),
      ``,
      `═══ ACTION WORDS TO ADD ═══`,
      candidate.actionWordsToAdd?.join(", ") || "None",
      ``,
      `═══ GRAMMAR ISSUES ═══`,
      ...(candidate.grammarIssues?.map(g => `"${g.original}" → "${g.suggestion}"`) || ["None found"]),
      ``,
      `═══ IMPROVEMENT CHECKLIST ═══`,
      ...(candidate.improvementChecklist?.map(item => `☐ ${item}`) || []),
      ``,
      `═══ ATS OPTIMIZATION TIPS ═══`,
      ...(candidate.atsTips?.map((t, i) => `${i + 1}. ${t}`) || []),
    ];

    const blob = new Blob([sections.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-analysis-${candidate.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedChecklist = Object.values(checkedItems).filter(Boolean).length;
  const totalChecklist = candidate.improvementChecklist?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Resume Strength Meter */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Resume Strength</h3>
          </div>
          <div className="flex items-center gap-3">
            {candidate.experienceLevel && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getExperienceBadgeColor(candidate.experienceLevel)}`}>
                <User className="h-3 w-3 inline mr-1" />
                {candidate.experienceLevel}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-1" />
              Download Report
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-foreground">Overall Score: {candidate.jobFitScore}/100</span>
              <span className={`font-semibold ${getScoreColor(candidate.jobFitScore)}`}>{strength.label}</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${strength.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${candidate.jobFitScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Score Overview with Gauges */}
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
            className="stat-card flex flex-col items-center"
          >
            <ScoreGauge score={item.score} size="sm" label={item.label} />
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
        <p className="text-muted-foreground text-sm">{candidate.summary}</p>
      </div>

      {/* Section-Wise Scores */}
      {candidate.sectionScores && candidate.sectionScores.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            Section-Wise Scores
          </h3>
          <div className="space-y-4">
            {candidate.sectionScores.map((section) => (
              <div key={section.section}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{section.section}</span>
                  <span className={`font-medium ${getScoreColor(section.score)}`}>{section.score}%</span>
                </div>
                <Progress value={section.score} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Match Breakdown */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Skill Match Breakdown</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-success font-medium">{candidate.matchedSkills.length} Matched</span>
              <span className="text-destructive font-medium">{candidate.missingSkills.length} Missing</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden flex">
              <div
                className="bg-success h-full rounded-l-full transition-all"
                style={{ width: `${requiredSkills.length > 0 ? (candidate.matchedSkills.length / requiredSkills.length) * 100 : 0}%` }}
              />
              <div
                className="bg-destructive h-full rounded-r-full transition-all"
                style={{ width: `${requiredSkills.length > 0 ? (candidate.missingSkills.length / requiredSkills.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-xs font-medium text-success mb-2">✅ Skills Present in Resume</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.matchedSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium skill-badge-matched">{skill}</span>
            ))}
            {candidate.matchedSkills.length === 0 && <span className="text-xs text-muted-foreground">No matching skills found</span>}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-destructive mb-2">❌ Missing Skills from JD</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.missingSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium skill-badge-missing">{skill}</span>
            ))}
            {candidate.missingSkills.length === 0 && <span className="text-xs text-muted-foreground">No critical skills missing!</span>}
          </div>
        </div>
      </div>

      {/* Keyword Density Chart */}
      {candidate.keywordDensity && candidate.keywordDensity.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" />
            Keyword Density
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidate.keywordDensity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  type="category"
                  dataKey="keyword"
                  width={100}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value} times`, "Occurrences"]}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(173, 80%, 40%)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Suggested Job Roles */}
      {candidate.suggestedRoles && candidate.suggestedRoles.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-accent" />
            You Are Suitable For
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {candidate.suggestedRoles.map((role) => (
              <div key={role} className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Target className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Issues */}
      {candidate.grammarIssues && candidate.grammarIssues.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <PenTool className="h-4 w-4 text-warning" />
            Grammar & Spelling Issues
          </h3>
          <div className="space-y-3">
            {candidate.grammarIssues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <span className="text-destructive line-through text-sm mt-0.5">"{issue.original}"</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-success text-sm font-medium">"{issue.suggestion}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Words */}
      {candidate.actionWordsToAdd && candidate.actionWordsToAdd.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            Powerful Action Words to Use
          </h3>
          <div className="flex flex-wrap gap-2">
            {candidate.actionWordsToAdd.map((word) => (
              <span key={word} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

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

      {/* Improvement Checklist */}
      {candidate.improvementChecklist && candidate.improvementChecklist.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-accent" />
            Improvement Checklist
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {completedChecklist}/{totalChecklist} completed
          </p>
          <Progress value={totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0} className="h-2 mb-4" />
          <div className="space-y-3">
            {candidate.improvementChecklist.map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={checkedItems[i] || false}
                  onCheckedChange={(checked) => setCheckedItems((prev) => ({ ...prev, [i]: !!checked }))}
                />
                <span className={`text-sm transition-all ${checkedItems[i] ? "line-through text-muted-foreground" : "text-foreground group-hover:text-accent"}`}>
                  {item}
                </span>
              </label>
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
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warning/20 text-warning text-xs flex items-center justify-center font-medium">{i + 1}</span>
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
              <span key={keyword} className="px-3 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning border border-warning/30">{keyword}</span>
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
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">{i + 1}</span>
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
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" />
              Relevant Experience
            </h3>
            <ul className="space-y-2">
              {candidate.relevantExperience.map((exp, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>{exp}
                </li>
              ))}
            </ul>
          </div>
        )}
        {candidate.relevantProjects.length > 0 && (
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Relevant Projects
            </h3>
            <ul className="space-y-2">
              {candidate.relevantProjects.map((project, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>{project}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
