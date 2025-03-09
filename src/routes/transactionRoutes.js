const express = require('express');
const router = express.Router();
const {
    getUserBalance,
    depositeMoney,
    withdrawMoney,
    transferMoney,
    
  } = require("../controllers/transactionController");

const { authUser } = require('../middlewares/authMiddleware');



/*const Client = coinbase.Client;
const Charge = coinbase.resources.Charge;
Client.init(process.env.COINBASE_API_KEY);*/


//fetch wallet balance 

router.get("/:id", authUser, getUserBalance )

// Deposit API 
router.post('/deposit', authUser, depositeMoney);

//withdraw API

router.post('/withdraw', authUser, withdrawMoney);

//transfer API

router.post('transfer', authUser,  transferMoney);

// Coinbase webhook to confirm deposit
/*router.post('/crypto/webhook', async (req, res) => {
    const event = req.body.event;
    if (event.type === "charge:confirmed") {
        const { metadata, pricing } = event.data;
        const user = await User.findByPk(metadata.userId);

        await user.update({ balance: user.balance + parseFloat(pricing.local.amount) });
        await Transaction.create({ userId: user.id, type: 'deposit', amount: pricing.local.amount });

        console.log("Crypto deposit confirmed:", pricing.local.amount);
    }
    res.sendStatus(200);
});*/

module.exports = router;


