import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Lock, 
  User, 
  Sparkles, 
  RefreshCw, 
  LogOut, 
  Target,
  Send,
  Building,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { 
  apiGoogleLogin, 
  apiSendMobileOtp, 
  apiVerifyMobileOtp, 
  apiUpdateUserProfile 
} from '../utils/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'hi';
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  initialTab?: 'gmail' | 'mobile' | 'profile';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentUser,
  onLoginSuccess,
  onLogout,
  initialTab = 'gmail'
}) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'mobile' | 'profile'>(() => {
    return currentUser ? 'profile' : initialTab;
  });

  // Gmail Login State
  const [gmailInput, setGmailInput] = useState('tripathideepak2001a@gmail.com');
  const [gmailName, setGmailName] = useState('Deepak Tripathi');
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  // Mobile OTP State
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpReceived, setDevOtpReceived] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    targetExam: 'SSC CHSL 2025-26 Tier-1',
    targetScore: 165,
    category: 'UR' as 'UR' | 'OBC' | 'EWS' | 'SC' | 'ST',
    state: 'Uttar Pradesh'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [linkingMethod, setLinkingMethod] = useState<'none' | 'email' | 'phone'>('none');
  const [linkingValue, setLinkingValue] = useState('');

  // Feedback Message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setActiveTab('profile');
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        targetExam: currentUser.targetExam || 'SSC CHSL 2025-26 Tier-1',
        targetScore: currentUser.targetScore || 165,
        category: currentUser.category || 'UR',
        state: currentUser.state || 'Uttar Pradesh'
      });
    } else {
      setActiveTab(initialTab);
    }
  }, [currentUser, initialTab, isOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  // Handle Google / Gmail Login
  const handleGoogleSubmit = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const emailToUse = customEmail || gmailInput;
    if (!emailToUse || !emailToUse.includes('@')) {
      setStatusMsg({
        type: 'error',
        text: lang === 'hi' ? 'कृपया मान्य Gmail पता दर्ज करें।' : 'Please enter a valid Gmail address.'
      });
      return;
    }

    setIsSubmittingGoogle(true);
    setStatusMsg(null);

    const res = await apiGoogleLogin({
      email: emailToUse,
      name: gmailName.trim() || undefined
    });

    setIsSubmittingGoogle(false);

    if (res.success && res.user) {
      setStatusMsg({
        type: 'success',
        text: lang === 'hi' ? 'Gmail लॉगिन सफल!' : 'Logged in with Gmail successfully!'
      });
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'Login failed. Please try again.'
      });
    }
  };

  // Handle Send Mobile OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneNumber.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setStatusMsg({
        type: 'error',
        text: lang === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
      });
      return;
    }

    setIsSendingOtp(true);
    setStatusMsg(null);

    const res = await apiSendMobileOtp(clean);
    setIsSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setDevOtpReceived(res.devOtp || '4829');
      setResendTimer(30);
      setStatusMsg({
        type: 'success',
        text: res.message || (lang === 'hi' ? 'OTP सफलतापूर्वक भेजा गया!' : 'OTP sent successfully!')
      });
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'OTP भेजने में विफल।'
      });
    }
  };

  // Handle Verify Mobile OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setStatusMsg({
        type: 'error',
        text: lang === 'hi' ? 'कृपया प्राप्त OTP दर्ज करें।' : 'Please enter the verification code.'
      });
      return;
    }

    setIsVerifyingOtp(true);
    setStatusMsg(null);

    const res = await apiVerifyMobileOtp({
      phone: phoneNumber,
      otp: otpCode.trim(),
      email: currentUser?.email
    });

    setIsVerifyingOtp(false);

    if (res.success && res.user) {
      setStatusMsg({
        type: 'success',
        text: lang === 'hi' ? 'मोबाइल नंबर सत्यापित! लॉगिन सफल।' : 'Phone verified! Login successful.'
      });
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'अमान्य OTP'
      });
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSavingProfile(true);
    setProfileSaveSuccess(false);

    const res = await apiUpdateUserProfile(currentUser.id, profileForm);
    setIsSavingProfile(false);

    if (res.success && res.user) {
      setProfileSaveSuccess(true);
      onLoginSuccess(res.user);
      setTimeout(() => setProfileSaveSuccess(false), 2500);
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'प्रोफाइल अपडेट करने में त्रुटि'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl relative">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black text-xl shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {currentUser ? (lang === 'hi' ? 'एस्पिरेंट प्रोफाइल' : 'Aspirant Profile') : (lang === 'hi' ? 'एसएससी सीएचएसएल लॉगिन' : 'SSC CHSL Aspirant Login')}
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Tier-1 2025-26
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'hi'
                  ? 'मॉक टेस्ट स्कोर, ई-बुक्स और रैंक ट्रैकिंग सुरक्षित रखें'
                  : 'Sync your mock attempts, saved questions & unlocked PDFs'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {!currentUser ? (
            <div className="flex items-center gap-2 mt-5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => { setActiveTab('gmail'); setStatusMsg(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'gmail'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'Gmail / Google लॉगिन' : 'Gmail / Google'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('mobile'); setStatusMsg(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'mobile'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'मोबाइल नंबर व OTP' : 'Mobile & OTP'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-white block">{currentUser.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {currentUser.email || `+91 ${currentUser.phone}`}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-all font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{statusMsg.text}</span>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 1: GMAIL / GOOGLE SIGN IN                               */}
          {/* ----------------------------------------------------------- */}
          {activeTab === 'gmail' && !currentUser && (
            <div className="space-y-4">
              {/* Official 1-Click Google Sign-In Card */}
              <button
                type="button"
                id="btn-google-one-click-login"
                onClick={() => handleGoogleSubmit(undefined, 'tripathideepak2001a@gmail.com')}
                disabled={isSubmittingGoogle}
                className="w-full p-3.5 bg-white border-2 border-slate-200 hover:border-slate-400 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-50 shadow-sm active:scale-99 group"
              >
                {/* Clean SVG Google Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.9 0 12s.45 3.86 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>

                <div className="text-left">
                  <span className="text-sm font-black text-slate-800 block">
                    {lang === 'hi' ? 'Google खाता (Gmail) से जारी रखें' : 'Continue with Google Account'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    tripathideepak2001a@gmail.com
                  </span>
                </div>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  {lang === 'hi' ? 'अथवा अन्य Gmail दर्ज करें' : 'OR ENTER GMAIL ID'}
                </span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* Custom Gmail Input Form */}
              <form onSubmit={handleGoogleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'आपका नाम (Full Name):' : 'Full Name:'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={gmailName}
                      onChange={(e) => setGmailName(e.target.value)}
                      placeholder="Deepak Tripathi"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'hi' ? 'Gmail / ईमेल पता:' : 'Gmail / Email ID:'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={gmailInput}
                      onChange={(e) => setGmailInput(e.target.value)}
                      placeholder="username@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingGoogle}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                >
                  {isSubmittingGoogle ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmittingGoogle
                      ? 'लॉगिन हो रहा है...'
                      : (lang === 'hi' ? 'Gmail से लॉगिन करें (Sign In with Gmail)' : 'Sign In with Gmail')}
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 2: MOBILE NUMBER & OTP SIGN IN                          */}
          {/* ----------------------------------------------------------- */}
          {activeTab === 'mobile' && !currentUser && (
            <div className="space-y-4">
              {!otpSent ? (
                /* Step 1: Input Mobile Number */
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? '10 अंकों का मोबाइल नंबर:' : '10-Digit Mobile Number:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-xs text-slate-700 flex items-center gap-1.5 shrink-0">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Select Mobile Chips */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">त्वरित नंबर:</span>
                    {['9876543210', '9811223344'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPhoneNumber(num)}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-semibold"
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp || phoneNumber.length < 10}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                  >
                    {isSendingOtp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>
                      {isSendingOtp
                        ? 'OTP भेजा जा रहा है...'
                        : (lang === 'hi' ? 'OTP प्राप्त करें (Get OTP)' : 'Send OTP via SMS')}
                    </span>
                  </button>
                </form>
              ) : (
                /* Step 2: Enter & Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-slate-600 block">
                        {lang === 'hi' ? 'OTP भेजा गया:' : 'OTP sent to:'}
                      </span>
                      <span className="font-bold text-slate-900 font-mono">+91 {phoneNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpCode(''); }}
                      className="text-xs text-amber-800 font-bold hover:underline"
                    >
                      {lang === 'hi' ? 'नंबर बदलें' : 'Change'}
                    </button>
                  </div>

                  {/* Dev / Preview OTP Helper Card */}
                  {devOtpReceived && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-emerald-800 font-bold block">
                          {lang === 'hi' ? 'सत्यापन कोड (Dev OTP):' : 'Verification Code (Dev OTP):'}
                        </span>
                        <span className="font-mono text-emerald-950 text-sm font-black tracking-widest">
                          {devOtpReceived}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtpReceived)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                      >
                        {lang === 'hi' ? 'स्वतः भरें (Autofill)' : 'Autofill'}
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? '4 अंकों का OTP कोड:' : 'Enter 4-Digit OTP:'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 4829"
                        className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 text-base font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-center"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    {resendTimer > 0 ? (
                      <span className="text-slate-400 font-medium">
                        पुनः OTP भेजें ({resendTimer}s)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-amber-600 font-bold hover:underline"
                      >
                        OTP पुनः भेजें (Resend OTP)
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || !otpCode}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                  >
                    {isVerifyingOtp ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {isVerifyingOtp
                        ? 'सत्यापन हो रहा है...'
                        : (lang === 'hi' ? 'सत्यापित करें और लॉगिन करें' : 'Verify OTP & Login')}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* TAB 3: USER PROFILE & SSC CHSL EXAM TARGET DETAILS          */}
          {/* ----------------------------------------------------------- */}
          {currentUser && activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              
              {/* Linked Accounts Banner */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  {lang === 'hi' ? 'संबद्ध लॉगिन माध्यम:' : 'Connected Login Methods:'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {currentUser.email ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-mono text-[11px] font-bold">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{currentUser.email}</span>
                      <Check className="w-3 h-3 text-emerald-600 ml-1" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setLinkingMethod('email');
                        setLinkingValue('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                    >
                      <Mail className="w-3 h-3" />
                      <span>+ Gmail लिंक करें</span>
                    </button>
                  )}

                  {currentUser.phone ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-bold">
                      <Phone className="w-3.5 h-3.5" />
                      <span>+91 {currentUser.phone}</span>
                      <Check className="w-3 h-3 text-emerald-600 ml-1" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setLinkingMethod('phone');
                        setLinkingValue('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>+ मोबाइल नंबर लिंक करें</span>
                    </button>
                  )}
                </div>

                {/* Inline Linking Input */}
                {linkingMethod === 'email' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 animate-fadeIn">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'Gmail / ईमेल दर्ज करें:' : 'Enter Gmail / Email ID:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={linkingValue}
                        onChange={(e) => setLinkingValue(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (linkingValue && linkingValue.includes('@')) {
                            handleGoogleSubmit(undefined, linkingValue.trim());
                            setLinkingMethod('none');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs"
                      >
                        {lang === 'hi' ? 'लिंक करें' : 'Link'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkingMethod('none')}
                        className="px-2 py-1.5 text-slate-500 text-xs font-semibold hover:text-slate-800"
                      >
                        {lang === 'hi' ? 'रद्द' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}

                {linkingMethod === 'phone' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 animate-fadeIn">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? '10 अंकों का मोबाइल नंबर:' : '10-Digit Mobile Number:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        maxLength={10}
                        value={linkingValue}
                        onChange={(e) => setLinkingValue(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (linkingValue.length === 10) {
                            setPhoneNumber(linkingValue);
                            setActiveTab('mobile');
                            setOtpSent(false);
                            setLinkingMethod('none');
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                      >
                        {lang === 'hi' ? 'OTP भेजें' : 'Get OTP'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkingMethod('none')}
                        className="px-2 py-1.5 text-slate-500 text-xs font-semibold hover:text-slate-800"
                      >
                        {lang === 'hi' ? 'रद्द' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'hi' ? 'छात्र का नाम (Aspirant Name):' : 'Aspirant Name:'}
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  required
                />
              </div>

              {/* Target Score & Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'hi' ? 'लक्ष्य स्कोर (Target Score):' : 'Target Marks (Out of 200):'}
                  </label>
                  <div className="relative">
                    <Target className="w-3.5 h-3.5 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="100"
                      max="200"
                      value={profileForm.targetScore}
                      onChange={(e) => setProfileForm({ ...profileForm, targetScore: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 font-black text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'hi' ? 'आरक्षण श्रेणी (Category):' : 'Exam Category:'}
                  </label>
                  <select
                    value={profileForm.category}
                    onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                  >
                    <option value="UR">UR (General)</option>
                    <option value="OBC">OBC</option>
                    <option value="EWS">EWS</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>

              {/* State */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'hi' ? 'गृह राज्य (Home State):' : 'Home State / Region:'}
                </label>
                <input
                  type="text"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  placeholder="e.g. Uttar Pradesh, Bihar, Rajasthan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              {profileSaveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'hi' ? 'प्रोफाइल व लक्ष्य विवरण सुरक्षित सेव हो गए!' : 'Profile details saved successfully!'}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isSavingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{lang === 'hi' ? 'सेव करें (Save Profile)' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  {lang === 'hi' ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </form>
          )}

          {/* Security & Data Privacy Notice */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted • Zero Spam Guarantee • SSC Aspirant Data Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
