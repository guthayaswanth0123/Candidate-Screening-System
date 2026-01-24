import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, ChevronDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "./ScoreGauge";
import type { Candidate } from "@/types/resume";

interface ComparisonViewProps {
  candidates: Candidate[];
}

export function ComparisonView({ candidates }: ComparisonViewProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleCandidate = (id: string) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter((c) => c !== id));
    } else if (selectedCandidates.length < 3) {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  const comparedCandidates = candidates.filter((c) =>
    selectedCandidates.includes(c.id)
  );

  // Get all unique skills from compared candidates
  const allSkills = new Set<string>();
  comparedCandidates.forEach((c) => {
    c.matchedSkills.forEach((s) => allSkills.add(s));
    c.missingSkills.forEach((s) => allSkills.add(s));
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <GitCompare className="h-5 w-5 text-accent" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground">Compare Candidates</h3>
            <p className="text-sm text-muted-foreground">
              Select up to 3 candidates for side-by-side comparison
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border"
          >
            <div className="p-6">
              {/* Candidate Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                {candidates.map((candidate) => (
                  <Button
                    key={candidate.id}
                    variant={selectedCandidates.includes(candidate.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCandidate(candidate.id)}
                    className={`${
                      selectedCandidates.includes(candidate.id)
                        ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                        : ""
                    }`}
                  >
                    {candidate.name}
                    {selectedCandidates.includes(candidate.id) && (
                      <span className="ml-2 text-xs">
                        #{selectedCandidates.indexOf(candidate.id) + 1}
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              {/* Comparison Table */}
              {comparedCandidates.length >= 2 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Metric
                        </th>
                        {comparedCandidates.map((c) => (
                          <th key={c.id} className="text-center py-3 px-4 font-medium text-foreground">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4 text-muted-foreground">Job Fit Score</td>
                        {comparedCandidates.map((c) => (
                          <td key={c.id} className="text-center py-4 px-4">
                            <div className="flex justify-center">
                              <ScoreGauge score={c.jobFitScore} size="sm" showLabel={false} />
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4 text-muted-foreground">Semantic Match</td>
                        {comparedCandidates.map((c) => (
                          <td key={c.id} className="text-center py-4 px-4">
                            <span className="text-lg font-semibold text-foreground">
                              {Math.round(c.semanticScore)}%
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4 text-muted-foreground">Skill Match</td>
                        {comparedCandidates.map((c) => (
                          <td key={c.id} className="text-center py-4 px-4">
                            <span className="text-lg font-semibold text-foreground">
                              {Math.round(c.skillMatchScore)}%
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4 text-muted-foreground">Skills Matched</td>
                        {comparedCandidates.map((c) => (
                          <td key={c.id} className="text-center py-4 px-4">
                            <span className="px-3 py-1 rounded-full bg-success/20 text-success font-medium">
                              {c.matchedSkills.length}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4 text-muted-foreground">Skills Missing</td>
                        {comparedCandidates.map((c) => (
                          <td key={c.id} className="text-center py-4 px-4">
                            <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive font-medium">
                              {c.missingSkills.length}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4 text-muted-foreground">Experience Items</td>
                        {comparedCandidates.map((c) => (
                          <td key={c.id} className="text-center py-4 px-4 font-medium text-foreground">
                            {c.relevantExperience.length}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-4 px-4 text-muted-foreground">Projects</td>
                        {comparedCandidates.map((c) => (
                          <td key={c.id} className="text-center py-4 px-4 font-medium text-foreground">
                            {c.relevantProjects.length}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>

                  {/* Skill Comparison */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Skill Comparison
                    </h4>
                    <div className="grid gap-2">
                      {Array.from(allSkills).map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-4 py-2 px-4 bg-muted/30 rounded-lg"
                        >
                          <span className="flex-1 text-sm font-medium text-foreground">
                            {skill}
                          </span>
                          {comparedCandidates.map((c) => (
                            <div key={c.id} className="w-20 text-center">
                              {c.matchedSkills.some(
                                (s) => s.toLowerCase() === skill.toLowerCase()
                              ) ? (
                                <Check className="h-5 w-5 text-success mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-destructive mx-auto" />
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select at least 2 candidates to compare
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
