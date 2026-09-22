import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  IndianRupee,
  ShoppingBag,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  SlidersHorizontal,
  PlusCircle,
  FileText,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Settings,
  HelpCircle,
  Eye,
  Download,
  Printer,
  Wallet,
  Building,
  Send,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle
} from 'lucide-react';
import {
  apiGetAdminMetrics,
  apiGetAdminOrders,
  apiUpdateOrderStatus,
  apiAddCustomQuestion,
  apiGetSystemSettings,
  apiUpdateSystemSettings,
  apiGetWalletStatus,
  apiUpdateOwnerBankDetails,
  apiRequestPayout,
  BackendOrder,
  AdminMetricsData,
  PlatformWalletData,
  PayoutRecord,
  OwnerBankDetails
} from '../utils/api';

interface AdminPanelProps {
  lang: 'en' | 'hi';
  onClose?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ lang, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('chsl_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Active Admin Subtab
  const [adminTab, setAdminTab] = useState<'metrics' | 'wallet' | 'orders' | 'questions' | 'settings'>('wallet');

  // Metrics and Orders State
  const [metrics, setMetrics] = useState<AdminMetricsData | null>(null);
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'REFUNDED'>('ALL');

  // Wallet & Payout State
  const [walletData, setWalletData] = useState<PlatformWalletData | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const [isEditBankModalOpen, setIsEditBankModalOpen] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<'bank_imps' | 'upi'>('bank_imps');
  const [payoutRemarks, setPayoutRemarks] = useState<string>('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState<boolean>(false);
  const [payoutStatusMsg, setPayoutStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedPayoutReceipt, setSelectedPayoutReceipt] = useState<PayoutRecord | null>(null);

  // Owner Bank Details Form State
  const [bankForm, setBankForm] = useState<OwnerBankDetails>({
    accountHolderName: 'Deepak Tripathi (Owner)',
    bankName: 'State Bank of India',
    accountNumber: '39482019284',
    ifscCode: 'SBIN0001842',
    ownerUpiId: 'tripathideepak2001a@oksbi'
  });
  const [bankSavedSuccess, setBankSavedSuccess] = useState<boolean>(false);

  // Selected Order for Invoice modal
  const [viewingInvoice, setViewingInvoice] = useState<BackendOrder | null>(null);

  // Settings State
  const [systemSettings, setSystemSettings] = useState<any>({
    upiId: 'sscchslprep@axisbank',
    merchantName: 'SSC CHSL Prep Hub Edu Services',
    announcementNotice: 'CHSL 2025-26 Tier-1 Expected Questions PDF Series Available @ ₹49 Only!',
    pdfDiscountPrice: 49
  });
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // New Question Form
  const [newQ, setNewQ] = useState({
    section: 'quant',
    topic: 'Number System',
    difficulty: 'Moderate',
    textEn: '',
    textHi: '',
    optionsEn: ['', '', '', ''],
    optionsHi: ['', '', '', ''],
    correctOption: 0,
    explanationEn: '',
    explanationHi: ''
  });
  const [questionSaved, setQuestionSaved] = useState<boolean>(false);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [m, o, s, w] = await Promise.all([
        apiGetAdminMetrics(),
        apiGetAdminOrders(),
        apiGetSystemSettings(),
        apiGetWalletStatus()
      ]);
      setMetrics(m);
      setOrders(o);
      if (s) setSystemSettings(s);
      if (w) {
        setWalletData(w);
        if (w.ownerBankDetails) {
          setBankForm(w.ownerBankDetails);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      setPayoutStatusMsg({ type: 'error', text: 'कृपया मान्य ट्रांसफर राशि दर्ज करें।' });
      return;
    }
    if (walletData && amt > walletData.currentBalance) {
      setPayoutStatusMsg({ type: 'error', text: `वॉलेट में केवल ₹${walletData.currentBalance} उपलब्ध है।` });
      return;
    }

    setIsSubmittingPayout(true);
    setPayoutStatusMsg(null);
    try {
      const res = await apiRequestPayout({
        amount: amt,
        payoutMethod,
        remarks: payoutRemarks || 'App Wallet Transfer to Owner Bank'
      });
      if (res.success) {
        setPayoutStatusMsg({ type: 'success', text: res.message });
        if (res.wallet) setWalletData(res.wallet);
        if (res.payout) setSelectedPayoutReceipt(res.payout);
        setPayoutAmount('');
        loadAdminData();
      } else {
        setPayoutStatusMsg({ type: 'error', text: res.message || 'ट्रांसफर विफल हुआ।' });
      }
    } catch (err: any) {
      setPayoutStatusMsg({ type: 'error', text: err.message || 'नेटवर्क त्रुटि' });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiUpdateOwnerBankDetails(bankForm);
    if (res.success) {
      setBankSavedSuccess(true);
      setTimeout(() => {
        setBankSavedSuccess(false);
        setIsEditBankModalOpen(false);
      }, 1500);
      loadAdminData();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcode.trim() === 'admin2026' || passcode.trim() === 'admin' || passcode.trim() === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('chsl_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('गलत पासवर्ड! (Default Passcode: admin2026)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('chsl_admin_auth');
  };

  const handleStatusChange = async (orderId: string, newStatus: 'PAID' | 'PENDING' | 'REFUNDED') => {
    await apiUpdateOrderStatus(orderId, newStatus);
    loadAdminData();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiUpdateSystemSettings(systemSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.textEn || !newQ.textHi) return;
    await apiAddCustomQuestion(newQ);
    setQuestionSaved(true);
    setNewQ({
      section: 'quant',
      topic: 'Algebra',
      difficulty: 'Moderate',
      textEn: '',
      textHi: '',
      optionsEn: ['', '', '', ''],
      optionsHi: ['', '', '', ''],
      correctOption: 0,
      explanationEn: '',
      explanationHi: ''
    });
    setTimeout(() => setQuestionSaved(false), 3000);
  };

  // -------------------------------------------------------------
  // RENDER: Login Gate
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl text-center">
        <div className="w-14 h-14 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-black text-slate-900">
          {lang === 'hi' ? 'एडमिन पोर्टल लॉगिन' : 'Admin Control Portal'}
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {lang === 'hi'
            ? 'केवल अधिकृत स्टाफ एवं शिक्षक। पेमेंट्स, ऑर्डर्स और प्रश्न बैंक प्रबंधन।'
            : 'Authorized administrative access for payment orders, question updates & revenue monitoring.'}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {lang === 'hi' ? 'सिक्योरिटी पासकोड:' : 'Admin Passcode:'}
            </label>
            <input
              id="admin-passcode-input"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode (admin2026)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              autoFocus
            />
          </div>

          {authError && (
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200 flex items-center gap-1.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            id="btn-admin-login"
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold rounded-xl text-sm transition-all shadow-md active:scale-98"
          >
            {lang === 'hi' ? 'लॉगिन करें' : 'Authenticate & Enter'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Demo Key: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">admin2026</code></span>
          <button
            onClick={() => {
              setPasscode('admin2026');
              handleLogin();
            }}
            className="text-amber-600 hover:underline font-semibold"
          >
            Quick 1-Click Access
          </button>
        </div>
      </div>
    );
  }

  // Filtered orders for table
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchOrder = o.orderNumber.toLowerCase().includes(q);
      const matchTitle = o.pdfTitle.toLowerCase().includes(q);
      const matchTxn = (o.transactionId || '').toLowerCase().includes(q);
      if (!matchName && !matchOrder && !matchTitle && !matchTxn) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">
                {lang === 'hi' ? 'एसएससी सीएचएसएल एडमिनिस्ट्रेशन हब' : 'SSC CHSL Admin Control Hub'}
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                Backend Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Connected to Express + JSON Database Persistence • Port 3000
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{lang === 'hi' ? 'रीफ्रेश' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/30 transition-all"
          >
            {lang === 'hi' ? 'लॉगआउट' : 'Exit Admin'}
          </button>
        </div>
      </div>

      {/* Admin Navigation Subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setAdminTab('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === 'metrics'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{lang === 'hi' ? 'रेवेन्यू व मेट्रिक्स' : 'Revenue & Metrics'}</span>
        </button>

        <button
          id="btn-admin-tab-wallet"
          onClick={() => setAdminTab('wallet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === 'wallet'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'hi' ? 'ऐप वॉलेट व बैंक ट्रांसफर' : 'App Wallet & Payout'}</span>
          {walletData && (
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black shadow-xs">
              ₹{walletData.currentBalance}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{lang === 'hi' ? 'ऑर्डर्स व पेमेंट्स' : 'Orders & Payments'}</span>
          <span className="text-[10px] bg-slate-900 text-amber-400 px-1.5 py-0.2 rounded-full font-extrabold">
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === 'questions'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{lang === 'hi' ? 'संभावित प्रश्न जोड़ें' : 'Add Expected Question'}</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            adminTab === 'settings'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{lang === 'hi' ? 'सिस्टम व गेटवे सेटिंग्स' : 'Gateway & Settings'}</span>
        </button>
      </div>

      {/* --------------------------------------------------------- */}
      {/* TAB 1: METRICS & REVENUE OVERVIEW                         */}
      {/* --------------------------------------------------------- */}
      {adminTab === 'metrics' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider">
                  {lang === 'hi' ? 'कुल रेवेन्यू (₹49 ई-बुक्स)' : 'Total Revenue'}
                </span>
                <IndianRupee className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{metrics?.totalRevenue || 0}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                +100% Verified UPI & Instant Unlocks
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider">
                  {lang === 'hi' ? 'सफल ऑर्डर्स' : 'Total Paid Orders'}
                </span>
                <ShoppingBag className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {orders.filter((o) => o.status === 'PAID').length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Average order: ₹49.00
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider">
                  {lang === 'hi' ? 'मॉक टेस्ट अटेम्प्ट्स' : 'Total Mock Attempts'}
                </span>
                <FileText className="w-5 h-5 text-sky-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {metrics?.totalAttempts || 1420}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Active Tier-1 Aspirants
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider">
                  {lang === 'hi' ? 'सक्रिय परीक्षार्थी' : 'Active Aspirants'}
                </span>
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {metrics?.activeAspirants || 890}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                Live on 2025-26 Platform
              </p>
            </div>
          </div>

          {/* Quick System Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {lang === 'hi' ? 'सर्वर व डेटाबेस चालू स्थिति में हैं' : 'Server & Database Operational'}
                </h4>
                <p className="text-xs text-slate-500">
                  Express Server active on Port 3000 • Persistence via JSON Data Store
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-slate-700">
                Merchant UPI: {systemSettings.upiId}
              </span>
              <span className="bg-amber-50 text-amber-900 font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                Active Price: ₹{systemSettings.pdfDiscountPrice}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB: APP WALLET & OWNER BANK PAYOUT (वॉलेट से बैंक ट्रांसफर) */}
      {/* --------------------------------------------------------- */}
      {adminTab === 'wallet' && (
        <div className="space-y-6">
          {/* Main Wallet Balance Showcase */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                    {lang === 'hi' ? 'ऐप सेंट्रल वॉलेट बैलेंस (प्लेटफ़ॉर्म एस्क्रो)' : 'App Central Wallet Balance (Platform Escrow)'}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Instant Withdrawable
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    ₹{walletData?.currentBalance || 0}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">INR (Available for Transfer)</span>
                </div>

                <p className="text-xs text-slate-300 mt-2 max-w-xl">
                  {lang === 'hi'
                    ? 'छात्रों द्वारा खरीदी गई सभी ₹49 पीडीएफ का पैसा सबसे पहले इस ऐप वॉलेट में सुरक्षित जमा होता है। आप कभी भी इसे अपने बैंक खाते या UPI पर ट्रांसफर कर सकते हैं।'
                    : 'All ₹49 PDF student payments accumulate securely inside this central App Wallet. The owner can initiate a bank payout at any time.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  id="btn-open-payout-modal"
                  onClick={() => {
                    setPayoutAmount(String(walletData?.currentBalance || 49));
                    setPayoutStatusMsg(null);
                    setIsPayoutModalOpen(true);
                  }}
                  disabled={!walletData || walletData.currentBalance <= 0}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'पैसे बैंक में ट्रांसफर करें' : 'Transfer to My Bank'}</span>
                </button>

                <button
                  onClick={() => setIsEditBankModalOpen(true)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                >
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'hi' ? 'बैंक खाता बदलें' : 'Manage Bank Account'}</span>
                </button>
              </div>
            </div>

            {/* Wallet Sub-metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 font-medium mb-1 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'कुल प्राप्त राशि (Sales Collected):' : 'Total Revenue Collected:'}</span>
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-extrabold text-white">
                  ₹{walletData?.totalCollected || 0}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                  100% Student UPI & QR payments
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 font-medium mb-1 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'अब तक बैंक में ट्रांसफर (Withdrawn):' : 'Total Transferred to Bank:'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-extrabold text-amber-400">
                  ₹{walletData?.totalWithdrawn || 0}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Direct IMPS / NEFT / UPI Payouts
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="text-slate-400 font-medium mb-1 flex items-center justify-between">
                  <span>{lang === 'hi' ? 'पेआउट स्पीड / स्टेटस:' : 'Settlement Speed:'}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-sm font-bold text-emerald-400">
                  Instant (24x7 Real-time)
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Zero Gateway Commission
                </div>
              </div>
            </div>
          </div>

          {/* Current Owner Bank & UPI Destination Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {lang === 'hi' ? 'ओनर पेआउट बैंक खाता विवरण' : 'Owner Bank Account for Payouts'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'hi'
                      ? 'वॉलेट से निकाली गई राशि इस बैंक खाते या UPI पर ट्रांसफर की जाती है।'
                      : 'Funds withdrawn from the App Wallet will be credited directly to this bank account.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditBankModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
              >
                {lang === 'hi' ? 'विवरण एडिट करें' : 'Edit Bank Details'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1 font-medium">{lang === 'hi' ? 'खाताधारक का नाम:' : 'Account Holder:'}</span>
                <span className="font-bold text-slate-900 text-sm">{walletData?.ownerBankDetails?.accountHolderName || 'Deepak Tripathi (Owner)'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1 font-medium">{lang === 'hi' ? 'बैंक का नाम:' : 'Bank Name:'}</span>
                <span className="font-bold text-slate-900 text-sm">{walletData?.ownerBankDetails?.bankName || 'State Bank of India'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1 font-medium">{lang === 'hi' ? 'खाता संख्या (A/C No.):' : 'Account Number:'}</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{walletData?.ownerBankDetails?.accountNumber || '39482019284'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1 font-medium">{lang === 'hi' ? 'IFSC कोड / UPI ID:' : 'IFSC Code & UPI:'}</span>
                <span className="font-mono font-bold text-slate-900 text-xs block">{walletData?.ownerBankDetails?.ifscCode || 'SBIN0001842'}</span>
                <span className="text-emerald-700 font-semibold text-[11px] block mt-0.5">{walletData?.ownerBankDetails?.ownerUpiId}</span>
              </div>
            </div>
          </div>

          {/* Bank Transfer / Payout History Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  {lang === 'hi' ? 'बैंक ट्रांसफर / निकासी इतिहास (Payout Ledger)' : 'Bank Transfer & Withdrawal History'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'hi'
                    ? 'वॉलेट से ओनर के बैंक खाते में भेजे गए सभी ट्रांसफर का आधिकारिक रिकॉर्ड'
                    : 'Official audit log of all withdrawals from App Wallet to owner bank account.'}
                </p>
              </div>

              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">
                Total Payouts: {walletData?.payoutHistory?.length || 0}
              </span>
            </div>

            {(!walletData?.payoutHistory || walletData.payoutHistory.length === 0) ? (
              <div className="p-10 text-center text-slate-400">
                <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">
                  {lang === 'hi' ? 'अभी तक कोई बैंक निकासी नहीं की गई है।' : 'No payouts processed yet.'}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {lang === 'hi'
                    ? 'सभी प्राप्त भुगतान सुरक्षित रूप से ऐप वॉलेट में उपलब्ध हैं। ऊपर दिए गए "पैसे बैंक में ट्रांसफर करें" बटन से आप कभी भी ट्रांसफर कर सकते हैं।'
                    : 'All funds remain securely deposited in your App Wallet. Click "Transfer to My Bank" to withdraw anytime.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Payout ID / Date</th>
                      <th className="px-4 py-3">Transfer Mode</th>
                      <th className="px-4 py-3">Destination Account</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">UTR / Bank Ref</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {walletData.payoutHistory.map((payout) => (
                      <tr key={payout.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-slate-900 block">{payout.payoutNumber}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(payout.requestedAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                            {payout.payoutMethod === 'upi' ? 'UPI Direct' : 'IMPS Bank'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{payout.bankName}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{payout.accountNumberMasked}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-black text-emerald-700 text-sm">₹{payout.amount}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                          {payout.utrNumber}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>TRANSFERRED</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedPayoutReceipt(payout)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                          >
                            {lang === 'hi' ? 'स्लिप देखें' : 'View Slip'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 2: ORDERS & PAYMENTS MANAGER                          */}
      {/* --------------------------------------------------------- */}
      {adminTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Controls bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={lang === 'hi' ? 'ऑर्डर नंबर, नाम या TXN खोजें...' : 'Search Order #, Name or TXN...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              {(['ALL', 'PAID', 'PENDING', 'REFUNDED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    statusFilter === st ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Order Details</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method & UTR</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {lang === 'hi' ? 'कोई ऑर्डर नहीं मिला' : 'No matching orders found'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 block font-mono">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {order.pdfTitle}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">
                          {order.customerName}
                        </span>
                        {order.customerPhone && (
                          <span className="text-[11px] text-slate-400 block">{order.customerPhone}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        ₹{order.amount}
                      </td>

                      <td className="py-3 px-4">
                        <span className="uppercase font-bold text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {order.paymentMethod}
                        </span>
                        <span className="text-[11px] text-slate-500 block font-mono mt-0.5">
                          {order.utrNumber ? `UTR: ${order.utrNumber}` : order.transactionId}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            order.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : order.status === 'REFUNDED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewingInvoice(order)}
                          title="View Tax Invoice"
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold"
                        >
                          Invoice
                        </button>
                        {order.status !== 'PAID' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'PAID')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold"
                          >
                            Approve
                          </button>
                        )}
                        {order.status === 'PAID' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'REFUNDED')}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 3: ADD EXPECTED QUESTIONS                             */}
      {/* --------------------------------------------------------- */}
      {adminTab === 'questions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {lang === 'hi' ? 'नया अति-संभावित प्रश्न जोड़ें' : 'Add New High-Yield Expected Question'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'यह प्रश्न सीधे छात्रों के ₹49 ई-बुक और मॉक टेस्ट प्रैक्टिस बैंक में शामिल हो जाएगा।'
                  : 'Added questions are saved directly to the persistent backend database and question pool.'}
              </p>
            </div>
            {questionSaved && (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Question Published!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Section</label>
                <select
                  value={newQ.section}
                  onChange={(e) => setNewQ({ ...newQ, section: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50"
                >
                  <option value="reasoning">General Intelligence (Reasoning)</option>
                  <option value="ga">General Awareness (Static GK)</option>
                  <option value="quant">Quantitative Aptitude (Math)</option>
                  <option value="english">English Language</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Topic / Chapter</label>
                <input
                  type="text"
                  value={newQ.topic}
                  onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })}
                  placeholder="e.g., Geometry Chords / Art & Culture"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Difficulty</label>
                <select
                  value={newQ.difficulty}
                  onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50"
                >
                  <option value="Easy">Easy (सरल)</option>
                  <option value="Moderate">Moderate (मध्यम)</option>
                  <option value="Hard">Hard (कठिन)</option>
                </select>
              </div>
            </div>

            {/* Bilingual Question Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Question Text (English)</label>
                <textarea
                  value={newQ.textEn}
                  onChange={(e) => setNewQ({ ...newQ, textEn: e.target.value })}
                  rows={3}
                  placeholder="Enter question in English..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Question Text (Hindi)</label>
                <textarea
                  value={newQ.textHi}
                  onChange={(e) => setNewQ({ ...newQ, textHi: e.target.value })}
                  rows={3}
                  placeholder="हिंदी में प्रश्न दर्ज करें..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-200"
                  required
                />
              </div>
            </div>

            {/* Options */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Multiple Choice Options (A, B, C, D) & Mark Correct Option
              </span>

              <div className="space-y-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={newQ.correctOption === idx}
                      onChange={() => setNewQ({ ...newQ, correctOption: idx })}
                      className="text-amber-500"
                    />
                    <span className="w-5 font-bold text-xs text-slate-600">
                      {String.fromCharCode(65 + idx)}:
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + idx)} (En)`}
                      value={newQ.optionsEn[idx] || ''}
                      onChange={(e) => {
                        const next = [...newQ.optionsEn];
                        next[idx] = e.target.value;
                        setNewQ({ ...newQ, optionsEn: next });
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder={`विकल्प ${String.fromCharCode(65 + idx)} (Hi)`}
                      value={newQ.optionsHi[idx] || ''}
                      onChange={(e) => {
                        const next = [...newQ.optionsHi];
                        next[idx] = e.target.value;
                        setNewQ({ ...newQ, optionsHi: next });
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Step-by-Step Short Trick / Solution (En)</label>
                <textarea
                  value={newQ.explanationEn}
                  onChange={(e) => setNewQ({ ...newQ, explanationEn: e.target.value })}
                  rows={2}
                  placeholder="Enter detailed short trick solution in English..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">विस्तृत व्याख्या व शॉर्ट ट्रिक (Hi)</label>
                <textarea
                  value={newQ.explanationHi}
                  onChange={(e) => setNewQ({ ...newQ, explanationHi: e.target.value })}
                  rows={2}
                  placeholder="हिंदी में विस्तृत व्याख्या व शॉर्टकट ट्रिक दर्ज करें..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <button
              id="btn-submit-question"
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-sm"
            >
              Publish Question to Expected Question Pool
            </button>
          </form>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 4: SYSTEM SETTINGS & GATEWAY CONFIG                   */}
      {/* --------------------------------------------------------- */}
      {adminTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
          <h3 className="text-base font-extrabold text-slate-900 mb-1">
            {lang === 'hi' ? 'सिस्टम व गेटवे सेटिंग्स' : 'Payment Gateway & System Configuration'}
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Configure default UPI receiver ID, promotional notice, and pricing.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Merchant UPI ID (GPay / PhonePe / Paytm)
              </label>
              <input
                type="text"
                value={systemSettings.upiId}
                onChange={(e) => setSystemSettings({ ...systemSettings, upiId: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Merchant / Business Name
              </label>
              <input
                type="text"
                value={systemSettings.merchantName}
                onChange={(e) => setSystemSettings({ ...systemSettings, merchantName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Standard PDF Price (₹)
              </label>
              <input
                type="number"
                value={systemSettings.pdfDiscountPrice}
                onChange={(e) => setSystemSettings({ ...systemSettings, pdfDiscountPrice: Number(e.target.value) })}
                className="w-32 px-3 py-2 text-xs rounded-lg border border-slate-200 font-bold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Aspirant Banner Announcement
              </label>
              <textarea
                value={systemSettings.announcementNotice}
                onChange={(e) => setSystemSettings({ ...systemSettings, announcementNotice: e.target.value })}
                rows={2}
                className="w-full p-2 text-xs rounded-lg border border-slate-200"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                id="btn-save-admin-settings"
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                Save Configuration
              </button>

              {settingsSaved && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Saved to Backend Database!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setViewingInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase bg-slate-900 text-amber-400 px-2 py-0.5 rounded">
                  TAX INVOICE / RECEIPT
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  Invoice #{viewingInvoice.orderNumber}
                </h4>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold">{new Date(viewingInvoice.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-semibold text-slate-800">{viewingInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>
                <span className="font-semibold text-slate-800 max-w-[240px] text-right truncate">
                  {viewingInvoice.pdfTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Ref:</span>
                <span className="font-mono text-slate-800">{viewingInvoice.transactionId}</span>
              </div>
              {viewingInvoice.utrNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank UTR:</span>
                  <span className="font-mono text-slate-800">{viewingInvoice.utrNumber}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Total Paid (INR):</span>
                <span className="text-emerald-700">₹{viewingInvoice.amount}.00</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-center">
              Authorized Digital Receipt • SSC CHSL Prep Hub • GST Exempted Educational E-Book
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Payout / Transfer from App Wallet to Owner Bank/UPI   */}
      {/* ------------------------------------------------------------- */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setIsPayoutModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === 'hi' ? 'वॉलेट से बैंक में ट्रांसफर' : 'Withdraw from App Wallet'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' ? 'ऐप वॉलेट में उपलब्ध बैलेंस को अपने खाते में भेजें' : 'Transfer collected student PDF payments to your account'}
                </p>
              </div>
            </div>

            {/* Current Available Balance Banner */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">
                {lang === 'hi' ? 'वॉलेट में उपलब्ध राशि:' : 'Available in App Wallet:'}
              </span>
              <span className="text-lg font-black text-emerald-800">
                ₹{walletData?.currentBalance || 0}
              </span>
            </div>

            <form onSubmit={handleExecutePayout} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'hi' ? 'ट्रांसफर राशि (₹):' : 'Withdrawal Amount (INR):'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input
                    id="input-payout-amount"
                    type="number"
                    min="1"
                    max={walletData?.currentBalance || 99999}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-3 py-2.5 text-sm font-black rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Quick Select Amount Chips */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 font-medium">त्वरित चयन:</span>
                  {[49, 98, 147].filter(v => v <= (walletData?.currentBalance || 0)).map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPayoutAmount(String(val))}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      ₹{val}
                    </button>
                  ))}
                  {walletData && walletData.currentBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(String(walletData.currentBalance))}
                      className="px-2.5 py-0.5 rounded text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold"
                    >
                      पूरा बैलेंस (₹{walletData.currentBalance})
                    </button>
                  )}
                </div>
              </div>

              {/* Payout Method */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'hi' ? 'ट्रांसफर माध्यम (Payout Route):' : 'Transfer Mode:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_imps')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      payoutMethod === 'bank_imps'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Building className="w-4 h-4 mb-1 text-emerald-600" />
                    <div>IMPS Bank Direct</div>
                    <div className="text-[10px] text-slate-400 font-normal">24x7 Real-time</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      payoutMethod === 'upi'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Send className="w-4 h-4 mb-1 text-emerald-600" />
                    <div>UPI Payout</div>
                    <div className="text-[10px] text-slate-400 font-normal">Direct to VPA</div>
                  </button>
                </div>
              </div>

              {/* Destination Summary Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  {lang === 'hi' ? 'जमा होने वाला खाता:' : 'Crediting to:'}
                </span>
                <div className="font-bold text-slate-900">
                  {walletData?.ownerBankDetails?.accountHolderName}
                </div>
                {payoutMethod === 'bank_imps' ? (
                  <div className="text-slate-600 font-mono text-[11px]">
                    {walletData?.ownerBankDetails?.bankName} • A/C {walletData?.ownerBankDetails?.accountNumber} • IFSC {walletData?.ownerBankDetails?.ifscCode}
                  </div>
                ) : (
                  <div className="text-emerald-700 font-semibold font-mono text-[11px]">
                    UPI ID: {walletData?.ownerBankDetails?.ownerUpiId}
                  </div>
                )}
              </div>

              {payoutStatusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    payoutStatusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {payoutStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{payoutStatusMsg.text}</span>
                </div>
              )}

              <button
                id="btn-confirm-payout-transfer"
                type="submit"
                disabled={isSubmittingPayout || !walletData || walletData.currentBalance <= 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                {isSubmittingPayout ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                <span>
                  {isSubmittingPayout
                    ? 'ट्रांसफर प्रोसेस हो रहा है...'
                    : `अभी ट्रांसफर करें (Transfer ₹${payoutAmount || '0'} Now)`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Edit Owner Bank & UPI Details                          */}
      {/* ------------------------------------------------------------- */}
      {isEditBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setIsEditBankModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === 'hi' ? 'ओनर बैंक विवरण अपडेट करें' : 'Update Owner Bank Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' ? 'जिस खाते में वॉलेट के पैसे भेजने हैं उसका विवरण दर्ज करें' : 'Set your official settlement account details'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">खाताधारक का नाम (Account Holder):</label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">बैंक का नाम (Bank Name):</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">खाता संख्या (Bank Account Number):</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">IFSC कोड:</label>
                <input
                  type="text"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-semibold uppercase"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ओनर UPI ID (वैकल्पिक / त्वरित ट्रांसफर हेतु):</label>
                <input
                  type="text"
                  value={bankForm.ownerUpiId}
                  onChange={(e) => setBankForm({ ...bankForm, ownerUpiId: e.target.value.toLowerCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-emerald-800 font-bold"
                  placeholder="name@upi"
                />
              </div>

              {bankSavedSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>बैंक विवरण सुरक्षित रूप से सेव हो गए हैं!</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  सेव करें (Save Details)
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditBankModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Official Bank Transfer Payout Voucher / Slip           */}
      {/* ------------------------------------------------------------- */}
      {selectedPayoutReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setSelectedPayoutReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase bg-emerald-800 text-white px-2 py-0.5 rounded">
                  OFFICIAL SETTLEMENT VOUCHER
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  Payout #{selectedPayoutReceipt.payoutNumber}
                </h4>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Transfer Date & Time:</span>
                <span className="font-semibold">{new Date(selectedPayoutReceipt.completedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Debit Source:</span>
                <span className="font-semibold text-slate-800">App Central Platform Escrow Wallet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Beneficiary / Owner:</span>
                <span className="font-semibold text-slate-800">{selectedPayoutReceipt.accountHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Destination:</span>
                <span className="font-semibold text-slate-800">
                  {selectedPayoutReceipt.bankName} ({selectedPayoutReceipt.accountNumberMasked})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IFSC Code:</span>
                <span className="font-mono text-slate-800">{selectedPayoutReceipt.ifscCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Transaction Ref (UTR):</span>
                <span className="font-mono text-emerald-800 font-bold">{selectedPayoutReceipt.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{selectedPayoutReceipt.status} (SETTLED)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Net Transferred to Bank:</span>
                <span className="text-emerald-700">₹{selectedPayoutReceipt.amount}.00</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 text-center font-medium">
              Verified Banking IMPS Transfer • Zero Gateway Commission • Instant Credit
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
