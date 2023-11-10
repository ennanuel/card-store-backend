const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order must have a specified User']
    },
    cards: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Player',
            required: [true, 'Card ID missing']
        },
        names: {
            first: { 
                type: String,
                required: [true, 'Card must have a first name']
            },
            middle: {
                type: String,
                default: ''
            },
            last: {
                type: String,
                default: ''
            }
        },
        quantity: {
            type: Number,
            required: [true, 'Card quantity required']
        }
    }],
    amount: {
        type: Number,
        required: [true, 'Order must have a total price']
    },
    destination: {
        type: String,
        required: [true, 'Order must have a destination']
    },
    status: {
        type: String,
        enum: ['PENDING', 'CANCELLED', 'SUCCESS'],
        required: [true, 'Order must have a status'],
        default: 'PENDING'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);