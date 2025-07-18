
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      walletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id'
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM('deposit', 'withdrawal', 'trade', 'fee', 'transfer'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending'
      },
      txHash: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      fee: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: true,
        defaultValue: 0
      },
      feeCurrency: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      deletedAt: {
        allowNull: true,
        type: DataTypes.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('transactions', ['walletId', 'createdAt']);
    await queryInterface.addIndex('transactions', ['userId', 'createdAt']);
    await queryInterface.addIndex('transactions', ['type', 'status']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['type']);
    await queryInterface.addIndex('transactions', ['txHash']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};
