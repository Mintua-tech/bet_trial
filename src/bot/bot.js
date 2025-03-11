const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const Bet = require('../models/Bet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id.toString(); // Convert to string for MongoDB
    const username = msg.chat.username || `user_${chatId}`;
    try {
        let user = await User.findById(chatId);
        if (!user) {
            user = new User({ _id: chatId, username });
            await user.save();
            bot.sendMessage(chatId, `Welcome, ${username}! You've been registered.`);
        } else {
            bot.sendMessage(chatId, `Welcome back, ${username}!`);
        }
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } 
        );
        
        bot.sendMessage(chatId, `Your JWT token: ${token}`);
    } catch (error) {
        console.error('Error handling /start:', error);
        bot.sendMessage(chatId, 'An error occurred. Please try again.');
    }
   // bot.sendMessage(msg.chat.id, "Welcome to the Betting Bot! Use /balance to check your balance and /bet <match> <odds> <stake> to place a bet.");
});

bot.onText(/\/balance/, async (msg) => {
    const user = await User.findOne({ where: { username: msg.chat.username } });
    if (!user) return bot.sendMessage(msg.chat.id, "User not found. Please register.");
    bot.sendMessage(msg.chat.id, `Your balance is $${user.balance}`);
});

bot.onText(/\/bet (.+) (.+) (.+)/, async (msg, match) => {
    const [matchName, odds, stake] = match.slice(1);
    const user = await User.findOne({ where: { username: msg.chat.username } });

    if (!user) return bot.sendMessage(msg.chat.id, "User not found.");
    if (user.balance < stake) return bot.sendMessage(msg.chat.id, "Insufficient balance.");

    await Bet.create({ userId: user.id, match: matchName, odds, stake });
    await user.update({ balance: user.balance - stake });

    bot.sendMessage(msg.chat.id, `Bet placed on ${matchName} with odds ${odds} for $${stake}`);
});

module.exports = bot;
