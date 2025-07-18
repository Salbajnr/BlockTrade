
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS blocktrade;
USE blocktrade;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20) UNIQUE,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    kyc_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    last_login_at DATETIME,
    status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_role (role)
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0.00000000,
    address VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_transaction_at TIMESTAMP NULL,
    type ENUM('spot', 'margin', 'savings') DEFAULT 'spot',
    status ENUM('active', 'frozen', 'disabled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_currency (user_id, currency),
    INDEX idx_address (address),
    INDEX idx_status (status)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wallet_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NULL,
    type ENUM('deposit', 'withdrawal', 'trade', 'fee', 'transfer') NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    tx_hash VARCHAR(255) UNIQUE,
    fee DECIMAL(20, 8) DEFAULT 0,
    fee_currency VARCHAR(10),
    metadata JSON,
    description TEXT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallet_created (wallet_id, created_at),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_type_status (type, status),
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_order_id (order_id)
);

-- Trading Pairs table
CREATE TABLE IF NOT EXISTS trading_pairs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    min_trade_amount DECIMAL(20, 8) NOT NULL,
    max_trade_amount DECIMAL(20, 8) NOT NULL,
    price_decimal_places INT NOT NULL DEFAULT 8,
    amount_decimal_places INT NOT NULL DEFAULT 8,
    maker_fee DECIMAL(5, 4) NOT NULL DEFAULT 0.001,
    taker_fee DECIMAL(5, 4) NOT NULL DEFAULT 0.002,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    UNIQUE INDEX idx_pair (base_currency, quote_currency),
    INDEX idx_active (is_active)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    trading_pair_id INT NOT NULL,
    type ENUM('limit', 'market', 'stop_limit', 'stop_market') NOT NULL,
    side ENUM('buy', 'sell') NOT NULL,
    status ENUM('pending', 'partial', 'filled', 'cancelled', 'rejected') DEFAULT 'pending',
    price DECIMAL(20, 8),
    amount DECIMAL(20, 8) NOT NULL,
    filled_amount DECIMAL(20, 8) DEFAULT 0,
    remaining_amount DECIMAL(20, 8),
    total DECIMAL(20, 8),
    stop_price DECIMAL(20, 8),
    maker_fee_rate DECIMAL(5, 4),
    taker_fee_rate DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trading_pair_id) REFERENCES trading_pairs(id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_pair_status (trading_pair_id, status),
    INDEX idx_created_at (created_at)
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    maker_order_id INT NOT NULL,
    taker_order_id INT NOT NULL,
    trading_pair_id INT NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    total DECIMAL(20, 8) NOT NULL,
    maker_fee DECIMAL(20, 8) NOT NULL,
    taker_fee DECIMAL(20, 8) NOT NULL,
    maker_user_id INT NOT NULL,
    taker_user_id INT NOT NULL,
    side ENUM('buy', 'sell') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (maker_order_id) REFERENCES orders(id),
    FOREIGN KEY (taker_order_id) REFERENCES orders(id),
    FOREIGN KEY (trading_pair_id) REFERENCES trading_pairs(id),
    FOREIGN KEY (maker_user_id) REFERENCES users(id),
    FOREIGN KEY (taker_user_id) REFERENCES users(id),
    INDEX idx_pair_time (trading_pair_id, created_at),
    INDEX idx_maker_user (maker_user_id, created_at),
    INDEX idx_taker_user (taker_user_id, created_at)
);

-- Market Data table
CREATE TABLE IF NOT EXISTS market_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trading_pair_id INT NOT NULL,
    open_price DECIMAL(20, 8) NOT NULL,
    close_price DECIMAL(20, 8) NOT NULL,
    high_price DECIMAL(20, 8) NOT NULL,
    low_price DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 8) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    interval_type ENUM('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trading_pair_id) REFERENCES trading_pairs(id),
    UNIQUE INDEX idx_pair_interval (trading_pair_id, interval_type, timestamp),
    INDEX idx_timestamp (timestamp)
);

-- Add indexes for better query performance
ALTER TABLE users ADD FULLTEXT INDEX ft_name (first_name, last_name);
ALTER TABLE transactions ADD INDEX idx_processed (processed_at);

-- Set character set and collation
ALTER DATABASE blocktrade CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE wallets CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE transactions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE trading_pairs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE trades CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE market_data CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
