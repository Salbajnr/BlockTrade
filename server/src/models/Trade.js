
import BaseModel from './BaseModel.js';

/**
 * Trade model representing executed trades in the system
 * @extends BaseModel
 */
class Trade extends BaseModel {
  static initialize(sequelize) {
    const { DataTypes } = sequelize.Sequelize;
    
    const attributes = {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      buy_order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'buy_order_id',
        references: {
          model: 'orders',
          key: 'id'
        }
      },
      sell_order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'sell_order_id',
        references: {
          model: 'orders',
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
      price: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'price',
        validate: {
          min: 0.00000001
        }
      },
      amount: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'amount',
        validate: {
          min: 0.00000001
        }
      },
      fee: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'fee',
        defaultValue: 0
      },
      fee_currency: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'fee_currency'
      },
      taker_side: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false,
        field: 'taker_side'
      },
      maker_order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'maker_order_id',
        references: {
          model: 'orders',
          key: 'id'
        }
      },
      taker_order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'taker_order_id',
        references: {
          model: 'orders',
          key: 'id'
        }
      },
      buyer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'buyer_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      seller_id: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'seller_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      metadata: {
        type: DataTypes.JSONB,
        field: 'metadata',
        allowNull: true
      }
    };

    const options = {
      sequelize,
      tableName: 'trades',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: 'trades_buy_order_id_idx',
          fields: ['buy_order_id']
        },
        {
          name: 'trades_sell_order_id_idx',
          fields: ['sell_order_id']
        },
        {
          name: 'trades_trading_pair_id_idx',
          fields: ['trading_pair_id']
        },
        {
          name: 'trades_created_at_idx',
          fields: ['created_at']
        },
        {
          name: 'trades_buyer_id_idx',
          fields: ['buyer_id']
        },
        {
          name: 'trades_seller_id_idx',
          fields: ['seller_id']
        }
      ]
    };

    return this.init(attributes, options);
  }

  // Calculate the total value of the trade (price * amount)
  getValue() {
    return parseFloat(this.price) * parseFloat(this.amount);
  }

  // Calculate the fee amount for a given side
  getFeeAmount() {
    return this.fee || 0;
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.deleted_at;
    return values;
  }
}

export { Trade };
export default Trade;
