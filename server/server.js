const app = require("./app");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const User = require("./src/models/userModel");

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Helper to register agent in private room with database verification
    const registerAgent = async (code, token) => {
        if (!code) return;
        const trimmedCode = code.toString().trim();
        try {
            const user = await User.findOne({ agentCode: trimmedCode });
            if (!user) {
                console.log(`[Socket] Rejected Agent connection: Unrecognized code '${trimmedCode}' (Socket: ${socket.id})`);
                socket.emit("auth_error", { message: "Invalid or revoked Agent Code. Run 'packport unlink' and re-link." });
                socket.disconnect(true);
                return;
            }

            // Verify device token if the user has enrolled tokens
            if (user.agentTokens && user.agentTokens.length > 0 && token) {
                const tokenMatch = user.agentTokens.some(t => t.token === token);
                if (!tokenMatch) {
                    console.log(`[Socket] Rejected Agent connection: Invalid device token for code '${trimmedCode}' (Socket: ${socket.id})`);
                    socket.emit("auth_error", { message: "Invalid or expired device token. Run 'packport link --force' to re-link." });
                    socket.disconnect(true);
                    return;
                }
            }

            socket.data.agentCode = trimmedCode;
            socket.data.token = token;
            socket.data.type = "agent";
            socket.join(`agent:${trimmedCode}`);
            console.log(`[Socket] Registered Agent for code: ${trimmedCode} in room agent:${trimmedCode} (Socket: ${socket.id})`);
        } catch (err) {
            console.error("[Socket] Agent registration error:", err.message);
        }
    };

    // Helper to register web dashboard in private room
    const registerDashboard = (code) => {
        if (!code) return;
        const trimmedCode = code.toString().trim();
        socket.data.agentCode = trimmedCode;
        socket.data.type = "dashboard";
        socket.join(`user:${trimmedCode}`);
        console.log(`[Socket] Registered Dashboard for code: ${trimmedCode} in room user:${trimmedCode} (Socket: ${socket.id})`);
    };

    // Check handshake auth or query for upfront registration
    const initialCode = socket.handshake.auth?.agentCode || socket.handshake.query?.agentCode;
    const initialToken = socket.handshake.auth?.token || socket.handshake.query?.token;
    const clientType = socket.handshake.auth?.clientType || socket.handshake.query?.clientType;

    if (initialCode) {
        if (clientType === "dashboard") {
            registerDashboard(initialCode);
        } else {
            registerAgent(initialCode, initialToken);
        }
    }

    // Explicit registration events
    socket.on("register_agent", (data) => {
        const code = typeof data === "object" ? data?.agentCode : data;
        const token = typeof data === "object" ? data?.token : null;
        registerAgent(code, token);
    });

    socket.on("register_dashboard", (data) => {
        const code = typeof data === "object" ? data?.agentCode : data;
        registerDashboard(code);
    });

    // Handle update results from agent
    socket.on("update_result", (data) => {
        const effectiveCode = socket.data.agentCode || data?.agentCode;
        console.log(`[Agent ${effectiveCode || "unknown"}] Update result:`, data);

        const payload = {
            ...data,
            agentCode: effectiveCode,
            timestamp: new Date()
        };

        if (effectiveCode) {
            io.to(`user:${effectiveCode}`).emit("package_update_finished", payload);
        }
        io.emit("package_update_finished", payload);
    });

    // Handle update progress logs from agent
    socket.on("update_progress", (data) => {
        const effectiveCode = socket.data.agentCode || data?.agentCode;
        const payload = {
            ...data,
            agentCode: effectiveCode,
            timestamp: new Date()
        };

        if (effectiveCode) {
            io.to(`user:${effectiveCode}`).emit("package_update_progress", payload);
        }
        io.emit("package_update_progress", payload);
    });

    socket.on("result_python_packages", async (data) => {
        try {
            const effectiveCode = socket.data.agentCode || data.agentCode;
            console.log(`[Agent ${effectiveCode || "unknown"}] Received Python Telemetry`);
            const updateData = {
                python_Packages: {
                    outdated_packages: data.outdated_packages || [],
                    all_packages: data.all_packages || [],
                    version: data.pythonVersion || data.python_version || null,
                    lastScanned: new Date()
                }
            };

            if (effectiveCode) {
                const res = await User.updateOne({ agentCode: effectiveCode }, { $set: updateData });
                console.log(`Updated Python Telemetry in DB (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);

                const scanPayload = {
                    language: "python",
                    agentCode: effectiveCode,
                    timestamp: new Date()
                };

                // Notify targeted user room and global broadcast
                io.to(`user:${effectiveCode}`).emit("scan_complete", scanPayload);
                io.emit("scan_complete", scanPayload);
            }
        } catch (err) {
            console.error("Error saving python telemetry:", err);
        }
    });

    socket.on("result_node_packages", async (data) => {
        try {
            const effectiveCode = socket.data.agentCode || data.agentCode;
            console.log(`[Agent ${effectiveCode || "unknown"}] Received Node Telemetry`);
            const updateData = {
                node_Packages: {
                    outdated_packages: data.outdated_packages || [],
                    all_packages: data.all_packages || [],
                    node_version: data.node_version || data.nodeVersion || null,
                    npm_version: data.npm_version || data.npmVersion || null,
                    version: data.node_version || data.nodeVersion || null,
                    lastScanned: new Date()
                }
            };

            if (effectiveCode) {
                const res = await User.updateOne({ agentCode: effectiveCode }, { $set: updateData });
                console.log(`Updated Node Telemetry in DB (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);

                const scanPayload = {
                    language: "node",
                    agentCode: effectiveCode,
                    timestamp: new Date()
                };

                // Notify targeted user room and global broadcast
                io.to(`user:${effectiveCode}`).emit("scan_complete", scanPayload);
                io.emit("scan_complete", scanPayload);
            }
        } catch (err) {
            console.error("Error saving node telemetry:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket Client Disconnected: ${socket.id} (${socket.data.type || "unknown"}: ${socket.data.agentCode || "unassigned"})`);
    });
});

const PORT = process.env.PORT || 5600;
server.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT} 🛠️ `);
});