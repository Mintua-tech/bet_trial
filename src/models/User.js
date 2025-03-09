const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Telegram chatId as user ID
    username: { type: String, required: true, unique: true },
    first_name: { type: String },
    last_name: { type: String },
    auth_date: { type: Number },
    hash: { type: String },
    balance: { type: Number, default: 0.0 },
    isAdmin: { type: Boolean, default: false }, // Admin flag
}, { timestamps: true });

const User = mongoose.model('betUser', userSchema);

module.exports = User;

