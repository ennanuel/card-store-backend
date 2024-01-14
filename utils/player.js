const Player = require("../models/Player");
const Cart = require("../models/Cart")

const ACCEPTABLE_VALUES = ['first', 'last', 'middle', 'desc', 'price', 'rating', 'sport', 'team', 'image', 'owner', 'quantity'];
const NAME_ENTRIES = ['first', 'middle', 'last'];
const FETCH_CARDS_TYPES = {
    name: getCardsByName,
    team: getCardsByTeam,
    sport: getCardsBySport,
    rating: getCardsByRating,
    price: getCardsByPrice
};

function addPremiumValue(card) {
    const modifiedCard = { ...card._doc };
    modifiedCard.premium = modifiedCard.price > 10000 || modifiedCard.rating > 96;
    return modifiedCard;
}

async function additionalCardValues(card, user_id) {
    const modifiedCard = { ...card._doc };
    const ownerId = modifiedCard.owner.toString()
    modifiedCard.premium = modifiedCard.price > 10000 || modifiedCard.rating > 96;
    modifiedCard.isYours = ownerId === user_id;
    modifiedCard.isOutOfStock = modifiedCard.quantity <= 0;
    modifiedCard.isInCart = await checkIfCardIsInCart(modifiedCard, user_id);
    return modifiedCard;
}

async function checkIfCardIsInCart(card, user_id) {
    const cart = await Cart.findOne({ user_id, items: { $elemMatch: { card_id: card._id } } });
    const isInCart = Boolean(cart);
    return isInCart;
}

function checkValues(values) {
    const valuesArray = Object.entries(values);
    if (valuesArray.length < 1) return { failed: true, message: 'Please input values' };
    for (let [key, value] of valuesArray) {
        if (['middle', 'last'].includes(key)) continue;
        if (!ACCEPTABLE_VALUES.includes(key)) return { failed: true, message: `${key} is not a Card Value` };
        if (!value || value?.length < 1) return { failed: true, message: `${key} cannot be empty` };
    }
    return { failed: false, message: '' };
}

async function getCardsByType({type, search, limit, page}) {
    const fetchType = NAME_ENTRIES.includes(type) ? 'name' : type;
    const fetchCards = FETCH_CARDS_TYPES[fetchType];
    if (!fetchCards) return [];
    const limitNum = convertToNumber(limit);
    const pageNum = convertToNumber(page);
    const skip = limitNum * pageNum == 'NaN' ? 0 : limitNum * pageNum;
    const result = await fetchCards({ search, entry: type, limit: limitNum, skip });
    return result;
}

async function getCardsByName({ entry, search, limit, skip }) { 
    const firstAlphabetRegexp = new RegExp(`^${search.substring(0, 1)}`, 'i');
    const nameEntry = `names.${entry}`;
    const result = await Player
        .find({ [nameEntry]: { $regex: firstAlphabetRegexp } })
        .sort({ [nameEntry]: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip);
    const cards = await Player.countDocuments({ [nameEntry]: { $regex: firstAlphabetRegexp } });
    const totalCards = Math.ceil(cards / limit);
    return { totalCards, result };
};
async function getCardsByTeam({ search, limit, skip }) { 
    const searchParam = getSearchParam(search, 'team');
    const result = await Player
        .find(searchParam)
        .sort({ 'names.first': -1, createdAt: -1 })
        .limit(limit)
        .skip(skip);
    const cards = await Player.countDocuments(searchParam);
    const totalCards = Math.ceil(cards / limit);
    return { totalCards, result };
};
async function getCardsBySport({ search, limit, skip }) {
    const searchParam = getSearchParam(search, 'sport');
    const result = await Player
        .find(searchParam)
        .sort({ 'names.first': -1, createdAt: -1 })
        .limit(limit)
        .skip(skip);
    const cards = await Player.countDocuments(searchParam);
    const totalCards = Math.ceil(cards / limit);
    return { totalCards, result };
};
async function getCardsByRating({ search, limit, skip }) { 
    const [greaterThan, lessThan] = getRatingNumbers(search);
    const result = await Player
        .find({ rating: { $gte: greaterThan, $lte: lessThan } })
        .sort({ rating: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip);
    const cards = await Player.countDocuments({ rating: { $gte: greaterThan, $lte: lessThan } });
    const totalCards = Math.ceil(cards / limit);
    return { totalCards, result };
};
async function getCardsByPrice({ search, limit, skip }) {  
    const [greaterThan, lessThan] = convertStringToNumbers(search);
    const result = await Player
        .find({ price: { $gte: greaterThan, $lte: lessThan } })
        .sort({ price: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip);
    const cards = await Player.countDocuments({ price: { $gte: greaterThan, $lte: lessThan } });
    const totalCards = Math.ceil(cards / limit);
    return { totalCards, result };
};

function convertToNumber(val) { return /nan/i.test(Number(val)) ? 0 : Number(val) };
function convertStringToNumbers(value) {
    const splitValues = value.split(/\W+/).slice(0, 2);
    const convertedNumbers = splitValues.map(convertToNumber);
    const sortedNumbers = convertedNumbers.sort((a, b) => a - b, 0);
    return sortedNumbers.length < 2 ? [0, ...sortedNumbers] : sortedNumbers;
};
function getRatingNumbers(value) {
    const convertedNumbers = convertStringToNumbers(value);
    const ratingNumbers = convertedNumbers.map(num => Math.min(100, num));
    return ratingNumbers;
}
function getSearchRegExp(value) {
    const valueWithoutSpecialChar = value.replace(/\W+/g, ' ');
    return new RegExp(valueWithoutSpecialChar);
}
function getSearchParam(search, field) {
    const searchRegExp = getSearchRegExp(search);
    return { [field]: { $regex: searchRegExp } };
}

const getRelatedCardsQuery = ({cardId, sport, limit}) => Player.find({ _id: { $ne: cardId }, sport: { $regex: sport } }).sort({ rating: -1, createdAt: -1 }).limit(limit);

module.exports = { 
    checkValues,
    getCardsByType,
    addPremiumValue,
    additionalCardValues,
    convertToNumber,
    getRelatedCardsQuery
}