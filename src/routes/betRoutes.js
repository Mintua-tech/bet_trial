const express = require('express');
const {
    placeBet,
    getBet,
    getBetLive,
    cancelBet,
  } = require("../controllers/betController");

const { auth } = require("../middlewares/authMiddleware");

const router = express.Router();

console.log("place bet: ", placeBet)

router.post("/", placeBet);

router.get("/:id", getBet);

router.get("/live", auth, getBetLive)

router.post("cancel", auth, cancelBet);

module.exports = router;
