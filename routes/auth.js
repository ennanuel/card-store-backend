const router = require('express').Router();
const { register, login, logout, authenticate } = require('../controllers/auth');
const { verifyToken } = require('../utils/verifyToken');

router.get('/', verifyToken, authenticate);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;