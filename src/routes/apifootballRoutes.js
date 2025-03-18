const express = require('express');

const {getLiveMatches, getLeagues, getMatchOdds, getfixturebyDate} = require('../controllers/api-footballController');

const router = express.Router();

//route that fetch live matches

router.get('/livematches', getLiveMatches);

//route that fetch match odds 

router.get('/matchodds', getMatchOdds);

//route that fetch leagues

router.get('/league', getLeagues);

//route that fetch fixture by date

router.get('/fixtures', getfixturebyDate);


module.exports = router;
