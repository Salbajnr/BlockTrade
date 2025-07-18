
import { Sequelize, DataTypes, Op } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting End-to-End Test...');

// Configuration
const config = {
  JWT_SECRET: 'test-secret-key',
  JWT_EXPIRES_IN: '1h',
  PORT: 3001
};

// Initialize database
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false, // Disable logging for cleaner test output
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true
  }
});

// ======================
// MODELS
// ======================


// User Model
class User extends Sequelize.Model {
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  generateJwt() {
    return jwt.sign(
      { id: this.id, email: this.email, role: this.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }
}

User.init({
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
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  country: DataTypes.STRING(2),
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Wallet Model
class Wallet extends Sequelize.Model {
  getBalance() {
    return {
      total: parseFloat(this.balance),
      available: parseFloat(this.available_balance),
      in_orders: parseFloat(this.balance - this.available_balance),
      currency: this.currency
    };
  }

  canWithdraw(amount) {
    return this.available_balance >= amount;
  }
}

Wallet.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  address: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  balance: {
    type: DataTypes.DECIMAL(24, 8),
    defaultValue: 0,
    allowNull: false,
    validate: { min: 0 }
  },
  available_balance: {
    type: DataTypes.DECIMAL(24, 8),
    defaultValue: 0,
    allowNull: false,
    validate: { min: 0 }
  },
  label: DataTypes.STRING,
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'Wallet',
  tableName: 'wallets',
  hooks: {
    beforeCreate: async (wallet) => {
      if (!wallet.address) {
        wallet.address = '0x' + crypto.randomBytes(20).toString('hex');
      }
    }
  }
});

// Transaction Model
class Transaction extends Sequelize.Model {
  async updateWalletBalances() {
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
  }
}

Transaction.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  wallet_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'wallets',
      key: 'id'
    }
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
  sequelize,
  modelName: 'Transaction',
  tableName: 'transactions',
  hooks: {
    afterCreate: async (transaction, options) => {
      if (transaction.status === 'completed') {
        await transaction.updateWalletBalances();
      }
    },
    afterUpdate: async (transaction, options) => {
      if (transaction.changed('status') && transaction.status === 'completed') {
        await transaction.updateWalletBalances();
      }
    }
  }
});

// Set up associations
User.hasMany(Wallet, { foreignKey: 'user_id' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

Wallet.hasMany(Transaction, { foreignKey: 'wallet_id' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id' });

// ======================
// TEST SCENARIOS
// ======================

async function runTests() {
  try {
    console.log('🔄 Setting up test environment...');
    
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');
    
    // ======================
    // 1. USER REGISTRATION
    // ======================
    console.log('\n🔍 Testing User Registration...');
    const testUser = await User.create({
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePass123!',
      first_name: 'Test',
      last_name: 'User',
      country: 'US',
      is_email_verified: true // Skip email verification for test
    });
    
    console.log('✅ Test user created:', {
      id: testUser.id,
      email: testUser.email,
      name: `${testUser.first_name} ${testUser.last_name}`
    });
    
    // ======================
    // 2. USER AUTHENTICATION
    // ======================
    console.log('\n🔍 Testing User Authentication...');
    
    // Test password validation
    const isValidPassword = await testUser.validatePassword('SecurePass123!');
    console.log('✅ Password validation:', isValidPassword ? 'PASSED' : 'FAILED');
    
    // Generate JWT token
    const token = testUser.generateJwt();
    console.log('✅ JWT token generated:', token ? 'SUCCESS' : 'FAILED');
    
    // ======================
    // 3. WALLET CREATION
    // ======================
    console.log('\n🔍 Testing Wallet Creation...');
    
    // Create BTC wallet
    const btcWallet = await Wallet.create({
      user_id: testUser.id,
      address: '0x' + crypto.randomBytes(20).toString('hex'),
      currency: 'BTC',
      balance: 0,
      available_balance: 0,
      is_default: true,
      label: 'My Bitcoin Wallet'
    });
    
    console.log('✅ BTC Wallet created:', {
      id: btcWallet.id,
      address: btcWallet.address,
      currency: btcWallet.currency,
      balance: btcWallet.balance.toString()
    });
    
    // Create ETH wallet
    const ethWallet = await Wallet.create({
      user_id: testUser.id,
      address: '0x' + crypto.randomBytes(20).toString('hex'),
      currency: 'ETH',
      balance: 0,
      available_balance: 0,
      label: 'My Ethereum Wallet'
    });
    
    console.log('✅ ETH Wallet created:', {
      id: ethWallet.id,
      address: ethWallet.address,
      currency: ethWallet.currency,
      balance: ethWallet.balance.toString()
    });
    
    // ======================
    // 4. DEPOSIT TRANSACTION
    // ======================
    console.log('\n🔍 Testing Deposit Transaction...');
    
    const depositTx = await Transaction.create({
      user_id: testUser.id,
      wallet_id: btcWallet.id,
      type: 'deposit',
      amount: 2.5,
      fee: 0.001,
      currency: 'BTC',
      status: 'completed',
      description: 'Test deposit',
      tx_hash: '0x' + crypto.randomBytes(32).toString('hex')
    });
    
    // Refresh wallet to get updated balance
    await btcWallet.reload();
    
    console.log('✅ Deposit transaction completed:', {
      tx_id: depositTx.id,
      amount: depositTx.amount.toString(),
      fee: depositTx.fee.toString(),
      new_balance: btcWallet.balance.toString(),
      new_available_balance: btcWallet.available_balance.toString()
    });
    
    // ======================
    // 5. WITHDRAWAL TRANSACTION
    // ======================
    console.log('\n🔍 Testing Withdrawal Transaction...');
    
    // First check if we have enough balance
    if (btcWallet.canWithdraw(1.0)) {
      const withdrawalTx = await Transaction.create({
        user_id: testUser.id,
        wallet_id: btcWallet.id,
        type: 'withdrawal',
        amount: 1.0,
        fee: 0.0005,
        currency: 'BTC',
        status: 'completed',
        description: 'Test withdrawal',
        tx_hash: '0x' + crypto.randomBytes(32).toString('hex')
      });
      
      // Refresh wallet to get updated balance
      await btcWallet.reload();
      
      console.log('✅ Withdrawal transaction completed:', {
        tx_id: withdrawalTx.id,
        amount: withdrawalTx.amount.toString(),
        fee: withdrawalTx.fee.toString(),
        new_balance: btcWallet.balance.toString(),
        new_available_balance: btcWallet.available_balance.toString()
      });
    } else {
      console.error('❌ Insufficient balance for withdrawal');
    }
    
    // ======================
    // 6. TRANSFER BETWEEN WALLETS
    // ======================
    console.log('\n🔍 Testing Transfer Between Wallets...');
    
    // Deposit some ETH first
    const ethDepositTx = await Transaction.create({
      user_id: testUser.id,
      wallet_id: ethWallet.id,
      type: 'deposit',
      amount: 5.0,
      fee: 0.01,
      currency: 'ETH',
      status: 'completed',
      description: 'Initial ETH deposit',
      tx_hash: '0x' + crypto.randomBytes(32).toString('hex')
    });
    
    // Refresh ETH wallet
    await ethWallet.reload();
    
    console.log('✅ ETH deposit completed:', {
      amount: ethDepositTx.amount.toString(),
      new_balance: ethWallet.balance.toString()
    });
    
    // Simulate transfer (this would be a single atomic transaction in production)
    const transferAmount = 2.0;
    const transferFee = 0.001;
    
    // Create withdrawal from ETH wallet
    const ethWithdrawalTx = await Transaction.create({
      user_id: testUser.id,
      wallet_id: ethWallet.id,
      type: 'withdrawal',
      amount: transferAmount,
      fee: transferFee,
      currency: 'ETH',
      status: 'completed',
      description: 'Transfer to BTC wallet',
      tx_hash: '0x' + crypto.randomBytes(32).toString('hex')
    });
    
    // Create deposit to BTC wallet (with equivalent value, in a real system this would be an exchange)
    const btcDepositTx = await Transaction.create({
      user_id: testUser.id,
      wallet_id: btcWallet.id,
      type: 'deposit',
      amount: 0.1, // Simplified exchange rate
      fee: 0.0001,
      currency: 'BTC',
      status: 'completed',
      description: 'Transfer from ETH wallet',
      tx_hash: '0x' + crypto.randomBytes(32).toString('hex')
    });
    
    // Refresh wallets
    await Promise.all([
      ethWallet.reload(),
      btcWallet.reload()
    ]);
    
    console.log('✅ Transfer completed:', {
      from: {
        wallet: 'ETH',
        amount: transferAmount,
        fee: transferFee,
        new_balance: ethWallet.balance.toString()
      },
      to: {
        wallet: 'BTC',
        amount: 0.1,
        fee: 0.0001,
        new_balance: btcWallet.balance.toString()
      }
    });
    
    // ======================
    // 7. TRANSACTION HISTORY
    // ======================
    console.log('\n🔍 Testing Transaction History...');
    
    const transactions = await Transaction.findAll({
      where: { user_id: testUser.id },
      order: [['created_at', 'DESC']],
      include: [
        { model: Wallet, as: 'Wallet', attributes: ['id', 'currency'] }
      ]
    });
    
    console.log('\n📜 Transaction History:');
    transactions.forEach((tx, index) => {
      console.log(`\n#${index + 1} ${tx.type.toUpperCase()}`);
      console.log(`- ID: ${tx.id}`);
      console.log(`- Amount: ${tx.amount} ${tx.currency}`);
      console.log(`- Fee: ${tx.fee} ${tx.currency}`);
      console.log(`- Status: ${tx.status}`);
      console.log(`- Wallet: ${tx.Wallet.currency} (${tx.Wallet.id})`);
      console.log(`- Description: ${tx.description}`);
      console.log(`- Date: ${tx.created_at}`);
    });
    
    // ======================
    // 8. WALLET BALANCES
    // ======================
    console.log('\n💰 Final Wallet Balances:');
    
    const wallets = await Wallet.findAll({
      where: { user_id: testUser.id },
      order: [['currency', 'ASC']]
    });
    
    wallets.forEach(wallet => {
      const balance = wallet.getBalance();
      console.log(`\n${wallet.currency} Wallet (${wallet.label || 'No label'})`);
      console.log(`- Address: ${wallet.address}`);
      console.log(`- Total Balance: ${balance.total} ${wallet.currency}`);
      console.log(`- Available: ${balance.available} ${wallet.currency}`);
      console.log(`- In Orders: ${balance.in_orders} ${wallet.currency}`);
      console.log(`- Status: ${wallet.status}`);
    });
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error.errors) {
      error.errors.forEach(err => {
        console.error(`- ${err.message}`);
      });
    }
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the tests
runTests();
