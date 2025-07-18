
module.exports = {
  apps: [{
    name: 'blocktrade-server',
    script: './src/index.js',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      RATE_LIMIT_WINDOW_MS: 900000,
      RATE_LIMIT_MAX_REQUESTS: 100
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      RATE_LIMIT_WINDOW_MS: 900000,
      RATE_LIMIT_MAX_REQUESTS: 100
    }
  }]
}
