import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { jobDescription, resumeText } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const systemPrompt = `You are a technical interviewer at JSquared Recruitment. Based on the job description and resume, generate exactly 5 technical assessment questions appropriate for the role.

Return your response as valid JSON:
{
  "questions": [
    {
      "id": number,
      "question": string,
      "type": "multiple_choice" | "code" | "short_answer",
      "options": string[] | null,
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

Mix question types. Include at least one coding/practical question if the role is technical. For non-technical roles, focus on scenario-based and analytical questions. Make questions specific to the job requirements.`;

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
          { role: "user", content: `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}\n\nGenerate 5 technical questions.` },
        ],
        temperature: 0.5,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq technical error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Technical question generation error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let questions;
    try {
      questions = JSON.parse(content);
    } catch {
      questions = { questions: [] };
    }

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Technical Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
