import React, { useState, useEffect } from 'react';
import { TestAttempt, Paper, Question, SubjectType } from '../types';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Target, 
  RotateCcw, 
  ArrowLeft, 
  Sparkles, 
  Bookmark, 
  Check, 
  AlertCircle,
  Share2,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toggleBookmark, isBookmarked } from '../utils/storage';

interface ResultAnalyticsProps {
  attempt: TestAttempt;
  paper: Paper;
  lang: 'en' | 'hi';
  onReattempt: () => void;
  onBackToDashboard: () => void;
}

const SECTION_LABELS: Record<SubjectType, { en: string; hi: string }> = {
  reasoning: { en: 'General Intelligence (Reasoning)', hi: 'सामान्य बुद्धिमत्ता एवं तर्कशक्ति' },
  ga: { en: 'General Awareness (GK/GS)', hi: 'सामान्य जानकारी (GK/GS)' },
  quant: { en: 'Quantitative Aptitude (Math)', hi: 'संख्यात्मक अभिरुचि (गणित)' },
  english: { en: 'English Language', hi: 'अंग्रेजी भाषा' },
};

export const ResultAnalytics: React.FC<ResultAnalyticsProps> = ({
  attempt,
  paper,
  lang,
  onReattempt,
  onBackToDashboard,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'incorrect' | 'correct' | 'unattempted' | 'bookmarked'>('all');
  const [solutionLang, setSolutionLang] = useState<'en' | 'hi'>(lang);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    paper.questions.forEach((q) => {
      map[q.id] = isBookmarked(q.id);
    });
    return map;
  });

  // Trigger celebration on load if score > 50%
  useEffect(() => {
    if (attempt.score / attempt.totalMarks >= 0.5) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Safe fallback
      }
    }
  }, [attempt.score, attempt.totalMarks]);

  const handleToggleBookmark = (q: Question) => {
    const isNow = toggleBookmark(q, paper.id, paper.title);
    setBookmarkedIds((prev) => ({ ...prev, [q.id]: isNow }));
  };

  // Filter questions for review
  const filteredQuestions = paper.questions.filter((q) => {
    const userResp = attempt.responses[q.id];
    const isAnswered = userResp?.selectedOption !== null && userResp?.selectedOption !== undefined;
    const isCorrect = isAnswered && userResp.selectedOption === q.correctOption;

    if (activeFilter === 'incorrect') {
      return isAnswered && !isCorrect;
    }
    if (activeFilter === 'correct') {
      return isCorrect;
    }
    if (activeFilter === 'unattempted') {
      return !isAnswered;
    }
    if (activeFilter === 'bookmarked') {
      return bookmarkedIds[q.id];
    }
    return true;
  });

  // Calculate simulated percentile
  const scorePercent = (attempt.score / attempt.totalMarks) * 100;
  const simulatedPercentile = Math.min(99.8, Math.max(15, Math.round((scorePercent * 0.95 + 10) * 10) / 10));

  // Safe cutoff verdict based on 2024 Tier-1 UR Cutoff (153.25/200 = 76.6%)
  const isCutoffCleared = scorePercent >= 76;
  const isBorderline = scorePercent >= 65 && scorePercent < 76;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'सभी पेपर्स पर वापस जाएं' : 'Back to Papers'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onReattempt}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-lg transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === 'hi' ? 'पुनः टेस्ट दें' : 'Re-attempt Test'}</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          
          {/* Main Score Block */}
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 inline-block">
              {lang === 'hi' ? 'परीक्षा परिणाम एवं स्कोरकार्ड' : 'Official CBE Result & Scorecard'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'hi' ? paper.hindiTitle : paper.title}
            </h1>
            <p className="text-xs text-slate-300">
              {lang === 'hi' ? 'प्रयास तिथि:' : 'Attempted on:'} {new Date(attempt.date).toLocaleString()}
            </p>

            {/* Cutoff status pill */}
            <div className="pt-2">
              {isCutoffCleared ? (
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'hi' ? 'कटऑफ पार! सुरक्षित क्षेत्र (Safe Zone: 153+ Cutoff Cleared)' : 'Safe Zone! Expected Tier-1 Cutoff Cleared'}</span>
                </div>
              ) : isBorderline ? (
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'hi' ? 'सीमावर्ती स्कोर (Borderline): थोड़ी और गति व सटीकता की आवश्यकता' : 'Borderline Score: Need more accuracy in Quant/GA'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-400/40 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>{lang === 'hi' ? 'कटऑफ से कम: गलतियों का विश्लेषण करें और दोबारा प्रयास करें' : 'Below Safe Cutoff: Analyze mistakes in the solutions below'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Score Circle & Metrics */}
          <div className="flex items-center justify-around md:col-span-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 backdrop-blur-xs">
            <div className="text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {lang === 'hi' ? 'प्राप्तांक (Net Score)' : 'Total Score'}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-0.5">
                {attempt.score.toFixed(1)}
                <span className="text-sm font-semibold text-slate-400">/{attempt.totalMarks}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                {lang === 'hi' ? `सटीकता: ${attempt.accuracy}%` : `Accuracy: ${attempt.accuracy}%`}
              </span>
            </div>

            <div className="h-12 w-px bg-slate-700" />

            <div className="text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {lang === 'hi' ? 'अखिल भारतीय पर्सेन्टाइल' : 'Percentile'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>{simulatedPercentile}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                {lang === 'hi' ? `समय: ${formatSeconds(attempt.totalTimeSeconds)}` : `Time: ${formatSeconds(attempt.totalTimeSeconds)}`}
              </span>
            </div>
          </div>

        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              {lang === 'hi' ? 'सही उत्तर (+2)' : 'Correct (+2)'}
            </span>
            <span className="text-lg font-black text-slate-900">
              {attempt.correctCount} Qs
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              {lang === 'hi' ? 'गलत (-0.50)' : 'Incorrect (-0.50)'}
            </span>
            <span className="text-lg font-black text-slate-900">
              {attempt.wrongCount} Qs
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              {lang === 'hi' ? 'छोड़े गए' : 'Unattempted'}
            </span>
            <span className="text-lg font-black text-slate-900">
              {attempt.unattemptedCount} Qs
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              {lang === 'hi' ? 'सटीकता दर' : 'Accuracy'}
            </span>
            <span className="text-lg font-black text-slate-900">
              {attempt.accuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* Sectional Performance Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-600" />
            <span>{lang === 'hi' ? 'विषयवार (सेक्शनल) प्रदर्शन विश्लेषण' : 'Section-Wise Performance Breakdown'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {lang === 'hi' ? 'प्रत्येक सही +2, गलत -0.5' : '+2 for correct, -0.5 for incorrect'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold">
              <tr>
                <th className="px-4 py-3">Section</th>
                <th className="px-3 py-3 text-center">Attempted</th>
                <th className="px-3 py-3 text-center text-emerald-700">Correct</th>
                <th className="px-3 py-3 text-center text-rose-700">Wrong</th>
                <th className="px-3 py-3 text-center">Net Score</th>
                <th className="px-3 py-3 text-center">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {paper.sectionsIncluded.map((sec) => {
                const s = attempt.sectionScores[sec] || { attempted: 0, correct: 0, wrong: 0, score: 0 };
                const secAccuracy = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;

                return (
                  <tr key={sec} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {lang === 'hi' ? SECTION_LABELS[sec].hi : SECTION_LABELS[sec].en}
                    </td>
                    <td className="px-3 py-3 text-center font-bold">{s.attempted}</td>
                    <td className="px-3 py-3 text-center font-bold text-emerald-600">+{s.correct}</td>
                    <td className="px-3 py-3 text-center font-bold text-rose-600">-{s.wrong}</td>
                    <td className="px-3 py-3 text-center font-extrabold text-slate-900">
                      {s.score.toFixed(1)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        secAccuracy >= 80 ? 'bg-emerald-100 text-emerald-800' : secAccuracy >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {secAccuracy}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Solution Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{lang === 'hi' ? 'विस्तृत प्रश्न समीक्षा एवं समाधान (Shortcuts)' : 'Detailed Question Review & Step-by-Step Solutions'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' ? 'प्रत्येक प्रश्न की अवधारणा और शॉर्टकट ट्रिक समझें' : 'Filter by question outcome and master shortcut formulas'}
            </p>
          </div>

          {/* Language Switcher for solutions */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSolutionLang('en')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                solutionLang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSolutionLang('hi')}
              className={`px-2.5 py-1 rounded-md font-bold transition ${
                solutionLang === 'hi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'hi' ? `सभी प्रश्न (${paper.questions.length})` : `All Questions (${paper.questions.length})`}
          </button>
          <button
            onClick={() => setActiveFilter('incorrect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === 'incorrect'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            {lang === 'hi' ? `गलत उत्तर (${attempt.wrongCount})` : `Incorrect (${attempt.wrongCount})`}
          </button>
          <button
            onClick={() => setActiveFilter('correct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === 'correct'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            {lang === 'hi' ? `सही उत्तर (${attempt.correctCount})` : `Correct (${attempt.correctCount})`}
          </button>
          <button
            onClick={() => setActiveFilter('unattempted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilter === 'unattempted'
                ? 'bg-slate-600 text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'hi' ? `छूटे हुए (${attempt.unattemptedCount})` : `Unattempted (${attempt.unattemptedCount})`}
          </button>
          <button
            onClick={() => setActiveFilter('bookmarked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              activeFilter === 'bookmarked'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'बुकमार्क किए गए' : 'Saved Questions'}</span>
          </button>
        </div>

        {/* Questions Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const userResp = attempt.responses[q.id];
            const isAnswered = userResp?.selectedOption !== null && userResp?.selectedOption !== undefined;
            const isCorrect = isAnswered && userResp.selectedOption === q.correctOption;
            const userPicked = userResp?.selectedOption;
            const isSaved = bookmarkedIds[q.id];

            return (
              <div
                key={q.id}
                id={`solution-card-${q.id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 transition-all hover:border-slate-300"
              >
                {/* Question Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-xs px-2.5 py-1 rounded bg-slate-900 text-white">
                      Q {q.questionNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {SECTION_LABELS[q.section]?.en}
                    </span>
                    {q.topic && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        • {q.topic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {isCorrect ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'सही (+2.0)' : 'Correct (+2.0)'}</span>
                      </span>
                    ) : isAnswered ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'गलत (-0.50)' : 'Incorrect (-0.50)'}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'छोड़ा गया' : 'Unattempted'}</span>
                      </span>
                    )}

                    {/* Bookmark action */}
                    <button
                      onClick={() => handleToggleBookmark(q)}
                      className={`p-1.5 rounded-lg border transition ${
                        isSaved
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title="Bookmark question"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <div className="text-slate-900 font-medium text-base whitespace-pre-line leading-relaxed">
                  {solutionLang === 'hi' ? q.textHi : q.textEn}
                </div>

                {/* Options List with Highlight */}
                <div className="space-y-2">
                  {(solutionLang === 'hi' ? q.optionsHi : q.optionsEn).map((optText, optIdx) => {
                    const isOfficialCorrect = q.correctOption === optIdx;
                    const wasChosenByUser = userPicked === optIdx;

                    let optionStyle = 'border-slate-200 bg-white text-slate-700';
                    if (isOfficialCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500';
                    } else if (wasChosenByUser && !isOfficialCorrect) {
                      optionStyle = 'border-rose-400 bg-rose-50/70 text-rose-950 font-medium ring-1 ring-rose-400';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition ${optionStyle}`}
                      >
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <div className="flex-1">
                          {optText}
                        </div>
                        {isOfficialCorrect && (
                          <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" /> {lang === 'hi' ? 'सही विकल्प' : 'Correct Answer'}
                          </span>
                        )}
                        {wasChosenByUser && !isOfficialCorrect && (
                          <span className="text-xs bg-rose-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                            {lang === 'hi' ? 'आपका उत्तर (गलत)' : 'Your Pick (Wrong)'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Explanation / Solution Box */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 text-slate-900 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{solutionLang === 'hi' ? 'विस्तृत व्याख्या एवं शॉर्टकट विधि:' : 'Explanation & Shortcut Trick:'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                    {solutionLang === 'hi' ? q.explanationHi : q.explanationEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
