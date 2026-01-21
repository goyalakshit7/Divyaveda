import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Fix bad index in UserRoleAssignment collection
async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGOURL);
        console.log("Connected to MongoDB");

        const db = mongoose.connection.db;
        const collection = db.collection("userroleassignments");

        // Get all indexes
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes);

        // Drop the bad index if it exists
        const badIndex = indexes.find(idx => idx.name === "email_1_role_id_1");
        if (badIndex) {
            console.log("Dropping bad index: email_1_role_id_1");
            await collection.dropIndex("email_1_role_id_1");
            console.log("✅ Bad index dropped successfully");
        } else {
            console.log("ℹ️ Bad index not found (already fixed or never existed)");
        }

        // Delete documents with null user_email
        console.log("Checking for documents with null user_email...");
        const badDocs = await collection.find({ user_email: null }).toArray();
        if (badDocs.length > 0) {
            console.log(`Found ${badDocs.length} documents with null user_email. Deleting...`);
            await collection.deleteMany({ user_email: null });
            console.log("✅ Bad documents deleted");
        } else {
            console.log("ℹ️ No documents with null user_email found");
        }

        // Create the correct index
        console.log("Creating correct index: user_email_1_role_id_1");
        await collection.createIndex(
            { user_email: 1, role_id: 1 },
            { unique: true, name: "user_email_1_role_id_1" }
        );
        console.log("✅ Correct index created");

        await mongoose.disconnect();
        console.log("✅ Index fix complete!");
    } catch (error) {
        console.error("❌ Error fixing indexes:", error);
        process.exit(1);
    }
}

fixIndexes();
