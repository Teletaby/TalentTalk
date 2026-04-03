// TTS Provider abstraction - supports multiple text-to-speech backends

export type TTSProvider = "web-speech" | "deepgram";

/**
 * Web Speech API - Browser native TTS
 * Free, no limits, uses device's native voices
 * Works offline (voices pre-loaded on device)
 */
export async function webSpeechTTS(
  text: string,
  voice: string = "diana"
): Promise<{ played: boolean; error?: string }> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve({
        played: false,
        error: "Web Speech API not supported in this browser",
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Map our voice names to available system voices
    const voiceMap: Record<string, string> = {
      diana: "female", // Female voice preference
      autumn: "female",
      hannah: "female",
      austin: "male", // Male voice preference
      daniel: "male",
      troy: "male",
    };

    const preferredGender = voiceMap[voice] || "female";

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(
      (v) =>
        v.name.toLowerCase().includes(preferredGender) ||
        (preferredGender === "female" && v.name.toLowerCase().includes("samantha")) ||
        (preferredGender === "male" && v.name.toLowerCase().includes("alex"))
    ) || voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      resolve({ played: true });
    };

    utterance.onerror = (event) => {
      resolve({
        played: false,
        error: `Speech synthesis error: ${event.error}`,
      });
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      resolve({
        played: false,
        error: error instanceof Error ? error.message : "Speech synthesis failed",
      });
    }
  });
}

/**
 * Deepgram TTS - Premium voice quality via Deepgram API
 * Natural-sounding voices with multiple speaker options
 * Requires DEEPGRAM_API_KEY environment variable
 */
export async function gttsPlayAudio(
  text: string,
  voice: string = 'diana',
  provider: 'gtts' | 'deepgram' = 'gtts'
): Promise<{ played: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const encodedText = encodeURIComponent(text);
      const url = `/api/speak?text=${encodedText}&voice=${voice}`;

      const audio = new Audio(url);
      
      audio.onended = () => {
        resolve({ played: true });
      };

      audio.onerror = () => {
        resolve({
          played: false,
          error: "Failed to load audio from TTS service",
        });
      };

      audio.play().catch((err) => {
        resolve({
          played: false,
          error: `Audio playback failed: ${err.message}`,
        });
      });
    } catch (error) {
      resolve({
        played: false,
        error: error instanceof Error ? error.message : "TTS generation failed",
      });
    }
  });
}

/**
 * Edge-TTS (Microsoft Azure Neural voices via Python backend)
 * Premium quality, human-like voices
 * Requires Python Flask backend running on localhost:5000
 */
export async function edgeTtsPlayAudio(
  text: string,
  voice: string = "diana"
): Promise<{ played: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      // Map our voice names to Microsoft Edge/Azure voices
      const voiceMap: Record<string, string> = {
        diana: "en-US-AvaNeural", // Female - professional
        autumn: "en-US-AmberNeural", // Female - warm
        hannah: "en-US-AriaNeural", // Female - friendly
        austin: "en-US-GuyNeural", // Male - professional
        daniel: "en-US-EricNeural", // Male - calm
        troy: "en-US-GraysonNeural", // Male - energetic
      };

      const edgeVoice = voiceMap[voice] || "en-US-AvaNeural";
      const encodedText = encodeURIComponent(text);

      // Determine backend URL
      const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `http://127.0.0.1:5000/speak?text=${encodedText}&voice=${edgeVoice}`
        : `/api/speak?text=${encodedText}&voice=${edgeVoice}`;

      console.log("Calling Edge-TTS backend at:", backendUrl);

      const audio = new Audio(backendUrl);

      const handleSuccess = () => {
        console.log("Edge-TTS audio playback completed");
        resolve({ played: true });
      };

      const handleError = () => {
        console.log("Edge-TTS failed, falling back to Groq TTS...");
        // Automatically fallback to Groq if Edge-TTS fails
        import("./groq-api").then(({ textToSpeech }) => {
          textToSpeech(text, voice)
            .then((audioBlob) => {
              const audio = new Audio(URL.createObjectURL(audioBlob));
              audio.onended = () => resolve({ played: true });
              audio.onerror = () =>
                resolve({
                  played: false,
                  error: "Audio playback failed after fallback",
                });
              audio.play();
            })
            .catch(() => {
              resolve({
                played: false,
                error: `Edge-TTS backend unavailable. Groq fallback also failed. Please ensure your API key is set.`,
              });
            });
        });
      };

      audio.onended = handleSuccess;
      audio.onerror = handleError;

      audio.play().catch((err) => {
        console.error("Edge-TTS playback error:", err);
        console.log("Falling back to Groq TTS...");
        // Automatically fallback to Groq if Edge-TTS fails
        import("./groq-api").then(({ textToSpeech }) => {
          textToSpeech(text, voice)
            .then((audioBlob) => {
              const audio = new Audio(URL.createObjectURL(audioBlob));
              audio.onended = () => resolve({ played: true });
              audio.onerror = () =>
                resolve({
                  played: false,
                  error: "Audio playback failed after fallback",
                });
              audio.play();
            })
            .catch(() => {
              resolve({
                played: false,
                error: `Edge-TTS failed (403 error from Microsoft). Groq fallback also failed. Try refreshing or using Groq provider directly.`,
              });
            });
        });
      });
    } catch (error) {
      resolve({
        played: false,
        error: error instanceof Error ? error.message : "Edge-TTS failed",
      });
    }
  });
}

/**
 * Get available Web Speech API voices
 */
export function getWebSpeechVoices() {
  if (!("speechSynthesis" in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Stop Web Speech playback
 */
export function stopWebSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Deepgram TTS - Via backend API
 * Uses the deployed backend at /api/speak endpoint
 */
export async function deepgramPlayAudio(
  text: string,
  voice: string = 'diana'
): Promise<{ played: boolean; error?: string }> {
  return gttsPlayAudio(text, voice, 'deepgram');
}
