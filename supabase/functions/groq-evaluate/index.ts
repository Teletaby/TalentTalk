import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { interviewTranscript, technicalAnswers, jobDescription, resumeText } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const systemPrompt = `You are an expert interview evaluator at JSquared Recruitment. Analyze the candidate's interview performance and provide a detailed evaluation.

Return your evaluation as valid JSON with this structure:
{
  "passed": boolean,
  "overallScore": number (0-100),
  "categories": [
    { "name": string, "score": number (0-100), "feedback": string }
  ],
  "strengths": [string],
  "improvements": [string],
  "summary": string,
  "recommendation": string
}

Categories to evaluate:
1. Communication Skills
2. Technical Knowledge
3. Problem Solving
4. Cultural Fit
5. Experience Relevance

A candidate passes if their overall score is 70 or above. Be fair but thorough.`;

    const userPrompt = `JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

INTERVIEW TRANSCRIPT:
${interviewTranscript}

TECHNICAL TEST ANSWERS:
${JSON.stringify(technicalAnswers, null, 2)}

Please evaluate this candidate.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq eval error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Evaluation service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let evaluation;
    try {
      evaluation = JSON.parse(content);
    } catch {
      evaluation = { passed: false, overallScore: 0, summary: content, categories: [], strengths: [], improvements: [], recommendation: "Unable to parse evaluation" };
    }

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Eval Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
