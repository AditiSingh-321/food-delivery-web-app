const express = require('express');
const { getCurrentUser, updateProfile, updateAvatar, addAddress, updateAddress, deleteAddress, changeCurrentPassword } = require('../controllers/user.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { updateProfileValidation, addressValidation, changePasswordValidation } = require('../validations/user.validation');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(verifyJWT);

router.route('/me').get(getCurrentUser);
router.route('/update-account').patch(updateProfileValidation, validate, updateProfile);
router.route('/avatar').patch(upload.single('avatar'), updateAvatar);
router.route('/change-password').post(changePasswordValidation, validate, changeCurrentPassword);

// Address routes
router.route('/address').post(addressValidation, validate, addAddress);
router.route('/address/:addressId')
    .patch(addressValidation, validate, updateAddress)
    .delete(deleteAddress);

module.exports = router;
