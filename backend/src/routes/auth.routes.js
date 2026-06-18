const express = require('express');
const { registerUser, loginUser, logoutUser, refreshAccessToken, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { registerValidation, loginValidation, passwordResetValidation } = require('../validations/auth.validation');
const { authLimiter } = require('../middleware/rateLimit.middleware');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, registerUser);
router.post('/login', authLimiter, loginValidation, validate, loginUser);
router.post('/logout', verifyJWT, logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:resetToken', passwordResetValidation, validate, resetPassword);

module.exports = router;
