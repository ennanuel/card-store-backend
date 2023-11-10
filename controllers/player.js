const Player = require('../models/Player');
const { deleteImage } = require('../utils/file');
const { getCardsByType, additionalCardValues, addPremiumValue } = require('../utils/player');

async function fetchSinglePlayer(req, res) {
    try {            
        const { card_id } = req.params;
        const { user } = req;
        const foundCard = await Player.findById(card_id);
        const card = await additionalCardValues(foundCard, user.id);
        return res.status(200).json(card);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

async function fetchAllPlayers(req, res) {
    try {
        const foundCards = await Player.find();
        const cards = foundCards.map(addPremiumValue);
        return res.status(200).json(cards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

async function fetchRelatedPlayers(req, res) {
    try {
        const { card_id } = req.params;
        const card = await Player.findById(card_id, { _id: 1, sport: 2 });
        const cards = await Player.find({
            _id: { $ne: card._doc._id },
            sport: card._doc._sport
        }).sort({ rating: -1 });
        const relatedCards = cards.map(addPremiumValue);
        return res.status(200).json(relatedCards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function fetchPlayersBasedOnType(req, res) {
    try {
        const { fetchType, searchValue } = req.params;
        const fetchAll = !searchValue || searchValue.toLowerCase() === 'all';
        if (fetchAll) return fetchAllPlayers(req, res);
        const typeToLowerCase = fetchType.toLowerCase();
        const result = await getCardsByType(typeToLowerCase, searchValue);
        const cards = result.map(addPremiumValue);
        return res.status(200).json(cards);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

async function addPlayerCard(req, res) {
    try {
        const { user_id } = req.params;
        const { first, middle = '', last = '', ...body } = req.body;
        const card = { names: { first, middle, last }, owner: user_id, ...body };
        const newCard = new Player(card);
        await newCard.save();
        return res.status(200).json({ message: 'New card added' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function editPlayerCard(req, res) {
    try {
        const { card_id, user_id } = req.params;
        const { prevImage, image, ...card } = req.body;
        if (!image) card.image = prevImage;
        else await deleteImage(`card/${prevImage}`);
        const updatedCard = await Player.findOneAndUpdate({ $and: [{ _id: card_id }, { owner: user_id }] });
        if (!updatedCard) throw new Error('Card could not be updated');
        return res.status(200).json({ message: 'card updated' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function deletePlayerCard(req, res) {
    try {
        const { card_id, user_id } = req.params;
        const deletedCard = await Player.findOneAndDelete({ $and: [{ _id: card_id }, { owner: user_id }] });
        if (!deletedCard) throw new Error('Card could not be deleted');
        await deleteImage(`card/${deletedCard.image}`);
        return res.status(200).json({ message: 'card deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    fetchAllPlayers,
    fetchRelatedPlayers,
    fetchSinglePlayer,
    fetchPlayersBasedOnType,
    addPlayerCard,
    editPlayerCard,
    deletePlayerCard
}