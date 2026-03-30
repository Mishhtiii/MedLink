const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const {

    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    resetPassword,
    getUserAppointments,
    bookAppointment

} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/profile', authenticateToken, getUserProfile);
router.get('/user', authenticateToken, getUserProfile);

router.post('/reset', resetPassword);
router.get('/appointments', authenticateToken, getUserAppointments);

router.post('/book-appointment', authenticateToken, bookAppointment);

module.exports = router;
