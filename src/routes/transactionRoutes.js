const express = require('express');
const router = express.Router();
const {
    getUserBalance,
    depositeMoney,
    withdrawMoney,
    transferMoney,
    verifyPayment,
    verifyWithdrawal,
    getBankDetails
    
  } = require("../controllers/transactionController");

const { auth, authId } = require('../middlewares/authMiddleware');
console.log(authId);



/*const Client = coinbase.Client;
const Charge = coinbase.resources.Charge;
Client.init(process.env.COINBASE_API_KEY);*/


//route that fetch user wallet balance 

router.get("/:id", auth, getUserBalance )

//route that recharge user balance 

router.post('/deposit', authId, depositeMoney);

//callback route that used Payment Verification 

router.post('/callback', verifyPayment);

//route that withdraw user balance

router.post('/withdraw', withdrawMoney);

//route that verify withdrawl request

router.post('/withdraw/callback', verifyWithdrawal);

//router that fetch bank alternative

router.get('/banks', getBankDetails);



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


