
import { ApiError } from '../middleware/error.middleware.js';
import { broadcastToAll, broadcastToChannel } from './websocket.service.js';

class TradingService {
  constructor() {
    this.orderBook = new Map(); // Simple in-memory order book
    this.trades = [];
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      const { user_id, trading_pair_id, type, side, amount, price } = orderData;

      // Validate order data
      if (!user_id || !trading_pair_id || !type || !side || !amount) {
        throw new ApiError('Missing required order fields', 400);
      }

      if (type === 'limit' && !price) {
        throw new ApiError('Price is required for limit orders', 400);
      }

      const order = {
        id: this.generateOrderId(),
        user_id,
        trading_pair_id,
        type,
        side,
        amount: parseFloat(amount),
        price: price ? parseFloat(price) : null,
        status: 'pending',
        filled_amount: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Add to order book
      this.addToOrderBook(order);

      // Try to match orders
      await this.matchOrders(trading_pair_id);

      // Broadcast order update
      broadcastToChannel('orders', {
        type: 'order_created',
        order
      });

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cancelled order
   */
  async cancelOrder(orderId, userId) {
    try {
      const order = this.findOrderInBook(orderId);
      
      if (!order) {
        throw new ApiError('Order not found', 404);
      }

      if (order.user_id !== userId) {
        throw new ApiError('Unauthorized to cancel this order', 403);
      }

      if (order.status !== 'pending') {
        throw new ApiError('Cannot cancel order with status: ' + order.status, 400);
      }

      // Update order status
      order.status = 'cancelled';
      order.updated_at = new Date();

      // Remove from order book
      this.removeFromOrderBook(order);

      // Broadcast order update
      broadcastToChannel('orders', {
        type: 'order_cancelled',
        order
      });

      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Get user's orders
   * @param {string} userId - User ID
   * @param {Object} filters - Filters
   * @returns {Array} User's orders
   */
  getUserOrders(userId, filters = {}) {
    const allOrders = this.getAllOrders();
    let userOrders = allOrders.filter(order => order.user_id === userId);

    // Apply filters
    if (filters.status) {
      userOrders = userOrders.filter(order => order.status === filters.status);
    }

    if (filters.trading_pair_id) {
      userOrders = userOrders.filter(order => order.trading_pair_id === filters.trading_pair_id);
    }

    return userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  /**
   * Get order book for a trading pair
   * @param {string} tradingPairId - Trading pair ID
   * @returns {Object} Order book
   */
  getOrderBook(tradingPairId) {
    const orders = this.orderBook.get(tradingPairId) || { buy: [], sell: [] };
    
    return {
      buy: orders.buy.sort((a, b) => b.price - a.price), // Highest first
      sell: orders.sell.sort((a, b) => a.price - b.price) // Lowest first
    };
  }

  /**
   * Get recent trades
   * @param {string} tradingPairId - Trading pair ID
   * @param {number} limit - Number of trades to return
   * @returns {Array} Recent trades
   */
  getRecentTrades(tradingPairId, limit = 50) {
    return this.trades
      .filter(trade => trade.trading_pair_id === tradingPairId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  /**
   * Add order to order book
   * @param {Object} order - Order object
   */
  addToOrderBook(order) {
    if (!this.orderBook.has(order.trading_pair_id)) {
      this.orderBook.set(order.trading_pair_id, { buy: [], sell: [] });
    }

    const book = this.orderBook.get(order.trading_pair_id);
    book[order.side].push(order);
  }

  /**
   * Remove order from order book
   * @param {Object} order - Order object
   */
  removeFromOrderBook(order) {
    const book = this.orderBook.get(order.trading_pair_id);
    if (book) {
      book[order.side] = book[order.side].filter(o => o.id !== order.id);
    }
  }

  /**
   * Find order in order book
   * @param {string} orderId - Order ID
   * @returns {Object|null} Order object or null
   */
  findOrderInBook(orderId) {
    for (const [tradingPairId, book] of this.orderBook) {
      const order = [...book.buy, ...book.sell].find(o => o.id === orderId);
      if (order) return order;
    }
    return null;
  }

  /**
   * Get all orders
   * @returns {Array} All orders
   */
  getAllOrders() {
    const allOrders = [];
    for (const [tradingPairId, book] of this.orderBook) {
      allOrders.push(...book.buy, ...book.sell);
    }
    return allOrders;
  }

  /**
   * Match orders in the order book
   * @param {string} tradingPairId - Trading pair ID
   */
  async matchOrders(tradingPairId) {
    const book = this.orderBook.get(tradingPairId);
    if (!book) return;

    const buyOrders = book.buy.filter(o => o.status === 'pending').sort((a, b) => b.price - a.price);
    const sellOrders = book.sell.filter(o => o.status === 'pending').sort((a, b) => a.price - b.price);

    for (const buyOrder of buyOrders) {
      for (const sellOrder of sellOrders) {
        if (buyOrder.price >= sellOrder.price) {
          await this.executeTrade(buyOrder, sellOrder);
        }
      }
    }
  }

  /**
   * Execute a trade between two orders
   * @param {Object} buyOrder - Buy order
   * @param {Object} sellOrder - Sell order
   */
  async executeTrade(buyOrder, sellOrder) {
    const tradeAmount = Math.min(
      buyOrder.amount - buyOrder.filled_amount,
      sellOrder.amount - sellOrder.filled_amount
    );

    const tradePrice = sellOrder.price; // Use sell order price
    
    const trade = {
      id: this.generateTradeId(),
      buy_order_id: buyOrder.id,
      sell_order_id: sellOrder.id,
      trading_pair_id: buyOrder.trading_pair_id,
      amount: tradeAmount,
      price: tradePrice,
      created_at: new Date()
    };

    // Update order filled amounts
    buyOrder.filled_amount += tradeAmount;
    sellOrder.filled_amount += tradeAmount;

    // Update order status
    if (buyOrder.filled_amount >= buyOrder.amount) {
      buyOrder.status = 'filled';
    }
    if (sellOrder.filled_amount >= sellOrder.amount) {
      sellOrder.status = 'filled';
    }

    // Add trade to trades array
    this.trades.push(trade);

    // Broadcast trade
    broadcastToChannel('trades', {
      type: 'trade_executed',
      trade
    });

    console.log(`Trade executed: ${tradeAmount} at ${tradePrice}`);
  }

  /**
   * Generate order ID
   * @returns {string} Order ID
   */
  generateOrderId() {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate trade ID
   * @returns {string} Trade ID
   */
  generateTradeId() {
    return 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

const tradingService = new TradingService();

export const {
  createOrder,
  cancelOrder,
  getUserOrders,
  getOrderBook,
  getRecentTrades
} = tradingService;

export default tradingService;
