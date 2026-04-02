import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, Code, BookOpen, MessageSquare, Zap } from "lucide-react";
import { generateTechnicalQuestions } from "@/lib/groq-api";
import type { TechnicalQuestion } from "@/types/interview";

interface TechnicalTestProps {
  jobDescription: string;
  resumeText: string;
  onComplete: (questions: TechnicalQuestion[], answers: Record<number, string>) => void;
}

export function TechnicalTest({ jobDescription, resumeText, onComplete }: TechnicalTestProps) {
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    generateTechnicalQuestions(jobDescription, resumeText)
      .then((q) => {
        setQuestions(q);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [jobDescription, resumeText]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Generating technical assessment...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 space-y-4">
        <p className="text-muted-foreground">No technical questions generated.</p>
        <Button onClick={() => onComplete([], {})}>
          Skip to Evaluation <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  const q = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  const typeIcon = q.type === "code" ? <Code className="w-4 h-4" /> 
    : q.type === "multiple_choice" ? <BookOpen className="w-4 h-4" />
    : q.type === "exercise" ? <Zap className="w-4 h-4" />
    : <MessageSquare className="w-4 h-4" />;

  const difficultyColor = q.difficulty === "easy" ? "text-success" 
    : q.difficulty === "medium" ? "text-warning" 
    : "text-destructive";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-heading">Part 2: Technical Assessment</h2>
        <p className="text-muted-foreground text-sm">
          Question {currentQ + 1} of {questions.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {typeIcon}
            <span className="capitalize">{q.type.replace("_", " ")}</span>
          </div>
          <span className={`text-xs font-medium uppercase ${difficultyColor}`}>
            {q.difficulty}
          </span>
        </div>

        <p className="text-lg font-medium">{q.question}</p>

        {q.type === "exercise" && q.instructions && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Instructions:</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.instructions}</p>
          </div>
        )}

        {q.type === "multiple_choice" && q.options ? (
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors text-sm ${
                  answers[q.id] === opt
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <Textarea
            placeholder={q.type === "code" ? "Write your code here..." : q.type === "exercise" ? "Describe your approach and implementation..." : "Type your answer..."}
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            className={`bg-background/50 border-border/50 focus:border-primary resize-none ${
              q.type === "code" ? "font-mono min-h-[200px]" : "min-h-[120px]"
            }`}
          />
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
          disabled={currentQ === 0}
        >
          Previous
        </Button>

        {isLast ? (
          <Button
            onClick={() => onComplete(questions, answers)}
            disabled={!answers[q.id]}
          >
            Submit Assessment <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQ((p) => p + 1)}
            disabled={!answers[q.id]}
          >
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
