
import express from 'express';
import http from 'http';

express()
  .use((req, res) => res.json({ message: 'Minimal server is working!' }))
  .listen(3000, '0.0.0.0', () => {
    console.log('Minimal server is running on http://localhost:3000');
    console.log('Press Ctrl+C to stop the server');
  });
