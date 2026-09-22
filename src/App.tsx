/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Paper, TestAttempt, BookmarkItem, UserProfile } from './types';
import { PAPERS_DATABASE } from './data/papersData';
import { 
  getTestAttempts, 
  saveTestAttempt, 
  getBookmarks, 
  getStoredLanguage, 
  setStoredLanguage,
  getStoredUser,
  setStoredUser,
  clearStoredUser
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { PaperList } from './components/PaperList';
import { ExamInterface } from './components/ExamInterface';
import { ResultAnalytics } from './components/ResultAnalytics';
import { BookmarksView } from './components/BookmarksView';
import { SyllabusCutoffsView } from './components/SyllabusCutoffsView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DailyQuizView } from './components/DailyQuizView';
import { PDFStoreView } from './components/PDFStoreView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { Award, ShieldCheck, HelpCircle, Lock, User, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'papers' | 'sectional' | 'daily-quiz' | 'pdf-store' | 'analytics' | 'bookmarks' | 'syllabus' | 'admin'>('papers');
  const [lang, setLang] = useState<'en' | 'hi'>(() => getStoredLanguage());
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'gmail' | 'mobile' | 'profile'>('gmail');

  // Active test / study session
  const [activePaper, setActivePaper] = useState<Paper | null>(null);
  const [examMode, setExamMode] = useState<'test' | 'study' | null>(null);
  
  // Active attempt being analyzed in scorecard
  const [activeAttempt, setActiveAttempt] = useState<TestAttempt | null>(null);

  // Persistent storage state
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Load initial data
  useEffect(() => {
    setAttempts(getTestAttempts());
    setBookmarks(getBookmarks());
  }, []);

  // Update language preference
  const handleSetLang = (newLang: 'en' | 'hi') => {
    setLang(newLang);
    setStoredLanguage(newLang);
  };

  // Start a test or study mode
  const handleStartTest = (paper: Paper, mode: 'test' | 'study') => {
    setActivePaper(paper);
    setExamMode(mode);
    setActiveAttempt(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // On submit test from ExamInterface
  const handleFinishTest = (attempt: TestAttempt) => {
    saveTestAttempt(attempt);
    setAttempts(getTestAttempts());
    setActiveAttempt(attempt);
    setActivePaper(null);
    setExamMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Exit from exam interface
  const handleExitExam = () => {
    if (examMode === 'test') {
      const confirmExit = window.confirm(
        lang === 'hi'
          ? 'क्या आप परीक्षा छोड़ना चाहते हैं? आपकी प्रगति सुरक्षित नहीं होगी।'
          : 'Are you sure you want to exit the test? Your responses will not be saved.'
      );
      if (!confirmExit) return;
    }
    setActivePaper(null);
    setExamMode(null);
  };

  // View a past attempt from analytics
  const handleViewPastAttempt = (attempt: TestAttempt) => {
    setActiveAttempt(attempt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Refresh bookmarks
  const handleRefreshBookmarks = () => {
    setBookmarks(getBookmarks());
  };

  // 1. If currently in an active exam or study session, show full-screen ExamInterface
  if (activePaper && examMode) {
    return (
      <ExamInterface
        paper={activePaper}
        mode={examMode}
        globalLang={lang}
        onFinishTest={handleFinishTest}
        onExit={handleExitExam}
      />
    );
  }

  // Find paper for active attempt if viewing result
  const attemptPaper = activeAttempt
    ? PAPERS_DATABASE.find((p) => p.id === activeAttempt.paperId) || PAPERS_DATABASE[0]
    : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveAttempt(null);
        }}
        lang={lang}
        setLang={handleSetLang}
        totalAttemptsCount={attempts.length}
        bookmarksCount={bookmarks.length}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthInitialTab(currentUser ? 'profile' : 'gmail');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If viewing a test result scorecard */}
        {activeAttempt && attemptPaper ? (
          <ResultAnalytics
            attempt={activeAttempt}
            paper={attemptPaper}
            lang={lang}
            onReattempt={() => handleStartTest(attemptPaper, 'test')}
            onBackToDashboard={() => setActiveAttempt(null)}
          />
        ) : (
          <>
            {/* Tab: All Papers & Mocks */}
            {activeTab === 'papers' && (
              <PaperList
                papers={PAPERS_DATABASE}
                attempts={attempts}
                lang={lang}
                onStartTest={handleStartTest}
                filterType="all"
                onNavigateToDailyQuiz={() => setActiveTab('daily-quiz')}
                onNavigateToPDFStore={() => setActiveTab('pdf-store')}
              />
            )}

            {/* Tab: Daily 5-Question Challenge */}
            {activeTab === 'daily-quiz' && (
              <DailyQuizView
                lang={lang}
                onNavigateToBookmarks={() => setActiveTab('bookmarks')}
              />
            )}

            {/* Tab: ₹49 Special Exam-Ready PDF Bundles */}
            {activeTab === 'pdf-store' && (
              <PDFStoreView
                lang={lang}
                onBackToHome={() => setActiveTab('papers')}
                currentUser={currentUser}
                onOpenAuth={() => {
                  setAuthInitialTab('gmail');
                  setIsAuthModalOpen(true);
                }}
              />
            )}

            {/* Tab: Sectional Speed Drills */}
            {activeTab === 'sectional' && (
              <PaperList
                papers={PAPERS_DATABASE}
                attempts={attempts}
                lang={lang}
                onStartTest={handleStartTest}
                filterType="sectional"
                onNavigateToDailyQuiz={() => setActiveTab('daily-quiz')}
                onNavigateToPDFStore={() => setActiveTab('pdf-store')}
              />
            )}

            {/* Tab: User Scorecard & Performance Analytics */}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard
                attempts={attempts}
                papers={PAPERS_DATABASE}
                lang={lang}
                onViewAttempt={handleViewPastAttempt}
                onExplorePapers={() => setActiveTab('papers')}
              />
            )}

            {/* Tab: Saved Tricky Questions / Bookmarks */}
            {activeTab === 'bookmarks' && (
              <BookmarksView
                bookmarks={bookmarks}
                lang={lang}
                onRefresh={handleRefreshBookmarks}
              />
            )}

            {/* Tab: Syllabus & Cutoffs Trend */}
            {activeTab === 'syllabus' && (
              <SyllabusCutoffsView lang={lang} />
            )}

            {/* Tab: Administration, Payments & Revenue Portal */}
            {activeTab === 'admin' && (
              <AdminPanel
                lang={lang}
                onClose={() => setActiveTab('papers')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">
              SSC
            </div>
            <span className="font-bold text-slate-200">SSC CHSL Prep Hub</span>
            <span>•</span>
            <span>Tier-1 Computer Based Examination (CBE) Practice Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Latest 2024-2025 Pattern
            </span>
            <span>•</span>
            <span>Bilingual Hindi & English</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-amber-400 flex items-center gap-1 font-semibold transition-colors"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Admin Portal (PIN: admin2026)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Student Authentication & Profile Modal (Gmail & Mobile OTP) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        currentUser={currentUser}
        initialTab={authInitialTab}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setStoredUser(user);
        }}
        onLogout={() => {
          setCurrentUser(null);
          clearStoredUser();
          setIsAuthModalOpen(false);
        }}
      />

    </div>
  );
}
