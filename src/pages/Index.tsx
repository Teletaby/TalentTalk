import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SetupStep } from "@/components/SetupStep";
import { VoiceInterview } from "@/components/VoiceInterview";
import { EvaluationStep } from "@/components/EvaluationStep";
import type { ChatMessage } from "@/types/interview";

type Step = "setup" | "interview" | "evaluation";

const Index = () => {
  const [step, setStep] = useState<Step>("setup");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [interviewTranscript, setInterviewTranscript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("diana");
  const [ttsProvider, setTtsProvider] = useState<"web-speech" | "deepgram">("deepgram");

  const handleSetupComplete = (jd: string, resume: string) => {
    setJobDescription(jd);
    setResumeText(resume);
    setStep("interview");
  };

  const handleInterviewComplete = (_messages: ChatMessage[], transcript: string) => {
    setInterviewTranscript(transcript);
    setStep("evaluation");
  };

  const handleRestart = () => {
    setStep("setup");
    setJobDescription("");
    setResumeText("");
    setInterviewTranscript("");
  };

  // Step indicator
  const steps = [
    { key: "setup", label: "Setup" },
    { key: "interview", label: "Interview" },
    { key: "evaluation", label: "Results" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      {/* Voice & Provider Selector - Top Right */}
      {step === "interview" && (
        <div className="w-full max-w-2xl mx-auto mb-4 flex justify-end gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Provider:</label>
            <Select value={ttsProvider} onValueChange={(val) => setTtsProvider(val as "web-speech" | "deepgram")}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deepgram">Deepgram (Premium)</SelectItem>
                <SelectItem value="web-speech">Browser (Free)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Voice:</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={ttsProvider === "web-speech"}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diana">Diana (Professional)</SelectItem>
                <SelectItem value="autumn">Autumn (Warm)</SelectItem>
                <SelectItem value="hannah">Hannah (Friendly)</SelectItem>
                <SelectItem value="austin">Austin (Male)</SelectItem>
                <SelectItem value="daniel">Daniel (Calm)</SelectItem>
                <SelectItem value="troy">Troy (Energetic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* Step indicator */}
      <div className="w-full max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= currentIdx ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  i < currentIdx
                    ? "bg-primary border-primary text-primary-foreground"
                    : i === currentIdx
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}>
                  {i < currentIdx ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {step === "setup" && <SetupStep onStart={handleSetupComplete} />}
        {step === "interview" && (
          <VoiceInterview
            jobDescription={jobDescription}
            resumeText={resumeText}
            onComplete={handleInterviewComplete}
            selectedVoice={selectedVoice}
            ttsProvider={ttsProvider}
          />
        )}
        {step === "evaluation" && (
          <EvaluationStep
            interviewTranscript={interviewTranscript}
            technicalAnswers={{}}
            jobDescription={jobDescription}
            resumeText={resumeText}
            onRestart={handleRestart}
            isAdminView={false}
          />
        )}
      </div>

      {/* Admin Link */}
      <div className="fixed bottom-4 right-4">
        <Link to="/admin">
          <Button variant="outline" size="sm" className="text-xs">
            Admin
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
