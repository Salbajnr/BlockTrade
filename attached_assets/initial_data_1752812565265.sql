-- Insert admin user (password: Admin@123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified, status)
VALUES ('admin@blocktrade.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/IpG', 'Admin', 'User', 'admin', TRUE, 'active');

-- Insert test user (password: Test@123)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified, status)
VALUES ('test@blocktrade.com', '$2b$10$YourHashedPasswordHere', 'Test', 'User', 'user', TRUE, 'active');

-- Insert trading pairs
INSERT INTO trading_pairs (base_currency, quote_currency, min_trade_amount, max_trade_amount, price_decimal_places, amount_decimal_places)
VALUES 
('BTC', 'USDT', 0.0001, 10.0, 2, 6),
('ETH', 'USDT', 0.001, 100.0, 2, 6),
('BTC', 'ETH', 0.0001, 10.0, 6, 6);

-- Create wallets for users
INSERT INTO wallets (user_id, currency, balance, address, type, status)
VALUES 
-- Admin wallets
(1, 'BTC', 10.0, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'spot', 'active'),
(1, 'ETH', 100.0, '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'spot', 'active'),
(1, 'USDT', 10000.0, 'TXyz...', 'spot', 'active'),
-- Test user wallets
(2, 'BTC', 1.0, '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 'spot', 'active'),
(2, 'ETH', 10.0, '0x123...', 'spot', 'active'),
(2, 'USDT', 1000.0, 'TXabc...', 'spot', 'active');

-- Insert some market data for BTC/USDT
INSERT INTO market_data (trading_pair_id, open_price, close_price, high_price, low_price, volume, timestamp, interval_type)
VALUES 
(1, 45000.00, 45100.00, 45200.00, 44900.00, 10.5, NOW() - INTERVAL 1 HOUR, '1h'),
(1, 45100.00, 45300.00, 45400.00, 45000.00, 12.3, NOW(), '1h');

-- Insert some sample orders
INSERT INTO orders (user_id, trading_pair_id, type, side, status, price, amount, remaining_amount, total)
VALUES 
(2, 1, 'limit', 'buy', 'pending', 45000.00, 0.1, 0.1, 4500.00),
(2, 1, 'limit', 'sell', 'pending', 45500.00, 0.05, 0.05, 2275.00); 