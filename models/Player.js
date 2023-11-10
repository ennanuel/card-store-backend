const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PlayerSchema = Schema(
    {
        names: {
            first: {
                type: String,
                required: [true, 'Player must have first name']
            },
            last: {
                type: String,
                default: ''
            },
            middle: {
                type: String,
                default: ''
            }
        },
        desc: {
            type: String,
            required: [true, 'Player must have description'],
        },
        price: {
            type: Number,
            required: [true, 'Player Card must price'],
        },
        rating: {
            type: Number,
            required: [true, 'Player must have rating'],
        },
        sport: {
            type: String,
            required: [true, 'Player sport category not specified'],
        },
        team: {
            type: String,
            required: [true, 'Player team not specified']
        },
        image: {
            type: String,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Card must have an owner']
        },
        quantity: {
            type: Number,
            required: [true, 'Card must have quantity']
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Player', PlayerSchema)