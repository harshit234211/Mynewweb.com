const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can store objects, strings, arrays
        required: true
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);
