const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    name: String,
    price: Number,
    quantity: Number
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },
        items: [orderItemSchema],
        subtotal: {
            type: Number,
            required: true
        },
        deliveryFee: {
            type: Number,
            default: 0
        },
        tax: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'CARD', 'UPI'],
            default: 'COD'
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
            default: 'PENDING'
        },
        orderStatus: {
            type: String,
            enum: [
                'PLACED',
                'CONFIRMED',
                'PREPARING',
                'READY_FOR_PICKUP',
                'OUT_FOR_DELIVERY',
                'DELIVERED',
                'CANCELLED'
            ],
            default: 'PLACED'
        },
        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
