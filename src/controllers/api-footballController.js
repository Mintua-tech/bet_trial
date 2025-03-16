const axios = require('axios');


exports.getLiveMatches = async (req, res) => {

    try {
        const response = await axios.get(`https://v3.football.api-sports.io/fixtures?live=all`, {
            headers: { "x-apisports-key": "959af5e745c419be5b42e09148ac0a4d" }    
        });

        return response.data.response;  // Returns an array of live matches
    } catch (error) {
        console.error("Error fetching live matches:", error.response?.data || error.message);
        res.status(400).json({ error: error.response?.data?.message || err.message });
    }
};