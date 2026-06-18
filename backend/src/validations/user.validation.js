const { body } = require('express-validator');

const updateProfileValidation = [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').optional().trim().isMobilePhone().withMessage('Invalid phone number')
];

const addressValidation = [
    body('street').notEmpty().withMessage('Street is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('zipCode').notEmpty().withMessage('Zip code is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('isDefault').optional().isBoolean()
];

const changePasswordValidation = [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

module.exports = {
    updateProfileValidation,
    addressValidation,
    changePasswordValidation
};
