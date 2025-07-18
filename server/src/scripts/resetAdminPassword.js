
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import sequelize from '../config/database.js';

async function resetAdminPassword() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find or create admin user
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@blocktrade.com' },
      defaults: {
        email: 'admin@blocktrade.com',
        password: await bcrypt.hash('8Characterslong', 10),
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_verified: true,
        status: 'active'
      }
    });

    if (!created) {
      // Update existing admin password
      const hashedPassword = await bcrypt.hash('8Characterslong', 10);
      await admin.update({ 
        password: hashedPassword,
        status: 'active',
        is_verified: true
      });
      console.log('Admin password updated successfully!');
    } else {
      console.log('Admin user created successfully!');
    }

    console.log('Admin credentials:');
    console.log('Email: admin@blocktrade.com');
    console.log('Password: 8Characterslong');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
