import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { extractTextFromFile } from "@/lib/fileExtractor";
import type { UploadedFile, AnalysisProgress as AnalysisProgressType, AnalysisResult, Candidate } from "@/types/resume";

const RecruiterDashboard = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType>({
    stage: "idle",
    progress: 0,
    message: "",
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleFilesAdd = useCallback((newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
  }, []);

  const handleFileRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // extractTextFromFile is now imported from @/lib/fileExtractor



  const handleAnalyze = async () => {
    if (!jobDescription.trim() || files.length === 0) {
      toast.error("Please provide a job description and upload at least one resume");
      return;
    }

    setResult(null);
    try {
      setAnalysisProgress({ stage: "extracting", progress: 10, message: "Extracting text from resumes..." });

      const resumeData: { fileName: string; resumeText: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setAnalysisProgress({
          stage: "extracting",
          progress: 10 + (i / files.length) * 20,
          message: `Extracting text from ${file.name}...`,
          currentFile: file.name,
        });
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: "processing" as const } : f));
        const text = await extractTextFromFile(file.file);
        resumeData.push({ fileName: file.name, resumeText: text });
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, status: "complete" as const, extractedText: text } : f));
      }

      setAnalysisProgress({ stage: "analyzing", progress: 40, message: "Performing intelligent analysis on resumes..." });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resumes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ jobDescription, resumes: resumeData, mode: "recruiter" }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      setAnalysisProgress({ stage: "scoring", progress: 80, message: "Calculating scores and ranking candidates..." });

      const analysisResult = await response.json();
      const candidates: Candidate[] = analysisResult.candidates.map(
        (c: any, index: number) => ({
          id: crypto.randomUUID(),
          name: c.name || "Unknown",
          email: c.email || "",
          fileName: c.fileName || files[index]?.name || "Unknown",
          resumeText: resumeData.find((r) => r.fileName === c.fileName)?.resumeText || "",
          jobFitScore: c.jobFitScore || 0,
          semanticScore: c.semanticScore || 0,
          skillMatchScore: c.skillMatchScore || 0,
          matchedSkills: c.matchedSkills || [],
          missingSkills: c.missingSkills || [],
          relevantExperience: c.relevantExperience || [],
          relevantProjects: c.relevantProjects || [],
          summary: c.summary || "",
          analyzedAt: new Date(),
        })
      );

      candidates.sort((a, b) => b.jobFitScore - a.jobFitScore);

      setAnalysisProgress({ stage: "complete", progress: 100, message: "Analysis complete!" });
      setResult({ candidates, jobDescription, requiredSkills: analysisResult.requiredSkills || [], analyzedAt: new Date() });
      toast.success(`Successfully analyzed ${candidates.length} resume(s)`);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisProgress({
        stage: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Analysis failed",
      });
      toast.error(error instanceof Error ? error.message : "Failed to analyze resumes");
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
            <ResultsDashboard key="results" result={result} onReset={handleReset} />
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
                onFileRemove={handleFileRemove}
                isAnalyzing={isAnalyzing}
              />
            </div>
          )}
        </AnimatePresence>

        <footer className="mt-16 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Candidate Screening System</p>
          <p>Intelligent Resume Analysis • Skill Matching • Candidate Ranking</p>
          <p className="mt-2">© {new Date().getFullYear()} All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
