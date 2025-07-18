
import bcrypt from 'bcryptjs';
import { sequelize } from '../models/index.js';

async function resetAdminPassword() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Generate new password hash
    const newPassword = '8Characterslong';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update admin password
    const [updated] = await sequelize.query(
      `UPDATE users SET password = ? WHERE email = 'admin@blocktrade.com'`,
      { replacements: [hashedPassword] }
    );

    if (updated.affectedRows > 0) {
      console.log('Admin password updated successfully!');
      console.log('Email: admin@blocktrade.com');
      console.log('New Password: 8Characterslong');
    } else {
      console.log('No admin user found to update');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
