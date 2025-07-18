
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import sequelize from '../config/database.js';

async function fixAdminPassword() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find admin user
    const admin = await User.findOne({ 
      where: { email: 'admin@blocktrade.com' },
      paranoid: false // Include soft-deleted users
    });

    if (!admin) {
      console.log('Admin user not found. Creating a new one...');
      const hashedPassword = await bcrypt.hash('8Characterslong', 10);
      
      const newAdmin = await User.create({
        email: 'admin@blocktrade.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        country: 'US',
        role: 'admin',
        is_verified: true,
        status: 'active'
      });
      
      console.log('Admin user created successfully!');
      console.log('Email: admin@blocktrade.com');
      console.log('Password: 8Characterslong');
    } else {
      console.log('Found existing admin user. Updating password...');
      
      // Update password with proper hashing
      const hashedPassword = await bcrypt.hash('8Characterslong', 10);
      await admin.update({
        password: hashedPassword,
        status: 'active',
        is_verified: true
      });
      
      console.log('Admin password updated successfully!');
      console.log('Email: admin@blocktrade.com');
      console.log('New Password: 8Characterslong');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin password:', error);
    process.exit(1);
  }
}

fixAdminPassword();
