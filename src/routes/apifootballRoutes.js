const express = require('express');

const {getLiveMatches} = require('../controllers/api-footballController');

const router = express.Router();

console.log(getLiveMatches);

router.get('/livematches', getLiveMatches);


module.exports = router;
