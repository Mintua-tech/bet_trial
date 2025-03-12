const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middlewares/authMiddleware');
const {getUser, updateBalance} = require('../controllers/authController')

router.get('/transactions', auth, async (req, res) => {
    const transactions = await Transaction.findAll({ where: { userId: req.user.userId }, order: [['createdAt', 'DESC']] });
    res.json(transactions);
});

router.get('/users', getUser);

router.put("/balance", auth, updateBalance);

module.exports = router;
