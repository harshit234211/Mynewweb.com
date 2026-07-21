const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://shakyaharshit683_db_user:Test123456@cluster0.ieq46cq.mongodb.net/?appName=Cluster0').then(async () => {
  const count = await mongoose.connection.collection('schedules').countDocuments();
  const enabledCount = await mongoose.connection.collection('schedules').countDocuments({ enabled: true });
  console.log('Total schedules:', count, 'Enabled:', enabledCount);
  process.exit(0);
}).catch(console.error);
