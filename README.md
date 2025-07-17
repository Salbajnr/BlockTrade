# BlockTrade - Cryptocurrency Trading Platform

A full-stack cryptocurrency trading platform with real-time trading capabilities.

## Project Overview

BlockTrade is a modern cryptocurrency trading platform that provides:
- Real-time trading capabilities
- Secure user authentication
- Wallet management
- KYC verification
- Admin dashboard
- Real-time market data

## Tech Stack

### Frontend
- React with Vite
- TypeScript
- Tailwind CSS
- React Query
- React Router
- WebSocket for real-time updates
- Zustand for state management

### Backend
- Node.js with Express
- MySQL (via XAMPP)
- Sequelize ORM
- JWT Authentication
- WebSocket for real-time features

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.x or later)
- XAMPP (v8.x or later)
- Git
- A modern web browser

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd blocktrade-locally
```

2. Set up the database:
- Start XAMPP Control Panel
- Start Apache and MySQL services
- Create a new database named `blocktrade`

3. Set up the backend:
```bash
cd server
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

4. Set up the frontend:
```bash
cd client
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

## Project Structure

```
blocktrade-locally/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   ├── context/      # React context providers
│   │   ├── assets/       # Static assets
│   │   └── styles/       # Global styles
│   └── public/           # Public assets
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Custom middleware
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration files
│   └── tests/            # Backend tests
├── database/             # Database migrations and seeds
│   ├── migrations/       # Database migrations
│   └── seeds/           # Seed data
└── docs/                # Project documentation
```

## Development Workflow

1. Start XAMPP services (Apache and MySQL)
2. Start backend server: `cd server && npm run dev`
3. Start frontend development server: `cd client && npm run dev`

## Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=blocktrade
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# WebSocket Configuration
WS_PORT=5001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5001
```

## Security Features

- JWT authentication
- Rate limiting
- Input validation
- XSS protection
- SQL injection prevention
- Secure password handling
- CORS configuration
- Helmet security headers

## Testing

- Backend: Jest for unit and integration tests
- Frontend: Vitest and React Testing Library
- E2E: Cypress (coming soon)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Write tests
4. Submit a pull request

## License

MIT 
# Password Reset Guide

## Forgot Your Password?

1. Go to the login page and click on "Forgot Password"
2. Enter your email address and click "Send Reset Link"
3. Check your email for a password reset link
4. Click the link to open the password reset page
5. Enter your new password and confirm it
6. Click "Reset Password"

## Troubleshooting

- If you don't receive the email:
  - Check your spam/junk folder
  - Make sure you entered the correct email address
  - Wait a few minutes and try again

- If the reset link has expired:
  - Request a new password reset link
  - Complete the process within 1 hour

- If you're still having issues:
  - Contact support at support@example.com
  - Include your email address and a description of the issue