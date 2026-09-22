import React from 'react';
import { TestAttempt, Paper } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Award, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AnalyticsDashboardProps {
  attempts: TestAttempt[];
  papers: Paper[];
  lang: 'en' | 'hi';
  onViewAttempt: (attempt: TestAttempt) => void;
  onExplorePapers: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  attempts,
  papers,
  lang,
  onViewAttempt,
  onExplorePapers,
}) => {
  if (attempts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          {lang === 'hi' ? 'अभी तक कोई टेस्ट नहीं दिया गया' : 'No Test Attempts Yet'}
        </h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          {lang === 'hi'
            ? 'अपनी तैयारी का स्तर और ऑल इंडिया रैंक जानने के लिए किसी भी प्रीवियस ईयर पेपर या लाइव मॉक टेस्ट को शुरू करें।'
            : 'Take an authentic previous year shift paper or full mock test to unlock detailed progress tracking, speed analytics, and percentile ranks.'}
        </p>
        <button
          onClick={onExplorePapers}
          className="mt-6 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition shadow-sm inline-flex items-center gap-2"
        >
          <span>{lang === 'hi' ? 'पहला टेस्ट शुरू करें' : 'Start Your First Test'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Calculate aggregated metrics
  const totalTests = attempts.length;
  const avgScore = attempts.reduce((acc, a) => acc + a.score, 0) / totalTests;
  const avgAccuracy = Math.round(attempts.reduce((acc, a) => acc + a.accuracy, 0) / totalTests);
  const highestScore = Math.max(...attempts.map((a) => a.score));

  // Section-wise aggregates
  let totalReasoningScore = 0;
  let totalGAScore = 0;
  let totalQuantScore = 0;
  let totalEnglishScore = 0;

  attempts.forEach((a) => {
    totalReasoningScore += a.sectionScores?.reasoning?.score || 0;
    totalGAScore += a.sectionScores?.ga?.score || 0;
    totalQuantScore += a.sectionScores?.quant?.score || 0;
    totalEnglishScore += a.sectionScores?.english?.score || 0;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 inline-block mb-2">
              {lang === 'hi' ? 'तैयारी का प्रगति रिपोर्ट कार्ड' : 'Candidate Progress & Analytics'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {lang === 'hi' ? 'आपका समग्र प्रदर्शन विश्लेषण' : 'Comprehensive Performance Tracker'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {lang === 'hi'
                ? `आपने अब तक ${totalTests} टेस्ट सफलता पूर्वक दिए हैं।`
                : `You have successfully completed ${totalTests} test attempts.`}
            </p>
          </div>

          <button
            onClick={onExplorePapers}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <span>{lang === 'hi' ? 'नया टेस्ट दें' : 'Take Another Test'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block uppercase">
            {lang === 'hi' ? 'दिए गए टेस्ट' : 'Tests Taken'}
          </span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">
            {totalTests}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">Completed CBEs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block uppercase">
            {lang === 'hi' ? 'औसत स्कोर' : 'Average Score'}
          </span>
          <span className="text-3xl font-black text-amber-500 mt-1 block">
            {avgScore.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Out of test max</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block uppercase">
            {lang === 'hi' ? 'उच्चतम स्कोर' : 'Highest Score'}
          </span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">
            {highestScore.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Personal Best</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block uppercase">
            {lang === 'hi' ? 'औसत सटीकता' : 'Avg Accuracy'}
          </span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">
            {avgAccuracy}%
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">Target: 85%+</span>
        </div>
      </div>

      {/* Test Attempts History List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>{lang === 'hi' ? 'हाल ही में दिए गए टेस्ट का इतिहास' : 'Recent Test Attempt History'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {lang === 'hi' ? 'समाधान देखने के लिए क्लिक करें' : 'Click to inspect solutions'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {attempts.map((att) => {
            const paper = papers.find((p) => p.id === att.paperId);
            const scorePct = (att.score / att.totalMarks) * 100;

            return (
              <div
                key={att.id}
                onClick={() => onViewAttempt(att)}
                className="p-4 sm:p-5 hover:bg-slate-50/90 cursor-pointer transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base hover:text-amber-600 transition">
                      {att.paperTitle}
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {paper?.shift || 'CBE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(att.date).toLocaleDateString()} at {new Date(att.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Score</span>
                    <span className="font-black text-base sm:text-lg text-slate-900">
                      {att.score.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/{att.totalMarks}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Accuracy</span>
                    <span className="font-extrabold text-sm sm:text-base text-emerald-600">
                      {att.accuracy}%
                    </span>
                  </div>

                  <button
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-amber-500 hover:text-slate-950 transition"
                    title="View Solution"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
