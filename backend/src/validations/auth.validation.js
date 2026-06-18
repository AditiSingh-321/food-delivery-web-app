const { body } = require('express-validator');

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['CUSTOMER', 'RESTAURANT_OWNER']).withMessage('Invalid role')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

const passwordResetValidation = [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

module.exports = {
    registerValidation,
    loginValidation,
    passwordResetValidation
};
