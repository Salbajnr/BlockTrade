
import BaseModel from './BaseModel.js';

/**
 * Order model representing trading orders in the system
 * @extends BaseModel
 */
class Order extends BaseModel {
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
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      trading_pair_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'trading_pair_id',
        references: {
          model: 'trading_pairs',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('limit', 'market', 'stop_limit'),
        allowNull: false,
        field: 'type'
      },
      side: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false,
        field: 'side'
      },
      price: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: true, // Null for market orders
        field: 'price'
      },
      amount: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'amount',
        validate: {
          min: 0.00000001
        }
      },
      filled: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        defaultValue: 0,
        field: 'filled'
      },
      status: {
        type: DataTypes.ENUM('open', 'partially_filled', 'filled', 'cancelled', 'rejected'),
        allowNull: false,
        defaultValue: 'open',
        field: 'status'
      },
      time_in_force: {
        type: DataTypes.ENUM('GTC', 'IOC', 'FOK'),
        defaultValue: 'GTC',
        field: 'time_in_force'
      },
      stop_price: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: true,
        field: 'stop_price'
      },
      average_price: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: true,
        field: 'average_price'
      },
      fee: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        defaultValue: 0,
        field: 'fee'
      },
      fee_currency: {
        type: DataTypes.STRING(10),
        field: 'fee_currency',
        allowNull: true
      },
      client_order_id: {
        type: DataTypes.STRING(50),
        field: 'client_order_id',
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        field: 'metadata',
        allowNull: true
      }
    };

    const options = {
      sequelize,
      tableName: 'orders',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: 'orders_user_id_idx',
          fields: ['user_id']
        },
        {
          name: 'orders_trading_pair_id_idx',
          fields: ['trading_pair_id']
        },
        {
          name: 'orders_status_idx',
          fields: ['status']
        },
        {
          name: 'orders_created_at_idx',
          fields: ['created_at']
        }
      ]
    };

    return this.init(attributes, options);
  }

  // Add any order-specific methods here
  async fill(amount) {
    const newFilled = parseFloat(this.filled) + parseFloat(amount);
    if (newFilled > parseFloat(this.amount)) {
      throw new Error('Cannot fill more than the order amount');
    }
    
    this.filled = newFilled;
    
    if (Math.abs(parseFloat(this.filled) - parseFloat(this.amount)) < 0.00000001) {
      this.status = 'filled';
    } else {
      this.status = 'partially_filled';
    }
    
    return this.save();
  }
  
  async cancel() {
    if (['filled', 'cancelled', 'rejected'].includes(this.status)) {
      throw new Error(`Cannot cancel order with status: ${this.status}`);
    }
    
    this.status = 'cancelled';
    return this.save();
  }
  
  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.deleted_at;
    return values;
  }
}

export { Order };
export default Order;
