const express = require('express');
const {
    placeBet,
    getBet,
    getBetLive,
    cancelBet,
  } = require("../controllers/betController");

const { auth, authAdmin, authId } = require("../middlewares/authMiddleware");

const router = express.Router();

//route that used to place bet

router.post("/", authId, placeBet);

//route that fetch user bet by id

router.get("/:id", getBet);

router.get("/live", auth, getBetLive)

router.post("cancel", auth, cancelBet);

module.exports = router;
