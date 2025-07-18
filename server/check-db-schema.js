
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'blocktrade.sqlite',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
  },
});

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
    
    // Get table info
    const [results] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='Users'");
    
    if (results.length === 0) {
      console.error('❌ Users table does not exist');
      return;
    }
    
    console.log('\n🔍 Users table schema:');
    console.log(results[0].sql);
    
    // Check if reset_password_token and reset_password_expires columns exist
    const [columns] = await sequelize.query("PRAGMA table_info(Users)");
    const hasResetToken = columns.some(col => col.name === 'reset_password_token');
    const hasResetExpires = columns.some(col => col.name === 'reset_password_expires');
    
    console.log('\n🔍 Password reset columns:');
    console.log(`- reset_password_token: ${hasResetToken ? '✅ Exists' : '❌ Missing'}`);
    console.log(`- reset_password_expires: ${hasResetExpires ? '✅ Exists' : '❌ Missing'}`);
    
    if (!hasResetToken || !hasResetExpires) {
      console.log('\n❌ Missing required columns for password reset functionality');
      console.log('Run the migration script to add the required columns:');
      console.log('  1. node run-migration.js');
    } else {
      console.log('\n✅ All required columns for password reset exist');
    }
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
