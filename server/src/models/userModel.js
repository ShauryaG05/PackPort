const mongoose = require("mongoose");
const db = require("../config/database");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    agentCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    python_Packages: {
        outdated_packages: { type: mongoose.Schema.Types.Mixed, default: null },
        all_packages: { type: mongoose.Schema.Types.Mixed, default: null },
        version: { type: String, default: null },
        lastScanned: { type: Date, default: null }
    },
    node_Packages: {
        node_version: { type: String, default: null },
        npm_version: { type: String, default: null },
        version: { type: String, default: null },
        outdated_packages: { type: mongoose.Schema.Types.Mixed, default: null },
        all_packages: { type: mongoose.Schema.Types.Mixed, default: null },
        lastScanned: { type: Date, default: null }
    },
    agentTokens: [
        {
            token: { type: String, required: true },
            hostname: { type: String, default: "" },
            platform: { type: String, default: "" },
            arch: { type: String, default: "" },
            linkedAt: { type: Date, default: Date.now },
            lastActiveAt: { type: Date, default: Date.now }
        }
    ],
    agentLinkedAt: {
        type: Date,
        default: null
    }


}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
