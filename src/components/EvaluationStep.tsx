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
}

export function EvaluationStep({
  interviewTranscript,
  technicalAnswers,
  jobDescription,
  resumeText,
  onRestart,
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
      <div className={`glass-card p-8 text-center space-y-4 ${result.passed ? "glow-border" : ""}`}>
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
          result.passed ? "bg-success/20" : "bg-destructive/20"
        }`}>
          {result.passed ? (
            <Trophy className="w-10 h-10 text-success" />
          ) : (
            <XCircle className="w-10 h-10 text-destructive" />
          )}
        </div>
        <h2 className="text-3xl font-bold font-heading">
          {result.passed ? "You Passed!" : "Not Yet"}
        </h2>
        <div className="text-5xl font-bold font-heading text-primary">
          {result.overallScore}%
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">{result.summary}</p>
      </div>

      {/* Categories */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Detailed Scores
        </h3>
        <div className="space-y-3">
          {result.categories?.map((cat, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{cat.name}</span>
                <span className="font-medium">{cat.score}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    cat.score >= 70 ? "bg-success" : cat.score >= 50 ? "bg-warning" : "bg-destructive"
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{cat.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" /> Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths?.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-success mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-warning" /> Areas to Improve
          </h3>
          <ul className="space-y-2">
            {result.improvements?.map((s, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-warning mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendation */}
      <div className="glass-card p-5">
        <p className="text-sm text-muted-foreground italic">"{result.recommendation}"</p>
      </div>

      <Button onClick={onRestart} size="lg" className="w-full font-heading">
        <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
      </Button>
    </div>
  );
}
