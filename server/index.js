import app from './app.js';
import connectDB from './db/db.js';
import { config } from 'dotenv';
import http from 'http';
import websocketService from './services/websocket.js';

const PORT = config.port || 5000;

const server = http.createServer(app);

websocketService.initialize(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Database connection error:', error);
});
