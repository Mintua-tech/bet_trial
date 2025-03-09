const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'betUser', 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['info', 'alert', 'warning'], 
      default: 'info'
    },
    isRead: { 
      type: Boolean, 
      default: false 
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
