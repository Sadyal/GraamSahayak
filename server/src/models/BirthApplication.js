const mongoose = require('mongoose');

const birthApplicationSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async function (value) {
          const User = mongoose.model('User');
          const user = await User.findById(value);
          return !!user;
        },
        message: 'Referenced citizen (User) does not exist',
      },
    },
    applicationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    childName: {
      type: String,
      required: [true, "Please add the child's name"],
    },
    gender: {
      type: String,
      required: [true, 'Please specify gender'],
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please specify the date of birth'],
    },
    placeOfBirth: {
      type: String,
      required: [true, 'Please specify the place of birth'],
    },
    fatherName: {
      type: String,
      required: [true, "Please add the father's name"],
    },
    motherName: {
      type: String,
      required: [true, "Please add the mother's name"],
    },
    documentPath: {
      type: String,
      required: [true, 'Please upload supporting documents (e.g. Hospital Discharge Certificate)'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminRemarks: {
      type: String,
      default: '',
    },
    certificateId: {
      type: String,
      default: '',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BirthApplication', birthApplicationSchema);
