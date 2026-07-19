const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    entryFee: { type: Number, required: true },
    prizePool: { type: Number, required: true },
    perKill: { type: Number, default: 0 },
    totalSlots: { type: Number, required: true },
    teamType: { type: String, default: 'Solo' },
    mode: { type: String, default: 'Solo' },
    map: { type: String, default: 'Bermuda' },
    
    // Engine specifics
    durationMins: { type: Number, required: true, default: 15 }, // Time tournament stays Live before moving to Finished
    autoRepeat: { type: Boolean, default: true },
    repeatIntervalMins: { type: Number, required: true, default: 30 }, // Interval in minutes (10, 15, 30, 60, etc.)
    startTime: { type: String, required: true }, // e.g. "09:00 AM" (Daily generation start window)
    endTime: { type: String, required: true }, // e.g. "11:00 PM" (Daily generation end window)
    
    bannerUrl: { type: String, default: '' },
    rules: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // If inactive, scheduler ignores it

    dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', TemplateSchema);
