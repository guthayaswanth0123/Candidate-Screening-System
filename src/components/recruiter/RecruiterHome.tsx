import { motion } from "framer-motion";
import {
  Users, TrendingUp, Target, FileText, Zap,
  PlusCircle, BarChart3, Shield, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/types/resume";

interface RecruiterHomeProps {
  onStartAnalysis: () => void;
  analysisHistory: AnalysisResult[];
}

export function RecruiterHome({ onStartAnalysis, analysisHistory }: RecruiterHomeProps) {
  const totalCandidates = analysisHistory.reduce((acc, r) => acc + r.candidates.length, 0);
  const totalAnalyses = analysisHistory.length;
  const strongFits = analysisHistory.reduce(
    (acc, r) => acc + r.candidates.filter((c) => c.jobFitScore >= 70).length,
    0
  );
  const avgScore =
    totalCandidates > 0
      ? Math.round(
          analysisHistory.reduce(
            (acc, r) => acc + r.candidates.reduce((a, c) => a + c.jobFitScore, 0),
            0
          ) / totalCandidates
        )
      : 0;

  const stats = [
    { label: "Total Analyses", value: totalAnalyses, icon: FileText, color: "text-accent" },
    { label: "Candidates Analyzed", value: totalCandidates, icon: Users, color: "text-primary" },
    { label: "Strong Fits", value: strongFits, icon: Target, color: "text-success" },
    {
      label: "Avg Job Fit Score",
      value: avgScore > 0 ? `${avgScore}%` : "—",
      icon: TrendingUp,
      color: "text-warning",
    },
  ];

  const features = [
    { icon: Zap, title: "Smart Analysis", description: "AI-powered resume screening with NLP & semantic matching" },
    { icon: Target, title: "Skill Matching", description: "Automatic skill extraction & gap analysis" },
    { icon: Users, title: "Candidate Ranking", description: "Intelligent scoring & side-by-side comparison" },
    { icon: BarChart3, title: "Analytics Dashboard", description: "Charts, graphs & skill matrix visualization" },
    { icon: Shield, title: "ATS Compatible", description: "Industry-standard scoring & export formats" },
    { icon: Clock, title: "Fast Processing", description: "Analyze multiple resumes in seconds" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 md:p-10"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Recruiter Dashboard
          </h1>
          <p className="text-white/70 mb-6 max-w-lg">
            Analyze resumes, rank candidates, and make data-driven hiring decisions with intelligent AI scoring.
          </p>
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Start New Analysis
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-accent/5 rounded-full translate-y-1/2" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      {analysisHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {analysisHistory
              .slice(-5)
              .reverse()
              .map((result, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border/30"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Analyzed {result.candidates.length} candidate
                      {result.candidates.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Top score: {Math.max(...result.candidates.map((c) => c.jobFitScore))}% •{" "}
                      {result.requiredSkills.length} required skills
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {result.analyzedAt.toLocaleTimeString()}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Feature Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Platform Capabilities</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="glass-card rounded-xl p-5 hover:shadow-lg hover:border-accent/30 transition-all duration-300"
            >
              <feature.icon className="h-8 w-8 text-accent mb-3" />
              <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
