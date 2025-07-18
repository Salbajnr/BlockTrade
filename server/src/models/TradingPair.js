
import BaseModel from './BaseModel.js';

/**
 * TradingPair model representing available trading pairs in the exchange
 * @extends BaseModel
 */
class TradingPair extends BaseModel {
  static initialize(sequelize) {
    const { DataTypes } = sequelize.Sequelize;
    
    const attributes = {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'name',
        unique: true,
        validate: {
          is: /^[A-Z0-9]+_[A-Z0-9]+$/ // Format: BASE_QUOTE (e.g., BTC_USDT)
        }
      },
      base_currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'base_currency',
        validate: {
          isUppercase: true,
          len: [2, 10]
        }
      },
      quote_currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'quote_currency',
        validate: {
          isUppercase: true,
          len: [2, 10]
        }
      },
      min_price: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'min_price',
        validate: {
          min: 0.00000001
        }
      },
      max_price: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'max_price',
        validate: {
          min: 0.00000001
        }
      },
      min_amount: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'min_amount',
        validate: {
          min: 0.00000001
        }
      },
      min_total: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'min_total',
        validate: {
          min: 0.00000001
        }
      },
      fee_percent: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        field: 'fee_percent',
        defaultValue: 0.001, // 0.1% default fee
        validate: {
          min: 0,
          max: 0.1 // Max 10% fee
        }
      },
      maker_fee_percent: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        field: 'maker_fee_percent',
        defaultValue: 0.0008, // 0.08% default maker fee
        validate: {
          min: 0,
          max: 0.1 // Max 10% fee
        }
      },
      taker_fee_percent: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: false,
        field: 'taker_fee_percent',
        defaultValue: 0.001, // 0.1% default taker fee
        validate: {
          min: 0,
          max: 0.1 // Max 10% fee
        }
      },
      price_precision: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'price_precision',
        defaultValue: 8,
        validate: {
          min: 0,
          max: 16
        }
      },
      amount_precision: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'amount_precision',
        defaultValue: 8,
        validate: {
          min: 0,
          max: 16
        }
      },
      min_notional: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        field: 'min_notional',
        defaultValue: 0.0001, // Minimum order value in quote currency
        validate: {
          min: 0.00000001
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_active',
        defaultValue: true
      },
      metadata: {
        type: DataTypes.JSONB,
        field: 'metadata',
        allowNull: true
      }
    };

    const options = {
      sequelize,
      tableName: 'trading_pairs',
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        {
          name: 'trading_pairs_name_idx',
          fields: ['name'],
          unique: true
        },
        {
          name: 'trading_pairs_base_currency_idx',
          fields: ['base_currency']
        },
        {
          name: 'trading_pairs_quote_currency_idx',
          fields: ['quote_currency']
        },
        {
          name: 'trading_pairs_is_active_idx',
          fields: ['is_active']
        }
      ]
    };

    return this.init(attributes, options);
  }

  // Calculate the trading fee for a given amount and maker/taker type
  calculateFee(amount, price, isMaker = false) {
    const feePercent = isMaker ? this.maker_fee_percent : this.taker_fee_percent;
    const total = parseFloat(amount) * parseFloat(price);
    return (total * parseFloat(feePercent)).toFixed(8);
  }

  // Validate if the price is within the allowed range
  isPriceValid(price) {
    const priceNum = parseFloat(price);
    return priceNum >= parseFloat(this.min_price) && priceNum <= parseFloat(this.max_price);
  }

  // Validate if the amount is above the minimum
  isAmountValid(amount) {
    return parseFloat(amount) >= parseFloat(this.min_amount);
  }

  // Validate if the total order value is above the minimum
  isTotalValid(amount, price) {
    const total = parseFloat(amount) * parseFloat(price);
    return total >= parseFloat(this.min_notional);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.deleted_at;
    return values;
  }
}

export { TradingPair };
export default TradingPair;
