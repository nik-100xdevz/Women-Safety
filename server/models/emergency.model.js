const mongoose = require('mongoose');

const phoneNumberSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    default: 'Emergency Contact',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phoneNumbers: [phoneNumberSchema],
  isAlertActive: {
    type: Boolean,
    default: false
  },
  lastAlertTime: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Emergency', emergencySchema); 