
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// Import models
import { User, sequelize } from '../src/models/index.js';

async function testUserModel() {
  console.log('🔄 Testing User model...');
  
  try {
    // Test creating a new user
    const testUser = await User.create({
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!',
      first_name: 'Test',
      last_name: 'User',
      country: 'US'
    });
    
    console.log('✅ Test user created:', {
      id: testUser.id,
      email: testUser.email,
      firstName: testUser.first_name,
      lastName: testUser.last_name,
      country: testUser.country,
      isEmailVerified: testUser.is_email_verified,
      createdAt: testUser.created_at
    });
    
    // Test password hashing
    const isPasswordValid = await testUser.validatePassword('Test123!');
    console.log('✅ Password validation:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // Test JWT generation
    const token = testUser.generateJwt();
    console.log('✅ JWT token generated:', token ? 'SUCCESS' : 'FAILED');
    
    // Test email verification token
    const verificationToken = testUser.generateVerificationToken();
    console.log('✅ Email verification token generated:', verificationToken ? 'SUCCESS' : 'FAILED');
    
    // Test password reset token
    const resetToken = testUser.generateResetToken();
    console.log('✅ Password reset token generated:', resetToken ? 'SUCCESS' : 'FAILED');
    
    // Find the user by ID
    const foundUser = await User.findByPk(testUser.id);
    console.log('✅ User found by ID:', foundUser ? 'SUCCESS' : 'FAILED');
    
    // Test updating user
    const updatedUser = await testUser.update({ first_name: 'Updated' });
    console.log('✅ User updated:', updatedUser.first_name === 'Updated' ? 'SUCCESS' : 'FAILED');
    
    // Test soft delete
    await testUser.destroy();
    const deletedUser = await User.findByPk(testUser.id, { paranoid: false });
    console.log('✅ User soft deleted:', 
      deletedUser && deletedUser.deleted_at !== null ? 'SUCCESS' : 'FAILED');
    
    // Permanently delete the test user
    await testUser.destroy({ force: true });
    
    console.log('\n✅ All User model tests completed successfully!');
  } catch (error) {
    console.error('❌ Error testing User model:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
testUserModel();
