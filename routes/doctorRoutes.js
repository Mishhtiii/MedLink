const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateDoctorToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/register', upload.single('image'), doctorController.registerDoctor);
router.post('/login', doctorController.loginDoctor);
router.get('/logout', doctorController.logoutDoctor);
router.post('/logout', doctorController.logoutDoctor);

router.get('/dashboard', authenticateDoctorToken, doctorController.getDoctorDashboard);
router.get('/profile', authenticateDoctorToken, doctorController.getDoctorProfile);
router.get('/profile-data', authenticateDoctorToken, doctorController.getDoctorProfileData);

router.get('/appointments', authenticateDoctorToken, doctorController.getDoctorAppointments);

router.get('/available-slots', doctorController.getAvailableSlots);

router.get('/slots', authenticateDoctorToken, doctorController.getDoctorSlots);
router.put('/slots/:id/availability', authenticateDoctorToken, doctorController.manageSlotAvailability);
router.put('/slots/:id/time', authenticateDoctorToken, doctorController.updateSlotTime);

router.post('/profile', authenticateDoctorToken, doctorController.updateDoctorProfile);

router.get('/speciality', doctorController.getDoctorsBySpeciality);

module.exports = router;