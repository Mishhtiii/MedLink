const User = require('../models/user');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const DoctorSlot = require('../models/doctorSlot');
const bcrypt = require('bcrypt');
const { sendToken } = require('../utils/jwtHelper');

// Strong password validation function
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    return null;
};

const registerUser = async (req, res, next) => {
    const { name, username, email, password, responseType } = req.body;

    if (!name || !username || !email || !password) {
        if (responseType === 'redirect') return res.redirect('/register?error=MissingFields');
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        if (responseType === 'redirect') return res.redirect('/register?error=WeakPassword');
        return res.status(400).json({ message: passwordError });
    }

    try {
        const userExists = await User.findOne({ where: { username } });
        if (userExists) {
            if (responseType === 'redirect') return res.redirect('/register?error=UsernameTaken');
            return res.status(409).json({ message: 'Username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, username, email, password: hashedPassword });

        if (user) {
            // Role add kiya taaki auth middleware sahi table check kare
            sendToken(res, { id: user.id, role: user.role }); 

            if (responseType === 'redirect') {
                return user.role === 'admin' ? res.redirect('/admin') : res.redirect('/');
            }

            return res.status(201).json({
                message: 'User registered successfully',
                user: { id: user.id, name: user.name, username: user.username, email: user.email }
            });
        }
    } catch (err) {
        next(err);
    }
};

const loginUser = async (req, res, next) => {
    const { username, password, responseType } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        const foundUser = await User.findOne({ where: { username } });

        if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
            // FIX: .id use karein aur role pass karein
            sendToken(res, { id: foundUser.id, role: foundUser.role });

            if (responseType === 'redirect') {
                return foundUser.role === 'admin' ? res.redirect('/admin') : res.redirect('/');
            }

            return res.status(200).json({
                message: 'Login successful',
                user: { id: foundUser.id, name: foundUser.name, username: foundUser.username, role: foundUser.role }
            });
        } else {
            if (responseType === 'redirect') return res.redirect('/login?error=InvalidCredentials');
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        next(err);
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        const userData = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        if (userData) {
            res.status(200).json({ user: userData });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        next(err);
    }
};

const logoutUser = (req, res, next) => {
    res.clearCookie('token');
    if (req.method === 'GET' || req.query.responseType === 'redirect') {
        return res.redirect('/login');
    }
    res.status(200).json({ message: 'Logout successful' });
};

const resetPassword = async (req, res, next) => {
    const { email, newPassword, confirmPassword, responseType } = req.body;

    if (newPassword !== confirmPassword) {
        if (responseType === 'redirect') return res.redirect('/reset?error=PasswordMismatch');
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const foundUser = await User.findOne({ where: { email } });
        if (!foundUser) {
            if (responseType === 'redirect') return res.redirect('/reset?error=UserNotFound');
            return res.status(404).json({ message: 'User with that email not found' });
        }

        // Password hash karna zaroori hai
        foundUser.password = await bcrypt.hash(newPassword, 10);
        await foundUser.save();

        if (responseType === 'redirect') return res.redirect('/login?success=PasswordReset');
        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        next(err);
    }
};

const getUserAppointments = async (req, res, next) => {
    try {
        const appointments = await Appointment.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Doctor, // Imported variable use karein
                attributes: ['name', 'field']
            }],
            order: [['date', 'DESC'], ['time', 'DESC']]
        });
        res.status(200).json(appointments);
    } catch (err) {
        next(err);
    }
};

// Fullstack/controllers/userController.js

const bookAppointment = async (req, res, next) => {
    const { doctor, appointmentDate, timeslot } = req.body;

    try {
        const doctorDoc = await Doctor.findByPk(doctor);
        if (!doctorDoc) return res.status(404).json({ message: 'Doctor not found' });

        // Normalize the date to avoid timestamp mismatches
        const searchDate = new Date(appointmentDate);
        searchDate.setHours(0, 0, 0, 0); 

        const slot = await DoctorSlot.findOne({
            where: {
                doctorId: doctor,
                date: searchDate, // Use the normalized date
                time: timeslot,
                available: true
            }
        });

        if (!slot) return res.status(400).json({ message: 'Selected slot is not available' });

        // Create the appointment using the same normalized date
        const appointment = await Appointment.create({
            userId: req.user.id,
            doctorId: doctor,
            date: searchDate,
            time: timeslot,
            status: 'pending'
        });

        // Mark slot as unavailable
        slot.available = false;
        await slot.save();

        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser,
    resetPassword,
    getUserAppointments,
    bookAppointment, 
};