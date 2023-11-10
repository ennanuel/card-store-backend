const jwt = require('jsonwebtoken');

function verifyToken (req, res, next) {
    const userToken = req.cookies.userToken
    if (!userToken) return res.status(401).json({ message: 'You are not authenticated.' });
    jwt.verify(userToken, process.env.JWT_SEC_KEY, (err, user) => {
        if(err) return res.status(401).json({ message: 'Token is not valid.' });
        req.user = user;
        next();
    })
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