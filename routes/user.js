const router = require('express').Router();
const { updateUserInfo, getUserInfo, getAllUsers, deleteUser } = require('../controllers/user');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('../utils/verifyToken');
const { uploadProfileMiddleware } = require('../utils/file');

router.get('/all', verifyTokenAndAdmin, getAllUsers);
router.get('/single/:user_id', verifyTokenAndAuthorization, getUserInfo);
router.put('/:user_id', verifyTokenAndAuthorization, uploadProfileMiddleware, updateUserInfo);
router.delete('/:user_id', verifyTokenAndAuthorization, deleteUser)

module.exports = router;