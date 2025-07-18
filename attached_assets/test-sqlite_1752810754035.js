import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple SQLite configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: resolve(__dirname, 'blocktrade.db'),
  logging: console.log,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at'
  }
});

async function testConnection() {
  try {
    console.log('🔄 Testing SQLite database connection...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to SQLite database has been established successfully.');
    
    // Show database file path
    console.log(`📂 Database file: ${resolve(__dirname, 'blocktrade.db')}`);
    
    // Show all tables
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    console.log('\n📋 Database tables:');
    
    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      console.table(tables);
    }
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to the SQLite database:', error.message);
    
    if (error.original) {
      console.error('Original error:', error.original);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the database file has write permissions');
    console.log('2. Check if another process is using the database file');
    console.log('3. Verify the database file path is correct');
  } finally {
    // Close the connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the test
testConnection();
