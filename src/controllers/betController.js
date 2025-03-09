const Bet = require('../models/Bet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.placeBet = async (req, res) => {
    const { match, odds, stake } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (user.balance < stake) {
        return res.status(400).json({ error: "Insufficient balance" });
    }

    await Bet.create({ userId: user.id, match, odds, stake });
    await Transaction.create({ userId: user.id, type: 'bet_placed', amount: -stake });
    await user.update({ balance: user.balance - stake });

    res.json({ message: "Bet placed successfully" });
};
