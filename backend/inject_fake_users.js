const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const fakeNames = ["RaiStar", "Ajjubhai94", "Amitbhai", "GyanSujan", "LokeshGamer", "DesiGamers", "TotalGaming", "SkSabirBoss", "PahadiGaming", "JontyGaming", "ASGaming", "B2K", "Vincenzo", "Ruok", "TondeGamer", "White444", "Badge99", "TwoSideGamers", "M8N", "ActionBolt", "GyanGaming", "LokeshBhai", "NawabGamer"];

async function injectFakeUsers() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fragarena';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        let addedCount = 0;

        for (let i = 0; i < 20; i++) {
            const username = fakeNames[i] + Math.floor(Math.random() * 1000);
            const phone = "98" + Math.floor(10000000 + Math.random() * 90000000).toString();
            
            // Random high stats for leaderboard
            const matches = Math.floor(Math.random() * 200) + 50;
            const kills = matches * (Math.floor(Math.random() * 5) + 2);
            const wins = Math.floor(matches * (Math.random() * 0.4 + 0.1));
            const earned = wins * 150 + kills * 10;
            const winnings = earned * 0.8;
            
            const user = new User({
                username: username,
                phone: phone,
                password: hashedPassword,
                ffName: fakeNames[i],
                ffUid: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
                stats: {
                    kills: kills,
                    matches: matches,
                    wins: wins,
                    earned: earned
                },
                winnings: winnings,
                level: Math.floor(Math.random() * 50) + 10,
                xp: matches * 100
            });

            await user.save();
            addedCount++;
            console.log(`Added fake user: ${username} (Kills: ${kills}, Earned: ${earned})`);
        }

        console.log(`Successfully injected ${addedCount} fake users into the leaderboard!`);
        process.exit();
    } catch (err) {
        console.error('Error injecting users:', err);
        process.exit(1);
    }
}

injectFakeUsers();
