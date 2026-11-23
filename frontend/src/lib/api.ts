import {
  User,
  Quiz,
  StudentAssignment,
  Student,
  LeaderboardData,
  QuizResult,
  QuizAnalytics,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:4000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('vidyaflow_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          data.message || data.error || `Request failed with status ${res.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (err: any) {
      // Re-throw formatted error
      throw new Error(err.message || 'Network request failed. Is the backend running?');
    }
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    return this.request<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string, role: string) {
    return this.request<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  async demoLogin(role: 'TEACHER' | 'STUDENT', studentIndex?: string) {
    return this.request<{ user: User; accessToken: string }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role, studentIndex }),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- Users Endpoints ---
  async getStudents(): Promise<Student[]> {
    return this.request<Student[]>('/users/students');
  }

  // --- Quizzes Endpoints ---
  async createQuiz(payload: {
    title: string;
    description?: string;
    questions: Array<{
      questionText: string;
      options: Array<{
        optionText: string;
        optionLabel: string;
        isCorrect: boolean;
      }>;
    }>;
  }): Promise<Quiz> {
    return this.request<Quiz>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getTeacherQuizzes(): Promise<Quiz[]> {
    return this.request<Quiz[]>('/quizzes/teacher');
  }

  async getQuizForTeacher(quizId: string): Promise<any> {
    return this.request<any>(`/quizzes/teacher/${quizId}`);
  }

  async getQuizForAttempt(quizId: string): Promise<{
    id: string;
    title: string;
    description: string;
    assignmentId: string;
    totalQuestions: number;
    questions: Array<{
      id: string;
      questionText: string;
      orderIndex: number;
      options: Array<{
        id: string;
        optionText: string;
        optionLabel: string;
      }>;
    }>;
  }> {
    return this.request<any>(`/quizzes/${quizId}/attempt`);
  }

  // --- Assignments Endpoints ---
  async assignQuiz(quizId: string, studentIds: string[]) {
    return this.request<{
      message: string;
      assignedCount: number;
      assignedStudents: string[];
      alreadyAssignedCount: number;
      alreadyAssignedStudents: string[];
    }>('/assignments', {
      method: 'POST',
      body: JSON.stringify({ quizId, studentIds }),
    });
  }

  async getMyAssignments(): Promise<StudentAssignment[]> {
    return this.request<StudentAssignment[]>('/assignments/my');
  }

  async getQuizAssignmentStatus(quizId: string) {
    return this.request<any[]>(`/assignments/quiz/${quizId}`);
  }

  // --- Attempts Endpoints ---
  async submitQuizAttempt(
    quizId: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>,
  ): Promise<{
    attemptId: string;
    quizId: string;
    studentId: string;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracyPercentage: number;
    quizCompletionStatus: string;
    completedAt: string;
  }> {
    return this.request<any>(`/attempts/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getQuizResult(quizId: string): Promise<QuizResult> {
    return this.request<QuizResult>(`/attempts/${quizId}/result`);
  }

  async getStudentQuizResult(quizId: string, studentId: string): Promise<QuizResult> {
    return this.request<QuizResult>(`/attempts/${quizId}/result/${studentId}`);
  }

  // --- Leaderboard Endpoints ---
  async getQuizLeaderboard(quizId: string): Promise<LeaderboardData> {
    return this.request<LeaderboardData>(`/leaderboard/quiz/${quizId}`);
  }

  // --- Analytics Endpoints ---
  async getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
    return this.request<QuizAnalytics>(`/analytics/quiz/${quizId}`);
  }

  async getTeacherOverview(): Promise<{
    totalQuizzes: number;
    totalAssignedCount: number;
    totalCompletedCount: number;
    overallAvgAccuracy: number;
    quizzes: Quiz[];
  }> {
    return this.request<any>('/analytics/overview');
  }
}

export const api = new ApiClient();
