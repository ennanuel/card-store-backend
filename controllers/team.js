const Player = require('../models/Player');
const { convertToNumber } = require('../utils/player');

const groupSimilarValues = {
    $group: {
        _id: {
            team: "$team",
            sport: "$sport"
        },
        count: { $sum: 1 }
    }
};
const matchValues = {
    $match: { count: { $gte: 1 } }
};
const aggregateFormat = {
    $project: {
        "name": "$_id.team",
        "sport": "$_id.sport"
    },
};

async function fetchTeams(req, res) {
    try {
        const { limit = 999999 } = req.query;
        const limitNum = convertToNumber(limit)
        const teams = await Player
            .aggregate([
                groupSimilarValues,
                matchValues,
                aggregateFormat
            ])
            .sort({ name: -1 })
            .limit(limitNum);
        return res.status(200).json(teams)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message})
    }
};

module.exports = { 
    fetchTeams
}