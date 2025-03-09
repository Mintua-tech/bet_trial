const express = require('express');
const {
    getActivePromotions,
    claimPromotion,
    
  } = require("../controllers/promotionController");

  const { auth } = require("../middleware/authMiddleware");

  const router = express.Router();

  

  //route fetch active promotions

  router.get("/active", auth, getActivePromotions)

  // route that claim promotional offers

  router.post("/claim", auth, claimPromotion);