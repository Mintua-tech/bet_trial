const express = require('express');
const {
    placeBet,
    getBet,
    getBetLive,
    cancelBet,
  } = require("../controllers/betController");

const { auth, authAdmin, authId } = require("../middlewares/authMiddleware");

const router = express.Router();



router.post("/", authId, placeBet);

router.get("/:id", getBet);

router.get("/live", auth, getBetLive)

router.post("cancel", auth, cancelBet);

module.exports = router;
