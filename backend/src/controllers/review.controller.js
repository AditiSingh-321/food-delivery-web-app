const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const addReview = asyncHandler(async (req, res) => {
    const { restaurantId, foodId, rating, comment } = req.body;

    // Check if user has ordered from this restaurant/food before
    const query = {
        user: req.user._id,
        restaurant: restaurantId,
        orderStatus: 'DELIVERED'
    };
    
    const hasOrdered = await Order.findOne(query);
    if (!hasOrdered) {
        throw new ApiError(403, "You can only review after receiving an order");
    }

    const existingReview = await Review.findOne({
        user: req.user._id,
        restaurant: restaurantId,
        food: foodId || null
    });

    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this");
    }

    const review = await Review.create({
        user: req.user._id,
        restaurant: restaurantId,
        food: foodId,
        rating,
        comment
    });

    // Update restaurant rating
    const reviews = await Review.find({ restaurant: restaurantId, food: null });
    const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
    
    await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: avgRating,
        totalReviews: reviews.length
    });

    // If food review, update food rating
    if (foodId) {
        const foodReviews = await Review.find({ food: foodId });
        const avgFoodRating = foodReviews.reduce((acc, item) => acc + item.rating, 0) / foodReviews.length;
        await Food.findByIdAndUpdate(foodId, {
            rating: avgFoodRating,
            reviewsCount: foodReviews.length
        });
    }

    return res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
});

const getRestaurantReviews = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ restaurant: restaurantId, food: null })
        .populate('user', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Review.countDocuments({ restaurant: restaurantId, food: null });

    return res.status(200).json(new ApiResponse(200, {
        reviews,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    }, "Reviews fetched successfully"));
});

const getFoodReviews = asyncHandler(async (req, res) => {
    const { foodId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ food: foodId })
        .populate('user', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Review.countDocuments({ food: foodId });

    return res.status(200).json(new ApiResponse(200, {
        reviews,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    }, "Food reviews fetched successfully"));
});

module.exports = {
    addReview,
    getRestaurantReviews,
    getFoodReviews
};
