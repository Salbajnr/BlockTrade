
/**
 * Sets up all model associations
 * @param {Object} models - Object containing all initialized models
 */
export function setupAssociations(models) {
  try {
    const { User, Wallet, Transaction, Order, Trade, TradingPair } = models;

    if (!User || !Wallet || !Transaction) {
      throw new Error('Required models are not available');
    }

    // User Associations
    if (User.associate) {
      User.associate(models);
    }

    // Wallet Associations
    if (Wallet.associate) {
      Wallet.associate(models);
    }

    // Transaction Associations
    if (Transaction.associate) {
      Transaction.associate(models);
    }

    // Order Associations (if exists)
    if (Order && Order.associate) {
      Order.associate(models);
    }

    // Trade Associations (if exists)
    if (Trade && Trade.associate) {
      Trade.associate(models);
    }

    // TradingPair Associations (if exists)
    if (TradingPair && TradingPair.associate) {
      TradingPair.associate(models);
    }

    console.log('✅ Database associations set up successfully');
  } catch (error) {
    console.error('❌ Error setting up associations:', error);
    throw error;
  }
}
