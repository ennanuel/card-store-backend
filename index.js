const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bp = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

const userRoute = require('./routes/user');
const authRoute = require('./routes/auth')
const playerRoute = require('./routes/player');
const sportRoute = require('./routes/sport');
const teamRoute = require('./routes/team');
const searchRoute = require('./routes/search');
const cartRoute = require('./routes/cart');
const paymentRoute = require('./routes/payment');
const orderRoute = require('./routes/order');
const { verifyToken } = require('./utils/verifyToken');

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: [process.env.DEV_URL, process.env.BUILD_URL],
    credentials: true
}));

app.use('/images', express.static('images'));

app.use('/api/auth', authRoute);
app.use('/api/cart', cartRoute);
app.use('/api/user', verifyToken, userRoute);
app.use('/api/player', verifyToken, playerRoute);
app.use('/api/sport', verifyToken, sportRoute);
app.use('/api/team', verifyToken, teamRoute);
app.use('/api/search', verifyToken, searchRoute);
app.use('/api/pay', verifyToken, paymentRoute);
app.use('/api/order', orderRoute);

function startServer() {
    return app.listen(process.env.PORT || 4000, function () {
        console.log('Server running on port %s', process.env.PORT)
    })
};

mongoose.connect(process.env.DB_URL)
    .then(startServer)
    .catch(err => console.error(err));