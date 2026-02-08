import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { CandidateResult } from "@/components/CandidateResult";
import { Button } from "@/components/ui/button";
import { extractTextFromFile } from "@/lib/fileExtractor";
import type { UploadedFile, AnalysisProgress as AnalysisProgressType, Candidate } from "@/types/resume";

const CandidateDashboard = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType>({
    stage: "idle",
    progress: 0,
    message: "",
  });
  const [result, setResult] = useState<{ candidate: Candidate; requiredSkills: string[] } | null>(null);

  const handleFilesAdd = useCallback((newFiles: File[]) => {
    // Candidate mode: only 1 resume allowed
    const uploadedFile: UploadedFile = {
      id: crypto.randomUUID(),
      file: newFiles[0],
      name: newFiles[0].name,
      size: newFiles[0].size,
      type: newFiles[0].type,
      status: "pending",
      progress: 0,
    };
    setFiles([uploadedFile]);
  }, []);

  const handleFileRemove = useCallback(() => {
    setFiles([]);
  }, []);

  // extractTextFromFile is now imported from @/lib/fileExtractor



  const handleAnalyze = async () => {
    if (!jobDescription.trim() || files.length === 0) {
      toast.error("Please provide a job description and upload your resume");
      return;
    }

    setResult(null);
    try {
      setAnalysisProgress({ stage: "extracting", progress: 10, message: "Extracting text from resume..." });

      const file = files[0];
      setFiles((prev) => prev.map((f) => ({ ...f, status: "processing" as const })));
      const text = await extractTextFromFile(file.file);
      setFiles((prev) => prev.map((f) => ({ ...f, status: "complete" as const, extractedText: text })));

      setAnalysisProgress({ stage: "analyzing", progress: 40, message: "Analyzing your resume against the job description..." });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resumes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            jobDescription,
            resumes: [{ fileName: file.name, resumeText: text }],
            mode: "candidate",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      setAnalysisProgress({ stage: "scoring", progress: 80, message: "Generating your results..." });

      const analysisResult = await response.json();
      const c = analysisResult.candidates?.[0];

      if (!c) throw new Error("No analysis results returned");

      const candidate: Candidate = {
        id: crypto.randomUUID(),
        name: c.name || "Unknown",
        email: c.email || "",
        fileName: c.fileName || file.name,
        resumeText: text,
        jobFitScore: c.jobFitScore || 0,
        semanticScore: c.semanticScore || 0,
        skillMatchScore: c.skillMatchScore || 0,
        atsScore: c.atsScore || 0,
        matchedSkills: c.matchedSkills || [],
        missingSkills: c.missingSkills || [],
        extraSkills: c.extraSkills || [],
        relevantExperience: c.relevantExperience || [],
        relevantProjects: c.relevantProjects || [],
        summary: c.summary || "",
        improvementSuggestions: c.improvementSuggestions || [],
        atsTips: c.atsTips || [],
        missingKeywords: c.missingKeywords || [],
        analyzedAt: new Date(),
      };

      setAnalysisProgress({ stage: "complete", progress: 100, message: "Analysis complete!" });
      setResult({ candidate, requiredSkills: analysisResult.requiredSkills || [] });
      toast.success("Resume analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisProgress({
        stage: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Analysis failed",
      });
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume");
      setFiles((prev) => prev.map((f) => ({ ...f, status: "pending" as const })));
    }
  };

  const handleReset = () => {
    setResult(null);
    setJobDescription("");
    setFiles([]);
    setAnalysisProgress({ stage: "idle", progress: 0, message: "" });
  };

  const isAnalyzing = analysisProgress.stage !== "idle" && analysisProgress.stage !== "complete" && analysisProgress.stage !== "error";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Header />

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Your Resume Analysis</h2>
                  <p className="text-muted-foreground">Detailed feedback and improvement suggestions</p>
                </div>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </div>
              <CandidateResult candidate={result.candidate} requiredSkills={result.requiredSkills} />
            </motion.div>
          ) : isAnalyzing ? (
            <AnalysisProgress key="progress" progress={analysisProgress} />
          ) : (
            <div key="input" className="space-y-6">
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                hasResumes={files.length > 0}
              />
              <ResumeUpload
                files={files}
                onFilesAdd={handleFilesAdd}
                onFileRemove={(id) => handleFileRemove()}
                isAnalyzing={isAnalyzing}
              />
            </div>
          )}
        </AnimatePresence>

        <footer className="mt-16 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Candidate Screening System</p>
          <p>Intelligent Resume Analysis • Skill Matching • Career Insights</p>
          <p className="mt-2">© {new Date().getFullYear()} All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default CandidateDashboard;
