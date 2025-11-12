export interface Question {
  id: number;
  question: string;
  options: [string, string, string];
  correctAnswer: 0 | 1 | 2;
}

export interface QuizData {
  questions: Question[];
}

export interface GameState {
  currentQuestionIndex: number;
  timeLeft: number;
  hunterScore: number;
  contestantScore: number;
  isActive: boolean;
  questions: Question[];
}

export interface Answer {
  playerId: string;
  questionId: number;
  answerIndex: number;
  timeSpent: number;
}