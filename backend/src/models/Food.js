const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        name: {
            type: String,
            required: [true, 'Food name is required'],
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: [true, 'Description is required']
        },
        images: [
            {
                type: String
            }
        ],
        price: {
            type: Number,
            required: [true, 'Price is required']
        },
        discountPrice: {
            type: Number
        },
        stock: {
            type: Number,
            default: -1 // -1 means unlimited
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewsCount: {
            type: Number,
            default: 0
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Food = mongoose.model('Food', foodSchema);
module.exports = Food;
