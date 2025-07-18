
import { Wallet, Transaction, User, sequelize } from '../models/index.js';
import { generateWalletAddress } from '../utils/crypto.js';
import { ApiError } from '../middleware/error.middleware.js';

/**
 * Get all wallets for the authenticated user
 */
export const getWallets = async (req, res, next) => {
  try {
    const wallets = await Wallet.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
    });

    res.json({ 
      success: true,
      data: wallets 
    });
  } catch (error) {
    console.error('Get wallets error:', error);
    next(new ApiError('Error fetching wallets', 500));
  }
};

/**
 * Get a single wallet by ID
 */
export const getWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      },
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
    });

    if (!wallet) {
      return next(new ApiError('Wallet not found', 404));
    }

    res.json({ 
      success: true,
      data: wallet 
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    next(new ApiError('Error fetching wallet', 500));
  }
};

/**
 * Create a new wallet
 */
export const createWallet = async (req, res, next) => {
  try {
    const { currency, type = 'spot' } = req.body;

    // Validate input
    if (!currency) {
      return next(new ApiError('Currency is required', 400));
    }

    // Check if wallet already exists
    const existingWallet = await Wallet.findOne({
      where: {
        user_id: req.user.id,
        currency,
        type
      }
    });

    if (existingWallet) {
      return next(new ApiError('Wallet already exists for this currency and type', 400));
    }

    // Generate wallet address
    const address = generateWalletAddress();

    // Create wallet
    const wallet = await Wallet.create({
      user_id: req.user.id,
      currency,
      type,
      address,
      balance: 0
    });

    res.json({
      success: true,
      data: {
        wallet: {
          id: wallet.id,
          currency,
          type,
          address,
          balance: wallet.balance,
          createdAt: wallet.created_at
        }
      }
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    next(new ApiError('Error creating wallet', 500));
  }
};

/**
 * Get transactions for a specific wallet
 */
export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const walletId = req.params.id;

    // Validate wallet ownership
    const wallet = await Wallet.findOne({
      where: {
        id: walletId,
        user_id: req.user.id
      }
    });

    if (!wallet) {
      return next(new ApiError('Wallet not found', 404));
    }

    const transactions = await Transaction.findAndCountAll({
      where: {
        wallet_id: walletId
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * parseInt(limit),
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] }
    });

    res.json({
      success: true,
      data: {
        transactions: transactions.rows,
        totalPages: Math.ceil(transactions.count / parseInt(limit)),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    next(new ApiError('Error fetching transactions', 500));
  }
};
