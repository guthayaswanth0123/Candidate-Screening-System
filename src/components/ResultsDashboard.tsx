import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Target, Award, RotateCcw, LayoutGrid, List } from "lucide-react";
import { CandidateCard } from "./CandidateCard";
import { SkillsChart } from "./SkillsChart";
import { ComparisonView } from "./ComparisonView";
import { CandidateFilters } from "./CandidateFilters";
import { ExportOptions } from "./ExportOptions";
import { Button } from "@/components/ui/button";
import type { AnalysisResult, Candidate } from "@/types/resume";

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const [viewMode, setViewMode] = useState<"cards" | "compact">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("jobFitScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minScore, setMinScore] = useState(0);

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = result.candidates.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.matchedSkills.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesScore = c.jobFitScore >= minScore;
      return matchesSearch && matchesScore;
    });

    filtered.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "matchedSkills":
          aVal = a.matchedSkills.length;
          bVal = b.matchedSkills.length;
          break;
        default:
          aVal = a[sortBy as keyof Candidate] as number;
          bVal = b[sortBy as keyof Candidate] as number;
      }

      if (sortOrder === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });

    return filtered;
  }, [result.candidates, searchQuery, sortBy, sortOrder, minScore]);

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
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
          <p className="text-muted-foreground">
            {result.candidates.length} candidates ranked by job fit score
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportOptions result={result} />
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
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

      {/* Analytics Charts */}
      <SkillsChart result={result} />

      {/* Comparison View */}
      <ComparisonView candidates={result.candidates} />

      {/* Required Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Required Skills from Job Description ({result.requiredSkills.length})
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

      {/* Filters */}
      <CandidateFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        minScore={minScore}
        onMinScoreChange={setMinScore}
      />

      {/* View Toggle & Candidate Count */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Ranked Candidates
          {filteredAndSortedCandidates.length !== result.candidates.length && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (showing {filteredAndSortedCandidates.length} of {result.candidates.length})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "compact" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("compact")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Candidate Cards/List */}
      {viewMode === "cards" ? (
        <div className="space-y-4">
          {filteredAndSortedCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              rank={result.candidates.findIndex((c) => c.id === candidate.id) + 1}
              delay={0.4 + index * 0.05}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Candidate</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Job Fit</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Semantic</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Skills</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Matched</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Missing</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Decision</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCandidates.map((candidate, index) => {
                const originalRank = result.candidates.findIndex((c) => c.id === candidate.id) + 1;
                return (
                  <tr key={candidate.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-3 px-4">
                      <span className="text-lg">
                        {originalRank === 1 ? "🥇" : originalRank === 2 ? "🥈" : originalRank === 3 ? "🥉" : `#${originalRank}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-foreground">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.email || candidate.fileName}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${
                        candidate.jobFitScore >= 70 ? "text-success" :
                        candidate.jobFitScore >= 50 ? "text-warning" : "text-destructive"
                      }`}>
                        {Math.round(candidate.jobFitScore)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-foreground">{Math.round(candidate.semanticScore)}%</td>
                    <td className="py-3 px-4 text-center text-foreground">{Math.round(candidate.skillMatchScore)}%</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-full bg-success/20 text-success text-sm">{candidate.matchedSkills.length}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-sm">{candidate.missingSkills.length}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        candidate.recruiterDecision === "Shortlist" ? "bg-success/15 text-success border-success/30" :
                        candidate.recruiterDecision === "Consider Later" ? "bg-warning/15 text-warning border-warning/30" :
                        candidate.recruiterDecision === "Reject" ? "bg-destructive/15 text-destructive border-destructive/30" :
                        "bg-muted text-muted-foreground border-border"
                      }`}>
                        {candidate.recruiterDecision || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {filteredAndSortedCandidates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No candidates match your filters. Try adjusting the search or score threshold.
        </div>
      )}
    </div>
  );
}
