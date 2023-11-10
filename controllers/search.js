const Player = require('../models/Player');

async function fetchSearchResults(req, res) {
    try {
        const { searchValue } = req.params;
        const splitSearchValues = searchValue.split(/(\W+| +)/);
        const searchRegExp = new RegExp(splitSearchValues.join('|'), 'i');
        const nameResult = Player.find({
            $or: [
                { "names.first": { $regex: searchRegExp } },
                { "names.middle": { $regex: searchRegExp } },
                { "names.last": { $regex: searchRegExp } }
            ]
        });
        const teamResult = Player.find({
            team: { $regex: searchRegExp }
        });
        const sportResult = Player.find({
            sport: { $regex: searchRegExp }
        });
        const [player, team, sport] = await Promise.all([nameResult, teamResult, sportResult]);
        const result = { player, team, sport };
        res.status(200).json(result)
    } catch (err) {
        res.status(500).json(err)
    }
};

module.exports = {
    fetchSearchResults
}