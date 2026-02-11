import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Bell, Menu, Clock, Download, FileText, FileSpreadsheet, Printer, Mail, BarChart3 } from "lucide-react";
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
  const [currentView, setCurrentView] = useState<"home" | "analyze" | "results" | "history" | "reports">("home");
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
          extraSkills: c.extraSkills || [],
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
    setCurrentView(view as typeof currentView);
    if (isMobile) setSidebarOpen(false);
  };

  const viewTitles: Record<string, string> = {
    home: "Dashboard",
    analyze: "Resume Analyze",
    results: "Analysis Results",
    history: "Analysis History",
    reports: "Reports",
  };

  // Export functions for Reports page
  const exportToCSV = (analysisResult: AnalysisResult) => {
    const headers = ["Rank", "Name", "Email", "Job Fit Score", "Semantic Score", "Skill Match Score", "Matched Skills", "Missing Skills", "Summary"];
    const rows = analysisResult.candidates.map((c, i) => [
      i + 1, c.name, c.email, c.jobFitScore, c.semanticScore, c.skillMatchScore,
      c.matchedSkills.join("; "), c.missingSkills.join("; "), c.summary.replace(/,/g, ";"),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `resume_analysis_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully!");
  };

  const exportToReport = (analysisResult: AnalysisResult) => {
    const reportContent = `RESUME ANALYSIS REPORT\nGenerated: ${new Date().toLocaleString()}\n\nRequired Skills: ${analysisResult.requiredSkills.join(", ")}\n\nCANDIDATE RANKINGS\n${analysisResult.candidates.map((c, i) => `\n#${i + 1} - ${c.name}\nEmail: ${c.email || "N/A"}\nJob Fit: ${c.jobFitScore}%\nMatched Skills: ${c.matchedSkills.join(", ") || "None"}\nMissing Skills: ${c.missingSkills.join(", ") || "None"}\nSummary: ${c.summary}`).join("\n---\n")}\n\nTotal Candidates: ${analysisResult.candidates.length}\nAverage Score: ${Math.round(analysisResult.candidates.reduce((a, c) => a + c.jobFitScore, 0) / analysisResult.candidates.length)}%`;
    const blob = new Blob([reportContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resume_analysis_report_${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    toast.success("Report exported successfully!");
  };

  const printReport = (analysisResult: AnalysisResult) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Please allow popups to print"); return; }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Resume Analysis Report</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}h1{color:#1e3a5f;border-bottom:2px solid #14b8a6;padding-bottom:10px}.candidate{border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0}.score{display:inline-block;padding:4px 12px;border-radius:20px;font-weight:bold}.high{background:#dcfce7;color:#166534}.medium{background:#fef3c7;color:#92400e}.low{background:#fee2e2;color:#991b1b}.skills{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.skill{padding:4px 10px;border-radius:15px;font-size:12px}.matched{background:#dcfce7;color:#166534}.missing{background:#fee2e2;color:#991b1b}</style></head><body><h1>Resume Analysis Report</h1><p>Generated: ${new Date().toLocaleString()}</p><h2>Required Skills</h2><div class="skills">${analysisResult.requiredSkills.map(s => `<span class="skill" style="background:#e0f2fe;color:#0369a1;">${s}</span>`).join("")}</div><h2>Candidate Rankings</h2>${analysisResult.candidates.map((c, i) => `<div class="candidate"><h3>#${i + 1} ${c.name} ${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""}</h3><p>${c.email || ""}</p><p><span class="score ${c.jobFitScore >= 70 ? "high" : c.jobFitScore >= 50 ? "medium" : "low"}">Job Fit: ${c.jobFitScore}%</span></p><p><strong>Summary:</strong> ${c.summary}</p><p><strong>Matched:</strong></p><div class="skills">${c.matchedSkills.map(s => `<span class="skill matched">✓ ${s}</span>`).join("") || "None"}</div><p><strong>Missing:</strong></p><div class="skills">${c.missingSkills.map(s => `<span class="skill missing">✗ ${s}</span>`).join("") || "None"}</div></div>`).join("")}<h2>Summary</h2><ul><li>Total: ${analysisResult.candidates.length}</li><li>Avg Score: ${Math.round(analysisResult.candidates.reduce((a, c) => a + c.jobFitScore, 0) / analysisResult.candidates.length)}%</li><li>Strong Fits: ${analysisResult.candidates.filter(c => c.jobFitScore >= 70).length}</li></ul></body></html>`);
    printWindow.document.close();
    printWindow.print();
    toast.success("Print dialog opened!");
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

            {/* History View */}
            {currentView === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Analysis History</h2>
                    <p className="text-muted-foreground">View all your past resume analyses</p>
                  </div>

                  {analysisHistory.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">No History Yet</p>
                      <p className="text-muted-foreground mb-6">
                        Run your first analysis to see history here.
                      </p>
                      <Button onClick={() => setCurrentView("analyze")}>
                        Start New Analysis
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...analysisHistory].reverse().map((entry, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass-card rounded-xl p-6 hover:border-accent/30 transition-all cursor-pointer"
                          onClick={() => {
                            setResult(entry);
                            setCurrentView("results");
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {entry.candidates.length} Candidate{entry.candidates.length !== 1 ? "s" : ""} Analyzed
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {entry.requiredSkills.length} required skills • Top score: {Math.max(...entry.candidates.map(c => c.jobFitScore))}%
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                {entry.analyzedAt.toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {entry.analyzedAt.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {entry.requiredSkills.slice(0, 5).map(skill => (
                              <span key={skill} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                            {entry.requiredSkills.length > 5 && (
                              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                                +{entry.requiredSkills.length - 5} more
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex gap-6 text-xs text-muted-foreground">
                            <span>Avg Score: {Math.round(entry.candidates.reduce((a, c) => a + c.jobFitScore, 0) / entry.candidates.length)}%</span>
                            <span>Strong Fits: {entry.candidates.filter(c => c.jobFitScore >= 70).length}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Reports View */}
            {currentView === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Reports</h2>
                    <p className="text-muted-foreground">Download analysis reports in various formats</p>
                  </div>

                  {analysisHistory.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center">
                      <Download className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground mb-2">No Reports Available</p>
                      <p className="text-muted-foreground mb-6">
                        Complete an analysis first to generate downloadable reports.
                      </p>
                      <Button onClick={() => setCurrentView("analyze")}>
                        Start New Analysis
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[...analysisHistory].reverse().map((entry, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass-card rounded-xl p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  Analysis Report — {entry.candidates.length} Candidates
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {entry.analyzedAt.toLocaleDateString()} at {entry.analyzedAt.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => exportToCSV(entry)}
                            >
                              <FileSpreadsheet className="h-4 w-4 text-success" />
                              CSV
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => exportToReport(entry)}
                            >
                              <FileText className="h-4 w-4 text-accent" />
                              Text Report
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => printReport(entry)}
                            >
                              <Printer className="h-4 w-4 text-primary" />
                              Print
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => {
                                const subject = encodeURIComponent("Resume Analysis Report");
                                const body = encodeURIComponent(`Top Candidates:\n${entry.candidates.slice(0, 3).map((c, j) => `${j + 1}. ${c.name} - ${c.jobFitScore}%`).join("\n")}`);
                                window.open(`mailto:?subject=${subject}&body=${body}`);
                                toast.success("Email client opened!");
                              }}
                            >
                              <Mail className="h-4 w-4 text-warning" />
                              Email
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
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
