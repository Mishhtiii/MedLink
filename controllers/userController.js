const User = require('../models/user');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const DoctorSlot = require('../models/doctorSlot');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendToken } = require('../utils/jwtHelper');

// Strong password validation function
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumbers) {
        return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
        return 'Password must contain at least one special character';
    }
    return null; // Valid password
};

const registerUser = async (req, res, next) => {
    const { name, username, email, password, responseType } = req.body;

    if (!name || !username || !email || !password) {
        if (responseType === 'redirect') {
            return res.redirect('/register?error=MissingFields');
        }
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        if (responseType === 'redirect') {
            return res.redirect('/register?error=WeakPassword');
        }
        return res.status(400).json({ message: passwordError });
    }

    try {
        const userExists = await User.findOne({ username }).exec();
        if (userExists) {
            if (responseType === 'redirect') {
                return res.redirect('/register?error=UsernameTaken');
            }
            return res.status(409).json({ message: 'Username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, username, email, password: hashedPassword });

        if (user) {
            sendToken(res, user._id);

            if (responseType === 'redirect') {
                if (user.role === 'admin') {
                    return res.redirect('/admin');
                } else {
                    return res.redirect('/');
                }
            }

            return res.status(201).json({
                message: 'User registered successfully',
                user: { id: user._id, name: user.name, username: user.username, email: user.email }
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
        const foundUser = await User.findOne({ username }).exec();

        if (foundUser && (await bcrypt.compare(password, foundUser.password))) {

            sendToken(res, foundUser._id);

            if (responseType === 'redirect') {
                if (foundUser.role === 'admin') {
                    return res.redirect('/admin');
                } else {
                    return res.redirect('/');
                }
            }

            return res.status(200).json({
                message: 'Login successful',
                user: { id: foundUser._id, name: foundUser.name, username: foundUser.username, role: foundUser.role }
            });
        } else {
            if (responseType === 'redirect') {
                return res.redirect('/login?error=InvalidCredentials');
            }
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        next(err);
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        const userData = await User.findById(req.user._id).select('-password').exec();
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

const purchaseMedicines = async (req, res, next) => {
    const { medicines } = req.body;
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
        return res.status(400).json({ message: 'No medicines provided' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        medicines.forEach(newMed => {
            const existing = user.purchasedMedicines.find(med => med.name === newMed.name);
            if (existing) {
                existing.quantity += newMed.quantity;
                existing.price += newMed.price; 
                existing.date = new Date();
            } else {
                user.purchasedMedicines.push(newMed);
            }
        });
        if (user.purchasedMedicines.length > 10) {
            user.purchasedMedicines = user.purchasedMedicines.slice(-10); 
        }

        await user.save();

        res.status(200).json({ message: 'Medicines purchased successfully' });
    } catch (err) {
        next(err);
    }
};

const clearPurchasedMedicines = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.purchasedMedicines = [];
        await user.save();

        res.status(200).json({ message: 'All purchased medicines cleared successfully' });
    } catch (err) {
        next(err);
    }
};

const resetPassword = async (req, res, next) => {
    const { email, newPassword, confirmPassword, responseType } = req.body;

    if (newPassword !== confirmPassword) {
        if (responseType === 'redirect') {
            return res.redirect('/reset?error=PasswordMismatch');
        }
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
        if (responseType === 'redirect') {
            return res.redirect('/reset?error=Length');
        }
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
        const foundUser = await User.findOne({ email }).exec();
        if (!foundUser) {
            if (responseType === 'redirect') {
                return res.redirect('/reset?error=UserNotFound');
            }
            return res.status(404).json({ message: 'User with that email not found' });
        }

        foundUser.password = newPassword;
        await foundUser.save();

        if (responseType === 'redirect') {
            return res.redirect('/login?success=PasswordReset');
        }

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        next(err);
    }
};

const getUserAppointments = async (req, res, next) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id })
            .populate('doctor', 'name field')
            .sort({ date: -1, time: -1 });
        res.status(200).json(appointments);
    } catch (err) {
        next(err);
    }
};

const bookAppointment = async (req, res, next) => {
    const { name, email, phone, speciality, doctor, appointmentDate, timeslot, message } = req.body;

    if (!name || !email || !phone || !speciality || !doctor || !appointmentDate || !timeslot) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const doctorDoc = await Doctor.findById(doctor);
        if (!doctorDoc) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        const slot = await DoctorSlot.findOne({
            doctor: doctor,
            date: new Date(appointmentDate),
            time: timeslot,
            available: true
        });

        if (!slot) {
            return res.status(400).json({ message: 'Selected slot is not available' });
        }
        const appointment = await Appointment.create({
            user: req.user._id,
            doctor: doctor,
            date: new Date(appointmentDate),
            time: timeslot,
            status: 'pending'
        });
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
    purchaseMedicines,
    clearPurchasedMedicines,
    resetPassword,
    getUserAppointments,
    bookAppointment, 
};
