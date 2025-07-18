
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './blocktrade.sqlite',
  logging: console.log
});

async function checkUser() {
  try {
    // Query the Users table
    const [results, metadata] = await sequelize.query(
      `SELECT id, email, reset_password_token, reset_password_expires 
       FROM Users 
       WHERE email = 'test@example.com'`
    );
    
    console.log('User data:', JSON.stringify(results, null, 2));
    
    // Check if reset_password_token exists in the schema
    const [columns] = await sequelize.query(
      `PRAGMA table_info(Users)`
    );
    
    console.log('\nTable columns:');
    console.log(columns.map(col => col.name).join(', '));
    
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await sequelize.close();
  }
}

checkUser();
