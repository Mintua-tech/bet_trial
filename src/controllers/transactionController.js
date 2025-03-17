const Transaction = require('../models/Transaction');
const User = require('../models/User');
const coinbase = require('coinbase-commerce-node');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const axios = require('axios');


// Get the balance for a specific user
exports.getUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await Transaction.aggregate([
        { $match: { userId } }, // Filter transactions by userId
        { $project: { _id: 0, amount: 1 } } // Only include the `amount` field
      ]);
  
      res.status(200).json({ userId, amounts: result });
    
    
} catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.depositeMoney = async (req, res) => {
  const { amount, email, firstName, lastName, phone } = req.body;
  const tx_ref = `txn-${Date.now()}`; // Unique transaction reference
  
  try {
      const chapaResponse = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
          amount: amount,
          currency: 'ETB',
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          tx_ref: tx_ref,
          payment_method: 'telebirr',
          callback_url: 'https://bet-trial.onrender.com/wallet/callback', // Update with your callback URL
          return_url: 'https://google.com/success', // Update with your success URL
      }, {
          headers: {
              Authorization: `Bearer CHASECK_TEST-UZFJVaRagxQ2iHdsz1BAEIBTuhpeO99C`,
              'Content-Type': 'application/json'
          }
      });

      
      
      // Send checkout URL to the client
      res.json({ checkoutUrl: chapaResponse.data.data.checkout_url });
  } catch (err) {
      res.status(400).json({ error: err.response?.data?.message || err.message });
  }
};

// Callback handler to verify payment
exports.verifyPayment = async (req, res) => {
  const { tx_ref } = req.query;
  console.log("lets check it");

  try {
      const verificationResponse = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
          headers: {
              Authorization: `Bearer CHASECK_TEST-UZFJVaRagxQ2iHdsz1BAEIBTuhpeO99C`,
          }
      });

      const { status, data } = verificationResponse.data;

      if (status === 'success' && data.status === 'success') {
          // Update user's balance
          const user = await User.findOneAndUpdate(
            { _id: req.chatId },
            { $inc: { balance: parseFloat(data.amount) } }, // Increment balance
            { new: true } // Return updated document
        );
        
        if (user) {
            await Transaction.create({
                userId: user._id,
                type: 'deposit',
                amount: parseFloat(data.amount),
            });
        }
        
        return res.json({ message: 'Payment verified and balance updated successfully' });
          
      }
      
      res.status(400).json({ error: 'Payment verification failed' });
  } catch (err) {
      res.status(400).json({ error: err.response?.data?.message || err.message });
  }
};





exports.withdrawMoney = async (req, res) => {
  const { amount, destinationId } = req.body; // destinationId = user's bank/card/Stripe account ID

  try {
    // Get user details
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Convert amount to cents (Stripe uses cents)
    const amountInCents = amount * 100;

    // Send money via Stripe Payouts
    const payout = await stripe.payouts.create({
      amount: amountInCents,
      currency: 'usd',
      method: 'instant', // Use 'standard' if you don't want instant payouts
      destination: destinationId, // Bank/Card ID from Stripe
    });

    // Deduct balance
    await user.update({ balance: user.balance - amount });

    // Log transaction
    await Transaction.create({ userId: user.id, type: 'withdrawal', amount });

    res.json({ message: 'Withdrawal successful', payout });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.transferMoney = async (req, res) => {
  const { senderId, receiverId, amount } = req.body;

  const session = await mongoose.startSession();

  try {
    // Validate input
    if (!senderId || !receiverId || amount <= 0) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    // Get sender and receiver details
    const sender = await User.findByPk(senderId).session(session);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
        
      await session.abortTransaction();
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    // Check if sender has enough balance
    if (sender.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Insufficient balance' });
    }

        // Deduct from sender and add to receiver
        sender.balance -= amount;
        receiver.balance += amount;

    // Save changes for both sender and receiver
    await sender.save();
    await receiver.save();

    // Log the transactions for both sender and receiver
    await Transaction.create(
        [{ userId: sender.id, type: 'withdrawal', amount }, { userId: receiver.id, type: 'deposit', amount }],
        { session }
      );
  
      // Commit the transaction
      await session.commitTransaction();
  
      res.json({ message: 'Transfer successful' });
    } catch (err) {
      // If something went wrong, abort the transaction
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    // End the session
    session.endSession();
  }
};
   



