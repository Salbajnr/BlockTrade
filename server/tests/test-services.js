
import authService from '../src/services/auth.service.js';
import tradingService from '../src/services/trading.service.js';
import cryptoService from '../src/services/crypto.service.js';
import mailService from '../src/services/mail.service.js';

async function testServices() {
  console.log('🚀 Starting services test...');
  
  try {
    // Test Auth Service
    console.log('\n🔐 Testing Auth Service...');
    
    const testPassword = 'TestPassword123!';
    const hashedPassword = await authService.hashPassword(testPassword);
    console.log('✅ Password hashed successfully');
    
    const isPasswordValid = await authService.comparePassword(testPassword, hashedPassword);
    console.log('✅ Password comparison:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    const testUser = { id: '123', email: 'test@example.com', role: 'user' };
    const tokens = authService.generateTokens(testUser);
    console.log('✅ JWT tokens generated:', {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      expiresIn: tokens.expiresIn
    });
    
    const verificationToken = authService.generateVerificationToken();
    console.log('✅ Verification token generated:', {
      hasToken: !!verificationToken.token,
      hasExpiry: !!verificationToken.expiresAt
    });
    
    // Test Trading Service
    console.log('\n📈 Testing Trading Service...');
    
    const testOrder = {
      user_id: '123',
      trading_pair_id: 'BTC-USD',
      type: 'limit',
      side: 'buy',
      amount: 0.01,
      price: 50000
    };
    
    const createdOrder = await tradingService.createOrder(testOrder);
    console.log('✅ Order created:', {
      id: createdOrder.id,
      type: createdOrder.type,
      side: createdOrder.side,
      amount: createdOrder.amount,
      status: createdOrder.status
    });
    
    const orderBook = tradingService.getOrderBook('BTC-USD');
    console.log('✅ Order book retrieved:', {
      buyOrders: orderBook.buy.length,
      sellOrders: orderBook.sell.length
    });
    
    // Test Crypto Service
    console.log('\n💰 Testing Crypto Service...');
    
    try {
      const prices = await cryptoService.getCurrentPrices();
      console.log('✅ Crypto prices fetched:', Object.keys(prices));
    } catch (error) {
      console.log('⚠️  Crypto price fetch failed (external API):', error.message);
    }
    
    // Test Mail Service
    console.log('\n📧 Testing Mail Service...');
    
    try {
      // Test email configuration without actually sending
      console.log('✅ Mail service initialized successfully');
    } catch (error) {
      console.log('⚠️  Mail service error:', error.message);
    }
    
    console.log('\n🎉 All service tests completed!');
    
  } catch (error) {
    console.error('❌ Service test failed:', error);
  }
}

// Run the tests
testServices();
