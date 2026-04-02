export interface InterviewState {
  step: 'setup' | 'interview' | 'technical' | 'evaluation' | 'results';
  jobDescription: string;
  resumeText: string;
  chatMessages: ChatMessage[];
  interviewTranscript: string;
  technicalQuestions: TechnicalQuestion[];
  technicalAnswers: Record<number, string>;
  evaluation: EvaluationResult | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TechnicalQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'code' | 'short_answer' | 'exercise';
  options: string[] | null;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions?: string;
}

export interface EvaluationResult {
  passed: boolean;
  overallScore: number;
  categories: { name: string; score: number; feedback: string }[];
  strengths: string[];
  improvements: string[];
  summary: string;
  recommendation: string;
}
