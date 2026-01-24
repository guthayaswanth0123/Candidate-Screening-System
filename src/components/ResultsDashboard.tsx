import { motion } from "framer-motion";
import { Users, TrendingUp, Target, Award, RotateCcw } from "lucide-react";
import { CandidateCard } from "./CandidateCard";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types/resume";

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const avgScore =
    result.candidates.reduce((acc, c) => acc + c.jobFitScore, 0) /
    result.candidates.length;
  const topScore = Math.max(...result.candidates.map((c) => c.jobFitScore));
  const strongCandidates = result.candidates.filter(
    (c) => c.jobFitScore >= 70
  ).length;

  const stats = [
    {
      label: "Candidates",
      value: result.candidates.length,
      icon: Users,
      color: "text-accent",
    },
    {
      label: "Avg Score",
      value: `${Math.round(avgScore)}%`,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Top Score",
      value: `${Math.round(topScore)}%`,
      icon: Award,
      color: "text-warning",
    },
    {
      label: "Strong Fits",
      value: strongCandidates,
      icon: Target,
      color: "text-score-excellent",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
          <p className="text-muted-foreground">
            Ranked candidates based on job fit score
          </p>
        </div>
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="stat-card"
          >
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Required Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Required Skills from Job Description
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Candidate Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Ranked Candidates
        </h3>
        {result.candidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            rank={index + 1}
            delay={0.4 + index * 0.1}
          />
        ))}
      </div>
    </div>
  );
}
