const jwt = require('jsonwebtoken');
const InvalidTokens = require('../models/InvalidTokens');

function verifyToken (req, res, next) {
    const userToken = req.cookies.userToken;
    if (!userToken) return res.status(401).json({ message: 'You are not authenticated.' });
    InvalidTokens
        .findOne({ token: userToken })
        .then(invalidToken => {
            if (invalidToken) return res.status(401).json({ message: 'Invalid token' });
            jwt.verify(userToken, process.env.JWT_SEC_KEY, (err, user) => {
                if(err) return res.status(401).json({ message: 'Token is not valid.' });
                req.user = user;
                next();
            })
        })
        .catch(() => {
            console.error(error);
            return res.status(401).json({ message: error.messge });
        });
}

function verifyTokenAndAuthorization (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.user_id || req.user.isAdmin) next();
        else return res.status(403).json({ message: 'You are not authorized to do this' });
    })
}

function verifyTokenAndAdmin (req, res, next) {
    verifyToken(req, res, () => {
        if(req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: 'You are not authorized to do this, you are not an admin.' });
        }
    })
}

module.exports = { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin }