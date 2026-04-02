import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, jobDescription, resumeText } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const systemPrompt = `You are Sarah Mitchell, a Senior Talent Acquisition Specialist at JSquared Recruitment with 12 years of experience conducting interviews across tech, finance, and consulting. You speak naturally and professionally — warm but evaluative.

You are conducting a mock interview for a candidate. Here is the context:

JOB DESCRIPTION:
${jobDescription || "Not provided"}

CANDIDATE RESUME:
${resumeText || "Not provided"}

INTERVIEW GUIDELINES:
- Start by warmly greeting the candidate and introducing yourself
- Ask one question at a time, wait for the response
- Ask behavioral, situational, and competency-based questions relevant to the role
- Follow up on answers naturally — probe deeper when answers are vague
- Be encouraging but honest
- Keep responses conversational and under 3 sentences typically
- After 5-7 questions, wrap up Part 1 and transition to the technical assessment
- When ready to end Part 1, include "[INTERVIEW_PART1_COMPLETE]" in your response

Do NOT be robotic. Speak like a real recruiter would in a professional interview setting.`;

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
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm sorry, could you repeat that?";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
