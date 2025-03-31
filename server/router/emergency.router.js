import express from 'express';
import  jwtVerify  from '../middleware/userAuth.middleware.js';
import {
  getAllPhoneNumbers,
  savePhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  sendEmergencyAlert,
  stopEmergencyAlert
} from '../controller/emergency.controller.js';

const router = express.Router();

// Emergency phone number routes
router.get('/phone-numbers', jwtVerify,(req,res,next)=>{
    console.log("hi there",req.userId);next()
}, getAllPhoneNumbers);
router.post('/phone-numbers', jwtVerify, savePhoneNumber);
router.put('/phone-numbers/:numberId', jwtVerify, updatePhoneNumber);
router.delete('/phone-numbers/:numberId', jwtVerify, deletePhoneNumber);

// Emergency alert routes
router.post('/alert', jwtVerify, sendEmergencyAlert);
router.post('/stop-alert', jwtVerify, stopEmergencyAlert);

export default router;