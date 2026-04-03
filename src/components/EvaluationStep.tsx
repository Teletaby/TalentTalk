import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, RotateCcw, Trophy, TrendingUp } from "lucide-react";
import { evaluateInterview } from "@/lib/groq-api";
import type { EvaluationResult } from "@/types/interview";

interface EvaluationStepProps {
  interviewTranscript: string;
  technicalAnswers: Record<number, string>;
  jobDescription: string;
  resumeText: string;
  onRestart: () => void;
  isAdminView?: boolean;
}

export function EvaluationStep({
  interviewTranscript,
  technicalAnswers,
  jobDescription,
  resumeText,
  onRestart,
  isAdminView = false,
}: EvaluationStepProps) {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evaluateInterview(interviewTranscript, technicalAnswers, jobDescription, resumeText)
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [interviewTranscript, technicalAnswers, jobDescription, resumeText]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">AI is evaluating your performance...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <p className="text-destructive">Evaluation failed. Please try again.</p>
        <Button onClick={onRestart}>
          <RotateCcw className="w-4 h-4 mr-2" /> Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Result header */}
      <div className={`teams-card p-8 text-center space-y-4 ${result.passed ? "glow-border" : ""}`}>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
          result.passed ? "bg-green-100" : "bg-red-100"
        }`}>
          {result.passed ? (
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>
        <h2 className="text-3xl font-bold font-heading">
          {result.passed ? "Congratulations!" : "Keep Practicing"}
        </h2>
        <div className="text-5xl font-bold font-heading text-blue-600">
          {result.overallScore}%
        </div>
        <p className="text-gray-600 max-w-md mx-auto">{result.summary}</p>
      </div>

      {isAdminView && (
        <>
          {/* Categories */}
          <div className="teams-card p-6 space-y-4">
            <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Detailed Scores
            </h3>
            <div className="space-y-3">
              {result.categories?.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{cat.name}</span>
                    <span className="font-medium">{cat.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        cat.score >= 70 ? "bg-green-500" : cat.score >= 50 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{cat.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="teams-card p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Strengths
              </h3>
              <ul className="space-y-2">
                {result.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-green-600 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="teams-card p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" /> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {result.improvements?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendation */}
          <div className="teams-card p-5">
            <p className="text-sm text-gray-600 italic">"{result.recommendation}"</p>
          </div>
        </>
      )}

      <Button onClick={onRestart} size="lg" className="w-full teams-button-primary">
        <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
      </Button>
    </div>
  );
}
