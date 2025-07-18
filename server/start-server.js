
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting server with enhanced logging...');

const server = spawn('node', ['--trace-warnings', 'src/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_DEBUG: 'http,net',
    DEBUG: 'express:*,sequelize:*',
    FORCE_COLOR: '1'
  }
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill('SIGINT');
});
