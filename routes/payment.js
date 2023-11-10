const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const Cart = require('../models/Cart');
const { verifyTokenAndAuthorization } = require('../utils/verifyToken');

router.post('/:user_id', verifyTokenAndAuthorization, async function createPaymentIntent(req, res) {
    try {
        const { user_id } = req.params;
        const userCart = await Cart.findOne({ user_id }, { total: 1, items: 2 });
        if (!userCart) throw new Error('No carts found');
        if (!userCart.items.length > 0) throw new Error('Your cart is empty');
        const totalInCents = Math.round(userCart.total * 100);
        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'usd',
            amount: 2000 /* change this */,
            payment_method_types: ['card'],
            automatic_payment_methods: {
                enabled: false,
            }
        });
        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
})

module.exports = router;