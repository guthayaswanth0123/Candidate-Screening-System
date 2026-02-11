export interface SectionScore {
  section: string;
  score: number;
}

export interface KeywordFrequency {
  keyword: string;
  count: number;
}

export interface GrammarIssue {
  original: string;
  suggestion: string;
}

export interface SkillProficiency {
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface SoftSkills {
  communication: number;
  leadership: number;
  teamwork: number;
  problemSolving: number;
  adaptability: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  fileName: string;
  resumeText: string;
  jobFitScore: number;
  semanticScore: number;
  skillMatchScore: number;
  atsScore?: number;
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills?: string[];
  relevantExperience: string[];
  relevantProjects: string[];
  summary: string;
  improvementSuggestions?: string[];
  atsTips?: string[];
  missingKeywords?: string[];
  // Section scores
  sectionScores?: SectionScore[];
  experienceLevel?: string;
  suggestedRoles?: string[];
  actionWordsToAdd?: string[];
  keywordDensity?: KeywordFrequency[];
  grammarIssues?: GrammarIssue[];
  formattingScore?: number;
  improvementChecklist?: string[];
  // Recruiter-enhanced fields
  skillProficiency?: SkillProficiency[];
  softSkills?: SoftSkills;
  riskFactors?: string[];
  strengths?: string[];
  weaknesses?: string[];
  recruiterDecision?: 'Shortlist' | 'Consider Later' | 'Reject';
  experienceYears?: number;
  education?: string[];
  certifications?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
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
