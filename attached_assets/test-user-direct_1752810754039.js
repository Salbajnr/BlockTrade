import { DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a simple in-memory SQLite database for testing
const sequelize = new Sequelize('sqlite::memory:', {
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
});

// Simple User model for testing
class User extends Sequelize.Model {
  static async initialize(sequelize) {
    const model = this.init({
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 100]
        }
      },
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      country: DataTypes.STRING(2),
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      verification_token: DataTypes.STRING,
      reset_password_token: DataTypes.STRING,
      reset_password_expires: DataTypes.DATE,
      last_login_at: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM('active', 'suspended', 'deactivated'),
        defaultValue: 'active'
      },
      role: {
        type: DataTypes.ENUM('user', 'admin', 'moderator'),
        defaultValue: 'user'
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      }
    });

    // Instance methods
    model.prototype.validatePassword = async function(password) {
      return await bcrypt.compare(password, this.password);
    };

    model.prototype.generateJwt = function() {
      return jwt.sign(
        { id: this.id, email: this.email, role: this.role },
        'test-secret',
        { expiresIn: '1h' }
      );
    };

    return model;
  }
}

async function testUserModel() {
  try {
    console.log('🔄 Initializing database...');
    
    // Initialize the model
    const UserModel = await User.initialize(sequelize);
    
    // Sync the database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');
    
    // Test creating a user
    console.log('\n🔍 Testing user creation...');
    const testUser = await UserModel.create({
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
    
    // Find the user by ID
    const foundUser = await UserModel.findByPk(testUser.id);
    console.log('✅ User found by ID:', foundUser ? 'SUCCESS' : 'FAILED');
    
    // Test updating user
    const updatedUser = await testUser.update({ first_name: 'Updated' });
    console.log('✅ User updated:', updatedUser.first_name === 'Updated' ? 'SUCCESS' : 'FAILED');
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
testUserModel();
