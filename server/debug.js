
const { spawn } = require('child_process');

const startServer = () => {
  const server = spawn('node', ['src/index.js'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('Failed to start server:', error);
  });

  server.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code} and signal ${signal}`);
    // Restart the server if it exits
    startServer();
  });
};

// Start the server
startServer();
