
import { sequelize } from '../models/index.js';

async function checkDbSchema() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Check if users table exists
    const [results] = await sequelize.query(
      `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'users'`
    );

    console.log('\nUsers table columns:');
    console.table(results);

    // Check admin user
    const [admin] = await sequelize.query(
      `SELECT id, email, role, status, is_verified, 
              LENGTH(password) as password_length, 
              SUBSTRING(password, 1, 20) as password_preview
       FROM users 
       WHERE email = 'admin@blocktrade.com'`
    );

    console.log('\nAdmin user details:');
    console.table(admin);

    // Check if we can authenticate with bcrypt
    if (admin[0]) {
      const [authCheck] = await sequelize.query(
        `SELECT CASE WHEN password = ? THEN 'plaintext' 
                    WHEN password LIKE '$2a$%' THEN 'bcrypt' 
                    ELSE 'unknown' 
               END as password_type
         FROM users 
         WHERE email = 'admin@blocktrade.com'`,
        { replacements: ['8Characterslong'] }
      );
      console.log('\nPassword type check:');
      console.table(authCheck);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking database schema:', error);
    process.exit(1);
  }
}

checkDbSchema();
