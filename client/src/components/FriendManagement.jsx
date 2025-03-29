import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  Avatar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  getAllUsers,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend
} from '../services/api';

const FriendManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRefreshing(true);
      
      const [usersData, friendsData, requestsData] = await Promise.all([
        getAllUsers(),
        getFriends(),
        getFriendRequests()
      ]);

      setUsers(usersData.users || []);
      setFriends(friendsData.friends || []);
      setPendingRequests(requestsData.pendingRequests || []);
      setReceivedRequests(requestsData.receivedRequests || []);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      setError(null);
      await sendFriendRequest(userId);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to send friend request. Please try again.');
      console.error('Error sending friend request:', err);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setError(null);
      await acceptFriendRequest(requestId);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to accept friend request. Please try again.');
      console.error('Error accepting friend request:', err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setError(null);
      await rejectFriendRequest(requestId);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to reject friend request. Please try again.');
      console.error('Error rejecting friend request:', err);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      setError(null);
      await cancelFriendRequest(requestId);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to cancel friend request. Please try again.');
      console.error('Error canceling friend request:', err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      setError(null);
      await removeFriend(friendId);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to remove friend. Please try again.');
      console.error('Error removing friend:', err);
    }
  };

  const getFilteredUsers = () => {
    if (!searchQuery) return users;
    return users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getFilteredFriends = () => {
    if (!searchQuery) return friends;
    return friends.filter(friend => 
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (friend.email && friend.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const isFriend = (userId) => {
    return friends.some(friend => friend._id === userId);
  };

  const isPendingRequest = (userId) => {
    return pendingRequests.some(request => request.recipient._id === userId);
  };

  const renderUsersList = () => {
    const filteredUsers = getFilteredUsers();
    
    return (
      <>
        <TextField
          fullWidth
          placeholder="Search users..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <List>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <ListItem 
                key={user._id}
                sx={{ 
                  mb: 1, 
                  borderRadius: 1,
                  backgroundColor: '#f9f9f9',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <Avatar sx={{ mr: 2, bgcolor: '#e91e63' }}>
                  {user.username ? user.username[0].toUpperCase() : '?'}
                </Avatar>
                <ListItemText
                  primary={user.name || user.username}
                  secondary={user.email}
                />
                <ListItemSecondaryAction>
                  {isFriend(user._id) ? (
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      disabled
                    >
                      Friends
                    </Button>
                  ) : isPendingRequest(user._id) ? (
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        const request = pendingRequests.find(req => req.recipient._id === user._id);
                        if (request) handleCancelRequest(request._id);
                      }}
                    >
                      Cancel Request
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleSendRequest(user._id)}
                    >
                      Send Request
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary={searchQuery ? "No matching users found" : "No users found"} 
                secondary={searchQuery ? "Try a different search term" : ""}
              />
            </ListItem>
          )}
        </List>
      </>
    );
  };

  const renderFriendsList = () => {
    const filteredFriends = getFilteredFriends();
    
    return (
      <>
        <TextField
          fullWidth
          placeholder="Search friends..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <List>
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <ListItem 
                key={friend._id}
                sx={{ 
                  mb: 1, 
                  borderRadius: 1,
                  backgroundColor: '#f9f9f9',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                <Avatar sx={{ mr: 2, bgcolor: '#3f51b5' }}>
                  {friend.username ? friend.username[0].toUpperCase() : '?'}
                </Avatar>
                <ListItemText
                  primary={<strong>{friend.name || friend.username}</strong>}
                  secondary={friend.email}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<PersonRemoveIcon />}
                    onClick={() => handleRemoveFriend(friend._id)}
                  >
                    Remove
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText 
                primary={searchQuery ? "No matching friends found" : "No friends yet"} 
                secondary={searchQuery ? "Try a different search term" : "Add friends from the All Users tab"}
              />
            </ListItem>
          )}
        </List>
      </>
    );
  };

  const renderPendingRequests = () => (
    <List>
      {pendingRequests && pendingRequests.length > 0 ? (
        pendingRequests.map((request) => (
          <ListItem 
            key={request._id}
            sx={{ 
              mb: 1, 
              borderRadius: 1,
              backgroundColor: '#f9f9f9',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            <Avatar sx={{ mr: 2, bgcolor: '#ff9800' }}>
              {request.recipient.username ? request.recipient.username[0].toUpperCase() : '?'}
            </Avatar>
            <ListItemText
              primary={request.recipient.name || request.recipient.username}
              secondary={`Request sent to ${request.recipient.email}`}
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelRequest(request._id)}
              >
                Cancel Request
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="No pending requests" secondary="You haven't sent any friend requests that are waiting for a response" />
        </ListItem>
      )}
    </List>
  );

  const renderReceivedRequests = () => (
    <List>
      {receivedRequests && receivedRequests.length > 0 ? (
        receivedRequests.map((request) => (
          <ListItem 
            key={request._id}
            sx={{ 
              mb: 1, 
              borderRadius: 1,
              backgroundColor: '#f9f9f9',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            <Avatar sx={{ mr: 2, bgcolor: '#4caf50' }}>
              {request.sender.username ? request.sender.username[0].toUpperCase() : '?'}
            </Avatar>
            <ListItemText
              primary={request.sender.name || request.sender.username}
              secondary={`Request from ${request.sender.email}`}
            />
            <ListItemSecondaryAction>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleAcceptRequest(request._id)}
                sx={{ mr: 1 }}
              >
                Accept
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleRejectRequest(request._id)}
              >
                Reject
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="No received requests" secondary="You don't have any pending friend requests to approve" />
        </ListItem>
      )}
    </List>
  );

  if (loading && !isRefreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Manage Your Connections
        </Typography>
        <IconButton onClick={fetchData} disabled={isRefreshing} color="primary">
          {isRefreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
        </IconButton>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, newValue) => {
          setActiveTab(newValue);
          setSearchQuery(''); // Clear search when changing tabs
        }}
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab label="All Users" />
        <Tab 
          label={
            <Badge badgeContent={friends.length} color="primary" showZero>
              Friends
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={pendingRequests.length} color="secondary" showZero>
              Pending
            </Badge>
          } 
        />
        <Tab 
          label={
            <Badge badgeContent={receivedRequests.length} color="error" showZero>
              Received
            </Badge>
          } 
        />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {activeTab === 0 && renderUsersList()}
      {activeTab === 1 && renderFriendsList()}
      {activeTab === 2 && renderPendingRequests()}
      {activeTab === 3 && renderReceivedRequests()}
    </Paper>
  );
};

export default FriendManagement; 