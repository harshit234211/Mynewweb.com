const mongoose = require('mongoose');
const Template = require('./models/Template');
const { forceRegenerateToday } = require('./utils/scheduler');

const templates = [
  {
    title: "Clash Squad 1v1", category: "Clash Squad 1v1", autoRepeat: true, repeatIntervalMins: 10,
    startTime: "10:00 AM", endTime: "11:00 PM", entryFee: 20, prizePool: 35, totalSlots: 2, teamType: "Solo", mode: "1v1", map: "Bermuda", durationMins: 15, status: "active"
  },
  {
    title: "Clash Squad 2v2", category: "Clash Squad 2v2", autoRepeat: true, repeatIntervalMins: 15,
    startTime: "10:00 AM", endTime: "11:00 PM", entryFee: 40, prizePool: 70, totalSlots: 4, teamType: "Duo", mode: "2v2", map: "Bermuda", durationMins: 15, status: "active"
  },
  {
    title: "Clash Squad 4v4", category: "Clash Squad 4v4", autoRepeat: true, repeatIntervalMins: 20,
    startTime: "10:00 AM", endTime: "11:00 PM", entryFee: 80, prizePool: 150, totalSlots: 8, teamType: "Squad", mode: "4v4", map: "Bermuda", durationMins: 15, status: "active"
  },
  {
    title: "Sniper Only", category: "Sniper Only", autoRepeat: true, repeatIntervalMins: 20,
    startTime: "10:00 AM", endTime: "11:00 PM", entryFee: 15, prizePool: 25, totalSlots: 2, teamType: "Solo", mode: "1v1", map: "Bermuda", durationMins: 15, status: "active"
  },
  {
    title: "BR Survival", category: "BR Survival", autoRepeat: true, repeatIntervalMins: 30,
    startTime: "10:00 AM", endTime: "11:00 PM", entryFee: 20, prizePool: 500, totalSlots: 48, teamType: "Solo", mode: "Classic", map: "Bermuda", durationMins: 25, status: "active"
  },
  {
    title: "BR Per Kill", category: "BR Per Kill", autoRepeat: true, repeatIntervalMins: 30,
    startTime: "10:00 AM", endTime: "11:00 PM", entryFee: 20, prizePool: 0, perKill: 15, totalSlots: 48, teamType: "Solo", mode: "Classic", map: "Bermuda", durationMins: 25, status: "active"
  },
  {
    title: "Free Tournament", category: "Free Tournament", autoRepeat: false, repeatIntervalMins: 0,
    startTime: "09:00 PM", endTime: "10:00 PM", entryFee: 0, prizePool: 100, totalSlots: 48, teamType: "Solo", mode: "Classic", map: "Bermuda", durationMins: 25, status: "active"
  }
];

mongoose.connect('mongodb://localhost:27017/fragarena').then(async () => {
    console.log("Connected to MongoDB.");
    
    for (const t of templates) {
        const exists = await Template.findOne({ title: t.title });
        if (!exists) {
            await Template.create(t);
            console.log(`Created template: ${t.title}`);
        }
    }
    
    console.log("Forcing scheduler to generate today's tournaments...");
    await forceRegenerateToday();
    console.log("Done generating tournaments.");
    
    process.exit(0);
}).catch(console.error);
