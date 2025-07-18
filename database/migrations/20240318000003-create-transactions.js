
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('transactions', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    wallet_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    order_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    type: {
      type: Sequelize.ENUM('deposit', 'withdrawal', 'trade', 'fee', 'transfer'),
      allowNull: false
    },
    amount: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING(10),
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    tx_hash: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    fee: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: 0
    },
    fee_currency: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    processed_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Add indexes
  await queryInterface.addIndex('transactions', ['wallet_id', 'created_at']);
  await queryInterface.addIndex('transactions', ['user_id', 'created_at']);
  await queryInterface.addIndex('transactions', ['type', 'status']);
  await queryInterface.addIndex('transactions', ['tx_hash'], { unique: true });
  await queryInterface.addIndex('transactions', ['order_id']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('transactions');
}
