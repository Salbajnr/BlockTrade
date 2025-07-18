
import User from './User.js';
import Wallet from './Wallet.js';
import Transaction from './Transaction.js';
import Order from './Order.js';
import Trade from './Trade.js';
import TradingPair from './TradingPair.js';
import { sequelize } from '../config/database.js';
import { setupAssociations } from './associations.js';

// Define all models
const models = {
  User,
  Wallet,
  Transaction,
  Order,
  Trade,
  TradingPair
};

// Initialize all models
const initModels = async () => {
  try {
    console.log('Starting model initialization...');
    
    // First, initialize all models
    for (const [name, Model] of Object.entries(models)) {
      if (typeof Model.initialize === 'function') {
        try {
          const initializedModel = await Model.initialize(sequelize);
          if (initializedModel) {
            models[name] = initializedModel;
          }
          console.log(`✅ Model ${name} initialized`);
        } catch (error) {
          console.error(`❌ Error initializing model ${name}:`, error);
          throw error;
        }
      } else {
        console.warn(`⚠️  Model ${name} does not have an initialize method`);
      }
    }
    
    // Then set up associations
    console.log('Setting up model associations...');
    setupAssociations(models);
    
    console.log('All models initialized successfully');
    return models;
  } catch (error) {
    console.error('❌ Error initializing models:', error);
    throw error;
  }
};

// Database sync function
const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = true } = options;
    
    if (force) {
      console.log('🔄 Forcing database sync (will drop all tables)');
      await sequelize.sync({ force: true });
      console.log('✅ Database synced with force: true');
    } else if (alter) {
      console.log('🔄 Syncing database with alter: true');
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced with alter: true');
    } else {
      console.log('🔄 Syncing database');
      await sequelize.sync();
      console.log('✅ Database synced');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
};

// Export models and database functions
export {
  models,
  sequelize,
  initModels,
  syncDatabase,
  User,
  Wallet,
  Transaction,
  Order,
  Trade,
  TradingPair
};

// For development - auto sync when imported directly
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (process.env.NODE_ENV === 'development' && isMainModule) {
  (async () => {
    try {
      await initModels();
      await syncDatabase({ alter: true });
      console.log('🚀 Database is ready');
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      process.exit(1);
    }
  })();
}
