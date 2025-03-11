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
