const mongoose = require('mongoose');
const Settings = require('./models/Settings');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fragarena';

async function seed() {
    await mongoose.connect(mongoUri);

    const categories = [
        "Lone Wolf 1v1", "Lone Wolf 2v2", "Clash Squad 1v1", 
        "Clash Squad 2v2", "Clash Squad 4v4", "BR Survival", 
        "BR Per Kill", "CS Headshot", "Sniper Only", "Free Tournament"
    ];

    const categoryBannersObj = {};
    for (let i = 0; i < categories.length; i++) {
        categoryBannersObj[categories[i]] = `/uploads/banner_${i + 2}.jpeg`;
    }

    let catSettings = await Settings.findOne({ key: 'categoryBanners' });
    if (!catSettings) {
        catSettings = new Settings({ key: 'categoryBanners', value: categoryBannersObj });
    } else {
        catSettings.value = categoryBannersObj;
    }
    await catSettings.save();

    const promoBannersArr = [{
        image: `/uploads/banner_1.jpeg`,
        link: ``
    }];
    let promoSettings = await Settings.findOne({ key: 'promoBanners' });
    if (!promoSettings) {
        promoSettings = new Settings({ key: 'promoBanners', value: promoBannersArr });
    } else {
        promoSettings.value = promoBannersArr;
    }
    await promoSettings.save();

    console.log("Banners seeded successfully.");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
