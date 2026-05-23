const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    field: { type: String, required: true }, // Specialization maps to field
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    hospital: { type: String, required: true },
    fees: { type: Number, required: true },
    img: { type: String, required: true },   // Image maps to img
    availability: { type: String, required: true },
    rating: { type: Number, default: 0 },
    // Yeh teen naye document fields jo permanent save honge:
    aadharNumber: { type: String, required: true },
    license: { type: String, required: true },
    degree: { type: String, required: true }
});

let doctorModel = new mongoose.model('Doctor', doctorSchema);
module.exports = doctorModel;