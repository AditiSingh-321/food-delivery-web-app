const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadOnCloudinary } = require('../config/cloudinary');

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(req.user._id).select("-password");

    return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profileImage: avatar.url
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const addAddress = asyncHandler(async (req, res) => {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    if (isDefault) {
        user.address.forEach(addr => addr.isDefault = false);
    }

    user.address.push({
        street, city, state, zipCode, country, isDefault: isDefault || false
    });

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user.address, "Address added successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    const address = user.address.id(addressId);

    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    if (isDefault) {
        user.address.forEach(addr => addr.isDefault = false);
    }

    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user.address, "Address updated successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    user.address.pull(addressId);

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user.address, "Address deleted successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

module.exports = {
    getCurrentUser,
    updateProfile,
    updateAvatar,
    addAddress,
    updateAddress,
    deleteAddress,
    changeCurrentPassword
};
