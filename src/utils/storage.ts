import { TestAttempt, BookmarkItem, Question } from '../types';

const ATTEMPTS_KEY = 'chsl_prep_attempts_v1';
const BOOKMARKS_KEY = 'chsl_prep_bookmarks_v1';
const LANG_PREF_KEY = 'chsl_prep_lang_v1';

export function saveTestAttempt(attempt: TestAttempt): void {
  try {
    const existing = getTestAttempts();
    const updated = [attempt, ...existing];
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save test attempt', err);
  }
}

export function getTestAttempts(): TestAttempt[] {
  try {
    const data = localStorage.getItem(ATTEMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read test attempts', err);
    return [];
  }
}

export function getPaperAttempts(paperId: string): TestAttempt[] {
  return getTestAttempts().filter(a => a.paperId === paperId);
}

export function getBookmarks(): BookmarkItem[] {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load bookmarks', err);
    return [];
  }
}

export function toggleBookmark(question: Question, paperId: string, paperTitle: string): boolean {
  try {
    const existing = getBookmarks();
    const idx = existing.findIndex(b => b.questionId === question.id);
    if (idx >= 0) {
      existing.splice(idx, 1);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(existing));
      return false; // removed
    } else {
      const newItem: BookmarkItem = {
        questionId: question.id,
        paperId,
        paperTitle,
        question,
        addedAt: new Date().toISOString(),
      };
      existing.unshift(newItem);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(existing));
      return true; // added
    }
  } catch (err) {
    console.error('Failed to toggle bookmark', err);
    return false;
  }
}

export function isBookmarked(questionId: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.questionId === questionId);
}

export function getStoredLanguage(): 'en' | 'hi' {
  try {
    const lang = localStorage.getItem(LANG_PREF_KEY);
    return lang === 'hi' ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

export function setStoredLanguage(lang: 'en' | 'hi'): void {
  try {
    localStorage.setItem(LANG_PREF_KEY, lang);
  } catch (err) {
    console.error('Failed to store lang pref', err);
  }
}

// -------------------------------------------------------------
// Daily Quiz Storage & Streaks
// -------------------------------------------------------------

const DAILY_ATTEMPTS_KEY = 'chsl_daily_quiz_attempts_v1';
const DAILY_STREAK_KEY = 'chsl_daily_streak_v1';
const USER_NAME_KEY = 'chsl_user_aspirant_name_v1';

export function getDailyQuizAttempts(): import('../types').DailyQuizAttempt[] {
  try {
    const data = localStorage.getItem(DAILY_ATTEMPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read daily attempts', err);
    return [];
  }
}

export function saveDailyQuizAttempt(attempt: import('../types').DailyQuizAttempt): void {
  try {
    const existing = getDailyQuizAttempts();
    // Replace if already attempted today or prepend
    const filtered = existing.filter(a => a.date !== attempt.date);
    const updated = [attempt, ...filtered];
    localStorage.setItem(DAILY_ATTEMPTS_KEY, JSON.stringify(updated));
    recordDailyStreak(attempt.date);
  } catch (err) {
    console.error('Failed to save daily attempt', err);
  }
}

export function getDailyAttemptForDate(dateStr: string): import('../types').DailyQuizAttempt | undefined {
  const attempts = getDailyQuizAttempts();
  return attempts.find(a => a.date === dateStr);
}

export function getDailyStreakInfo(): import('../types').DailyStreakInfo {
  try {
    const data = localStorage.getItem(DAILY_STREAK_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read streak info', err);
  }
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: '',
    completedDates: [],
  };
}

export function recordDailyStreak(todayDateStr: string): import('../types').DailyStreakInfo {
  try {
    const info = getDailyStreakInfo();
    const completedSet = new Set(info.completedDates);

    if (!completedSet.has(todayDateStr)) {
      completedSet.add(todayDateStr);
      const newCompleted = Array.from(completedSet).sort();

      // Check if yesterday or consecutive
      let newStreak = 1;
      if (info.lastCompletedDate) {
        const lastDate = new Date(info.lastCompletedDate);
        const currDate = new Date(todayDateStr);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          newStreak = info.currentStreak + 1;
        } else if (diffDays === 0) {
          newStreak = info.currentStreak;
        } else {
          newStreak = 1;
        }
      }

      const updatedInfo: import('../types').DailyStreakInfo = {
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, info.bestStreak),
        lastCompletedDate: todayDateStr,
        completedDates: newCompleted,
      };

      localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(updatedInfo));
      return updatedInfo;
    }
    return info;
  } catch (err) {
    console.error('Failed to record streak', err);
    return getDailyStreakInfo();
  }
}

export function getUserAspirantName(): string {
  try {
    return localStorage.getItem(USER_NAME_KEY) || 'Aspirant (You)';
  } catch {
    return 'Aspirant (You)';
  }
}

export function setUserAspirantName(name: string): void {
  try {
    localStorage.setItem(USER_NAME_KEY, name.trim() || 'Aspirant (You)');
  } catch (err) {
    console.error('Failed to set user aspirant name', err);
  }
}

// -------------------------------------------------------------
// PDF Purchases / Unlocks
// -------------------------------------------------------------

const UNLOCKED_PDFS_KEY = 'chsl_unlocked_pdfs_v1';

export function getUnlockedPDFIds(): string[] {
  try {
    const data = localStorage.getItem(UNLOCKED_PDFS_KEY);
    // Give access to first bundle by default as a high-value free sample, or store unlocked
    if (!data) {
      // Default give free unlock sample or empty
      return ['pdf-expected-500']; // Free starter sample unlocked!
    }
    return JSON.parse(data);
  } catch {
    return ['pdf-expected-500'];
  }
}

export function unlockPDF(pdfId: string): void {
  try {
    const current = getUnlockedPDFIds();
    if (!current.includes(pdfId)) {
      const updated = [...current, pdfId];
      localStorage.setItem(UNLOCKED_PDFS_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to unlock PDF', err);
  }
}

export function isPDFUnlocked(pdfId: string): boolean {
  const current = getUnlockedPDFIds();
  return current.includes(pdfId);
}

// -------------------------------------------------------------
// User Authentication & Profile Storage
// -------------------------------------------------------------

const USER_SESSION_KEY = 'chsl_current_user_v1';

export function getStoredUser(): import('../types').UserProfile | null {
  try {
    const data = localStorage.getItem(USER_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to read user session', err);
    return null;
  }
}

export function setStoredUser(user: import('../types').UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      // Also sync user aspirant name
      setUserAspirantName(user.name);
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to store user session', err);
  }
}

export function clearStoredUser(): void {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear user session', err);
  }
}

