import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import type { UploadedFile, AnalysisProgress as AnalysisProgressType, AnalysisResult, Candidate } from "@/types/resume";

const Index = () => {
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

  const extractTextFromFile = async (file: File): Promise<string> => {
    // For PDF and DOCX, we'll send the raw text content
    // In a production app, you'd use proper PDF/DOCX parsing libraries
    // For now, we'll read text files directly and handle binary files specially
    
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      return await file.text();
    }
    
    // For PDF/DOCX, we'll read as text (this is a simplified approach)
    // In production, you'd use a proper document parser
    try {
      const text = await file.text();
      // Basic cleanup for binary artifacts
      const cleanedText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      
      if (cleanedText.length < 50) {
        // If we couldn't extract meaningful text, return a placeholder
        return `Resume file: ${file.name}. Note: For best results with PDF/DOCX files, please paste the resume text directly or use a text file.`;
      }
      
      return cleanedText;
    } catch {
      return `Resume file: ${file.name}`;
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || files.length === 0) {
      toast.error("Please provide a job description and upload at least one resume");
      return;
    }

    setResult(null);
    
    try {
      // Stage 1: Extract text from files
      setAnalysisProgress({
        stage: "extracting",
        progress: 10,
        message: "Extracting text from resumes...",
      });

      const resumeData: { fileName: string; resumeText: string }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setAnalysisProgress({
          stage: "extracting",
          progress: 10 + (i / files.length) * 20,
          message: `Extracting text from ${file.name}...`,
          currentFile: file.name,
        });
        
        // Update file status
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" } : f
          )
        );
        
        const text = await extractTextFromFile(file.file);
        resumeData.push({ fileName: file.name, resumeText: text });
        
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "complete", extractedText: text } : f
          )
        );
      }

      // Stage 2: AI Analysis
      setAnalysisProgress({
        stage: "analyzing",
        progress: 40,
        message: "AI is analyzing resumes against job requirements...",
      });

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
            resumes: resumeData,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      setAnalysisProgress({
        stage: "scoring",
        progress: 80,
        message: "Calculating scores and ranking candidates...",
      });

      const analysisResult = await response.json();

      // Transform to our Candidate type
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

      // Sort by job fit score
      candidates.sort((a, b) => b.jobFitScore - a.jobFitScore);

      setAnalysisProgress({
        stage: "complete",
        progress: 100,
        message: "Analysis complete!",
      });

      setResult({
        candidates,
        jobDescription,
        requiredSkills: analysisResult.requiredSkills || [],
        analyzedAt: new Date(),
      });

      toast.success(`Successfully analyzed ${candidates.length} resume(s)`);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisProgress({
        stage: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Analysis failed",
      });
      toast.error(error instanceof Error ? error.message : "Failed to analyze resumes");
      
      // Reset file statuses on error
      setFiles((prev) =>
        prev.map((f) => ({ ...f, status: "pending" }))
      );
    }
  };

  const handleReset = () => {
    setResult(null);
    setJobDescription("");
    setFiles([]);
    setAnalysisProgress({
      stage: "idle",
      progress: 0,
      message: "",
    });
  };

  const isAnalyzing = analysisProgress.stage !== "idle" && analysisProgress.stage !== "complete" && analysisProgress.stage !== "error";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
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

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            AI Resume Analyzer • Semantic Matching • Skill Extraction
          </p>
          <p className="mt-1">
            Built with React, TypeScript, and Lovable AI
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
