
-- Create database
CREATE DATABASE IF NOT EXISTS blocktrade;
USE blocktrade;

-- Create admin user
CREATE USER IF NOT EXISTS 'blocktrade'@'localhost' IDENTIFIED BY 'blocktrade';
GRANT ALL PRIVILEGES ON blocktrade.* TO 'blocktrade'@'localhost';
FLUSH PRIVILEGES;
