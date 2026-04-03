import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, Code, BookOpen, MessageSquare, Zap, Clock, User, Building } from "lucide-react";
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
  const [showInstructions, setShowInstructions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("TechnicalTest useEffect triggered");
    console.log("jobDescription length:", jobDescription?.length);
    console.log("resumeText length:", resumeText?.length);
    console.log("jobDescription preview:", jobDescription?.substring(0, 100));
    console.log("resumeText preview:", resumeText?.substring(0, 100));

    // If we have job description, try to generate questions (resume is optional)
    if (jobDescription?.trim()) {
      console.log("Job description present, calling API");
      generateTechnicalQuestions(jobDescription, resumeText || "")
        .then((result) => {
          console.log("API result:", result);
          setQuestions(result);
          setLoading(false);
        })
        .catch((e) => {
          console.error("Technical questions generation error:", e);
          setError(e instanceof Error ? e.message : "Failed to generate technical questions. Please try again.");
          setLoading(false);
        });
    } else {
      console.log("Missing jobDescription");
      setError("Job description is required to generate assessment questions.");
      setLoading(false);
    }
  }, [jobDescription, resumeText]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Preparing Technical Assessment</h2>
          <p className="text-gray-600">Generating personalized questions based on your profile...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Assessment Unavailable</h2>
          <p className="text-gray-600">
            {error || "Unable to generate technical questions at this time."}
          </p>
          <div className="space-y-2">
            {error?.includes("Job description and resume") ? (
              <Button onClick={() => window.history.back()} className="w-full">
                Return to Setup
              </Button>
            ) : (
              <>
                <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                  Try Again
                </Button>
                <Button onClick={() => onComplete([], {})} className="w-full">
                  Continue to Evaluation <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show instructions first
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          {/* Exam Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Assessment</h1>
                  <p className="text-gray-600">
                    {jobDescription?.split('\n')[0]?.substring(0, 50) || 'Position Assessment'}
                    {jobDescription?.split('\n')[0]?.length > 50 ? '...' : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span>Candidate: John Doe</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Duration: ~{Math.ceil(questions.length * 5)} minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment Instructions</h2>
            
            <div className="space-y-4 text-gray-700">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium">Read each question carefully</p>
                  <p className="text-sm text-gray-600">Take your time to understand what is being asked before answering.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium">Answer all questions</p>
                  <p className="text-sm text-gray-600">Complete all {questions.length} questions to receive a full evaluation.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium">Use the navigation buttons</p>
                  <p className="text-sm text-gray-600">You can go back to previous questions and review your answers.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <p className="font-medium">Submit when ready</p>
                  <p className="text-sm text-gray-600">Review all answers before submitting your assessment.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button 
                onClick={() => setShowInstructions(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              >
                Start Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  const typeIcon = q.type === "code" ? <Code className="w-5 h-5" /> 
    : q.type === "multiple_choice" ? <BookOpen className="w-5 h-5" />
    : q.type === "exercise" ? <Zap className="w-5 h-5" />
    : <MessageSquare className="w-5 h-5" />;

  const difficultyColor = q.difficulty === "easy" ? "bg-green-100 text-green-800" 
    : q.difficulty === "medium" ? "bg-yellow-100 text-yellow-800" 
    : "bg-red-100 text-red-800";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Exam Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Technical Assessment</h1>
                <p className="text-sm text-gray-600">Question {currentQ + 1} of {questions.length}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>John Doe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{currentQ + 1} / {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-semibold">{currentQ + 1}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {typeIcon}
                <span className="capitalize">{q.type.replace("_", " ")}</span>
              </div>
            </div>
            <span className={`text-xs font-medium uppercase px-3 py-1 rounded-full ${difficultyColor}`}>
              {q.difficulty}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{q.question}</h2>

            {q.type === "exercise" && q.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Instructions:</p>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">{q.instructions}</p>
                  </div>
                </div>
              </div>
            )}

          {q.type === "multiple_choice" && q.options ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">Select your answer:</p>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  className={`w-full text-left px-4 py-4 rounded-lg border-2 transition-all text-sm ${
                    answers[q.id] === opt
                      ? "border-blue-500 bg-blue-50 text-blue-900 shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      answers[q.id] === opt ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}>
                      {answers[q.id] === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span>{opt}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {q.type === "code" ? "Write your code solution:" : 
                 q.type === "exercise" ? "Describe your approach and provide your solution:" : 
                 "Provide your answer:"}
              </p>
              <Textarea
                placeholder={
                  q.type === "code" ? "Enter your code here..." : 
                  q.type === "exercise" ? "Explain your approach and implementation..." : 
                  "Type your answer here..."
                }
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none ${
                  q.type === "code" ? "font-mono text-sm min-h-[300px]" : "min-h-[150px]"
                }`}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
              disabled={currentQ === 0}
              className="px-6 py-2"
            >
              Previous Question
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: questions.length }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    i === currentQ
                      ? "bg-blue-600 text-white"
                      : answers[questions[i].id]
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {isLast ? (
              <Button
                onClick={() => onComplete(questions, answers)}
                disabled={!answers[q.id]}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold"
              >
                Submit Assessment
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQ((p) => p + 1)}
                disabled={!answers[q.id]}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
