const Transaction = require('../models/Transaction');
const User = require('../models/User');
const coinbase = require('coinbase-commerce-node');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');


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
    const { amount, paymentMethodId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
        });

        // Update user's balance
        const user = await User.findByPk(req.user.userId);
        await user.update({ balance: user.balance + amount });

        // Log transaction
        await Transaction.create({ userId: user.id, type: 'deposit', amount });

        res.json({ message: 'Deposit successful', paymentIntent });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}



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
   



