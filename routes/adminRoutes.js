const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin, authenticateFromCookie} = require('../middlewares/auth');

router.get('/pending-doctors', authenticateFromCookie, requireAdmin, adminController.getPendingDoctors);

router.post('/approve-doctor/:id', authenticateFromCookie, requireAdmin, adminController.approveDoctor);

router.delete('/reject-doctor/:id', authenticateFromCookie, requireAdmin, adminController.rejectDoctor);

router.get('/users', authenticateFromCookie, requireAdmin, adminController.getUsers);

router.get('/doctors', authenticateFromCookie, requireAdmin, adminController.getDoctors);

router.get('/appointments', authenticateFromCookie, requireAdmin, adminController.getAppointments);

router.delete('/users/:id', authenticateFromCookie, requireAdmin, adminController.deleteUser);

router.delete('/doctors/:id', authenticateFromCookie, requireAdmin, adminController.deleteDoctor);

module.exports = router;
