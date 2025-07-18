
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { sequelize } from '../config/database.js';

// Load environment variables
config();

// Sync database
await sequelize.sync({ force: true });
console.log('Database synchronized');

async function setupAdmin() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await User.create({
      email: 'admin@blocktrade.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      country: 'Global',
      role: 'admin',
      is_verified: true,
      status: 'active'
    });

    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error setting up admin user:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the setup function
setupAdmin();
