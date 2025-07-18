
const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add reset_password_token column
      await queryInterface.addColumn('Users', 'reset_password_token', {
        type: Sequelize.STRING,
        allowNull: true
      });
      
      // Add reset_password_expires column
      await queryInterface.addColumn('Users', 'reset_password_expires', {
        type: Sequelize.DATE,
        allowNull: true
      });
      
      console.log('Successfully added password reset columns to Users table');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Users', 'reset_password_token');
      await queryInterface.removeColumn('Users', 'reset_password_expires');
      console.log('Successfully removed password reset columns from Users table');
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
};
