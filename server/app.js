// Packages
const express = require("express");
const app = express();
app.set("trust proxy", 1);
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Database connection
require("./src/config/database");

// Middleware

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://pack-port-nine.vercel.app',
  'https://pack-port-ivu59eor4-shauryagupta2006s-projects.vercel.app',
  process.env.FrontEnd_URI
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || (typeof origin === "string" && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
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