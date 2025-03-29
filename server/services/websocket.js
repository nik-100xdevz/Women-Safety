import { WebSocketServer } from 'ws';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Store client connections with their userIds
    this.rooms = new Map(); // Store room information
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      // Extract userId from query parameters
      const userId = new URL(req.url, 'http://localhost').searchParams.get('userId');
      
      if (!userId) {
        ws.close(1008, 'User ID is required');
        return;
      }

      // Store the connection
      this.clients.set(userId, ws);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'create_room':
              this.handleCreateRoom(userId, data.roomId);
              break;
            case 'join_room':
              this.handleJoinRoom(userId, data.roomId);
              break;
            case 'leave_room':
              this.handleLeaveRoom(userId, data.roomId);
              break;
            case 'message':
              this.handleMessage(userId, data.roomId, data.message);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error processing message'
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(userId);
      });
    });
  }

  handleCreateRoom(userId, roomId) {
    const ws = this.clients.get(userId);
    if (ws) {
      // Create new room
      this.rooms.set(roomId, {
        host: userId,
        participants: [userId]
      });

      ws.roomId = roomId;
      ws.send(JSON.stringify({
        type: 'room_created',
        roomId: roomId
      }));
    }
  }

  handleJoinRoom(userId, roomId) {
    const ws = this.clients.get(userId);
    const room = this.rooms.get(roomId);

    if (!ws) {
      return;
    }

    if (!room) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Room not found. Please check the room ID and try again.'
      }));
      return;
    }

    // Check if user is already in the room
    if (room.participants.includes(userId)) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'You are already in this room.'
      }));
      return;
    }

    // Add user to room
    room.participants.push(userId);
    ws.roomId = roomId;

    // Notify all participants about the new user
    room.participants.forEach(participantId => {
      const participantWs = this.clients.get(participantId);
      if (participantWs) {
        participantWs.send(JSON.stringify({
          type: 'room_joined',
          roomId: roomId,
          participants: room.participants,
          userId: userId
        }));
      }
    });
  }

  handleLeaveRoom(userId, roomId) {
    const ws = this.clients.get(userId);
    const room = this.rooms.get(roomId);

    if (!ws || !room) {
      return;
    }

    // Remove user from room
    room.participants = room.participants.filter(id => id !== userId);
    ws.roomId = null;

    // If room is empty, delete it
    if (room.participants.length === 0) {
      this.rooms.delete(roomId);
    } else {
      // Notify remaining participants
      room.participants.forEach(participantId => {
        const participantWs = this.clients.get(participantId);
        if (participantWs) {
          participantWs.send(JSON.stringify({
            type: 'participant_left',
            userId: userId
          }));
        }
      });
    }
  }

  handleMessage(senderId, roomId, message) {
    const room = this.rooms.get(roomId);
    if (!room) {
      const senderWs = this.clients.get(senderId);
      if (senderWs) {
        senderWs.send(JSON.stringify({
          type: 'error',
          message: 'Room not found. Please rejoin the room.'
        }));
      }
      return;
    }

    // Check if sender is in the room
    if (!room.participants.includes(senderId)) {
      const senderWs = this.clients.get(senderId);
      if (senderWs) {
        senderWs.send(JSON.stringify({
          type: 'error',
          message: 'You are not in this room. Please rejoin.'
        }));
      }
      return;
    }

    console.log('Broadcasting message to room:', roomId, 'participants:', room.participants);

    // Broadcast message to all participants in the room
    room.participants.forEach(participantId => {
      const ws = this.clients.get(participantId);
      if (ws) {
        console.log('Sending message to participant:', participantId);
        ws.send(JSON.stringify({
          type: 'message',
          senderId: senderId,
          roomId: roomId,
          message: message,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }

  handleDisconnect(userId) {
    const ws = this.clients.get(userId);
    if (ws && ws.roomId) {
      this.handleLeaveRoom(userId, ws.roomId);
    }
    this.clients.delete(userId);
  }

  // Helper method to send message to specific user
  sendToUser(userId, message) {
    const ws = this.clients.get(userId);
    if (ws) {
      ws.send(JSON.stringify(message));
    }
  }
}

export default new WebSocketService(); 