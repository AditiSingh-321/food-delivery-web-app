const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant' // A cart is typically associated with one restaurant at a time in food delivery apps
        },
        items: [cartItemSchema],
        totalPrice: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
