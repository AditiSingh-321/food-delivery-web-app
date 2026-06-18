const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadOnCloudinary } = require('../config/cloudinary');

const createRestaurant = asyncHandler(async (req, res) => {
    const { restaurantName, description, cuisine, street, city, state, zipCode, country, deliveryTime, coordinates } = req.body;

    const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
    if (existingRestaurant) {
        throw new ApiError(400, "You already have a restaurant registered");
    }

    let logoUrl = '';
    let bannerUrl = '';

    if (req.files && req.files.logo && req.files.logo.length > 0) {
        const logo = await uploadOnCloudinary(req.files.logo[0].path);
        logoUrl = logo.url;
    }

    if (req.files && req.files.banner && req.files.banner.length > 0) {
        const banner = await uploadOnCloudinary(req.files.banner[0].path);
        bannerUrl = banner.url;
    }

    let parsedCuisine = [];
    if (typeof cuisine === 'string') {
        parsedCuisine = JSON.parse(cuisine);
    } else {
        parsedCuisine = cuisine;
    }

    let parsedCoordinates = [0, 0];
    if (coordinates) {
        parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
    }

    const restaurant = await Restaurant.create({
        owner: req.user._id,
        restaurantName,
        description,
        cuisine: parsedCuisine,
        address: { street, city, state, zipCode, country },
        location: {
            type: 'Point',
            coordinates: parsedCoordinates
        },
        deliveryTime,
        logo: logoUrl,
        banner: bannerUrl,
        isApproved: false // Requires admin approval
    });

    return res.status(201).json(new ApiResponse(201, restaurant, "Restaurant created successfully. Waiting for admin approval."));
});

const getMyRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }
    return res.status(200).json(new ApiResponse(200, restaurant, "Restaurant fetched successfully"));
});

const updateRestaurant = asyncHandler(async (req, res) => {
    const { restaurantName, description, cuisine, street, city, state, zipCode, country, deliveryTime, isOpen } = req.body;
    
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    if (req.files && req.files.logo && req.files.logo.length > 0) {
        const logo = await uploadOnCloudinary(req.files.logo[0].path);
        restaurant.logo = logo.url;
    }

    if (req.files && req.files.banner && req.files.banner.length > 0) {
        const banner = await uploadOnCloudinary(req.files.banner[0].path);
        restaurant.banner = banner.url;
    }

    if (restaurantName) restaurant.restaurantName = restaurantName;
    if (description) restaurant.description = description;
    if (cuisine) restaurant.cuisine = typeof cuisine === 'string' ? JSON.parse(cuisine) : cuisine;
    if (street || city || state || zipCode || country) {
        restaurant.address = {
            street: street || restaurant.address.street,
            city: city || restaurant.address.city,
            state: state || restaurant.address.state,
            zipCode: zipCode || restaurant.address.zipCode,
            country: country || restaurant.address.country
        };
    }
    if (deliveryTime) restaurant.deliveryTime = deliveryTime;
    if (isOpen !== undefined) restaurant.isOpen = isOpen;

    await restaurant.save();

    return res.status(200).json(new ApiResponse(200, restaurant, "Restaurant updated successfully"));
});

const getAllRestaurants = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, cuisine, sortBy = 'rating', order = 'desc' } = req.query;

    const query = { isApproved: true, isOpen: true };

    if (search) {
        query.restaurantName = { $regex: search, $options: 'i' };
    }

    if (cuisine) {
        query.cuisine = { $in: [cuisine] };
    }

    const sortOption = {};
    sortOption[sortBy] = order === 'desc' ? -1 : 1;

    const restaurants = await Restaurant.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Restaurant.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        restaurants,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    }, "Restaurants fetched successfully"));
});

const getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }
    return res.status(200).json(new ApiResponse(200, restaurant, "Restaurant fetched successfully"));
});

module.exports = {
    createRestaurant,
    getMyRestaurant,
    updateRestaurant,
    getAllRestaurants,
    getRestaurantById
};
