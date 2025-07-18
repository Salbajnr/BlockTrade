
import { testConnection } from '../src/config/database.js';

async function test() {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    process.exit(0);
  }
}

test();
