import { apiRequest } from './http';

export type QuizQuestion = {
  id: string;
  slug: string;
  title: string;
  mediaType: 'image' | 'video';
  mediaPath: string;
  sortOrder: number;
};

export type QuizAttemptResult = {
  attemptId: string;
  userId: string | null;
  scorePercent: number;
  averageScorePercent: number;
  attemptsCount: number;
  correctCount: number;
  totalQuestions: number;
  createdAt: string;
  answers: Array<{
    slug: string;
    selectedAnswer: 'ai' | 'real';
    isCorrect: boolean;
  }>;
};

export function getQuizQuestions() {
  return apiRequest<QuizQuestion[]>('/quiz/questions');
}

export function submitQuizAttempt(
  answers: Array<{ slug: string; selectedAnswer: 'ai' | 'real' }>,
  token?: string,
) {
  return apiRequest<QuizAttemptResult>('/quiz/attempts', {
    method: 'POST',
    token,
    body: JSON.stringify({ answers }),
  });
}

export function getQuizAttempt(attemptId: string) {
  return apiRequest<QuizAttemptResult>(`/quiz/attempts/${encodeURIComponent(attemptId)}`);
}
