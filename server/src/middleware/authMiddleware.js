const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing. Please log in."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email }).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err.message);
        return res.status(403).json({
            success: false,
            message: "Invalid or expired authentication session."
        });
    }
}

module.exports = authMiddleware;
