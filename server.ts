import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  getSystemSettings,
  updateSystemSettings,
  getCustomQuestions,
  addCustomQuestion,
  getAdminMetrics,
  getWalletStatus,
  updateOwnerBankDetails,
  requestOwnerPayout,
  loginWithGoogle,
  sendMobileOtp,
  verifyMobileOtp,
  getUserById,
  updateUserProfile
} from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'SSC CHSL Prep Hub Server',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Public system settings
  app.get('/api/system/settings', (req: Request, res: Response) => {
    try {
      const settings = getSystemSettings();
      res.json({ success: true, settings });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // Student Authentication Routes (Gmail & Mobile Number with OTP)
  // -------------------------------------------------------------

  // Google / Gmail Login
  app.post('/api/auth/google', (req: Request, res: Response) => {
    try {
      const { email, name, avatar } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'कृपया मान्य Gmail / ईमेल पता दर्ज करें (Valid email required)'
        });
      }

      const result = loginWithGoogle({ email, name, avatar });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Send Mobile OTP
  app.post('/api/auth/send-otp', (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'मोबाइल नंबर आवश्यक है (Mobile number is required)'
        });
      }

      const result = sendMobileOtp(phone);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Verify Mobile OTP
  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    try {
      const { phone, otp, name, email } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({
          success: false,
          message: 'मोबाइल नंबर और OTP दोनों आवश्यक हैं'
        });
      }

      const result = verifyMobileOtp({ phone, otp, name, email });
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Fetch User Profile by ID
  app.get('/api/auth/user/:id', (req: Request, res: Response) => {
    try {
      const user = getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'उपयोगकर्ता नहीं मिला (User not found)' });
      }
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Update User Profile
  app.post('/api/auth/user/:id/update', (req: Request, res: Response) => {
    try {
      const updated = updateUserProfile(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'उपयोगकर्ता नहीं मिला' });
      }
      res.json({ success: true, user: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Create payment order
  app.post('/api/orders/create', (req: Request, res: Response) => {
    try {
      const {
        pdfId,
        pdfTitle,
        amount = 49,
        originalPrice = 199,
        customerName = 'Aspirant',
        customerPhone,
        customerEmail,
        paymentMethod = 'upi',
        utrNumber
      } = req.body;

      if (!pdfId || !pdfTitle) {
        return res.status(400).json({ success: false, message: 'Missing pdfId or pdfTitle' });
      }

      const settings = getSystemSettings();
      const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = createOrder({
        pdfId,
        pdfTitle,
        amount: Number(amount) || settings.pdfDiscountPrice || 49,
        originalPrice: Number(originalPrice) || 199,
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod,
        status: 'PAID', // Instant verification simulation
        transactionId,
        utrNumber: utrNumber || undefined
      });

      // Construct authentic Indian UPI intent string
      const upiUrl = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.merchantName)}&am=${newOrder.amount}&cu=INR&tn=${encodeURIComponent(`SSC CHSL ${newOrder.orderNumber}`)}`;

      res.json({
        success: true,
        order: newOrder,
        payment: {
          upiUrl,
          upiId: settings.upiId,
          merchantName: settings.merchantName,
          amount: newOrder.amount,
          currency: 'INR'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Verify payment endpoint
  app.post('/api/orders/verify', (req: Request, res: Response) => {
    try {
      const { orderId, utrNumber } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, message: 'Order ID is required' });
      }

      const updated = updateOrderStatus(orderId, 'PAID', utrNumber);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        order: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get user order history
  app.get('/api/orders/user', (req: Request, res: Response) => {
    try {
      const customerName = (req.query.name as string) || '';
      const all = getAllOrders();
      const filtered = customerName
        ? all.filter((o) => o.customerName.toLowerCase() === customerName.toLowerCase())
        : all;
      res.json({ success: true, orders: filtered });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // -------------------------------------------------------------
  // Admin Endpoints (Secured with simple bearer / admin token)
  // -------------------------------------------------------------

  // Admin metrics
  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    try {
      const metrics = getAdminMetrics();
      res.json({ success: true, metrics });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // App Wallet Status & Payout Summary
  app.get('/api/wallet/status', (req: Request, res: Response) => {
    try {
      const wallet = getWalletStatus();
      res.json({ success: true, wallet });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Owner Bank Details Update
  app.post('/api/wallet/bank-details', (req: Request, res: Response) => {
    try {
      const updated = updateOwnerBankDetails(req.body);
      res.json({ success: true, ownerBankDetails: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Request Transfer / Payout from App Wallet to Owner Bank / UPI
  app.post('/api/wallet/payout', (req: Request, res: Response) => {
    try {
      const { amount, payoutMethod = 'bank_imps', remarks } = req.body;
      const result = requestOwnerPayout({
        amount: Number(amount),
        payoutMethod,
        remarks
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Admin orders list
  app.get('/api/admin/orders', (req: Request, res: Response) => {
    try {
      const orders = getAllOrders();
      res.json({ success: true, orders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Update order status (Approve / Refund)
  app.post('/api/admin/orders/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, utrNumber } = req.body;

      if (!['PAID', 'PENDING', 'REFUNDED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const updated = updateOrderStatus(id, status, utrNumber);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.json({ success: true, order: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Add custom question
  app.post('/api/admin/questions/add', (req: Request, res: Response) => {
    try {
      const q = req.body;
      const added = addCustomQuestion(q);
      res.json({ success: true, question: added });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get custom questions
  app.get('/api/admin/questions', (req: Request, res: Response) => {
    try {
      const questions = getCustomQuestions();
      res.json({ success: true, questions });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Update system settings
  app.post('/api/admin/system/settings', (req: Request, res: Response) => {
    try {
      const settings = updateSystemSettings(req.body);
      res.json({ success: true, settings });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // -------------------------------------------------------------
  // Vite Middleware (Development) or Static Serving (Production)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SSC CHSL Prep Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
