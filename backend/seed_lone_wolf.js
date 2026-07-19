const mongoose = require('mongoose');
const Template = require('./models/Template');
const { forceRegenerateToday } = require('./utils/scheduler');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fragarena', {
    serverSelectionTimeoutMS: 5000
}).then(async () => {
    console.log("Connected to MongoDB");

    const lw1v1 = {
        title: 'Lone Wolf 1v1',
        category: 'Lone Wolf 1v1',
        entryFee: 15,
        prizePool: 25,
        totalSlots: 2,
        teamType: 'Solo',
        mode: '1v1',
        map: 'Bermuda',
        durationMins: 15,
        autoRepeat: true,
        repeatIntervalMins: 10,
        startTime: '10:00 AM',
        endTime: '11:00 PM',
        bannerUrl: 'https://storage.googleapis.com/mpx-storage/841c1b32-7bf1-4702-a2a7-0f3c71758603/ea62b325-144a-49e5-b10f-bbbf2148722c.jpeg',
        status: 'active'
    };

    const lw2v2 = {
        title: 'Lone Wolf 2v2',
        category: 'Lone Wolf 2v2',
        entryFee: 30,
        prizePool: 50,
        totalSlots: 4,
        teamType: 'Duo',
        mode: '2v2',
        map: 'Bermuda',
        durationMins: 15,
        autoRepeat: true,
        repeatIntervalMins: 15,
        startTime: '10:00 AM',
        endTime: '11:00 PM',
        bannerUrl: 'https://storage.googleapis.com/mpx-storage/841c1b32-7bf1-4702-a2a7-0f3c71758603/dd9d02cb-8df0-4b24-912b-31d7967ad7f5.jpeg',
        status: 'active'
    };

    await Template.findOneAndUpdate({ category: 'Lone Wolf 1v1' }, lw1v1, { upsert: true, new: true });
    await Template.findOneAndUpdate({ category: 'Lone Wolf 2v2' }, lw2v2, { upsert: true, new: true });

    console.log("Templates seeded.");
    await forceRegenerateToday();
    console.log("Matches generated.");
    
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
