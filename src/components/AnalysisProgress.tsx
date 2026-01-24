import { motion } from "framer-motion";
import { Loader2, FileSearch, Brain, BarChart3, CheckCircle2 } from "lucide-react";
import type { AnalysisProgress as AnalysisProgressType } from "@/types/resume";

interface AnalysisProgressProps {
  progress: AnalysisProgressType;
}

export function AnalysisProgress({ progress }: AnalysisProgressProps) {
  const stages = [
    { key: "extracting", label: "Extracting Text", icon: FileSearch },
    { key: "analyzing", label: "AI Analysis", icon: Brain },
    { key: "scoring", label: "Calculating Scores", icon: BarChart3 },
    { key: "complete", label: "Complete", icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === progress.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-xl p-8"
    >
      <div className="flex items-center justify-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="p-4 rounded-full bg-accent/10"
        >
          <Brain className="h-8 w-8 text-accent" />
        </motion.div>
      </div>

      <h3 className="text-xl font-semibold text-center text-foreground mb-2">
        Analyzing Resumes
      </h3>
      <p className="text-center text-muted-foreground mb-6">
        {progress.message}
      </p>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Stages */}
      <div className="flex justify-between">
        {stages.map((stage, index) => {
          const isActive = index === currentStageIndex;
          const isComplete = index < currentStageIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isComplete || isActive ? "hsl(var(--accent))" : "hsl(var(--muted))",
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  isActive ? "shadow-glow" : ""
                }`}
              >
                {isActive ? (
                  <Loader2 className="h-5 w-5 text-accent-foreground animate-spin" />
                ) : (
                  <Icon
                    className={`h-5 w-5 ${
                      isComplete ? "text-accent-foreground" : "text-muted-foreground"
                    }`}
                  />
                )}
              </motion.div>
              <span
                className={`text-xs font-medium ${
                  isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {progress.currentFile && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Processing: {progress.currentFile}
        </p>
      )}
    </motion.div>
  );
}
