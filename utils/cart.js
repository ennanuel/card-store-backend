const Player = require('../models/Player');

async function updateCartItems(cart) {
    const cartItems = cart._doc.items;
    const quantities = convertItemToQuantityObject(cartItems);
    const cardIds = convertItemToCardIdArray(cartItems);
    const cards = await Player.find({ _id: { $in: cardIds } }, { names: 1, price: 2, quantity: 2, }).sort({ 'names.first': -1 });
    const filteredCards = cards.filter(({ _doc }) => _doc.quantity >= quantities[_doc._id.toString()]);
    const cardsWithNewQuantity = filteredCards.map(({_doc}) => ({ ..._doc, card_id: _doc._id, quantity: quantities[_doc._id.toString()] }));
    const itemsQuantity = cardsWithNewQuantity.length;
    const total = cardsWithNewQuantity.reduce(getTotalPrice, 0);
    const shippingCost = cardsWithNewQuantity.reduce(getShippingPrice, 0);
    cart.quantity = itemsQuantity;
    cart.shippingCost = shippingCost;
    cart.total = total + shippingCost;
    cart.items = cardsWithNewQuantity;
    await cart.save();
    const items = cardsWithNewQuantity.map(card => ({ ...card, card_id: card._id.toString() }));
    return items;
}

async function resetCart(cart) {
    try {
        if (!cart) throw new Error('Please specify cart');
        cart.total = 0;
        cart.shippingCost = 0;
        cart.items = [];
        await cart.save();
        return { failed: false, message: '' };
    } catch (error) {
        return { failed: true, message: error.message };
    }
}

function convertToNumber(val) {
    const convertedValue = Number(val);
    return /nan/i.test(convertedValue) ? 1 : convertedValue;
}
function getTotalPrice(sum = 0, card) {
    const cardPrice = card.price * card.quantity;
    return cardPrice + sum;
}
function getShippingPrice(sum, card) {
    const shippingPrice = card.price / 100;
    return shippingPrice + sum;
}
function convertItemToCardIdArray(items) {
    const idArray = items.map(item => item.card_id.toString());
    return idArray;
}
function convertItemToQuantityObject(items) {
    const itemQuantityObj = items.reduce((a, b) => ({...a,  [b.card_id.toString()]: b.quantity }), {});
    return itemQuantityObj;
};

module.exports = {
    updateCartItems,
    resetCart,
    convertToNumber
}