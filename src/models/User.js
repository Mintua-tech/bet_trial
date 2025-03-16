const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    chatId: { type: String, required: true, unique: true },
    username: { type: String, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String},
    phoneNumber: { type: Number },
    balance: { type: Number, default: 0.0 },
    isBan: { type: Boolean, default: false }, // Admin flag
}, { timestamps: true });

const User = mongoose.model('betUser', userSchema);

module.exports = User;

