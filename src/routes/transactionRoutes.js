const express = require('express');
const router = express.Router();
const {
    getUserBalance,
    depositeMoney,
    withdrawMoney,
    transferMoney,
    verifyPayment
    
  } = require("../controllers/transactionController");

const { auth, authId } = require('../middlewares/authMiddleware');
console.log(authId);



/*const Client = coinbase.Client;
const Charge = coinbase.resources.Charge;
Client.init(process.env.COINBASE_API_KEY);*/


//fetch wallet balance 

router.get("/:id", auth, getUserBalance )

// Deposit API 
router.post('/deposit', authId, depositeMoney);

// Payement Verification API

router.get('/callback', auth, verifyPayment)

//withdraw API

router.post('/withdraw', auth, withdrawMoney);

//transfer API

router.post('transfer', auth,  transferMoney);

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


