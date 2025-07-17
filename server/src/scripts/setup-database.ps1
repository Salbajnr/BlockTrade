$sql = @"
CREATE DATABASE IF NOT EXISTS blocktrade;
USE blocktrade;

CREATE USER IF NOT EXISTS 'blocktrade'@'localhost' IDENTIFIED BY 'blocktrade';
GRANT ALL PRIVILEGES ON blocktrade.* TO 'blocktrade'@'localhost';
FLUSH PRIVILEGES;
"@

mysql -u root -p -e "$sql"
