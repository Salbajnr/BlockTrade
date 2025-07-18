
# Seeds Directory

Database seed files for populating initial data.

## Structure
- `01-users.js` - User seed data (admin and test users)
- `02-wallets.js` - Wallet seed data for users
- `03-sample-transactions.js` - Sample transaction data

## Usage
To run all seeds:
```bash
npx sequelize-cli db:seed:all
```

To run specific seed:
```bash
npx sequelize-cli db:seed --seed 01-users.js
```

To undo all seeds:
```bash
npx sequelize-cli db:seed:undo:all
```

## Seed Data
- **Admin User**: admin@blocktrade.com (password: Admin@123)
- **Test User**: test@blocktrade.com (password: Test@123)
- **Wallets**: BTC, ETH, and USDT wallets for both users
- **Transactions**: Sample deposit and trade transactions
