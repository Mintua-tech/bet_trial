const axios = require('axios');
const cache = new Map();
const CACHE_DURATION = 60 * 1000; // Cache duration in milliseconds (e.g., 60 seconds)

//controller that handle live match request


exports.getLiveMatches = async (req, res) => {
    
    const CACHE_DURATION = 3 * 1000;
    const cacheKey = 'live_matches';
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
        return res.json({ data: cachedResponse.data });
    }


    try {
        const response = await axios.get(`https://v3.football.api-sports.io/fixtures?live=all`, {
            headers: { "x-apisports-key": process.env.apifootball }    
        });

        cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
        });
        
        res.json({ data: response.data });
        //return response.data.response;  // Returns an array of live matches
    } catch (error) {
        console.error("Error fetching live matches:", error.response?.data || error.message);
        res.status(400).json({ error: error.response?.data?.message || err.message });
    }
};

//controller that handle get leagues request

exports.getLeagues = async (req, res) => {

    const cacheKey = 'live_matches';
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
        return res.json({ data: cachedResponse.data });
    }
    try {

        const response = await axios.get(`https://v3.football.api-sports.io/leagues`, {
            headers: { "x-apisports-key": process.env.apifootball }    
        });

        cache.set(cacheKey, {
            data: response.data, 
            timestamp: Date.now()
        });   
        
        res.json({ data: response.data }); 
        
    } catch (error) {
        console.error("Error fetching league matches:", error.response?.data || error.message);
        res.status(400).json({ error: error.response?.data?.message || err.message });
    }
}

//controller that handle get match odds request

exports.getMatchOdds = async (req, res) => {
    //const fixtureId = req.query.fixture || '1210585'; // Allow dynamic fixture ID via query param
    const { fixtureId } = req.query;

    if (!fixtureId) {
        return res.status(400).json({ error: "Fixture ID is required" });
    }

    const cacheKey = `match_odds_${fixtureId}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_DURATION) {
        return res.json({ data: cachedResponse.data });
    }

    try {
        const response = await axios.get(`https://v3.football.api-sports.io/odds?fixture=${fixtureId}`, {
            headers: { "x-apisports-key": process.env.apifootball }
        });
        
        cache.set(cacheKey, {
            data: response.data.response,
            timestamp: Date.now()
        });

        res.json({ data: response.data.response });
    } catch (error) {
        console.error("Error fetching match odds:", error.response?.data || error.message);
        res.status(400).json({ error: error.response?.data?.message || error.message });
    }
};

