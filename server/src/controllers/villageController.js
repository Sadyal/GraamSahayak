const Village = require('../models/Village');

// @desc    Get all villages and their wards
// @route   GET /api/villages
// @access  Public
const getVillages = async (req, res, next) => {
  try {
    const villages = await Village.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: villages.length,
      data: villages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new village profile (SuperAdmin only)
// @route   POST /api/villages
// @access  Private (SuperAdmin)
const createVillage = async (req, res, next) => {
  try {
    const { name, wards, district, state } = req.body;

    if (!name || !wards || !Array.isArray(wards) || wards.length === 0) {
      res.status(400);
      throw new Error('Please enter a village name and configure at least one ward');
    }

    // Check if village already exists
    const villageExists = await Village.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (villageExists) {
      res.status(400);
      throw new Error('Village already exists with this name');
    }

    const village = await Village.create({
      name,
      wards: wards.map(w => w.trim()).filter(w => w !== ''),
      district: district || '',
      state: state || '',
    });

    res.status(201).json({
      success: true,
      message: 'Village profile created successfully',
      data: village,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a village profile (SuperAdmin only)
// @route   DELETE /api/villages/:id
// @access  Private (SuperAdmin)
const deleteVillage = async (req, res, next) => {
  try {
    const village = await Village.findById(req.params.id);

    if (!village) {
      res.status(404);
      throw new Error('Village profile not found');
    }

    await village.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Village profile deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVillages,
  createVillage,
  deleteVillage,
};
