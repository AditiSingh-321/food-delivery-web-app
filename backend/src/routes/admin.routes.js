const express = require('express');
const { getDashboardStats, getAllUsers, banUser, getPendingRestaurants, approveRestaurant, deleteRestaurant, getAllOrdersAdmin, createCategory } = require('../controllers/admin.controller');
const { verifyJWT, verifyAdmin } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(verifyJWT);
router.use(verifyAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', banUser);

router.get('/restaurants/pending', getPendingRestaurants);
router.patch('/restaurants/:id/approve', approveRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

router.get('/orders', getAllOrdersAdmin);

router.post('/categories', upload.single('image'), createCategory);

module.exports = router;
