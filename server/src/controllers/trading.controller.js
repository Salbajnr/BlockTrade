import { Order, Trade, TradingPair, Wallet, sequelize } from '../models/index.js';
import { broadcastToUser, broadcastToAll } from '../services/websocket.js';

export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { tradingPairId, type, side, price, amount } = req.body;

    // Validate trading pair
    const tradingPair = await TradingPair.findByPk(tradingPairId);
    if (!tradingPair) {
      return res.status(404).json({ message: 'Trading pair not found' });
    }

    // Calculate total
    const total = price * amount;

    // Check balance
    const currency = side === 'buy' ? tradingPair.quoteCurrency : tradingPair.baseCurrency;
    const wallet = await Wallet.findOne({
      where: {
        userId: req.user.id,
        currency,
        type: 'spot'
      }
    });

    if (!wallet) {
      return res.status(400).json({ message: `No ${currency} wallet found` });
    }

    const requiredAmount = side === 'buy' ? total : amount;
    if (wallet.balance < requiredAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      tradingPairId,
      type,
      side,
      price,
      amount,
      remainingAmount: amount,
      total,
      status: 'pending',
      makerFeeRate: tradingPair.makerFee,
      takerFeeRate: tradingPair.takerFee
    }, { transaction: t });

    // Lock the funds
    await wallet.update({
      balance: wallet.balance - requiredAmount
    }, { transaction: t });

    await t.commit();

    // Broadcast new order
    WebSocket.broadcast('newOrder', {
      tradingPair: tradingPair.symbol,
      order: order.toJSON()
    });

    // Try to match order
    await matchOrder(order.id);

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    await t.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        status: ['pending', 'partial']
      },
      include: [TradingPair]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return funds to wallet
    const currency = order.side === 'buy' ? order.TradingPair.quoteCurrency : order.TradingPair.baseCurrency;
    const wallet = await Wallet.findOne({
      where: {
        userId: req.user.id,
        currency,
        type: 'spot'
      }
    });

    const remainingValue = order.side === 'buy'
      ? order.remainingAmount * order.price
      : order.remainingAmount;

    await wallet.update({
      balance: wallet.balance + remainingValue
    }, { transaction: t });

    // Update order status
    await order.update({
      status: 'cancelled'
    }, { transaction: t });

    await t.commit();

    // Broadcast cancelled order
    WebSocket.broadcast('cancelOrder', {
      tradingPair: order.TradingPair.symbol,
      orderId: order.id
    });

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    await t.rollback();
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, tradingPairId, page = 1, limit = 10 } = req.query;
    const where = { userId: req.user.id };

    if (status) where.status = status;
    if (tradingPairId) where.tradingPairId = tradingPairId;

    const orders = await Order.findAndCountAll({
      where,
      include: [TradingPair],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      orders: orders.rows,
      total: orders.count,
      page: parseInt(page),
      totalPages: Math.ceil(orders.count / limit)
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const getTrades = async (req, res) => {
  try {
    const { tradingPairId, page = 1, limit = 10 } = req.query;
    const where = {
      [sequelize.Op.or]: [
        { makerUserId: req.user.id },
        { takerUserId: req.user.id }
      ]
    };

    if (tradingPairId) where.tradingPairId = tradingPairId;

    const trades = await Trade.findAndCountAll({
      where,
      include: [TradingPair],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    res.json({
      trades: trades.rows,
      total: trades.count,
      page: parseInt(page),
      totalPages: Math.ceil(trades.count / limit)
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ message: 'Error fetching trades' });
  }
};

export const getTradingPairs = async (req, res, next) => {
  try {
    // Mock trading pairs data for now
    const mockPairs = [
      {
        id: 1,
        base_currency: 'BTC',
        quote_currency: 'USD',
        min_trade_amount: 0.001,
        max_trade_amount: 10,
        is_active: true,
        current_price: 65000,
        change_24h: 2.5
      },
      {
        id: 2,
        base_currency: 'ETH',
        quote_currency: 'USD',
        min_trade_amount: 0.01,
        max_trade_amount: 100,
        is_active: true,
        current_price: 3200,
        change_24h: -1.2
      }
    ];

    res.json({
      success: true,
      data: mockPairs
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketData = async (req, res, next) => {
  try {
    // Mock market data
    const mockMarketData = [
      {
        symbol: 'BTCUSD',
        price: 65000,
        change: 2.5,
        volume: 1234567,
        high: 66000,
        low: 64000
      },
      {
        symbol: 'ETHUSD',
        price: 3200,
        change: -1.2,
        volume: 2345678,
        high: 3250,
        low: 3180
      }
    ];

    res.json({
      success: true,
      data: mockMarketData
    });
  } catch (error) {
    next(error);
  }
};