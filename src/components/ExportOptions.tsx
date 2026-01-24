import { motion } from "framer-motion";
import { Download, FileText, FileSpreadsheet, Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { AnalysisResult } from "@/types/resume";

interface ExportOptionsProps {
  result: AnalysisResult;
}

export function ExportOptions({ result }: ExportOptionsProps) {
  const exportToCSV = () => {
    const headers = [
      "Rank",
      "Name",
      "Email",
      "Job Fit Score",
      "Semantic Score",
      "Skill Match Score",
      "Matched Skills",
      "Missing Skills",
      "Summary",
    ];

    const rows = result.candidates.map((c, i) => [
      i + 1,
      c.name,
      c.email,
      c.jobFitScore,
      c.semanticScore,
      c.skillMatchScore,
      c.matchedSkills.join("; "),
      c.missingSkills.join("; "),
      c.summary.replace(/,/g, ";"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `resume_analysis_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("CSV exported successfully!");
  };

  const exportToReport = () => {
    const reportContent = `
RESUME ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

============================================
JOB DESCRIPTION SUMMARY
============================================
Required Skills: ${result.requiredSkills.join(", ")}

============================================
CANDIDATE RANKINGS
============================================

${result.candidates
  .map(
    (c, i) => `
#${i + 1} - ${c.name}
Email: ${c.email || "N/A"}
Job Fit Score: ${c.jobFitScore}%
Semantic Match: ${c.semanticScore}%
Skill Match: ${c.skillMatchScore}%

Matched Skills: ${c.matchedSkills.join(", ") || "None"}
Missing Skills: ${c.missingSkills.join(", ") || "None"}

Summary: ${c.summary}

Relevant Experience:
${c.relevantExperience.map((e) => `  • ${e}`).join("\n") || "  None listed"}

Relevant Projects:
${c.relevantProjects.map((p) => `  • ${p}`).join("\n") || "  None listed"}

--------------------------------------------`
  )
  .join("\n")}

============================================
ANALYSIS SUMMARY
============================================
Total Candidates: ${result.candidates.length}
Average Score: ${Math.round(result.candidates.reduce((a, c) => a + c.jobFitScore, 0) / result.candidates.length)}%
Top Candidate: ${result.candidates[0]?.name || "N/A"} (${result.candidates[0]?.jobFitScore || 0}%)
Strong Fits (70%+): ${result.candidates.filter((c) => c.jobFitScore >= 70).length}
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resume_analysis_report_${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    toast.success("Report exported successfully!");
  };

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e3a5f; border-bottom: 2px solid #14b8a6; padding-bottom: 10px; }
          h2 { color: #334155; margin-top: 30px; }
          .candidate { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .score { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
          .high { background: #dcfce7; color: #166534; }
          .medium { background: #fef3c7; color: #92400e; }
          .low { background: #fee2e2; color: #991b1b; }
          .skills { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }
          .skill { padding: 4px 10px; border-radius: 15px; font-size: 12px; }
          .matched { background: #dcfce7; color: #166534; }
          .missing { background: #fee2e2; color: #991b1b; }
          .meta { color: #64748b; font-size: 14px; }
          ul { padding-left: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>📊 Resume Analysis Report</h1>
        <p class="meta">Generated: ${new Date().toLocaleString()}</p>
        
        <h2>Required Skills</h2>
        <div class="skills">
          ${result.requiredSkills.map((s) => `<span class="skill" style="background:#e0f2fe;color:#0369a1;">${s}</span>`).join("")}
        </div>
        
        <h2>Candidate Rankings</h2>
        ${result.candidates
          .map(
            (c, i) => `
          <div class="candidate">
            <h3>#${i + 1} ${c.name} ${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""}</h3>
            <p class="meta">${c.email || "No email provided"}</p>
            <p>
              <span class="score ${c.jobFitScore >= 70 ? "high" : c.jobFitScore >= 50 ? "medium" : "low"}">
                Job Fit: ${c.jobFitScore}%
              </span>
            </p>
            <p><strong>Summary:</strong> ${c.summary}</p>
            <p><strong>Matched Skills:</strong></p>
            <div class="skills">
              ${c.matchedSkills.map((s) => `<span class="skill matched">✓ ${s}</span>`).join("") || "<em>None</em>"}
            </div>
            <p><strong>Missing Skills:</strong></p>
            <div class="skills">
              ${c.missingSkills.map((s) => `<span class="skill missing">✗ ${s}</span>`).join("") || "<em>None</em>"}
            </div>
            ${c.relevantExperience.length > 0 ? `<p><strong>Relevant Experience:</strong></p><ul>${c.relevantExperience.map((e) => `<li>${e}</li>`).join("")}</ul>` : ""}
          </div>
        `
          )
          .join("")}
        
        <h2>Summary Statistics</h2>
        <ul>
          <li>Total Candidates: ${result.candidates.length}</li>
          <li>Average Score: ${Math.round(result.candidates.reduce((a, c) => a + c.jobFitScore, 0) / result.candidates.length)}%</li>
          <li>Strong Fits (70%+): ${result.candidates.filter((c) => c.jobFitScore >= 70).length}</li>
        </ul>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success("Print dialog opened!");
  };

  const emailReport = () => {
    const subject = encodeURIComponent("Resume Analysis Report");
    const body = encodeURIComponent(
      `Resume Analysis Summary\n\nTop Candidates:\n${result.candidates
        .slice(0, 3)
        .map((c, i) => `${i + 1}. ${c.name} - ${c.jobFitScore}% fit`)
        .join("\n")}\n\nFull report attached.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    toast.success("Email client opened!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToReport} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Export as Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport} className="gap-2 cursor-pointer">
          <Printer className="h-4 w-4" />
          Print Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={emailReport} className="gap-2 cursor-pointer">
          <Mail className="h-4 w-4" />
          Email Summary
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
