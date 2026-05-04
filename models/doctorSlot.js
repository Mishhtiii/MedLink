const mongoose = require('mongoose');

const doctorSlotSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    }
});

let doctorSlotModel = new mongoose.model('DoctorSlot', doctorSlotSchema);

module.exports = doctorSlotModel;
