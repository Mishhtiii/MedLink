const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'superSecureJWTTokenWith256BitsOfEntropy!@#$%^&*()_+';
const JWT_EXPIRES = '1d';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; 

const generateToken = (payload) => {
    
    const data = typeof payload === 'object' ? { ...payload } : { id: payload };
    return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

const sendToken = (res, payload) => {
    const token = generateToken(payload);

    res.cookie('token', token, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax' 
    });

    return token;
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = { sendToken, verifyToken, JWT_SECRET };