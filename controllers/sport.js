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
const matchValues = (regexp) => ({
    $match: {
        count: { $gte: 1 },
        "_id.sport": { $regex: regexp }
    },
});
const aggregateFormat = {
    $project: {
        "name": "$_id.sport",
    }
};

const getSports = (sportRegExp) => Player
    .aggregate([
        groupSimilarSports,
        matchValues(sportRegExp),
        aggregateFormat
    ])
    .sort({ name: -1 });

async function fetchSports(req, res) {
    try {
        const { limit = 999999, page = 0, search = "" } = req.query;
        const sportRegExp = new RegExp(search, 'i');
        const limitNum = convertToNumber(limit);
        const pageNum = convertToNumber(page);
        const skip = pageNum * limitNum;
        const sports = await getSports(sportRegExp).skip(skip).limit(limitNum);
        const totalSports = (await getSports(sportRegExp)).length;
        const totalPages = Math.ceil(totalSports / limitNum);
        return res.status(200).json({ sports, totalPages, page: pageNum });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message})
    }
};

module.exports = { fetchSports };