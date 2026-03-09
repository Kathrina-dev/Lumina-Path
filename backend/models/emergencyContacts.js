const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: String,
  phone: String
});

const EmergencySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  contacts: [ContactSchema]
});

module.exports = mongoose.model("EmergencyContacts", EmergencySchema);