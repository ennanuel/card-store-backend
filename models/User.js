const mongoose = require('mongoose');
const { isEmail } = require('validator');
const Cart = require('./Cart');
const { hashPassword } = require('../utils/auth');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username not specified'],
            unique: true
        },
        names: {
            first: {
                type: String,
                required: [true, 'User\'s first name not specified'],
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
        email: {
            type: String,
            required: [true, 'Email not specified'],
            unique: true,
            validate: [isEmail, 'Please use a valid email']
        },
        password: {
            type: String,
            required: [true, 'User must have a password'],
            minlength: [8, 'Password too short']
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        profilePic: String,
        phone: Number,
        address: String,
        dob: Date,
        bank: String,
        account_number: Number
    },
    { timestamps: true }
);

UserSchema.pre('save', function (next) { 
    const password = this.password;
    this.password = hashPassword(password);
    next();
});

UserSchema.post('save', function (doc, next) { 
    const cart = new Cart({ user_id: doc._id, items: [] });
    cart.save()
        .then(() => next())
        .catch((error) => {
            console.error(error);
            next()
        });
});

module.exports = mongoose.model('User', UserSchema);