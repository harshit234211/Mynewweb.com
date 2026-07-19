const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const Chat = require('../models/Chat');

function parseDateStr(dateStr, timeStr) {
    if (!dateStr || !timeStr) return new Date();
    const [day, month, year] = dateStr.split('/');
    const [time, ampm] = timeStr.split(' ');
    let [hours, mins] = time.split(':');
    hours = parseInt(hours);
    if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    
    const d = new Date();
    d.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
    d.setHours(hours, parseInt(mins), 0, 0);
    return d;
}

const Schedule = require('../models/Schedule');

const getTodayIST = () => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5));
    const yyyy = ist.getFullYear();
    const mm = String(ist.getMonth() + 1).padStart(2, '0');
    const dd = String(ist.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// @route   GET api/tournaments
// @desc    Get all tournaments (auto-generates today's matches from schedule on demand)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const d = new Date();
        const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        let tournamentsList = await Tournament.find()
            .populate('host', 'username')
            .sort({ date: 1, time: 1 });
            
        // Filter out past upcoming/ongoing matches for previous days
        tournamentsList = tournamentsList.filter(t => {
            if (t.status === 'upcoming' || t.status === 'ongoing') {
                return t.date === dateStr;
            }
            return true;
        });

        // Sort upcoming by nearest start time
        tournamentsList.sort((a, b) => {
            if (a.status === 'upcoming' && b.status === 'upcoming') {
                const timeA = parseDateStr(a.date, a.time);
                const timeB = parseDateStr(b.date, b.time);
                return timeA - timeB;
            }
            return 0;
        });
            
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.json(tournamentsList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/tournaments/:id
// @desc    Get tournament by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate('host', 'username')
            .populate('joinedPlayers.user', 'username ffName ffUid');
        if (!tournament) {
            return res.status(404).json({ msg: 'Tournament not found' });
        }
        res.json(tournament);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/tournaments/:id/join
// @desc    Register/Join a tournament match (Wallet balance checks & deduplication)
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const tournament = await Tournament.findById(req.params.id).session(session);
        if (!tournament) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ msg: 'Tournament not found' });
        }

        if (tournament.status !== 'upcoming') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ msg: 'Lobby registration closed: Match has started or resolved.' });
        }

        const user = await User.findById(req.user.id).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ msg: 'User profile not found' });
        }

        if (!user.ffUid || !user.ffName) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ msg: 'Please complete your Free Fire IGN and Character UID in Profile first!' });
        }

        const isRegistered = tournament.joinedPlayers.some(p => p.user.toString() === req.user.id);
        if (isRegistered) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ msg: 'You are already registered for this tournament' });
        }

        const isUidRegistered = tournament.joinedPlayers.some(p => p.uid === user.ffUid);
        if (isUidRegistered) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ msg: 'This Free Fire Character UID is already registered in this match by another player!' });
        }

        if (tournament.registrationClosingTime && new Date() >= tournament.registrationClosingTime) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ msg: 'Registration closed. Time is up!' });
        }

        if (tournament.joinedPlayers.length >= tournament.totalSlots) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ msg: 'Lobby slots are fully booked!' });
        }

        const totalBalance = user.coins + user.winnings;
        if (totalBalance < tournament.entryFee) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ msg: `Insufficient funds. Entry fee is ₹${tournament.entryFee}. Your balance is ₹${totalBalance}` });
        }

        let feeRemaining = tournament.entryFee;
        if (user.coins >= feeRemaining) {
            user.coins -= feeRemaining;
            feeRemaining = 0;
        } else {
            feeRemaining -= user.coins;
            user.coins = 0;
            user.winnings -= feeRemaining;
        }

        tournament.joinedPlayers.push({
            user: user._id,
            name: user.username,
            uid: user.ffUid,
            kills: 0,
            rank: 0
        });

        const transaction = new Transaction({
            user: user._id,
            type: 'entryfee',
            amount: tournament.entryFee,
            detail: `Lobby entry: ${tournament.title}`,
            status: 'success'
        });

        user.stats.matches += 1;

        await user.save({ session });
        await tournament.save({ session });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        if (tournament.joinedPlayers.length >= tournament.totalSlots) {
            const { createNextAvailableTournament } = require('../utils/scheduler');
            createNextAvailableTournament(tournament).catch(console.error);
        }

        res.json({ tournament, user });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/tournaments/:id/chat
// @desc    Get tournament room chat history
// @access  Private
router.get('/:id/chat', auth, async (req, res) => {
    try {
        const chats = await Chat.find({ roomType: 'tournament', tournament: req.params.id })
            .populate('sender', 'username role')
            .sort({ date: 1 })
            .limit(50);
        res.json(chats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/tournaments/:id/chat
// @desc    Post message in tournament room chat
// @access  Private
router.post('/:id/chat', auth, async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ msg: 'Message content cannot be blank' });

    try {
        const user = await User.findById(req.user.id);
        const chatMsg = new Chat({
            roomType: 'tournament',
            tournament: req.params.id,
            sender: user._id,
            senderName: user.username,
            message
        });

        await chatMsg.save();
        res.json(chatMsg);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
