
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

// Import models
import { sequelize } from '../src/models/index.js';

async function testSequelize() {
  console.log('🔄 Testing Sequelize connection...');
  
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');
    
    // Show database name
    const [results] = await sequelize.query('SELECT DATABASE() as db');
    console.log(`📊 Connected to database: ${results[0].db}`);
    
    // Show tables in the database
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('\n📋 Database tables:');
    console.table(tables.map(item => ({
      Table: Object.values(item)[0]
    })));
    
    console.log('\n✅ Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    
    if (error.original) {
      console.error('Original error:', error.original);
    }
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('\n🔧 Connection troubleshooting:');
      console.log('1. Check if your database server is running');
      console.log('2. Verify database credentials in .env file');
      console.log('3. Check if the database exists');
      console.log('4. Verify database host and port');
    }
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
testSequelize();
