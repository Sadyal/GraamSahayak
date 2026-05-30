const mongoose = require('mongoose');

const deathApplicationSchema = new mongoose.Schema(
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
    deceasedName: {
      type: String,
      required: [true, "Please add the deceased person's name"],
    },
    gender: {
      type: String,
      required: [true, 'Please specify gender'],
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfDeath: {
      type: Date,
      required: [true, 'Please specify the date of death'],
    },
    ageAtDeath: {
      type: Number,
      required: [true, 'Please specify age at the time of death'],
      min: [0, 'Age at death cannot be negative'],
    },
    placeOfDeath: {
      type: String,
      required: [true, 'Please specify the place of death'],
    },
    fatherOrSpouseName: {
      type: String,
      required: [true, "Please add the father's or spouse's name of the deceased"],
    },
    applicantName: {
      type: String,
      required: [true, "Please add the applicant's name"],
    },
    applicantRelation: {
      type: String,
      required: [true, 'Please specify relation with the deceased'],
    },
    documentPath: {
      type: String,
      required: [true, 'Please upload supporting documents (e.g. Hospital Death Report / Cremation Receipt)'],
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

module.exports = mongoose.model('DeathApplication', deathApplicationSchema);
