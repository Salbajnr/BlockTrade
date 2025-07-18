
import bcrypt from 'bcryptjs';
import { sequelize } from './src/config/database.js';
import { User } from './src/models/index.js';

async function resetUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Update admin password
    const adminEmail = 'admin@blocktrade.com';
    const adminPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const [updated] = await User.update(
      { password: hashedPassword, status: 'active' },
      { where: { email: adminEmail } }
    );

    if (updated > 0) {
      console.log(`✅ Admin password reset successfully`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log('ℹ️ Admin user not found, creating...');
      await User.create({
        id: '00000000-0000-0000-0000-000000000001',
        email: adminEmail,
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        country: 'Global',
        role: 'admin',
        status: 'active',
        is_verified: true
      });
      console.log('✅ Admin user created');
    }

    // Create test user
    const testEmail = 'test@blocktrade.com';
    const testPassword = 'Test@123';
    const testHashedPassword = await bcrypt.hash(testPassword, 12);
    
    const [testUpdated] = await User.update(
      { password: testHashedPassword, status: 'active' },
      { where: { email: testEmail } }
    );

    if (testUpdated === 0) {
      await User.create({
        id: '00000000-0000-0000-0000-000000000002',
        email: testEmail,
        password: testHashedPassword,
        first_name: 'Test',
        last_name: 'User',
        country: 'Global',
        role: 'user',
        status: 'active',
        is_verified: true
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user password reset');
    }
    
    console.log('\n✅ Login credentials:');
    console.log('   Admin:', adminEmail, '/', adminPassword);
    console.log('   User: ', testEmail, '/', testPassword);
    
  } catch (error) {
    console.error('Error resetting users:', error);
  } finally {
    await sequelize.close();
  }
}

resetUsers();
