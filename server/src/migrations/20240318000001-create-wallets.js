
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wallets', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      balance: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastTransactionAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      type: {
        type: DataTypes.ENUM('spot', 'margin'),
        defaultValue: 'spot'
      },
      status: {
        type: DataTypes.ENUM('active', 'frozen', 'closed'),
        defaultValue: 'active'
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
    await queryInterface.addIndex('wallets', ['userId', 'currency', 'type'], {
      unique: true
    });
    await queryInterface.addIndex('wallets', ['currency']);
    await queryInterface.addIndex('wallets', ['status']);
    await queryInterface.addIndex('wallets', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('wallets');
  }
};
