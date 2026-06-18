const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        restaurantName: {
            type: String,
            required: [true, 'Restaurant name is required'],
            trim: true,
            index: true
        },
        logo: {
            type: String,
            default: ''
        },
        banner: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            required: [true, 'Description is required']
        },
        cuisine: [
            {
                type: String,
                trim: true
            }
        ],
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                index: '2dsphere',
                default: [0, 0]
            }
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        isOpen: {
            type: Boolean,
            default: true
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        deliveryTime: {
            type: String, // e.g., '30-45 mins'
            default: '30-45 mins'
        }
    },
    {
        timestamps: true
    }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
