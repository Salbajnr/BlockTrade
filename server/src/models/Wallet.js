
import BaseModel from './BaseModel.js';
import crypto from 'crypto';

/**
 * Wallet model representing a user's cryptocurrency wallet
 * @extends BaseModel
 */
class Wallet extends BaseModel {
  static initialize(sequelize) {
    const { DataTypes } = sequelize.Sequelize;
    
    const attributes = {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        field: 'user_id'
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'currency'
      },
      balance: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        defaultValue: 0,
        field: 'balance',
        validate: {
          min: 0
        }
      },
      address: {
        type: DataTypes.STRING(255),
        unique: true,
        field: 'address',
        defaultValue: function() {
          return crypto.randomBytes(20).toString('hex');
        }
      },
      label: {
        type: DataTypes.STRING(100),
        field: 'label',
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      }
    };

    const options = {
      sequelize,
      tableName: 'wallets',
      timestamps: true,
      paranoid: true,
      underscored: true
    };

    return this.init(attributes, options);
  }

  // Add any wallet-specific instance or static methods here
  async deposit(amount) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.balance = parseFloat(this.balance) + parseFloat(amount);
    return this.save();
  }

  async withdraw(amount) {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (parseFloat(this.balance) < parseFloat(amount)) {
      throw new Error('Insufficient funds');
    }
    this.balance = parseFloat(this.balance) - parseFloat(amount);
    return this.save();
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.deleted_at;
    return values;
  }
}

export { Wallet };
export default Wallet;
