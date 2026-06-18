const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalRestaurants = await Restaurant.countDocuments();
    const pendingRestaurants = await Restaurant.countDocuments({ isApproved: false });
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
        { $match: { paymentStatus: 'COMPLETED' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.status(200).json(new ApiResponse(200, {
        totalUsers,
        totalRestaurants,
        pendingRestaurants,
        totalOrders,
        totalRevenue
    }, "Dashboard stats fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find({ role: { $ne: 'ADMIN' } })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
        
    const total = await User.countDocuments({ role: { $ne: 'ADMIN' } });

    return res.status(200).json(new ApiResponse(200, {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    }, "Users fetched successfully"));
});

const banUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Toggle ban status logic can be added here, e.g., user.isBanned = true;
    // For this example, we will just delete the user, but soft delete is better.
    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json(new ApiResponse(200, {}, "User removed successfully"));
});

const getPendingRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({ isApproved: false }).populate('owner', 'name email phone');
    return res.status(200).json(new ApiResponse(200, restaurants, "Pending restaurants fetched"));
});

const approveRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true }
    );
    
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    return res.status(200).json(new ApiResponse(200, restaurant, "Restaurant approved"));
});

const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }
    return res.status(200).json(new ApiResponse(200, {}, "Restaurant deleted successfully"));
});

const getAllOrdersAdmin = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find()
        .populate('restaurant', 'restaurantName')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Order.countDocuments();

    return res.status(200).json(new ApiResponse(200, {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    }, "All orders fetched successfully"));
});

const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    let imageUrl = '';

    if (req.file) {
        const result = await uploadOnCloudinary(req.file.path);
        imageUrl = result.url;
    }

    const category = await Category.create({ name, image: imageUrl });

    return res.status(201).json(new ApiResponse(201, category, "Category created"));
});

module.exports = {
    getDashboardStats,
    getAllUsers,
    banUser,
    getPendingRestaurants,
    approveRestaurant,
    deleteRestaurant,
    getAllOrdersAdmin,
    createCategory
};
