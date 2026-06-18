const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Security and utility middlewares
app.use(helmet()); // Set security HTTP headers
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(compression()); // Compress all responses
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Rate limiting globally
const { apiLimiter } = require('./middleware/rateLimit.middleware');
app.use('/api/', apiLimiter);

// Import Routes
const authRouter = require('./routes/auth.routes');
const userRouter = require('./routes/user.routes');
const restaurantRouter = require('./routes/restaurant.routes');
const foodRouter = require('./routes/food.routes');
const cartRouter = require('./routes/cart.routes');
const orderRouter = require('./routes/order.routes');
const reviewRouter = require('./routes/review.routes');
const adminRouter = require('./routes/admin.routes');

// Mount Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/restaurants', restaurantRouter);
app.use('/api/v1/foods', foodRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/admin', adminRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Unknown route handler
app.all('*', (req, res, next) => {
    const ApiError = require('./utils/ApiError');
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);

module.exports = app;
