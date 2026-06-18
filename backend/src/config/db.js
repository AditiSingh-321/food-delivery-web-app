const mongoose = require('mongoose');
const logger = require('../middleware/logger.middleware');

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB Connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
