const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        // Use the CONNECTION_STRING from environment (server.js normalizes it)
        await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("🟢 Connected to MongoDB");
    } catch (err) {
        console.error("🔴 MongoDB connection error:", err && err.message ? err.message : err);
        // Re-throw so the caller can decide whether to exit or retry
        throw err;
    }
};

module.exports = connectDb;