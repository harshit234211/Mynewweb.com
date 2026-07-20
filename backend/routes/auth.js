const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a player
// @access  Public
router.post('/register', async (req, res) => {
    const { username, phone, password, referCode, email, firstName, lastName } = req.body;

    if (!username || !phone || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ $or: [{ phone }, { username }] });
        if (user) {
            return res.status(400).json({ msg: 'User with this phone or username already exists' });
        }

        user = new User({ username, phone, password, email, firstName, lastName });

        // Default Sign-up Welcome Bonus: 10 coins
        user.coins = 10;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const Transaction = require('../models/Transaction');

        // Handle Referral code bonus if valid
        let referralApplied = false;
        let referrerUser = null;
        if (referCode && referCode.trim()) {
            referrerUser = await User.findOne({
                username: { $regex: new RegExp("^" + referCode.trim() + "$", "i") }
            });
            if (referrerUser && referrerUser.id !== user.id) {
                // Award 10 coins referral bonus to referrer
                referrerUser.coins = (referrerUser.coins || 0) + 10;
                await referrerUser.save();

                // Log referrer transaction
                const refTx = new Transaction({
                    user: referrerUser._id,
                    type: 'deposit',
                    amount: 10,
                    detail: `Referral signup bonus from ${user.username}`,
                    status: 'success'
                });
                await refTx.save();
                referralApplied = true;
            }
        }

        // Log welcome bonus transaction for new user
        const welcomeTx = new Transaction({
            user: user._id,
            type: 'deposit',
            amount: 10,
            detail: referralApplied && referrerUser 
                ? `Sign-up Welcome Bonus (Referred by ${referrerUser.username})` 
                : 'Sign-up Welcome Bonus',
            status: 'success'
        });
        await welcomeTx.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fragarena_secret_token',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, phone: user.phone, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fragarena_secret_token',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        phone: user.phone,
                        role: user.role,
                        coins: user.coins,
                        winnings: user.winnings,
                        ffName: user.ffName,
                        ffUid: user.ffUid,
                        stats: user.stats
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('clan', 'name tag');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/profile
// @desc    Update user profile details
// @access  Private
router.put('/profile', auth, async (req, res) => {
    const { ffName, ffUid, username, phone } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (ffName) user.ffName = ffName;
        if (ffUid) user.ffUid = ffUid;
        if (username) user.username = username;
        if (phone) user.phone = phone;

        await user.save();
        res.json(user);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Username or phone number already in use by another account' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ msg: 'Please provide old and new password' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect old password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
