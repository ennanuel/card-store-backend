const router = require('express').Router();
const { register, login, logout, authenticate, getDemoUsers } = require('../controllers/auth');
const { verifyToken } = require('../utils/verifyToken');

router.get('/', verifyToken, authenticate);
router.get('/demos', getDemoUsers)
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;