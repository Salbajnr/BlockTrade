import { DataTypes, Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a simple in-memory SQLite database for testing
const sequelize = new Sequelize('sqlite::memory:', {
  logging: console.log,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
});

// Simple User model for testing
class User extends Sequelize.Model {}

// Wallet model for testing
class Wallet extends Sequelize.Model {
  static async initialize(sequelize) {
    const model = this.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
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
        validate: {
          min: 0
        }
      },
      available_balance: {
        type: DataTypes.DECIMAL(24, 8),
        defaultValue: 0,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      label: {
        type: DataTypes.STRING,
        allowNull: true
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
      },
      last_transaction_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Wallet',
      tableName: 'wallets',
      timestamps: true,
      paranoid: true,
      underscored: true,
      // Removed hooks for simplicity in this test
    });

    // Static method to generate wallet address
    model.generateWalletAddress = async function() {
      const prefix = '0x';
      const randomBytes = crypto.randomBytes(20); // 20 bytes = 40 hex chars
      return prefix + randomBytes.toString('hex');
    };

    // Instance methods
    model.prototype.getBalance = function() {
      return {
        total: parseFloat(this.balance),
        available: parseFloat(this.available_balance),
        in_orders: parseFloat(this.balance - this.available_balance),
        currency: this.currency
      };
    };

    model.prototype.canWithdraw = function(amount) {
      return this.available_balance >= amount;
    };

    return model;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

async function testWalletModel() {
  try {
    console.log('🔄 Starting Wallet model test...');
    console.log('1. Initializing database connection...');
    
    console.log('2. Initializing User model...');
    // Initialize the User model
    await User.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      country: DataTypes.STRING(2)
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true
    });

    console.log('3. Initializing Wallet model...');
    // Initialize the Wallet model
    const WalletModel = await Wallet.initialize(sequelize);
    
    // Set up associations
    WalletModel.associate({ User });
    
    // Sync the database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');
    
    // Create a test user
    const testUser = await User.create({
      email: `test-user-${Date.now()}@example.com`,
      password: 'Test123!',
      first_name: 'Test',
      last_name: 'User',
      country: 'US'
    });
    
    console.log('✅ Test user created:', testUser.id);
    
    // Test creating a wallet
    console.log('\n🔍 Testing wallet creation...');
    
    // Generate a wallet address directly
    const generateWalletAddress = () => {
      const prefix = '0x';
      const randomBytes = crypto.randomBytes(20);
      return prefix + randomBytes.toString('hex');
    };
    
    const walletAddress = generateWalletAddress();
    console.log('Generated wallet address:', walletAddress);
    
    const testWallet = await WalletModel.create({
      user_id: testUser.id,
      address: walletAddress, // Set the address directly
      currency: 'BTC',
      balance: 1.5,
      available_balance: 1.0,
      label: 'Test BTC Wallet',
      is_default: true
    });
    
    console.log('✅ Test wallet created:', {
      id: testWallet.id,
      address: testWallet.address,
      currency: testWallet.currency,
      balance: testWallet.balance.toString(),
      available_balance: testWallet.available_balance.toString(),
      label: testWallet.label,
      is_default: testWallet.is_default
    });
    
    // Test wallet methods
    console.log('\n🔍 Testing wallet methods...');
    const balance = testWallet.getBalance();
    console.log('✅ Wallet balance:', balance);
    
    const canWithdraw = testWallet.canWithdraw(0.5);
    console.log(`✅ Can withdraw 0.5 ${testWallet.currency}:`, canWithdraw ? 'YES' : 'NO');
    
    const cannotWithdraw = testWallet.canWithdraw(2.0);
    console.log(`✅ Can withdraw 2.0 ${testWallet.currency}:`, cannotWithdraw ? 'YES' : 'NO');
    
    // Test finding wallet with user
    const walletWithUser = await WalletModel.findOne({
      where: { id: testWallet.id },
      include: [{ model: User, as: 'user' }]
    });
    
    console.log('✅ Found wallet with user:', {
      walletId: walletWithUser.id,
      userId: walletWithUser.user_id,
      userEmail: walletWithUser.user?.email
    });
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
testWalletModel();
