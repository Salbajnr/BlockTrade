
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { getWallets, getWallet, createWallet, getTransactions } from '../controllers/wallet.controller.js';
import { createOrder, cancelOrder, getOrders, getTrades, getTradingPairs, getMarketData } from '../controllers/trading.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/verify-email', authController.verifyEmail);

// Wallet routes
router.get('/wallets', authenticate, getWallets);
router.get('/wallets/:id', authenticate, getWallet);
router.post('/wallets', authenticate, createWallet);
router.get('/wallets/:walletId/transactions', authenticate, getTransactions);
router.get('/wallets/:walletId/balance', authenticate, getWallet);

// Transaction routes
router.post('/transactions/send', authenticate, async (req, res) => {
  // TODO: Implement send transaction
  res.json({ success: true, message: 'Transaction sent successfully' });
});

// Trading routes
router.get('/trading/pairs', getTradingPairs);
router.get('/trading/market-data', getMarketData);
router.post('/trading/orders', authenticate, createOrder);
router.get('/trading/orders', authenticate, getOrders);
router.delete('/trading/orders/:id', authenticate, cancelOrder);
router.get('/trading/orders/history', authenticate, getOrders);
router.get('/trading/trades', authenticate, getTrades);

// Admin routes placeholder
router.get('/admin/users', authenticate, async (req, res) => {
  // TODO: Implement admin routes
  res.json({ success: true, data: [] });
});

router.get('/admin/transactions', authenticate, async (req, res) => {
  res.json({ success: true, data: [] });
});

router.get('/admin/analytics', authenticate, async (req, res) => {
  res.json({ success: true, data: {} });
});

export default router;
