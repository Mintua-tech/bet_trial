const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

 //controller that handle user registeration

exports.register = async (req, res) => {
    const { chatId, username, firstName, lastName, phoneNumber } = req.body;

    const existingUser = await User.findOne({ chatId });     
    if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
    }
    
    const user = await User.create({ chatId, username, firstName, lastName, phoneNumber });

    return res.status(200).json({
        message: 'user registered successfully',
        user: user
    });
   
};

//controller that handle user login

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    console.log(user);
    if (!user || !await bcrypt.compare(password, user.hash)) {
        console.log(user);
       
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    return res.status(200).json({
        message: 'you are logged in successfully',
        data: { token, balance: user.balance }
    })
    
}

//controller that fetch all users

exports.getUser = async (req, res) => {

        try {
            // Retrieve all users from the database
            const users = await User.find();
    
            // Return the users list
            return res.status(200).json({
                message: 'Users retrieved successfully',
                users: users
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error retrieving users', error: error.message });
        }
}

//controller that update user balance

exports.updateBalance = async (req, res) => {
    try {
        const { amount } = req.body; // Amount to add/subtract from balance

        if (typeof amount !== "number") {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const user = await User.findById(req.user._id); // Get the authenticated user

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.balance += amount; // Update balance
        await user.save(); // Save changes

        res.json({ message: "Balance updated successfully", balance: user.balance });
    } catch (error) {
        console.error("Error updating balance:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//controller that fetch user by id

exports.getUserById = async (req, res) => {
    try {
        const { chatId } = req.params;

        console.log(chatId);


        const user = await User.findOne({ chatId: String(chatId) });
        console.log(user);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
