import React, { useState, useEffect, useRef } from 'react';
import { Question, DailyQuizAttempt, DailyLeaderboardEntry, DailyStreakInfo } from '../types';
import { 
  DAILY_QUIZZES_ARCHIVE, 
  DEFAULT_LEADERBOARD, 
  getDailyQuizForDate 
} from '../data/dailyQuizData';
import { 
  getDailyAttemptForDate, 
  saveDailyQuizAttempt, 
  getDailyStreakInfo, 
  getUserAspirantName, 
  setUserAspirantName,
  toggleBookmark,
  isBookmarked
} from '../utils/storage';
import { 
  Timer, 
  Clock, 
  Flame, 
  Trophy, 
  Medal, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Share2, 
  Bookmark, 
  Sparkles, 
  User, 
  TrendingUp, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  Eye, 
  ChevronRight,
  Check,
  Globe2
} from 'lucide-react';

interface DailyQuizViewProps {
  lang: 'en' | 'hi';
  onNavigateToBookmarks?: () => void;
}

export const DailyQuizView: React.FC<DailyQuizViewProps> = ({ lang }) => {
  // Current local date YYYY-MM-DD
  const todayStr = '2026-09-22';
  const dailyQuiz = getDailyQuizForDate(todayStr);

  const [activeTab, setActiveTab] = useState<'quiz' | 'leaderboard'>('quiz');
  const [quizState, setQuizState] = useState<'start' | 'active' | 'result'>('start');
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number | null>>({});
  
  // Timer: 5 minutes (300 seconds) countdown
  const TOTAL_TIME_SECONDS = 300;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SECONDS);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // User attempt & streak state
  const [userAttempt, setUserAttempt] = useState<DailyQuizAttempt | null>(null);
  const [streakInfo, setStreakInfo] = useState<DailyStreakInfo>({
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: '',
    completedDates: [],
  });
  const [userName, setUserName] = useState<string>('Aspirant (You)');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('');
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Question language toggle inside quiz
  const [qLang, setQLang] = useState<'en' | 'hi'>(lang);

  // Load existing attempt & streak
  useEffect(() => {
    setQLang(lang);
    const savedAttempt = getDailyAttemptForDate(todayStr);
    const savedStreak = getDailyStreakInfo();
    const storedName = getUserAspirantName();
    
    setUserName(storedName);
    setTempName(storedName);
    setStreakInfo(savedStreak);

    if (savedAttempt) {
      setUserAttempt(savedAttempt);
      setSelectedAnswers(savedAttempt.userResponses);
      setTimeSpent(savedAttempt.timeSpentSeconds);
      setQuizState('result');
    }
  }, [lang]);

  // Timer logic for active quiz
  useEffect(() => {
    if (quizState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Start Quiz
  const handleStartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setTimeLeft(TOTAL_TIME_SECONDS);
    setTimeSpent(0);
    setQuizState('active');
  };

  // Select Option
  const handleSelectOption = (qId: string, optIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: prev[qId] === optIndex ? null : optIndex,
    }));
  };

  // Clear Option
  const handleClearOption = (qId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: null,
    }));
  };

  // Auto-submit on time up
  const handleAutoSubmit = () => {
    handleSubmitQuiz(true);
  };

  // Submit Quiz Calculation
  const handleSubmitQuiz = (isTimeUp = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    dailyQuiz.questions.forEach((q) => {
      const ans = selectedAnswers[q.id];
      if (ans === undefined || ans === null) {
        unattempted++;
      } else if (ans === q.correctOption) {
        correct++;
      } else {
        wrong++;
      }
    });

    // SSC CHSL Tier-1 scheme: +2 for correct, -0.5 for wrong
    const calculatedScore = Math.max(0, +(correct * 2 - wrong * 0.5).toFixed(2));
    const attemptedCount = correct + wrong;
    const accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;
    const finalTimeSpent = isTimeUp ? TOTAL_TIME_SECONDS : Math.min(timeSpent, TOTAL_TIME_SECONDS);

    const newAttempt: DailyQuizAttempt = {
      date: todayStr,
      score: calculatedScore,
      totalMarks: 10,
      correctCount: correct,
      wrongCount: wrong,
      unattemptedCount: unattempted,
      accuracy,
      timeSpentSeconds: finalTimeSpent,
      userResponses: selectedAnswers,
      completedAt: new Date().toISOString(),
      userName,
    };

    saveDailyQuizAttempt(newAttempt);
    setUserAttempt(newAttempt);
    setStreakInfo(getDailyStreakInfo());
    setQuizState('result');
  };

  // Re-attempt quiz
  const handleReattempt = () => {
    handleStartQuiz();
  };

  // Save new user name
  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserAspirantName(tempName);
      setUserName(tempName.trim());
      setIsEditingName(false);
      if (userAttempt) {
        const updated = { ...userAttempt, userName: tempName.trim() };
        saveDailyQuizAttempt(updated);
        setUserAttempt(updated);
      }
    }
  };

  // Share score
  const handleShareScore = () => {
    if (!userAttempt) return;
    const shareText = `🎯 SSC CHSL Daily Challenge (${todayStr})
Score: ${userAttempt.score}/10 Marks
Accuracy: ${userAttempt.accuracy}%
Time: ${formatTime(userAttempt.timeSpentSeconds)}
Streak: 🔥 ${streakInfo.currentStreak || 1} Days
Take today's 5-minute challenge on SSC CHSL Prep Hub!`;

    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  // Compile full leaderboard entries
  const currentLeaderboard = (() => {
    let list: DailyLeaderboardEntry[] = [...DEFAULT_LEADERBOARD];

    if (userAttempt) {
      // Calculate user's projected rank based on score, then time
      const userEntry: DailyLeaderboardEntry = {
        id: 'user-current',
        rank: 0,
        name: `${userName} (You)`,
        state: 'Self',
        score: userAttempt.score,
        accuracy: userAttempt.accuracy,
        timeSeconds: userAttempt.timeSpentSeconds,
        isCurrentUser: true,
        badge: userAttempt.score === 10 ? '🎯 Perfect 10' : '🔥 Contender',
        date: todayStr,
      };

      // Merge and sort: Highest score first, then lowest time
      const merged = [userEntry, ...list.filter((x) => !x.isCurrentUser)];
      merged.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSeconds - b.timeSeconds;
      });

      // Assign ranks
      return merged.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    return list;
  })();

  const userRankEntry = currentLeaderboard.find((e) => e.isCurrentUser);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-14">
      
      {/* Top Banner & Daily Streak Tracker */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/40 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-sm border border-amber-400/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'hi' ? 'दैनिक 5-प्रश्न चुनौती' : 'Daily 5-Question Challenge'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                {todayStr} (22 Sept 2026)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              {lang === 'hi' ? dailyQuiz.titleHi : dailyQuiz.titleEn}
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {lang === 'hi'
                ? 'प्रतिदिन 5 चुनिंदा उच्च-वेटेज प्रश्न हल करें, स्पीड बढ़ाएं और ऑल इंडिया डेली लीडरबोर्ड पर अपनी रैंक देखें।'
                : 'Test your speed and accuracy with 5 curated high-yield questions every day. Compete on the live daily leaderboard!'}
            </p>
          </div>

          {/* Daily Streak Card */}
          <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-4 border border-amber-400/20 flex flex-col items-center justify-center min-w-[200px] shrink-0 text-center">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Flame className="w-6 h-6 fill-orange-500 text-orange-400 animate-bounce" />
              </div>
              <div className="text-left">
                <span className="text-[11px] text-amber-200 uppercase font-black tracking-wider block">
                  {lang === 'hi' ? 'दैनिक स्ट्रीक' : 'Daily Streak'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {streakInfo.currentStreak || (userAttempt ? 1 : 0)} {lang === 'hi' ? 'दिन' : 'Days'}
                </span>
              </div>
            </div>

            {/* 7-Day Dots */}
            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-white/10 w-full justify-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, dIdx) => {
                const isDone = (streakInfo.currentStreak || (userAttempt ? 1 : 0)) > dIdx;
                return (
                  <div
                    key={dIdx}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      isDone
                        ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/50'
                        : 'bg-white/10 text-white/50 border border-white/10'
                    }`}
                    title={`Day ${dIdx + 1}`}
                  >
                    {isDone ? '✓' : day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Quiz vs Leaderboard */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-1.5 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'quiz'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{lang === 'hi' ? 'आज की 5-प्रश्न क्विज़' : "Today's 5-Q Challenge"}</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-800" />
            <span>{lang === 'hi' ? 'ऑल इंडिया लीडरबोर्ड' : 'Live Leaderboard'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 right-1" />
          </button>
        </div>

        {/* Global language toggle shortcut */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'hi' ? 'प्रश्नों की भाषा:' : 'Question Lang:'}</span>
          <button
            onClick={() => setQLang(qLang === 'en' ? 'hi' : 'en')}
            className="font-bold text-amber-700 hover:text-amber-800 underline uppercase"
          >
            {qLang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
          </button>
        </div>
      </div>

      {/* TAB 1: QUIZ TAB */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">

          {/* VIEW A: START SCREEN */}
          {quizState === 'start' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {lang === 'hi' ? 'दैनिक गति एवं सटीकता टेस्ट (5 प्रश्न)' : 'Daily Speed & Accuracy Drill (5 Questions)'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {lang === 'hi'
                      ? 'रीजनिंग, क्वांटिटेटिव एप्टीट्यूड, सामान्य ज्ञान एवं अंग्रेजी का 5 मिनट का संतुलित टेस्ट।'
                      : 'Covering Reasoning, Quantitative Aptitude, General Awareness, and English Language.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-amber-900">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block text-amber-700">Time Limit</span>
                    <span className="text-sm font-extrabold">5:00 Mins (300s)</span>
                  </div>
                </div>
              </div>

              {/* Rules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'hi' ? 'अंकन योजना' : 'Marking Scheme'}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    +2.00 Marks for each correct answer.<br />
                    <span className="text-rose-600 font-semibold">-0.50 Negative marking</span> for wrong options.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                    <Timer className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'hi' ? 'समय प्रबंधन' : 'Speed Benchmark'}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Average target is <strong>45-60 seconds</strong> per question. Ties on leaderboard broken by fastest time!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                    <Trophy className="w-4 h-4 text-orange-600" />
                    <span>{lang === 'hi' ? 'लाइव लीडरबोर्ड' : 'Rank on Leaderboard'}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Submit to claim your rank alongside top SSC CHSL aspirants across India.
                  </p>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {lang === 'hi'
                    ? 'नोट: क्विज़ शुरू करते ही 5 मिनट का टाइमर प्रारंभ हो जाएगा।'
                    : 'Note: The 5-minute countdown starts immediately upon clicking.'}
                </div>

                <button
                  id="btn-start-daily-quiz"
                  onClick={handleStartQuiz}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm sm:text-base rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2.5 active:scale-95"
                >
                  <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                  <span>{lang === 'hi' ? '5-प्रश्न टेस्ट शुरू करें' : 'Start Today\'s Challenge'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW B: ACTIVE QUIZ */}
          {quizState === 'active' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Active Quiz Header & Real-time Countdown Timer */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    #{currentQIndex + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {dailyQuiz.questions[currentQIndex].section}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-300 font-medium">
                        {dailyQuiz.questions[currentQIndex].topic}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Question {currentQIndex + 1} of {dailyQuiz.questions.length}
                    </span>
                  </div>
                </div>

                {/* COUNTDOWN TIMER BADGE */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-base sm:text-lg transition-all ${
                      timeLeft < 60
                        ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
                        : timeLeft < 120
                        ? 'bg-amber-950/80 border-amber-500 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-emerald-400'
                    }`}
                  >
                    <Timer className="w-5 h-5" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>

                  <button
                    onClick={() => setQLang(qLang === 'en' ? 'hi' : 'en')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 font-semibold"
                    title="Change question language"
                  >
                    {qLang === 'en' ? 'हिन्दी' : 'English'}
                  </button>
                </div>
              </div>

              {/* Progress Steps (5 Questions) */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dailyQuiz.questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== null;
                    const isCurrent = currentQIndex === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 ring-offset-1'
                            : isAnswered
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Answered: <strong>{Object.values(selectedAnswers).filter((v) => v !== null).length}</strong>/5
                </div>
              </div>

              {/* Question Body */}
              {(() => {
                const currentQ = dailyQuiz.questions[currentQIndex];
                const currentSelected = selectedAnswers[currentQ.id];
                const options = qLang === 'hi' ? currentQ.optionsHi : currentQ.optionsEn;
                const bookmarked = isBookmarked(currentQ.id);

                return (
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-slate-900 font-semibold text-base sm:text-lg leading-relaxed whitespace-pre-line">
                        <span className="font-black text-amber-700 mr-2">Q{currentQIndex + 1}.</span>
                        {qLang === 'hi' ? currentQ.textHi : currentQ.textEn}
                      </div>

                      <button
                        onClick={() => toggleBookmark(currentQ, 'daily-quiz', 'Daily 5-Q Challenge')}
                        className={`p-2 rounded-lg transition shrink-0 ${
                          bookmarked
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-400 hover:text-slate-700'
                        }`}
                        title="Bookmark question"
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-600' : ''}`} />
                      </button>
                    </div>

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {options.map((optText, optIdx) => {
                        const isChosen = currentSelected === optIdx;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(currentQ.id, optIdx)}
                            className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                              isChosen
                                ? 'bg-amber-500/10 border-amber-500 text-slate-950 font-bold ring-2 ring-amber-500/20'
                                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                                isChosen
                                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                                  : 'bg-white border border-slate-300 text-slate-600'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-sm flex-1 leading-snug">{optText}</span>
                            {isChosen && <Check className="w-5 h-5 text-amber-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Question Actions */}
                    <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentQIndex === 0}
                          onClick={() => setCurrentQIndex((prev) => prev - 1)}
                          className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        {currentSelected !== undefined && currentSelected !== null && (
                          <button
                            onClick={() => handleClearOption(currentQ.id)}
                            className="px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                          >
                            Clear Choice
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {currentQIndex < dailyQuiz.questions.length - 1 ? (
                          <button
                            onClick={() => setCurrentQIndex((prev) => prev + 1)}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shadow-sm"
                          >
                            <span>Next Question</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            id="btn-submit-daily-quiz"
                            onClick={() => handleSubmitQuiz(false)}
                            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-md shadow-amber-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Submit Quiz</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW C: RESULT & SCORECARD WITH SOLUTIONS */}
          {quizState === 'result' && userAttempt && (
            <div className="space-y-6">
              
              {/* Scorecard Hero Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {lang === 'hi' ? 'दैनिक क्विज़ पूर्ण!' : 'Daily Challenge Completed!'}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {userAttempt.score === 10
                        ? (lang === 'hi' ? 'अद्भुत! 100% सही उत्तर' : 'Perfection! 10/10 Score')
                        : userAttempt.score >= 7.5
                        ? (lang === 'hi' ? 'उत्कृष्ट प्रदर्शन!' : 'Outstanding Performance!')
                        : (lang === 'hi' ? 'अच्छा प्रयास! अभ्यास जारी रखें' : 'Good Effort! Keep Improving')}
                    </h2>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1">
                      {lang === 'hi'
                        ? `आपने ${formatTime(userAttempt.timeSpentSeconds)} में 5 में से ${userAttempt.correctCount} प्रश्न सही हल किए।`
                        : `Solved ${userAttempt.correctCount} out of 5 correctly in ${formatTime(userAttempt.timeSpentSeconds)}.`}
                    </p>
                  </div>

                  {/* Actions: Share & View Leaderboard */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={handleShareScore}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>{copiedShare ? (lang === 'hi' ? 'कॉपी हो गया! ✓' : 'Copied! ✓') : (lang === 'hi' ? 'स्कोर शेयर करें' : 'Share Score')}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
                    >
                      <Trophy className="w-4 h-4 text-slate-950" />
                      <span>{lang === 'hi' ? 'रैंक देखें' : 'View Leaderboard'}</span>
                    </button>
                  </div>
                </div>

                {/* Score Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Score</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">
                      {userAttempt.score} <span className="text-xs text-slate-400 font-normal">/ 10</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">Scheme: +2 / -0.5</span>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Time Taken</span>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                      {formatTime(userAttempt.timeSpentSeconds)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Out of 5:00 Mins</span>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Accuracy</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
                      {userAttempt.accuracy}%
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">{userAttempt.correctCount} Correct, {userAttempt.wrongCount} Wrong</span>
                  </div>

                  <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold block">Today's Rank</span>
                    <span className="text-2xl sm:text-3xl font-black text-orange-400 mt-1 block">
                      #{userRankEntry?.rank || 4}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Top 5% Aspirants</span>
                  </div>
                </div>

                {/* Candidate Name Customizer */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">
                      {lang === 'hi' ? 'लीडरबोर्ड पर आपका नाम:' : 'Your Leaderboard Display Name:'}
                    </span>
                    {!isEditingName ? (
                      <span className="font-extrabold text-white text-sm bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                        {userName}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Your Name (e.g. Rahul S.)"
                          className="bg-slate-900 border border-slate-600 rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                        <button
                          onClick={handleSaveName}
                          className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-600"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingName && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-amber-400 hover:text-amber-300 underline font-semibold text-left sm:text-right"
                    >
                      {lang === 'hi' ? 'नाम बदलें' : 'Change Name'}
                    </button>
                  )}
                </div>
              </div>

              {/* Retest & Solution Review Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {lang === 'hi' ? 'विस्तृत समाधान व शॉर्टकट ट्रिक्स' : 'Step-by-Step Solutions & Short Tricks'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReattempt}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'hi' ? 'पुनः अभ्यास करें' : 'Re-attempt for Practice'}</span>
                  </button>
                </div>
              </div>

              {/* Detailed Solutions List for all 5 questions */}
              <div className="space-y-4">
                {dailyQuiz.questions.map((q, idx) => {
                  const userAns = userAttempt.userResponses[q.id];
                  const isCorrect = userAns === q.correctOption;
                  const isUnattempted = userAns === undefined || userAns === null;
                  const isWrong = !isCorrect && !isUnattempted;
                  const bookmarked = isBookmarked(q.id);

                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4"
                    >
                      {/* Q Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {q.section}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {q.topic}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCorrect && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              +2.00
                            </span>
                          )}
                          {isWrong && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              -0.50
                            </span>
                          )}
                          {isUnattempted && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                              0.00 (Unattempted)
                            </span>
                          )}

                          <button
                            onClick={() => toggleBookmark(q, 'daily-quiz', 'Daily 5-Q Challenge')}
                            className={`p-1.5 rounded-lg border transition ${
                              bookmarked
                                ? 'bg-amber-100 text-amber-700 border-amber-300'
                                : 'text-slate-400 hover:text-slate-700 border-slate-200'
                            }`}
                            title="Bookmark question"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-600' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Question text */}
                      <div className="text-slate-900 font-medium text-base whitespace-pre-line leading-relaxed">
                        {lang === 'hi' ? q.textHi : q.textEn}
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(lang === 'hi' ? q.optionsHi : q.optionsEn).map((opt, oIdx) => {
                          const isOptionCorrect = q.correctOption === oIdx;
                          const wasChosen = userAns === oIdx;

                          let style = 'bg-slate-50 border-slate-200 text-slate-700';
                          if (isOptionCorrect) {
                            style = 'bg-emerald-50 border-emerald-500 font-bold text-emerald-950 ring-1 ring-emerald-500';
                          } else if (wasChosen && !isOptionCorrect) {
                            style = 'bg-rose-50 border-rose-400 font-bold text-rose-900 line-through';
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2.5 ${style}`}
                            >
                              <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isOptionCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                              {wasChosen && !isOptionCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Explanation */}
                      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-900 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>{lang === 'hi' ? 'विस्तृत व्याख्या एवं शॉर्ट ट्रिक:' : 'Explanation & Smart Shortcut:'}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                          {lang === 'hi' ? q.explanationHi : q.explanationEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: LIVE LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">

          {/* Leaderboard Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {lang === 'hi' ? 'आज का ऑल इंडिया लाइव लीडरबोर्ड' : "Today's All-India Live Leaderboard"}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {lang === 'hi'
                  ? '22 सितम्बर 2026 की 5-प्रश्न चुनौती में शीर्ष अंक और तीव्र समय दर्ज करने वाले अभ्यर्थी।'
                  : 'Top ranking aspirants based on score and completion time for today\'s 5-Q challenge.'}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-amber-900 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Next challenge in <strong>19h 45m</strong></span>
            </div>
          </div>

          {/* TOP 3 PODIUM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            
            {/* Rank 2 (Silver) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col items-center text-center order-2 sm:order-1 relative">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 font-black text-xl flex items-center justify-center border-2 border-slate-300 mb-3 shadow-xs">
                🥈
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rank #2</span>
              <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                {currentLeaderboard[1]?.name || 'Anjali Sharma'}
              </h4>
              <span className="text-xs text-slate-500">{currentLeaderboard[1]?.state || 'Delhi NCR'}</span>
              
              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Score</span>
                  <span className="font-black text-slate-900 text-sm">{currentLeaderboard[1]?.score} / 10</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Time</span>
                  <span className="font-extrabold text-slate-700 text-sm">{formatTime(currentLeaderboard[1]?.timeSeconds || 108)}</span>
                </div>
              </div>
            </div>

            {/* Rank 1 (Gold - Center & Elevated) */}
            <div className="bg-gradient-to-b from-amber-500/10 via-white to-white rounded-2xl border-2 border-amber-400 p-6 shadow-md flex flex-col items-center text-center order-1 sm:order-2 relative sm:-translate-y-2">
              <div className="absolute -top-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] uppercase px-3 py-0.5 rounded-full shadow-sm">
                Champion of the Day
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-500 font-black text-2xl flex items-center justify-center border-2 border-amber-400 mb-3 shadow-sm mt-1">
                🥇
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Rank #1</span>
              <h4 className="font-black text-slate-900 text-lg mt-0.5">
                {currentLeaderboard[0]?.name || 'Shashank Shekhar'}
              </h4>
              <span className="text-xs text-slate-500">{currentLeaderboard[0]?.state || 'UP (Prayagraj)'}</span>
              
              <div className="mt-4 pt-3 border-t border-amber-100 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Score</span>
                  <span className="font-black text-amber-900 text-base">{currentLeaderboard[0]?.score} / 10</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Time</span>
                  <span className="font-black text-emerald-700 text-base">{formatTime(currentLeaderboard[0]?.timeSeconds || 94)}</span>
                </div>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col items-center text-center order-3 sm:order-3 relative">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 font-black text-xl flex items-center justify-center border-2 border-orange-300 mb-3 shadow-xs">
                🥉
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">Rank #3</span>
              <h4 className="font-extrabold text-slate-900 text-base mt-0.5">
                {currentLeaderboard[2]?.name || 'Vikramaditya Rathore'}
              </h4>
              <span className="text-xs text-slate-500">{currentLeaderboard[2]?.state || 'Rajasthan (Jaipur)'}</span>
              
              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Score</span>
                  <span className="font-black text-slate-900 text-sm">{currentLeaderboard[2]?.score} / 10</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Time</span>
                  <span className="font-extrabold text-slate-700 text-sm">{formatTime(currentLeaderboard[2]?.timeSeconds || 122)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Complete Ranking Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                {lang === 'hi' ? 'सम्पूर्ण रैंक सूची (Top Aspirants)' : 'Leaderboard Standings (Live)'}
              </span>
              <span className="text-xs text-slate-500">
                Sorted by Score & Speed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Aspirant</th>
                    <th className="px-3 py-3 text-center">Score</th>
                    <th className="px-3 py-3 text-center">Accuracy</th>
                    <th className="px-3 py-3 text-center">Time</th>
                    <th className="px-4 py-3 text-right">Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentLeaderboard.map((item) => {
                    const isUser = item.isCurrentUser;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isUser
                            ? 'bg-amber-50/90 font-bold text-slate-950 border-y-2 border-amber-400'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-black text-xs ${
                              item.rank === 1
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : item.rank === 2
                                ? 'bg-slate-200 text-slate-800'
                                : item.rank === 3
                                ? 'bg-orange-200 text-orange-900'
                                : isUser
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{item.rank}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">
                              {item.name}
                            </span>
                            {isUser && (
                              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">{item.state}</span>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap text-center font-extrabold text-slate-900">
                          {item.score.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap text-center font-bold text-emerald-600">
                          {item.accuracy}%
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap text-center font-mono font-medium text-slate-600">
                          {formatTime(item.timeSeconds)}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          {item.badge ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              {item.badge}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* If user hasn't attempted yet, prompt them to test */}
            {!userAttempt && (
              <div className="p-4 bg-amber-50/70 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-amber-900 font-medium">
                  {lang === 'hi'
                    ? 'आपने आज की चुनौती नहीं दी है! अभी 5 मिनट की क्विज़ देकर अपना नाम इस लीडरबोर्ड पर जोड़ें।'
                    : 'You haven\'t attempted today\'s challenge yet! Take the 5-minute quiz to see your rank here.'}
                </span>
                <button
                  onClick={() => {
                    setActiveTab('quiz');
                    if (quizState === 'start') handleStartQuiz();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs shrink-0"
                >
                  {lang === 'hi' ? 'अभी क्विज़ दें' : 'Take Quiz Now'}
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
