const Notice = require('../models/Notice');

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Admin, SuperAdmin)
const createNotice = async (req, res, next) => {
  try {
    const { title, description, category, severity, expiryDate } = req.body;

    if (!title || !description) {
      res.status(400);
      throw new Error('Please enter all required fields');
    }

    // Set village based on role
    let targetVillage = 'All';
    if (req.user.role === 'Admin') {
      targetVillage = req.user.village; // Enforce regular Admin's village
    } else if (req.user.role === 'SuperAdmin' && req.body.village) {
      targetVillage = req.body.village;
    }

    // Validate expiry date if provided
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        res.status(400);
        throw new Error('Expiry date must be in the future');
      }
    }

    const notice = await Notice.create({
      title,
      description,
      category: category || 'Notice',
      severity: severity || 'Info',
      village: targetVillage,
      publishedBy: req.user._id,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active notices (Public and filtered by village)
// @route   GET /api/notices
// @access  Public
const getNotices = async (req, res, next) => {
  try {
    const { village } = req.query;
    const now = new Date();

    // Query for active announcements (not expired or expiry date in the future)
    let query = {
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gt: now } },
      ],
    };

    // If village is specified in query or inferred from logged in user
    let targetVillages = ['All'];
    
    if (village) {
      targetVillages.push(village);
    } else if (req.user && req.user.village) {
      targetVillages.push(req.user.village);
    }

    query.village = { $in: targetVillages.map(v => new RegExp(`^${v}$`, 'i')) };

    const notices = await Notice.find(query)
      .populate('publishedBy', 'name village role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (Admin, SuperAdmin)
const updateNotice = async (req, res, next) => {
  try {
    const { title, description, category, severity, expiryDate } = req.body;

    let notice = await Notice.findById(req.params.id);
    if (!notice) {
      res.status(404);
      throw new Error('Announcement not found');
    }

    // Village isolation check: Admin can only update notices of their own village
    if (req.user.role === 'Admin' && notice.village.toLowerCase() !== req.user.village.toLowerCase()) {
      res.status(403);
      throw new Error('Not authorized to modify announcements of other villages');
    }

    // Validate expiry date if provided
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        res.status(400);
        throw new Error('Expiry date must be in the future');
      }
    }

    notice.title = title || notice.title;
    notice.description = description || notice.description;
    notice.category = category || notice.category;
    notice.severity = severity || notice.severity;
    notice.expiryDate = expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : notice.expiryDate;

    // SuperAdmin can change target village
    if (req.user.role === 'SuperAdmin' && req.body.village) {
      notice.village = req.body.village;
    }

    const updatedNotice = await notice.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: updatedNotice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin, SuperAdmin)
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      res.status(404);
      throw new Error('Announcement not found');
    }

    // Village isolation check: Admin can only delete notices of their own village
    if (req.user.role === 'Admin' && notice.village.toLowerCase() !== req.user.village.toLowerCase()) {
      res.status(403);
      throw new Error('Not authorized to delete announcements of other villages');
    }

    await notice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotice,
  getNotices,
  updateNotice,
  deleteNotice,
};
