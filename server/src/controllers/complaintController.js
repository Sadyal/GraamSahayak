const Complaint = require('../models/Complaint');
const fs = require('fs');
const path = require('path');

// Helper function to safely delete files
const deleteFileSafe = (relativeFilePath) => {
  if (!relativeFilePath) return;
  try {
    const fullPath = path.join(__dirname, '..', relativeFilePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error(`Failed to delete file: ${relativeFilePath}`, err);
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res, next) => {
  try {
    const { complaintType, description } = req.body;

    if (!complaintType || !description) {
      res.status(400);
      throw new Error('Please enter all required fields');
    }

    // Capture file paths from upload middleware
    let imagePath = '';
    let audioPath = '';

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        // Store relative path e.g. "uploads/images/filename.jpg"
        imagePath = `uploads/images/${req.files.image[0].filename}`;
      }
      if (req.files.audio && req.files.audio[0]) {
        audioPath = `uploads/audio/${req.files.audio[0].filename}`;
      }
    }

    const complaint = await Complaint.create({
      citizen: req.user._id,
      complaintType,
      description,
      imagePath,
      audioPath,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint,
    });
  } catch (error) {
    // If error occurs, clean up any uploaded files
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        deleteFileSafe(`uploads/images/${req.files.image[0].filename}`);
      }
      if (req.files.audio && req.files.audio[0]) {
        deleteFileSafe(`uploads/audio/${req.files.audio[0].filename}`);
      }
    }
    next(error);
  }
};

// @desc    Get current logged in citizen's complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen)
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints with filters
// @route   GET /api/complaints/all
// @access  Private (Admin)
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, complaintType, village, date } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }
    if (complaintType) {
      query.complaintType = complaintType;
    }

    // Build filter based on citizen's village
    let citizenIds = [];
    if (village) {
      const users = await require('../models/User').find({ village: { $regex: village, $options: 'i' } });
      citizenIds = users.map((u) => u._id);
      query.citizen = { $in: citizenIds };
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      query.createdAt = {
        $gte: searchDate,
        $lt: nextDay,
      };
    }

    const complaints = await Complaint.find(query)
      .populate('citizen', 'name village wardNumber phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id
// @access  Private (Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!status) {
      res.status(400);
      throw new Error('Please specify a status update');
    }

    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    complaint.status = status;
    if (adminRemarks !== undefined) {
      complaint.adminRemarks = adminRemarks;
    }

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Clean up files locally
    deleteFileSafe(complaint.imagePath);
    deleteFileSafe(complaint.audioPath);

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint and associated files deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
};
