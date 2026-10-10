const mongoose = require("mongoose")
const dns = require("dns")

// Configure Node.js DNS resolver fallback to prevent querySrv ECONNREFUSED issues
dns.setServers(["8.8.8.8", "1.1.1.1"])

mongoose.connect(`${process.env.DB_URI}`)
    .then(() => {
        console.log("DataBase Connected Successfully 🛠️");
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed ❌:", error.message);
    });

module.exports = mongoose;