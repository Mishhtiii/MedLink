const PendingDoctor = require('../models/pendingDoctor');
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const bcrypt = require('bcrypt'); // Consistent with other controllers

const getPendingDoctors = async (req, res, next) => {
    try {
        // Replacement for .find()
        const pendingDoctors = await PendingDoctor.findAll();
        res.status(200).json(pendingDoctors);
    } catch (err) {
        next(err);
    }
};

const approveDoctor = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Replacement for .findById()
        const pendingDoctor = await PendingDoctor.findByPk(id);
        if (!pendingDoctor) {
            return res.status(404).json({ message: 'Pending doctor not found' });
        }

        // Map PendingDoctor fields to Doctor fields
        const newDoctor = await Doctor.create({
            img: pendingDoctor.image,           // Map 'image' to 'img'
            name: pendingDoctor.name,
            field: pendingDoctor.specialization, // Map 'specialization' to 'field'
            experience: pendingDoctor.experience,
            qualification: pendingDoctor.qualification,
            rating: pendingDoctor.rating,
            username: pendingDoctor.username,
            email: pendingDoctor.email,
            password: pendingDoctor.password,
            location: pendingDoctor.location,
            phone: pendingDoctor.phone,
            hospital: pendingDoctor.hospital,
            fees: pendingDoctor.fees,
            availability: pendingDoctor.availability
        });

        // Replacement for .findByIdAndDelete()
        await PendingDoctor.destroy({ where: { id: id } });

        res.status(200).json({ message: 'Doctor approved successfully', doctor: newDoctor });
    } catch (err) {
        // Handle Duplicate Entry (if doctor is already in the main table)
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Doctor already exists or email/username taken' });
        }
        next(err);
    }
};

const rejectDoctor = async (req, res, next) => {
    const { id } = req.params;
    try {
        const deleted = await PendingDoctor.destroy({ where: { id: id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Pending doctor not found' });
        }
        res.status(200).json({ message: 'Doctor rejected successfully' });
    } catch (err) {
        next(err);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({ where: { role: 'user' } }); 
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

const getDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.findAll();
        res.status(200).json(doctors);
    } catch (err) {
        next(err);
    }
};

const getAppointments = async (req, res, next) => {
    try {
        // Replacement for .populate()
        // Note: Requires require('./models/associations') in server.js
        const appointments = await Appointment.findAll({
            include: [
                { model: User, attributes: ['name'] },
                { model: Doctor, attributes: ['name'] }
            ]
        });
        res.status(200).json(appointments);
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        await User.destroy({ where: { id: id } });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};

const deleteDoctor = async (req, res, next) => {
    const { id } = req.params;
    try {
        await Doctor.destroy({ where: { id: id } });
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
