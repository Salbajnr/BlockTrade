
export async function up(queryInterface, Sequelize) {
  // Get users and wallets
  const users = await queryInterface.sequelize.query(
    "SELECT id, email FROM users WHERE email IN ('admin@blocktrade.com', 'test@blocktrade.com')",
    { type: Sequelize.QueryTypes.SELECT }
  );
  
  const testUser = users.find(u => u.email === 'test@blocktrade.com');
  
  if (!testUser) {
    throw new Error('Test user not found. Please run user seeds first.');
  }

  const wallets = await queryInterface.sequelize.query(
    `SELECT id, currency FROM wallets WHERE user_id = ${testUser.id}`,
    { type: Sequelize.QueryTypes.SELECT }
  );

  const btcWallet = wallets.find(w => w.currency === 'BTC');
  const ethWallet = wallets.find(w => w.currency === 'ETH');

  if (!btcWallet || !ethWallet) {
    throw new Error('Required wallets not found. Please run wallet seeds first.');
  }

  await queryInterface.bulkInsert('transactions', [
    // Initial deposit for BTC wallet
    {
      user_id: testUser.id,
      wallet_id: btcWallet.id,
      type: 'deposit',
      amount: 1.0,
      currency: 'BTC',
      status: 'completed',
      fee: 0.0001,
      fee_currency: 'BTC',
      description: 'Initial BTC deposit',
      tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
      processed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    // Initial deposit for ETH wallet
    {
      user_id: testUser.id,
      wallet_id: ethWallet.id,
      type: 'deposit',
      amount: 10.0,
      currency: 'ETH',
      status: 'completed',
      fee: 0.001,
      fee_currency: 'ETH',
      description: 'Initial ETH deposit',
      tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
      processed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    // Sample trade transaction
    {
      user_id: testUser.id,
      wallet_id: btcWallet.id,
      type: 'trade',
      amount: 0.1,
      currency: 'BTC',
      status: 'completed',
      fee: 0.0001,
      fee_currency: 'BTC',
      description: 'BTC/USDT trade',
      tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
      processed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }
  ], {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('transactions', {
    description: ['Initial BTC deposit', 'Initial ETH deposit', 'BTC/USDT trade']
  }, {});
}
