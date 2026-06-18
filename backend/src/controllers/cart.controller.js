const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.food', 'name price images isAvailable');
    
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
    }

    return res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const addToCart = asyncHandler(async (req, res) => {
    const { foodId, quantity } = req.body;

    const food = await Food.findById(foodId);
    if (!food || !food.isAvailable) {
        throw new ApiError(404, "Food item not available");
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = new Cart({
            user: req.user._id,
            restaurant: food.restaurant,
            items: [],
            totalPrice: 0
        });
    }

    // Check if adding from different restaurant
    if (cart.items.length > 0 && cart.restaurant.toString() !== food.restaurant.toString()) {
        throw new ApiError(400, "You can only order from one restaurant at a time. Clear cart to order from a different restaurant.");
    }

    const itemIndex = cart.items.findIndex(item => item.food.toString() === foodId);

    const priceToAdd = food.discountPrice || food.price;

    if (itemIndex > -1) {
        // Item exists, update quantity
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].price = priceToAdd; // Update price in case it changed
    } else {
        // Item does not exist, add it
        cart.items.push({
            food: foodId,
            quantity,
            price: priceToAdd
        });
        cart.restaurant = food.restaurant; // Ensure restaurant is set if it was empty
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await cart.save();
    await cart.populate('items.food', 'name price images');

    return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { foodId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(item => item.food.toString() === foodId);

    if (itemIndex > -1) {
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        if (cart.items.length === 0) {
            cart.restaurant = null; // Clear restaurant if cart is empty
        }

        await cart.save();
        await cart.populate('items.food', 'name price images');

        return res.status(200).json(new ApiResponse(200, cart, "Cart updated"));
    } else {
        throw new ApiError(404, "Item not found in cart");
    }
});

const removeCartItem = asyncHandler(async (req, res) => {
    const { foodId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(item => item.food.toString() !== foodId);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    if (cart.items.length === 0) {
        cart.restaurant = null;
    }

    await cart.save();
    await cart.populate('items.food', 'name price images');

    return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.items = [];
        cart.totalPrice = 0;
        cart.restaurant = null;
        await cart.save();
    }
    
    return res.status(200).json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
