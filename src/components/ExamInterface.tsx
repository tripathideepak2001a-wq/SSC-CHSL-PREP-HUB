import React, { useState, useEffect, useMemo } from 'react';
import { 
  Paper, 
  Question, 
  SubjectType, 
  UserResponse, 
  QuestionStatus, 
  TestAttempt 
} from '../types';
import { 
  Clock, 
  Bookmark, 
  Check, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Globe2, 
  X, 
  CheckCircle2, 
  HelpCircle,
  Eye,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { toggleBookmark, isBookmarked } from '../utils/storage';

interface ExamInterfaceProps {
  paper: Paper;
  mode: 'test' | 'study'; // 'test' has timer & submission; 'study' has direct answer revealing
  globalLang: 'en' | 'hi';
  onFinishTest: (attempt: TestAttempt) => void;
  onExit: () => void;
}

const SECTION_METADATA: Record<SubjectType, { titleEn: string; titleHi: string; short: string }> = {
  reasoning: { 
    titleEn: 'General Intelligence', 
    titleHi: 'सामान्य बुद्धिमत्ता (रीजनिंग)', 
    short: 'GI' 
  },
  ga: { 
    titleEn: 'General Awareness', 
    titleHi: 'सामान्य जानकारी (GA)', 
    short: 'GA' 
  },
  quant: { 
    titleEn: 'Quantitative Aptitude', 
    titleHi: 'संख्यात्मक अभिरुचि (गणित)', 
    short: 'QA' 
  },
  english: { 
    titleEn: 'English Language', 
    titleHi: 'अंग्रेजी भाषा', 
    short: 'ENG' 
  },
};

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
  paper,
  mode,
  globalLang,
  onFinishTest,
  onExit,
}) => {
  // Current active section
  const [activeSection, setActiveSection] = useState<SubjectType>(paper.sectionsIncluded[0] || 'reasoning');
  
  // Current active question index in that section
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  
  // Timer state
  const [secondsLeft, setSecondsLeft] = useState<number>(paper.durationMinutes * 60);
  
  // Per-question language override
  const [questionLang, setQuestionLang] = useState<'en' | 'hi'>(globalLang);

  // User responses dictionary: questionId -> UserResponse
  const [responses, setResponses] = useState<Record<string, UserResponse>>(() => {
    const initial: Record<string, UserResponse> = {};
    paper.questions.forEach((q) => {
      initial[q.id] = {
        selectedOption: null,
        status: 'not_visited',
        timeSpentSeconds: 0,
        isBookmarked: isBookmarked(q.id),
      };
    });
    return initial;
  });

  // Study mode answer revealed status per question
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Filter questions for the active section
  const sectionQuestions = useMemo(() => {
    const list = paper.questions.filter((q) => q.section === activeSection);
    return list.length > 0 ? list : paper.questions;
  }, [paper.questions, activeSection]);

  const currentQuestion: Question | undefined = sectionQuestions[currentQIndex] || paper.questions[0];

  // Mark first question as not_answered when visited if it was not_visited
  useEffect(() => {
    if (currentQuestion && mode === 'test') {
      setResponses((prev) => {
        const cur = prev[currentQuestion.id];
        if (cur && cur.status === 'not_visited') {
          return {
            ...prev,
            [currentQuestion.id]: {
              ...cur,
              status: 'not_answered',
            },
          };
        }
        return prev;
      });
    }
  }, [currentQuestion?.id, mode]);

  // Sync question language if globalLang changes
  useEffect(() => {
    setQuestionLang(globalLang);
  }, [globalLang]);

  // Timer countdown
  useEffect(() => {
    if (mode !== 'test') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  // Option selection
  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setResponses((prev) => {
      const cur = prev[currentQuestion.id] || {
        selectedOption: null,
        status: 'not_visited',
        timeSpentSeconds: 0,
      };
      return {
        ...prev,
        [currentQuestion.id]: {
          ...cur,
          selectedOption: optionIndex,
        },
      };
    });
  };

  // Clear response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: null,
        status: 'not_answered',
      },
    }));
  };

  // Save & Next
  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    const cur = responses[currentQuestion.id];
    const isAnswered = cur?.selectedOption !== null && cur?.selectedOption !== undefined;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: isAnswered ? 'answered' : 'not_answered',
      },
    }));

    goToNextQuestion();
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;
    const cur = responses[currentQuestion.id];
    const isAnswered = cur?.selectedOption !== null && cur?.selectedOption !== undefined;

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: isAnswered ? 'answered_marked' : 'marked',
      },
    }));

    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (currentQIndex < sectionQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Find next section if available
      const sectionKeys = paper.sectionsIncluded;
      const curSecIdx = sectionKeys.indexOf(activeSection);
      if (curSecIdx >= 0 && curSecIdx < sectionKeys.length - 1) {
        setActiveSection(sectionKeys[curSecIdx + 1]);
        setCurrentQIndex(0);
      }
    }
  };

  const goToPrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    } else {
      // Previous section
      const sectionKeys = paper.sectionsIncluded;
      const curSecIdx = sectionKeys.indexOf(activeSection);
      if (curSecIdx > 0) {
        const prevSec = sectionKeys[curSecIdx - 1];
        const prevSecQs = paper.questions.filter((q) => q.section === prevSec);
        setActiveSection(prevSec);
        setCurrentQIndex(Math.max(0, prevSecQs.length - 1));
      }
    }
  };

  // Jump to specific question in current section
  const handleJumpToQuestion = (index: number) => {
    setCurrentQIndex(index);
  };

  // Bookmark toggle
  const handleToggleBookmark = (q: Question) => {
    const isNowBookmarked = toggleBookmark(q, paper.id, paper.title);
    setResponses((prev) => ({
      ...prev,
      [q.id]: {
        ...prev[q.id],
        isBookmarked: isNowBookmarked,
      },
    }));
  };

  // Submission calculations
  const handleFinalSubmit = () => {
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    const sectionScores: TestAttempt['sectionScores'] = {
      reasoning: { attempted: 0, correct: 0, wrong: 0, score: 0 },
      ga: { attempted: 0, correct: 0, wrong: 0, score: 0 },
      quant: { attempted: 0, correct: 0, wrong: 0, score: 0 },
      english: { attempted: 0, correct: 0, wrong: 0, score: 0 },
    };

    paper.questions.forEach((q) => {
      const resp = responses[q.id];
      const selected = resp?.selectedOption;
      const sec = q.section;

      if (selected === null || selected === undefined) {
        unattemptedCount += 1;
      } else {
        sectionScores[sec].attempted += 1;
        if (selected === q.correctOption) {
          correctCount += 1;
          score += 2.0;
          sectionScores[sec].correct += 1;
          sectionScores[sec].score += 2.0;
        } else {
          wrongCount += 1;
          score -= 0.5;
          sectionScores[sec].wrong += 1;
          sectionScores[sec].score -= 0.5;
        }
      }
    });

    const accuracy = (correctCount + wrongCount) > 0 
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100) 
      : 0;

    const attempt: TestAttempt = {
      id: `attempt-${Date.now()}`,
      paperId: paper.id,
      paperTitle: paper.title,
      date: new Date().toISOString(),
      score: Math.max(0, Math.round(score * 100) / 100),
      totalMarks: paper.totalMarks,
      correctCount,
      wrongCount,
      unattemptedCount,
      accuracy,
      totalTimeSeconds: (paper.durationMinutes * 60) - secondsLeft,
      responses,
      sectionScores,
    };

    onFinishTest(attempt);
  };

  // Helper stats for palette
  const stats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    paper.questions.forEach((q) => {
      const s = responses[q.id]?.status || 'not_visited';
      if (s === 'answered') answered += 1;
      else if (s === 'not_answered') notAnswered += 1;
      else if (s === 'marked') marked += 1;
      else if (s === 'answered_marked') answeredMarked += 1;
      else notVisited += 1;
    });

    return { answered, notAnswered, marked, answeredMarked, notVisited };
  }, [responses, paper.questions]);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusColorClass = (status: QuestionStatus) => {
    switch (status) {
      case 'answered':
        return 'bg-emerald-600 text-white border-emerald-700'; // Green
      case 'not_answered':
        return 'bg-rose-600 text-white border-rose-700'; // Red
      case 'marked':
        return 'bg-purple-600 text-white border-purple-700'; // Purple
      case 'answered_marked':
        return 'bg-purple-600 text-white border-purple-700 ring-2 ring-emerald-400'; // Purple with green dot indicator
      case 'not_visited':
      default:
        return 'bg-slate-200 text-slate-700 border-slate-300'; // Gray
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      
      {/* Real TCS Exam Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow px-4 py-2.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm">
            TCS
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight line-clamp-1">
              {questionLang === 'hi' ? paper.hindiTitle : paper.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Tier-1 Computer Based Examination</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{paper.shift || 'CBE Shift'}</span>
            </div>
          </div>
        </div>

        {/* Center: Language Switcher for Current Question */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs">
          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 mr-1">{questionLang === 'hi' ? 'भाषा:' : 'View in:'}</span>
          <button
            onClick={() => setQuestionLang('en')}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              questionLang === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setQuestionLang('hi')}
            className={`px-2 py-0.5 rounded font-bold transition-all ${
              questionLang === 'hi' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Right: Timer & Exit */}
        <div className="flex items-center gap-4">
          {mode === 'test' ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
              secondsLeft < 300 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                : 'bg-slate-800 text-amber-400 border-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsLeft)}</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{questionLang === 'hi' ? 'उत्तर कुंजी एवं समाधान मोड' : 'Solution & Practice Mode'}</span>
            </div>
          )}

          <button
            onClick={onExit}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 transition"
          >
            {questionLang === 'hi' ? 'बाहर निकलें' : 'Exit'}
          </button>
        </div>
      </header>

      {/* Candidate Profile Strip (TCS style) */}
      <div className="bg-slate-200 border-b border-slate-300 px-4 py-1.5 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-4">
          <span><strong>Roll No:</strong> 240108924</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline"><strong>Candidate:</strong> Aspirant</span>
          <span>|</span>
          <span><strong>System:</strong> C001</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 font-semibold">+2.00 Marks</span>
          <span>|</span>
          <span className="text-rose-700 font-semibold">-0.50 Negative</span>
        </div>
      </div>

      {/* Section Selection Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-2 whitespace-nowrap">
          {questionLang === 'hi' ? 'अनुभाग (Sections):' : 'Sections:'}
        </span>
        {paper.sectionsIncluded.map((sec) => {
          const secQs = paper.questions.filter((q) => q.section === sec);
          const answeredInSec = secQs.filter((q) => responses[q.id]?.status === 'answered' || responses[q.id]?.status === 'answered_marked').length;
          const isActive = activeSection === sec;

          return (
            <button
              key={sec}
              id={`sec-tab-${sec}`}
              onClick={() => {
                setActiveSection(sec);
                setCurrentQIndex(0);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{questionLang === 'hi' ? SECTION_METADATA[sec].titleHi : SECTION_METADATA[sec].titleEn}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}>
                {answeredInSec}/{secQs.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Examination Workspace Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left / Center: Question Panel */}
        <div className="flex-1 flex flex-col bg-white border-r border-slate-200 overflow-y-auto p-4 sm:p-6 justify-between">
          {currentQuestion ? (
            <div className="space-y-6 max-w-4xl">
              
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-900 text-white font-extrabold text-sm px-3 py-1 rounded-md">
                    {questionLang === 'hi' ? `प्रश्न सं. ${currentQuestion.questionNumber}` : `Question ${currentQuestion.questionNumber}`}
                  </span>
                  {currentQuestion.topic && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {currentQuestion.topic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Switch single question language on mobile */}
                  <button
                    onClick={() => setQuestionLang((prev) => (prev === 'en' ? 'hi' : 'en'))}
                    className="sm:hidden text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded font-semibold text-slate-700"
                  >
                    {questionLang === 'en' ? 'हिन्दी में देखें' : 'View in English'}
                  </button>

                  <button
                    onClick={() => handleToggleBookmark(currentQuestion)}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                      responses[currentQuestion.id]?.isBookmarked
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${responses[currentQuestion.id]?.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span>{responses[currentQuestion.id]?.isBookmarked ? (questionLang === 'hi' ? 'बुकमार्क किया गया' : 'Bookmarked') : (questionLang === 'hi' ? 'बुकमार्क करें' : 'Bookmark')}</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-slate-900 text-base sm:text-lg leading-relaxed font-medium whitespace-pre-line py-2">
                {questionLang === 'hi' ? currentQuestion.textHi : currentQuestion.textEn}
              </div>

              {/* Options list */}
              <div className="space-y-3 pt-2">
                {(questionLang === 'hi' ? currentQuestion.optionsHi : currentQuestion.optionsEn).map((optText, optIdx) => {
                  const isSelected = responses[currentQuestion.id]?.selectedOption === optIdx;
                  const isStudyRevealed = mode === 'study' || revealedSolutions[currentQuestion.id];
                  const isCorrect = currentQuestion.correctOption === optIdx;

                  let borderClass = 'border-slate-200 hover:border-slate-300 bg-white';
                  if (isSelected) {
                    borderClass = 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500';
                  }

                  if (isStudyRevealed) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500';
                    }
                  }

                  return (
                    <label
                      key={optIdx}
                      id={`option-${currentQuestion.id}-${optIdx}`}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${borderClass}`}
                    >
                      <div className="flex items-center justify-center mt-0.5">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                          isSelected ? 'border-amber-600 bg-amber-500 text-white' : 'border-slate-400 bg-white text-slate-700'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                      </div>
                      <div className="flex-1 text-sm sm:text-base font-normal">
                        {optText}
                      </div>
                      {isStudyRevealed && isCorrect && (
                        <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> {questionLang === 'hi' ? 'सही उत्तर' : 'Correct'}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Study Mode: Detailed Solution & Shortcut Box */}
              {(mode === 'study' || revealedSolutions[currentQuestion.id]) && (
                <div className="mt-6 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>{questionLang === 'hi' ? 'विस्तृत समाधान एवं शॉर्टकट ट्रिक' : 'Detailed Solution & Shortcut Trick'}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {questionLang === 'hi' ? `सही विकल्प: (${String.fromCharCode(65 + currentQuestion.correctOption)})` : `Correct Option: (${String.fromCharCode(65 + currentQuestion.correctOption)})`}
                    </span>
                  </div>
                  <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                    {questionLang === 'hi' ? currentQuestion.explanationHi : currentQuestion.explanationEn}
                  </div>
                </div>
              )}

              {/* Toggle Solution in test mode if user wants to see instant solution */}
              {mode === 'test' && (
                <div className="pt-2">
                  <button
                    onClick={() => setRevealedSolutions(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
                    className="text-xs font-semibold text-slate-500 hover:text-amber-600 flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{revealedSolutions[currentQuestion.id] ? (questionLang === 'hi' ? 'समाधान छुपाएं' : 'Hide Solution') : (questionLang === 'hi' ? 'शॉर्टकट व व्याख्या देखें' : 'View Shortcut & Explanation')}</span>
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No questions found in this section.
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2">
              <button
                id="btn-mark-review"
                onClick={handleMarkForReviewAndNext}
                className="px-3.5 py-2 rounded-lg text-xs font-bold border border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 transition shadow-sm"
              >
                {questionLang === 'hi' ? 'मार्क फॉर रिव्यू एवं अगला' : 'Mark for Review & Next'}
              </button>
              <button
                id="btn-clear-response"
                onClick={handleClearResponse}
                className="px-3.5 py-2 rounded-lg text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition"
              >
                {questionLang === 'hi' ? 'उत्तर साफ़ करें' : 'Clear Response'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-prev-question"
                onClick={goToPrevQuestion}
                disabled={currentQIndex === 0 && paper.sectionsIncluded.indexOf(activeSection) === 0}
                className="px-3 py-2 rounded-lg text-xs font-bold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{questionLang === 'hi' ? 'पिछला' : 'Previous'}</span>
              </button>

              <button
                id="btn-save-next"
                onClick={handleSaveAndNext}
                className="px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm flex items-center gap-1.5"
              >
                <span>{questionLang === 'hi' ? 'सेव करें एवं आगे बढ़ें' : 'Save & Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Candidate & Question Palette (TCS Exam Engine) */}
        <div className="w-full lg:w-80 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between p-4 overflow-y-auto">
          <div>
            {/* Palette Header with Legend */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                {questionLang === 'hi' ? 'प्रश्नों की स्थिति (Legend)' : 'Question Status Legend'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {stats.answered}
                  </span>
                  <span>{questionLang === 'hi' ? 'उत्तर दिया (Answered)' : 'Answered'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {stats.notAnswered}
                  </span>
                  <span>{questionLang === 'hi' ? 'अनुत्तरित (Not Answered)' : 'Not Answered'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {stats.marked}
                  </span>
                  <span>{questionLang === 'hi' ? 'रिव्यू के लिए (Marked)' : 'Marked for Review'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] ring-2 ring-emerald-400">
                    {stats.answeredMarked}
                  </span>
                  <span>{questionLang === 'hi' ? 'उत्तर+रिव्यू' : 'Ans & Marked'}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                    {stats.notVisited}
                  </span>
                  <span>{questionLang === 'hi' ? 'देखा नहीं गया (Not Visited)' : 'Not Visited'}</span>
                </div>
              </div>
            </div>

            {/* Question Grid by Current Section */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  {SECTION_METADATA[activeSection]?.short} {questionLang === 'hi' ? 'प्रश्न पैलेट' : 'Palette'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {sectionQuestions.length} {questionLang === 'hi' ? 'प्रश्न' : 'Questions'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
                {sectionQuestions.map((q, idx) => {
                  const status = responses[q.id]?.status || 'not_visited';
                  const isCurrent = currentQIndex === idx;

                  return (
                    <button
                      key={q.id}
                      id={`palette-btn-${q.id}`}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-9 rounded-lg font-bold text-xs border transition-transform flex items-center justify-center ${getStatusColorClass(
                        status
                      )} ${isCurrent ? 'ring-2 ring-amber-500 scale-105 shadow-md' : 'hover:opacity-90'}`}
                    >
                      {q.questionNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Test Button */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              id="btn-submit-test"
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{questionLang === 'hi' ? 'टेस्ट सबमिट करें' : 'Submit Test'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>{questionLang === 'hi' ? 'टेस्ट सबमिशन सारांश' : 'Exam Submission Summary'}</span>
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600">
                {questionLang === 'hi'
                  ? 'क्या आप वाकई अपना टेस्ट सबमिट करना चाहते हैं? सबमिट करने के बाद आप उत्तर बदल नहीं सकेंगे।'
                  : 'Are you sure you want to submit your test? Once submitted, you cannot change your responses.'}
              </p>

              {/* Summary table */}
              <div className="overflow-hidden border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2">Section</th>
                      <th className="px-2 py-2 text-center">Total</th>
                      <th className="px-2 py-2 text-center text-emerald-700">Ans</th>
                      <th className="px-2 py-2 text-center text-rose-700">Unans</th>
                      <th className="px-2 py-2 text-center text-purple-700">Marked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {paper.sectionsIncluded.map((sec) => {
                      const secQs = paper.questions.filter((q) => q.section === sec);
                      const answered = secQs.filter(
                        (q) => responses[q.id]?.status === 'answered' || responses[q.id]?.status === 'answered_marked'
                      ).length;
                      const marked = secQs.filter(
                        (q) => responses[q.id]?.status === 'marked' || responses[q.id]?.status === 'answered_marked'
                      ).length;
                      const unans = secQs.length - answered;

                      return (
                        <tr key={sec}>
                          <td className="px-3 py-1.5 font-semibold text-slate-800">
                            {SECTION_METADATA[sec]?.short}
                          </td>
                          <td className="px-2 py-1.5 text-center font-bold">{secQs.length}</td>
                          <td className="px-2 py-1.5 text-center font-bold text-emerald-600">{answered}</td>
                          <td className="px-2 py-1.5 text-center font-bold text-rose-600">{unans}</td>
                          <td className="px-2 py-1.5 text-center font-bold text-purple-600">{marked}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {questionLang === 'hi' 
                    ? `शेष समय: ${formatTime(secondsLeft)}। टेस्ट पूरा होने के बाद विस्तृत रैंक एवं समाधान उपलब्ध होंगे।`
                    : `Remaining Time: ${formatTime(secondsLeft)}. Complete analysis & solutions will be generated instantly.`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                {questionLang === 'hi' ? 'परीक्षा जारी रखें' : 'Resume Exam'}
              </button>
              <button
                id="modal-confirm-submit-btn"
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmit();
                }}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                {questionLang === 'hi' ? 'हाँ, अंतिम सबमिट करें' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
