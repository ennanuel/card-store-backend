const router = (require('express')).Router();
const { fetchUserCart, addItemToCart, removeItemFromCart, addQuantityToCartItem, subtractQuantityFromCartItem } = require('../controllers/cart');
const { verifyTokenAndAuthorization } = require('../utils/verifyToken');

router.get('/:user_id', verifyTokenAndAuthorization, fetchUserCart);
router.put('/item/add/:cart_id/:user_id', verifyTokenAndAuthorization, addItemToCart);
router.put('/item/remove/:cart_id/:user_id', verifyTokenAndAuthorization, removeItemFromCart);
router.put('/quantity/add/:cart_id/:user_id', verifyTokenAndAuthorization, addQuantityToCartItem);
router.put('/quantity/remove/:cart_id/:user_id', verifyTokenAndAuthorization, subtractQuantityFromCartItem);

module.exports = router;