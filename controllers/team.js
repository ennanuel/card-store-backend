const Player = require('../models/Player');

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
        const teams = await Player.aggregate([
            groupSimilarValues,
            matchValues,
            aggregateFormat
        ]).sort({ name: -1 })

        res.status(200).json(teams)
    } catch (err) {
        res.status(500).json(err)
    }
};

module.exports = { 
    fetchTeams
}