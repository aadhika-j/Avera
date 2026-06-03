import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Define a simple script to copy all documents from local DB to Atlas DB
const migrate = async () => {
  const localUri = process.env.MONGO_URI || "mongodb://appuser:strongpass@127.0.0.1:27017/student_academic_reminder?authSource=admin";
  const atlasUri = process.argv[2];

  if (!atlasUri || !atlasUri.startsWith("mongodb+srv://")) {
    console.error("❌ Please provide your MongoDB Atlas URI as an argument.");
    console.error("Usage: node migrate-db.js \"mongodb+srv://<user>:<pass>@cluster...\"");
    process.exit(1);
  }

  console.log("🔄 Connecting to Local Database...");
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log("✅ Connected to Local DB");

  console.log("🔄 Connecting to Atlas Database...");
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  console.log("✅ Connected to Atlas DB");

  // Get all collections from the local DB
  const collections = await localConn.db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  console.log(`📦 Found ${collectionNames.length} collections to migrate: ${collectionNames.join(", ")}`);

  for (const name of collectionNames) {
    console.log(`\n▶️ Migrating collection: ${name}...`);
    const LocalModel = localConn.model(name, new mongoose.Schema({}, { strict: false }), name);
    const AtlasModel = atlasConn.model(name, new mongoose.Schema({}, { strict: false }), name);

    const docs = await LocalModel.find({}).lean();
    console.log(`   Found ${docs.length} documents.`);

    if (docs.length > 0) {
      // Clear existing data in Atlas for this collection to avoid duplicates
      await AtlasModel.deleteMany({});
      await AtlasModel.insertMany(docs);
      console.log(`   ✅ Copied ${docs.length} documents to Atlas.`);
    } else {
      console.log(`   ⏭️ Skipped (empty).`);
    }
  }

  console.log("\n🎉 Migration completed successfully!");
  
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
};

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
