import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Settings, Database, BarChart3 } from "lucide-react";
import { AdminSetup } from "@/components/AdminSetup";
import { VoiceInterview } from "@/components/VoiceInterview";
import { TechnicalTest } from "@/components/TechnicalTest";
import { EvaluationStep } from "@/components/EvaluationStep";
import type { ChatMessage, TechnicalQuestion } from "@/types/interview";

type Step = "setup" | "interview" | "technical" | "evaluation";

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [step, setStep] = useState<Step>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [interviewTranscript, setInterviewTranscript] = useState("");
  const [technicalAnswers, setTechnicalAnswers] = useState<Record<number, string>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Record<string, Record<string, string>>>({});
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    return localStorage.getItem("adminSelectedVoice") || "diana";
  });
  const [ttsProvider, setTtsProvider] = useState<"web-speech" | "deepgram">(() => {
    return (localStorage.getItem("adminTtsProvider") as "web-speech" | "deepgram") || "deepgram";
  });

  useEffect(() => {
    fetch("/api/voices")
      .then((res) => res.json())
      .then(setAvailableVoices);
  }, []);

  const handleSetupComplete = (jd: string, resume: string) => {
    setJobDescription(jd);
    setResumeText(resume);
    setStep("interview");
  };

  const handleInterviewComplete = (_messages: ChatMessage[], transcript: string) => {
    setInterviewTranscript(transcript);
    setStep("technical");
  };

  const handleTechnicalComplete = (_questions: TechnicalQuestion[], answers: Record<number, string>) => {
    setTechnicalAnswers(answers);
    setStep("evaluation");
  };

  const handleRestart = () => {
    setStep("setup");
    setJobDescription("");
    setResumeText("");
    setInterviewTranscript("");
    setTechnicalAnswers({});
  };

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem("adminSelectedVoice", voice);
  };

  const handleTtsProviderChange = (provider: "web-speech" | "deepgram") => {
    setTtsProvider(provider);
    localStorage.setItem("adminTtsProvider", provider);

    // Set a default voice for the new provider
    if (provider === 'deepgram') {
      const deepgramVoices = Object.keys(availableVoices.Deepgram || {});
      const newVoice = 'aura-2-amalthea-en';
      if (deepgramVoices.includes(newVoice)) {
        setSelectedVoice(newVoice);
        localStorage.setItem("adminSelectedVoice", newVoice);
      } else if (deepgramVoices.length > 0) {
        setSelectedVoice(deepgramVoices[0]);
        localStorage.setItem("adminSelectedVoice", deepgramVoices[0]);
      }
    }
    // Add other provider defaults if necessary
  };

  const steps = [
    { key: "setup", label: "Setup", number: 1 },
    { key: "interview", label: "Interview", number: 2 },
    { key: "technical", label: "Technical", number: 3 },
    { key: "evaluation", label: "Results", number: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Admin Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Interview Platform Control</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Step Navigation - Clickable */}
        <div className="border-t bg-muted/30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-center gap-2">
            {steps.map((s, idx) => {
              // For admin panel, allow more flexible navigation
              const isAccessible = 
                s.key === "setup" || 
                s.key === "interview" || // Allow interview even without setup for testing
                s.key === "technical" || // Allow technical even without interview for testing
                (s.key === "evaluation" && (jobDescription || resumeText || interviewTranscript || Object.keys(technicalAnswers).length > 0));

              return (
                <Button
                  key={s.key}
                  onClick={() => setStep(s.key as Step)}
                  disabled={false} // Allow all steps for admin testing
                  variant={step === s.key ? "default" : "outline"}
                  className={`flex flex-col items-center w-24 h-20 ${
                    step === s.key ? "ring-2 ring-primary" : ""
                  } ${!isAccessible ? "opacity-50" : ""}`}
                >
                  <span className="text-lg font-bold">{s.number}</span>
                  <span className="text-xs">{s.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {showSettings ? (
          <Card className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Admin Settings
              </h2>
              <p className="text-sm text-muted-foreground">Configure platform settings and features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placeholder Settings */}
              <Card className="p-4 bg-secondary/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database
                </h3>
                <Button variant="outline" size="sm" className="w-full">
                  View Candidates
                </Button>
              </Card>

              <Card className="p-4 bg-secondary/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </h3>
                <Button variant="outline" size="sm" className="w-full">
                  View Reports
                </Button>
              </Card>

              <Card className="p-4 bg-secondary/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  🎙️ Interview Voice
                </h3>
                <div className="space-y-2">
                  <Select
                    value={selectedVoice}
                    onValueChange={handleVoiceChange}
                    disabled={!availableVoices[ttsProvider]}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices[ttsProvider] ? (
                        Object.entries(availableVoices[ttsProvider]).map(([id, name]) => (
                          <SelectItem key={id} value={id}>
                            {name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-voice" disabled>
                          No voices available for this provider
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selected: <span className="font-medium capitalize">{selectedVoice}</span>
                  </p>
                </div>
              </Card>

              <Card className="p-4 bg-secondary/50">
                <h3 className="font-semibold mb-3">🔊 TTS Provider</h3>
                <div className="space-y-2">
                  <Select value={ttsProvider} onValueChange={(val) => handleTtsProviderChange(val as "web-speech" | "deepgram")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepgram">Deepgram (Top Tier - Neural AI)</SelectItem>
                      <SelectItem value="web-speech">Web Speech API (Browser Native - Free)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {ttsProvider === "deepgram"
                      ? "Premium neural voices with emotional nuance"
                      : "Free device voices, no internet required"}
                  </p>
                </div>
              </Card>
            </div>

            <div className="pt-4">
              <Button onClick={() => setShowSettings(false)} className="w-full">
                Back to Interview
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Interview Content */}
            {step === "setup" && (
              <AdminSetup onStart={handleSetupComplete} />
            )}
            {step === "interview" && (
              <VoiceInterview
                jobDescription={jobDescription}
                resumeText={resumeText}
                onComplete={handleInterviewComplete}
                selectedVoice={selectedVoice}
                ttsProvider={ttsProvider}
              />
            )}
            {step === "technical" && (
              <TechnicalTest
                jobDescription={jobDescription}
                resumeText={resumeText}
                onComplete={handleTechnicalComplete}
              />
            )}
            {step === "evaluation" && (
              <EvaluationStep
                interviewTranscript={interviewTranscript}
                technicalAnswers={technicalAnswers}
                jobDescription={jobDescription}
                resumeText={resumeText}
                onRestart={handleRestart}
                isAdminView={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
