
export async function up(queryInterface, Sequelize) {
  await queryInterface.bulkInsert('users', [
    {
      email: 'admin@blocktrade.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/IpG', // Admin@123
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_email_verified: true,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      email: 'test@blocktrade.com',
      password: '$2b$10$KIXqT3tRlGr5TvV8OQBHvOXvR8zKgK5RK5Kx5Kx5Kx5Kx5Kx5Kx5K', // Test@123
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      is_email_verified: true,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }
  ], {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('users', {
    email: ['admin@blocktrade.com', 'test@blocktrade.com']
  }, {});
}
