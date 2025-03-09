const Notification = require('../models/Notification');
const User = require('../models/User');

exports.sendNotification = async (req, res) => {
    const { userId, message, type } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Create a new notification
      const notification = new Notification({
        userId,
        message,
        type
      });
  
      // Save the notification
      await notification.save();
  
      res.status(201).json({ message: 'Notification sent successfully', notification });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

 

exports.getUserNotifications = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch notifications for the user
    const notifications = await Notification.find({ userId: id })
      .sort({ createdAt: -1 }) // Sort notifications by latest first
      .exec();

    if (!notifications) {
      return res.status(404).json({ error: 'No notifications found for this user' });
    }

    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
