import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasResumes: boolean;
}

export function JobDescriptionInput({
  value,
  onChange,
  onAnalyze,
  isAnalyzing,
  hasResumes,
}: JobDescriptionInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const sampleJD = `Senior Software Engineer

We are looking for an experienced Software Engineer to join our team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in Python, JavaScript, and TypeScript
- Experience with React, Node.js, and modern web frameworks
- Knowledge of SQL and NoSQL databases (PostgreSQL, MongoDB)
- Experience with cloud platforms (AWS, GCP, or Azure)
- Familiarity with CI/CD pipelines and DevOps practices
- Strong problem-solving and communication skills
- Experience with machine learning frameworks is a plus

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews and technical discussions`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Job Description</h2>
          <p className="text-sm text-muted-foreground">
            Paste the job description to analyze candidates against
          </p>
        </div>
      </div>

      <div
        className={`relative rounded-lg transition-all duration-300 ${
          isFocused ? "ring-2 ring-accent/50" : ""
        }`}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste the job description here..."
          className="min-h-[200px] resize-none bg-muted/30 border-border/50 focus:border-accent transition-colors"
        />
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(sampleJD)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Load Sample JD
        </Button>

        <Button
          onClick={onAnalyze}
          disabled={!value.trim() || !hasResumes || isAnalyzing}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isAnalyzing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 mr-2 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
              />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Resumes
            </>
          )}
        </Button>
      </div>

      {value && (
        <div className="mt-3 text-xs text-muted-foreground">
          {value.split(/\s+/).length} words • {value.length} characters
        </div>
      )}
    </motion.div>
  );
}
