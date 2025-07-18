
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import sequelize from '../config/database.js';

async function recreateAdminUser() {
  try {
    console.log('Starting admin user recreation...');
    
    // Connect to database
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Delete existing admin if exists
    console.log('Checking for existing admin user...');
    const existingAdmin = await User.findOne({ where: { email: 'admin@blocktrade.com' } });
    if (existingAdmin) {
      console.log('Found existing admin user, deleting...');
      await existingAdmin.destroy();
      console.log('Existing admin user deleted.');
    } else {
      console.log('No existing admin user found.');
    }

    // Create new admin user
    console.log('Creating new admin user...');
    const hashedPassword = await bcrypt.hash('8Characterslong', 12);
    console.log('Password hashed successfully.');
    
    const admin = await User.create({
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
    console.log('Admin details:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      is_verified: admin.is_verified,
      created_at: admin.created_at,
      updated_at: admin.updated_at
    });

    // Verify the user was created
    console.log('Verifying admin user in database...');
    const verifiedAdmin = await User.findOne({ 
      where: { email: 'admin@blocktrade.com' },
      raw: true
    });
    console.log('Verification result:', {
      found: !!verifiedAdmin,
      has_password: !!verifiedAdmin?.password,
      password_length: verifiedAdmin?.password?.length
    });

    process.exit(0);
  } catch (error) {
    console.error('Error recreating admin user:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

console.log('Script started...');
recreateAdminUser();
