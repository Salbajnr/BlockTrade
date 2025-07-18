
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'blocktrade.sqlite'),
  logging: console.log
});

async function runMigration() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Starting migration...');
    
    // Add reset_password_token column if it doesn't exist
    await sequelize.query(
      'PRAGMA table_info(users);',
      { transaction }
    ).then(async ([results]) => {
      const hasResetToken = results.some(col => col.name === 'reset_password_token');
      if (!hasResetToken) {
        await sequelize.query(
          'ALTER TABLE users ADD COLUMN reset_password_token TEXT;',
          { transaction }
        );
        console.log('Added reset_password_token column');
      } else {
        console.log('reset_password_token column already exists');
      }
    });
    
    // Add reset_password_expires column if it doesn't exist
    await sequelize.query(
      'PRAGMA table_info(users);',
      { transaction }
    ).then(async ([results]) => {
      const hasResetExpires = results.some(col => col.name === 'reset_password_expires');
      if (!hasResetExpires) {
        await sequelize.query(
          'ALTER TABLE users ADD COLUMN reset_password_expires DATETIME;',
          { transaction }
        );
        console.log('Added reset_password_expires column');
      } else {
        console.log('reset_password_expires column already exists');
      }
    });
    
    console.log('Added reset_password_expires column');
    
    // Commit the transaction
    await transaction.commit();
    console.log('Migration completed successfully!');
  } catch (error) {
    // If there's an error, rollback the transaction
    await transaction.rollback();
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
runMigration();
