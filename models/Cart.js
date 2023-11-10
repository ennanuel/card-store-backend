const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CartSchema = Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Cart must have a user'],
        unique: true
    },
    items: [
        {
            card_id: {
                type: Schema.Types.ObjectId,
                ref: 'Player',
                required: [true, 'Card missing id'],
                unique: true
            },
            quantity: {
                type: Number,
                required: [true, 'Must specify quantity']
            }
        }
    ],
    total: {
        type: Number,
        required: [true, 'Cart total amount required'],
        default: 0
    },
    shippingCost: {
        type: Number,
        required: [true, 'Shipping cost required'],
        default: 0
    },
    quantity: {
        type: Number,
        required: [true, 'Cart size required'],
        default: 0,
    }
})

module.exports = mongoose.model('Cart', CartSchema);