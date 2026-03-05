const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use Google's DNS servers for SRV queries in development.
// This resolves the "querySrv ECONNREFUSED" issue when the ISP/local network blocks it.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;