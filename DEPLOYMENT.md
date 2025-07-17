# BlockTrade Deployment Guide

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PM2 (for process management)
- Git
- MySQL database

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=mysql://user:password@host:port/database

# Security
JWT_SECRET=your-secret-key-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Steps

1. Clone the repository:
```bash
git clone https://github.com/your-repo/blocktrade.git
```

2. Install dependencies:
```bash
cd blocktrade
npm ci
```

3. Run migrations:
```bash
cd server
npm run migrate
npm run seed
```

4. Build and deploy:
```bash
# For first-time deployment
pm2 install pm2-logrotate

# Run deployment script
./deploy.sh
```

5. Access the application:
- Frontend: http://your-domain.com
- Admin Dashboard: http://your-domain.com/admin
- API: http://your-domain.com/api

## Production Commands

- Start application: `pm2 start ecosystem.config.js`
- Stop application: `pm2 stop ecosystem.config.js`
- Restart application: `pm2 restart ecosystem.config.js`
- View logs: `pm2 logs`

## Monitoring

The application uses PM2 for process management and monitoring. You can monitor the application using:

```bash
pm2 monit
```

## Troubleshooting

1. Check logs:
```bash
pm2 logs
```

2. Check PM2 status:
```bash
pm2 status
```

3. Check database connection:
```bash
curl http://your-domain.com/api/health
```
