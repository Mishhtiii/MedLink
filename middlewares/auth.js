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
        const user = await User.findByPk(decoded.id);
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
        
        const doctor = await Doctor.findByPk(decoded.id); 
        
        if (!doctor) return res.status(401).json({ message: 'Doctor not found' });
        req.user = doctor;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Authentication failed' });
    }
};

const authenticateFromCookie = authenticateToken;

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

const checkAuthStatus = async (req, res, next) => {
    const decoded = verifyRequest(req);
    
    req.isLoggedIn = false;
    req.isUser = false;
    req.isDoctor = false;

    if (decoded) {
        try {
            if (decoded.role === 'doctor') {
                const doctor = await Doctor.findByPk(decoded.id);
                if (doctor) {
                    req.isLoggedIn = true;
                    req.isDoctor = true;
                    req.user = doctor;
                    return next();
                }
            } else {
                const user = await User.findByPk(decoded.id);
                if (user) {
                    req.isLoggedIn = true;
                    req.isUser = true;
                    req.user = user;
                    return next();
                }
            }
        } catch (err) {
            console.error("Auth status check error:", err);
        }
    }
    next();
};

module.exports = {
    authenticateToken,
    authenticateDoctorToken,
    requireAdmin,
    checkAuthStatus,
    authenticateFromCookie 
};