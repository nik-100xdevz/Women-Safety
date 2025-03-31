import { WebSocketServer } from 'ws';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); 
    this.rooms = new Map(); 
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
    // Handle emergency alert events first, before room checks
    if (message.type === 'emergency_alert') {
      // Send to specific recipients instead of broadcasting to all
      if (message.recipients && Array.isArray(message.recipients)) {
        message.recipients.forEach(recipientId => {
          const recipientWs = this.clients.get(recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'emergency_alert',
              senderId: senderId,
              alertId: message.alertId,
              notification: message.notification
            }));
          }
        });
      }
      return;
    }

    // For all other messages, require a room
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

    // Broadcast message to all participants in the room
    room.participants.forEach(participantId => {
      const ws = this.clients.get(participantId);
      if (ws) {
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
    console.log("we are sending to user",ws)
    if (ws) {
      ws.send(JSON.stringify(message));
    }
  }
}

export default new WebSocketService(); 