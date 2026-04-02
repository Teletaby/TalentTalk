import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, groqApiKey } = await req.json();
    console.log("TTS request received, text length:", text?.length || 0);
    
    if (!groqApiKey) {
      console.error("GROQ_API_KEY not provided by client");
      return new Response(JSON.stringify({ 
        error: "TTS service not configured",
        details: "GROQ_API_KEY is missing."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!text || text.trim().length === 0) {
      console.error("No text provided in TTS request");
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Calling Groq TTS API with model: playai-tts, voice: Arista-PlayAI");
    const requestBody = {
      model: "playai-tts",
      input: text,
      voice: "Arista-PlayAI",
      response_format: "mp3",
      speed: 1.0,
    };
    
    console.log("Request payload:", JSON.stringify(requestBody, null, 2));
    
    const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Groq API response status:", response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error response:", response.status, errText);
      
      // Try to parse error response
      let errorDetails = errText;
      try {
        const errJson = JSON.parse(errText);
        errorDetails = JSON.stringify(errJson, null, 2);
      } catch (e) {
        // Not JSON, use as is
      }
      
      console.error("Full error details:", errorDetails);
      
      return new Response(JSON.stringify({ 
        error: "TTS service error",
        details: `Groq API returned ${response.status}. ${errorDetails}`,
        hint: response.status === 401 ? "Invalid API key" : response.status === 400 ? "Invalid model or voice name" : "Unknown error"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("Audio buffer received successfully:", audioBuffer.byteLength, "bytes");

    if (audioBuffer.byteLength === 0) {
      console.error("Groq API returned empty audio buffer");
      return new Response(JSON.stringify({ 
        error: "TTS service error",
        details: "Groq API returned empty audio"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("TTS function error:", errorMsg);
    console.error("Stack trace:", e);
    return new Response(JSON.stringify({ 
      error: "TTS function error",
      details: errorMsg
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
