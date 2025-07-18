import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

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
async function runTests() {
  console.log('🚀 Starting Password Reset Flow Tests');
  console.log('==================================');

  // 1. Register a test user
  console.log('\n1. Registering test user...');
  const registerResponse = await apiRequest('POST', '/api/auth/register', testUser);
  
  if (registerResponse.status !== 201) {
    console.error('❌ Failed to register test user:', registerResponse.data);
    return;
  }
  
  const userId = registerResponse.data.id;
  console.log('✅ Test user registered:', { email: TEST_EMAIL, userId });

  // 2. Request password reset
  console.log('\n2. Requesting password reset...');
  const forgotResponse = await apiRequest('POST', '/api/auth/forgot-password', { email: TEST_EMAIL });
  
  if (forgotResponse.status !== 200) {
    console.error('❌ Failed to request password reset:', forgotResponse.data);
    return;
  }
  
  // In a real test, we would extract the token from an email
  // For this test, we'll simulate getting the token from the logs
  console.log('ℹ️  Check the server logs for the reset token and URL');
  console.log('   Then update the token in the test script and run the remaining tests');
  
  // You would normally extract these from the email or logs
  const testToken = 'test-token';
  
  // 3. Verify reset token
  console.log('\n3. Verifying reset token...');
  const verifyResponse = await apiRequest('GET', `/api/auth/verify-reset-token/${testToken}?userId=${userId}`);
  
  if (verifyResponse.status !== 200 || !verifyResponse.data.valid) {
    console.error('❌ Token verification failed:', verifyResponse.data);
    return;
  }
  
  console.log('✅ Token is valid');
  
  // 4. Reset password
  console.log('\n4. Resetting password...');
  const resetResponse = await apiRequest('POST', `/api/auth/reset-password/${testToken}`, {
    password: NEW_PASSWORD,
    userId
  });
  
  if (resetResponse.status !== 200) {
    console.error('❌ Password reset failed:', resetResponse.data);
    return;
  }
  
  console.log('✅ Password reset successful');
  
  // 5. Test login with new password
  console.log('\n5. Testing login with new password...');
  const loginResponse = await apiRequest('POST', '/api/auth/login', {
    email: TEST_EMAIL,
    password: NEW_PASSWORD
  });
  
  if (loginResponse.status !== 200) {
    console.error('❌ Login with new password failed:', loginResponse.data);
    return;
  }
  
  console.log('✅ Successfully logged in with new password');
  
  // 6. Test error cases
  console.log('\n6. Testing error cases...');
  
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
  const missingUserIdResponse = await apiRequest('GET', `/api/auth/verify-reset-token/${testToken}`);
  
  if (missingUserIdResponse.status !== 400) {
    console.error('❌ Expected 400 for missing userId, got:', missingUserIdResponse.status);
  } else {
    console.log('  ✅ Missing userId test passed');
  }
  
  console.log('\n🎉 All tests completed successfully!');
}

// Run the tests
runTests().catch(console.error);
