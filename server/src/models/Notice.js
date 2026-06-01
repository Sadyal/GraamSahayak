const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an announcement title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add announcement description content'],
    },
    category: {
      type: String,
      enum: ['General', 'Scheme', 'Health', 'Event', 'Notice'],
      default: 'Notice',
    },
    severity: {
      type: String,
      enum: ['Info', 'Medium', 'Urgent'],
      default: 'Info',
    },
    village: {
      type: String,
      required: true,
      default: 'All',
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async function (value) {
          const User = mongoose.model('User');
          const user = await User.findById(value);
          return !!user;
        },
        message: 'Referenced publisher (User) does not exist',
      },
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notice', noticeSchema);
