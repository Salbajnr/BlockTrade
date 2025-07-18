
import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'blocktrade'
    });

    console.log('Connected to MySQL successfully!');

    // Test query
    const [rows] = await connection.query('SELECT * FROM users');
    console.log('\nUsers in database:', rows.length);
    console.log('First user (if any):', rows[0] ? {
      email: rows[0].email,
      role: rows[0].role,
      hasPassword: !!rows[0].password,
      passwordLength: rows[0].password?.length
    } : 'No users found');

    // Close connection
    await connection.end();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\nPossible solutions:');
      console.log('1. Make sure XAMPP is running');
      console.log('2. Check if MySQL service is started in XAMPP');
      console.log('3. Verify MySQL is running on port 3306');
    }
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\nDatabase "blocktrade" does not exist!');
      console.log('Please create the database first.');
    }
  }
}

testConnection();
