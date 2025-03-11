const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Bet Schema
const betSchema = new Schema(
  {
    id: { 
      type: String, 
      default: () => require('uuid').v4(),  // Generate UUID using the 'uuid' package
      required: true,
      unique: true,
    },
    userId: { 
      type: String,
      ref: "betUser", 
      required: true 
    },
    match: { 
      type: String, 
      required: true 
    },
    odds: { 
      type: Number, 
      required: true 
    },
    stake: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'won', 'lost'], 
      default: 'pending' 
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the Mongoose Model from the schema
const Bet = mongoose.model('Bet', betSchema);

module.exports = Bet;
