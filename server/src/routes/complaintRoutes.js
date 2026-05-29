const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Fields for complaint: optionally 1 image and 1 audio file
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]);

// Protected routes
router.use(protect);

// Citizen routes
router.post('/', uploadFields, createComplaint);
router.get('/my', getMyComplaints);

// Admin-only routes
router.get('/all', authorize('Admin'), getAllComplaints);
router.patch('/:id', authorize('Admin'), updateComplaintStatus);
router.delete('/:id', authorize('Admin'), deleteComplaint);

module.exports = router;
