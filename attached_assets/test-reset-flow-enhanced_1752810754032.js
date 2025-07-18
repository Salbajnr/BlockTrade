import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `test-${uuidv4().substring(0, 8)}@example.com`;
const TEST_PASSWORD = 'Test123!';
const NEW_PASSWORD = 'NewSecurePassword123!';

// Test user data
const testUser = {
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
  first_name: 'Test',
  last_name: 'User',
  country: 'Testland'
};

// Store the reset token and hashed token
let resetToken = '';
let hashedToken = '';
let userId = '';

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

// Function to generate the same hash as the server
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Test cases
async function runTests() {
  console.log('🚀 Starting Enhanced Password Reset Flow Tests');
  console.log('===========================================');

  try {
    // 1. Register a test user
    console.log('\n1. Registering test user...');
    const registerResponse = await apiRequest('POST', '/api/auth/register', testUser);
    
    if (registerResponse.status !== 201) {
      if (registerResponse.status === 400 && registerResponse.data.message === 'Email already in use') {
        console.log('ℹ️  Test user already exists, using existing user...');
        // Try to log in to get the user ID
        const loginResponse = await apiRequest('POST', '/api/auth/login', {
          email: testUser.email,
          password: testUser.password
        });
        
        if (loginResponse.status !== 200) {
          throw new Error('Failed to log in with test user');
        }
        
        userId = loginResponse.data.id;
      } else {
        throw new Error(`Failed to register test user: ${JSON.stringify(registerResponse.data)}`);
      }
    } else {
      userId = registerResponse.data.id;
      console.log('✅ Test user registered:', { email: TEST_EMAIL, userId });
    }

    // 2. Request password reset
    console.log('\n2. Requesting password reset...');
    const forgotResponse = await apiRequest('POST', '/api/auth/forgot-password', { email: TEST_EMAIL });
    
    if (forgotResponse.status !== 200) {
      throw new Error(`Failed to request password reset: ${JSON.stringify(forgotResponse.data)}`);
    }
    
    // 3. Generate a test token and its hash (in a real scenario, this would come from the email)
    resetToken = crypto.randomBytes(32).toString('hex');
    hashedToken = hashToken(resetToken);
    
    // 4. Manually update the user's reset token in the database
    console.log('\n3. Manually setting reset token for testing...');
    const [updated] = await sequelize.query(
      `UPDATE users SET reset_password_token = :hashedToken, 
       reset_password_expires = DATETIME('now', '+1 hour') 
       WHERE id = :userId`,
      {
        replacements: { hashedToken, userId },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    if (updated === 0) {
      throw new Error('Failed to update user with reset token');
    }
    console.log('✅ Reset token set for user');

    // 5. Verify reset token
    console.log('\n4. Verifying reset token...');
    const verifyResponse = await apiRequest('GET', `/api/auth/verify-reset-token/${resetToken}?userId=${userId}`);
    
    if (verifyResponse.status !== 200 || !verifyResponse.data.valid) {
      throw new Error(`Token verification failed: ${JSON.stringify(verifyResponse.data)}`);
    }
    
    console.log('✅ Token is valid');
    
    // 6. Reset password
    console.log('\n5. Resetting password...');
    const resetResponse = await apiRequest('POST', `/api/auth/reset-password/${resetToken}`, {
      password: NEW_PASSWORD,
      userId
    });
    
    if (resetResponse.status !== 200) {
      throw new Error(`Password reset failed: ${JSON.stringify(resetResponse.data)}`);
    }
    
    console.log('✅ Password reset successful');
    
    // 7. Test login with new password
    console.log('\n6. Testing login with new password...');
    const loginResponse = await apiRequest('POST', '/api/auth/login', {
      email: TEST_EMAIL,
      password: NEW_PASSWORD
    });
    
    if (loginResponse.status !== 200) {
      throw new Error(`Login with new password failed: ${JSON.stringify(loginResponse.data)}`);
    }
    
    console.log('✅ Successfully logged in with new password');
    
    // 8. Test error cases
    console.log('\n7. Testing error cases...');
    
    // Test with invalid token
    console.log('  - Testing with invalid token...');
    const invalidTokenResponse = await apiRequest('GET', `/api/auth/verify-reset-token/invalid-token?userId=${userId}`);
    
    if (invalidTokenResponse.status !== 400) {
      console.error('❌ Expected 400 for invalid token, got:', invalidTokenResponse.status);
    } else {
      console.log('  ✅ Invalid token test passed');
    }
    
    // Test with missing userId
    console.log('  - Testing with missing userId...');
    const missingUserIdResponse = await apiRequest('GET', `/api/auth/verify-reset-token/${resetToken}`);
    
    if (missingUserIdResponse.status !== 400) {
      console.error('❌ Expected 400 for missing userId, got:', missingUserIdResponse.status);
    } else {
      console.log('  ✅ Missing userId test passed');
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Import sequelize for direct database operations
import { Sequelize } from 'sequelize';

// Initialize Sequelize with the same config as the server
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blocktrade.sqlite',
  logging: false
});

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
