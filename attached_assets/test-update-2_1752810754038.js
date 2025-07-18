import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize with the development configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blocktrade.db',
  logging: console.log,
});

// Define User model to match the database
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  country: DataTypes.STRING,
  role: DataTypes.STRING,
  is_verified: DataTypes.BOOLEAN,
  last_login: DataTypes.DATE,
  status: DataTypes.STRING,
  reset_password_token: DataTypes.STRING,
  reset_password_expires: DataTypes.DATE,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

async function testPasswordResetFlow() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
    
    // Get the first user
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ No users found in the database');
      return;
    }
    
    console.log('\n🔍 Found user:', {
      id: user.id,
      email: user.email,
      reset_token: user.reset_password_token,
      reset_expires: user.reset_password_expires
    });
    
    // Simulate the password reset token generation
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    console.log('\n🔑 Generated reset token:');
    console.log('- Plain token:', resetToken);
    console.log('- Hashed token:', hashedToken);
    console.log('- Token expiry:', new Date(resetTokenExpiry).toISOString());
    
    // Try to update the user with the reset token using the same approach as the server
    console.log('\n🔄 Attempting to update user with reset token...');
    
    // First, verify the user exists
    const userToUpdate = await User.findByPk(user.id);
    if (!userToUpdate) {
      throw new Error('User not found in database');
    }
    
    console.log('📝 User found, updating with reset token...');
    
    // Update the user with the reset token
    const [updatedCount] = await User.update(
      {
        reset_password_token: hashedToken,
        reset_password_expires: new Date(resetTokenExpiry)
      },
      {
        where: { id: user.id },
        returning: true
      }
    );
    
    console.log('✅ Update result - Rows affected:', updatedCount);
    
    if (updatedCount === 0) {
      throw new Error('Failed to update user with reset token - no rows affected');
    }
    
    // Verify the update was successful
    const updatedUser = await User.findByPk(user.id);
    console.log('\n🔍 User after update:');
    console.log('- Reset token set:', !!updatedUser.reset_password_token);
    console.log('- Token expiry set:', updatedUser.reset_password_expires);
    
    console.log('\n✅ Password reset token updated successfully!');
    
  } catch (error) {
    console.error('❌ Error during test:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
  } finally {
    await sequelize.close();
  }
}

testPasswordResetFlow();
