const express = require('express');

const {getLiveMatches, getLeagues, getMatchOdds} = require('../controllers/api-footballController');

const router = express.Router();

//route that fetch live matches

router.get('/livematches', getLiveMatches);

//route that fetch match odds 

router.get('/matchodds', getMatchOdds);

//route that fetch leagues

router.get('/league', getLeagues)


module.exports = router;
