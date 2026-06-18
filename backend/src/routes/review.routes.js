const express = require('express');
const { addReview, getRestaurantReviews, getFoodReviews } = require('../controllers/review.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/food/:foodId', getFoodReviews);

router.use(verifyJWT);
router.post('/', addReview);

module.exports = router;
