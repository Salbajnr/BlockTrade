
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

const clients = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws, req) => {
    try {
      // Extract token from URL or headers
      const token = req.url.split('token=')[1];
      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Store client connection
      clients.set(userId, ws);

      // Send initial connection success
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        userId
      }));

      // Handle messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          handleMessage(userId, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1008, 'Authentication failed');
    }
  });

  wss.on('close', () => {
    console.log('WebSocket server closed');
  });

  console.log('WebSocket server is running');
};

const handleMessage = (userId, data) => {
  // Handle different message types
  switch (data.type) {
    case 'subscribe':
      // Handle market data subscription
      console.log(`User ${userId} subscribed to: ${data.channel}`);
      break;
    case 'unsubscribe':
      // Handle unsubscription
      console.log(`User ${userId} unsubscribed from: ${data.channel}`);
      break;
    case 'ping':
      // Handle ping messages
      broadcastToUser(userId, { type: 'pong', timestamp: Date.now() });
      break;
    default:
      console.warn('Unknown message type:', data.type);
  }
};

const broadcastToUser = (userId, data) => {
  const client = clients.get(userId);
  if (client && client.readyState === 1) { // WebSocket.OPEN
    client.send(JSON.stringify(data));
  }
};

const broadcastToAll = (data) => {
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
};

const broadcastToChannel = (channel, data) => {
  // Broadcast to users subscribed to specific channel
  clients.forEach((client, userId) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        channel,
        ...data
      }));
    }
  });
};

const getConnectedClients = () => {
  return clients.size;
};

const disconnectUser = (userId) => {
  const client = clients.get(userId);
  if (client) {
    client.close(1000, 'User disconnected');
    clients.delete(userId);
  }
};

export {
  setupWebSocket,
  handleMessage,
  broadcastToUser,
  broadcastToAll,
  broadcastToChannel,
  getConnectedClients,
  disconnectUser
};
