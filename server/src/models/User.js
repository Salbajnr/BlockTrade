
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import BaseModel from './BaseModel.js';

/**
 * User model representing a platform user
 * @extends BaseModel
 */
class User extends BaseModel {
  static initialize(sequelize) {
    const attributes = {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        },
        field: 'email'
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password',
        validate: {
          len: [8, 100],
          isStrongPassword: function(value) {
            if (!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
              throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
            }
          }
        }
      },
      first_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'first_name'
      },
      last_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'last_name'
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'country'
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false,
        field: 'role'
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_verified'
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
      }
    };

    const options = {
      sequelize,
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ['password'] }
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] }
        }
      }
    };

    return this.init(attributes, options);
  }

  // Add instance and static methods here
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  generateAuthToken() {
    const payload = {
      id: this.id,
      email: this.email,
      role: this.role
    };

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const options = { expiresIn: '24h' };

    return jwt.sign(payload, secret, options);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.deleted_at;
    return values;
  }
}

export default User;
