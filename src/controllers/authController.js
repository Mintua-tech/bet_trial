const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

 

exports.register = async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.json(user);
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token, balance: user.balance });
}

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
