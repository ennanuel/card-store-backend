const router = (require('express')).Router();
const { getAllOrders, getUserOrders, getOrdersBasedOnStatus, createOrder, editOrderStatus, getSingleOrder } = require('../controllers/order');
const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('../utils/verifyToken');

router.get('/', verifyTokenAndAdmin, getAllOrders);
router.get('/:user_id', verifyTokenAndAuthorization, getUserOrders);
router.get('/single/:order_id/:user_id', verifyTokenAndAuthorization, getSingleOrder);
router.get('/:filter/:user_id', verifyTokenAndAuthorization, getOrdersBasedOnStatus);
router.post('/create/:user_id', verifyTokenAndAuthorization, createOrder);
router.put('/edit/:order_id', verifyTokenAndAdmin, editOrderStatus);

module.exports = router;