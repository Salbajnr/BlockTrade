
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize with the development configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blocktrade.db',
  logging: console.log,
});

async function checkUsersTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
    
    // Check if users table exists (case insensitive)
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND LOWER(name) = 'users'");
    
    if (tables.length === 0) {
      console.log('❌ users table does not exist in the database.');
      return;
    }
    
    console.log('\n🔍 Found users table. Checking structure...');
    
    // Get users table columns
    const [columns] = await sequelize.query('PRAGMA table_info(users)');
    
    console.log('\n📋 users table columns:');
    if (columns.length === 0) {
      console.log('No columns found in users table.');
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
    
    // Show sample data (first 5 rows)
    try {
      const [rows] = await sequelize.query('SELECT * FROM users LIMIT 5');
      console.log('\n📊 Sample user data (first 5 rows):');
      console.table(rows);
    } catch (err) {
      console.error('\n❌ Error fetching sample data:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking users table:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkUsersTable();
