export type UserRole = 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Option {
  id: string;
  optionText: string;
  optionLabel: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  questionText: string;
  orderIndex: number;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  isPublished?: boolean;
  createdAt?: string;
  totalQuestions: number;
  totalAssigned?: number;
  totalCompleted?: number;
  averageAccuracy?: number;
}

export interface StudentAssignment {
  assignmentId: string;
  quizId: string;
  title: string;
  description: string;
  teacherName: string;
  totalQuestions: number;
  status: 'PENDING' | 'COMPLETED';
  assignedAt: string;
  attempt?: {
    id: string;
    score: number;
    totalQuestions: number;
    accuracy: number;
    completedAt: string;
  } | null;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  correctAnswers: number;
  totalQuestions: number;
  accuracyPercentage: number;
  completedAt: string;
  isCurrentUser: boolean;
}

export interface LeaderboardData {
  quizId: string;
  quizTitle: string;
  totalParticipants: number;
  myRank: number | null;
  myEntry: LeaderboardEntry | null;
  leaderboard: LeaderboardEntry[];
}

export interface QuizResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  quizDescription: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  quizCompletionStatus: string;
  completedAt: string;
  review: Array<{
    questionId: string;
    questionText: string;
    selectedOptionId: string;
    selectedOptionText: string;
    selectedOptionLabel: string;
    isCorrect: boolean;
    correctOption?: {
      id: string;
      optionLabel: string;
      optionText: string;
    };
    allOptions: Array<{
      id: string;
      optionText: string;
      optionLabel: string;
      isCorrect?: boolean;
    }>;
  }>;
}

export interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  quizDescription: string;
  totalQuestions: number;
  overview: {
    totalStudentsAssigned: number;
    totalStudentsCompleted: number;
    totalStudentsPending: number;
    completionRatePercentage: number;
    averageQuizAccuracy: number;
  };
  students: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    completionStatus: 'PENDING' | 'COMPLETED';
    assignedAt: string;
    score: number | null;
    totalQuestions: number;
    accuracyPercentage: number | null;
    completedAt: string | null;
  }>;
}
