import http from 'http';

const hostname = '0.0.0.0';
const port = 3002; // Using a different port

const server = http.createServer((req, res) => {
  console.log(`Received request for ${req.url}`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
  } else if (error.code === 'EACCES') {
    console.error(`Port ${port} requires elevated privileges.`);
  }
});

server.listen(port, hostname, () => {
  console.log(`Test server running at http://${hostname}:${port}/`);
  console.log('Try accessing it from your browser or with curl.');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});
