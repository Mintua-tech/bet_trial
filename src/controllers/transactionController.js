const Transaction = require('../models/Transaction');
const User = require('../models/User');
const coinbase = require('coinbase-commerce-node');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require("crypto");


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


//controller that make user to recharge balance

exports.depositeMoney = async (req, res) => {
  const { amount, email, firstName, lastName, phone, chatId } = req.body;
  const tx_ref = `txn-${Date.now()}`; // Unique transaction reference

  try {

    // Create a new transaction document with status 'pending'
    const transactionRecord = await Transaction.create({
      tx_ref,
      chatId,
      email,
      amount,
      currency: "ETB",
      status: "pending",
    });


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
      return_url: 'https://sports-frontend-seven.vercel.app', // Update with your success URL
    }, {
      headers: {
        Authorization: `Bearer CHASECK_TEST-UZFJVaRagxQ2iHdsz1BAEIBTuhpeO99C`,
        'Content-Type': 'application/json'
      }
    });

    // Update the transaction document with the payment URL
    transactionRecord.payment_url = chapaResponse.data.data.checkout_url;
    await transactionRecord.save();

    // Send checkout URL to the client
    res.json({ checkoutUrl: chapaResponse.data.data.checkout_url });
  } catch (err) {
    res.status(400).json({ error: err.response?.data?.message || err.message });
  }
};

// Callback handler to verify payment and create transaction history


exports.verifyPayment = async (req, res) => {
  console.log("Verification Started");
  console.log("Incoming request body:", req.body);

  try {
    console.log("In try block");
    // 1. Get your secret from environment variable
    const secret = "8wCLK02PPHQcY7luI2VMj8qWTrk8SKx3PaXYacUfO/Q"; // Make sure it matches what's in your Chapa settings

    // 2. Compute HMAC SHA256 of the request body using your secret
    //    Make sure you are stringifying the body in the same way Chapa does
    const computedHash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    // 3. Read the signature headers
    const chapaSignature = req.headers["chapa-signature"];
    const xChapaSignature = req.headers["x-chapa-signature"];

    // 4. If EITHER header is present and matches the computed hash, we trust it
    const isValidChapaSignature =
      (chapaSignature && computedHash === chapaSignature) ||
      (xChapaSignature && computedHash === xChapaSignature);

    if (!isValidChapaSignature) {
      return res.status(400).json({ error: "Invalid Chapa signature" });
    }

    // From here on, the request is verified as coming from Chapa

    const { tx_ref } = req.body; // or req.body if Chapa sends tx_ref at top-level
    if (!tx_ref) {
      return res.status(400).json({ error: "Missing transaction reference" });
    }

    // 5. Verify with Chapa’s verify endpoint
    const verificationResponse = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer CHASECK_TEST-UZFJVaRagxQ2iHdsz1BAEIBTuhpeO99C`,
        },
      }
    );

    const { status, data } = verificationResponse.data;

    if (status === "success" && data.status === "success") {
      // Find the existing transaction in MongoDB using Mongoose
      const transaction = await Transaction.findOne({ tx_ref });

      if (!transaction) {
        console.error("Transaction not found in database.");
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Update transaction status to 'success'
      transaction.status = "success";
      await transaction.save(); // Save the updated transaction in MongoDB

      // Convert amount to a number
      const amountPaid = parseFloat(data.amount);
      const chatId = transaction.chatId;

      // Find the user by chatId and increment their balance
      const user = await User.findOneAndUpdate(
        { chatId: chatId },
        { $inc: { balance: amountPaid } }, // Increment balance
        { new: true } // Return updated user document
      );

      if (!user) {
        console.error("User not found.");
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        message: "Payment verified and balance updated successfully",
        user,
      });
    }

    return res.status(400).json({ error: "Payment verification failed" });
  } catch (err) {
    return res.status(400).json({
      error: err.response?.data?.message || err.message,
    });
  }
};

//controller used to make withrawl

exports.withdrawMoney = async (req, res) => {
  const { amount, email, account_name, phone, chatId, bank_code, account_number } = req.body;
  const tx_ref = `withdraw-${Date.now()}`; // Unique transaction reference

  try {
    // Check if the user has sufficient balance
    const user = await User.findOne({ chatId });
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct the amount from user's balance and create a pending transaction
    user.balance -= amount;
    await user.save();

    const transactionRecord = await Transaction.create({
      tx_ref,
      chatId,
      email,
      amount,
      currency: "ETB",
      status: "pending",
      type: "withdrawal"
    });

    const chapaResponse = await axios.post('https://api.chapa.co/v1/transfers', {
      amount: amount,
      currency: 'ETB',
      email: email,
      account_name: account_name,
      phone_number: phone,
      tx_ref: tx_ref,
      account_number: account_number,
      bank_code: bank_code,
    }, {
      headers: {
        Authorization: `Bearer CHASECK_TEST-UZFJVaRagxQ2iHdsz1BAEIBTuhpeO99C`,
        'Content-Type': 'application/json'
      }
    });

    if (chapaResponse.data.status === "success") {
      transactionRecord.status = "processing";
      await transactionRecord.save();
      return res.json({ message: "Withdrawal request submitted successfully." });
    } else {
      // If withdrawal request fails, refund the amount back to user
      user.balance += amount;
      await user.save();
      return res.status(400).json({ error: "Withdrawal request failed." });
    }
  } catch (err) {
    return res.status(400).json({ error: err.response?.data?.message || err.message });
  }
};

//controller that handle verification while withdrawl

exports.verifyWithdrawal = async (req, res) => {
  console.log("Withdrawal Verification Started");
  console.log("Incoming request body:", req.body);

  try {
    const secret = "8wCLK02PPHQcY7luI2VMj8qWTrk8SKx3PaXYacUfO/Q";
    const computedHash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    const chapaSignature = req.headers["chapa-signature"];
    const xChapaSignature = req.headers["x-chapa-signature"];

    const isValidChapaSignature =
      (chapaSignature && computedHash === chapaSignature) ||
      (xChapaSignature && computedHash === xChapaSignature);

    if (!isValidChapaSignature) {
      return res.status(400).json({ error: "Invalid Chapa signature" });
    }

    const { tx_ref } = req.body;
    if (!tx_ref) {
      return res.status(400).json({ error: "Missing transaction reference" });
    }

    const verificationResponse = await axios.get(
      `https://api.chapa.co/v1/transfers/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer CHASECK_TEST-UZFJVaRagxQ2iHdsz1BAEIBTuhpeO99C`,
        },
      }
    );

    const { status, data } = verificationResponse.data;

    if (status === "success" && data.status === "success") {
      const transaction = await Transaction.findOne({ tx_ref });
      if (!transaction) {
        console.error("Transaction not found in database.");
        return res.status(404).json({ error: "Transaction not found" });
      }

      transaction.status = "completed";
      await transaction.save();

      return res.status(200).json({ message: "Withdrawal completed successfully." });
    }

    return res.status(400).json({ error: "Withdrawal verification failed" });
  } catch (err) {
    return res.status(400).json({ error: err.response?.data?.message || err.message });
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


exports.getBankDetails = async (req, res) => {

  try {
    // Check if the user has sufficient balance
    const user = await User.findOne({ chatId });
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct the amount from user's balance and create a pending transaction
    user.balance -= amount;
    await user.save();

    const transactionRecord = await Transaction.create({
      tx_ref,
      chatId,
      email,
      amount,
      currency: "ETB",
      status: "pending",
      type: "withdrawal"
    });

    const chapaResponse = await axios.post('https://api.chapa.co/v1/banks', 
       {
      headers: {
        Authorization: `Bearer CHASECK_TEST-UZFJVaRagxQ2iHdsz1BAEIBTuhpeO99C`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({ message: 'Banks retrieved successfully', data: response.data });
    
    
  } catch (err) {
   // Handle error if the API request fails
   res.status(500).json({ message: 'Failed to fetch banks', error: error.response ? error.response.data : error.message });
  }
};




