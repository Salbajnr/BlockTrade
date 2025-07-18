
import { User } from '../models/index.js';
import sequelize from '../config/database.js';

async function checkAdminUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected.');

    // Find admin user
    const admin = await User.findOne({ 
      where: { email: 'admin@blocktrade.com' },
      raw: true // Get plain object instead of model instance
    });

    if (!admin) {
      console.error('Admin user not found!');
      process.exit(1);
    }

    // Log admin details (excluding sensitive data)
    console.log('Admin user found:');
    console.log({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      status: admin.status,
      is_verified: admin.is_verified,
      has_password: !!admin.password,
      password_length: admin.password ? admin.password.length : 0,
      created_at: admin.created_at,
      updated_at: admin.updated_at
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
}

checkAdminUser();
