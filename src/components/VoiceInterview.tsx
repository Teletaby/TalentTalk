import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2, ArrowRight } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { sendChatMessage, textToSpeech, speechToText } from "@/lib/groq-api";
import { webSpeechTTS, stopWebSpeech, deepgramPlayAudio } from "@/lib/tts-provider";
import type { ChatMessage } from "@/types/interview";

interface VoiceInterviewProps {
  jobDescription: string;
  resumeText: string;
  onComplete: (messages: ChatMessage[], transcript: string) => void;
  selectedVoice?: string;
  ttsProvider?: "web-speech" | "deepgram";
}

export function VoiceInterview({
  jobDescription,
  resumeText,
  onComplete,
  selectedVoice = "diana",
  ttsProvider = "deepgram",
}: VoiceInterviewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);

  const playAudio = useCallback(
    async (text: string) => {
      setAudioError(null);
      try {
        setIsSpeaking(true);
        console.log("Generating audio for:", text.substring(0, 50) + "...");
        console.log("TTS Provider:", ttsProvider);

        if (ttsProvider === "web-speech") {
          // Use Web Speech API (browser native)
          const result = await webSpeechTTS(text, selectedVoice);
          if (!result.played) {
            throw new Error(result.error || "Web Speech API failed");
          }
          setIsSpeaking(false);
        } else {
          // Use Deepgram API (default)
          const result = await deepgramPlayAudio(text, selectedVoice);
          if (!result.played) {
            throw new Error(result.error || "Deepgram TTS failed");
          }
          setIsSpeaking(false);
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        console.error("TTS error:", e);
        setAudioError(`Voice generation failed: ${errorMsg}`);
        setIsSpeaking(false);
      }
    },
    [selectedVoice, ttsProvider]
  );

  const sendMessage = useCallback(async (userText?: string) => {
    setAudioError(null);
    const newMessages = userText
      ? [...messages, { role: "user" as const, content: userText }]
      : messages;

    if (userText) {
      setMessages(newMessages);
    }

    setIsThinking(true);
    try {
      const response = await sendChatMessage(newMessages, jobDescription, resumeText);
      const assistantMsg: ChatMessage = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMsg]);
      setCurrentText(response);

      if (response.includes("[INTERVIEW_PART1_COMPLETE]")) {
        setInterviewComplete(true);
      }

      const textToPlay = response.replace("[INTERVIEW_PART1_COMPLETE]", "");
      console.log("Chat response received, preparing audio playback");
      await playAudio(textToPlay);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Unknown error";
      console.error("Chat error:", e);
      setAudioError(`Chat failed: ${errorMsg}`);
    } finally {
      setIsThinking(false);
    }
  }, [messages, jobDescription, resumeText, playAudio]);

  // Start interview
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      sendMessage();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      setIsTranscribing(true);
      setAudioError(null);
      try {
        const blob = await stopRecording();
        const text = await speechToText(blob);
        if (text.trim()) {
          await sendMessage(text);
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        console.error("Recording error:", e);
        setAudioError(`Recording failed: ${errorMsg}`);
      } finally {
        setIsTranscribing(false);
      }
    } else {
      setAudioError(null);
      await startRecording();
    }
  }, [isRecording, stopRecording, startRecording, sendMessage]);

  const handleComplete = () => {
    const transcript = messages
      .map((m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n\n");
    onComplete(messages, transcript);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heading">Part 1: Interview</h2>
        <p className="text-muted-foreground text-sm">
          Sarah Mitchell — Senior Talent Acquisition, JSquared Recruitment
        </p>
      </div>

      {/* Chat area */}
      <div className="glass-card p-4 h-[350px] overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {msg.role === "assistant" && (
                <span className="text-xs font-medium text-primary block mb-1">Sarah Mitchell</span>
              )}
              {msg.content.replace("[INTERVIEW_PART1_COMPLETE]", "")}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-muted-foreground">Sarah is thinking...</span>
            </div>
          </div>
        )}
        {isSpeaking && (
          <div className="flex justify-start">
            <div className="bg-secondary/50 rounded-xl px-4 py-3 text-sm flex items-center gap-2 border border-primary/50">
              <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-muted-foreground">Generating and playing voice...</span>
            </div>
          </div>
        )}
        {audioError && (
          <div className="flex justify-start">
            <div className="bg-destructive/10 border border-destructive/50 rounded-xl px-4 py-3 text-sm text-destructive max-w-[80%]">
              <p className="font-medium mb-1">Audio Issue</p>
              <p className="text-xs">{audioError}</p>
              <p className="text-xs mt-2 text-muted-foreground">The text is still displayed above. You can read it or try refreshing the page.</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        {isTranscribing && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Transcribing...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleToggleRecording}
          disabled={isThinking || isSpeaking || isTranscribing}
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={`rounded-full w-16 h-16 ${isRecording ? "pulse-ring" : ""}`}
        >
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        {interviewComplete && (
          <Button onClick={handleComplete} size="lg" className="font-heading">
            Continue to Technical Test <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {isRecording ? "Recording... Click to stop and send" : "Click the mic to respond"}
      </p>
    </div>
  );
}
