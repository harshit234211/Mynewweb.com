const mongoose = require('mongoose');
const User = require('./models/User');
const Tournament = require('./models/Tournament');

async function injectFakeTournaments() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fragarena';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');

        // Fetch fake users (identified by names from our list)
        const fakeNames = ["RaiStar", "Ajjubhai94", "Amitbhai", "GyanSujan", "LokeshGamer", "DesiGamers", "TotalGaming", "SkSabirBoss", "PahadiGaming", "JontyGaming", "ASGaming", "B2K", "Vincenzo", "Ruok", "TondeGamer", "White444", "Badge99", "TwoSideGamers", "M8N", "ActionBolt"];
        
        // Find users that start with these names
        const users = await User.find({ 
            username: { $in: fakeNames.map(name => new RegExp(`^${name}`, 'i')) } 
        }).limit(20);

        if (users.length === 0) {
            console.log("No fake users found. Run inject_fake_users.js first.");
            process.exit();
        }

        // We need an admin user to be the host of the tournament
        const adminUser = await User.findOne({ role: 'admin' }) || users[0];

        // Create 3 fake completed tournaments
        for (let t = 0; t < 3; t++) {
            const joinedPlayers = [];
            
            // Randomly pick some users for this tournament
            const shuffledUsers = users.sort(() => 0.5 - Math.random()).slice(0, 10);
            
            for (let i = 0; i < shuffledUsers.length; i++) {
                const u = shuffledUsers[i];
                const kills = Math.floor(Math.random() * 8);
                const rank = i + 1;
                const prize = (10 - i) * 100 + (kills * 10);
                
                joinedPlayers.push({
                    user: u._id,
                    name: u.username,
                    uid: u.ffUid,
                    teamNo: i + 1,
                    kills: kills,
                    rank: rank,
                    prize: prize
                });
            }

            const matchDate = new Date();
            matchDate.setDate(matchDate.getDate() - t); // distribute over last 3 days

            const tournament = new Tournament({
                title: `Grand Finals - Match ${t + 1}`,
                category: 'BR Survival',
                date: matchDate.toISOString().split('T')[0],
                time: '18:00',
                entryFee: 50,
                prizePool: 5000,
                perKill: 10,
                totalSlots: 48,
                status: 'completed',
                host: adminUser._id,
                joinedPlayers: joinedPlayers,
                dateCreated: matchDate
            });

            await tournament.save();
            console.log(`Created fake tournament '${tournament.title}' with ${joinedPlayers.length} fake players.`);
        }

        console.log('Successfully injected fake tournaments for the leaderboard!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

injectFakeTournaments();
