const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  img: { type: String, required: true },
  name: { type: String, required: true },
  field: { type: String, required: true },
  experience: { type: String, required: true },
  qualification: { type: String, required: true },
  rating: { type: Number, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, default: '' }
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
