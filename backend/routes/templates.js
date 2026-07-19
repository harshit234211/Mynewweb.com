const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Template = require('../models/Template');
const User = require('../models/User');

// Middleware to check admin role
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin' && user.role !== 'host') {
            return res.status(403).json({ msg: 'Access denied: Requires Admin privileges' });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/templates
// @desc    Get all templates
// @access  Public (for viewing schedule possibilities, or Admin only depending on use)
router.get('/', async (req, res) => {
    try {
        const templates = await Template.find().sort({ dateCreated: -1 });
        res.json(templates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/templates
// @desc    Create a new template
// @access  Admin
router.post('/', auth, isAdmin, async (req, res) => {
    try {
        const template = new Template(req.body);
        await template.save();
        
        // Trigger scheduler regeneration for today
        const { forceRegenerateToday } = require('../utils/scheduler');
        if (forceRegenerateToday) forceRegenerateToday();
        
        res.json(template);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/templates/:id
// @desc    Update a template
// @access  Admin
router.put('/:id', auth, isAdmin, async (req, res) => {
    try {
        let template = await Template.findById(req.params.id);
        if (!template) return res.status(404).json({ msg: 'Template not found' });

        template = await Template.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        // Trigger scheduler regeneration for today
        const { forceRegenerateToday } = require('../utils/scheduler');
        if (forceRegenerateToday) forceRegenerateToday();

        res.json(template);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/templates/:id
// @desc    Delete a template
// @access  Admin
router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) return res.status(404).json({ msg: 'Template not found' });

        await template.remove();

        // Trigger scheduler regeneration for today
        const { forceRegenerateToday } = require('../utils/scheduler');
        if (forceRegenerateToday) forceRegenerateToday();

        res.json({ msg: 'Template removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
