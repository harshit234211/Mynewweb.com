const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const localUri = 'mongodb://127.0.0.1:27017/fragarena';
const remoteUri = 'mongodb://shakyaharshit683_db_user:Test123456@ac-ieoo4xp-shard-00-00.ieq46cq.mongodb.net:27017,ac-ieoo4xp-shard-00-01.ieq46cq.mongodb.net:27017,ac-ieoo4xp-shard-00-02.ieq46cq.mongodb.net:27017/fragarena?ssl=true&replicaSet=atlas-f906vk-shard-0&authSource=admin&retryWrites=true&w=majority';

async function migrate() {
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('Connected to local DB');
  
  const remoteConn = await mongoose.createConnection(remoteUri).asPromise();
  console.log('Connected to remote DB');

  const collections = ['users', 'transactions', 'schedules', 'templates', 'tournaments', 'appinfos', 'clans', 'settings'];

  for (const colName of collections) {
    console.log(`Migrating ${colName}...`);
    try {
        const localCol = localConn.collection(colName);
        const remoteCol = remoteConn.collection(colName);

        const data = await localCol.find({}).toArray();
        if (data.length > 0) {
        await remoteCol.deleteMany({});
        await remoteCol.insertMany(data);
        console.log(`Migrated ${data.length} documents in ${colName}.`);
        } else {
        console.log(`No documents found in local ${colName}.`);
        }
    } catch(e) { console.log('Error migrating ' + colName, e.message); }
  }

  // Also migrate images from AppInfo!
  const appInfoRemote = remoteConn.collection('appinfos');
  const appInfoDoc = await appInfoRemote.findOne({});
  if (appInfoDoc && appInfoDoc.categoryBanners) {
     const banners = appInfoDoc.categoryBanners;
     for (const [catId, url] of Object.entries(banners)) {
         if (url && url.includes('localhost:5000')) {
             const filename = url.split('/').pop();
             const localPath = path.join('C:/Users/shaky/Desktop/freefire-tournament-app-master/backend/public/uploads', filename);
             if (fs.existsSync(localPath)) {
                 const buffer = fs.readFileSync(localPath);
                 let ext = path.extname(filename).substring(1);
                 if (ext === 'jpg') ext = 'jpeg';
                 const base64 = `data:image/${ext};base64,${buffer.toString('base64')}`;
                 banners[catId] = base64;
                 console.log(`Converted ${catId} image to base64`);
             }
         }
     }
     await appInfoRemote.updateOne({ _id: appInfoDoc._id }, { $set: { categoryBanners: banners } });
     console.log('Updated AppInfo with base64 images.');
  }

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(console.error);
