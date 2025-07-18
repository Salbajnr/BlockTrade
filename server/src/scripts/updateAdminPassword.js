
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import sequelize from '../config/database.js';

async function updateAdminPassword() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find admin user
    const admin = await User.findOne({ where: { email: 'admin@blocktrade.com' } });
    if (!admin) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash('8Characterslong', 12);
    
    // Update the password
    await admin.update({ password: hashedPassword });
    
    console.log('Admin password updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();
