
import { initModels, sequelize } from '../src/models/index.js';

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

async function testModels() {
  console.log('🚀 Starting model initialization test...');
  
  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.error('❌ Aborting model tests due to database connection failure');
    process.exit(1);
  }

  try {
    console.log('\n🔄 Initializing models...');
    const models = await initModels();
    
    console.log('\n✅ Models initialized successfully!');
    console.log('\n📋 Available models:');
    Object.entries(models).forEach(([name, model]) => {
      console.log(`   • ${name} (${model.tableName || 'no table'})`);
    });
    
    // Test model instances
    console.log('\n🧪 Testing model instances...');
    for (const [name, model] of Object.entries(models)) {
      try {
        const count = await model.count();
        console.log(`   ✓ ${name}: ${count} records found`);
      } catch (error) {
        console.error(`   ✗ Error querying ${name}:`, error.message);
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Model initialization failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    process.exit(0);
  }
}

// Run the tests
testModels();
