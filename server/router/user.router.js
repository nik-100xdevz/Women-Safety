import {Router} from 'express'
import jwtVerify from '../middleware/userAuth.middleware.js'
import { 
  userInfo, 
  userLogin, 
  userRegister, 
  reportInfo, 
  commentInfo, 
  userPublicInfo,
  getAllUsers,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  startEmergencyAlert,
  stopEmergencyAlert,
  acknowledgeAlert,
  updateProfile
} from '../controller/user.controller.js'

const userRouter = Router() 

userRouter.route('/me').get(jwtVerify,userInfo)
userRouter.route('/public/:userId').get(userPublicInfo)
userRouter.route('/reports').get(jwtVerify,reportInfo)
userRouter.route('/comments').get(jwtVerify,commentInfo)
userRouter.route('/register').post(userRegister)
userRouter.route('/login').post(userLogin)
userRouter.route('/profile').put(jwtVerify, updateProfile) 

// Friend request routes
userRouter.route('/users').get(jwtVerify, getAllUsers)
userRouter.route('/friends').get(jwtVerify, getFriends)
userRouter.route('/friend-requests').get(jwtVerify, getFriendRequests)
userRouter.route('/friend-requests').post(jwtVerify, sendFriendRequest)
userRouter.route('/friend-requests/:requestId/accept').put(jwtVerify, acceptFriendRequest)
userRouter.route('/friend-requests/:requestId/reject').put(jwtVerify, rejectFriendRequest)
userRouter.route('/friend-requests/:requestId').delete(jwtVerify, cancelFriendRequest)
userRouter.route('/friends/:friendId').delete(jwtVerify, removeFriend)

// Emergency alert routes
userRouter.route('/emergency-alerts/start').post(jwtVerify,startEmergencyAlert)
userRouter.route('/emergency-alerts/stop').post(jwtVerify,stopEmergencyAlert)
userRouter.route('/emergency-alerts/acknowledge').post( acknowledgeAlert)

export default userRouter