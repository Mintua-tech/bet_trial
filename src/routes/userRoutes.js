const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middlewares/authMiddleware');
const {getUser, updateBalance, register, login, getUserById } = require('../controllers/authController')

router.get('/transactions', auth, async (req, res) => {
    const transactions = await Transaction.findAll({ where: { userId: req.user.userId }, order: [['createdAt', 'DESC']] });
    res.json(transactions);
});

// route that fetch all users

router.get('/users', getUser);

// route that register user

router.post('/register', register);

//route that login user

router.post('/login', login);

//route that fetch user by chat id

router.get("/:chatId", getUserById);

//route that update user balance

router.put("/balance", auth, updateBalance);

module.exports = router;
