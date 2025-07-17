import express from 'express';
import http from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Simple route
app.get('/', (req, res) => {
  res.send('Simple server is running!');
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
  } else if (error.code === 'EACCES') {
    console.error(`Port ${port} requires elevated privileges.`);
  }
  process.exit(1);
});

// Start server
console.log(`Starting simple server on port ${port}...`);
server.listen(port, '0.0.0.0', () => {
  console.log(`Simple server is running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});
