const { Server } = require('socket.io');
const logger = require('../middleware/logger.middleware');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware for socket
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token || 
                          (socket.handshake.headers.cookie ? socket.handshake.headers.cookie.split('accessToken=')[1]?.split(';')[0] : null);
            
            if (!token) {
                return next(new Error('Authentication error: Token not provided'));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.user._id}`);
        
        // Join user's personal room to receive personal notifications/order updates
        socket.join(socket.user._id);

        if (socket.user.role === 'RESTAURANT_OWNER') {
            // Join a special room for restaurant owners to get new order notifications
            socket.join(`restaurant_${socket.user._id}`);
        }

        socket.on('join_order', (orderId) => {
            socket.join(`order_${orderId}`);
            logger.info(`User ${socket.user._id} joined order room: ${orderId}`);
        });

        socket.on('leave_order', (orderId) => {
            socket.leave(`order_${orderId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.user._id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIO
};
