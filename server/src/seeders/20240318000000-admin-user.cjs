
'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('users', [{
      id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
      email: 'admin@blocktrade.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      country: 'United States',
      role: 'admin',
      is_verified: true,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: 'admin@blocktrade.com'
    }, {});
  }
};
