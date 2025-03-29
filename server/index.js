import app from './app.js';
import connectDB from './db/db.js';
import { config } from 'dotenv';
import http from 'http';
import websocketService from './services/websocket.js';

const PORT = config.port || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket service
websocketService.initialize(server);

// Connect to database and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Database connection error:', error);
});
