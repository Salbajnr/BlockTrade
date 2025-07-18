
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { getWallets, getWallet, createWallet, getTransactions } from '../controllers/wallet.controller.js';
import { createOrder, cancelOrder, getOrders, getTrades } from '../controllers/trading.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);

// Wallet routes
router.get('/wallets', authenticate, getWallets);
router.get('/wallets/:id', authenticate, getWallet);
router.post('/wallets', authenticate, createWallet);
router.get('/wallets/:walletId/transactions', authenticate, getTransactions);

// Trading routes
router.post('/orders', authenticate, createOrder);
router.delete('/orders/:id', authenticate, cancelOrder);
router.get('/orders', authenticate, getOrders);
router.get('/trades', authenticate, getTrades);

export default router;
