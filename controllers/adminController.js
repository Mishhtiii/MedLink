const PendingDoctor = require('../models/pendingDoctor');
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const bcrypt = require('bcryptjs');

const getPendingDoctors = async (req, res, next) => {
    try {
        const pendingDoctors = await PendingDoctor.find();
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

        const newDoctor = new Doctor({
            img: pendingDoctor.image,
            name: pendingDoctor.name,
            field: pendingDoctor.specialization,
            experience: pendingDoctor.experience,
            qualification: pendingDoctor.qualification,
            rating: pendingDoctor.rating,
            username: pendingDoctor.username,
            email: pendingDoctor.email,
            password: pendingDoctor.password,
            location: pendingDoctor.location
        });

        await newDoctor.save();
        await PendingDoctor.findByIdAndDelete(id);

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
