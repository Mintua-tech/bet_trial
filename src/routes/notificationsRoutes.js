const express = require('express');
const {
    sendNotification,
    getNotification,
    
  } = require("../controllers/notificationController");

  const { auth } = require("../middlewares/authMiddleware");

  const router = express.Router();

  // route that send notification

  router.post("/send", auth, sendNotification);

  //route fetch notification for user

  router.get("/:id", auth, getNotification);

  module.exports = router;

