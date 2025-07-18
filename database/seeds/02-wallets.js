
export async function up(queryInterface, Sequelize) {
  // First get user IDs
  const users = await queryInterface.sequelize.query(
    "SELECT id, email FROM users WHERE email IN ('admin@blocktrade.com', 'test@blocktrade.com')",
    { type: Sequelize.QueryTypes.SELECT }
  );
  
  const adminUser = users.find(u => u.email === 'admin@blocktrade.com');
  const testUser = users.find(u => u.email === 'test@blocktrade.com');

  if (!adminUser || !testUser) {
    throw new Error('Required users not found. Please run user seeds first.');
  }

  await queryInterface.bulkInsert('wallets', [
    // Admin wallets
    {
      user_id: adminUser.id,
      currency: 'BTC',
      balance: 10.0,
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      type: 'spot',
      status: 'active',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: adminUser.id,
      currency: 'ETH',
      balance: 100.0,
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      type: 'spot',
      status: 'active',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: adminUser.id,
      currency: 'USDT',
      balance: 10000.0,
      address: 'TXyz123456789',
      type: 'spot',
      status: 'active',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Test user wallets
    {
      user_id: testUser.id,
      currency: 'BTC',
      balance: 1.0,
      address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      type: 'spot',
      status: 'active',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: testUser.id,
      currency: 'ETH',
      balance: 10.0,
      address: '0x123456789abcdef',
      type: 'spot',
      status: 'active',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: testUser.id,
      currency: 'USDT',
      balance: 1000.0,
      address: 'TXabc123456789',
      type: 'spot',
      status: 'active',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ], {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('wallets', {
    address: [
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      'TXyz123456789',
      '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      '0x123456789abcdef',
      'TXabc123456789'
    ]
  }, {});
}
