const User = require('../models/user');
const Doctor = require('../models/doctor');
const { verifyToken } = require('../utils/jwtHelper'); 
const verifyRequest = (req) => {
    const authHeader = req.headers['authorization'];
    const token = req.cookies.token || (authHeader && authHeader.split(' ')[1]);

    if (!token) return null;
    try {
        return verifyToken(token); 
    } catch (err) {
        return null;
    }
};

const authenticateToken = async (req, res, next) => {
    const decoded = verifyRequest(req);
    if (!decoded) return res.status(401).json({ message: 'Access token required or invalid' });

    try {
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Authentication failed' });
    }
};

const authenticateDoctorToken = async (req, res, next) => {
    const decoded = verifyRequest(req);
    if (!decoded) return res.status(401).json({ message: 'Access token required or invalid' });

    try {
        const doctor = await Doctor.findById(decoded.id);
        if (!doctor) return res.status(401).json({ message: 'Doctor not found' });
        req.user = doctor;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Authentication failed' });
    }
};

const authenticateFromCookie = authenticateToken;

const requireSessionAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Session required' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

const requireDoctorAuth = (req, res, next) => {
    if (!req.session || !req.session.doctor) {
        return res.status(401).json({ message: 'Doctor session required' });
    }
    next();
};

const checkAuthStatus = async (req, res, next) => {
    const decoded = verifyRequest(req);
    if (decoded) {
        try {
            const user = await User.findById(decoded.id);
            if (user) {
                req.isLoggedIn = true;
                req.isUser = true;
                req.user = user;
                return next();
            }
            const doctor = await Doctor.findById(decoded.id);
            if (doctor) {
                req.isLoggedIn = true;
                req.isDoctor = true;
                req.user = doctor;
                return next();
            }
        } catch (err) {}
    }
    req.isLoggedIn = false;
    req.isUser = false;
    req.isDoctor = false;
    next();
};

module.exports = {
    authenticateToken,
    authenticateDoctorToken,
    requireSessionAuth,
    requireAdmin,
    requireDoctorAuth,
    checkAuthStatus,
    authenticateFromCookie 
};
