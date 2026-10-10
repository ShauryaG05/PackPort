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

    socket.on("result_python_packages", async (data) => {
        try {
            console.log(`[Agent ${data.agentCode || "unknown"}] Received Python Telemetry`);
            const updateData = {
                python_Packages: {
                    outdated_packages: data.outdated_packages || [],
                    all_packages: data.all_packages || [],
                    version: data.pythonVersion || data.python_version || null,
                    lastScanned: new Date()
                }
            };

            if (data.agentCode) {
                const res = await User.updateOne({ agentCode: data.agentCode }, { $set: updateData });
                console.log(`Updated Python Telemetry in DB (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);

                // Notify connected frontend clients
                io.emit("scan_complete", {
                    language: "python",
                    agentCode: data.agentCode,
                    timestamp: new Date()
                });
            }
        } catch (err) {
            console.error("Error saving python telemetry:", err);
        }
    });

    socket.on("result_node_packages", async (data) => {
        try {
            console.log(`[Agent ${data.agentCode || "unknown"}] Received Node Telemetry`);
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

            if (data.agentCode) {
                const res = await User.updateOne({ agentCode: data.agentCode }, { $set: updateData });
                console.log(`Updated Node Telemetry in DB (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);

                // Notify connected frontend clients
                io.emit("scan_complete", {
                    language: "node",
                    agentCode: data.agentCode,
                    timestamp: new Date()
                });
            }
        } catch (err) {
            console.error("Error saving node telemetry:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log(`Socket Client Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5600;
server.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT} 🛠️ `);
});