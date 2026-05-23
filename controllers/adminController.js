const PendingDoctor = require('../models/pendingDoctor');
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService'); // Integrated automated mailing dispatch

const getPendingDoctors = async (req, res, next) => {
    try {
        // Password field ko select se exclude kiya security ke liye
        const pendingDoctors = await PendingDoctor.find().select('-password');
        res.status(200).json(pendingDoctors);
    } catch (err) {
        next(err);
    }
};

const approveDoctor = async (req, res, next) => {
    const { id } = req.params;

    try {
        const pendingDoctor = await PendingDoctor.findById(id);
        if (!pendingDoctor) {
            return res.status(404).json({ message: 'Pending doctor not found' });
        }

        // Naye fields ko permanent Doctor collection mein transfer kar rahe hain
        const newDoctor = new Doctor({
            name: pendingDoctor.name,
            username: pendingDoctor.username,
            email: pendingDoctor.email,
            password: pendingDoctor.password,
            field: pendingDoctor.specialization,   // Maps 'specialization' to 'field'
            qualification: pendingDoctor.qualification,
            experience: pendingDoctor.experience,
            location: pendingDoctor.location,
            phone: pendingDoctor.phone,
            hospital: pendingDoctor.hospital,
            fees: pendingDoctor.fees,
            img: pendingDoctor.image,              // Maps 'image' to 'img'
            availability: pendingDoctor.availability,
            rating: pendingDoctor.rating,
            // Final Approval ke baad permanent fields map ho rahi hain:
            aadharNumber: pendingDoctor.aadharNumber,
            license: pendingDoctor.license,
            degree: pendingDoctor.degree
        });

        await newDoctor.save();
        await PendingDoctor.findByIdAndDelete(id);

        // Trigger Nodemailer Doctor Approval Notice Asynchronously
        emailService.sendDoctorApprovalNotice(newDoctor.email, newDoctor.name);

        res.status(200).json({ message: 'Doctor approved successfully', doctor: newDoctor });
    } catch (err) {
        next(err);
    }
};

const rejectDoctor = async (req, res, next) => {
    const { id } = req.params;

    try {
        const pendingDoctor = await PendingDoctor.findByIdAndDelete(id);
        if (!pendingDoctor) {
            return res.status(404).json({ message: 'Pending doctor not found' });
        }

        res.status(200).json({ message: 'Doctor rejected successfully' });
    } catch (err) {
        next(err);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'user' }); 
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

const getDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (err) {
        next(err);
    }
};

const getAppointments = async (req, res, next) => {
    try {
        const appointments = await Appointment.find().populate('user', 'name').populate('doctor', 'name');
        res.status(200).json(appointments);
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};

const deleteDoctor = async (req, res, next) => {
    const { id } = req.params;
    try {
        await Doctor.findByIdAndDelete(id);
        res.status(200).json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPendingDoctors,
    approveDoctor,
    rejectDoctor,
    getUsers,
    getDoctors,
    getAppointments,
    deleteUser,
    deleteDoctor
};