const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/fragarena').then(async () => {
    try {
        const admin1 = await User.findOne({ phone: '7017022966' });
        if (admin1) {
            admin1.coins = (admin1.coins || 0) + 50000;
            await admin1.save();
            console.log('Added 50k coins to 7017022966');
        } else {
            console.log('Admin 1 not found');
        }

        const admin2 = await User.findOne({ phone: '8791984082' });
        if (admin2) {
            admin2.coins = (admin2.coins || 0) + 50000;
            await admin2.save();
            console.log('Added 50k coins to 8791984082');
        } else {
            console.log('Admin 2 not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
});
