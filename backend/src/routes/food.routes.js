const express = require('express');
const { createFood, updateFood, deleteFood, getFoodsByRestaurant, searchFoods, getFoodById } = require('../controllers/food.controller');
const { verifyJWT, verifyRestaurantOwner } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.get('/search', searchFoods);
router.get('/restaurant/:restaurantId', getFoodsByRestaurant);
router.get('/:id', getFoodById);

// Protected Restaurant Owner routes
router.use(verifyJWT);
router.use(verifyRestaurantOwner);

router.post('/', upload.array('images', 5), createFood);
router.route('/:id')
    .patch(upload.array('images', 5), updateFood)
    .delete(deleteFood);

module.exports = router;
