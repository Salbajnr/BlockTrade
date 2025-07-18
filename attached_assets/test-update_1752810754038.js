import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize with the development configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blocktrade.db',
  logging: console.log,
});

// Define User model
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
  tableName: 'users', // Explicitly set the table name to match the database
  timestamps: true,
  underscored: true,
});

async function testUpdate() {
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
    
    // Generate a test token and expiry
    const testToken = 'test_token_' + Math.random().toString(36).substring(2, 15);
    const testExpiry = new Date(Date.now() + 3600000);
    
    console.log('\n🔄 Attempting to update user with test data...');
    console.log('User ID:', user.id);
    console.log('Test token:', testToken);
    console.log('Test expiry:', testExpiry);
    
    // Try to update the user
    const [updatedCount] = await User.update(
      {
        reset_password_token: testToken,
        reset_password_expires: testExpiry
      },
      {
        where: { id: user.id },
        returning: true,
        plain: true
      }
    );
    
    console.log('\n✅ Update result - Rows affected:', updatedCount);
    
    if (updatedCount === 0) {
      console.log('❌ No rows were updated. Trying with raw query...');
      
      // Try with raw query to see if it's a model issue
      const [result] = await sequelize.query(
        `UPDATE users 
         SET reset_password_token = ?, reset_password_expires = ? 
         WHERE id = ?`,
        {
          replacements: [testToken, testExpiry, user.id],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      
      console.log('Raw query result:', result);
      
      if (result === 0) {
        console.log('❌ Raw query also did not update any rows');
        // Check if the user ID exists with a different case
        const [users] = await sequelize.query(
          'SELECT id, email FROM users WHERE LOWER(id) = LOWER(?)',
          { replacements: [user.id] }
        );
        console.log('Users with similar ID:', users);
      } else {
        console.log('✅ Raw query updated user successfully');
      }
    }
    
    // Verify the update
    const updatedUser = await User.findByPk(user.id);
    console.log('\n🔍 User after update attempt:');
    console.log('- Reset token:', updatedUser.reset_password_token);
    console.log('- Token expiry:', updatedUser.reset_password_expires);
    
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

testUpdate();
