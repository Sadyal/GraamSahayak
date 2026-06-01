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

    // Build filter based on citizen's village with strict Admin separation
    let targetVillage = village;
    if (req.user.role === 'Admin') {
      targetVillage = req.user.village; // Enforce regular Admin's village
    }

    let citizenIds = [];
    if (targetVillage) {
      const users = await require('../models/User').find({ village: { $regex: `^${targetVillage}$`, $options: 'i' } });
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

    let complaint = await Complaint.findById(req.params.id).populate('citizen');
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Village isolation check: Admin can only modify complaints from their own village
    if (req.user.role === 'Admin' && (!complaint.citizen || complaint.citizen.village.toLowerCase() !== req.user.village.toLowerCase())) {
      res.status(403);
      throw new Error('Not authorized to access or modify records of other villages.');
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
    const complaint = await Complaint.findById(req.params.id).populate('citizen');

    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Village isolation check: Admin can only delete complaints from their own village
    if (req.user.role === 'Admin' && (!complaint.citizen || complaint.citizen.village.toLowerCase() !== req.user.village.toLowerCase())) {
      res.status(403);
      throw new Error('Not authorized to access or modify records of other villages.');
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

// @desc    Submit feedback/rating for a resolved complaint
// @route   POST /api/complaints/:id/rate
// @access  Private (Citizen)
const rateComplaintResolution = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      res.status(400);
      throw new Error('Please enter a rating score');
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400);
      throw new Error('Rating must be an integer between 1 and 5');
    }

    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      res.status(404);
      throw new Error('Complaint not found');
    }

    // Enforce ownership: only the citizen who filed the complaint can rate it
    if (complaint.citizen.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to submit feedback for this complaint');
    }

    // Enforce state: only resolved complaints can be rated
    if (complaint.status !== 'Resolved') {
      res.status(400);
      throw new Error('Feedback can only be submitted for resolved grievances');
    }

    // Enforce single feedback
    if (complaint.feedback && complaint.feedback.rating) {
      res.status(400);
      throw new Error('You have already submitted feedback for this grievance');
    }

    complaint.feedback = {
      rating: ratingNum,
      comment: (comment || '').trim(),
      ratedAt: Date.now(),
    };

    const updatedComplaint = await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: updatedComplaint,
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
  rateComplaintResolution,
};
