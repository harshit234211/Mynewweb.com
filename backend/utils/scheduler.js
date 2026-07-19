const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const Template = require('../models/Template');
const User = require('../models/User');

function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

function parseTimeToDate(dateStr, timeStr) {
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

async function getAdminHost() {
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        admin = await User.findOne();
    }
    return admin;
}

// Convert "09:00 AM" string to a Date object on a specific day
function getTemplateTimeOnDate(baseDate, timeStr) {
    const d = new Date(baseDate);
    const [time, ampm] = timeStr.split(' ');
    let [hours, mins] = time.split(':');
    hours = parseInt(hours);
    if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    d.setHours(hours, parseInt(mins), 0, 0);
    return d;
}

async function generateTournamentsForDate(dateObj, forceRegenerate = false) {
    console.log(`[Scheduler] Generating tournaments for ${dateObj.toLocaleDateString()}...`);
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const admin = await getAdminHost();
    if (!admin) return;

    const templates = await Template.find({ status: 'active' });

    for (const template of templates) {
        let startTime = getTemplateTimeOnDate(dateObj, template.startTime);
        let endTime = getTemplateTimeOnDate(dateObj, template.endTime);

        // If end time is before start time (e.g. 11 PM to 2 AM), assume end time is next day
        if (endTime <= startTime) {
            endTime.setDate(endTime.getDate() + 1);
        }

        let currentTime = new Date(startTime);

        while (currentTime <= endTime) {
            const timeStr = formatAMPM(currentTime);
            
            // Check if tournament already exists
            const existingTournament = await Tournament.findOne({ 
                date: dateStr, 
                time: timeStr, 
                templateId: template._id 
            });

            const matchType = template.entryFee > 0 ? 'Paid' : 'Free';
            
            // Registration closes exactly at start time (or any custom logic)
            const regCloseDate = new Date(currentTime);

            if (!existingTournament) {
                // If it doesn't exist, just create it
                // Only create if it's in the future (prevent generating passed tournaments on startup)
                if (currentTime > new Date() || dateObj > new Date()) {
                    await Tournament.create({
                        templateId: template._id,
                        title: template.title,
                        category: template.category,
                        date: dateStr,
                        time: timeStr,
                        entryFee: template.entryFee,
                        prizePool: template.prizePool,
                        perKill: template.perKill,
                        totalSlots: template.totalSlots,
                        teamType: template.teamType,
                        mode: template.mode,
                        map: template.map,
                        matchType,
                        bannerImage: template.bannerUrl,
                        rules: template.rules ? [template.rules] : [],
                        host: admin._id,
                        status: 'upcoming',
                        registrationClosingTime: regCloseDate
                    });
                }
            } else if (forceRegenerate && existingTournament.status === 'upcoming' && existingTournament.joinedPlayers.length === 0) {
                // If force regenerate and no one has joined, update the tournament fields
                existingTournament.title = template.title;
                existingTournament.category = template.category;
                existingTournament.entryFee = template.entryFee;
                existingTournament.prizePool = template.prizePool;
                existingTournament.perKill = template.perKill;
                existingTournament.totalSlots = template.totalSlots;
                existingTournament.teamType = template.teamType;
                existingTournament.mode = template.mode;
                existingTournament.map = template.map;
                existingTournament.matchType = matchType;
                existingTournament.bannerImage = template.bannerUrl;
                existingTournament.rules = template.rules ? [template.rules] : [];
                existingTournament.registrationClosingTime = regCloseDate;
                await existingTournament.save();
            }

            // Break if Auto Repeat is OFF (only generate once at startTime)
            if (!template.autoRepeat) break;

            // Increment by interval
            currentTime.setMinutes(currentTime.getMinutes() + template.repeatIntervalMins);
        }
    }
    console.log(`[Scheduler] Generation completed for ${dateStr}.`);
}

async function forceRegenerateToday() {
    const today = new Date();
    await generateTournamentsForDate(today, true);
    
    // Check if any deleted templates left empty upcoming tournaments and remove them
    const activeTemplates = await Template.find({ status: 'active' });
    const activeTemplateIds = activeTemplates.map(t => t._id.toString());
    
    await Tournament.deleteMany({
        status: 'upcoming',
        'joinedPlayers.0': { $exists: false },
        templateId: { $nin: activeTemplateIds }
    });
}

async function createNextAvailableTournament(originalTournament) {
    if (!originalTournament.templateId) return;
    
    const admin = await getAdminHost();
    if (!admin) return;
    
    const template = await Template.findById(originalTournament.templateId);
    if (!template || template.status !== 'active') return;

    const latest = await Tournament.findOne({ date: originalTournament.date, templateId: template._id }).sort({ _id: -1 });
    let nextTimeDate = new Date();
    if (latest) {
        nextTimeDate = parseTimeToDate(latest.date, latest.time);
    }
    
    nextTimeDate.setMinutes(nextTimeDate.getMinutes() + template.repeatIntervalMins);
    const newTimeStr = formatAMPM(nextTimeDate);
    const regCloseDate = new Date(nextTimeDate);

    const originalDate = parseTimeToDate(originalTournament.date, originalTournament.time);
    if (nextTimeDate.getDate() === originalDate.getDate()) {
        const exists = await Tournament.findOne({ date: originalTournament.date, time: newTimeStr, templateId: template._id });
        if (!exists) {
            await Tournament.create({
                templateId: template._id,
                title: template.title,
                category: template.category,
                date: originalTournament.date,
                time: newTimeStr,
                entryFee: template.entryFee,
                prizePool: template.prizePool,
                perKill: template.perKill,
                totalSlots: template.totalSlots,
                teamType: template.teamType,
                mode: template.mode,
                map: template.map,
                matchType: template.entryFee > 0 ? 'Paid' : 'Free',
                bannerImage: template.bannerUrl,
                rules: template.rules ? [template.rules] : [],
                host: admin._id,
                status: 'upcoming',
                registrationClosingTime: regCloseDate
            });
            console.log(`[Scheduler] Created overflow tournament for ${template.title} at ${newTimeStr}`);
        }
    }
}

async function tickStatuses() {
    try {
        const now = new Date();
        const upcomingTournaments = await Tournament.find({ status: 'upcoming' }).populate('templateId');
        
        for (const t of upcomingTournaments) {
            const startTime = parseTimeToDate(t.date, t.time);
            if (now >= startTime) {
                t.status = 'ongoing';
                await t.save();
                console.log(`[Scheduler] Match ${t.matchId} (${t.title}) is now LIVE (ongoing)`);
            }
        }

        const ongoingTournaments = await Tournament.find({ status: 'ongoing' }).populate('templateId');
        for (const t of ongoingTournaments) {
            const startTime = parseTimeToDate(t.date, t.time);
            const durationMins = t.templateId ? t.templateId.durationMins : 15; // default 15 mins if template deleted
            const endTime = new Date(startTime.getTime() + durationMins * 60000);
            
            if (now >= endTime) {
                t.status = 'completed';
                await t.save();
                console.log(`[Scheduler] Match ${t.matchId} (${t.title}) is now COMPLETED (Match History)`);
            }
        }

        // Midnight generation check
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            await generateTournamentsForDate(new Date());
        }
    } catch (err) {
        console.error('[Scheduler] Error in tick:', err);
    }
}

function initScheduler() {
    console.log('[Scheduler] Initializing Daily Dynamic Scheduler...');
    generateTournamentsForDate(new Date()).catch(err => console.error(err));
    setInterval(tickStatuses, 10000); // Check every 10 seconds
}

module.exports = {
    initScheduler,
    createNextAvailableTournament,
    forceRegenerateToday,
    generateTournamentsForDate
};
