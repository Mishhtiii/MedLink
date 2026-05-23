const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs'); // Agar password hash karna hai toh
const PendingDoctor = require('../models/pendingDoctor');
const doctorController = require('../controllers/doctorController');

// 1. Multer Disk Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/'); // Saari files isi folder mein save hongi
    },
    filename: function (req, file, cb) {
        // Unique filename banane ke liye timestamp aur random number use kar rahe hain
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 2. Doctor Registration Route (Handling multiple files)
// Yahan hum upload.fields() use kar rahe hain taaki teeno inputs smoothly parse ho sakein
router.get('/logout', doctorController.logoutDoctor);
router.post('/doctorRegister', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'license', maxCount: 1 },
    { name: 'degree', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const body = req.body;
        const files = req.files;

        // Validation: Check ki saari files physically bhej di gayi hain ya nahi
        if (!files || !files.image || !files.license || !files.degree) {
            return res.redirect('/doctorRegister?error=MissingFields');
        }

        // Password hash safe method (Optional but recommended)
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // Naya doctor registration pending schema node create kar rahe hain
        const newPendingDoctor = new PendingDoctor({
            name: body.name,
            username: body.username,
            email: body.email,
            password: hashedPassword, // Encrypted password string
            specialization: body.specialization,
            qualification: body.qualification,
            experience: body.experience,
            location: body.location,
            phone: body.phone,
            hospital: body.hospital,
            fees: body.fees,
            availability: body.availability,
            aadharNumber: body.aadharNumber,
            // Multer dwara generated unique filenames ko string ki tarah save kar rahe hain
            image: files.image[0].filename,
            license: files.license[0].filename,
            degree: files.degree[0].filename,
            rating: 0
        });

        await newPendingDoctor.save();
        
        // Success hone par login portal par bhej dein
        res.redirect('/doctorLogin?success=Registered');
    } catch (err) {
        console.error("Registration Core Error:", err);
        next(err);
    }
});

// Baaki ke active controller routing methods ko as-is chalne dein
router.post('/login', doctorController.loginDoctor);
router.get('/profile', doctorController.getDoctorDashboard);
router.get('/appointments', doctorController.getDoctorAppointments);
router.get('/slots', doctorController.getDoctorSlots);
router.post('/update-profile', doctorController.updateDoctorProfile);
router.post('/slots/manage/:id', doctorController.manageSlotAvailability);
router.post('/slots/update-time/:id', doctorController.updateSlotTime);
router.post('/appointment/complete/:appointmentId', doctorController.completeAppointment);
router.get('/profile-data', doctorController.getDoctorProfileData);

module.exports = router;