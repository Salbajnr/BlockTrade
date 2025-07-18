
import bcrypt from 'bcryptjs';
import { sequelize } from '../models/index.js';

async function verifyAdminPassword() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Get admin user
    const [users] = await sequelize.query(
      "SELECT id, email, password as password_hash, role, status FROM users WHERE email = 'admin@blocktrade.com'"
    );

    if (!users || users.length === 0) {
      console.log('Admin user not found');
      return;
    }

    const admin = users[0];
    console.log('Admin user found:', admin);

    // Try to verify the password
    const password = '8Characterslong';
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    
    console.log('\nPassword verification:');
    console.log('Password to check:', password);
    console.log('Stored hash:', admin.password_hash);
    console.log('Password matches:', isMatch);

    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(password, 10);
    console.log('\nNew hash for same password:', newHash);
    console.log('New hash matches stored hash:', await bcrypt.compare(password, newHash));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyAdminPassword();
