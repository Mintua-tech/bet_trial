// models/transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    tx_ref: {
      type: String,
      required: true,
      unique: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      required: true,
    },
    payment_url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false, // optional: disables __v field
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
