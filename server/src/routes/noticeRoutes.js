const express = require('express');
const router = express.Router();
const {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Get active notices (Public)
router.get('/', getNotices);

// Protected routes (Admin, SuperAdmin)
router.post('/', protect, authorize('Admin', 'SuperAdmin'), createNotice);
router.put('/:id', protect, authorize('Admin', 'SuperAdmin'), updateNotice);
router.delete('/:id', protect, authorize('Admin', 'SuperAdmin'), deleteNotice);

module.exports = router;
