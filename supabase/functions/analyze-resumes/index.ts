import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResumeData {
  fileName: string;
  resumeText: string;
}

interface AnalysisRequest {
  jobDescription: string;
  resumes: ResumeData[];
  mode: "candidate" | "recruiter";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, resumes, mode = "recruiter" } = (await req.json()) as AnalysisRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!jobDescription || !resumes || resumes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Job description and resumes are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isCandidateMode = mode === "candidate";

    const systemPrompt = isCandidateMode
      ? `You are an expert career counselor and resume analyst. Your task is to analyze a single resume against a job description and provide detailed, actionable feedback to help the candidate improve their chances.

For the resume, you must analyze:
1. Candidate name and email (if found)
2. Skills present in the resume that match the JD
3. Skills missing from the resume that the JD requires
4. Extra/additional skills the candidate has beyond what the JD asks for
5. Relevant work experience
6. Relevant projects
7. ATS compatibility assessment
8. Specific improvement suggestions
9. Section-wise scoring (Skills, Experience, Projects, Education, Formatting) each 0-100
10. Experience level detection (Fresher, Junior, Mid-Level, Senior) based on years and project count
11. Suggested job roles the candidate is suitable for (3-5 roles)
12. Missing powerful action words the candidate should use (e.g., Implemented, Designed, Optimized, Automated)
13. Keyword density analysis - count occurrences of important JD keywords in the resume
14. Grammar and spelling issues found in the resume with corrections
15. Resume formatting score (0-100) based on font consistency, section order, length, bullet usage
16. Improvement checklist - specific actionable items like "Add GitHub link", "Add certifications", etc.

Scoring methodology:
- Job Fit Score (0-100): Weighted combination of semantic similarity (40%) + skill match (30%) + experience relevance (20%) + ATS format (10%)
- Semantic Score (0-100): How well the resume content aligns with the JD requirements
- Skill Match Score (0-100): Percentage of required skills found in the resume
- ATS Score (0-100): How well-formatted the resume is for ATS systems

Be thorough, fair, and constructive. The goal is to help the candidate improve.`
      : `You are an expert HR analyst and technical recruiter. Your task is to analyze resumes against a job description and provide detailed scoring and analysis.

For each resume, you must extract and analyze:
1. Candidate name and email (if found)
2. Skills mentioned in the resume
3. Relevant work experience
4. Relevant projects
5. How well they match the job requirements

Scoring methodology:
- Job Fit Score (0-100): Weighted average of semantic similarity (60%) and skill match (40%)
- Semantic Score (0-100): How well the resume content aligns with the job description's requirements
- Skill Match Score (0-100): Percentage of required skills found in the resume

Be thorough but fair in your analysis. Look for both explicit mentions and implicit evidence of skills.`;

    const candidateResponseFormat = `Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "requiredSkills": ["skill1", "skill2", ...],
  "candidates": [
    {
      "fileName": "original filename",
      "name": "Candidate Name or 'Unknown'",
      "email": "email@example.com or empty string",
      "jobFitScore": 75,
      "semanticScore": 80,
      "skillMatchScore": 65,
      "atsScore": 70,
      "matchedSkills": ["skill1", "skill2"],
      "missingSkills": ["skill3", "skill4"],
      "extraSkills": ["additional_skill1", "additional_skill2"],
      "relevantExperience": ["Experience point 1"],
      "relevantProjects": ["Project description 1"],
      "summary": "Brief 2-sentence summary of the candidate's fit",
      "improvementSuggestions": ["tip1", "tip2", "tip3"],
      "atsTips": ["ats tip 1", "ats tip 2"],
      "missingKeywords": ["keyword1", "keyword2"],
      "sectionScores": [
        {"section": "Skills", "score": 80},
        {"section": "Experience", "score": 40},
        {"section": "Projects", "score": 70},
        {"section": "Education", "score": 60},
        {"section": "Formatting", "score": 50}
      ],
      "experienceLevel": "Fresher",
      "suggestedRoles": ["Data Analyst", "Junior Developer", "ML Intern"],
      "actionWordsToAdd": ["Implemented", "Designed", "Optimized", "Automated", "Engineered"],
      "keywordDensity": [
        {"keyword": "Python", "count": 5},
        {"keyword": "SQL", "count": 2},
        {"keyword": "React", "count": 0}
      ],
      "grammarIssues": [
        {"original": "Developed many project", "suggestion": "Developed many projects"}
      ],
      "formattingScore": 65,
      "improvementChecklist": [
        "Add 2 more projects",
        "Add GitHub link",
        "Add LinkedIn profile",
        "Add certifications section",
        "Improve professional summary"
      ]
    }
  ]
}`;

    const recruiterResponseFormat = `Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "requiredSkills": ["skill1", "skill2", ...],
  "candidates": [
    {
      "fileName": "original filename",
      "name": "Candidate Name or 'Unknown'",
      "email": "email@example.com or empty string",
      "jobFitScore": 75,
      "semanticScore": 80,
      "skillMatchScore": 65,
      "matchedSkills": ["skill1", "skill2"],
      "missingSkills": ["skill3", "skill4"],
      "relevantExperience": ["Experience point 1", "Experience point 2"],
      "relevantProjects": ["Project description 1", "Project description 2"],
      "summary": "Brief 2-sentence summary of the candidate's fit"
    }
  ]
}`;

    const userPrompt = `Analyze the following resume${resumes.length > 1 ? 's' : ''} against this job description.

JOB DESCRIPTION:
${jobDescription}

RESUME${resumes.length > 1 ? 'S' : ''} TO ANALYZE:
${resumes.map((r, i) => `
--- RESUME ${i + 1}: ${r.fileName} ---
${r.resumeText}
`).join("\n")}

${isCandidateMode ? candidateResponseFormat : recruiterResponseFormat}

Extract the required skills from the job description first, then analyze each resume against those skills.
Sort candidates by jobFitScore descending (best fit first).
${isCandidateMode ? 'For extraSkills, identify skills the candidate has that are NOT in the job description but could be valuable. For improvementSuggestions, provide 3-5 specific, actionable tips. For atsTips, provide 2-4 ATS optimization tips. For missingKeywords, list important keywords from the JD not found in the resume. For sectionScores, evaluate each section (Skills, Experience, Projects, Education, Formatting) individually 0-100. For experienceLevel, determine Fresher/Junior/Mid-Level/Senior based on years and projects. For suggestedRoles, suggest 3-5 job titles the candidate is suitable for. For actionWordsToAdd, suggest 5-8 powerful resume verbs missing. For keywordDensity, count occurrences of top 8 JD keywords in the resume. For grammarIssues, find 1-5 grammar/spelling issues with corrections. For formattingScore, rate 0-100. For improvementChecklist, give 5-8 specific actionable items.' : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze resumes" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let analysisResult;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      analysisResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis results");
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-resumes error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
