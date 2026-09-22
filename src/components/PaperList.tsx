import React, { useState } from 'react';
import { Paper, TestAttempt } from '../types';
import { 
  Play, 
  BookOpen, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  Search, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Award,
  Flame,
  Zap,
  FileText
} from 'lucide-react';

interface PaperListProps {
  papers: Paper[];
  attempts: TestAttempt[];
  lang: 'en' | 'hi';
  onStartTest: (paper: Paper, mode: 'test' | 'study') => void;
  filterType?: 'all' | 'pyq' | 'mock' | 'sectional';
  onNavigateToDailyQuiz?: () => void;
  onNavigateToPDFStore?: () => void;
}

export const PaperList: React.FC<PaperListProps> = ({
  papers,
  attempts,
  lang,
  onStartTest,
  filterType = 'all',
  onNavigateToDailyQuiz,
  onNavigateToPDFStore,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(filterType === 'all' ? 'all' : filterType);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter papers
  const filteredPapers = papers.filter((paper) => {
    // category filter
    if (selectedCategory !== 'all' && paper.type !== selectedCategory) {
      return false;
    }
    // year filter
    if (selectedYear !== 'all' && paper.year.toString() !== selectedYear) {
      return false;
    }
    // difficulty filter
    if (selectedDifficulty !== 'all' && paper.difficulty !== selectedDifficulty) {
      return false;
    }
    // search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = paper.title.toLowerCase().includes(q) || paper.hindiTitle.toLowerCase().includes(q);
      const matchTag = paper.tags.some(t => t.toLowerCase().includes(q));
      const matchShift = paper.shift?.toLowerCase().includes(q);
      if (!matchTitle && !matchTag && !matchShift) return false;
    }
    return true;
  });

  const getBestScore = (paperId: string) => {
    const paperAttempts = attempts.filter((a) => a.paperId === paperId);
    if (paperAttempts.length === 0) return null;
    return Math.max(...paperAttempts.map((a) => a.score));
  };

  const getDifficultyBadge = (diff: 'Easy' | 'Moderate' | 'Hard') => {
    switch (diff) {
      case 'Easy':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{lang === 'hi' ? 'सरल' : 'Easy'}</span>;
      case 'Moderate':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">{lang === 'hi' ? 'मध्यम' : 'Moderate'}</span>;
      case 'Hard':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-500/10 text-rose-600 border border-rose-500/20">{lang === 'hi' ? 'कठिन' : 'Hard'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Announcement */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'hi' ? '100% असली टीसीएस परीक्षा पैटर्न' : '100% Authentic TCS Exam Simulator'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {lang === 'hi' 
              ? 'SSC CHSL पिछले वर्ष के प्रश्न पत्र और मॉक टेस्ट' 
              : 'SSC CHSL Previous Year Papers & Live Mock Tests'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            {lang === 'hi'
              ? '2024, 2023, 2022 की सभी शिफ्टों के प्रश्न पत्र, नवीनतम ऑल इंडिया मॉक टेस्ट और द्विभाषी (हिंदी/English) व्याख्या के साथ रियल परीक्षा माहौल में अभ्यास करें।'
              : 'Practice real TCS iON shift papers with countdown timer, +2 / -0.5 negative marking, bilingual questions, and step-by-step smart shortcuts.'}
          </p>

          <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'नेगेटिव मार्किंग: -0.50' : 'Marking: +2 / -0.50'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'कटऑफ लक्ष्य: 153+' : 'Safe Target: 153+ Marks'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>{lang === 'hi' ? '2020-2024 शिफ्ट्स' : '2020-2024 Official Shifts'}</span>
            </div>
          </div>
        </div>

        {/* Decorative graphic element */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none hidden lg:block">
          <Award className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Daily Quiz Teaser Banner */}
      {onNavigateToDailyQuiz && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-orange-500/20">
              <Flame className="w-7 h-7 fill-white text-white animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-orange-600 text-white tracking-wider">
                  TODAY'S 5-Q DRILL
                </span>
                <span className="text-xs text-amber-900 font-bold">22 Sept 2026</span>
                <span className="text-xs text-slate-500 hidden sm:inline">• 5 Mins • 10 Marks</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {lang === 'hi' ? 'दैनिक 5-प्रश्न स्पीड टेस्ट (रीजनिंग, क्वांट, GK, इंग्लिश)' : 'Daily Speed Drill: 5 Curated High-Yield Questions'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {lang === 'hi'
                  ? 'लाइव ऑल इंडिया लीडरबोर्ड में शामिल हों और अपनी दैनिक स्पीड व एक्यूरेसी ट्रैक करें।'
                  : 'Compete with thousands of aspirants on today\'s live leaderboard with real-time countdown timer.'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToDailyQuiz}
            className="self-start sm:self-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>{lang === 'hi' ? 'आज की क्विज़ दें (5 मिनट)' : 'Take Daily Quiz (5 Min)'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Special ₹49 PDF E-Books & Most Expected Questions Banner */}
      {onNavigateToPDFStore && (
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-500/30 shadow-md">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 font-black shadow-lg">
              <FileText className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 tracking-wider">
                  ₹49 PER PDF SPECIAL
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  {lang === 'hi' ? 'सीएचएसएल 2025-26 एग्जाम रेडी' : 'CHSL 2025-26 Print-Ready'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {lang === 'hi'
                  ? 'अति-संभावित 500 प्रश्न पीडीएफ: रीजनिंग, क्वांट, जीके व इंग्लिश (शॉर्ट ट्रिक्स सहित)'
                  : 'SSC CHSL 500 Most Expected Questions PDF: All 4 Sections with Shortcuts'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'hi'
                  ? 'परीक्षा में आने वाले सभी रिपीटेड प्रश्न एक जगह। केवल ₹49 में तुरंत डाउनलोड करें या A4 साइज में प्रिंट निकालें।'
                  : 'All recurring TCS exam models in one master document. Download or print directly for ₹49 only.'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToPDFStore}
            className="self-start sm:self-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 shrink-0 active:scale-95"
          >
            <span>{lang === 'hi' ? '₹49 पीडीएफ देखें व डाउनलोड करें' : 'Get ₹49 PDFs Now'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-papers-input"
            type="text"
            placeholder={lang === 'hi' ? 'पेपर का नाम, वर्ष या शिफ्ट खोजें (उदा: 2024, Mock)...' : 'Search by paper title, year, or shift...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
          />
        </div>

        {/* Category & Year filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedCategory === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'सभी' : 'All'}
            </button>
            <button
              onClick={() => setSelectedCategory('pyq')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedCategory === 'pyq' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'PYQ पेपर्स' : 'PYQ Papers'}
            </button>
            <button
              onClick={() => setSelectedCategory('mock')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedCategory === 'mock' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'फुल मॉक' : 'Full Mocks'}
            </button>
            <button
              onClick={() => setSelectedCategory('sectional')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                selectedCategory === 'sectional' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'सेक्शनल' : 'Sectional'}
            </button>
          </div>

          {/* Difficulty Level Filter (Easy, Moderate, Hard) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
            <span className="px-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider hidden lg:inline">
              {lang === 'hi' ? 'स्तर:' : 'Difficulty:'}
            </span>
            <button
              id="filter-difficulty-all"
              onClick={() => setSelectedDifficulty('all')}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                selectedDifficulty === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
              }`}
            >
              {lang === 'hi' ? 'सभी स्तर' : 'All Levels'}
            </button>
            <button
              id="filter-difficulty-easy"
              onClick={() => setSelectedDifficulty('Easy')}
              className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                selectedDifficulty === 'Easy' ? 'bg-emerald-600 text-white shadow-sm font-bold' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{lang === 'hi' ? 'सरल' : 'Easy'}</span>
            </button>
            <button
              id="filter-difficulty-moderate"
              onClick={() => setSelectedDifficulty('Moderate')}
              className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                selectedDifficulty === 'Moderate' ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{lang === 'hi' ? 'मध्यम' : 'Moderate'}</span>
            </button>
            <button
              id="filter-difficulty-hard"
              onClick={() => setSelectedDifficulty('Hard')}
              className={`px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                selectedDifficulty === 'Hard' ? 'bg-rose-600 text-white shadow-sm font-bold' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>{lang === 'hi' ? 'कठिन' : 'Hard'}</span>
            </button>
          </div>

          <select
            id="select-year-filter"
            aria-label="Filter by Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="all">{lang === 'hi' ? 'सभी वर्ष (All Years)' : 'All Years'}</option>
            <option value="2025">2025 Mocks</option>
            <option value="2024">2024 Shift Papers</option>
            <option value="2023">2023 Shift Papers</option>
            <option value="2022">2022 Shift Papers</option>
          </select>
        </div>
      </div>

      {/* Filter Status Summary (If filters applied) */}
      {(selectedDifficulty !== 'all' || selectedCategory !== 'all' || selectedYear !== 'all' || searchQuery.trim()) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              {lang === 'hi' ? 'दिखाए जा रहे हैं:' : 'Showing:'} <strong>{filteredPapers.length}</strong> {lang === 'hi' ? 'टेस्ट' : 'tests'}
            </span>
            {selectedDifficulty !== 'all' && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                selectedDifficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                selectedDifficulty === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {lang === 'hi' ? 'स्तर:' : 'Level:'} {selectedDifficulty}
                <button onClick={() => setSelectedDifficulty('all')} className="ml-1 hover:opacity-75">×</button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[11px]">
                {selectedCategory.toUpperCase()}
                <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:opacity-75">×</button>
              </span>
            )}
            {selectedYear !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[11px]">
                {selectedYear}
                <button onClick={() => setSelectedYear('all')} className="ml-1 hover:opacity-75">×</button>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedYear('all');
              setSelectedDifficulty('all');
              setSearchQuery('');
            }}
            className="text-amber-600 hover:text-amber-700 font-bold hover:underline"
          >
            {lang === 'hi' ? 'सभी फ़िल्टर साफ़ करें' : 'Clear all filters'}
          </button>
        </div>
      )}

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPapers.map((paper) => {
          const bestScore = getBestScore(paper.id);
          const paperAttempts = attempts.filter((a) => a.paperId === paper.id);

          return (
            <div
              key={paper.id}
              id={`paper-card-${paper.id}`}
              className="bg-white rounded-xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                    paper.type === 'pyq'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : paper.type === 'mock'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {paper.type === 'pyq' 
                      ? (lang === 'hi' ? 'ऑफिशियल PYQ' : 'Official PYQ')
                      : paper.type === 'mock' 
                      ? (lang === 'hi' ? 'लाइव मॉक टेस्ट' : 'Live Mock Test')
                      : (lang === 'hi' ? 'सेक्शनल ड्रिल' : 'Sectional Drill')}
                  </span>
                  {getDifficultyBadge(paper.difficulty)}
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-2 mb-1">
                  {lang === 'hi' ? paper.hindiTitle : paper.title}
                </h3>

                {paper.shift && (
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    {paper.shift} {paper.examDate ? `• ${paper.examDate}` : ''}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {paper.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {lang === 'hi' ? 'प्रश्न' : 'Questions'}
                    </span>
                    <span className="font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      {paper.totalQuestions}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {lang === 'hi' ? 'कुल अंक' : 'Marks'}
                    </span>
                    <span className="font-bold text-slate-800 block mt-0.5">
                      {paper.totalMarks} M
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {lang === 'hi' ? 'समय' : 'Time'}
                    </span>
                    <span className="font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {paper.durationMinutes}m
                    </span>
                  </div>
                </div>

                {/* Best Score Banner if attempted */}
                {bestScore !== null && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-200/70 rounded-lg p-2 flex items-center justify-between text-xs text-emerald-800">
                    <span className="flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      {lang === 'hi' ? 'सर्वश्रेष्ठ स्कोर:' : 'Best Score:'}
                    </span>
                    <span className="font-extrabold text-emerald-900">
                      {bestScore.toFixed(1)} / {paper.totalMarks}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  id={`btn-attempt-${paper.id}`}
                  onClick={() => onStartTest(paper, 'test')}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-3 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{paperAttempts.length > 0 ? (lang === 'hi' ? 'पुनः टेस्ट दें' : 'Re-attempt Test') : (lang === 'hi' ? 'टेस्ट शुरू करें' : 'Start Test')}</span>
                </button>

                <button
                  id={`btn-study-${paper.id}`}
                  onClick={() => onStartTest(paper, 'study')}
                  title={lang === 'hi' ? 'उत्तर कुंजी और समाधान देखें' : 'View Questions & Detailed Solutions'}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-3 rounded-lg border border-slate-200 text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">{lang === 'hi' ? 'उत्तर कुंजी' : 'Solutions'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPapers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">
            {lang === 'hi' ? 'कोई प्रश्न पत्र नहीं मिला' : 'No papers found'}
          </h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {lang === 'hi'
              ? 'कृपया अपना सर्च कीवर्ड या फिल्टर बदलकर पुनः प्रयास करें।'
              : 'Please try changing your search query or reset the year filter.'}
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedYear('all');
              setSelectedDifficulty('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            {lang === 'hi' ? 'सभी फिल्टर रीसेट करें' : 'Reset All Filters'}
          </button>
        </div>
      )}
    </div>
  );
};
