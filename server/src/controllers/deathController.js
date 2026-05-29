const DeathApplication = require('../models/DeathApplication');
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

// @desc    Apply for a Death Certificate
// @route   POST /api/death/apply
// @access  Private (Citizen)
const applyDeathCertificate = async (req, res, next) => {
  try {
    const {
      deceasedName,
      gender,
      dateOfDeath,
      ageAtDeath,
      placeOfDeath,
      fatherOrSpouseName,
      applicantName,
      applicantRelation,
    } = req.body;

    if (
      !deceasedName ||
      !gender ||
      !dateOfDeath ||
      !ageAtDeath ||
      !placeOfDeath ||
      !fatherOrSpouseName ||
      !applicantName ||
      !applicantRelation
    ) {
      res.status(400);
      throw new Error('Please fill in all details');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload supporting documents');
    }

    const documentPath = `uploads/documents/${req.file.filename}`;
    const applicationNumber = generateApplicationNumber('death');

    const application = await DeathApplication.create({
      citizen: req.user._id,
      applicationNumber,
      deceasedName,
      gender,
      dateOfDeath,
      ageAtDeath,
      placeOfDeath,
      fatherOrSpouseName,
      applicantName,
      applicantRelation,
      documentPath,
    });

    res.status(201).json({
      success: true,
      message: 'Death certificate application submitted successfully',
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

// @desc    Get logged in citizen's death certificate applications
// @route   GET /api/death/my
// @access  Private (Citizen)
const getMyDeathApplications = async (req, res, next) => {
  try {
    const applications = await DeathApplication.find({ citizen: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all death certificate applications
// @route   GET /api/death/all
// @access  Private (Admin)
const getAllDeathApplications = async (req, res, next) => {
  try {
    const { status, deceasedName } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (deceasedName) {
      query.deceasedName = { $regex: deceasedName, $options: 'i' };
    }

    const applications = await DeathApplication.find(query)
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

// @desc    Approve or Reject Death Certificate Application
// @route   PATCH /api/death/:id
// @access  Private (Admin)
const updateDeathApplicationStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      res.status(400);
      throw new Error('Please specify a valid status: Approved or Rejected');
    }

    let application = await DeathApplication.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    application.status = status;
    if (adminRemarks !== undefined) {
      application.adminRemarks = adminRemarks;
    }

    if (status === 'Approved') {
      if (!application.certificateId) {
        application.certificateId = generateCertificateId('death');
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

// @desc    Get death certificate application by ID (Admin or Owner Citizen)
// @route   GET /api/death/:id
// @access  Private (Citizen & Admin)
const getDeathApplicationById = async (req, res, next) => {
  try {
    const application = await DeathApplication.findById(req.params.id)
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
  applyDeathCertificate,
  getMyDeathApplications,
  getAllDeathApplications,
  updateDeathApplicationStatus,
  getDeathApplicationById,
};
