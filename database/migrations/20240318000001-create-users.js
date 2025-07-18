
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    first_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    last_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: true
    },
    role: {
      type: Sequelize.ENUM('user', 'admin'),
      defaultValue: 'user'
    },
    is_email_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    is_phone_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    is_2fa_enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    two_factor_secret: {
      type: Sequelize.STRING,
      allowNull: true
    },
    kyc_status: {
      type: Sequelize.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
    },
    last_login_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('active', 'suspended', 'banned'),
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
  await queryInterface.addIndex('users', ['email'], { unique: true });
  await queryInterface.addIndex('users', ['phone'], { unique: true });
  await queryInterface.addIndex('users', ['status']);
  await queryInterface.addIndex('users', ['role']);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('users');
}
