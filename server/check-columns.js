
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize with the development configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blocktrade.db',
  logging: console.log,
});

async function checkColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
    
    // Get all columns in the users table
    const [columns] = await sequelize.query(
      "SELECT name, type, " +
      "       CASE WHEN pk = 1 THEN 'PRIMARY KEY' ELSE '' END as key_type, " +
      "       CASE WHEN [notnull] = 1 THEN 'NOT NULL' ELSE 'NULL' END as nullable " +
      "FROM pragma_table_info('users')"
    );
    
    console.log('\n📋 All columns in users table:');
    console.table(columns);
    
    // Try to find columns with similar names (case insensitive)
    const [similarColumns] = await sequelize.query(
      "SELECT name, type FROM pragma_table_info('users') WHERE " +
      "LOWER(name) LIKE '%reset%' OR LOWER(name) LIKE '%token%' OR LOWER(name) LIKE '%expire%'"
    );
    
    if (similarColumns.length > 0) {
      console.log('\n🔍 Found similar columns:');
      console.table(similarColumns);
    } else {
      console.log('\n❌ No similar columns found. The migration might not have been applied correctly.');
    }
    
    // Try to add the columns manually to see the error
    try {
      console.log('\nAttempting to add reset_password_token column...');
      await sequelize.query('ALTER TABLE users ADD COLUMN reset_password_token TEXT');
      console.log('✅ Successfully added reset_password_token column');
    } catch (error) {
      console.log('❌ Error adding reset_password_token column:', error.message);
    }
    
    try {
      console.log('\nAttempting to add reset_password_expires column...');
      await sequelize.query('ALTER TABLE users ADD COLUMN reset_password_expires DATETIME');
      console.log('✅ Successfully added reset_password_expires column');
    } catch (error) {
      console.log('❌ Error adding reset_password_expires column:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking columns:', error);
  } finally {
    await sequelize.close();
  }
}

checkColumns();
