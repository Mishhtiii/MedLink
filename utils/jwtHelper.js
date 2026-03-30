const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'superSecureJWTTokenWith256BitsOfEntropy!@#$%^&*()_+';
const JWT_EXPIRES = '1d';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; 

/**
 * Generates a JWT by signing the provided payload.
 * Updated to accept a payload object (containing id, role, etc.) 
 * instead of just a single id value.
 */
const generateToken = (payload) => {
    // If payload is just a string/number, wrap it in an object, 
    // otherwise spread the existing payload object.
    const data = typeof payload === 'object' ? { ...payload } : { id: payload };
    return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

/**
 * Sets the JWT as an HTTP-only cookie in the response.
 * Updated to pass the full payload to generateToken.
 */
const sendToken = (res, payload) => {
    const token = generateToken(payload);

    res.cookie('token', token, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax' // Helps with cross-site navigation redirects
    });

    return token;
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

module.exports = { sendToken, verifyToken, JWT_SECRET };