const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Player = require('../models/Player');
const { resetCart } = require('../utils/cart');
const { getCardNamesString } = require('../utils/order');

const STATUS_TYPES = ['PENDING', 'CANCELLED', 'SUCCESS'];

async function getAllOrders(req, res) {
    try {
        const { page } = req.query;
        const currentPage = /nan/i.test(Number(page)) ? 0 : page;
        const limit = 10;
        const skip = currentPage * limit;
        const foundOrders = await Order.find().limit(limit).skip(skip).sort({ createdAt: -1 });
        const orders = foundOrders.map(getCardNamesString);
        const count = await Order.countDocuments();
        const totalPages = Math.ceil(count / limit);
        return res.status(200).json({ orders, totalPages, currentPage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

async function getUserOrders (req, res) {
    try {
        const { user_id } = req.params;
        const { page } = req.query;
        const currentPage = /nan/i.test(Number(page)) ? 0 : page;
        const limit = 5;
        const skip = currentPage * limit;
        const foundOrders = await Order.find({ user_id }).limit(limit).skip(skip).sort({ createdAt: -1 });
        const orders = foundOrders.map(getCardNamesString);
        const count = await Order.countDocuments();
        const totalPages = Math.ceil(count / limit);
        return res.status(200).json({ orders, totalPages, currentPage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function getOrdersBasedOnStatus(req, res) { 
    try {
        const { filter, user_id } = req.params;
        const { page } = req.query;
        if (!filter || !STATUS_TYPES.includes(filter.toUpperCase())) return getUserOrders(req, res);
        const status = STATUS_TYPES.find(type => type === filter.toUpperCase()) || 'PENDING';
        const currentPage = /nan/i.test(Number(page)) ? 0 : page;
        const limit = 5;
        const skip = currentPage * limit;
        const foundOrders = await Order.find({ user_id, status }).limit(limit).skip(skip).sort({ createdAt: -1 });
        const orders = foundOrders.map(getCardNamesString);
        const count = await Order.countDocuments({ user_id, status });
        const totalPages = Math.ceil(count / limit);
        return res.status(200).json({ orders, totalPages, currentPage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function getSingleOrder (req, res) {
    try {
        const { order_id } = req.params;
        const order = await Order.findById(order_id);
        if (!order) throw new Error('No order found.');
        return res.status(200).json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function createOrder (req, res) {
    try {
        const { user_id } = req.params;
        const { destination = 'Lagos, Nigeria' } = req.body;
        const userCart = await Cart.findOne({ user_id }, 'items total');
        const itemIds = userCart._doc.items.map(item => item.card_id);
        const foundItems = await Player.find({ _id: { $in: itemIds } }, 'names quantity');
        if (foundItems.length < 1) throw new Error('Cart is empty');
        const itemsQuantity = userCart.items.reduce((a, b) => ({ ...a, [b.card_id.toString()]: b.quantity }), {});
        const itemsWithNames = foundItems.map(item => ({ ...item, quantity: itemsQuantity[item._doc._id.toString()] }));
        const order = { user_id, cards: itemsWithNames, amount: userCart.total, destination };
        const newOrder = new Order(order);
        await newOrder.save();
        foundItems.forEach(async (player) => {
            player.quantity = player._doc.quantity - itemsQuantity[player._id.toString()];
            await player.save();
        });
        const { failed, message } = await resetCart(userCart);
        if (failed) throw new Error(message);
        const order_id = newOrder._doc._id.toString();
        return res.status(200).json({ order_id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

async function editOrderStatus (req, res) {
    try {
        const { order_id } = req.params;
        const { orderStatus } = req.query;
        if (!['CANCELLED', 'SUCCESS'].includes(orderStatus.toUpperCase())) throw new Error('Invalid status');
        const status = orderStatus.toUpperCase();
        const updatedOrder = await Order.findOneAndUpdate({ _id: order_id }, { $set: { status } });
        if (!updatedOrder) throw new Error('No orders found');
        return res.status(200).json({ message: 'Order updated' });
    } catch (error) { 
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getAllOrders,
    getUserOrders,
    getSingleOrder,
    getOrdersBasedOnStatus,
    createOrder,
    editOrderStatus
}