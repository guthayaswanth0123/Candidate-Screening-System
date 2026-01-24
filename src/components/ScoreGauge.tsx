import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
}

export function ScoreGauge({ score, size = "md", showLabel = true, label }: ScoreGaugeProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const strokeWidth = {
    sm: 4,
    md: 6,
    lg: 8,
  };

  const textSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--score-excellent))";
    if (score >= 60) return "hsl(var(--score-high))";
    if (score >= 40) return "hsl(var(--score-medium))";
    return "hsl(var(--score-low))";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Low";
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeClasses[size]} relative`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth[size]}
          />
          {/* Score arc */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth[size]}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${textSize[size]} font-bold text-foreground`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {Math.round(score)}%
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: getScoreColor(score) }}
          >
            {label || getScoreLabel(score)}
          </span>
        </motion.div>
      )}
    </div>
  );
}
