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
const matchValues = (regexp) => ({
    $match: {
        count: { $gte: 1 },
        "_id.team": { $regex: regexp }
    }
});
const aggregateFormat = {
    $project: {
        "name": "$_id.team",
        "sport": "$_id.sport"
    },
}

const getTeams = (teamRegExp) => Player
    .aggregate([
        groupSimilarValues,
        matchValues(teamRegExp),
        aggregateFormat
    ])
    .sort({ name: -1 });

async function fetchTeams(req, res) {
    try {
        const { limit = 999999, page = 0, search = '' } = req.query;
        const teamRegExp = new RegExp(search, 'i');
        const limitNum = convertToNumber(limit);
        const pageNum = convertToNumber(page);
        const skip = pageNum * limitNum;
        const teams = await getTeams(teamRegExp).skip(skip).limit(limitNum);
        const totalTeams = (await getTeams(teamRegExp)).length;
        const totalPages = Math.ceil(totalTeams / limitNum);
        return res.status(200).json({ teams, totalPages, page: pageNum });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message})
    }
};

module.exports = { 
    fetchTeams
}