export type SubjectType = 'reasoning' | 'ga' | 'quant' | 'english';

export interface Question {
  id: string;
  section: SubjectType;
  questionNumber: number;
  textEn: string;
  textHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number; // 0, 1, 2, 3
  explanationEn: string;
  explanationHi: string;
  topic?: string;
  difficulty?: 'Easy' | 'Moderate' | 'Hard';
}

export interface Paper {
  id: string;
  title: string;
  hindiTitle: string;
  year: number;
  shift?: string;
  examDate?: string;
  type: 'pyq' | 'mock' | 'sectional';
  totalQuestions: number;
  totalMarks: number;
  durationMinutes: number; // 60 mins standard
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  sectionsIncluded: SubjectType[];
  questions: Question[];
  expectedCutoffUR: number;
  tags: string[];
}

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked';

export interface UserResponse {
  selectedOption: number | null; // 0-3 or null
  status: QuestionStatus;
  timeSpentSeconds: number;
  isBookmarked?: boolean;
}

export interface TestAttempt {
  id: string;
  paperId: string;
  paperTitle: string;
  date: string;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  accuracy: number;
  totalTimeSeconds: number;
  responses: Record<string, UserResponse>;
  sectionScores: Record<SubjectType, {
    attempted: number;
    correct: number;
    wrong: number;
    score: number;
  }>;
}

export interface BookmarkItem {
  questionId: string;
  paperId: string;
  paperTitle: string;
  question: Question;
  addedAt: string;
  userNotes?: string;
}

export interface DailyQuizAttempt {
  date: string; // YYYY-MM-DD
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  accuracy: number;
  timeSpentSeconds: number;
  userResponses: Record<string, number | null>;
  completedAt: string;
  userName: string;
}

export interface DailyLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  state?: string;
  score: number;
  accuracy: number;
  timeSeconds: number;
  isCurrentUser?: boolean;
  badge?: string;
  date: string;
}

export interface DailyStreakInfo {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string;
  completedDates: string[];
}

export interface PDFBundleSection {
  titleEn: string;
  titleHi: string;
  subheadingEn: string;
  subheadingHi: string;
  keyFormulasOrTricksEn: string[];
  keyFormulasOrTricksHi: string[];
  questions: Question[];
}

export interface PDFBundle {
  id: string;
  title: string;
  hindiTitle: string;
  taglineEn: string;
  taglineHi: string;
  category: 'expected' | 'pyq-capsule' | 'gk-brahmastra' | 'quant-tricks' | 'english-booster';
  price: number; // 49
  originalPrice: number; // 199
  pageCount: number;
  totalQuestions: number;
  fileSizeMb: string;
  rating: number;
  totalRatings: number;
  downloadsCount: number;
  isBestseller?: boolean;
  isHot?: boolean;
  descriptionEn: string;
  descriptionHi: string;
  highlightsEn: string[];
  highlightsHi: string[];
  sections: PDFBundleSection[];
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  authProvider: 'gmail' | 'mobile_otp' | 'both';
  targetExam: string;
  targetScore: number;
  category: 'UR' | 'OBC' | 'EWS' | 'SC' | 'ST';
  state?: string;
  createdAt: string;
  lastLoginAt: string;
}

