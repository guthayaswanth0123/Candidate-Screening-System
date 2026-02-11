import { motion } from "framer-motion";
import {
  User, Mail, Briefcase, FolderOpen, ChevronDown, ChevronUp, Star, Bookmark,
  Tag, Shield, AlertTriangle, ThumbsUp, ThumbsDown, ExternalLink, GraduationCap,
  Award, Users, Brain, Zap, Target,
} from "lucide-react";
import { useState } from "react";
import { ScoreGauge } from "./ScoreGauge";
import { SkillBadge } from "./SkillBadge";
import { CandidateNotes } from "./CandidateNotes";
import { CandidateTags } from "./recruiter/CandidateTags";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { Candidate } from "@/types/resume";

interface CandidateCardProps {
  candidate: Candidate;
  rank: number;
  delay?: number;
}

const shortlistedCandidates = new Set<string>();

export function CandidateCard({ candidate, rank, delay = 0 }: CandidateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(shortlistedCandidates.has(candidate.id));

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const toggleShortlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShortlisted) {
      shortlistedCandidates.delete(candidate.id);
      setIsShortlisted(false);
      toast.success(`${candidate.name} removed from shortlist`);
    } else {
      shortlistedCandidates.add(candidate.id);
      setIsShortlisted(true);
      toast.success(`${candidate.name} added to shortlist`);
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-score-excellent" };
    if (score >= 80) return { grade: "A", color: "text-score-excellent" };
    if (score >= 70) return { grade: "B+", color: "text-success" };
    if (score >= 60) return { grade: "B", color: "text-success" };
    if (score >= 50) return { grade: "C", color: "text-warning" };
    return { grade: "D", color: "text-destructive" };
  };

  const getDecisionStyle = (decision?: string) => {
    switch (decision) {
      case "Shortlist": return "bg-success/15 text-success border-success/30";
      case "Consider Later": return "bg-warning/15 text-warning border-warning/30";
      case "Reject": return "bg-destructive/15 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case "Advanced": return "bg-success/15 text-success";
      case "Intermediate": return "bg-accent/15 text-accent";
      case "Beginner": return "bg-warning/15 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const { grade, color } = getScoreGrade(candidate.jobFitScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`candidate-card ${isShortlisted ? "ring-2 ring-accent" : ""}`}
    >
      <div className="flex items-start gap-4 sm:gap-6 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Rank Badge */}
        <div className="flex flex-col items-center">
          <span className="text-2xl mb-1">{getRankBadge(rank)}</span>
          <span className={`text-lg font-bold ${color}`}>{grade}</span>
        </div>

        {/* Score Gauge */}
        <ScoreGauge score={candidate.jobFitScore} size="md" label="Job Fit" />

        {/* Candidate Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground truncate">
              {candidate.name || "Unknown Candidate"}
            </h3>
            {isShortlisted && <Star className="h-4 w-4 text-accent fill-accent" />}
            {candidate.recruiterDecision && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDecisionStyle(candidate.recruiterDecision)}`}>
                {candidate.recruiterDecision}
              </span>
            )}
          </div>
          {candidate.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{candidate.email}</span>
            </div>
          )}
          {/* Quick meta: experience + education */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
            {candidate.experienceLevel && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> {candidate.experienceLevel}
                {candidate.experienceYears ? ` (${candidate.experienceYears}yr)` : ""}
              </span>
            )}
            {candidate.education && candidate.education.length > 0 && (
              <span className="flex items-center gap-1 truncate max-w-[200px]">
                <GraduationCap className="h-3 w-3" /> {candidate.education[0]}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{candidate.summary}</p>

          {/* Score breakdown */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-muted-foreground">Semantic: {Math.round(candidate.semanticScore)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-muted-foreground">Skills: {Math.round(candidate.skillMatchScore)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">{candidate.matchedSkills.length} matched</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant={isShortlisted ? "default" : "outline"}
            size="icon"
            onClick={toggleShortlist}
            className={isShortlisted ? "bg-accent hover:bg-accent/90" : ""}
          >
            <Bookmark className={`h-4 w-4 ${isShortlisted ? "fill-current" : ""}`} />
          </Button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-6 border-t border-border/50 mt-6 space-y-6">
          {/* Tags */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4 text-accent" /> Candidate Tags
            </h4>
            <CandidateTags candidateId={candidate.id} candidateName={candidate.name} />
          </div>

          {/* Score Breakdown Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-accent">{Math.round(candidate.jobFitScore)}%</p>
              <p className="text-xs text-muted-foreground">Overall Fit</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">{Math.round(candidate.semanticScore)}%</p>
              <p className="text-xs text-muted-foreground">Content Match</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-success">{Math.round(candidate.skillMatchScore)}%</p>
              <p className="text-xs text-muted-foreground">Skill Coverage</p>
            </div>
          </div>

          {/* Skill Proficiency */}
          {candidate.skillProficiency && candidate.skillProficiency.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" /> Skill Proficiency
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skillProficiency.map((sp, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium ${getProficiencyColor(sp.level)}`}>
                    {sp.skill} • {sp.level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Matched & Missing Skills */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-success" /> Matched Skills ({candidate.matchedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.matchedSkills.map((skill, i) => (
                <SkillBadge key={skill} skill={skill} matched delay={i * 0.03} />
              ))}
              {candidate.matchedSkills.length === 0 && <span className="text-sm text-muted-foreground">No matched skills found</span>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-destructive" /> Missing Skills ({candidate.missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.missingSkills.map((skill, i) => (
                <SkillBadge key={skill} skill={skill} matched={false} delay={i * 0.03} />
              ))}
              {candidate.missingSkills.length === 0 && <span className="text-sm text-muted-foreground">No critical skills missing!</span>}
            </div>
          </div>

          {/* Soft Skills Radar */}
          {candidate.softSkills && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" /> Soft Skills Assessment
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(candidate.softSkills).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    communication: "Communication",
                    leadership: "Leadership",
                    teamwork: "Teamwork",
                    problemSolving: "Problem Solving",
                    adaptability: "Adaptability",
                  };
                  const scoreColor = value >= 70 ? "bg-success" : value >= 40 ? "bg-warning" : "bg-destructive";
                  return (
                    <div key={key} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{labels[key] || key}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={value} className="h-1.5 flex-1" />
                        <span className="text-xs font-bold text-foreground">{value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            {candidate.strengths && candidate.strengths.length > 0 && (
              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <h4 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" /> Strengths
                </h4>
                <ul className="space-y-1.5">
                  {candidate.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {candidate.weaknesses && candidate.weaknesses.length > 0 && (
              <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <h4 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4" /> Weaknesses
                </h4>
                <ul className="space-y-1.5">
                  {candidate.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-destructive mt-0.5">✗</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Risk Factors */}
          {candidate.riskFactors && candidate.riskFactors.length > 0 && (
            <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
              <h4 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Risk Factors
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.riskFactors.map((risk, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-medium border border-warning/20">
                    ⚠ {risk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Roles */}
          {candidate.suggestedRoles && candidate.suggestedRoles.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" /> Suitable Roles
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.suggestedRoles.map((role, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education & Certifications */}
          <div className="grid md:grid-cols-2 gap-4">
            {candidate.education && candidate.education.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-accent" /> Education
                </h4>
                <ul className="space-y-2">
                  {candidate.education.map((edu, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">•</span> {edu}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-accent" /> Certifications
                </h4>
                <ul className="space-y-2">
                  {candidate.certifications.map((cert, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">🏅</span> {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Experience */}
          {candidate.relevantExperience.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-accent" /> Relevant Experience
              </h4>
              <ul className="space-y-2">
                {candidate.relevantExperience.map((exp, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-1">•</span> {exp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Projects */}
          {candidate.relevantProjects.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-accent" /> Projects ({candidate.relevantProjects.length})
              </h4>
              <ul className="space-y-2">
                {candidate.relevantProjects.map((project, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-1">•</span> {project}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Portfolio Links */}
          {(candidate.githubUrl || candidate.linkedinUrl || candidate.portfolioUrl) && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-accent" /> Portfolio & Links
              </h4>
              <div className="flex flex-wrap gap-3">
                {candidate.githubUrl && (
                  <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg text-sm text-foreground hover:bg-muted transition-colors border border-border/50">
                    <Shield className="h-4 w-4" /> GitHub
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                )}
                {candidate.linkedinUrl && (
                  <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg text-sm text-foreground hover:bg-muted transition-colors border border-border/50">
                    <Brain className="h-4 w-4" /> LinkedIn
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                )}
                {candidate.portfolioUrl && (
                  <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg text-sm text-foreground hover:bg-muted transition-colors border border-border/50">
                    <ExternalLink className="h-4 w-4" /> Portfolio
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Recruiter Decision Banner */}
          {candidate.recruiterDecision && (
            <div className={`p-4 rounded-lg border text-center ${getDecisionStyle(candidate.recruiterDecision)}`}>
              <p className="text-sm font-bold">AI Recommendation: {candidate.recruiterDecision}</p>
            </div>
          )}

          {/* Notes */}
          <CandidateNotes candidateId={candidate.id} candidateName={candidate.name} />
        </div>
      </motion.div>
    </motion.div>
  );
}
