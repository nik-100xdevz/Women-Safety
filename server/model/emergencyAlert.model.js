import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedAt: Date
  }],
  status: {
    type: String,
    enum: ['active', 'stopped'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  stoppedAt: Date
});

const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);

export default EmergencyAlert; 