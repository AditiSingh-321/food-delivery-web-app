const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        phone: {
            type: String,
            trim: true
        },
        profileImage: {
            type: String,
            default: ''
        },
        address: [
            {
                street: String,
                city: String,
                state: String,
                zipCode: String,
                country: String,
                isDefault: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        role: {
            type: String,
            enum: ['CUSTOMER', 'RESTAURANT_OWNER', 'ADMIN'],
            default: 'CUSTOMER'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        refreshToken: {
            type: String
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
