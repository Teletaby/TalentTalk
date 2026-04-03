import type { ChatMessage } from "@/types/interview";

export async function sendChatMessage(
  messages: ChatMessage[],
  jobDescription: string,
  resumeText: string
): Promise<string> {
  try {
    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured in .env");
    }

    console.log("Sending chat message with", messages.length, "messages");

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
- IMPORTANTLY: Ask specific questions about their resume - their past projects, skills, experience, and how it relates to this job
- Follow up on answers naturally — probe deeper when answers are vague
- Be encouraging but honest
- Keep responses conversational and under 3 sentences typically
- After 5-7 questions, wrap up Part 1 and transition to the technical assessment
- When ready to end Part 1, include "[INTERVIEW_PART1_COMPLETE]" in your response

Do NOT be robotic. Speak like a real recruiter would in a professional interview setting.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    console.log("Groq chat response status:", response.status);

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorDetail = `HTTP ${response.status}`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          console.error("Groq chat error:", errorData);
          errorDetail += `: ${JSON.stringify(errorData)}`;
        } else {
          const errorText = await response.text();
          console.error("Groq chat error text:", errorText);
          errorDetail += `: ${errorText}`;
        }
      } catch (e) {
        errorDetail += ": Unable to parse error response";
      }

      throw new Error(`Groq chat error - ${errorDetail}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq chat returned no response content");
    }

    console.log("Chat response received:", content.substring(0, 50));
    return content;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("Chat API error:", errorMsg);
    throw new Error(`Chat failed: ${errorMsg}`);
  }
}

export async function textToSpeech(text: string, voice: string = "diana"): Promise<Blob> {
  try {
    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured in .env");
    }
    
    console.log("Calling Groq Orpheus TTS API...");
    console.log("Text length:", text.length);
    console.log("Selected voice:", voice);
    
    const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "canopylabs/orpheus-v1-english",
        input: text,
        voice: voice,
        response_format: "wav",
      }),
    });

    console.log("Groq Orpheus API response status:", response.status);
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorDetail = `HTTP ${response.status}`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          console.error("Groq error response:", errorData);
          errorDetail += `: ${JSON.stringify(errorData)}`;
        } else {
          const errorText = await response.text();
          console.error("Groq error text:", errorText);
          errorDetail += `: ${errorText}`;
        }
      } catch (e) {
        errorDetail += ": Unable to parse error response";
      }
      
      throw new Error(`Groq Orpheus TTS error - ${errorDetail}`);
    }

    const blob = await response.blob();
    console.log("Audio blob received:", blob.type, blob.size, "bytes");
    
    if (blob.size === 0) {
      throw new Error("Groq Orpheus API returned empty audio");
    }
    
    return blob;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("TTS error:", errorMsg);
    throw new Error(`Text-to-speech failed: ${errorMsg}`);
  }
}

export async function speechToText(audioBlob: Blob): Promise<string> {
  try {
    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured in .env");
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("language", "en");
    formData.append("response_format", "json");

    console.log("Calling Groq STT API directly...");
    
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
      },
      body: formData,
    });

    console.log("STT response status:", response.status);
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      let errorDetail = `HTTP ${response.status}`;
      
      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          console.error("Groq STT error:", errorData);
          errorDetail += `: ${JSON.stringify(errorData)}`;
        } else {
          const errorText = await response.text();
          console.error("Groq STT error text:", errorText);
          errorDetail += `: ${errorText}`;
        }
      } catch (e) {
        errorDetail += ": Unable to parse error response";
      }
      
      throw new Error(`Groq STT error - ${errorDetail}`);
    }

    const data = await response.json();
    console.log("STT transcription result:", data.text?.substring(0, 50));
    return data.text;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("STT fetch error:", errorMsg);
    throw new Error(`Speech-to-text failed: ${errorMsg}`);
  }
}

export async function testGroqConnection(): Promise<boolean> {
  try {
    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqApiKey) {
      console.error("❌ GROQ_API_KEY not configured");
      return false;
    }

    console.log("🧪 Testing Groq API connection...");
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: "Say 'Hello World' in exactly 2 words." },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      console.error("❌ Groq test failed:", response.status, await response.text());
      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    console.log("✅ Groq test successful:", content);
    return true;
  } catch (e) {
    console.error("❌ Groq test error:", e);
    return false;
  }
}

export async function generateTechnicalQuestions(jobDescription: string, resumeText: string = "") {
  try {
    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured in .env");
    }

    console.log("📋 Job description length:", jobDescription?.length);
    console.log("📄 Resume length:", resumeText?.length);
    console.log("📋 Job description preview:", jobDescription?.substring(0, 200) + "...");
    console.log("📄 Resume preview:", resumeText?.substring(0, 200) + "...");

    const hasResume = resumeText?.trim().length > 0;
    
    const systemPrompt = `You are an expert interviewer conducting assessments for various roles.

Analyze the job description${hasResume ? " and resume" : ""} provided, then generate exactly 5 assessment questions specifically tailored to this position${hasResume ? " and candidate" : ""}.

QUESTION TYPES:
- "multiple_choice": Knowledge testing with exactly 4 options
- "short_answer": Analysis or experience questions (options: null)
- "code": Coding problems for tech roles (options: null)  
- "exercise": Case studies or scenarios (options: null, include instructions)

DIFFICULTY: "easy", "medium", or "hard"

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Specific question about the job requirements",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "difficulty": "medium"
    }
  ]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `JOB DESCRIPTION:\n${jobDescription}${hasResume ? `\n\nRESUME:\n${resumeText}\n\nBased on the above job description and resume, generate 5 assessment questions specifically tailored to this position and candidate. Focus on the key requirements and skills mentioned in the job description, and consider the candidate's background from their resume.` : "\n\nNote: No candidate resume was provided. Generate 5 assessment questions based on the job description and typical requirements for this type of role."}` },
        ],
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });

    console.log("🔍 API response status:", response.status);
    console.log("🔍 API response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Groq technical error:", response.status, errText);
      throw new Error(`Technical question generation failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("✅ API response received");
    console.log("📝 Raw content:", content);

    let questions;
    try {
      // Try to parse the content as JSON
      let jsonContent = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find JSON in the content
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      questions = JSON.parse(jsonContent);
      
      // Validate the structure
      if (!questions || typeof questions !== 'object') {
        throw new Error("Response is not a valid object");
      }
      
      // If questions is directly an array, wrap it
      if (Array.isArray(questions)) {
        questions = { questions };
      }
      
      // If questions.questions doesn't exist, try to find it
      if (!questions.questions && questions.questions !== undefined) {
        // Look for any array property that might contain questions
        const arrayKeys = Object.keys(questions).filter(key => Array.isArray(questions[key]));
        if (arrayKeys.length > 0) {
          questions.questions = questions[arrayKeys[0]];
        }
      }
      
      console.log("✅ Parsed questions successfully:", questions);
      console.log("📊 Questions array length:", questions.questions?.length);
    } catch (parseError) {
      console.error("❌ Failed to parse technical questions JSON");
      console.error("❌ Parse error:", parseError);
      console.error("❌ Raw content that failed to parse:", content);
      throw new Error("Could not parse AI response. Please ensure the API is working correctly.");
    }

    if (!questions || !Array.isArray(questions.questions)) {
      console.error("❌ Invalid questions structure:", questions);
      console.error("❌ Questions type:", typeof questions);
      console.error("❌ Has questions property:", 'questions' in questions);
      console.error("❌ Questions property type:", typeof questions.questions);
      console.error("❌ Is questions an array:", Array.isArray(questions.questions));
      throw new Error("The AI service returned an invalid questions format. Please try again.");
    }

    if (!questions.questions || questions.questions.length === 0) {
      throw new Error("No valid questions were generated by the AI service.");
    }

    return questions.questions;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("Technical questions error:", errorMsg);
    throw e;
  }
}

export async function evaluateInterview(
  interviewTranscript: string,
  technicalAnswers: Record<number, string>,
  jobDescription: string,
  resumeText: string
) {
  try {
    const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured in .env");
    }

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
        "Authorization": `Bearer ${groqApiKey}`,
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
      throw new Error(`Interview evaluation failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let evaluation;
    try {
      evaluation = JSON.parse(content);
    } catch {
      console.error("Failed to parse evaluation JSON:", content);
      evaluation = { 
        passed: false, 
        overallScore: 0, 
        summary: content, 
        categories: [], 
        strengths: [], 
        improvements: [], 
        recommendation: "Unable to parse evaluation" 
      };
    }

    return evaluation;
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("Interview evaluation error:", errorMsg);
    throw new Error(`Failed to evaluate interview: ${errorMsg}`);
  }
}
