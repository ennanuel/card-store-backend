const router = require('express').Router();
const { updateUserInfo, getUserInfo, getAllUsers, deleteUser } = require('../controllers/user');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('../utils/verifyToken');
const User = require('../models/User');

router.get('/all', verifyTokenAndAdmin, getAllUsers);
router.put('/:user_id', verifyTokenAndAuthorization, updateUserInfo);
router.get('/find/:user_id', verifyTokenAndAuthorization, getUserInfo);
router.delete('/:user_id', verifyTokenAndAuthorization, deleteUser)

module.exports = router;