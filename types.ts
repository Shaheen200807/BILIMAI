
export enum Subject {
  MATH = 'Математика',
  LOGIC = 'Логика',
  READING = 'Грамотность чтения',
  CRITICAL = 'Критическое мышление'
}

export type Language = 'ru' | 'kk';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AppMode = 'lesson' | 'daily' | 'mini-exam' | 'full-exam';

export interface Step {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic?: string; // Для анализа слабых тем
}

export interface Problem {
  id: string;
  title: string;
  subject: Subject;
  difficulty: Difficulty;
  steps: Step[];
}

export interface Achievement {
  id: string;
  title: { ru: string; kk: string };
  description: { ru: string; kk: string };
  icon: string;
  unlocked: boolean;
  requirement: number;
  type: 'points' | 'solved' | 'streak';
}

export interface UserStats {
  email: string;
  password?: string;
  name: string;
  points: number;
  hearts: number;
  level: number;
  currentStreak: number;
  lastActivityDate?: string; // Для системы страйков
  solvedCount: number;
  solvedToday: number;
  correctAnswers: number;
  mistakesCount: number;
  subjectProgress: Record<string, number>;
  weakTopics?: Record<string, number>; // Анализ слабых тем
  achievements: Achievement[];
  avatar: string;
}

export type View = 'dashboard' | 'lesson' | 'parent' | 'profile' | 'auth' | 'exam-result';
