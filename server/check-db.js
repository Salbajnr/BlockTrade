
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize with the development configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blocktrade.db',
  logging: console.log,
});

async function checkDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
    
    // Get all tables in the database
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    
    console.log('\n📋 Database tables:');
    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      tables.forEach(table => {
        console.log(`- ${table.name}`);
      });
    }
    
    // Check if Users table exists
    const usersTableExists = tables.some(t => t.name === 'Users');
    
    if (usersTableExists) {
      console.log('\n🔍 Checking Users table structure...');
      
      // Get Users table info
      const [columns] = await sequelize.query('PRAGMA table_info(Users)');
      
      console.log('\n📋 Users table columns:');
      if (columns.length === 0) {
        console.log('No columns found in Users table.');
      } else {
        columns.forEach(col => {
          console.log(`- ${col.name} (${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''})`);
        });
      }
      
      // Check for password reset columns
      const hasResetToken = columns.some(col => col.name === 'reset_password_token');
      const hasResetExpires = columns.some(col => col.name === 'reset_password_expires');
      
      console.log('\n🔍 Password reset columns:');
      console.log(`- reset_password_token: ${hasResetToken ? '✅ Exists' : '❌ Missing'}`);
      console.log(`- reset_password_expires: ${hasResetExpires ? '✅ Exists' : '❌ Missing'}`);
      
      if (!hasResetToken || !hasResetExpires) {
        console.log('\n❌ Missing required columns for password reset functionality');
        console.log('Run the migration script to add the required columns:');
        console.log('  1. node run-migration.js');
      }
    } else {
      console.log('\n❌ Users table does not exist in the database.');
      console.log('The database needs to be initialized with the required tables.');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkDatabase();
