const mongoose = require('mongoose');
const { Schema } = mongoose;

const promotionSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    rewardAmount: { 
      type: Number, 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    minBetAmount: { 
      type: Number, 
      required: true 
    },
    validUntil: { 
      type: Date, 
      required: true 
    }
  },
  {
    timestamps: true
  }
);

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
