const asyncHandler = require('express-async-handler');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadOnCloudinary } = require('../config/cloudinary');

const createFood = asyncHandler(async (req, res) => {
    const { name, description, price, discountPrice, stock, category } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    const imageUrls = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const uploadResult = await uploadOnCloudinary(file.path);
            if (uploadResult) {
                imageUrls.push(uploadResult.url);
            }
        }
    }

    if (imageUrls.length === 0) {
        throw new ApiError(400, "At least one image is required");
    }

    const food = await Food.create({
        restaurant: restaurant._id,
        category,
        name,
        description,
        price,
        discountPrice,
        stock,
        images: imageUrls
    });

    return res.status(201).json(new ApiResponse(201, food, "Food created successfully"));
});

const updateFood = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, price, discountPrice, stock, category, isAvailable } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const food = await Food.findOne({ _id: id, restaurant: restaurant._id });

    if (!food) {
        throw new ApiError(404, "Food item not found or you don't have permission");
    }

    if (req.files && req.files.length > 0) {
        const imageUrls = [];
        for (const file of req.files) {
            const uploadResult = await uploadOnCloudinary(file.path);
            if (uploadResult) {
                imageUrls.push(uploadResult.url);
            }
        }
        if (imageUrls.length > 0) {
            food.images = [...food.images, ...imageUrls];
        }
    }

    if (name) food.name = name;
    if (description) food.description = description;
    if (price) food.price = price;
    if (discountPrice !== undefined) food.discountPrice = discountPrice;
    if (stock !== undefined) food.stock = stock;
    if (category) food.category = category;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;

    await food.save();

    return res.status(200).json(new ApiResponse(200, food, "Food updated successfully"));
});

const deleteFood = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    const food = await Food.findOneAndDelete({ _id: id, restaurant: restaurant._id });

    if (!food) {
        throw new ApiError(404, "Food item not found or you don't have permission");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Food deleted successfully"));
});

const getFoodsByRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const foods = await Food.find({ restaurant: restaurantId, isAvailable: true }).populate('category', 'name');
    
    return res.status(200).json(new ApiResponse(200, foods, "Foods fetched successfully"));
});

const searchFoods = asyncHandler(async (req, res) => {
    const { page = 1, limit = 100, search, category, minPrice, maxPrice, sortBy = 'rating', order = 'desc' } = req.query;

    const query = { isAvailable: true };

    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
        query.category = category;
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOption = {};
    sortOption[sortBy] = order === 'desc' ? -1 : 1;

    const foods = await Food.find(query)
        .populate('restaurant', 'restaurantName logo isOpen')
        .populate('category', 'name')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Food.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        foods,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    }, "Foods fetched successfully"));
});

const getFoodById = asyncHandler(async (req, res) => {
    const food = await Food.findById(req.params.id)
        .populate('restaurant', 'restaurantName logo isOpen location')
        .populate('category', 'name');

    if (!food) {
        throw new ApiError(404, "Food not found");
    }

    return res.status(200).json(new ApiResponse(200, food, "Food fetched successfully"));
});

module.exports = {
    createFood,
    updateFood,
    deleteFood,
    getFoodsByRestaurant,
    searchFoods,
    getFoodById
};
