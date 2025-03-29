import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const ChatWithFriends = () => {
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState({});
  const [isHost, setIsHost] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = useRef(null);
  
  const setCurrentUser=async()=>{
      currentUser.current =await authService.getCurrentUser();
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(()=>{
  setCurrentUser()
  },[])
 
  useEffect(() => {
    
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Cleanup WebSocket connection on component unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const fetchUserDetails = async (userId) => {
    try {
      const response = await authService.getPublictUserInfo(userId)
      return response.user.username || 'Unknown User';
    } catch (error) {
      console.error('Error fetching user details:', error);
      return 'Unknown User';
    }
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('Please connect to chat first');
      return;
    }

    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setLoading(true);
    setError('');

    ws.send(JSON.stringify({
      type: 'create_room',
      roomId: newRoomId,
      userId: currentUser.current.user._id
    }));

    setLoading(false);
  };

  const handleJoinRoom = () => {
    if (!inputRoomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError('Please connect to chat first');
      return;
    }

    setLoading(true);
    setError('');

    ws.send(JSON.stringify({
      type: 'join_room',
      roomId: inputRoomId,
      userId: currentUser.current.user._id
    }));

    setLoading(false);
  };

  const initializeWebSocket = () => {
    if (!currentUser.current.user?._id) {
      setError('Please sign in to use chat');
      return;
    }
    const wsUrl = `ws://localhost:5000?userId=${currentUser.current.user._id}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setError('');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to chat server');
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(websocket);
  };

  useEffect(() => {
    if (ws) {
      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        
        switch (data.type) {
          case 'room_created':
            console.log('Room created:', data.roomId);
            setRoomId(data.roomId);
            setMessages([]);
            // Add host to participants
            const hostName = await fetchUserDetails(currentUser.current.user._id);
            setParticipants(prev => ({
              ...prev,
              [currentUser.current.user._id]: hostName
            }));
            break;
          case 'room_joined':
            console.log('Room joined:', data.roomId);
            setRoomId(data.roomId);
            setMessages([]);
            setIsHost(false);
            // Fetch participant details when room is joined
            const participantNames = {};
            for (const userId of data.participants) {
              participantNames[userId] = await fetchUserDetails(userId);
            }
            setParticipants(participantNames);
            break;
          case 'participant_joined':
            console.log('New participant joined:', data.userId);
            const newParticipantName = await fetchUserDetails(data.userId);
            setParticipants(prev => ({
              ...prev,
              [data.userId]: newParticipantName
            }));
            break;
          case 'participant_left':
            console.log('Participant left:', data.userId);
            setParticipants(prev => {
              const newParticipants = { ...prev };
              delete newParticipants[data.userId];
              return newParticipants;
            });
            break;
          case 'message':
            console.log('Received chat message:', data);
            // Add message to state
            setMessages(prev => [...prev, {
              text: data.message,
              senderId: data.senderId,
              timestamp: new Date(data.timestamp)
            }]);
            break;
          case 'error':
            console.error('Error:', data.message);
            setError(data.message);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      };
    }
  }, [ws]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !ws || !roomId) {
      return;
    }

    const messageData = {
      type: 'message',
      roomId: roomId,
      message: newMessage,
      senderId: currentUser.current.user._id,
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', messageData);
    ws.send(JSON.stringify(messageData));

    // Clear input after sending
    setNewMessage('');
  };

  const handleLeaveChat = () => {
    if (ws && roomId) {
      ws.send(JSON.stringify({
        type: 'leave_room',
        roomId: roomId
      }));
      setRoomId('');
      setMessages([]);
      setParticipants({});
      setIsHost(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 bg-pink-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            >
              Chat with Friends 
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Connect and chat with your trusted contacts
            
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {!ws ? (
            <button
              onClick={initializeWebSocket}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Connect to Chat
            </button>
          ) : !roomId ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create a New Room</h3>
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Join Existing Room</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={inputRoomId}
                      onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Enter Room ID"
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={loading}
                      className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {loading ? 'Joining...' : 'Join Room'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Chat Room</h3>
                  <p className="text-sm text-gray-500">
                    Room ID: {roomId}
                    {isHost && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Host
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Participants: {Object.values(participants).join(', ')}
                  </p>
                </div>
                <button
                  onClick={handleLeaveChat}
                  className="text-red-600 hover:text-red-700"
                >
                  Leave Chat
                </button>
              </div>

              <div className="h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.senderId === currentUser.current.user._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === currentUser.current.user._id
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-xs font-medium mb-1">
                        {participants[message.senderId] || 'Unknown User'}
                      </p>
                      <p>{message.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/emergency"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            ← Back to Emergency Services
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatWithFriends; 