const Emergency = require('../models/emergency.model');
const twilio = require('twilio');
const mongoose = require('mongoose');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

exports.getAllPhoneNumbers = async (req, res) => {
  try {
    const emergency = await Emergency.findOne({ userId: req.user._id });
    res.json({ phoneNumbers: emergency?.phoneNumbers || [] });
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    res.status(500).json({ message: 'Error fetching phone numbers' });
  }
};

exports.savePhoneNumber = async (req, res) => {
  try {
    const { number, label } = req.body;
    
    if (!number) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Find or create emergency document
    let emergency = await Emergency.findOne({ userId: req.user._id });
    
    if (!emergency) {
      emergency = new Emergency({
        userId: req.user._id,
        phoneNumbers: []
      });
    }

    // Add new phone number
    emergency.phoneNumbers.push({
      number,
      label: label || 'Emergency Contact',
      isActive: true
    });

    await emergency.save();
    res.json({ phoneNumbers: emergency.phoneNumbers });
  } catch (error) {
    console.error('Error saving phone number:', error);
    res.status(500).json({ message: 'Error saving phone number' });
  }
};

exports.updatePhoneNumber = async (req, res) => {
  try {
    const { numberId, number, label, isActive } = req.body;

    if (!numberId || !number) {
      return res.status(400).json({ message: 'Phone number and ID are required' });
    }

    const emergency = await Emergency.findOne({ userId: req.user._id });
    if (!emergency) {
      return res.status(404).json({ message: 'No emergency contacts found' });
    }

    const phoneNumberIndex = emergency.phoneNumbers.findIndex(
      p => p._id.toString() === numberId
    );

    if (phoneNumberIndex === -1) {
      return res.status(404).json({ message: 'Phone number not found' });
    }

    emergency.phoneNumbers[phoneNumberIndex] = {
      ...emergency.phoneNumbers[phoneNumberIndex].toObject(),
      number,
      label: label || emergency.phoneNumbers[phoneNumberIndex].label,
      isActive: isActive !== undefined ? isActive : emergency.phoneNumbers[phoneNumberIndex].isActive
    };

    await emergency.save();
    res.json({ phoneNumbers: emergency.phoneNumbers });
  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ message: 'Error updating phone number' });
  }
};

exports.deletePhoneNumber = async (req, res) => {
  try {
    const { numberId } = req.params;

    const emergency = await Emergency.findOne({ userId: req.user._id });
    if (!emergency) {
      return res.status(404).json({ message: 'No emergency contacts found' });
    }

    emergency.phoneNumbers = emergency.phoneNumbers.filter(
      p => p._id.toString() !== numberId
    );

    await emergency.save();
    res.json({ phoneNumbers: emergency.phoneNumbers });
  } catch (error) {
    console.error('Error deleting phone number:', error);
    res.status(500).json({ message: 'Error deleting phone number' });
  }
};

exports.sendEmergencyAlert = async (req, res) => {
  try {
    const emergency = await Emergency.findOne({ userId: req.user._id });
    
    if (!emergency || !emergency.phoneNumbers.length) {
      return res.status(400).json({ message: 'No emergency contacts found' });
    }

    const activePhoneNumbers = emergency.phoneNumbers.filter(p => p.isActive);
    if (!activePhoneNumbers.length) {
      return res.status(400).json({ message: 'No active emergency contacts found' });
    }

    // Send SMS to all active numbers
    const messagePromises = activePhoneNumbers.map(phone => 
      client.messages.create({
        body: 'EMERGENCY ALERT: The user has activated their emergency alert. They may be in danger and need immediate assistance. Please contact them or emergency services immediately.',
        from: TWILIO_PHONE_NUMBER,
        to: phone.number
      })
    );

    await Promise.all(messagePromises);

    // Update emergency status
    emergency.isAlertActive = true;
    emergency.lastAlertTime = new Date();
    await emergency.save();

    res.json({ message: 'Emergency alert sent successfully to all active contacts' });
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    res.status(500).json({ message: 'Error sending emergency alert' });
  }
};

exports.stopEmergencyAlert = async (req, res) => {
  try {
    const emergency = await Emergency.findOne({ userId: req.user._id });
    
    if (!emergency || !emergency.phoneNumbers.length) {
      return res.status(400).json({ message: 'No emergency contacts found' });
    }

    const activePhoneNumbers = emergency.phoneNumbers.filter(p => p.isActive);
    if (!activePhoneNumbers.length) {
      return res.status(400).json({ message: 'No active emergency contacts found' });
    }

    // Send all-clear message to all active numbers
    const messagePromises = activePhoneNumbers.map(phone =>
      client.messages.create({
        body: 'ALERT UPDATE: The emergency alert has been deactivated. The user has indicated they are safe.',
        from: TWILIO_PHONE_NUMBER,
        to: phone.number
      })
    );

    await Promise.all(messagePromises);

    // Update emergency status
    emergency.isAlertActive = false;
    await emergency.save();

    res.json({ message: 'Emergency alert stopped successfully' });
  } catch (error) {
    console.error('Error stopping emergency alert:', error);
    res.status(500).json({ message: 'Error stopping emergency alert' });
  }
}; 