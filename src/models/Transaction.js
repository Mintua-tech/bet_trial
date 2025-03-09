const mongoose = require('mongoose');
const { Schema } = mongoose;
const uuid = require('uuid');

// Define the Transaction Schema
const transactionSchema = new Schema(
  {
    id: { 
      type: String, 
      default: () => uuid.v4(), // Generate a UUID using the uuid package
      required: true,
      unique: true,
    },
    userId: { 
      type: String, // Use String to store UUID as a string
      required: true 
    },
    type: { 
      type: String, 
      enum: ['deposit', 'withdrawal', 'bet_won', 'bet_placed'], // Enum for transaction type
      required: true 
    },
    amount: { 
      type: Number, // Store the amount as a Number
      required: true 
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the Mongoose Model from the schema
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

