const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('express-async-handler');

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

const verifyAdmin = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        throw new ApiError(403, "Not authorized as an admin");
    }
});

const verifyRestaurantOwner = asyncHandler(async (req, res, next) => {
    if (req.user && (req.user.role === 'RESTAURANT_OWNER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        throw new ApiError(403, "Not authorized as a restaurant owner");
    }
});

module.exports = {
    verifyJWT,
    verifyAdmin,
    verifyRestaurantOwner
};
