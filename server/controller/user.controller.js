import jwt from 'jsonwebtoken';
import Report from '../model/report.model.js'
import User from '../model/user.model.js';
import Comment from '../model/comment.model.js';
import FriendRequest from '../model/friendRequest.model.js';
import {config} from '../config/config.js'
import EmergencyAlert from '../model/emergencyAlert.model.js';
import websocketService from '../services/websocket.js';

export const userRegister =  async(req, res) => {
    const {username, password, email} = req.body;
    const userWithEmail = await User.findOne({email})
    if(userWithEmail){
      return res.status(411).json({msg:"User with this email already exists"})
    }
    await User.create({username,email,password})
    return res.status(201).json({msg:"User has been created successfully"})
  }
  
export const userLogin =  async(req, res) => {
    const { password, email} = req.body;
    const userWithEmail = await User.findOne({email})
    if(!userWithEmail){
      return res.status(401).json({msg:"Invalid creadentials"})
    }
    if(userWithEmail.password == password){
      const token = jwt.sign({id:userWithEmail._id},config.jwt_secret,{expiresIn:'1d'})
      return res.status(200).json({msg:"User has been logged in successfully",token,user:userWithEmail.username})
    }
    return res.status(401).json({msg:"Invalid creadentials"})
    
  }
  
export const userInfo = async(req,res)=>{
    const user = await User.findById(req.userId).select('-password')
    return res.status(200).json({msg:"here is user data",user}) 
   
  }
export const userPublicInfo = async(req,res)=>{
  const userId = req.params.userId
    const user = await User.findById(userId).select('username')
    return res.status(200).json({msg:"here is user data",user}) 
   
  }
export const reportInfo = async(req,res)=>{
    const report = await Report.find({user:req.userId})
    return res.status(200).json({msg:"here is user data",report}) 
   
  }
export const commentInfo = async(req,res)=>{
    const comment = await Comment.find({userId:req.userId}).populate('reportId')
    return res.status(200).json({msg:"here is user data",comment}) 
   
  }

// Get all users except current user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('username name email')
      .lean();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get current user's friends
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends', 'username name email')
      .lean();
    
    // Check if this user has an active emergency alert
    const activeAlert = await EmergencyAlert.findOne({
      sender: req.userId,
      status: 'active'
    }).populate({
      path: 'recipients.user',
      select: 'username email'
    });
    
    // Extract acknowledgments if we have an active alert
    let acknowledgments = [];
    if (activeAlert) {
      acknowledgments = activeAlert.recipients
        .filter(recipient => recipient.acknowledged)
        .map(recipient => recipient.user._id.toString());
    }
    
    res.json({ 
      friends: user.friends,
      activeAlert: !!activeAlert,
      alertId: activeAlert ? activeAlert._id : null,
      acknowledgments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends' });
  }
};

// Get all friend requests (both sent and received)
export const getFriendRequests = async (req, res) => {
  try {
    const pendingRequests = await FriendRequest.find({
      sender: req.userId,
      status: 'pending'
    }).populate('recipient', 'username name email');

    const receivedRequests = await FriendRequest.find({
      recipient: req.userId,
      status: 'pending'
    }).populate('sender', 'username name email');

    res.json({
      pendingRequests,
      receivedRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friend requests' });
  }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if they are already friends
    const existingFriendship = await User.findOne({
      _id: req.userId,
      friends: recipientId
    });

    if (existingFriendship) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if there's already a pending request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: req.userId, recipient: recipientId },
        { sender: recipientId, recipient: req.userId }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Create new friend request
    const friendRequest = await FriendRequest.create({
      sender: req.userId,
      recipient: recipientId,
      status: 'pending'
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Friend request already exists' });
    } else {
      res.status(500).json({ message: 'Error sending friend request' });
    }
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      recipient: req.userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Update friend request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add users to each other's friends list
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { friends: friendRequest.sender }
    });

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: req.userId }
    });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      recipient: req.userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request' });
  }
};

// Cancel a sent friend request
export const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      sender: req.userId,
      status: 'pending'
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    await FriendRequest.deleteOne({ _id: requestId });

    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling friend request' });
  }
};

// Add new function to remove friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    // Remove friend from current user's friends list
    await User.findByIdAndUpdate(req.userId, {
      $pull: { friends: friendId }
    });

    // Remove current user from friend's friends list
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.userId }
    });

    // Delete any existing friend requests between these users
    await FriendRequest.deleteMany({
      $or: [
        { sender: req.userId, recipient: friendId },
        { sender: friendId, recipient: req.userId }
      ]
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend' });
  }
};

// Emergency Alert functions
export const startEmergencyAlert = async (req, res) => {
  try { 
    const user = await User.findById(req.userId)
      .populate('friends', 'username email')
      .lean();

    if (!user.friends.length) {
      return res.status(400).json({ message: 'No friends to send emergency alert to' });
    }

    const alert = await EmergencyAlert.create({
      sender: req.userId,
      status: 'active',
      recipients: user.friends.map(friend => ({
        user: friend._id,
        acknowledged: false
      }))
    });
    
    // Get the sender's username for the notification
    const sender = await User.findById(req.userId).select('username').lean();

    // Create notification object
    const notification = {
      title: 'Emergency Alert',
      message: `${sender.username} has sent an emergency alert!`,
      type: 'emergency',
      senderId: req.userId,
      senderName: sender.username
    };

    // Send WebSocket message to notify friends
    user.friends.forEach(friend => {
      websocketService.sendToUser(friend._id.toString(), {
        type: 'emergency_alert',
        senderId: req.userId,
        alertId: alert._id,
        notification: notification
      });
    });

    res.json({ 
      message: 'Emergency alert started', 
      alertId: alert._id,
      notification: notification
    });
  } catch (error) {
    console.error('Error in startEmergencyAlert:', error);
    res.status(500).json({ message: 'Error starting emergency alert' });
  }
};

export const stopEmergencyAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findOne({
      sender: req.userId,
      status: 'active'
    });

    if (!alert) {
      return res.status(404).json({ message: 'No active emergency alert found' });
    }

    alert.status = 'stopped';
    await alert.save();

    // Send WebSocket message to notify recipients that alert has stopped
    const message = {
      type: 'message',
      message: {
        type: 'emergency_alert_stopped',
        alertId: alert._id,
        recipients: alert.recipients.map(r => r.user.toString())
      }
    };

    // Send to the sender's WebSocket connection
    websocketService.sendToUser(req.userId.toString(), message);

    res.json({ message: 'Emergency alert stopped' });
  } catch (error) {
    res.status(500).json({ message: 'Error stopping emergency alert' });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.body;
    const userId = req.userId;
    
    const alert = await EmergencyAlert.findById(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Emergency alert not found' });
    }

    const recipient = alert.recipients.find(r => r.user.toString() === userId);
    if (!recipient) {
      return res.status(400).json({ message: 'User is not a recipient of this alert' });
    }

    recipient.acknowledged = true;
    await alert.save();

    // Get the acknowledging user's username for the notification
    const acknowledgingUser = await User.findById(userId).select('username').lean();

    // Create notification object
    const notification = {
      title: 'Alert Acknowledged',
      message: `${acknowledgingUser.username} has acknowledged the emergency alert`,
      type: 'acknowledgment',
      userId: userId,
      userName: acknowledgingUser.username
    };

    // Send WebSocket message to notify the alert sender
    const message = {
      type: 'message',
      message: {
        type: 'alert_acknowledged',
        alertId: alert._id,
        notification: notification,
        recipients: [alert.sender.toString()]
      }
    };

    // Send to the acknowledging user's WebSocket connection
    websocketService.sendToUser(userId.toString(), message);

    res.json({ 
      message: 'Alert acknowledged',
      notification: notification
    });
  } catch (error) {
    res.status(500).json({ message: 'Error acknowledging alert' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};