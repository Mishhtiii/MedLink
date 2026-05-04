const express = require('express');
const router = express.Router();
const { findDoctorPage, registerDoctor } = require('../controllers/doctorController');
const PendingDoctor = require('../models/pendingDoctor');
const Doctor = require('../models/doctor');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => res.render('home1', { req }));
router.get('/login', (req, res) => res.render('login', { req }));
router.get('/services', (req, res) => res.render('Services', { req }));
router.get('/register', (req, res) => res.render('register', { req }));
router.get('/about', (req, res) => res.render('Aboutus', { req }));
router.get('/contact', (req, res) => res.render('contact', { req }));
router.get('/reset', (req, res) => res.render('reset', { req }));
router.get('/Appointment', async (req, res) => {
  if (!req.isLoggedIn) return res.redirect('/login');
  const specialities = await Doctor.distinct('field');
  let selectedDoctor = null;
  if (req.query.doctorId) {
    selectedDoctor = await Doctor.findById(req.query.doctorId);
  }
  res.render('Appointment', { req, specialities, selectedDoctor })
})
router.get('/findhospital', (req, res) => res.render('findHospital', { req }));
router.get('/profile', (req, res) => {
  if (!req.isUser) return res.redirect('/login');
  res.render('profile', { req, user: req.user });
});
router.get('/doctorProfile', (req, res) => {
  if (!req.isDoctor) return res.redirect('/login');
  res.render('doctorProfile', { req });
});
router.get('/emergency', (req, res) => res.render('Emergency', { req }));
router.get('/finddoctor', findDoctorPage);
router.get('/doctorRegister', (req, res) => res.render('doctorRegister', { req }));
router.post('/doctorRegister', upload.single('image'), registerDoctor);
router.get('/doctorLogin', (req, res) => res.render('doctorLogin', { req }));
router.get('/pharmacy', async (req, res) => {
    const { loadMedicines, loadSliderImages, loadFitnessDeals, loadPersonalCareProducts, loadSurgicalDeals, loadSurgicalDevices } = require('../api/dataLoader');
    const medicines = await loadMedicines();
    const sliderImages = await loadSliderImages();
    const fitnessDeals = await loadFitnessDeals();
    const personalCareProducts = await loadPersonalCareProducts();
    const surgicalDeals = await loadSurgicalDeals();
    const surgicalDevices = await loadSurgicalDevices();
    res.render('medicine', { req, medicines, sliderImages, fitnessDeals, personalCareProducts, surgicalDeals, surgicalDevices });
});
router.get('/cart', (req, res) => res.render('medcart', { req }));
router.get('/payment', (req, res) => res.render('payment', { req }));
router.get('/order-by-prescription', (req, res) => res.render('orderByPrescription', { req }));
router.get('/admin', async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/login');
  }
  try {
    const pendingDoctors = await PendingDoctor.find();
    res.render('adminDashboard', { req, pendingDoctors });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
