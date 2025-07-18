
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('wallets', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    currency: {
      type: Sequelize.STRING(10),
      allowNull: false
    },
    balance: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false,
      defaultValue: 0
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    last_transaction_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    type: {
      type: Sequelize.ENUM('spot', 'margin'),
      defaultValue: 'spot'
    },
    status: {
      type: Sequelize.ENUM('active', 'frozen', 'closed'),
      defaultValue: 'active'
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
  await queryInterface.addIndex('wallets', ['user_id', 'currency', 'type'], { unique: true });
  await queryInterface.addIndex('wallets', ['address'], { unique: true });
  await queryInterface.addIndex('wallets', ['status']);
  await queryInterface.addIndex('wallets', ['type']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('wallets');
}
