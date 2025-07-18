
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// Database connection
const sequelize = new Sequelize('blocktrade', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

async function fixAdmin() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Delete existing admin
    await sequelize.query('DELETE FROM users WHERE email = "admin@blocktrade.com"');
    console.log('Deleted existing admin');

    // Create new admin
    const hashedPassword = await bcrypt.hash('8Characterslong', 12);
    await sequelize.query(`
      INSERT INTO users (
        email, password, first_name, last_name, country, 
        role, is_verified, status, created_at, updated_at
      ) VALUES (
        'admin@blocktrade.com', ?, 'Admin', 'User', 'US',
        'admin', true, 'active', NOW(), NOW()
      )
    `, {
      replacements: [hashedPassword]
    });
    console.log('Created new admin user');

    // Verify
    const [admin] = await sequelize.query(
      'SELECT * FROM users WHERE email = "admin@blocktrade.com"'
    );
    console.log('Admin created:', {
      email: admin[0].email,
      role: admin[0].role,
      hasPassword: !!admin[0].password,
      passwordLength: admin[0].password.length
    });

    await sequelize.close();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAdmin(); 
