const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Food'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
