const express = require('express');
const router = express.Router();
const {
  applyDeathCertificate,
  getMyDeathApplications,
  getAllDeathApplications,
  updateDeathApplicationStatus,
  getDeathApplicationById,
} = require('../controllers/deathController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route handling protection
router.use(protect);

// Citizen routes
router.post('/apply', upload.single('document'), applyDeathCertificate);
router.get('/my', getMyDeathApplications);

// Admin routes
router.get('/all', authorize('Admin'), getAllDeathApplications);
router.patch('/:id', authorize('Admin'), updateDeathApplicationStatus);

// Parameterized route (placed at the end to prevent collisions)
router.get('/:id', getDeathApplicationById);

module.exports = router;
