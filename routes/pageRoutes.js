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

router.get('/Appointment', async (req, res, next) => {
  if (!req.isLoggedIn) return res.redirect('/login');
  
  try {
    const specialitiesData = await Doctor.findAll({
      attributes: ['field'],
      group: ['field'],
      raw: true
    });
    const specialities = specialitiesData.map(d => d.field);

    let selectedDoctor = null;
    if (req.query.doctorId) {
      selectedDoctor = await Doctor.findByPk(req.query.doctorId);
    }
    
    res.render('Appointment', { req, specialities, selectedDoctor });
  } catch (err) {
    next(err);
  }
});

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

router.get('/admin', async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.redirect('/login');
  }
  try {
    const pendingDoctors = await PendingDoctor.findAll();
    res.render('adminDashboard', { req, pendingDoctors });
  } catch (err) {
    next(err);
  }
});

module.exports = router;