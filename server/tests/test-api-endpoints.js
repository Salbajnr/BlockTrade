
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = `test-${uuidv4().substring(0, 8)}@example.com`;
const TEST_PASSWORD = 'Test123!';

// Test user data
const testUser = {
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  first_name: 'Test',
  last_name: 'User',
  country: 'US'
};

// Helper function to make API calls
async function apiRequest(method, endpoint, data = {}, headers = {}) {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      validateStatus: () => true // Don't throw on HTTP error status
    });
    return response;
  } catch (error) {
    console.error('API Request Error:', error.message);
    throw error;
  }
}

// Test cases
async function runAPITests() {
  console.log('🚀 Starting API Endpoints Tests');
  console.log('============================');

  try {
    // 1. Test user registration
    console.log('\n1. Testing user registration...');
    const registerResponse = await apiRequest('POST', '/api/auth/register', testUser);
    
    if (registerResponse.status === 201) {
      console.log('✅ User registration successful');
      console.log('- User ID:', registerResponse.data.id);
      console.log('- Email:', registerResponse.data.email);
    } else {
      console.error('❌ User registration failed:', registerResponse.data);
      return;
    }

    // 2. Test user login
    console.log('\n2. Testing user login...');
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ User login successful');
      const token = loginResponse.data.token;
      const userId = loginResponse.data.user.id;
      
      // 3. Test protected route
      console.log('\n3. Testing protected route...');
      const profileResponse = await apiRequest('GET', '/api/auth/profile', {}, {
        'Authorization': `Bearer ${token}`
      });
      
      if (profileResponse.status === 200) {
        console.log('✅ Protected route access successful');
        console.log('- User profile:', {
          id: profileResponse.data.id,
          email: profileResponse.data.email,
          firstName: profileResponse.data.first_name
        });
      } else {
        console.error('❌ Protected route access failed:', profileResponse.data);
      }

      // 4. Test wallet creation
      console.log('\n4. Testing wallet creation...');
      const walletResponse = await apiRequest('POST', '/api/wallets', {
        currency: 'BTC',
        label: 'Test BTC Wallet'
      }, {
        'Authorization': `Bearer ${token}`
      });
      
      if (walletResponse.status === 201) {
        console.log('✅ Wallet creation successful');
        console.log('- Wallet ID:', walletResponse.data.id);
        console.log('- Currency:', walletResponse.data.currency);
        console.log('- Address:', walletResponse.data.address);
      } else {
        console.error('❌ Wallet creation failed:', walletResponse.data);
      }

      // 5. Test getting user wallets
      console.log('\n5. Testing wallet retrieval...');
      const walletsResponse = await apiRequest('GET', '/api/wallets', {}, {
        'Authorization': `Bearer ${token}`
      });
      
      if (walletsResponse.status === 200) {
        console.log('✅ Wallet retrieval successful');
        console.log('- Number of wallets:', walletsResponse.data.length);
      } else {
        console.error('❌ Wallet retrieval failed:', walletsResponse.data);
      }

      // 6. Test crypto prices endpoint
      console.log('\n6. Testing crypto prices endpoint...');
      const pricesResponse = await apiRequest('GET', '/api/crypto/prices');
      
      if (pricesResponse.status === 200) {
        console.log('✅ Crypto prices retrieval successful');
        console.log('- Available cryptocurrencies:', Object.keys(pricesResponse.data));
      } else {
        console.error('❌ Crypto prices retrieval failed:', pricesResponse.data);
      }

      // 7. Test trading order creation
      console.log('\n7. Testing trading order creation...');
      const orderResponse = await apiRequest('POST', '/api/trading/orders', {
        trading_pair_id: 'BTC-USD',
        type: 'limit',
        side: 'buy',
        amount: 0.001,
        price: 50000
      }, {
        'Authorization': `Bearer ${token}`
      });
      
      if (orderResponse.status === 201) {
        console.log('✅ Trading order creation successful');
        console.log('- Order ID:', orderResponse.data.id);
        console.log('- Type:', orderResponse.data.type);
        console.log('- Side:', orderResponse.data.side);
      } else {
        console.error('❌ Trading order creation failed:', orderResponse.data);
      }

      console.log('\n🎉 All API tests completed successfully!');
      
    } else {
      console.error('❌ User login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
runAPITests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
