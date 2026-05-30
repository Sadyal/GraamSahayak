const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
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
    complaintType: {
      type: String,
      required: [true, 'Please select a complaint type'],
      enum: ['Sanitation', 'Water Supply', 'Roads', 'Street Lights', 'Electricity', 'Others'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description for the complaint'],
    },
    imagePath: {
      type: String,
      default: '',
    },
    audioPath: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    adminRemarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
