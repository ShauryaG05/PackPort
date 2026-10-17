const express = require("express");
const route = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const crypto = require("crypto");
const User = require("../models/userModel");

// Simple sliding window rate limiter for linking attempts: max 15 requests per 60 seconds per IP
const linkAttempts = new Map();
function rateLimitLink(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxAttempts = 15;

    let record = linkAttempts.get(ip);
    if (!record || now - record.resetTime > windowMs) {
        record = { count: 1, resetTime: now };
        linkAttempts.set(ip, record);
    } else {
        record.count++;
        if (record.count > maxAttempts) {
            return res.status(429).json({
                success: false,
                message: "Too many linking attempts. Please wait a minute and try again."
            });
        }
    }
    next();
}

/**
 * POST /agent/link
 * Public verification endpoint for CLI and standalone agents.
 * Validates agent code, issues device enrollment token, and authorizes linking.
 */
route.post("/link", rateLimitLink, async (req, res) => {
    try {
        const { agentCode, hostname, platform, arch } = req.body || {};
        const trimmedCode = (agentCode || "").toString().trim();

        // 1. Strict input validation
        if (!trimmedCode || !/^[a-zA-Z0-9_-]{6,64}$/.test(trimmedCode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid agent code format. Must be 6-64 alphanumeric characters."
            });
        }

        // 2. Query database for associated user
        const user = await User.findOne({ agentCode: trimmedCode });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid or unrecognized agent code."
            });
        }

        // 3. Issue cryptographically secure device enrollment token
        const agentToken = crypto.randomBytes(32).toString("hex");

        const deviceEntry = {
            token: agentToken,
            hostname: (hostname || "unknown").toString().slice(0, 100),
            platform: (platform || "unknown").toString().slice(0, 50),
            arch: (arch || "unknown").toString().slice(0, 50),
            linkedAt: new Date(),
            lastActiveAt: new Date()
        };

        await User.updateOne(
            { _id: user._id },
            {
                $push: { agentTokens: deviceEntry },
                $set: { agentLinkedAt: new Date() }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Agent linked successfully",
            agentCode: user.agentCode,
            token: agentToken,
            user: {
                name: user.name
            }
        });
    } catch (err) {
        console.error("Agent linking error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error during agent linking"
        });
    }
});

// Alias for verification check
route.post("/verify-code", rateLimitLink, async (req, res) => {
    try {
        const { agentCode } = req.body || {};
        const trimmedCode = (agentCode || "").toString().trim();

        if (!trimmedCode || !/^[a-zA-Z0-9_-]{6,64}$/.test(trimmedCode)) {
            return res.status(400).json({ success: false, valid: false, message: "Invalid format." });
        }

        const user = await User.findOne({ agentCode: trimmedCode });
        if (!user) {
            return res.status(404).json({ success: false, valid: false, message: "Unrecognized agent code." });
        }

        return res.status(200).json({ success: true, valid: true });
    } catch (err) {
        return res.status(500).json({ success: false, valid: false, message: "Verification check error." });
    }
});

// All routes below require authMiddleware
route.use(authMiddleware);

/**
 * GET /agent/status
 * Returns current user's agent code, ecosystems metadata, and last scanned timestamps
 */
route.get("/status", async (req, res) => {
    try {
        const user = req.user;
        const io = req.app.get("io");
        let isOnline = false;

        if (io && user.agentCode) {
            const agentRoom = io.sockets.adapter.rooms.get(`agent:${user.agentCode}`);
            isOnline = Boolean(agentRoom && agentRoom.size > 0);
        }

        res.status(200).json({
            success: true,
            online: isOnline,
            agentCode: user.agentCode,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                agentCode: user.agentCode,
                createdAt: user.createdAt,
            },
            telemetry: {
                python: {
                    hasData: Boolean(user.python_Packages && (user.python_Packages.all_packages || user.python_Packages.outdated_packages)),
                    version: user.python_Packages?.version || null,
                    lastScanned: user.python_Packages?.lastScanned || null
                },
                node: {
                    hasData: Boolean(user.node_Packages && (user.node_Packages.all_packages || user.node_Packages.outdated_packages)),
                    version: user.node_Packages?.version || null,
                    lastScanned: user.node_Packages?.lastScanned || null
                }
            }
        });
    } catch (err) {
        console.error("Agent status error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

/**
 * GET /agent/packages
 * GET /agent/packages/:language
 * Retrieves actual package telemetry stored for the authenticated user
 */
const getPackages = async (req, res) => {
    try {
        const user = req.user;
        const requestedLang = (req.params.language || "").toLowerCase();

        return res.status(200).json({
            success: true,
            agentCode: user.agentCode,
            python_Packages: user.python_Packages || { outdated_packages: null, all_packages: null, version: null, lastScanned: null },
            node_Packages: user.node_Packages || { outdated_packages: null, all_packages: null, version: null, lastScanned: null },
            data: requestedLang === "python"
                ? (user.python_Packages || { outdated_packages: null, all_packages: null, version: null, lastScanned: null })
                : requestedLang === "node"
                    ? (user.node_Packages || { outdated_packages: null, all_packages: null, version: null, lastScanned: null })
                    : {
                        python: user.python_Packages || null,
                        node: user.node_Packages || null
                    }
        });
    } catch (err) {
        console.error("Get packages error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve package telemetry",
            error: err.message
        });
    }
};

route.get("/packages", getPackages);
route.get("/packages/:language", getPackages);

/**
 * Scan trigger endpoints:
 * - GET /agent/python_scan & POST /agent/python_scan
 * - GET /agent/node_scan & POST /agent/node_scan
 * - GET /agent/scan/:language & POST /agent/scan/:language
 */
function handleScan(lang) {
    return async (req, res) => {
        try {
            const user = req.user;
            const io = req.app.get("io");

            if (!io) {
                return res.status(500).json({
                    success: false,
                    message: "Real-time socket server is not initialized"
                });
            }

            const targetEvent = `${lang}_scan`;
            const agentRoom = `agent:${user.agentCode}`;
            const socketsInRoom = io.sockets.adapter.rooms.get(agentRoom);

            if (socketsInRoom && socketsInRoom.size > 0) {
                io.to(agentRoom).emit(targetEvent, user.agentCode);
            } else {
                io.emit(targetEvent, user.agentCode);
            }

            return res.status(200).json({
                success: true,
                message: `${lang.charAt(0).toUpperCase() + lang.slice(1)} package scan initiated for agent ${user.agentCode}`
            });
        } catch (err) {
            console.error(`${lang}_scan error:`, err);
            return res.status(500).json({
                success: false,
                message: "Failed to initiate package scan",
                error: err.message
            });
        }
    };
}

route.get("/python_scan", handleScan("python"));
route.post("/python_scan", handleScan("python"));

route.get("/node_scan", handleScan("node"));
route.post("/node_scan", handleScan("node"));

route.get("/scan/:language", (req, res, next) => {
    const lang = (req.params.language || "").toLowerCase();
    if (lang === "python" || lang === "node") {
        return handleScan(lang)(req, res, next);
    }
    return res.status(400).json({ success: false, message: `Unsupported ecosystem '${lang}'` });
});

route.post("/scan/:language", (req, res, next) => {
    const lang = (req.params.language || "").toLowerCase();
    if (lang === "python" || lang === "node") {
        return handleScan(lang)(req, res, next);
    }
    return res.status(400).json({ success: false, message: `Unsupported ecosystem '${lang}'` });
});

const PACKAGE_NAME_REGEX = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;


route.post("/update/:pkgName", (req, res) => {
    const { language, packageName } = req.body || {};
    const pkg = packageName || req.params.pkgName;
    const lang = (language || "python").toLowerCase();
    if (!pkg || !PACKAGE_NAME_REGEX.test(pkg)) {
        return res.status(400).json({ success: false, message: "Invalid package name format" });
    }
    if (!["python", "node"].includes(lang)) {
        return res.status(400).json({ success: false, message: "Unsupported language ecosystem" });
    }
    const io = req.app.get("io");
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
        taskId,
        agentCode: req.user?.agentCode,
        packageName: pkg,
        language: lang
    };

    const agentRoom = `agent:${req.user.agentCode}`;
    const socketsInRoom = io?.sockets?.adapter?.rooms?.get(agentRoom);

    if (io) {
        if (socketsInRoom && socketsInRoom.size > 0) {
            io.to(agentRoom).emit("package_update", payload);
            io.to(agentRoom).emit(`update_${lang}`, payload);
        } else {
            io.emit("package_update", payload);
            io.emit(`update_${lang}`, payload);
        }

        // Notify user's dashboard room and global fallback
        io.to(`user:${req.user.agentCode}`).emit("package_update_started", {
            ...payload,
            timestamp: new Date()
        });
        io.emit("package_update_started", {
            ...payload,
            timestamp: new Date()
        });
    }

    res.json({
        success: true,
        taskId,
        message: `Upgrade initiated for ${pkg}`
    });
});

module.exports = route;