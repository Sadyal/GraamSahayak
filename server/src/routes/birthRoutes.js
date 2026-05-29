const express = require('express');
const router = express.Router();
const {
  applyBirthCertificate,
  getMyBirthApplications,
  getAllBirthApplications,
  updateBirthApplicationStatus,
  getBirthApplicationById,
} = require('../controllers/birthController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route handling protection
router.use(protect);

// Citizen routes
router.post('/apply', upload.single('document'), applyBirthCertificate);
router.get('/my', getMyBirthApplications);

// Admin routes
router.get('/all', authorize('Admin'), getAllBirthApplications);
router.patch('/:id', authorize('Admin'), updateBirthApplicationStatus);

// Parameterized route (placed at the end to prevent collisions)
router.get('/:id', getBirthApplicationById);

module.exports = router;
