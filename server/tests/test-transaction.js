
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Transaction model test...');

// Create a simple in-memory SQLite database
const sequelize = new Sequelize('sqlite::memory:', {
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true
  }
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users'
});

// Define Wallet model
const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(24, 8),
    defaultValue: 0
  },
  available_balance: {
    type: DataTypes.DECIMAL(24, 8),
    defaultValue: 0
  }
}, {
  tableName: 'wallets',
  hooks: {
    beforeCreate: (wallet) => {
      if (!wallet.address) {
        wallet.address = '0x' + crypto.randomBytes(20).toString('hex');
      }
    }
  }
});

// Define Transaction model
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer', 'trade', 'fee'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(24, 8),
    allowNull: false
  },
  fee: {
    type: DataTypes.DECIMAL(24, 8),
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  tx_hash: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'transactions',
  hooks: {
    afterCreate: async (transaction, options) => {
      // Update wallet balance after transaction
      if (transaction.status === 'completed') {
        await transaction.updateWalletBalances();
      }
    },
    afterUpdate: async (transaction, options) => {
      // Update wallet balance if status changed to completed
      if (transaction.changed('status') && transaction.status === 'completed') {
        await transaction.updateWalletBalances();
      }
    }
  }
});

// Instance method to update wallet balances
Transaction.prototype.updateWalletBalances = async function() {
  const wallet = await this.getWallet();
  if (!wallet) return;

  const amount = parseFloat(this.amount);
  const fee = parseFloat(this.fee || 0);
  
  if (['deposit', 'trade'].includes(this.type)) {
    // Add to wallet balance
    await wallet.increment('balance', { by: amount });
    await wallet.increment('available_balance', { by: amount - fee });
  } else if (['withdrawal', 'fee'].includes(this.type)) {
    // Subtract from wallet balance
    await wallet.decrement('balance', { by: amount + fee });
    await wallet.decrement('available_balance', { by: amount });
  }
  
  // Refresh the wallet to get updated values
  await wallet.reload();
};

// Set up associations
User.hasMany(Wallet, { foreignKey: 'user_id' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

Wallet.hasMany(Transaction, { foreignKey: 'wallet_id' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id' });

async function runTest() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    
    // Create test user
    console.log('Creating test user...');
    const testUser = await User.create({
      email: `user-${Date.now()}@example.com`,
      name: 'Test User'
    });
    
    // Create test wallet
    console.log('Creating test wallet...');
    const walletAddress = '0x' + crypto.randomBytes(20).toString('hex');
    const testWallet = await Wallet.create({
      user_id: testUser.id,
      address: walletAddress,
      currency: 'BTC',
      balance: 0,
      available_balance: 0
    });
    
    console.log('\n=== Testing Deposit Transaction ===');
    const depositTx = await Transaction.create({
      user_id: testUser.id,
      wallet_id: testWallet.id,
      type: 'deposit',
      amount: 1.5,
      fee: 0.001,
      currency: 'BTC',
      status: 'completed',
      description: 'Test deposit',
      tx_hash: '0x' + crypto.randomBytes(32).toString('hex')
    });
    
    console.log('Deposit transaction created:', {
      id: depositTx.id,
      amount: depositTx.amount.toString(),
      fee: depositTx.fee.toString(),
      status: depositTx.status
    });
    
    // Refresh wallet to get updated balance
    await testWallet.reload();
    console.log('Wallet after deposit:', {
      balance: testWallet.balance.toString(),
      available_balance: testWallet.available_balance.toString()
    });
    
    console.log('\n=== Testing Withdrawal Transaction ===');
    const withdrawalTx = await Transaction.create({
      user_id: testUser.id,
      wallet_id: testWallet.id,
      type: 'withdrawal',
      amount: 0.5,
      fee: 0.0005,
      currency: 'BTC',
      status: 'completed',
      description: 'Test withdrawal',
      tx_hash: '0x' + crypto.randomBytes(32).toString('hex')
    });
    
    // Refresh wallet to get updated balance
    await testWallet.reload();
    console.log('Wallet after withdrawal:', {
      balance: testWallet.balance.toString(),
      available_balance: testWallet.available_balance.toString()
    });
    
    // Query transactions for the wallet
    const transactions = await Transaction.findAll({
      where: { wallet_id: testWallet.id },
      order: [['created_at', 'DESC']]
    });
    
    console.log('\n=== Transaction History ===');
    transactions.forEach((tx, index) => {
      console.log(`\nTransaction #${index + 1}:`);
      console.log(`- Type: ${tx.type}`);
      console.log(`- Amount: ${tx.amount} ${tx.currency}`);
      console.log(`- Fee: ${tx.fee} ${tx.currency}`);
      console.log(`- Status: ${tx.status}`);
      console.log(`- Description: ${tx.description}`);
      console.log(`- Created: ${tx.created_at}`);
    });
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
runTest();
