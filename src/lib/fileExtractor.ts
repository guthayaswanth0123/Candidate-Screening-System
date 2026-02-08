import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  // Plain text
  if (file.type === "text/plain" || name.endsWith(".txt")) {
    return await file.text();
  }

  // DOCX
  if (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 30) {
        return result.value.trim();
      }
    } catch (e) {
      console.warn("DOCX extraction failed:", e);
    }
    return `Resume file: ${file.name}. Could not extract text from this DOCX. Please try saving as PDF or pasting the text directly.`;
  }

  // PDF
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        pages.push(pageText);
      }
      const fullText = pages.join("\n").trim();
      if (fullText.length > 30) {
        return fullText;
      }
    } catch (e) {
      console.warn("PDF extraction failed:", e);
    }
    return `Resume file: ${file.name}. Could not extract text from this PDF. Please try pasting the resume text directly.`;
  }

  // Fallback: try reading as text
  try {
    const text = await file.text();
    const cleaned = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length > 50) {
      return cleaned;
    }
  } catch {
    // ignore
  }

  return `Resume file: ${file.name}. Unsupported format. Please use PDF, DOCX, or TXT files.`;
}
