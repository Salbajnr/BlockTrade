
import { sequelize } from '../models/index.js';

async function checkUsers() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Get all users
    const [users] = await sequelize.query('SELECT * FROM users');
    
    console.log('Found users:', users.length);
    
    // Print admin user details
    const admin = users.find(u => u.email === 'admin@blocktrade.com');
    if (admin) {
      console.log('\nAdmin user:');
      console.log('ID:', admin.id);
      console.log('Email:', admin.email);
      console.log('Password length:', admin.password ? admin.password.length : 'null');
      console.log('Role:', admin.role);
      console.log('Status:', admin.status);
      console.log('Is Verified:', admin.is_verified);
      console.log('Created At:', admin.created_at);
    } else {
      console.log('\nNo admin user found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
}

checkUsers();
