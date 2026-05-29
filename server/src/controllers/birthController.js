const BirthApplication = require('../models/BirthApplication');
const { generateCertificateId, generateApplicationNumber } = require('../utils/generateCertificateId');
const fs = require('fs');
const path = require('path');

// Helper to safely delete file
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

// @desc    Apply for a Birth Certificate
// @route   POST /api/birth/apply
// @access  Private (Citizen)
const applyBirthCertificate = async (req, res, next) => {
  try {
    const {
      childName,
      gender,
      dateOfBirth,
      placeOfBirth,
      fatherName,
      motherName,
    } = req.body;

    if (!childName || !gender || !dateOfBirth || !placeOfBirth || !fatherName || !motherName) {
      res.status(400);
      throw new Error('Please fill in all details');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload supporting documents');
    }

    const documentPath = `uploads/documents/${req.file.filename}`;
    const applicationNumber = generateApplicationNumber('birth');

    const application = await BirthApplication.create({
      citizen: req.user._id,
      applicationNumber,
      childName,
      gender,
      dateOfBirth,
      placeOfBirth,
      fatherName,
      motherName,
      documentPath,
    });

    res.status(201).json({
      success: true,
      message: 'Birth certificate application submitted successfully',
      data: application,
    });
  } catch (error) {
    // Cleanup upload if error
    if (req.file) {
      deleteFileSafe(`uploads/documents/${req.file.filename}`);
    }
    next(error);
  }
};

// @desc    Get logged in citizen's birth certificate applications
// @route   GET /api/birth/my
// @access  Private (Citizen)
const getMyBirthApplications = async (req, res, next) => {
  try {
    const applications = await BirthApplication.find({ citizen: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all birth certificate applications
// @route   GET /api/birth/all
// @access  Private (Admin)
const getAllBirthApplications = async (req, res, next) => {
  try {
    const { status, childName } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (childName) {
      query.childName = { $regex: childName, $options: 'i' };
    }

    const applications = await BirthApplication.find(query)
      .populate('citizen', 'name village wardNumber phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject Birth Certificate Application
// @route   PATCH /api/birth/:id
// @access  Private (Admin)
const updateBirthApplicationStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      res.status(400);
      throw new Error('Please specify a valid status: Approved or Rejected');
    }

    let application = await BirthApplication.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    application.status = status;
    if (adminRemarks !== undefined) {
      application.adminRemarks = adminRemarks;
    }

    if (status === 'Approved') {
      // If approved, generate Certificate ID if not already generated
      if (!application.certificateId) {
        application.certificateId = generateCertificateId('birth');
      }
      application.approvedAt = Date.now();
    }

    const updatedApplication = await application.save();

    res.status(200).json({
      success: true,
      message: `Application successfully ${status.toLowerCase()}`,
      data: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get birth certificate application by ID (Admin or Owner Citizen)
// @route   GET /api/birth/:id
// @access  Private (Citizen & Admin)
const getBirthApplicationById = async (req, res, next) => {
  try {
    const application = await BirthApplication.findById(req.params.id)
      .populate('citizen', 'name village wardNumber phone email');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Role check: Admin can see anything, Citizen can only see their own application
    if (
      req.user.role !== 'Admin' &&
      application.citizen._id.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view this application record');
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyBirthCertificate,
  getMyBirthApplications,
  getAllBirthApplications,
  updateBirthApplicationStatus,
  getBirthApplicationById,
};
