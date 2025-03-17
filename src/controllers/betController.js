const mongoose = require("mongoose");
const Bet = require("../models/Bet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

//controller that handles place bet 

exports.placeBet = async (req, res) => {
    
    const { match, odds, stake } = req.body;
    const session = await mongoose.startSession(); // Start a transaction session

    try {
        session.startTransaction(); // Begin transaction

        const user = await User.findOne({ chatId: String(req.chatId) }).session(session);

        
        

        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: "User not found" });
        }

        if (user.balance < stake) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // Create the bet
        await Bet.create([{ userId: user._id, match, odds, stake }], { session });

        // Record the transaction
        await Transaction.create([{ userId: user._id, type: "bet_placed", amount: -stake }], { session });

        // Update user balance
        await User.updateOne(
            { _id: user._id },
            { $inc: { balance: -stake } },
            { session }
        );

        await session.commitTransaction(); // Commit transaction
        session.endSession(); // End session

        res.json({ message: "Bet placed successfully" });
    } catch (error) {
        await session.abortTransaction(); // Rollback transaction in case of an error
        session.endSession(); // End session
        console.error("Error placing bet:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//controller that fetch bet by id

exports.getBet = async (req, res) => {
    const betId = req.params.id; // Extract bet ID from the route parameter

    try {
        // Find the bet by ID
        const bet = await Bet.findById(betId);

        if (!bet) {
            return res.status(404).json({ error: "Bet not found" });
        }

        // Return the bet data if found
        res.json({ bet });
    } catch (error) {
        console.error("Error fetching bet:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getBetLive = async (req, res) => {
    try {
        // Assuming a bet has a "status" field and the live ones are marked with a status like "live"
        const liveBets = await Bet.find({ status: 'live' });

        if (liveBets.length === 0) {
            return res.status(404).json({ message: "No live bets found" });
        }

        // Return the live bets
        res.json({ liveBets });
    } catch (error) {
        console.error("Error fetching live bets:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.cancelBet = async (req, res) => {
    
    const userId = req.user.id; // Get the user ID from the decoded token

    const betId = req.body.betId; // Get the betId from the request body
    if (!betId) {
        return res.status(400).json({ message: 'Bet ID is required' });
    }

    // Assume you have a function to cancel the bet in your database
    // For example, using MongoDB with Mongoose:
    Bet.findOneAndUpdate(
        { _id: betId, userId: userId, status: 'active' }, // Match the bet
        { status: 'cancelled' }, // Change the status
        { new: true }, // Return the updated bet
        (err, bet) => {
            if (err) {
                return res.status(500).json({ message: 'Error cancelling the bet', error: err });
            }
            if (!bet) {
                return res.status(404).json({ message: 'Bet not found or already cancelled' });
            }
            return res.status(200).json({ message: 'Bet cancelled successfully', bet });
        }
    );
}