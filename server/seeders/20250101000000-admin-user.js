
'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    return queryInterface.bulkInsert('users', [{
      email: 'admin@blocktrade.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      country: 'United States',
      role: 'admin',
      email_verified: true,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', { email: 'admin@blocktrade.com' });
  }
};
