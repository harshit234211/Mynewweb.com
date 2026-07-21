const mongoose = require('mongoose');
require('dotenv').config();
const Template = require('./models/Template');
const { forceRegenerateToday } = require('./utils/scheduler');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        
        // Clear old templates
        await Template.deleteMany({});
        
        const templates = [
            {
                title: "BR Survival - ₹15 Entry",
                category: "BR Survival",
                entryFee: 15,
                prizePool: 500,
                perKill: 12,
                totalSlots: 48,
                teamType: "Solo",
                mode: "Solo",
                map: "Bermuda",
                durationMins: 20,
                autoRepeat: true,
                repeatIntervalMins: 90, // Every 1.5 hours
                startTime: "06:00 AM",
                endTime: "09:00 PM",
                status: 'active'
            },
            {
                title: "BR Survival - ₹20 Entry",
                category: "BR Survival",
                entryFee: 20,
                prizePool: 650,
                perKill: 15,
                totalSlots: 48,
                teamType: "Solo",
                mode: "Solo",
                map: "Bermuda",
                durationMins: 20,
                autoRepeat: true,
                repeatIntervalMins: 90, // Every 1.5 hours
                startTime: "06:30 AM",
                endTime: "09:00 PM",
                status: 'active'
            },
            {
                title: "BR Survival - ₹10 Entry",
                category: "BR Survival",
                entryFee: 10,
                prizePool: 320,
                perKill: 8,
                totalSlots: 48,
                teamType: "Solo",
                mode: "Solo",
                map: "Bermuda",
                durationMins: 20,
                autoRepeat: true,
                repeatIntervalMins: 90, // Every 1.5 hours
                startTime: "07:00 AM",
                endTime: "09:00 PM",
                status: 'active'
            }
        ];

        await Template.insertMany(templates);
        console.log("Templates inserted successfully!");

        // Generate matches for today
        await forceRegenerateToday();
        console.log("Matches generated for today successfully!");

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

run();
