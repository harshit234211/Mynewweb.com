const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/fragarena').then(async () => {
    try {
        const phone = '8791984082';
        const password = 'harshit9090@@()';
        const role = 'finance_admin';

        // Check if user already exists
        let user = await User.findOne({ phone });

        if (user) {
            // Update role and password if exists
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.role = role;
            await user.save();
            console.log('Finance admin updated successfully!');
        } else {
            // Create new user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            user = new User({
                username: 'FinanceAdmin',
                ffName: 'FinanceAdmin',
                ffUid: '000000',
                phone: phone,
                password: hashedPassword,
                role: role
            });
            await user.save();
            console.log('Finance admin created successfully!');
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
});
