import React, { useState } from 'react';
import { CHSL_CUTOFFS_HISTORY, CHSL_SYLLABUS, EXAM_PATTERN_INFO } from '../data/syllabusCutoffs';
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SyllabusCutoffsViewProps {
  lang: 'en' | 'hi';
}

export const SyllabusCutoffsView: React.FC<SyllabusCutoffsViewProps> = ({ lang }) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" />
            {lang === 'hi' ? 'ऑफिशियल परीक्षा गाइड' : 'Official Exam Pattern & Analysis'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            {lang === 'hi' ? 'SSC CHSL टियर-1 सिलेबस, परीक्षा पैटर्न व कटऑफ ट्रेंड' : 'SSC CHSL Tier-1 Syllabus, Exam Pattern & Cutoffs'}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            {lang === 'hi'
              ? 'आधिकारिक अंकन योजना, 2019-2024 के श्रेणीवार कटऑफ विश्लेषण, और विषयवार महत्वपूर्ण टॉपिक वेटेज।'
              : 'Complete breakdown of negative marking, previous 5 years official cutoffs (UR/OBC/EWS/SC/ST), and high-weightage topics.'}
          </p>
        </div>
      </div>

      {/* Exam Pattern Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <span>{lang === 'hi' ? 'SSC CHSL टियर-1 परीक्षा पैटर्न एवं अंकन प्रणाली' : 'Exam Pattern & Scheme of Marks'}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              {lang === 'hi' ? 'कुल प्रश्न' : 'Total Questions'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              100 Qs
            </span>
            <span className="text-[11px] text-slate-500 font-medium">25 questions per section</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              {lang === 'hi' ? 'पूर्णांक (Total Marks)' : 'Total Marks'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              200 Marks
            </span>
            <span className="text-[11px] text-slate-500 font-medium">+2.00 marks for each correct</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              {lang === 'hi' ? 'समय अवधि' : 'Exam Duration'}
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-amber-500" />
              60 Mins
            </span>
            <span className="text-[11px] text-slate-500 font-medium">80 mins for eligible PwD</span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-xs text-rose-700 font-semibold block uppercase">
              {lang === 'hi' ? 'नेगेटिव मार्किंग' : 'Negative Marking'}
            </span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">
              -0.50 Marks
            </span>
            <span className="text-[11px] text-rose-600 font-medium">1/4th penalty for wrong answer</span>
          </div>
        </div>
      </div>

      {/* Official Cutoffs Trend Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'hi' ? 'विगत वर्षों का श्रेणीवार टियर-1 कटऑफ ट्रेंड' : 'Official Previous Years Tier-1 Cutoffs Trend'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' ? 'नॉर्मलाइज्ड मार्क्स के आधार पर आधिकारिक SSC कटऑफ आंकड़े' : 'Actual normalized cutoff marks released by Staff Selection Commission'}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
            Safe Target: 155+
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Year / Exam</th>
                <th className="px-3 py-3 text-center text-amber-700 bg-amber-50/50">UR (Gen)</th>
                <th className="px-3 py-3 text-center">OBC</th>
                <th className="px-3 py-3 text-center">EWS</th>
                <th className="px-3 py-3 text-center">SC</th>
                <th className="px-3 py-3 text-center">ST</th>
                <th className="px-4 py-3 text-right">Qualified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {CHSL_CUTOFFS_HISTORY.map((item, idx) => (
                <tr key={idx} className={idx === 0 ? 'bg-amber-50/30 font-semibold' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                    {idx === 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    {item.year}
                  </td>
                  <td className="px-3 py-3 text-center font-extrabold text-amber-900 bg-amber-50/40">
                    {item.ur.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-slate-800">{item.obc.toFixed(2)}</td>
                  <td className="px-3 py-3 text-center font-bold text-slate-800">{item.ews.toFixed(2)}</td>
                  <td className="px-3 py-3 text-center font-medium text-slate-700">{item.sc.toFixed(2)}</td>
                  <td className="px-3 py-3 text-center font-medium text-slate-700">{item.st.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-500">{item.candidatesQualified}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {lang === 'hi'
              ? 'टिप: कटऑफ प्रतिवर्ष 153-157 के आसपास रहता है। अनारक्षित (UR) और ओबीसी के लिए कम से कम 155+ का रॉ स्कोर लक्ष्य बनाकर मॉक टेस्ट में अभ्यास करें।'
              : 'Key Takeaway: With cutoffs consistently ranging 153–157, aim for 80+ attempts with 90%+ accuracy in mock tests to comfortably clear Tier-1.'}
          </span>
        </div>
      </div>

      {/* Section-Wise Syllabus Accordion */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>{lang === 'hi' ? 'विषयवार आधिकारिक सिलेबस एवं उच्च-वेटेज टॉपिक्स' : 'Section-Wise Official Syllabus & Weightage'}</span>
        </h3>

        <div className="space-y-3">
          {CHSL_SYLLABUS.map((sec, idx) => {
            const isExpanded = expandedSection === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {lang === 'hi' ? sec.hindiName : sec.section}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {sec.questions} {lang === 'hi' ? 'प्रश्न' : 'Questions'} • {sec.marks} {lang === 'hi' ? 'अंक' : 'Marks'}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sec.topics.map((t, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{t.name}</span>
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">
                              {t.weightage}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] leading-relaxed">
                            {t.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exam Strategy Guide */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/60 rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          <span>{lang === 'hi' ? 'टॉपर की 60 मिनट समय प्रबंधन रणनीति' : "Topper's 60-Minute Time Management Strategy"}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
            <span className="font-black text-amber-800 block text-base mb-1">1. General Awareness</span>
            <span className="text-slate-600 block mb-1">⏰ <strong>7 - 8 Minutes</strong></span>
            <p className="text-[11px] text-slate-500 leading-tight">
              {lang === 'hi' ? 'सीधे प्रश्न, तुरंत उत्तर दें या आगे बढ़ें। समय बचाएं।' : 'No calculation needed. Direct click-and-move.'}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
            <span className="font-black text-amber-800 block text-base mb-1">2. English Language</span>
            <span className="text-slate-600 block mb-1">⏰ <strong>10 - 12 Minutes</strong></span>
            <p className="text-[11px] text-slate-500 leading-tight">
              {lang === 'hi' ? 'वोकैब, क्लोज टेस्ट और एरर पहले हल करें।' : 'High scoring speed section with grammar and cloze.'}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
            <span className="font-black text-amber-800 block text-base mb-1">3. Reasoning</span>
            <span className="text-slate-600 block mb-1">⏰ <strong>15 - 18 Minutes</strong></span>
            <p className="text-[11px] text-slate-500 leading-tight">
              {lang === 'hi' ? 'सीरीज, कोडिंग, एनॉलॉजी में 23+ सही करने का लक्ष्य रखें।' : 'Aim for 45+ marks here. Skip any tricky series.'}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
            <span className="font-black text-amber-800 block text-base mb-1">4. Quantitative Math</span>
            <span className="text-slate-600 block mb-1">⏰ <strong>22 - 25 Minutes</strong></span>
            <p className="text-[11px] text-slate-500 leading-tight">
              {lang === 'hi' ? 'अंकगणित और एडवांस मैथ के लिए पर्याप्त समय बचाकर रखें।' : 'Maximum calculation time needed for arithmetic & algebra.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
