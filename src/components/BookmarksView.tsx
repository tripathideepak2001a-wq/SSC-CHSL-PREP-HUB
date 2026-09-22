import React, { useState } from 'react';
import { BookmarkItem, SubjectType } from '../types';
import { Bookmark, Sparkles, Check, Trash2, HelpCircle, BookOpen, Layers } from 'lucide-react';
import { toggleBookmark } from '../utils/storage';

interface BookmarksViewProps {
  bookmarks: BookmarkItem[];
  lang: 'en' | 'hi';
  onRefresh: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  lang,
  onRefresh,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const filteredBookmarks = bookmarks.filter((b) => {
    if (selectedSection !== 'all' && b.question.section !== selectedSection) {
      return false;
    }
    return true;
  });

  const handleRemove = (item: BookmarkItem) => {
    toggleBookmark(item.question, item.paperId, item.paperTitle);
    onRefresh();
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {lang === 'hi' ? 'सहेजे गए कठिन प्रश्न (बुकमार्क्स)' : 'Saved & Tricky Question Bank'}
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm">
              {lang === 'hi'
                ? 'वे सभी प्रश्न जिन्हें आपने अभ्यास या टेस्ट के दौरान महत्वपूर्ण समझकर बुकमार्क किया था।'
                : 'Revise your saved tricky questions, short tricks, and explanations anytime.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setSelectedSection('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedSection === 'all'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'hi' ? `सभी (${bookmarks.length})` : `All (${bookmarks.length})`}
          </button>
          <button
            onClick={() => setSelectedSection('reasoning')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedSection === 'reasoning'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Reasoning
          </button>
          <button
            onClick={() => setSelectedSection('quant')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedSection === 'quant'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Quantitative (Math)
          </button>
          <button
            onClick={() => setSelectedSection('ga')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedSection === 'ga'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            General Awareness
          </button>
          <button
            onClick={() => setSelectedSection('english')}
            className={`px-3 py-1.5 rounded-lg transition ${
              selectedSection === 'english'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Bookmarks List */}
      {filteredBookmarks.length > 0 ? (
        <div className="space-y-4">
          {filteredBookmarks.map((item) => {
            const q = item.question;
            const isRevealed = revealedIds[q.id];

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs px-2.5 py-1 rounded bg-slate-900 text-white">
                      Q {q.questionNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {q.section}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      From: {item.paperTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReveal(q.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                    >
                      {isRevealed
                        ? (lang === 'hi' ? 'उत्तर छुपाएं' : 'Hide Answer')
                        : (lang === 'hi' ? 'उत्तर व हल देखें' : 'Show Answer & Trick')}
                    </button>
                    <button
                      onClick={() => handleRemove(item)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-slate-900 font-medium text-base whitespace-pre-line leading-relaxed">
                  {lang === 'hi' ? q.textHi : q.textEn}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(lang === 'hi' ? q.optionsHi : q.optionsEn).map((opt, idx) => {
                    const isCorrect = q.correctOption === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-sm flex items-center gap-2.5 transition ${
                          isRevealed && isCorrect
                            ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-950 ring-1 ring-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isRevealed && isCorrect && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isRevealed && (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-900 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lang === 'hi' ? 'विस्तृत व्याख्या एवं शॉर्टकट विधि:' : 'Explanation & Shortcut Trick:'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {lang === 'hi' ? q.explanationHi : q.explanationEn}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">
            {lang === 'hi' ? 'कोई बुकमार्क नहीं मिला' : 'No Bookmarked Questions Yet'}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
            {lang === 'hi'
              ? 'टेस्ट देते समय या प्रश्न पत्र देखते समय किसी भी प्रश्न के बुकमार्क आइकन पर क्लिक करके उसे यहाँ सहेजें।'
              : 'Click the bookmark icon on any tricky question while taking a mock test or reading solutions to save it here for fast revision.'}
          </p>
        </div>
      )}
    </div>
  );
};
