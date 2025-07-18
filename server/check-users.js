
import { sequelize } from './src/config/database.js';
import { User } from './src/models/index.js';

async function checkUsers() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Find all users
    const users = await User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'status'],
      raw: true
    });

    console.log('\nUsers in database:');
    console.table(users);
    
    // Find specific test users
    const testEmails = ['admin@blocktrade.com', 'test@blocktrade.com'];
    for (const email of testEmails) {
      const user = await User.findOne({ 
        where: { email },
        raw: true
      });
      console.log(`\nDetails for ${email}:`);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        console.table([userWithoutPassword]);
      } else {
        console.log('User not found');
      }
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
