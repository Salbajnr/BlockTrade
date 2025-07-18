
import BaseModel from './BaseModel.js';

/**
 * Transaction model representing financial transactions in the system
 * @extends BaseModel
 */
class Transaction extends BaseModel {
  static initialize(sequelize) {
    const { DataTypes } = sequelize.Sequelize;
    
    const attributes = {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      wallet_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'wallet_id',
        references: {
          model: 'wallets',
          key: 'id'
        }
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('deposit', 'withdrawal', 'trade', 'fee', 'transfer'),
        allowNull: false,
        field: 'type'
      },
      amount: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'amount',
        validate: {
          min: 0
        }
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'currency'
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending',
        field: 'status'
      },
      tx_hash: {
        type: DataTypes.STRING(255),
        field: 'tx_hash',
        allowNull: true
      },
      fee: {
        type: DataTypes.DECIMAL(24, 8),
        field: 'fee',
        defaultValue: 0,
        allowNull: false
      },
      fee_currency: {
        type: DataTypes.STRING(10),
        field: 'fee_currency',
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        field: 'description',
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        field: 'metadata',
        allowNull: true
      },
      confirmed_at: {
        type: DataTypes.DATE,
        field: 'confirmed_at',
        allowNull: true
      }
    };

    const options = {
      sequelize,
      tableName: 'transactions',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: 'transactions_user_id_idx',
          fields: ['user_id']
        },
        {
          name: 'transactions_wallet_id_idx',
          fields: ['wallet_id']
        },
        {
          name: 'transactions_status_idx',
          fields: ['status']
        },
        {
          name: 'transactions_created_at_idx',
          fields: ['created_at']
        }
      ]
    };

    return this.init(attributes, options);
  }

  // Add any transaction-specific methods here
  async markAsCompleted() {
    this.status = 'completed';
    this.confirmed_at = new Date();
    return this.save();
  }

  async markAsFailed() {
    this.status = 'failed';
    return this.save();
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.deleted_at;
    return values;
  }
}

export { Transaction };
export default Transaction;
