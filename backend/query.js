const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://shakyaharshit683_db_user:Test123456@cluster0.ieq46cq.mongodb.net/?appName=Cluster0').then(async () => {
  const AppInfo = mongoose.connection.collection('appinfos');
  const info = await AppInfo.findOne({});
  console.log(info ? JSON.stringify(info.categoryBanners, null, 2) : 'No AppInfo found');
  process.exit(0);
});
