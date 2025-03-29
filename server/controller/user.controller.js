import jwt from 'jsonwebtoken';
import Report from '../model/report.model.js'
import User from '../model/user.model.js';
import Comment from '../model/comment.model.js';
import FriendRequest from '../model/friendRequest.model.js';
import {config} from '../config/config.js'
import EmergencyAlert from '../model/emergencyAlert.model.js';
import webpush from 'web-push';

// Configure web-push
const vapidKeys = {
  publicKey: 'BFGSlIq1Ts0JGELUd-QCyUVMwP--TccLFHHc4gfU-N3VfUzQYvifvrcd3VZkxW5bj-TDa6cB7Y39MBJvYdUXvtM',
  privateKey: 'KMgfVHJOOoHBdNMQiD6Mk7qH2HXMzrOMPDUEps7j7fA'
};

webpush.setVapidDetails(
  'mailto:test@example.com',  // Change this to your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

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
      return res.status(200).json({msg:"User has been logged in successfully",token})
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
    console.log(comment)
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
      .populate('friends', 'username name email pushSubscription')
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
    console.error('Error fetching friends:', error);
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

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend' });
  }
};

// Emergency Alert functions
export const startEmergencyAlert = async (req, res) => {
  try {
    console.log('Starting emergency alert for user:', req.userId);
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already has an active alert
    const existingAlert = await EmergencyAlert.findOne({
      sender: req.userId,
      status: 'active'
    });
    
    if (existingAlert) {
      console.log('User already has an active alert:', existingAlert._id);
      return res.status(200).json({ 
        message: 'Emergency alert already active',
        alertId: existingAlert._id,
        alreadyActive: true
      });
    }

    // Create new emergency alert
    const emergencyAlert = await EmergencyAlert.create({
      sender: req.userId,
      recipients: user.friends.map(friendId => ({
        user: friendId
      }))
    });
    
    console.log('Created new emergency alert:', emergencyAlert._id);
    console.log('Recipients:', emergencyAlert.recipients.length);

    // Start sending notifications to friends
    startNotificationInterval(emergencyAlert._id, user.friends);

    // Return list of friends for immediate display
    const friends = await User.find({ _id: { $in: user.friends } })
      .select('username email pushSubscription');
    
    res.status(201).json({ 
      message: 'Emergency alert started', 
      alertId: emergencyAlert._id,
      friends: friends.map(f => ({
        _id: f._id,
        username: f.username,
        email: f.email,
        hasSubscription: !!f.pushSubscription
      }))
    });
  } catch (error) {
    console.error('Error starting emergency alert:', error);
    res.status(500).json({ message: 'Error starting emergency alert', error: error.message });
  }
};

export const stopEmergencyAlert = async (req, res) => {
  try {
    console.log('Stopping emergency alert for user:', req.userId);
    
    const alert = await EmergencyAlert.findOne({
      sender: req.userId,
      status: 'active'
    });

    if (!alert) {
      return res.status(404).json({ message: 'No active emergency alert found' });
    }

    alert.status = 'stopped';
    alert.stoppedAt = new Date();
    await alert.save();

    // Stop sending notifications
    stopNotificationInterval(alert._id);
    
    console.log('Emergency alert stopped:', alert._id);

    res.json({ 
      message: 'Emergency alert stopped',
      alertId: alert._id,
      recipients: alert.recipients.map(r => ({
        userId: r.user,
        acknowledged: r.acknowledged,
        acknowledgedAt: r.acknowledgedAt
      }))
    });
  } catch (error) {
    console.error('Error stopping emergency alert:', error);
    res.status(500).json({ message: 'Error stopping emergency alert', error: error.message });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId, userId } = req.body;
    console.log('Acknowledging alert:', alertId, 'From user:', req.userId);
    
    // Find the alert by ID
    const alert = await EmergencyAlert.findById(alertId);

    if (!alert) {
      console.error('Could not find alert with ID:', alertId);
      return res.status(404).json({ message: 'Emergency alert not found' });
    }

    // Find the recipient index by the current user's ID
    const recipientIndex = alert.recipients.findIndex(
      r => r.user && r.user.toString() === req.userId
    );

    if (recipientIndex === -1) {
      console.error('User', req.userId, 'is not a recipient of alert', alertId);
      
      // If the current user is the sender of this alert, try to find by userId (for direct acknowledgments)
      if (alert.sender.toString() === req.userId && userId) {
        console.log('User is the sender, trying to acknowledge specific recipient:', userId);
        const targetRecipientIndex = alert.recipients.findIndex(
          r => r.user && r.user.toString() === userId
        );
        
        if (targetRecipientIndex === -1) {
          return res.status(400).json({ message: 'Target user is not a recipient of this alert' });
        }
        
        alert.recipients[targetRecipientIndex].acknowledged = true;
        alert.recipients[targetRecipientIndex].acknowledgedAt = new Date();
        await alert.save();
        
        return res.json({
          message: 'Alert acknowledged for recipient',
          alertId: alert._id,
          recipientId: userId,
          acknowledged: true,
          acknowledgedAt: alert.recipients[targetRecipientIndex].acknowledgedAt
        });
      }
      
      return res.status(400).json({ message: 'User is not a recipient of this alert' });
    }

    // Mark as acknowledged
    alert.recipients[recipientIndex].acknowledged = true;
    alert.recipients[recipientIndex].acknowledgedAt = new Date();
    await alert.save();
    
    console.log('Alert acknowledged by user:', req.userId);

    // Notify the sender that this recipient has acknowledged
    try {
      const senderUser = await User.findById(alert.sender);
      if (senderUser && senderUser.pushSubscription) {
        const acknowledger = await User.findById(req.userId);
        const acknowledgerName = acknowledger ? acknowledger.username : 'Someone';
        const message = `${acknowledgerName} has acknowledged your emergency alert`;
        
        // Log the notification attempt
        console.log('Sending acknowledgment notification to sender:', alert.sender, message);
        
        await sendPushNotification(
          alert.sender,
          message
        );
      }
    } catch (notifyError) {
      console.error('Error notifying sender:', notifyError);
      // Continue despite notification error
    }

    res.json({ 
      message: 'Alert acknowledged',
      alertId: alert._id,
      acknowledged: true,
      acknowledgedAt: alert.recipients[recipientIndex].acknowledgedAt
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ message: 'Error acknowledging alert', error: error.message });
  }
};

// Save push notification subscription
export const savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    console.log('Saving push subscription for user:', req.userId);
    
    if (!subscription) {
      return res.status(400).json({ message: 'Subscription data is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pushSubscription = subscription;
    await user.save();
    
    console.log('Push subscription saved successfully');

    res.json({ message: 'Push subscription saved successfully' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ message: 'Error saving push subscription', error: error.message });
  }
};

// Helper function to start notification interval
const startNotificationInterval = (alertId, recipients) => {
  console.log('Starting notification interval for alert:', alertId);
  
  const interval = setInterval(async () => {
    try {
      const alert = await EmergencyAlert.findById(alertId).populate({
        path: 'sender',
        select: 'username'
      });
      
      if (!alert || alert.status === 'stopped') {
        console.log('Alert is stopped or not found, clearing interval');
        clearInterval(interval);
        return;
      }

      // Get current recipients with their latest status
      const currentRecipients = await EmergencyAlert.findById(alertId)
        .populate({
          path: 'recipients.user',
          select: 'username email pushSubscription'
        });

      if (!currentRecipients) {
        console.log('Could not find recipients, stopping interval');
        clearInterval(interval);
        return;
      }

      // Send notifications to all unacknowledged recipients
      for (const recipient of currentRecipients.recipients) {
        if (!recipient.acknowledged && recipient.user && recipient.user.pushSubscription) {
          const senderName = alert.sender ? alert.sender.username : 'A friend';
          const message = `${senderName} needs your help! EMERGENCY ALERT`;
          sendPushNotification(recipient.user._id, message, recipient.user.pushSubscription);
        }
      }
    } catch (error) {
      console.error('Error in notification interval:', error);
    }
  }, 2000); // Send every 2 seconds

  // Store interval ID for cleanup
  notificationIntervals.set(alertId.toString(), interval);
};

// Helper function to stop notification interval
const stopNotificationInterval = (alertId) => {
  console.log('Stopping notification interval for alert:', alertId);
  
  const interval = notificationIntervals.get(alertId.toString());
  if (interval) {
    clearInterval(interval);
    notificationIntervals.delete(alertId.toString());
    console.log('Interval cleared successfully');
  } else {
    console.log('No interval found for this alert');
  }
};

// Store active notification intervals
const notificationIntervals = new Map();

// Helper function to send push notifications
const sendPushNotification = async (userId, message, subscription = null) => {
  try {
    // Log the intent to send notification
    console.log(`Sending push notification to user ${userId}: ${message}`);
    
    // If no subscription is provided, get it from the database
    if (!subscription) {
      const user = await User.findById(userId).select('pushSubscription');
      subscription = user && user.pushSubscription ? user.pushSubscription : null;
    }
    
    if (!subscription) {
      console.log(`User ${userId} has no push subscription`);
      return;
    }
    
    // Prepare notification payload
    const payload = JSON.stringify({
      title: 'Emergency Alert',
      body: message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [100, 50, 100, 50, 100, 50, 100],
      data: { 
        url: '/emergency',
        alertId: userId,
        userId: userId,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'acknowledge',
          title: 'Acknowledge Alert'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ],
      requireInteraction: true // Notification will remain until user interacts with it
    });
    
    // Send the push notification using web-push
    try {
      await webpush.sendNotification(subscription, payload);
      console.log(`Push notification sent successfully to user ${userId}`);
      return true;
    } catch (pushError) {
      // Handle specific push errors
      if (pushError.statusCode === 410) {
        console.log(`Removing invalid subscription for user ${userId}`);
        try {
          await User.findByIdAndUpdate(userId, { pushSubscription: null });
        } catch (updateError) {
          console.error(`Error removing invalid subscription: ${updateError}`);
        }
      } else if (pushError.statusCode === 404) {
        console.error(`Subscription not found for user ${userId}`);
      } else if (pushError.statusCode === 400) {
        console.error(`Invalid request to push service for user ${userId}: ${pushError.body}`);
      } else {
        console.error(`Push service error for user ${userId}: ${pushError.message}`);
      }
      throw pushError; // Re-throw for caller to handle
    }
  } catch (error) {
    console.error(`Error sending push notification to user ${userId}:`, error);
    // If subscription is invalid (gone), remove it from the user
    if (error.statusCode === 410) {
      console.log(`Removing invalid subscription for user ${userId}`);
      try {
        await User.findByIdAndUpdate(userId, { pushSubscription: null });
      } catch (updateError) {
        console.error(`Error removing invalid subscription: ${updateError}`);
      }
    }
    return false;
  }
};