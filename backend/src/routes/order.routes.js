const express = require('express');
const { placeOrder, getOrderById, getMyOrders, getRestaurantOrders, updateOrderStatus, editOrderItems } = require('../controllers/order.controller');
const { verifyJWT, verifyRestaurantOwner } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(verifyJWT);

router.route('/')
    .post(placeOrder)
    .get(getMyOrders);

router.get('/:id', getOrderById);
router.patch('/:id/edit', editOrderItems);

// Restaurant specific
router.get('/restaurant/all', verifyRestaurantOwner, getRestaurantOrders);
router.patch('/:id/status', verifyRestaurantOwner, updateOrderStatus);

module.exports = router;
