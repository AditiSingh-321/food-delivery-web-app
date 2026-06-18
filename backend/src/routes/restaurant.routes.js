const express = require('express');
const { createRestaurant, getMyRestaurant, updateRestaurant, getAllRestaurants, getRestaurantById } = require('../controllers/restaurant.controller');
const { verifyJWT, verifyRestaurantOwner } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Protected Restaurant Owner routes
router.use(verifyJWT);
router.use(verifyRestaurantOwner);

router.route('/manage')
    .post(upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]), createRestaurant)
    .get(getMyRestaurant)
    .patch(upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]), updateRestaurant);

module.exports = router;
