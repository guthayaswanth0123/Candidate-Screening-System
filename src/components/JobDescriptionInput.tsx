import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [jobCategory, setJobCategory] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");

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

      {/* Job Metadata Fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Select value={jobCategory} onValueChange={setJobCategory}>
          <SelectTrigger className="bg-muted/30 border-border/50">
            <SelectValue placeholder="Job Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="frontend">Frontend</SelectItem>
            <SelectItem value="backend">Backend</SelectItem>
            <SelectItem value="fullstack">Full Stack</SelectItem>
            <SelectItem value="ml">Machine Learning</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
            <SelectItem value="data">Data Science</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
          <SelectTrigger className="bg-muted/30 border-border/50">
            <SelectValue placeholder="Experience Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="intern">Intern</SelectItem>
            <SelectItem value="junior">Junior (0-2 years)</SelectItem>
            <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
            <SelectItem value="senior">Senior (5+ years)</SelectItem>
            <SelectItem value="lead">Lead / Principal</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="📍 Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-muted/30 border-border/50"
        />

        <Input
          placeholder="💰 Salary Range"
          value={salaryRange}
          onChange={(e) => setSalaryRange(e.target.value)}
          className="bg-muted/30 border-border/50"
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
