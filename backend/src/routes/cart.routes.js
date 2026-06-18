const express = require('express');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cart.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyJWT);

router.route('/')
    .get(getCart)
    .post(addToCart)
    .delete(clearCart);

router.route('/item')
    .patch(updateCartItem);

router.route('/item/:foodId')
    .delete(removeCartItem);

module.exports = router;
