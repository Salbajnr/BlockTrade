
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    // Create connection to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema by semicolons and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('Database schema created successfully');

    // Insert sample trading pairs
    await connection.execute('USE blocktrade');
    
    const tradingPairs = [
      ['BTC', 'USD', 0.001, 10.0, 8, 8, 0.001, 0.002, true],
      ['ETH', 'USD', 0.01, 100.0, 8, 8, 0.001, 0.002, true],
      ['LTC', 'USD', 0.1, 1000.0, 8, 8, 0.001, 0.002, true]
    ];

    for (const pair of tradingPairs) {
      await connection.execute(`
        INSERT IGNORE INTO trading_pairs 
        (base_currency, quote_currency, min_trade_amount, max_trade_amount, 
         price_decimal_places, amount_decimal_places, maker_fee, taker_fee, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, pair);
    }

    console.log('Sample trading pairs inserted');
    
    await connection.end();
    console.log('Database setup completed successfully');
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
