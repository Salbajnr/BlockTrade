import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting simple test...');

// Create a simple in-memory SQLite database
const sequelize = new Sequelize('sqlite::memory:', {
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    paranoid: true
  }
});

// Define a simple User model
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
    validate: {
      isEmail: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users'
});

// Define a simple Wallet model
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
  balance: {
    type: DataTypes.DECIMAL(24, 8),
    defaultValue: 0
  }
}, {
  tableName: 'wallets'
});

// Set up associations
User.hasMany(Wallet, { foreignKey: 'userId' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

async function runTest() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    
    console.log('Creating test user...');
    const testUser = await User.create({
      email: `test-${Date.now()}@example.com`,
      name: 'Test User'
    });
    
    console.log('Creating test wallet...');
    const testWallet = await Wallet.create({
      userId: testUser.id,
      address: '0x' + Buffer.from(crypto.randomBytes(20)).toString('hex'),
      balance: 1.5
    });
    
    console.log('Test data created successfully!');
    console.log('User:', testUser.toJSON());
    console.log('Wallet:', testWallet.toJSON());
    
    // Test query
    const userWithWallets = await User.findByPk(testUser.id, {
      include: [Wallet]
    });
    
    console.log('\nUser with wallets:', {
      id: userWithWallets.id,
      email: userWithWallets.email,
      walletCount: userWithWallets.Wallets ? userWithWallets.Wallets.length : 0
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

runTest();
