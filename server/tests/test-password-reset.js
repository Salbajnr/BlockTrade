
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com';
const NEW_PASSWORD = 'NewPassword@123';

async function testPasswordReset() {
  console.log('=== Testing Password Reset Flow ===\n');

  try {
    // 1. Request password reset
    console.log('1. Requesting password reset...');
    const forgotResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: TEST_EMAIL
    }, {
      validateStatus: (status) => status < 500 // Don't throw for 4xx errors
    });

    console.log('Response status:', forgotResponse.status);
    console.log('Response data:', JSON.stringify(forgotResponse.data, null, 2));

    if (!forgotResponse.data || !forgotResponse.data.success) {
      throw new Error(forgotResponse.data?.message || 'Failed to send password reset email');
    }

    // In a real scenario, you would extract the token from the email
    // For testing, we'll get it from the response (only in development)
    const resetUrl = forgotResponse.data.resetUrl;
    if (!resetUrl) {
      throw new Error('No reset URL in response');
    }

    console.log('Reset URL:', resetUrl);

    // Extract token and user ID from the reset URL (for testing purposes)
    const tokenMatch = resetUrl.match(/token=([^&]+)/);
    const userIdMatch = resetUrl.match(/id=([^&]+)/);

    if (!tokenMatch || !userIdMatch) {
      throw new Error('Could not extract token or user ID from reset URL');
    }

    const token = tokenMatch[1];
    const userId = userIdMatch[1];

    console.log('Extracted token:', token);
    console.log('Extracted user ID:', userId);

    // 2. Verify the reset token
    console.log('\n2. Verifying reset token...');
    const verifyResponse = await axios.get(`${BASE_URL}/auth/verify-reset-token/${token}`, {
      params: { userId },
      validateStatus: (status) => status < 500 // Don't throw for 4xx errors
    });

    console.log('Token verification status:', verifyResponse.status);
    console.log('Token verification response:', JSON.stringify(verifyResponse.data, null, 2));

    if (!verifyResponse.data || !verifyResponse.data.valid) {
      throw new Error(verifyResponse.data?.message || 'Invalid or expired reset token');
    }

    // 3. Reset the password
    console.log('\n3. Resetting password...');
    const newPassword = NEW_PASSWORD;

    const resetResponse = await axios.post(
      `${BASE_URL}/auth/reset-password/${token}`,
      { userId, password: newPassword },
      { validateStatus: (status) => status < 500 }
    );

    console.log('Password reset status:', resetResponse.status);
    console.log('Password reset response:', JSON.stringify(resetResponse.data, null, 2));

    if (!resetResponse.data || !resetResponse.data.success) {
      throw new Error(resetResponse.data?.message || 'Failed to reset password');
    }

    // 4. Testing login with new password...
    console.log('\n4. Testing login with new password...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: newPassword
    });

    console.log('Login response:', JSON.stringify({
      success: true,
      user: {
        id: loginResponse.data.user.id,
        email: loginResponse.data.user.email,
        role: loginResponse.data.user.role
      },
      token: `${loginResponse.data.token.substring(0, 20)}...`
    }, null, 2));

    console.log('\n✅ Password reset test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPasswordReset();
