const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authUser } = require('../middlewares/authMiddleware');

router.get('/transactions', authUser, async (req, res) => {
    const transactions = await Transaction.findAll({ where: { userId: req.user.userId }, order: [['createdAt', 'DESC']] });
    res.json(transactions);
});

module.exports = router;
