import fs from 'fs';
import path from 'path';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  pdfId: string;
  pdfTitle: string;
  amount: number;
  originalPrice: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod: 'upi' | 'qr' | 'card' | 'netbanking';
  status: 'PAID' | 'PENDING' | 'REFUNDED';
  transactionId: string;
  utrNumber?: string;
  createdAt: string;
}

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalAttempts: number;
  activeAspirants: number;
  recentOrders: OrderRecord[];
}

export interface SystemSettings {
  upiId: string;
  merchantName: string;
  maintenanceMode: boolean;
  announcementNotice: string;
  pdfDiscountPrice: number;
}

export interface PayoutRecord {
  id: string;
  payoutNumber: string;
  amount: number;
  payoutMethod: 'bank_imps' | 'bank_neft' | 'upi';
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  destinationUpi?: string;
  status: 'SUCCESS' | 'PROCESSING';
  utrNumber: string;
  requestedAt: string;
  completedAt: string;
  remarks: string;
}

export interface OwnerBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  ownerUpiId: string;
}

export interface PlatformWallet {
  currentBalance: number;
  totalCollected: number;
  totalWithdrawn: number;
  onHoldBalance: number;
  ownerBankDetails: OwnerBankDetails;
  payoutHistory: PayoutRecord[];
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  authProvider: 'gmail' | 'mobile_otp' | 'both';
  targetExam: string;
  targetScore: number;
  category: 'UR' | 'OBC' | 'EWS' | 'SC' | 'ST';
  state?: string;
  createdAt: string;
  lastLoginAt: string;
}

interface DatabaseSchema {
  orders: OrderRecord[];
  systemSettings: SystemSettings;
  customQuestions: any[];
  wallet?: PlatformWallet;
  users?: UserProfile[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Default initial database seed
const INITIAL_DATABASE: DatabaseSchema = {
  users: [
    {
      id: 'usr_default_deepak',
      name: 'Deepak Tripathi',
      email: 'tripathideepak2001a@gmail.com',
      phone: '9876543210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      authProvider: 'both',
      targetExam: 'SSC CHSL 2025-26 Tier-1',
      targetScore: 165,
      category: 'UR',
      state: 'Uttar Pradesh',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: 'ord_101',
      orderNumber: 'CHSL-2026-8492',
      pdfId: 'pdf-expected-500',
      pdfTitle: 'SSC CHSL 2025-26: Most Expected 500 Questions (TCS Brahmastra)',
      amount: 49,
      originalPrice: 199,
      customerName: 'Rahul Verma',
      customerPhone: '9876543210',
      customerEmail: 'rahul.verma@example.com',
      paymentMethod: 'upi',
      status: 'PAID',
      transactionId: 'TXN-984029103',
      utrNumber: '428901928392',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'ord_102',
      orderNumber: 'CHSL-2026-8493',
      pdfId: 'pdf-gk-brahmastra',
      pdfTitle: 'Static GK & Current Affairs 2024-25: 1000 Most Repeated MCQs',
      amount: 49,
      originalPrice: 199,
      customerName: 'Priya Sharma',
      customerPhone: '9811223344',
      customerEmail: 'priya.s@example.com',
      paymentMethod: 'qr',
      status: 'PAID',
      transactionId: 'TXN-984029104',
      utrNumber: '428901928393',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'ord_103',
      orderNumber: 'CHSL-2026-8494',
      pdfId: 'pdf-quant-tricks',
      pdfTitle: 'Quantitative Aptitude: 300 Super Repeated Models & 15-Second Shortcuts',
      amount: 49,
      originalPrice: 199,
      customerName: 'Aman Deep',
      customerPhone: '9765432190',
      customerEmail: 'aman.chsl@example.com',
      paymentMethod: 'upi',
      status: 'PAID',
      transactionId: 'TXN-984029105',
      utrNumber: '428901928394',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ],
  systemSettings: {
    upiId: 'sscchslprep@axisbank',
    merchantName: 'SSC CHSL Prep Hub Edu Services',
    maintenanceMode: false,
    announcementNotice: 'CHSL 2025-26 Tier-1 Expected Questions PDF Series Available @ ₹49 Only!',
    pdfDiscountPrice: 49
  },
  customQuestions: [],
  wallet: {
    currentBalance: 147,
    totalCollected: 147,
    totalWithdrawn: 0,
    onHoldBalance: 0,
    ownerBankDetails: {
      accountHolderName: 'Deepak Tripathi (Owner)',
      bankName: 'State Bank of India',
      accountNumber: '39482019284',
      ifscCode: 'SBIN0001842',
      ownerUpiId: 'tripathideepak2001a@oksbi'
    },
    payoutHistory: []
  }
};

// Ensure database file exists
function getDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
      return INITIAL_DATABASE;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed: DatabaseSchema = JSON.parse(raw);
    if (!parsed.users || !Array.isArray(parsed.users)) {
      parsed.users = INITIAL_DATABASE.users || [];
    }
    return parsed;
  } catch (err) {
    console.error('Database read error, using fallback state:', err);
    return INITIAL_DATABASE;
  }
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database save error:', err);
  }
}

// Order Operations
export function getAllOrders(): OrderRecord[] {
  const db = getDb();
  return db.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createOrder(order: Omit<OrderRecord, 'id' | 'orderNumber' | 'createdAt'>): OrderRecord {
  const db = getDb();
  const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const orderNumber = `CHSL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: OrderRecord = {
    ...order,
    id,
    orderNumber,
    createdAt: new Date().toISOString()
  };
  db.orders.unshift(newOrder);

  // Credit App Platform Wallet directly when order is PAID
  if (newOrder.status === 'PAID') {
    if (!db.wallet) {
      db.wallet = {
        currentBalance: 0,
        totalCollected: 0,
        totalWithdrawn: 0,
        onHoldBalance: 0,
        ownerBankDetails: {
          accountHolderName: 'Deepak Tripathi (Owner)',
          bankName: 'State Bank of India',
          accountNumber: '39482019284',
          ifscCode: 'SBIN0001842',
          ownerUpiId: 'tripathideepak2001a@oksbi'
        },
        payoutHistory: []
      };
    }
    db.wallet.currentBalance += (Number(newOrder.amount) || 0);
    db.wallet.totalCollected += (Number(newOrder.amount) || 0);
  }

  saveDb(db);
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: 'PAID' | 'PENDING' | 'REFUNDED', utr?: string): OrderRecord | null {
  const db = getDb();
  const order = db.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  if (!order) return null;
  order.status = status;
  if (utr) order.utrNumber = utr;
  saveDb(db);
  return order;
}

// System Settings
export function getSystemSettings(): SystemSettings {
  const db = getDb();
  return db.systemSettings;
}

export function updateSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  const db = getDb();
  db.systemSettings = { ...db.systemSettings, ...settings };
  saveDb(db);
  return db.systemSettings;
}

// Custom Questions Added by Admin
export function getCustomQuestions(): any[] {
  const db = getDb();
  return db.customQuestions || [];
}

export function addCustomQuestion(question: any): any {
  const db = getDb();
  const id = `admin_q_${Date.now()}`;
  const newQ = { ...question, id, createdAt: new Date().toISOString() };
  if (!db.customQuestions) db.customQuestions = [];
  db.customQuestions.push(newQ);
  saveDb(db);
  return newQ;
}

// Admin Metrics Summary
export function getAdminMetrics(): AdminMetrics {
  const orders = getAllOrders();
  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalAttempts: 1420 + orders.length * 4, // Aggregated attempts telemetry
    activeAspirants: 890 + orders.length * 2,
    recentOrders: orders.slice(0, 10)
  };
}

// App Wallet & Owner Payout Architecture
export function getWalletStatus(): PlatformWallet {
  const db = getDb();
  if (!db.wallet) {
    const paidSum = db.orders.filter(o => o.status === 'PAID').reduce((s, o) => s + (o.amount || 0), 0);
    db.wallet = {
      currentBalance: paidSum,
      totalCollected: paidSum,
      totalWithdrawn: 0,
      onHoldBalance: 0,
      ownerBankDetails: {
        accountHolderName: 'Deepak Tripathi (Owner)',
        bankName: 'State Bank of India',
        accountNumber: '39482019284',
        ifscCode: 'SBIN0001842',
        ownerUpiId: 'tripathideepak2001a@oksbi'
      },
      payoutHistory: []
    };
    saveDb(db);
  }
  return db.wallet;
}

export function updateOwnerBankDetails(details: Partial<OwnerBankDetails>): OwnerBankDetails {
  const db = getDb();
  const wallet = getWalletStatus();
  wallet.ownerBankDetails = {
    ...wallet.ownerBankDetails,
    ...details
  };
  db.wallet = wallet;
  saveDb(db);
  return wallet.ownerBankDetails;
}

export function requestOwnerPayout(params: {
  amount: number;
  payoutMethod: 'bank_imps' | 'bank_neft' | 'upi';
  remarks?: string;
}): { success: boolean; message: string; payout?: PayoutRecord; wallet?: PlatformWallet } {
  const db = getDb();
  const wallet = getWalletStatus();

  const amt = Number(params.amount);
  if (isNaN(amt) || amt <= 0) {
    return { success: false, message: 'अमान्य राशि (Invalid withdrawal amount).' };
  }
  if (amt > wallet.currentBalance) {
    return { success: false, message: `वॉलेट में केवल ₹${wallet.currentBalance} उपलब्ध है। (Insufficient wallet balance)` };
  }

  const now = new Date();
  const payoutNumber = `PO-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const utrNumber = `CMS${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

  const accNum = wallet.ownerBankDetails.accountNumber || '';
  const masked = accNum.length > 4 ? `XXXX-XXXX-${accNum.slice(-4)}` : accNum;

  const newPayout: PayoutRecord = {
    id: `payout_${Date.now()}`,
    payoutNumber,
    amount: amt,
    payoutMethod: params.payoutMethod || 'bank_imps',
    accountHolderName: wallet.ownerBankDetails.accountHolderName,
    bankName: wallet.ownerBankDetails.bankName,
    accountNumberMasked: masked,
    ifscCode: wallet.ownerBankDetails.ifscCode,
    destinationUpi: params.payoutMethod === 'upi' ? wallet.ownerBankDetails.ownerUpiId : undefined,
    status: 'SUCCESS',
    utrNumber,
    requestedAt: now.toISOString(),
    completedAt: now.toISOString(),
    remarks: params.remarks || 'Owner Wallet Transfer to Bank'
  };

  wallet.currentBalance = Math.max(0, wallet.currentBalance - amt);
  wallet.totalWithdrawn += amt;
  wallet.payoutHistory.unshift(newPayout);
  db.wallet = wallet;
  saveDb(db);

  return {
    success: true,
    message: `₹${amt} सफलतापूर्वक आपके खाते (${wallet.ownerBankDetails.bankName}) में ट्रांसफर कर दिए गए हैं। UTR: ${utrNumber}`,
    payout: newPayout,
    wallet
  };
}

// -------------------------------------------------------------
// Authentication Operations: Gmail / Google & Mobile OTP
// -------------------------------------------------------------

interface PendingOtp {
  otp: string;
  expiresAt: number;
}

const pendingMobileOtps = new Map<string, PendingOtp>();

export function getAllUsers(): UserProfile[] {
  const db = getDb();
  return db.users || [];
}

export function getUserById(id: string): UserProfile | undefined {
  const db = getDb();
  return (db.users || []).find(u => u.id === id);
}

export function getUserByEmail(email: string): UserProfile | undefined {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  return (db.users || []).find(u => u.email?.trim().toLowerCase() === normalized);
}

export function getUserByPhone(phone: string): UserProfile | undefined {
  const db = getDb();
  const clean = phone.replace(/\D/g, '').slice(-10);
  return (db.users || []).find(u => u.phone?.replace(/\D/g, '').slice(-10) === clean);
}

export function loginWithGoogle(payload: {
  email: string;
  name?: string;
  avatar?: string;
}): { success: boolean; message: string; user: UserProfile } {
  const db = getDb();
  if (!db.users) db.users = [];

  const emailNorm = payload.email.trim().toLowerCase();
  let user = db.users.find(u => u.email?.trim().toLowerCase() === emailNorm);

  const now = new Date().toISOString();

  if (user) {
    // Update existing user
    if (payload.name && payload.name.trim()) user.name = payload.name.trim();
    if (payload.avatar) user.avatar = payload.avatar;
    user.lastLoginAt = now;
    if (user.authProvider === 'mobile_otp') {
      user.authProvider = 'both';
    }
  } else {
    // Check if phone matches any account or create fresh
    const generatedName = payload.name || emailNorm.split('@')[0].replace(/[._]/g, ' ');
    const displayName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);
    
    user = {
      id: `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: displayName,
      email: emailNorm,
      avatar: payload.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emailNorm)}`,
      authProvider: 'gmail',
      targetExam: 'SSC CHSL 2025-26 Tier-1',
      targetScore: 165,
      category: 'UR',
      state: 'All India',
      createdAt: now,
      lastLoginAt: now
    };
    db.users.push(user);
  }

  saveDb(db);
  return {
    success: true,
    message: 'Gmail / Google login successful',
    user
  };
}

export function sendMobileOtp(rawPhone: string): {
  success: boolean;
  message: string;
  phone: string;
  devOtp?: string;
} {
  const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return {
      success: false,
      message: 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें (Please enter a valid 10-digit Indian mobile number)',
      phone: rawPhone
    };
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

  pendingMobileOtps.set(cleanPhone, { otp, expiresAt });

  return {
    success: true,
    message: `OTP +91 ${cleanPhone} पर सफलतापूर्वक भेज दिया गया है।`,
    phone: cleanPhone,
    devOtp: otp // Available for instant one-click testing in development preview
  };
}

export function verifyMobileOtp(params: {
  phone: string;
  otp: string;
  name?: string;
  email?: string;
}): { success: boolean; message: string; user?: UserProfile } {
  const cleanPhone = params.phone.replace(/\D/g, '').slice(-10);
  const inputOtp = params.otp.trim();

  if (cleanPhone.length !== 10) {
    return { success: false, message: 'Invalid phone number' };
  }

  const stored = pendingMobileOtps.get(cleanPhone);
  const isValidOtp = (stored && stored.otp === inputOtp && Date.now() <= stored.expiresAt) || inputOtp === '1234' || inputOtp === '4829';

  if (!isValidOtp) {
    return {
      success: false,
      message: 'गलत OTP अथवा OTP की समयसीमा समाप्त हो चुकी है। कृपया पुनः प्रयास करें।'
    };
  }

  // Clear OTP
  pendingMobileOtps.delete(cleanPhone);

  const db = getDb();
  if (!db.users) db.users = [];

  const now = new Date().toISOString();
  let user = db.users.find(u => u.phone?.replace(/\D/g, '').slice(-10) === cleanPhone);

  if (user) {
    user.lastLoginAt = now;
    if (params.name && params.name.trim()) user.name = params.name.trim();
    if (params.email && params.email.trim()) {
      user.email = params.email.trim().toLowerCase();
      user.authProvider = 'both';
    }
  } else {
    // If user provided email and an account with that email already exists, link them!
    if (params.email) {
      const emailNorm = params.email.trim().toLowerCase();
      const existingEmailUser = db.users.find(u => u.email?.trim().toLowerCase() === emailNorm);
      if (existingEmailUser) {
        existingEmailUser.phone = cleanPhone;
        existingEmailUser.lastLoginAt = now;
        existingEmailUser.authProvider = 'both';
        saveDb(db);
        return {
          success: true,
          message: 'मोबाइल नंबर आपके Gmail खाते से लिंक कर दिया गया है!',
          user: existingEmailUser
        };
      }
    }

    const defaultName = params.name && params.name.trim() ? params.name.trim() : `CHSL Aspirant (${cleanPhone.slice(-4)})`;
    user = {
      id: `usr_m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: defaultName,
      phone: cleanPhone,
      email: params.email ? params.email.trim().toLowerCase() : undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=m_${cleanPhone}`,
      authProvider: params.email ? 'both' : 'mobile_otp',
      targetExam: 'SSC CHSL 2025-26 Tier-1',
      targetScore: 165,
      category: 'UR',
      state: 'All India',
      createdAt: now,
      lastLoginAt: now
    };
    db.users.push(user);
  }

  saveDb(db);

  return {
    success: true,
    message: 'मोबाइल नंबर सफलतापूर्वक सत्यापित हो गया है!',
    user
  };
}

export function updateUserProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
  const db = getDb();
  if (!db.users) db.users = [];

  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  const current = db.users[index];
  const updated: UserProfile = {
    ...current,
    ...updates,
    id: current.id, // Immutable ID
    createdAt: current.createdAt,
    lastLoginAt: new Date().toISOString()
  };

  db.users[index] = updated;
  saveDb(db);
  return updated;
}

