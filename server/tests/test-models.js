
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Import models
let models;
try {
  models = await import('../src/models/index.js');
} catch (error) {
  console.error('❌ Failed to import models:', error);
  process.exit(1);
}

const { sequelize, initModels, syncDatabase } = models;

async function testDatabase() {
  try {
    console.log('🔄 Initializing database connection...');
    
    // Initialize models
    const models = await initModels();
    console.log('✅ Models initialized');
    
    // Sync database
    await syncDatabase({ alter: true });
    
    console.log('\n🔍 Testing User model...');
    // Test User model
    const testUser = await models.User.create({
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!',
      first_name: 'Test',
      last_name: 'User',
      country: 'US'
    });
    console.log('✅ Test user created:', testUser.toJSON());
    
    // Test wallet creation
    console.log('\n🔍 Testing Wallet creation...');
    const wallet = await models.Wallet.create({
      user_id: testUser.id,
      currency: 'BTC',
      balance: 1.5,
      label: 'Test BTC Wallet'
    });
    console.log('✅ Test wallet created:', wallet.toJSON());
    
    // Test transaction creation
    console.log('\n🔍 Testing Transaction creation...');
    const transaction = await models.Transaction.create({
      user_id: testUser.id,
      wallet_id: wallet.id,
      type: 'deposit',
      amount: 0.5,
      currency: 'BTC',
      status: 'completed',
      description: 'Test deposit'
    });
    console.log('✅ Test transaction created:', transaction.toJSON());
    
    // Test model methods
    console.log('\n🔍 Testing model methods...');
    const isValidPassword = await testUser.validatePassword('Test123!');
    console.log('✅ Password validation:', isValidPassword ? 'PASSED' : 'FAILED');
    
    const jwtToken = testUser.generateJwt();
    console.log('✅ JWT token generated:', jwtToken ? 'PASSED' : 'FAILED');
    
    // Test associations
    console.log('\n🔍 Testing model associations...');
    const userWithWallets = await models.User.findByPk(testUser.id, {
      include: [
        { model: models.Wallet, as: 'wallets' },
        { model: models.Transaction, as: 'transactions' }
      ]
    });
    
    console.log('✅ User with wallets and transactions:', {
      id: userWithWallets.id,
      email: userWithWallets.email,
      walletCount: userWithWallets.wallets?.length || 0,
      transactionCount: userWithWallets.transactions?.length || 0
    });
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run the tests
testDatabase();
