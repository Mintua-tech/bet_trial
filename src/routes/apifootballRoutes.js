const express = require('express');

const {getLiveMatches, getLeagues} = require('../controllers/api-footballController');

const router = express.Router();

console.log(getLiveMatches);

router.get('/livematches', getLiveMatches);

router.get('/league', getLeagues)


module.exports = router;
