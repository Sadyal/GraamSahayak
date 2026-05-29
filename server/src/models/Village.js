const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a village name'],
      unique: true,
      trim: true,
    },
    wards: {
      type: [String],
      required: [true, 'Please configure at least one ward for the village'],
    },
    district: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Village', villageSchema);
