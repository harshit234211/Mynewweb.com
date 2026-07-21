const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const { sendTelegramAlert } = require('../utils/telegram');
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const webpush = require('web-push');

// Initialize Web Push
webpush.setVapidDetails(
    'mailto:test@example.com',
    'BO_atOzAOjGH9cahv4qOWBDbsWbX8eVjfDn0bZWOV3r1XMt395vZdSRxrOYfduqxtk0NhhG7ZWMnrWAZLiTX9uI',
    'MqH6m1262Zm4j4Qk4d2pPdjggWjp5FAArMy-JEKq-KQ'
);

// Middleware to verify Admin role
const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin' && user.role !== 'finance_admin') {
            return res.status(403).json({ msg: 'Access denied: Admin permissions required' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server security error');
    }
};

// @route   GET api/admin/stats
// @desc    Get dashboard stats (Total users, deposits, withdrawals)
// @access  Private (Admin only)
router.get('/stats', auth, verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        
        const deposits = await Transaction.aggregate([
            { $match: { type: 'deposit', status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = deposits[0] ? deposits[0].total : 0;

        const pendingDeposits = await Transaction.aggregate([
            { $match: { type: 'deposit', status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalPendingDeposits = pendingDeposits[0] ? pendingDeposits[0].total : 0;

        const withdrawals = await Transaction.aggregate([
            { $match: { type: 'withdrawal', status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawals = withdrawals[0] ? withdrawals[0].total : 0;

        const pendingWithdrawals = await Transaction.aggregate([
            { $match: { type: 'withdrawal', status: 'pending' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalPendingWithdrawals = pendingWithdrawals[0] ? pendingWithdrawals[0].total : 0;

        res.json({
            totalUsers,
            totalDeposits,
            totalPendingDeposits,
            totalWithdrawals,
            totalPendingWithdrawals
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/import-data
// @desc    Import local database data to Vercel (bypasses VPN block)
// @access  Public (Temporary for migration)
router.post('/import-data', async (req, res) => {
    try {
        const { users, transactions, schedules, templates, tournaments, appinfos, clans, settings, clear } = req.body;
        
        if (users && users.length) { if (clear) await User.deleteMany({}); await User.insertMany(users); }
        if (transactions && transactions.length) { if (clear) await Transaction.deleteMany({}); await Transaction.insertMany(transactions); }
        if (schedules && schedules.length) { const Schedule = require('../models/Schedule'); if (clear) await Schedule.deleteMany({}); await Schedule.insertMany(schedules); }
        if (tournaments && tournaments.length) { if (clear) await Tournament.deleteMany({}); await Tournament.insertMany(tournaments); }
        if (appinfos && appinfos.length) { const AppInfo = mongoose.connection.collection('appinfos'); if (clear) await AppInfo.deleteMany({}); await AppInfo.insertMany(appinfos); }
        
        res.json({ success: true, msg: 'Data chunk imported successfully over HTTP!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/admin/users
// @desc    Get all users list
// @access  Private (Admin only)
router.get('/users', auth, verifyAdmin, async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const users = await User.find(query).select('-password').sort({ date: -1 }).limit(50);
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/users/:id/role
// @desc    Change user role (e.g. to 'host' or 'player')
// @access  Private (Admin only)
router.post('/users/:id/role', auth, verifyAdmin, async (req, res) => {
    const { role } = req.body;
    if (!['player', 'host', 'admin', 'finance_admin'].includes(role)) {
        return res.status(400).json({ msg: 'Invalid role' });
    }
    try {
        const userObj = await User.findById(req.params.id);
        if (!userObj) return res.status(404).json({ msg: 'User not found' });
        
        userObj.role = role;
        await userObj.save();
        res.json({ success: true, user: { id: userObj.id, username: userObj.username, role: userObj.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/users/:id/password
// @desc    Change a user's password
// @access  Private (Admin only)
router.put('/users/:id/password', auth, verifyAdmin, async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ msg: 'Please provide a new password' });
    }

    try {
        const userObj = await User.findById(req.params.id);
        if (!userObj) return res.status(404).json({ msg: 'User not found' });
        
        const salt = await bcrypt.genSalt(10);
        userObj.password = await bcrypt.hash(newPassword, salt);
        await userObj.save();

        res.json({ success: true, msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/users/:id/add-coins
// @desc    Add coins to a user/host
// @access  Private (Admin only)
router.post('/users/:id/add-coins', auth, verifyAdmin, async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ msg: 'Please provide a valid positive amount' });
    }

    try {
        const userObj = await User.findById(req.params.id);
        if (!userObj) return res.status(404).json({ msg: 'User not found' });
        
        userObj.coins = (userObj.coins || 0) + Number(amount);
        await userObj.save();

        res.json({ success: true, msg: `${amount} coins added successfully to ${userObj.username}`, coins: userObj.coins });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/hosts/create
// @desc    Create a Host account
// @access  Private (Admin only)
router.post('/hosts/create', auth, verifyAdmin, async (req, res) => {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
        let hostUser = await User.findOne({ phone });
        if (hostUser) {
            return res.status(400).json({ msg: 'Phone number already registered' });
        }

        hostUser = new User({
            username,
            phone,
            password,
            role: 'host' // Force Host role
        });

        const salt = await bcrypt.genSalt(10);
        hostUser.password = await bcrypt.hash(password, salt);
        await hostUser.save();

        res.json({ success: true, host: { id: hostUser.id, username: hostUser.username, phone: hostUser.phone } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/withdrawals
// @desc    Get all pending withdrawal requests
// @access  Private (Admin only)
router.get('/withdrawals', auth, verifyAdmin, async (req, res) => {
    try {
        const withdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' })
            .populate('user', 'username phone')
            .sort({ date: 1 });
        res.json(withdrawals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/withdrawals/:id/resolve
// @desc    Approve or Reject withdrawal request
// @access  Private (Admin only)
router.post('/withdrawals/:id/resolve', auth, verifyAdmin, async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'

    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
            return res.status(404).json({ msg: 'Pending withdrawal request not found' });
        }

        const user = await User.findById(transaction.user);
        if (!user) return res.status(404).json({ msg: 'User profile not found' });

        if (action === 'approve') {
            transaction.status = 'success';
            transaction.detail = 'Withdrawal processed and transfer approved by Admin';
            await transaction.save();

            // Notify Admin via Telegram
            await sendTelegramAlert(
                `✅ <b>Withdrawal Request Approved</b>\n\n` +
                `👤 Player: <b>${user.username}</b>\n` +
                `💰 Amount: <b>₹${transaction.amount}</b>\n` +
                `🏦 UPI ID: <code>${transaction.upiId}</code>\n` +
                `📊 Status: SUCCESSFUL`
            );
        } else if (action === 'reject') {
            transaction.status = 'failed';
            transaction.detail = 'Withdrawal request rejected by Admin. Refunded to wallet winnings.';
            
            // Refund locked coins back to winning wallet
            user.winnings += transaction.amount;
            await user.save();
            await transaction.save();

            // Notify Admin via Telegram
            await sendTelegramAlert(
                `❌ <b>Withdrawal Request Rejected</b>\n\n` +
                `👤 Player: <b>${user.username}</b>\n` +
                `💰 Amount: <b>₹${transaction.amount}</b>\n` +
                `🏦 UPI ID: <code>${transaction.upiId}</code>\n` +
                `📊 Status: REJECTED & REFUNDED`
            );
        } else {
            return res.status(400).json({ msg: 'Invalid action parameter' });
        }

        res.json({ success: true, transaction });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/tournaments/:matchId/players/:playerId/slot
// @desc    Edit the slot of a joined player
// @access  Private (Admin only)
router.put('/tournaments/:matchId/players/:playerId/slot', auth, verifyAdmin, async (req, res) => {
    try {
        const { matchId, playerId } = req.params;
        const { teamNo, position } = req.body;

        const tournament = await Tournament.findById(matchId);
        if (!tournament) return res.status(404).json({ msg: 'Tournament not found' });

        const playerIndex = tournament.joinedPlayers.findIndex(p => p.user.toString() === playerId);
        if (playerIndex === -1) return res.status(404).json({ msg: 'Player not found in this match' });

        const isOccupied = tournament.joinedPlayers.find(p => p.teamNo === Number(teamNo) && p.position === position && p.user.toString() !== playerId);
        if (isOccupied) return res.status(400).json({ msg: 'This slot is already occupied by another player' });

        tournament.joinedPlayers[playerIndex].teamNo = Number(teamNo);
        if (position) tournament.joinedPlayers[playerIndex].position = position;

        await tournament.save();
        res.json({ msg: 'Slot updated successfully', joinedPlayers: tournament.joinedPlayers });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/tournaments/create
// @desc    Launch/Create a tournament match
// @access  Private (Admin only)
router.post('/tournaments/create', auth, verifyAdmin, async (req, res) => {
    const { title, category, date, time, entryFee, prizePool, perKill, totalSlots, hostId, settings } = req.body;

    if (!title || !category || !date || !time || entryFee === undefined || prizePool === undefined || !totalSlots || !hostId) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    try {
        const tournament = new Tournament({
            title,
            category,
            date,
            time,
            entryFee,
            prizePool,
            perKill,
            totalSlots,
            host: hostId,
            settings: settings || {}
        });

        await tournament.save();

        // Notify Admin via Telegram
        await sendTelegramAlert(
            `🎮 <b>New Tournament Created</b>\n\n` +
            `🏆 Title: <b>${title}</b>\n` +
            `⚔️ Mode: <b>${category}</b>\n` +
            `⏰ Time: <b>${date} at ${time}</b>\n` +
            `💰 Entry Fee: <b>₹${entryFee}</b>\n` +
            `🎁 Prize Pool: <b>₹${prizePool}</b>`
        );

        res.json({ success: true, tournament });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/earnings
// @desc    Get admin commission earnings & system analytics
// @access  Private (Admin only)
router.get('/earnings', auth, verifyAdmin, async (req, res) => {
    try {
        const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
        
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0,0,0,0);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const startOfYear = new Date();
        startOfYear.setMonth(0, 1);
        startOfYear.setHours(0,0,0,0);

        // Fetch all commission transactions
        const commissionTxList = await Transaction.find({ type: 'commission' })
            .populate('user', 'username phone')
            .sort({ date: -1 });

        let todayEarnings = 0;
        let weeklyEarnings = 0;
        let monthlyEarnings = 0;
        let yearlyEarnings = 0;
        let lifetimeEarnings = 0;

        commissionTxList.forEach(tx => {
            const txDate = new Date(tx.date);
            lifetimeEarnings += tx.amount;
            if (txDate >= startOfToday) todayEarnings += tx.amount;
            if (txDate >= startOfWeek) weeklyEarnings += tx.amount;
            if (txDate >= startOfMonth) monthlyEarnings += tx.amount;
            if (txDate >= startOfYear) yearlyEarnings += tx.amount;
        });

        // Fetch completed matches to calculate total collections & payouts
        const completedMatches = await Tournament.find({ status: 'completed' });
        let totalCollection = 0;
        let totalPayout = 0;

        completedMatches.forEach(m => {
            const playersCount = m.joinedPlayers.length;
            totalCollection += m.entryFee * playersCount;
            totalPayout += m.prizePool;
        });

        // Calculate System Analytics
        const totalUsers = await User.countDocuments();
        
        const todayRegistrations = await Transaction.countDocuments({
            type: 'entryfee',
            date: { $gte: startOfToday }
        });

        const todayDepositsList = await Transaction.find({
            type: 'deposit',
            status: 'success',
            date: { $gte: startOfToday }
        });
        const todayDeposits = todayDepositsList.reduce((sum, tx) => sum + tx.amount, 0);

        const todayWithdrawalsList = await Transaction.find({
            type: 'withdrawal',
            status: 'success',
            date: { $gte: startOfToday }
        });
        const todayWithdrawals = todayWithdrawalsList.reduce((sum, tx) => sum + tx.amount, 0);

        res.json({
            totalCollection,
            totalPayout,
            netCommission: lifetimeEarnings,
            todayEarnings,
            weeklyEarnings,
            monthlyEarnings,
            yearlyEarnings,
            lifetimeEarnings,
            analytics: {
                totalUsers,
                todayRegistrations,
                todayRevenue: todayEarnings,
                todayDeposits,
                todayWithdrawals
            },
            transactions: commissionTxList
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/deposits
// @desc    Get all pending manual deposit requests
// @access  Private (Admin only)
router.get('/deposits', auth, verifyAdmin, async (req, res) => {
    try {
        const deposits = await Transaction.find({ type: 'deposit', status: 'pending' })
            .populate('user', 'username phone')
            .sort({ date: 1 });
        res.json(deposits);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/deposits/:id/resolve
// @desc    Approve or Reject manual deposit request
// @access  Private (Admin only)
router.post('/deposits/:id/resolve', auth, verifyAdmin, async (req, res) => {
    const { action } = req.body; // 'approve' or 'reject'

    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction || transaction.type !== 'deposit' || transaction.status !== 'pending') {
            return res.status(404).json({ msg: 'Pending deposit request not found' });
        }

        const user = await User.findById(transaction.user);
        if (!user) return res.status(404).json({ msg: 'User profile not found' });

        if (action === 'approve') {
            transaction.status = 'success';
            transaction.detail = `Manual deposit approved by Admin. UTR: ${transaction.utr}`;
            await transaction.save();

            // Credit coins to user wallet
            user.coins += transaction.amount;
            await user.save();

            // Notify via Telegram
            await sendTelegramAlert(
                `✅ <b>Manual Deposit Request Approved</b>\n\n` +
                `👤 Player: <b>${user.username}</b>\n` +
                `💰 Amount: <b>₹${transaction.amount}</b> credited as coins\n` +
                `🔢 UTR/TxID: <code>${transaction.utr}</code>\n` +
                `📊 Status: SUCCESSFUL`
            );
        } else if (action === 'reject') {
            transaction.status = 'failed';
            transaction.detail = `Manual deposit request rejected by Admin. UTR: ${transaction.utr}`;
            await transaction.save();

            // Notify via Telegram
            await sendTelegramAlert(
                `❌ <b>Manual Deposit Request Rejected</b>\n\n` +
                `👤 Player: <b>${user.username}</b>\n` +
                `💰 Amount: <b>₹${transaction.amount}</b>\n` +
                `🔢 UTR/TxID: <code>${transaction.utr}</code>\n` +
                `📊 Status: REJECTED`
            );
        } else {
            return res.status(400).json({ msg: 'Invalid action parameter' });
        }

        res.json({ success: true, transaction });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const Schedule = require('../models/Schedule');

// @route   GET api/admin/schedules
// @desc    Get all daily schedules
// @access  Private (Admin only)
router.get('/schedules', auth, verifyAdmin, async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ time: 1 });
        res.json(schedules);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/generate-schedules
// @desc    Generate matches for the current day based on active schedules
// @access  Private (Admin only)
router.post('/generate-schedules', auth, verifyAdmin, async (req, res) => {
    try {
        const activeSchedules = await Schedule.find({ enabled: true });
        if (activeSchedules.length === 0) {
            return res.json({ success: true, count: 0, msg: 'No active schedules found.' });
        }

        const today = new Date();
        // Format today as YYYY-MM-DD
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        let generatedCount = 0;

        for (const sched of activeSchedules) {
            // Check if a match for this schedule already exists today
            const existing = await Tournament.findOne({
                title: sched.title,
                date: dateStr,
                time: sched.time
            });

            if (!existing) {
                // Parse closing time: assume 15 minutes before start time
                // To do this simply, we just set it to null and let the frontend/backend handle it
                const newTourney = new Tournament({
                    title: sched.title,
                    category: sched.category,
                    date: dateStr,
                    time: sched.time,
                    entryFee: sched.entryFee,
                    prizePool: sched.prizePool,
                    perKill: sched.perKill,
                    totalSlots: sched.totalSlots,
                    teamType: sched.teamType,
                    mode: sched.mode,
                    map: sched.map,
                    matchType: sched.matchType,
                    rules: sched.rules,
                    prizeDistribution: sched.prizeDistribution,
                    host: req.user.id,
                    status: 'upcoming'
                });
                await newTourney.save();
                generatedCount++;
            }
        }

        res.json({ success: true, count: generatedCount, msg: `Generated ${generatedCount} new matches for today.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/schedules
// @desc    Create a new daily schedule template
// @access  Private (Admin only)
router.post('/schedules', auth, verifyAdmin, async (req, res) => {
    const { time, category, title, entryFee, prizePool, perKill, totalSlots, teamType, mode, map, matchType, rules, prizeDistribution, notice } = req.body;

    if (!time || !category || !title || !entryFee || !prizePool) {
        return res.status(400).json({ msg: 'Please fill all required fields' });
    }

    try {
        const newSched = new Schedule({
            time, category, title,
            entryFee: parseInt(entryFee),
            prizePool: parseInt(prizePool),
            perKill: parseInt(perKill || 0),
            totalSlots: parseInt(totalSlots || 20),
            teamType: teamType || 'Solo',
            mode: mode || 'Solo',
            map: map || 'Bermuda',
            matchType: matchType || 'Paid',
            rules: Array.isArray(rules) ? rules : (rules ? rules.split('\n').filter(r => r.trim()) : []),
            prizeDistribution: Array.isArray(prizeDistribution) ? prizeDistribution : [],
            notice: notice || ''
        });

        await newSched.save();
        res.json({ success: true, schedule: newSched });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/schedules/:id
// @desc    Update / Enable / Disable a schedule template
// @access  Private (Admin only)
router.put('/schedules/:id', auth, verifyAdmin, async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ msg: 'Schedule template not found' });

        const fieldsToUpdate = req.body;
        
        for (const [key, value] of Object.entries(fieldsToUpdate)) {
            schedule[key] = value;
        }

        await schedule.save();
        res.json({ success: true, schedule });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/admin/schedules/:id
// @desc    Delete a daily schedule template
// @access  Private (Admin only)
router.delete('/schedules/:id', auth, verifyAdmin, async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) return res.status(404).json({ msg: 'Schedule template not found' });

        res.json({ success: true, msg: 'Schedule template deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

// @route   PUT api/admin/users/:id/ban
// @desc    Ban or Unban a user
// @access  Private (Admin & Finance Admin)
router.put('/users/:id/ban', auth, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'finance_admin')) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.isBanned = !user.isBanned;
        await user.save();
        res.json({ msg: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, isBanned: user.isBanned });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/settings/announcement
// @desc    Get in-app announcement
// @access  Public
router.get('/settings/announcement', async (req, res) => {
    try {
        const config = await Settings.findOne({ key: 'globalAnnouncement' });
        res.json(config ? config.value : { message: '' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/settings/announcement
// @desc    Update in-app announcement
// @access  Private (Admin & Finance Admin)
router.post('/settings/announcement', auth, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'finance_admin')) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { message } = req.body;
        let config = await Settings.findOne({ key: 'globalAnnouncement' });
        if (config) {
            config.value = { message };
        } else {
            config = new Settings({ key: 'globalAnnouncement', value: { message } });
        }
        await config.save();
        res.json({ success: true, message });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/upload-image
// @desc    Upload an image (banner) and get URL (base64)
// @access  Private (Admin & Finance Admin)
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'finance_admin')) {
            return res.status(403).json({ msg: 'Access denied' });
        }
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        res.json({ success: true, url: base64Image });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/settings/promo-banners
// @desc    Get dynamic promo banners
// @access  Public
router.get('/settings/promo-banners', async (req, res) => {
    try {
        const config = await Settings.findOne({ key: 'promoBanners' });
        res.json(config ? config.value : []);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/settings/promo-banners
// @desc    Update dynamic promo banners
// @access  Private (Admin & Finance Admin)
router.post('/settings/promo-banners', auth, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'finance_admin')) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { banners } = req.body; // Expecting array of { id, image, link }
        if (!Array.isArray(banners)) {
            return res.status(400).json({ msg: 'Invalid banners payload' });
        }

        let config = await Settings.findOne({ key: 'promoBanners' });
        if (config) {
            config.value = banners;
        } else {
            config = new Settings({ key: 'promoBanners', value: banners });
        }
        await config.save();
        res.json({ success: true, banners: config.value });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/notifications/subscribe
// @desc    Subscribe a user to push notifications
// @access  Private
router.post('/notifications/subscribe', auth, async (req, res) => {
    try {
        const { subscription } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.pushSubscription = subscription;
        await user.save();
        res.status(201).json({ msg: 'Subscribed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/notifications/send
// @desc    Send push notification to all users
// @access  Private (Admin & Finance Admin)
router.post('/notifications/send', auth, async (req, res) => {
    try {
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'finance_admin')) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { title, body } = req.body;
        const payload = JSON.stringify({ title, body });

        const users = await User.find({ pushSubscription: { $ne: null } });
        
        // We set VAPID keys here inside the route as well in case env vars are loaded dynamically
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BO_atOzAOjGH9cahv4qOWBDbsWbX8eVjfDn0bZWOV3r1XMt395vZdSRxrOYfduqxtk0NhhG7ZWMnrWAZLiTX9uI';
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'MqH6m1262Zm4j4Qk4d2pPdjggWjp5FAArMy-JEKq-KQ';
        webpush.setVapidDetails('mailto:admin@fragarena.com', vapidPublicKey, vapidPrivateKey);

        const notificationPromises = users.map(user => 
            webpush.sendNotification(user.pushSubscription, payload).catch(err => {
                console.error(`Error sending to user ${user.username}:`, err);
                // Optionally remove invalid subscriptions
            })
        );
        
        await Promise.all(notificationPromises);
        res.json({ msg: `Push notification sent to ${users.length} users.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/settings/category-banners
// @desc    Get dynamic category banners
// @access  Public
router.get('/settings/category-banners', async (req, res) => {
    try {
        const config = await Settings.findOne({ key: 'categoryBanners' });
        res.json(config ? config.value : {});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/admin/settings/category-banners
// @desc    Update dynamic category banners (Restricted to first admin)
// @access  Private (First Admin only)
router.post('/settings/category-banners', auth, async (req, res) => {
    try {
        // Explicitly check for the first admin's phone number as requested
        const user = await User.findById(req.user.id);
        if (!user || user.phone !== '7017022966') {
            return res.status(403).json({ msg: 'Access denied: Restricted to First Admin' });
        }

        const { banners } = req.body;
        if (!banners || typeof banners !== 'object') {
            return res.status(400).json({ msg: 'Invalid banners payload' });
        }

        let config = await Settings.findOne({ key: 'categoryBanners' });
        if (config) {
            config.value = banners;
        } else {
            config = new Settings({ key: 'categoryBanners', value: banners });
        }
        await config.save();
        res.json({ success: true, banners: config.value });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
