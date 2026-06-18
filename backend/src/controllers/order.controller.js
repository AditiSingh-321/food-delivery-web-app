const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { getIO } = require('../config/socket');

const placeOrder = asyncHandler(async (req, res) => {
    const { paymentMethod, deliveryAddress } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.food').session(session);

        if (!cart || cart.items.length === 0) {
            throw new ApiError(400, "Cart is empty");
        }

        const restaurant = await Restaurant.findById(cart.restaurant).session(session);
        if (!restaurant || !restaurant.isOpen) {
            throw new ApiError(400, "Restaurant is currently closed");
        }

        const orderItems = cart.items.map(item => ({
            food: item.food._id,
            name: item.food.name,
            price: item.price,
            quantity: item.quantity
        }));

        const subtotal = cart.totalPrice;
        const deliveryFee = 50; // Example fixed fee, could be dynamic
        const tax = subtotal * 0.05; // 5% tax
        const totalAmount = subtotal + deliveryFee + tax;

        const order = await Order.create([{
            user: req.user._id,
            restaurant: cart.restaurant,
            items: orderItems,
            subtotal,
            deliveryFee,
            tax,
            totalAmount,
            paymentMethod,
            deliveryAddress,
            paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED', // Simplified for demo
            orderStatus: 'PLACED'
        }], { session });

        // Clear user cart
        cart.items = [];
        cart.totalPrice = 0;
        cart.restaurant = null;
        await cart.save({ session });

        // Create notification for restaurant owner
        await Notification.create([{
            user: restaurant.owner,
            title: 'New Order Received',
            message: `You have received a new order #${order[0]._id}`,
            type: 'ORDER_UPDATE',
            relatedId: order[0]._id
        }], { session });

        await session.commitTransaction();

        // Emit socket event to restaurant owner
        const io = getIO();
        io.to(`restaurant_${restaurant.owner}`).emit('new_order', order[0]);

        return res.status(201).json(new ApiResponse(201, order[0], "Order placed successfully"));
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('restaurant', 'restaurantName logo address location')
        .populate('user', 'name email phone');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Verify ownership or restaurant owner
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        const restaurant = await Restaurant.findOne({ owner: req.user._id });
        if (!restaurant || restaurant._id.toString() !== order.restaurant._id.toString()) {
            throw new ApiError(403, "Not authorized to view this order");
        }
    }

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: req.user._id })
        .populate('restaurant', 'restaurantName logo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Order.countDocuments({ user: req.user._id });

    return res.status(200).json(new ApiResponse(200, {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    }, "Orders fetched successfully"));
});

const getRestaurantOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    const query = { restaurant: restaurant._id };
    if (status) {
        query.orderStatus = status;
    }

    const orders = await Order.find(query)
        .populate('user', 'name phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
    }, "Restaurant orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
        'PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 
        'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const order = await Order.findById(id);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant || restaurant._id.toString() !== order.restaurant.toString()) {
        throw new ApiError(403, "Not authorized to update this order");
    }

    order.orderStatus = status;
    if (status === 'DELIVERED') {
        order.paymentStatus = 'COMPLETED';
    }
    await order.save();

    // Notify user via Socket.io
    const io = getIO();
    io.to(order.user.toString()).emit('order_update', {
        orderId: order._id,
        status: order.orderStatus
    });

    // Also update order room
    io.to(`order_${order._id}`).emit('order_status_change', {
        status: order.orderStatus
    });

    // Save notification
    await Notification.create({
        user: order.user,
        title: 'Order Status Updated',
        message: `Your order #${order._id} is now ${status}`,
        type: 'ORDER_UPDATE',
        relatedId: order._id
    });

    return res.status(200).json(new ApiResponse(200, order, "Order status updated"));
});

const editOrderItems = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { items } = req.body; // Array of { foodId, quantity }

    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to edit this order");
    }

    const fiveMins = 5 * 60 * 1000;
    if (Date.now() - new Date(order.createdAt).getTime() > fiveMins) {
        throw new ApiError(400, "Order can only be edited within 5 minutes of placing");
    }

    if (order.orderStatus !== 'PLACED' && order.orderStatus !== 'CONFIRMED') {
        throw new ApiError(400, `Order cannot be edited because it is already ${order.orderStatus}`);
    }

    if (!items || items.length === 0) {
        throw new ApiError(400, "Order must have at least one item.");
    }

    const Food = require('../models/Food');
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const food = await Food.findById(item.foodId);
        if (!food || !food.isAvailable) throw new ApiError(400, `Food item not available`);
        
        if (food.restaurant.toString() !== order.restaurant.toString()) {
            throw new ApiError(400, `Cannot add items from a different restaurant to this order`);
        }

        const price = food.discountPrice || food.price;
        subtotal += price * item.quantity;

        orderItems.push({
            food: food._id,
            name: food.name,
            price,
            quantity: item.quantity
        });
    }

    order.items = orderItems;
    order.subtotal = subtotal;
    order.tax = subtotal * 0.05;
    order.totalAmount = subtotal + order.deliveryFee + order.tax;

    await order.save();

    const io = getIO();
    io.to(`restaurant_${order.restaurant}`).emit('order_edited', order);

    return res.status(200).json(new ApiResponse(200, order, "Order updated successfully"));
});

module.exports = {
    placeOrder,
    getOrderById,
    getMyOrders,
    getRestaurantOrders,
    updateOrderStatus,
    editOrderItems
};
