const Player = require('../models/Player');
const { convertToNumber } = require('../utils/player');

const groupSimilarSports = {
    $group: {
        _id: {
            sport: "$sport",
        },
        count: { $sum: 1 }
    }
};
const matchValues = {
    $match: { count: { $gte: 1 } },
};
const aggregateFormat = {
    $project: { "name": "$_id.sport" }
};

async function fetchSports(req, res) {
    const { limit = 9999999 } = req.query;
    const limitNum = convertToNumber(limit)
    try {
        const sports = await Player
            .aggregate([
                groupSimilarSports,
                matchValues,
                aggregateFormat
            ])
            .sort({ name: -1 })
            .limit(limitNum);
        return res.status(200).json(sports)
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { fetchSports };