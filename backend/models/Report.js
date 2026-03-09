const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({

  lat: {
    type: Number,
    required: true
  },

  lon: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    required: true
  },

  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Report", reportSchema);