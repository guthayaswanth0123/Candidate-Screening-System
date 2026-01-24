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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, resumes } = (await req.json()) as AnalysisRequest;
    
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

    const systemPrompt = `You are an expert HR analyst and technical recruiter. Your task is to analyze resumes against a job description and provide detailed scoring and analysis.

For each resume, you must extract and analyze:
1. Candidate name and email (if found)
2. Skills mentioned in the resume
3. Relevant work experience
4. Relevant projects
5. How well they match the job requirements

Scoring methodology:
- Job Fit Score (0-100): Weighted average of semantic similarity (60%) and skill match (40%)
- Semantic Score (0-100): How well the resume content aligns with the job description's requirements, responsibilities, and domain
- Skill Match Score (0-100): Percentage of required skills found in the resume

Be thorough but fair in your analysis. Look for both explicit mentions and implicit evidence of skills.`;

    const userPrompt = `Analyze the following resumes against this job description.

JOB DESCRIPTION:
${jobDescription}

RESUMES TO ANALYZE:
${resumes.map((r, i) => `
--- RESUME ${i + 1}: ${r.fileName} ---
${r.resumeText}
`).join("\n")}

Return a JSON object with this exact structure (no markdown, just raw JSON):
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
}

Extract the required skills from the job description first, then analyze each resume against those skills.
Sort candidates by jobFitScore descending (best fit first).`;

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

    // Parse the JSON response, handling potential markdown code blocks
    let analysisResult;
    try {
      // Remove markdown code blocks if present
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
