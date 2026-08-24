const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    // Some networks refuse DNS SRV requests used by mongodb+srv URLs.  Allow
    // the deployment/local .env to provide a public resolver when necessary.
    if (process.env.DNS_SERVERS) {
      const servers = process.env.DNS_SERVERS.split(",")
        .map((server) => server.trim())
        .filter(Boolean);

      if (servers.length) dns.setServers(servers);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
