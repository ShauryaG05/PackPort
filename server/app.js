// Packages
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Database connection
require("./src/config/database");

// Middleware

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.FrontEnd_URI || "http://localhost:5173",
    credentials: true
}));
// Routes
const authRoutes = require("./src/Routes/authRoutes");
const agentRoutes = require("./src/Routes/agentRoutes");

app.use("/auth", authRoutes);
app.use("/agent", agentRoutes);

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "PackPort Server is healthy" });
});

app.get("/", (req, res) => {
    res.status(200).json({ name: "PackPort API Server", version: "1.0.0", status: "running" });
});

module.exports = app;