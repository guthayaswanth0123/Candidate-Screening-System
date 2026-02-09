import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Bell, Menu } from "lucide-react";
import { RecruiterSidebar } from "@/components/recruiter/RecruiterSidebar";
import { RecruiterHome } from "@/components/recruiter/RecruiterHome";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { ResumeUpload } from "@/components/ResumeUpload";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { extractTextFromFile } from "@/lib/fileExtractor";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  UploadedFile,
  AnalysisProgress as AnalysisProgressType,
  AnalysisResult,
  Candidate,
} from "@/types/resume";

const RecruiterDashboard = () => {
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<"home" | "analyze" | "results">("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType>({
    stage: "idle",
    progress: 0,
    message: "",
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);

  const handleFilesAdd = useCallback((newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadedFiles]);
  }, []);

  const handleFileRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

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
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "processing" as const } : f))
        );
        const text = await extractTextFromFile(file.file);
        resumeData.push({ fileName: file.name, resumeText: text });
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "complete" as const, extractedText: text } : f
          )
        );
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

      const newResult: AnalysisResult = {
        candidates,
        jobDescription,
        requiredSkills: analysisResult.requiredSkills || [],
        analyzedAt: new Date(),
      };

      setAnalysisProgress({ stage: "complete", progress: 100, message: "Analysis complete!" });
      setResult(newResult);
      setAnalysisHistory((prev) => [...prev, newResult]);
      setCurrentView("results");
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
    setCurrentView("analyze");
  };

  const isAnalyzing =
    analysisProgress.stage !== "idle" &&
    analysisProgress.stage !== "complete" &&
    analysisProgress.stage !== "error";

  const handleViewChange = (view: string) => {
    setCurrentView(view as "home" | "analyze" | "results");
    if (isMobile) setSidebarOpen(false);
  };

  const viewTitles: Record<string, string> = {
    home: "Dashboard",
    analyze: "New Analysis",
    results: "Analysis Results",
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={
          isMobile
            ? `fixed z-50 h-full transition-transform duration-300 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : ""
        }
      >
        <RecruiterSidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          hasResults={!!result}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="h-9 w-9"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h2 className="text-lg font-semibold text-foreground">
                {viewTitles[currentView]}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {analysisHistory.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-[10px] text-accent-foreground flex items-center justify-center font-bold">
                    {analysisHistory.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {currentView === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <RecruiterHome
                  onStartAnalysis={() => setCurrentView("analyze")}
                  analysisHistory={analysisHistory}
                />
              </motion.div>
            )}

            {currentView === "analyze" && (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {isAnalyzing ? (
                  <AnalysisProgress progress={analysisProgress} />
                ) : (
                  <div className="space-y-6">
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
              </motion.div>
            )}

            {currentView === "results" && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <ResultsDashboard result={result} onReset={handleReset} />
              </motion.div>
            )}

            {currentView === "results" && !result && (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-muted-foreground mb-4">
                  No analysis results yet. Start a new analysis to see results here.
                </p>
                <Button onClick={() => setCurrentView("analyze")}>
                  Start New Analysis
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-8 pb-6 border-t border-border/50 text-center text-sm text-muted-foreground px-4">
          <p className="font-medium text-foreground mb-1">Candidate Screening System</p>
          <p>Intelligent Resume Analysis • Skill Matching • Candidate Ranking</p>
          <p className="mt-1">© {new Date().getFullYear()} All Rights Reserved</p>
        </footer>
      </main>
    </div>
  );
};

export default RecruiterDashboard;
