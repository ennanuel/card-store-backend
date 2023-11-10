const Cart = require("../models/Cart");
const Player = require("../models/Player");
const { updateCartItems, convertToNumber } = require("../utils/cart");

async function fetchUserCart(req, res) {
    try {
        const { user_id } = req.params;
        const foundCart = await Cart.findOne({ user_id });
        if (!foundCart) throw new Error('no cart found');
        const cartItems = await updateCartItems(foundCart);
        const cart = { ...foundCart._doc, items: cartItems };
        return res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function addItemToCart(req, res) { 
    try {
        const { cart_id, user_id } = req.params;
        const { card_id, amount } = req.body;
        const card = await Player.findOne({ _id: card_id, owner: { $ne: user_id } });
        if (!card) throw new Error('Cannot add item');
        const cart = await Cart.findById(cart_id);
        if (!cart) throw new Error('Could not add item to cart');
        const itemQuantity = convertToNumber(amount);
        const notEnoughQuantity = itemQuantity > card._doc.quantity;
        if (notEnoughQuantity) throw new Error('Card quantity is not enough');
        const itemsIds = cart._doc.items.map(item => item.card_id);
        const cartItems = await Cart.find({ _id: { $in: itemsIds } });
        card._doc.card_id = card_id;
        card._doc.quantity = itemQuantity;
        cartItems.push(card);
        const items = [...cart._doc.items, card._doc];
        const itemsQuantity = items.reduce((a, b) => ({ ...a, [b.card_id.toString()]: b.quantity }), {});
        const itemsPrices = cartItems.map(item => item._doc.price * itemsQuantity[item._doc._id.toString()]);
        const itemsShippingCost = cartItems.map(item => item._doc.price / 100);
        const total = itemsPrices.reduce((a, b) => a + b, 0);
        const shippingCost = itemsShippingCost.reduce((a, b) => a + b, 0);
        const quantity = cartItems.length;
        cart.items = items;
        cart.shippingCost = shippingCost;
        cart.total = total + shippingCost;
        cart.quantity = quantity;
        await cart.save();
        return res.status(200).json({ item: card, quantity, total, shippingCost });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

async function removeItemFromCart(req, res) { 
    try {
        const { cart_id } = req.params;
        const { card_id } = req.body;
        const cart = await Cart.findById(cart_id);
        const itemsIds = cart._doc.items.map(item => item.card_id);
        const itemsQuantity = cart._doc.items.reduce((a, b) => ({ ...a, [b.card_id.toString()]: b.quantity }), {});
        if (!cart) throw new Error('Could not remove item from cart');
        const cartItems = await Player.find({ $and: [{ _id: { $ne: card_id } }, { _id: { $in: itemsIds } }] });
        const items = cart._doc.items.filter(item => item.card_id.toString() !== card_id);
        const itemsPrices = cartItems.map(item => item._doc.price * itemsQuantity[item._doc._id.toString()]);
        const itemsShippingCost = cartItems.map(item => item._doc.price / 100);
        const total = itemsPrices.reduce((a, b) => a + b, 0);
        const shippingCost = itemsShippingCost.reduce((a, b) => a + b, 0);
        const quantity = cartItems.length
        cart.items = items;
        cart.shippingCost = shippingCost;
        cart.total = total + shippingCost;
        cart.quantity = quantity;
        await cart.save();
        return res.status(200).json({ card_id, quantity, shippingCost, quantity });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

async function addQuantityToCartItem(req, res) { 
    try {
        const { cart_id } = req.params;
        const { card_id, amount } = req.body;
        const userCart = await Cart.findById(cart_id);
        if (!userCart) throw new Error('Cart not found');
        const cartItem = userCart._doc.items.find(item => item.card_id.toString() === card_id);
        if (!cartItem) throw new Error('Cannot add Quantity');
        const card = await Player.findById(card_id, { quantity: 1, price: 2 });
        const quantity = convertToNumber(amount) + cartItem.quantity;
        const canAddQuantity = card._doc.quantity >= quantity;
        if (!canAddQuantity) throw new Error('Not enough quantity');
        cartItem.quantity = quantity;
        const total = userCart._doc.total + (card._doc.price * amount);
        userCart.items = userCart.items.map(item => item.card_id === cartItem.card_id ? cartItem : item);
        userCart.total = total;
        await userCart.save();
        return res.status(200).json({ card_id, quantity, total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

async function subtractQuantityFromCartItem(req, res) { 
    try {
        const { cart_id } = req.params;
        const { card_id, amount } = req.body;
        const userCart = await Cart.findById(cart_id);
        if (!userCart) throw new Error('Cart not found');
        const cartItem = userCart._doc.items.find(item => item.card_id.toString() === card_id);
        if (!cartItem) throw new Error('No cart item found');
        const card = await Player.findById(card_id, { quantity: 1, price: 2 });
        const quantity = cartItem.quantity - convertToNumber(amount);
        const canAddQuantity = card._doc.quantity > quantity;
        const lessThanOne = quantity < 1;
        if (!canAddQuantity) throw new Error('Not enough quantity');
        if (lessThanOne) throw new Error('Cannot subtract quantity');
        cartItem.quantity = quantity;
        const total = userCart._doc.total - (card._doc.price * amount);
        userCart.items = userCart.items.map(item => item.card_id === cartItem.card_id ? cartItem : item);
        userCart.total = total;
        await userCart.save();
        return res.status(200).json({ card_id, quantity, total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    fetchUserCart,
    addItemToCart,
    removeItemFromCart,
    addQuantityToCartItem,
    subtractQuantityFromCartItem,
};