const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getAllAdmins,
  updateAdminStatus,
  deleteAdmin,
  getVillagers,
  updateVillager,
  deleteVillager,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Super Admin Admin Management routes
router.get('/admins', protect, authorize('SuperAdmin'), getAllAdmins);
router.patch('/admins/:id', protect, authorize('SuperAdmin'), updateAdminStatus);
router.delete('/admins/:id', protect, authorize('SuperAdmin'), deleteAdmin);

// Regular Admin Villagers Directory routes
router.get('/villagers', protect, authorize('Admin'), getVillagers);
router.put('/villagers/:id', protect, authorize('Admin'), updateVillager);
router.delete('/villagers/:id', protect, authorize('Admin'), deleteVillager);

module.exports = router;
