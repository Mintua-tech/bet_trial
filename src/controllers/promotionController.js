const Promotion = require('../models/Promotion');
const User = require('../models/User');
const Transaction = require('../models/Transaction'); // Assuming you have a Transaction model to log rewards

exports.getActivePromotions = async (req, res) => {
  try {
    const currentDate = new Date();
    const activePromotions = await Promotion.find({
      isActive: true,
      validUntil: { $gte: currentDate } // Only include promotions that are still valid
    }).exec();

    if (activePromotions.length === 0) {
      return res.status(404).json({ message: 'No active promotions available' });
    }

    res.status(200).json({ promotions: activePromotions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.claimPromotion = async (req, res) => {
    const { userId, promotionId, betAmount } = req.body;
  
    try {
      // Find the promotion by ID
      const promotion = await Promotion.findById(promotionId);
  
      if (!promotion) {
        return res.status(404).json({ error: 'Promotion not found' });
      }
  
      // Check if the promotion is active and if the bet meets the minimum requirement
      if (!promotion.isActive) {
        return res.status(400).json({ error: 'Promotion is no longer active' });
      }
  
      if (betAmount < promotion.minBetAmount) {
        return res.status(400).json({ error: 'Bet amount is less than the minimum required' });
      }
  
      // Get the user to apply the reward
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Add the reward to the user's balance
      user.balance += promotion.rewardAmount;
      await user.save();
  
      // Log the reward transaction
      await Transaction.create({
        userId,
        type: 'reward',
        amount: promotion.rewardAmount,
      });
  
      // Mark promotion as claimed (optional, can add a field to track this)
      // Example: promotion.claimed = true; await promotion.save();
  
      res.status(200).json({
        message: 'Promotion claimed successfully!',
        rewardAmount: promotion.rewardAmount,
        newBalance: user.balance,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
