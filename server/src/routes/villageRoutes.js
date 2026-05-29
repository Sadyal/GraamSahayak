const express = require('express');
const router = express.Router();
const {
  getVillages,
  createVillage,
  deleteVillage,
} = require('../controllers/villageController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public route to fetch villages list
router.get('/', getVillages);

// Private SuperAdmin actions
router.post('/', protect, authorize('SuperAdmin'), createVillage);
router.delete('/:id', protect, authorize('SuperAdmin'), deleteVillage);

module.exports = router;
