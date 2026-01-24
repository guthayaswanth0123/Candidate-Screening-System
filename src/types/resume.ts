export interface Candidate {
  id: string;
  name: string;
  email: string;
  fileName: string;
  resumeText: string;
  jobFitScore: number;
  semanticScore: number;
  skillMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  relevantExperience: string[];
  relevantProjects: string[];
  summary: string;
  analyzedAt: Date;
}

export interface AnalysisResult {
  candidates: Candidate[];
  jobDescription: string;
  requiredSkills: string[];
  analyzedAt: Date;
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  extractedText?: string;
}

export interface AnalysisProgress {
  stage: 'idle' | 'extracting' | 'analyzing' | 'scoring' | 'complete' | 'error';
  currentFile?: string;
  progress: number;
  message: string;
}
