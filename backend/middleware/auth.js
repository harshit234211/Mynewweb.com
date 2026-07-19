const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fragarena_secret_token');
        req.user = decoded.user;

        // Check if user is banned
        const user = await User.findById(req.user.id).select('isBanned');
        if (user && user.isBanned) {
            return res.status(403).json({ msg: 'Your account has been banned by the Admin.' });
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
