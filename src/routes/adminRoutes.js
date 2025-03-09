const express = require('express');
const router = express.Router();
const Bet = require('../models/Bet');
const { authAdmin } = require('../middlewares/authMiddleware');

// Get all bets
router.get('/bets', authAdmin, async (req, res) => {
    const bets = await Bet.findAll();
    res.json(bets);
});

// Update bet status (Approve or Reject)
router.put('/bets/:id', authAdmin, async (req, res) => {
    const { status } = req.body;
    if (!['won', 'lost'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const bet = await Bet.findByPk(req.params.id);
    if (!bet) return res.status(404).json({ error: "Bet not found" });

    await bet.update({ status });

    // If bet is won, update user balance
    if (status === 'won') {
        const user = await User.findByPk(bet.userId);
        const winnings = bet.stake * bet.odds;
        await user.update({ balance: user.balance + winnings });
    }

    res.json({ message: `Bet status updated to ${status}` });
});

module.exports = router;
