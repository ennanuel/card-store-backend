function getCardNamesString(order) {
    if (!order) return;
    const newOrder = order;
    const cards = newOrder._doc.cards;
    const cardsNames = cards.map(card => `${card.names.first} ${card.names.last}`).slice(0, 3);
    const cardsNamesString = cardsNames.join(', ') + (cards.length > 3 ? '...' : '');
    newOrder._doc.cards = cardsNamesString;
    return newOrder;
};

module.exports = {
    getCardNamesString
}