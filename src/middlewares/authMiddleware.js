const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.auth = async (req, res, next) => {
    
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            
            return res.status(404).json({ error: "User not found in the database" });
        }

        req.user = user; // Attach user data to the request object
        
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

exports.authId = async (req, res, next) => {
    
    const { chatId } = req.body;
    console.log(chatId);
    
    if (!chatId) {
        return res.status(400).json({ error: "Chat ID is required" });
    }
    
    req.chatId = chatId;
    next();
};


exports.authAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};


