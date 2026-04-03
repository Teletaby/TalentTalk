import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Loader2, PhoneOff, Video, VideoOff, MoreHorizontal, MessageSquare, Hand, Users, Monitor, Share, Smile } from "lucide-react";
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
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Teams Header */}
      <div className="teams-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Interview Meeting</h1>
            <p className="text-sm text-gray-500">Sarah Mitchell — Senior Talent Acquisition</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`teams-button ${isHandRaised ? 'bg-yellow-100 text-yellow-800' : ''}`}
          >
            <Hand className="w-4 h-4 mr-2" />
            Raise Hand
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="teams-button"
          >
            <Users className="w-4 h-4 mr-2" />
            People
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="teams-button"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button variant="ghost" size="sm" className="teams-button">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Interviewer Video Feed */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full max-w-4xl max-h-96 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Placeholder for interviewer video */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 opacity-50"></div>
              <div className="relative z-10 text-center text-white">
                <div className="w-32 h-32 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold">SM</span>
                </div>
                <h3 className="text-xl font-semibold mb-1">Sarah Mitchell</h3>
                <p className="text-blue-200">Senior Talent Acquisition</p>
                {isSpeaking && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Speaking</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Self Video Feed */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            {isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">Y</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg">
            <Button
              onClick={() => setIsVideoOn(!isVideoOn)}
              variant={isVideoOn ? "default" : "destructive"}
              size="lg"
              className={`rounded-full w-12 h-12 ${isVideoOn ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button
              onClick={handleToggleRecording}
              disabled={isThinking || isSpeaking || isTranscribing}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={`rounded-full w-14 h-14 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} pulse-ring`}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            <Button
              variant="default"
              size="lg"
              className="rounded-full w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <Share className="w-5 h-5" />
            </Button>

            <Button
              variant="default"
              size="lg"
              className="rounded-full w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <Smile className="w-5 h-5" />
            </Button>

            <Button
              onClick={() => {/* End interview */}}
              variant="destructive"
              size="lg"
              className="rounded-full w-12 h-12 bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isRecording && (
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Recording
              </div>
            )}
            {isTranscribing && (
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Transcribing...
              </div>
            )}
            {isThinking && (
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants) && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {showParticipants ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">In this meeting (2)</h3>
                </div>
                <div className="flex-1 p-4 space-y-3">
                  {/* Interviewer */}
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">SM</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Sarah Mitchell</p>
                      <p className="text-sm text-gray-500">Organizer</p>
                    </div>
                    <div className="flex gap-1">
                      <Mic className="w-4 h-4 text-gray-400" />
                      <Volume2 className="w-4 h-4 text-green-500" />
                    </div>
                  </div>

                  {/* Candidate (You) */}
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">Y</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">You</p>
                      <p className="text-sm text-gray-500">Guest</p>
                    </div>
                    <div className="flex gap-1">
                      {isRecording ? <Mic className="w-4 h-4 text-green-500" /> : <MicOff className="w-4 h-4 text-red-500" />}
                      {isVideoOn ? <Video className="w-4 h-4 text-green-500" /> : <VideoOff className="w-4 h-4 text-red-500" />}
                      {isHandRaised && <Hand className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Meeting chat</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}>
                        {msg.role === "assistant" && (
                          <span className="text-xs font-medium text-blue-600 block mb-1">Sarah Mitchell</span>
                        )}
                        {msg.content.replace("[INTERVIEW_PART1_COMPLETE]", "")}
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-gray-500">Sarah is typing...</span>
                      </div>
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span className="text-gray-500">Speaking...</span>
                      </div>
                    </div>
                  )}
                  {audioError && (
                    <div className="flex justify-start">
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 max-w-[80%]">
                        <p className="font-medium mb-1">Audio Issue</p>
                        <p className="text-xs">{audioError}</p>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {interviewComplete && (
                  <div className="p-4 border-t border-gray-200">
                    <Button onClick={handleComplete} className="w-full teams-button-primary">
                      Continue to Technical Test
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
