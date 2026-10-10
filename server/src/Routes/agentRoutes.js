const express = require("express");
const route = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// All agent routes are protected with authMiddleware
route.use(authMiddleware);

/**
 * GET /agent/status
 * Returns current user's agent code, ecosystems metadata, and last scanned timestamps
 */
route.get("/status", async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            agentCode: user.agentCode,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
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
            io.emit(targetEvent, user.agentCode);

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

route.post("/update/:pkgName", (req, res) => {
    const { language, packageName } = req.body || {};
    const pkg = packageName || req.params.pkgName;

    console.log("Package to be upgraded:", pkg, language);

    const io = req.app.get("io");
    const socketEvent = `update_${language || "python"}`;
    if (io) {
        io.emit(socketEvent, {
            agentCode: req.user?.agentCode,
            packageName: pkg,
            language: language || "python",
        });
        io.emit("package_update_started", {
            agentCode: req.user?.agentCode,
            packageName: pkg,
            language: language || "python",
            timestamp: new Date(),
        });
    }
    res.json({
        success: true,
        message: `Upgrade initiated for ${pkg}`,
        packageName: pkg,
        language: language || "python",
    });
});

module.exports = route;