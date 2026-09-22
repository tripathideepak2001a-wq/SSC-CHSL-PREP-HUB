import React from 'react';
import { BookOpen, Award, CheckCircle2, Bookmark, FileText, Globe2, BarChart3, Zap, Flame, Lock, User, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'papers' | 'sectional' | 'daily-quiz' | 'pdf-store' | 'analytics' | 'bookmarks' | 'syllabus' | 'admin';
  setActiveTab: (tab: 'papers' | 'sectional' | 'daily-quiz' | 'pdf-store' | 'analytics' | 'bookmarks' | 'syllabus' | 'admin') => void;
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
  totalAttemptsCount: number;
  bookmarksCount: number;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  totalAttemptsCount,
  bookmarksCount,
  currentUser,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('papers')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  SSC CHSL <span className="text-amber-400">Prep Hub</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Tier-1 2025-26
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {lang === 'hi' ? 'पिछले वर्ष के प्रश्न पत्र एवं ऑल इंडिया मॉक टेस्ट' : 'Official PYQs, Shift Papers & Full Mock Tests'}
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            <button
              id="nav-tab-papers"
              onClick={() => setActiveTab('papers')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'papers'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{lang === 'hi' ? 'PYQ व मॉक' : 'PYQs & Mocks'}</span>
            </button>

            <button
              id="nav-tab-daily-quiz"
              onClick={() => setActiveTab('daily-quiz')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all relative ${
                activeTab === 'daily-quiz'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                  : 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/80'
              }`}
            >
              <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
              <span>{lang === 'hi' ? 'दैनिक क्विज़' : 'Daily Quiz'}</span>
              <span className="text-[9px] px-1 py-0.2 rounded-full font-black uppercase tracking-wider bg-orange-600 text-white shadow-xs">
                5-Q
              </span>
            </button>

            <button
              id="nav-tab-pdf-store"
              onClick={() => setActiveTab('pdf-store')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all relative ${
                activeTab === 'pdf-store'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? '₹49 ई-बुक्स' : '₹49 PDFs'}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-xs">
                CHSL
              </span>
            </button>

            <button
              id="nav-tab-sectional"
              onClick={() => setActiveTab('sectional')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sectional'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'hi' ? 'सेक्शनल टेस्ट' : 'Sectional'}</span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'analytics'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{lang === 'hi' ? 'रिजल्ट' : 'Scorecard'}</span>
              {totalAttemptsCount > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'analytics' ? 'bg-slate-900 text-amber-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {totalAttemptsCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-bookmarks"
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{lang === 'hi' ? 'बुकमार्क्स' : 'Saved Qs'}</span>
              {bookmarksCount > 0 && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'bookmarks' ? 'bg-slate-900 text-amber-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {bookmarksCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-syllabus"
              onClick={() => setActiveTab('syllabus')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'syllabus'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'hi' ? 'सिलेबस' : 'Syllabus'}</span>
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'hi' ? 'एडमिन' : 'Admin'}</span>
            </button>
          </nav>

          {/* Right Action: Login / Profile + Language Preference Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Student Auth Button (Gmail & Mobile Login) */}
            {currentUser ? (
              <button
                id="btn-nav-profile"
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-all text-xs active:scale-95 group"
                title={currentUser.email || currentUser.phone}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-white block text-[11px] leading-tight truncate max-w-[105px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-amber-400 leading-tight block">
                    {currentUser.category} • {currentUser.targetScore} लक्ष्य
                  </span>
                </div>
              </button>
            ) : (
              <button
                id="btn-nav-login"
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/10 transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'लॉगिन' : 'Sign In'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <Globe2 className="w-4 h-4 text-slate-400 ml-1.5 mr-1 hidden sm:inline" />
              <button
                id="btn-lang-en"
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  lang === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                id="btn-lang-hi"
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                  lang === 'hi'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sub-bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 px-2 py-2 bg-slate-900/95 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('papers')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'papers' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          {lang === 'hi' ? 'PYQ व मॉक' : 'PYQ & Mocks'}
        </button>
        <button
          onClick={() => setActiveTab('daily-quiz')}
          className={`px-2.5 py-1.5 rounded-md font-bold whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'daily-quiz' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950' : 'text-amber-400'
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          {lang === 'hi' ? 'डेली क्विज़' : 'Daily 5-Q'}
        </button>
        <button
          onClick={() => setActiveTab('pdf-store')}
          className={`px-2.5 py-1.5 rounded-md font-bold whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'pdf-store' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          {lang === 'hi' ? '₹49 ई-बुक्स' : '₹49 PDFs'}
        </button>
        <button
          onClick={() => setActiveTab('sectional')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'sectional' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          {lang === 'hi' ? 'सेक्शनल' : 'Sectional'}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          {lang === 'hi' ? 'रिजल्ट' : 'Scorecard'}
          {totalAttemptsCount > 0 && <span className="text-[10px] bg-amber-400/30 px-1 rounded">{totalAttemptsCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'bookmarks' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          {lang === 'hi' ? 'बुकमार्क्स' : 'Saved'}
          {bookmarksCount > 0 && <span className="text-[10px] bg-amber-400/30 px-1 rounded">{bookmarksCount}</span>}
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'syllabus' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          {lang === 'hi' ? 'कटऑफ' : 'Cutoff'}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-2.5 py-1.5 rounded-md font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'admin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          <Lock className="w-3 h-3 text-amber-400" />
          {lang === 'hi' ? 'एडमिन' : 'Admin'}
        </button>

        {/* Mobile Profile / Login Button */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="px-2.5 py-1.5 rounded-md font-bold whitespace-nowrap flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30"
        >
          <User className="w-3.5 h-3.5" />
          <span>{currentUser ? currentUser.name.split(' ')[0] : (lang === 'hi' ? 'लॉगिन' : 'Login')}</span>
        </button>
      </div>
    </header>
  );
};
