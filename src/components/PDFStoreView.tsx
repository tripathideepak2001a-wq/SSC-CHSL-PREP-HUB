import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  Star,
  Zap,
  Sparkles,
  Search,
  Lock,
  Unlock,
  Eye,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  Check,
  Flame,
  Award,
  Copy,
  ExternalLink
} from 'lucide-react';
import { PDFBundle, Question, UserProfile } from '../types';
import { PDF_BUNDLES_DATABASE } from '../data/pdfData';
import { getUnlockedPDFIds, unlockPDF, getUserAspirantName } from '../utils/storage';
import { apiCreateOrder, apiGetSystemSettings } from '../utils/api';

interface PDFStoreViewProps {
  lang: 'en' | 'hi';
  onBackToHome?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const PDFStoreView: React.FC<PDFStoreViewProps> = ({ 
  lang, 
  onBackToHome,
  currentUser,
  onOpenAuth 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  
  // Viewing PDF in full reader / printable view
  const [activePdf, setActivePdf] = useState<PDFBundle | null>(null);
  const [isSampleMode, setIsSampleMode] = useState<boolean>(false);
  
  // Payment Modal state
  const [purchasingPdf, setPurchasingPdf] = useState<PDFBundle | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'qr'>('upi');
  const [upiIdInput, setUpiIdInput] = useState<string>('aspirant@okaxis');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [systemSettings, setSystemSettings] = useState<{ upiId: string; merchantName: string }>({
    upiId: 'sscchslprep@axisbank',
    merchantName: 'SSC CHSL Prep Hub Edu Services'
  });
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utrInput, setUtrInput] = useState<string>('');

  // Reader language preference
  const [readerLang, setReaderLang] = useState<'both' | 'en' | 'hi'>('both');

  useEffect(() => {
    setUnlockedIds(getUnlockedPDFIds());
    apiGetSystemSettings().then((s) => {
      if (s) {
        setSystemSettings({
          upiId: s.upiId || 'sscchslprep@axisbank',
          merchantName: s.merchantName || 'SSC CHSL Prep Hub Edu Services'
        });
      }
    });
  }, []);

  const handleOpenPdf = (pdf: PDFBundle, sampleOnly: boolean = false) => {
    setActivePdf(pdf);
    setIsSampleMode(sampleOnly);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInitiatePurchase = (pdf: PDFBundle) => {
    setPurchasingPdf(pdf);
    setPaymentSuccess(false);
    setIsProcessingPayment(false);
  };

  const handleCompletePurchase = async () => {
    if (!purchasingPdf) return;
    setIsProcessingPayment(true);

    try {
      await apiCreateOrder({
        pdfId: purchasingPdf.id,
        pdfTitle: purchasingPdf.title,
        amount: purchasingPdf.price,
        originalPrice: purchasingPdf.originalPrice,
        customerName: currentUser?.name || getUserAspirantName(),
        customerPhone: currentUser?.phone || '9876543210',
        customerEmail: currentUser?.email || undefined,
        paymentMethod: paymentMethod === 'qr' ? 'qr' : paymentMethod === 'card' ? 'card' : 'upi',
        utrNumber: utrInput ? utrInput.trim() : undefined
      });
    } catch (err) {
      console.warn('Backend order recording fallback:', err);
    }

    setTimeout(() => {
      unlockPDF(purchasingPdf.id);
      setUnlockedIds(getUnlockedPDFIds());
      setIsProcessingPayment(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        const bought = purchasingPdf;
        setPurchasingPdf(null);
        handleOpenPdf(bought, false);
      }, 1200);
    }, 900);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const filteredPdfs = PDF_BUNDLES_DATABASE.filter((pdf) => {
    if (selectedCategory !== 'all' && pdf.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = pdf.title.toLowerCase().includes(q) || pdf.hindiTitle.toLowerCase().includes(q);
      const matchDesc = pdf.descriptionEn.toLowerCase().includes(q) || pdf.descriptionHi.toLowerCase().includes(q);
      const matchHighlights = pdf.highlightsEn.some((h) => h.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchHighlights) return false;
    }
    return true;
  });

  // -------------------------------------------------------------
  // RENDER: PDF Reader / Printable View
  // -------------------------------------------------------------
  if (activePdf) {
    const isUnlocked = unlockedIds.includes(activePdf.id) || !isSampleMode;

    return (
      <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 animate-fadeIn">
        {/* Top Control Bar (Hidden on print) */}
        <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
          <button
            onClick={() => setActivePdf(null)}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'पीडीएफ स्टोर पर वापस जाएं' : 'Back to PDF Store'}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Language filter for questions */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
              <button
                onClick={() => setReaderLang('both')}
                className={`px-2.5 py-1 rounded-md transition-all ${readerLang === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                {lang === 'hi' ? 'द्विभाषी (Bilingual)' : 'Both (En+Hi)'}
              </button>
              <button
                onClick={() => setReaderLang('hi')}
                className={`px-2.5 py-1 rounded-md transition-all ${readerLang === 'hi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setReaderLang('en')}
                className={`px-2.5 py-1 rounded-md transition-all ${readerLang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                English
              </button>
            </div>

            {/* Print or Download PDF Button */}
            <button
              id="btn-print-pdf"
              onClick={handlePrintPdf}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-all shadow-sm active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'hi' ? 'प्रिंट / पीडीएफ सेव करें' : 'Print / Save as PDF'}</span>
            </button>
          </div>
        </div>

        {/* Free Sample Watermark Banner if preview mode */}
        {isSampleMode && !unlockedIds.includes(activePdf.id) && (
          <div className="max-w-4xl mx-auto mb-4 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-center justify-between no-print">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <Eye className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                {lang === 'hi'
                  ? 'आप इस ई-बुक का फ्री सैंपल देख रहे हैं। पूरा 500+ प्रश्नों का बंडल केवल ₹49 में अनलॉक करें।'
                  : 'You are viewing a free preview sample. Unlock the full 500+ questions pack for just ₹49.'}
              </span>
            </div>
            <button
              onClick={() => handleInitiatePurchase(activePdf)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm whitespace-nowrap ml-2"
            >
              {lang === 'hi' ? '₹49 में पूरा अनलॉक करें' : 'Unlock Full for ₹49'}
            </button>
          </div>
        )}

        {/* Printable A4 Styled PDF Container */}
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl border border-slate-300 shadow-lg print-only-container">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-900 text-amber-400 text-[11px] font-mono font-bold tracking-widest uppercase mb-2">
                SSC CHSL 2025-26 EXAM BRAHMASTRA PDF
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {lang === 'hi' ? activePdf.hindiTitle : activePdf.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                {lang === 'hi' ? activePdf.taglineHi : activePdf.taglineEn}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 text-xs text-slate-500">
              <div className="font-bold text-slate-800">{activePdf.totalQuestions}+ Questions</div>
              <div>Pages: {activePdf.pageCount}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                Candidate: {getUserAspirantName()}
              </div>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 text-xs text-slate-700 flex items-center justify-between">
            <span className="font-medium">
              💡 <strong>{lang === 'hi' ? 'निर्देश:' : 'Note:'}</strong>{' '}
              {lang === 'hi'
                ? 'यह सामग्री टीसीएस द्वारा आयोजित एसएससी सीएचएसएल टियर-1 के नवीनतम पैटर्न पर आधारित है। सभी प्रश्न परीक्षा हॉल के लिए अति महत्वपूर्ण हैं।'
                : 'Curated based on latest TCS exam interface patterns. Highly recommended for final revision before Tier-1.'}
            </span>
            <span className="font-bold text-slate-900 ml-3 whitespace-nowrap">₹49 Special Edition</span>
          </div>

          {/* Sections List with Formulae & Questions */}
          <div className="space-y-8">
            {activePdf.sections.map((section, sIdx) => (
              <div key={`sec-${sIdx}`} className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                {/* Section Title */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {lang === 'hi' ? section.titleHi : section.titleEn}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'hi' ? section.subheadingHi : section.subheadingEn}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200">
                    Section {sIdx + 1}
                  </span>
                </div>

                {/* Key Formulas / Tricks Box */}
                {section.keyFormulasOrTricksEn && section.keyFormulasOrTricksEn.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                      <Zap className="w-4 h-4 text-amber-600 fill-current" />
                      <span>{lang === 'hi' ? 'महत्वपूर्ण सूत्र एवं 10-सेकंड शॉर्ट ट्रिक्स' : 'High-Yield Formulae & Short Tricks'}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                      {(lang === 'hi' ? section.keyFormulasOrTricksHi : section.keyFormulasOrTricksEn).map((trick, tIdx) => (
                        <li key={`trick-${tIdx}`} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">✓</span>
                          <span>{trick}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Question Items */}
                <div className="space-y-6">
                  {section.questions.map((q, qIdx) => {
                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-lg bg-slate-50/70 border border-slate-200/80"
                      >
                        {/* Question Header */}
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                          <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                            Q.{qIdx + 1}
                          </span>
                          <span className="text-slate-600">{q.topic}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              q.difficulty === 'Easy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.difficulty === 'Moderate'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>

                        {/* Question Text */}
                        <div className="text-sm font-semibold text-slate-900 mb-3 space-y-1">
                          {(readerLang === 'both' || readerLang === 'en') && (
                            <p className="whitespace-pre-line leading-relaxed">{q.textEn}</p>
                          )}
                          {(readerLang === 'both' || readerLang === 'hi') && (
                            <p className="whitespace-pre-line text-slate-800 leading-relaxed font-normal">
                              {q.textHi}
                            </p>
                          )}
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                          {q.optionsEn.map((optEn, oIdx) => {
                            const isCorrect = oIdx === q.correctOption;
                            const optHi = q.optionsHi[oIdx];

                            return (
                              <div
                                key={`opt-${oIdx}`}
                                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <div>
                                  {(readerLang === 'both' || readerLang === 'en') && (
                                    <span>{optEn}</span>
                                  )}
                                  {readerLang === 'both' && optHi !== optEn && (
                                    <span className="text-slate-500 ml-1 font-normal">({optHi})</span>
                                  )}
                                  {readerLang === 'hi' && <span>{optHi}</span>}
                                </div>
                                {isCorrect && (
                                  <Check className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed Solution / Explanation */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs">
                          <div className="font-bold text-slate-900 flex items-center gap-1 mb-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {lang === 'hi' ? 'सही उत्तर:' : 'Correct Option:'} Option (
                              {String.fromCharCode(65 + q.correctOption)})
                            </span>
                          </div>
                          <div className="text-slate-600 leading-relaxed">
                            <strong className="text-slate-800">
                              {lang === 'hi' ? 'विस्तृत व्याख्या:' : 'Detailed Explanation:'}
                            </strong>
                            <p className="mt-0.5 whitespace-pre-line">
                              {lang === 'hi' ? q.explanationHi : q.explanationEn}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Document Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
            <p>© SSC CHSL Exam Prep Hub • High-Yield Revision Capsule • ₹49 Per PDF Series</p>
            <p className="mt-1">For practice and personal use only. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PDF Store Catalog
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Banner with ₹49 Special Pricing */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 border border-amber-500/20 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>{lang === 'hi' ? 'सीएचएसएल स्पेशल पीडीएफ ई-बुक्स • केवल ₹49 प्रति पीडीएफ' : 'CHSL Exclusive PDF E-Books • Only ₹49 per PDF'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
            {lang === 'hi'
              ? 'एसएससी सीएचएसएल 2025-26 के लिए अति-संभावित प्रश्नों की पूरी पीडीएफ तैयार!'
              : 'SSC CHSL 2025-26 Most Expected Questions: Ready-to-Print PDFs!'}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {lang === 'hi'
              ? 'टीसीएस द्वारा पूछे जाने वाले रीजनिंग, मैथ्स, सामान्य ज्ञान व इंग्लिश के सभी रिपीटेड प्रश्न, शॉर्टकट ट्रिक्स और सटीक व्याख्या के साथ। डाउनलोड करें या तुरंत प्रिंट निकालें।'
              : 'All high-probability repeated questions for Reasoning, Quant, GK & English with step-by-step short tricks. Print-ready A4 layout & instant offline access.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-amber-200">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? '100% प्रामाणिक टीसीएस हल' : '100% Authentic TCS Solutions'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'द्विभाषी (हिंदी + English)' : 'Bilingual (Hindi + English)'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'hi' ? 'प्रिंट-फ्रेंडली A4 साइज' : 'Print-Friendly A4 Layout'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-pdf-input"
            type="text"
            placeholder={
              lang === 'hi'
                ? 'पीडीएफ नाम, विषय या टॉपिक खोजें (उदा: 500 प्रश्न, Static GK, Math)...'
                : 'Search PDF title, topic, or subject (e.g., 500 questions, Static GK, Math)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedCategory === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'सभी पीडीएफ (All)' : 'All PDFs'}
          </button>
          <button
            onClick={() => setSelectedCategory('expected')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedCategory === 'expected' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? '500 संभावित' : '500 Expected'}
          </button>
          <button
            onClick={() => setSelectedCategory('gk-brahmastra')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedCategory === 'gk-brahmastra' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'जीके 1000' : 'Static GK'}
          </button>
          <button
            onClick={() => setSelectedCategory('quant-tricks')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedCategory === 'quant-tricks' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'मैथ ट्रिक्स' : 'Math Tricks'}
          </button>
          <button
            onClick={() => setSelectedCategory('english-booster')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              selectedCategory === 'english-booster' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
            }`}
          >
            {lang === 'hi' ? 'इंग्लिश वोकैब' : 'English Rules'}
          </button>
        </div>
      </div>

      {/* PDF Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPdfs.map((pdf) => {
          const isUnlocked = unlockedIds.includes(pdf.id);

          return (
            <div
              key={pdf.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Card Header Top */}
              <div className="p-5 pb-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    {pdf.isBestseller && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider">
                        <Award className="w-3 h-3" />
                        Bestseller
                      </span>
                    )}
                    {pdf.isHot && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white uppercase tracking-wider">
                        <Flame className="w-3 h-3" />
                        Trending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                    <span>{pdf.rating}</span>
                    <span className="text-slate-400 font-normal">({pdf.totalRatings})</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base leading-snug hover:text-amber-600 transition-colors">
                  {lang === 'hi' ? pdf.hindiTitle : pdf.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {lang === 'hi' ? pdf.descriptionHi : pdf.descriptionEn}
                </p>

                {/* Specs / Meta Badges */}
                <div className="grid grid-cols-3 gap-2 py-3 my-3 bg-slate-50 rounded-lg border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {lang === 'hi' ? 'पेज' : 'Pages'}
                    </span>
                    <span className="font-bold text-slate-800">{pdf.pageCount} Pgs</span>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {lang === 'hi' ? 'प्रश्न' : 'Questions'}
                    </span>
                    <span className="font-bold text-slate-800">{pdf.totalQuestions}+</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      {lang === 'hi' ? 'साइज' : 'Size'}
                    </span>
                    <span className="font-bold text-slate-800">{pdf.fileSizeMb}</span>
                  </div>
                </div>

                {/* Key Highlights List */}
                <div className="space-y-1.5 mb-3 text-xs text-slate-600">
                  {(lang === 'hi' ? pdf.highlightsHi : pdf.highlightsEn).slice(0, 3).map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{hl}</span>
                    </div>
                  ))}
                </div>

                {/* Price Display */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">₹{pdf.price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{pdf.originalPrice}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      75% OFF
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {pdf.downloadsCount.toLocaleString()}+ {lang === 'hi' ? 'डाउनलोड्स' : 'Downloads'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                {isUnlocked ? (
                  <>
                    <button
                      id={`btn-open-pdf-${pdf.id}`}
                      onClick={() => handleOpenPdf(pdf, false)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'पीडीएफ खोलें' : 'Read PDF'}</span>
                    </button>
                    <button
                      id={`btn-quick-print-${pdf.id}`}
                      onClick={() => handleOpenPdf(pdf, false)}
                      title={lang === 'hi' ? 'प्रिंट व डाउनलोड करें' : 'Print & Save as PDF'}
                      className="bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-3 rounded-lg border border-slate-200 text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span className="hidden sm:inline">{lang === 'hi' ? 'प्रिंट' : 'Print'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      id={`btn-preview-pdf-${pdf.id}`}
                      onClick={() => handleOpenPdf(pdf, true)}
                      className="bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-3 rounded-lg border border-slate-200 text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>{lang === 'hi' ? 'सैंपल देखें' : 'Sample'}</span>
                    </button>

                    <button
                      id={`btn-buy-pdf-${pdf.id}`}
                      onClick={() => handleInitiatePurchase(pdf)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-3 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{lang === 'hi' ? '₹49 में अनलॉक करें' : 'Unlock for ₹49'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout / Payment Modal */}
      {purchasingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setPurchasingPdf(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-scaleUp">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {lang === 'hi' ? 'भुगतान सफल • ऐप वॉलेट में जमा!' : 'Payment Successful • Credited to App Wallet!'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'hi'
                    ? 'भुगतान ऐप वॉलेट में सुरक्षित प्राप्त हो गया है और आपकी पीडीएफ तुरंत अनलॉक हो गई है। रीडर खुल रहा है...'
                    : 'Payment credited to central app wallet & PDF unlocked instantly. Opening reader...'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'hi' ? '100% सुरक्षित भुगतान • ऐप वॉलेट एस्क्रो' : '100% Secure Checkout • App Wallet Escrow'}</span>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {lang === 'hi' ? purchasingPdf.hindiTitle : purchasingPdf.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'hi' ? 'सीएचएसएल टियर-1 एग्जाम-रेडी बंडल' : 'CHSL Tier-1 Exam Ready PDF'}
                </p>

                {/* Price Breakdown */}
                <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>{lang === 'hi' ? 'मूल्य (MRP):' : 'Original MRP:'}</span>
                    <span className="line-through">₹{purchasingPdf.originalPrice}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>{lang === 'hi' ? 'एस्पिरेंट स्पेशल डिस्काउंट:' : 'Aspirant Discount (75%):'}</span>
                    <span>-₹{purchasingPdf.originalPrice - purchasingPdf.price}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                    <span>{lang === 'hi' ? 'कुल देय राशि:' : 'Total Payable:'}</span>
                    <span className="text-emerald-700 font-extrabold text-base">₹{purchasingPdf.price}</span>
                  </div>
                </div>

                {/* Aspirant Account Badge */}
                {currentUser ? (
                  <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-400/30 flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          {currentUser.email || `+91 ${currentUser.phone}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {lang === 'hi' ? 'सत्यापित छात्र' : 'Verified'}
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs mb-3">
                    <span className="text-slate-600 text-[11px]">
                      {lang === 'hi' ? 'Gmail / मोबाइल से लॉगिन करें:' : 'Sign in to save PDF to account:'}
                    </span>
                    {onOpenAuth && (
                      <button
                        type="button"
                        onClick={onOpenAuth}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline"
                      >
                        {lang === 'hi' ? 'लॉगिन करें' : 'Sign In'}
                      </button>
                    )}
                  </div>
                )}

                {/* Payment Options */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {lang === 'hi' ? 'भुगतान विधि चुनें:' : 'Select Payment Method:'}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                      Direct UPI / QR
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-amber-500 bg-amber-50 text-slate-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>UPI / GPay</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('qr')}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'qr'
                          ? 'border-amber-500 bg-amber-50 text-slate-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-slate-700" />
                      <span>QR Scan</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-amber-500 bg-amber-50 text-slate-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <span>Card / NetBanking</span>
                    </button>
                  </div>

                  {/* Recipient Account Details Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                      <span>{lang === 'hi' ? 'भुगतान प्राप्तकर्ता खाता (Beneficiary UPI):' : 'Receiving Account / UPI ID:'}</span>
                      <span className="font-semibold text-slate-700">{systemSettings.merchantName}</span>
                    </div>

                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900">
                      <span>{systemSettings.upiId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(systemSettings.upiId);
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2000);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-sans font-semibold text-slate-700"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">{lang === 'hi' ? 'कॉपी हो गया' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{lang === 'hi' ? 'कॉपी करें' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Direct UPI App intent button for mobile */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <a
                        href={`upi://pay?pa=${systemSettings.upiId}&pn=${encodeURIComponent(systemSettings.merchantName)}&am=${purchasingPdf.price}&cu=INR&tn=${encodeURIComponent('CHSL-' + purchasingPdf.id)}`}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{lang === 'hi' ? 'PhonePe / GPay में खोलें' : 'Open UPI App Directly'}</span>
                      </a>
                    </div>
                  </div>

                  {paymentMethod === 'qr' && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="w-36 h-36 bg-white border border-slate-200 rounded-xl mx-auto flex items-center justify-center p-2 shadow-xs">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            `upi://pay?pa=${systemSettings.upiId}&pn=${encodeURIComponent(systemSettings.merchantName)}&am=${purchasingPdf.price}&cu=INR&tn=SSC_CHSL_PDF`
                          )}`}
                          alt="UPI Payment QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 mt-2 block">
                        {lang === 'hi' ? `स्कैन करें ₹${purchasingPdf.price} भुगतान के लिए` : `Scan to pay ₹${purchasingPdf.price}`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PhonePe • Google Pay • Paytm • BHIM • Amazon Pay
                      </span>
                    </div>
                  )}

                  {/* UTR / Transaction Input (Optional) */}
                  <div className="mt-2">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      {lang === 'hi' ? 'बैंक UTR / रेफरेंस नंबर (वैकल्पिक):' : 'Bank UTR / Reference No. (Optional):'}
                    </label>
                    <input
                      type="text"
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g., 428901928392"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                {/* Submit / Pay Button */}
                <button
                  id="btn-confirm-payment"
                  onClick={handleCompletePurchase}
                  disabled={isProcessingPayment}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>{lang === 'hi' ? 'भुगतान सत्यापित हो रहा है...' : 'Verifying Payment...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-900" />
                      <span>{lang === 'hi' ? '₹49 का भुगतान कर तुरंत अनलॉक करें' : 'Pay ₹49 & Unlock Instantly'}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'hi' ? 'तुरंत एक्सेस • लाइफटाइम वैलिडिटी • नो रीकरिंग चार्ज' : 'Instant Access • Lifetime Validity • No recurring fee'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
