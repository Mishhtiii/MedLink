const { Op } = require('sequelize');
const Doctor = require('../models/doctor');
const PendingDoctor = require('../models/pendingDoctor');
const Appointment = require('../models/appointment');
const DoctorSlot = require('../models/doctorSlot');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { sendToken } = require('../utils/jwtHelper');

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

const getAllDoctors = async (req, res, next) => {
    try {
        const doctors = await Doctor.findAll();
        res.status(200).json(doctors);
    } catch (err) {
        next(err);
    }
};

const registerDoctor = async (req, res, next) => {
    const { name, username, email, password, specialization, experience, location, phone, hospital, fees, availability, qualification, rating } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !username || !email || !password || !specialization || !experience || !location || !phone || !hospital || !fees || !image || !availability || !qualification || !rating) {
        if (req.body.responseType === 'redirect') return res.redirect('/doctorRegister?error=MissingFields');
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        if (req.body.responseType === 'redirect') return res.redirect('/doctorRegister?error=WeakPassword');
        return res.status(400).json({ message: passwordError });
    }

    try {
        const pendingDoctorExists = await PendingDoctor.findOne({ where: { username } });
        if (pendingDoctorExists) {
            if (req.body.responseType === 'redirect') return res.redirect('/doctorRegister?error=UsernameTaken');
            return res.status(409).json({ message: 'Username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const pendingDoctor = await PendingDoctor.create({
            name, username, email, password: hashedPassword,
            specialization, qualification, experience, rating,
            location, phone, hospital, fees, image, availability
        });

        if (pendingDoctor) {
            if (req.body.responseType === 'redirect') {
                return res.redirect('/?message=Please wait for the confirmation of admin for registration as a doctor');
            }
            return res.status(201).json({
                message: 'Doctor registration submitted for approval',
                pendingDoctor: { id: pendingDoctor.id, name: pendingDoctor.name, username: pendingDoctor.username, email: pendingDoctor.email }
            });
        }
    } catch (err) {
        next(err);
    }
};

const loginDoctor = async (req, res, next) => {
    const { username, password, responseType } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        const foundDoctor = await Doctor.findOne({ where: { username } });

        if (foundDoctor && await bcrypt.compare(password, foundDoctor.password)) {
            sendToken(res, { 
    id: foundDoctor.id, 
    username: foundDoctor.username, 
    role: 'doctor' 
});

            if (responseType === 'redirect') {
                
                return res.redirect('/api/doctors/dashboard'); 
            }

            return res.status(200).json({
                message: 'Login successful',
                doctor: { id: foundDoctor.id, name: foundDoctor.name, username: foundDoctor.username }
            });
        } else {
            if (responseType === 'redirect') return res.redirect('/doctorLogin?error=InvalidCredentials');
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (err) {
        next(err);
    }
};

const getDoctorProfile = async (req, res, next) => {
    try {
        const doctorData = await Doctor.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (doctorData) {
            res.render('doctorDashboard', { req: req, doctor: doctorData });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (err) {
        next(err);
    }
};

const getDoctorProfileData = async (req, res, next) => {
    try {
        const doctorData = await Doctor.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (doctorData) {
            res.status(200).json({ doctor: doctorData });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (err) {
        next(err);
    }
};

const logoutDoctor = (req, res, next) => {
    res.clearCookie('token');
    if (req.method === 'GET' || req.query.responseType === 'redirect') {
        return res.redirect('/doctorLogin');
    }
    res.status(200).json({ message: 'Logout successful' });
};

const updateDoctorProfile = async (req, res, next) => {
    const { name, email, field, qualification, experience, location, img } = req.body;

    try {
        const doctor = await Doctor.findByPk(req.user.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        if (name) doctor.name = name;
        if (email) doctor.email = email;
        if (field) doctor.field = field;
        if (qualification) doctor.qualification = qualification;
        if (experience) doctor.experience = experience;
        if (location !== undefined) doctor.location = location;
        if (img) doctor.img = img;

        await doctor.save();
        res.status(200).json({ message: 'Profile updated successfully', doctor });
    } catch (err) {
        next(err);
    }
};

const findDoctorPage = async (req, res, next) => {
    try {
        const { search, speciality, qualification, location } = req.query;
        const whereClause = {};

        if (search) whereClause.name = { [Op.like]: `%${search}%` };
        if (speciality) whereClause.field = speciality;
        if (qualification) whereClause.qualification = qualification;
        if (location) whereClause.location = { [Op.like]: `%${location}%` };

        const doctors = await Doctor.findAll({ where: whereClause });

        const specialities = [
            { id: 'general', name: 'General practitioner', icon: 'https://cdn-icons-png.flaticon.com/128/46/46196.png' },
            { id: 'dentistry', name: 'Dentistry', icon: 'https://cdn-icons-png.flaticon.com/128/3467/3467825.png' },
            { id: 'neurology', name: 'Neurology', icon: 'https://cdn-icons-png.flaticon.com/128/9133/9133647.png' },
            { id: 'xray', name: 'X-Ray', icon: 'https://cdn-icons-png.flaticon.com/128/4006/4006101.png' },
            { id: 'dermatology', name: 'Dermatology', icon: 'https://cdn-icons-png.flaticon.com/128/7305/7305176.png' },
            { id: 'urology', name: 'Urology', icon: 'https://cdn-icons-png.flaticon.com/128/2184/2184274.png' },
            { id: 'psychiatry', name: 'Psychiatry', icon: 'https://cdn-icons-png.flaticon.com/128/4637/4637907.png' },
        ];

        res.render('finddoctor', { req, doctors, specialities });
    } catch (err) {
        next(err);
    }
};

const getDoctorsBySpeciality = async (req, res, next) => {
    try {
        const { speciality } = req.query;
        if (!speciality) return res.status(400).json({ message: 'Speciality is required' });

        const doctors = await Doctor.findAll({
            where: { field: { [Op.like]: `%${speciality}%` } }
        });

        res.status(200).json(doctors);
    } catch (err) {
        next(err);
    }
};

const getAvailableSlots = async (req, res, next) => {
    try {
        const { doctor, date } = req.query;
        if (!doctor || !date) return res.status(400).json({ message: 'Doctor and date are required' });

        
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);

        const doctorDoc = await Doctor.findByPk(doctor);
        if (!doctorDoc) return res.status(404).json({ message: 'Doctor not found' });

        
        let slots = await DoctorSlot.findAll({ 
            where: { 
                doctorId: doctor, 
                date: searchDate 
            } 
        });

        
        if (slots.length === 0) {
            const availability = doctorDoc.availability; 
            let startHour, endHour;
            switch (availability) {
                case 'Morning': startHour = 9; endHour = 12; break;
                case 'Afternoon': startHour = 12; endHour = 17; break;
                case 'Evening': startHour = 17; endHour = 21; break;
                default: startHour = 9; endHour = 17; break;
            }

            const newSlots = [];
            for (let hour = startHour; hour < endHour; hour++) {
                
                const slot = await DoctorSlot.create({
                    doctorId: doctor,
                    date: searchDate,
                    time: `${hour}:00`,
                    available: true
                });
                newSlots.push(slot);
            }
            slots = newSlots;
        }

        const availableSlots = slots.filter(slot => slot.available).map(slot => slot.time);
        res.status(200).json({ slots: availableSlots });
    } catch (err) {
        console.error("Slot Generation Error:", err);
        next(err);
    }
};

const getDoctorAppointments = async (req, res, next) => {
    try {
        const appointments = await Appointment.findAll({
            where: { doctorId: req.user.id },
            include: [{
                model: User,
                attributes: ['name', 'email']
            }],
            order: [['date', 'DESC'], ['time', 'DESC']]
        });
        res.status(200).json(appointments);
    } catch (err) {
        next(err);
    }
};

const manageSlotAvailability = async (req, res, next) => {
    const { id } = req.params;
    const { available } = req.body;

    try {
        const slot = await DoctorSlot.findByPk(id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        if (slot.doctorId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        slot.available = available;
        await slot.save();

        res.status(200).json({ message: 'Slot availability updated', slot });
    } catch (err) {
        next(err);
    }
};

const getDoctorSlots = async (req, res, next) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    try {
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);

        const slots = await DoctorSlot.findAll({
            where: { 
                doctorId: req.user.id, 
                date: searchDate 
            }
        });
        res.status(200).json(slots);
    } catch (err) {
        next(err);
    }
};

const getDoctorDashboard = async (req, res, next) => {
    try {
        const doctorData = await Doctor.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (doctorData) {
            res.render('doctorDashboard', { req: req, doctor: doctorData });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (err) {
        next(err);
    }
};

const updateSlotTime = async (req, res, next) => {
    const { id } = req.params;
    const { time } = req.body;

    try {
        const slot = await DoctorSlot.findByPk(id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        if (slot.doctorId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        slot.time = time;
        await slot.save();

        res.status(200).json({ message: 'Slot time updated successfully', slot });
    } catch (err) {
        next(err);
    }
};

const getUniqueSpecialities = async (req, res, next) => {
    try {
        const specialitiesData = await Doctor.findAll({
            attributes: ['field'],
            group: ['field'],
            raw: true
        });
        const specialities = specialitiesData.map(d => d.field);
        res.status(200).json(specialities);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllDoctors, findDoctorPage, registerDoctor, loginDoctor,
    getDoctorProfile, getDoctorProfileData, logoutDoctor, updateDoctorProfile,
    getDoctorsBySpeciality, getAvailableSlots, getDoctorAppointments,
    manageSlotAvailability, getDoctorSlots, getDoctorDashboard,
    updateSlotTime, getUniqueSpecialities,
};